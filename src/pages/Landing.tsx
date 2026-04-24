import { Link } from 'react-router-dom'

const ACCENT = '#6366f1'

export function Landing() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'hsl(222 47% 6%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", system-ui, sans-serif',
      }}
    >
      {/* grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${ACCENT}14 1px, transparent 1px), linear-gradient(90deg, ${ACCENT}14 1px, transparent 1px)`,
          backgroundSize: '44px 44px',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 40%, black 30%, transparent 80%)',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 40%, black 30%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />
      {/* glow blob */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          height: 600,
          background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${ACCENT}40, transparent 70%)`,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* wordmark only — no nav */}
      <header style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 64, padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              background: 'white',
              color: 'hsl(222 47% 6%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            t
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>trotsky.dev</span>
        </div>
      </header>

      {/* centered hero */}
      <section
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 28px 120px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 92,
            fontWeight: 600,
            letterSpacing: -3.2,
            lineHeight: 1.0,
            margin: '0 0 24px',
            maxWidth: 1100,
            background: `linear-gradient(180deg, white 40%, ${ACCENT})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Your entire backend.<br />One console.
        </h1>
        <p
          style={{
            fontSize: 20,
            color: 'rgba(255,255,255,.65)',
            maxWidth: 620,
            margin: '0 0 44px',
            lineHeight: 1.5,
          }}
        >
          Analytics, email, payments, billing, logs, auth — with the DX, dashboards and deliverability engineering teams expect.
        </p>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: 52,
            padding: '0 28px',
            borderRadius: 26,
            fontSize: 15.5,
            fontWeight: 500,
            cursor: 'pointer',
            background: ACCENT,
            color: 'white',
            border: `1px solid ${ACCENT}`,
            boxShadow: `0 10px 40px -10px ${ACCENT}80`,
            textDecoration: 'none',
          }}
        >
          Get started
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
        <div style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,.45)' }}>
          No credit card · Free tier forever
        </div>
      </section>
    </div>
  )
}
