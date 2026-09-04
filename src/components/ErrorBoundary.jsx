import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[Aoogle Error Boundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.hash = ''
    window.location.search = ''
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__card">
            <h1 className="error-boundary__title">
              aoogle<span className="logo__dot" aria-hidden="true" />
            </h1>
            <h2 className="error-boundary__heading">Something went wrong</h2>
            <p className="error-boundary__text">
              An unexpected error occurred. This is usually temporary.
            </p>
            <div className="error-boundary__actions">
              <button
                type="button"
                className="btn-primary"
                onClick={this.handleReset}
              >
                Reload Aoogle
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.location.reload()}
              >
                Hard Refresh
              </button>
            </div>
            {this.state.error && (
              <details className="error-boundary__details">
                <summary>Error details</summary>
                <pre>{this.state.error.message}</pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
