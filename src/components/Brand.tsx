/**
 * trotsky.dev logomark + wordmark. Single source so the login, register, and
 * top-bar brand stay identical. `size` scales the whole lockup proportionally.
 */
export function Brand({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const mark = { sm: 22, md: 30, lg: 40 }[size]
  const word = { sm: 13, md: 16, lg: 19 }[size]
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center justify-center font-bold tracking-wide text-white"
        style={{
          width: mark,
          height: mark,
          borderRadius: Math.round(mark * 0.27),
          background: 'linear-gradient(135deg, #0f172a, #334155)',
          fontSize: Math.round(mark * 0.5),
        }}
      >
        t
      </div>
      <span className="font-semibold tracking-tight" style={{ fontSize: word }}>
        trotsky.dev
      </span>
    </div>
  )
}
