import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#3a3a3a', color: '#fff',
          padding: '48px 24px', textAlign: 'center',
        }}>
          <div style={{
            width: '48px', height: '48px',
            border: '1.5px solid rgba(255,255,255,0.3)',
            transform: 'rotate(45deg)',
            marginBottom: '32px',
          }} />
          <div style={{
            fontSize: '11px', letterSpacing: '0.4em',
            fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '16px',
          }}>
            Something went wrong
          </div>
          <p style={{
            fontSize: '13px', fontFamily: 'Georgia, serif',
            fontStyle: 'italic', color: 'rgba(255,255,255,0.3)',
            maxWidth: '400px', lineHeight: 1.8,
            marginBottom: '32px',
          }}>
            An unexpected error occurred. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', padding: '12px 36px',
              fontSize: '10px', letterSpacing: '0.3em',
              textTransform: 'uppercase',
              fontFamily: "'Space Mono', monospace",
              cursor: 'pointer',
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
