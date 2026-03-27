export function EqBars() {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[0, 120, 240].map((delay) => (
        <span
          key={delay}
          className="block w-[3px] rounded-sm bg-accent"
          style={{
            animation: `eqBar 0.7s ease-in-out infinite`,
            animationDelay: `${delay}ms`,
          }}
        />
      ))}
      <style>{`
        @keyframes eqBar {
          0%, 100% { height: 4px; }
          50%       { height: 14px; }
        }
      `}</style>
    </div>
  )
}
