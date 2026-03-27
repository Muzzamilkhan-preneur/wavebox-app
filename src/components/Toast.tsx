import { useEffect, useRef, useState } from 'react'

interface ToastProps {
  message: string
  visible: boolean
}

function Toast({ message, visible }: ToastProps) {
  return (
    <div
      className={`
        fixed bottom-24 left-1/2 -translate-x-1/2 z-50
        bg-bg-3 border border-white/12 text-white text-[13px] font-medium
        px-4 py-2 rounded-full shadow-lg pointer-events-none whitespace-nowrap
        transition-all duration-200
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'}
      `}
    >
      {message}
    </div>
  )
}

// Singleton setter — lets any file call showToast() without prop drilling
let _show: ((msg: string) => void) | null = null

export function showToast(msg: string) {
  _show?.(msg)
}

export function ToastProvider() {
  const [msg, setMsg]         = useState('')
  const [visible, setVisible] = useState(false)
  const timerRef              = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    _show = (m: string) => {
      setMsg(m)
      setVisible(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setVisible(false), 2400)
    }
    return () => {
      _show = null
      clearTimeout(timerRef.current)
    }
  }, [])

  return <Toast message={msg} visible={visible} />
}
