import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

const POINT_SIZE = 5
const LINE_WIDTH = 1

const ARDebug = ({ size, QRPoints }) => {
  const canvasRef = useRef(null)
  const contextRef = useRef(null)

  useEffect(() => {
    contextRef.current = canvasRef.current.getContext('2d')
  }, [])

  useEffect(() => {
    const context = contextRef.current
    if (QRPoints) {
      context.fillStyle = 'red'
      context.strokeStyle = 'red'
      context.lineWidth = LINE_WIDTH

      context.beginPath()
      for (let i = 0; i <= QRPoints.length; i++) {
        const point = QRPoints[i % QRPoints.length]
        if (i === 0) {
          context.moveTo(point.x, point.y)
        } else {
          context.lineTo(point.x, point.y)
        }
      }
      context.stroke()

      for (let point of QRPoints) {
        context.beginPath()
        context.arc(point.x, point.y, POINT_SIZE, 0, Math.PI * 2)
        context.fill()
      }
    }

    return () => {
      context.clearRect(0, 0, size.width, size.height)
    }
  }, [QRPoints])

  return (
    <div className="absolute w-full h-full left-0 top-0 pointer-events-none">
      <canvas
        className="w-full h-full object-cover"
        width={size.width}
        height={size.height}
        ref={canvasRef}
      ></canvas>
    </div>
  )
}

ARDebug.propTypes = {
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }),
  QRPoints: PropTypes.arrayOf(
    PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })
  ),
}

export default ARDebug
