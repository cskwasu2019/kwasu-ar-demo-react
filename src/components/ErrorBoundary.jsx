import { Component } from 'react'
import PropTypes from 'prop-types'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error) {
    return {
      error,
      hasError: true,
    }
  }

  render() {
    const { fallback, children } = this.props
    if (this.state.hasError) {
      if (typeof fallback === 'function') {
        return fallback(this.state.error)
      } else {
        return fallback
      }
    }

    return children
  }
}

ErrorBoundary.propTypes = {
  fallback: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
}

ErrorBoundary.defaultProps = {
  fallback: null,
}
