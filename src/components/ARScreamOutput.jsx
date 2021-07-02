import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import PropTypes from 'prop-types'
import ARDebug from './ARDebug'
import { LoadingContext } from './Loading'
import { scanImageData } from 'zbar.wasm'
import POS from 'js-aruco/posit1'
import SceneAR, { MODEL_SIZE } from './SceneAR'
import { Vector3 } from 'three'

const ARScreamOutput = ({ stream, debug }) => {
  if (!stream) {
    throw new Error('Stream Prop is required!')
  }

  const [isLoading] = useContext(LoadingContext)
  const videoRef = useRef(null)
  const frameCanvasRef = useRef(null)
  const positRef = useRef(null)
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 })
  const [QRPoints, setQRPoints] = useState(null)

  const onLoadedMetaData = useCallback(() => {
    const video = videoRef.current
    const width = video.videoWidth
    const height = video.videoHeight

    positRef.current = new POS.Posit(MODEL_SIZE, width)
    setVideoSize({ width, height })
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if ('srcObject' in video) {
      video.srcObject = stream
    } else {
      video.src = window.URL.createObjectURL(stream)
    }
  }, [stream])

  const pose = useMemo(() => {
    const posit = positRef.current
    if (QRPoints == null || posit == null) {
      return null
    } else {
      const p = [...QRPoints].map((point) => ({
        x: point.x - videoSize.width / 2,
        y: videoSize.height / 2 - point.y,
      }))

      const result = posit.pose(p)
      const rot = result.bestRotation
      const pos = result.bestTranslation

      return {
        position: new Vector3(pos[0], pos[1], -pos[2]),
        rotation: new Vector3(
          -Math.asin(-rot[1][2]),
          -Math.atan2(rot[0][2], rot[2][2]),
          Math.atan2(rot[1][0], rot[1][1])
        ),
        scale: new Vector3(MODEL_SIZE, MODEL_SIZE, MODEL_SIZE),
      }
    }
  }, [QRPoints])

  useEffect(() => {
    if (!isLoading && !(videoSize.width === 0 || videoSize.height === 0)) {
      const canvas = frameCanvasRef.current
      const video = videoRef.current
      const { width, height } = canvas

      const context = canvas.getContext('2d')
      let state = 'wait'
      const process = async () => {
        if (state === 'exit') {
          return
        }

        requestAnimationFrame(process)
        if (state === 'wait') {
          state = 'process'
          context.drawImage(video, 0, 0)
          const imageData = context.getImageData(0, 0, width, height)
          const QRData = await scanImageData(imageData)

          if (QRData.length) {
            const QR = QRData[0]
            setQRPoints(QR.points)
          } else {
            setQRPoints(null)
          }
          state = 'wait'
        }
      }
      process()

      return () => (state = 'exit')
    }
  }, [isLoading, videoSize])

  return (
    <div className="w-full h-full relative">
      {debug && <ARDebug size={videoSize} QRPoints={QRPoints} />}
      <canvas
        className="hidden"
        width={videoSize.width}
        height={videoSize.height}
        ref={frameCanvasRef}
      ></canvas>
      <video
        className="object-cover w-full h-full"
        ref={videoRef}
        autoPlay
        muted
        onLoadedMetadata={onLoadedMetaData}
      ></video>
      <SceneAR size={videoSize} pose={pose} />
    </div>
  )
}

ARScreamOutput.propTypes = {
  stream: PropTypes.instanceOf(MediaStream),
  debug: PropTypes.bool,
}

ARScreamOutput.defaultProps = {
  debug: process.env.NODE_ENV !== 'production',
}

export default ARScreamOutput
