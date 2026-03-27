interface ParsedAudioMetadata {
  title?: string
  artist?: string
  coverBlob?: Blob | null
}

function readSyncSafeInteger(bytes: Uint8Array, offset: number) {
  return (
    (bytes[offset] << 21)
    | (bytes[offset + 1] << 14)
    | (bytes[offset + 2] << 7)
    | bytes[offset + 3]
  )
}

function readUint32(bytes: Uint8Array, offset: number) {
  return (
    (bytes[offset] << 24)
    | (bytes[offset + 1] << 16)
    | (bytes[offset + 2] << 8)
    | bytes[offset + 3]
  ) >>> 0
}

function decodeLatin1(bytes: Uint8Array) {
  return Array.from(bytes, (value) => String.fromCharCode(value)).join('')
}

function stripTrailingNulls(value: string) {
  return value.replace(/\u0000+$/g, '').trim()
}

function decodeText(bytes: Uint8Array, encoding: number) {
  if (!bytes.length) return ''

  if (encoding === 0) {
    return stripTrailingNulls(decodeLatin1(bytes))
  }

  if (encoding === 3) {
    return stripTrailingNulls(new TextDecoder('utf-8').decode(bytes))
  }

  if (encoding === 2) {
    return stripTrailingNulls(new TextDecoder('utf-16be').decode(bytes))
  }

  return stripTrailingNulls(new TextDecoder('utf-16').decode(bytes))
}

function readNullTerminated(bytes: Uint8Array, offset: number, encoding: number) {
  if (encoding === 0 || encoding === 3) {
    let end = offset
    while (end < bytes.length && bytes[end] !== 0) end += 1
    return {
      value: bytes.slice(offset, end),
      nextOffset: Math.min(end + 1, bytes.length),
    }
  }

  let end = offset
  while (end + 1 < bytes.length && !(bytes[end] === 0 && bytes[end + 1] === 0)) {
    end += 2
  }

  return {
    value: bytes.slice(offset, end),
    nextOffset: Math.min(end + 2, bytes.length),
  }
}

function parseApicFrame(bytes: Uint8Array) {
  if (bytes.length < 4) return null

  const encoding = bytes[0]
  const mimeData = readNullTerminated(bytes, 1, 0)
  const mime = decodeLatin1(mimeData.value) || 'image/jpeg'
  const descriptionData = readNullTerminated(bytes, mimeData.nextOffset + 1, encoding)
  const imageData = bytes.slice(descriptionData.nextOffset)

  if (!imageData.length) return null

  return new Blob([imageData], { type: mime })
}

function parsePicFrame(bytes: Uint8Array) {
  if (bytes.length < 6) return null

  const encoding = bytes[0]
  const format = decodeLatin1(bytes.slice(1, 4)).toLowerCase()
  const mime = format === 'png' ? 'image/png' : 'image/jpeg'
  const descriptionData = readNullTerminated(bytes, 5, encoding)
  const imageData = bytes.slice(descriptionData.nextOffset)

  if (!imageData.length) return null

  return new Blob([imageData], { type: mime })
}

function parseId3v2(data: Uint8Array): ParsedAudioMetadata {
  if (data.length < 10 || decodeLatin1(data.slice(0, 3)) !== 'ID3') {
    return {}
  }

  const version = data[3]
  const tagSize = readSyncSafeInteger(data, 6)
  const tagEnd = Math.min(data.length, 10 + tagSize)
  let offset = 10

  const metadata: ParsedAudioMetadata = {}

  while (offset + (version === 2 ? 6 : 10) <= tagEnd) {
    if (data[offset] === 0) break

    if (version === 2) {
      const frameId = decodeLatin1(data.slice(offset, offset + 3))
      const size = (data[offset + 3] << 16) | (data[offset + 4] << 8) | data[offset + 5]
      offset += 6
      if (!frameId.trim() || size <= 0 || offset + size > tagEnd) break

      const frameData = data.slice(offset, offset + size)

      if (frameId === 'TT2') {
        metadata.title = decodeText(frameData.slice(1), frameData[0]) || metadata.title
      } else if (frameId === 'TP1') {
        metadata.artist = decodeText(frameData.slice(1), frameData[0]) || metadata.artist
      } else if (frameId === 'PIC' && !metadata.coverBlob) {
        metadata.coverBlob = parsePicFrame(frameData)
      }

      offset += size
      continue
    }

    const frameId = decodeLatin1(data.slice(offset, offset + 4))
    const size = version === 4 ? readSyncSafeInteger(data, offset + 4) : readUint32(data, offset + 4)
    offset += 10

    if (!frameId.trim() || size <= 0 || offset + size > tagEnd) break

    const frameData = data.slice(offset, offset + size)

    if (frameId === 'TIT2') {
      metadata.title = decodeText(frameData.slice(1), frameData[0]) || metadata.title
    } else if (frameId === 'TPE1') {
      metadata.artist = decodeText(frameData.slice(1), frameData[0]) || metadata.artist
    } else if (frameId === 'APIC' && !metadata.coverBlob) {
      metadata.coverBlob = parseApicFrame(frameData)
    }

    offset += size
  }

  return metadata
}

export async function extractAudioMetadata(file: File): Promise<ParsedAudioMetadata> {
  if (!/\.mp3$/i.test(file.name) && file.type !== 'audio/mpeg') {
    return {}
  }

  try {
    const buffer = await file.slice(0, 1024 * 512).arrayBuffer()
    return parseId3v2(new Uint8Array(buffer))
  } catch {
    return {}
  }
}
