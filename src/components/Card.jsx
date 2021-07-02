import React from 'react'
import PropTypes from 'prop-types'
import ErrorBoundary from './ErrorBoundary'
import { ChildNotFuncError } from '../errors'

const Content = ({ resource, title, children, ...restProps }) => {
  if (typeof children !== 'function') {
    throw new ChildNotFuncError()
  }

  const data = resource()
  return (
    <>
      <h2 className="text-grey-600 font-bold text-xl uppercase my-2 mx-1">
        {title}
      </h2>
      {children(data, restProps)}
    </>
  )
}

const Card = ({ errorFallback, ...props }) => {
  return (
    <div className="card flex flex-col relative bg-white">
      <ErrorBoundary fallback={errorFallback}>
        <Content {...props} />
      </ErrorBoundary>
    </div>
  )
}

Card.propTypes = {
  resource: PropTypes.func,
  title: PropTypes.string.isRequired,
  errorFallback: PropTypes.object,
}

Card.defaultProps = {
  resource: () => {},
}

export default Card
