import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            padding: '2rem',
            textAlign: 'center',
            background: '#F9F8F8',
            color: '#274C5B',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#7EB69333',
              fontSize: '2rem',
            }}
          >
            🌿
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            Nimadir noto'g'ri ketdi
          </h1>
          <p style={{ maxWidth: 420, color: '#6b7280', margin: 0 }}>
            Sahifani yuklashda kutilmagan xatolik yuz berdi. Iltimos, sahifani qayta yuklab ko'ring.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#274C5B',
              color: '#fff',
              fontWeight: 700,
              padding: '0.75rem 1.75rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Sahifani yangilash
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
