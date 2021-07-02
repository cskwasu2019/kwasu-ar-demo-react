import React, { Children } from 'react'
import {
  CameraUnsupportedDeviceError,
  CameraPermissionCamError,
  CameraFatalError,
} from '../errors'

const requestCameraStream = async (constraints) => {
  // Not Sure if this polyfill is neccessary since minimum browser support will probably have navigator.mediaDevices
  if (typeof navigator.mediaDevices === 'undefined') {
    navigator.mediaDevices = {}
  }

  if (typeof navigator.mediaDevices.getUserMedia === 'undefined') {
    const getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia

    if (!getUserMedia) {
      throw new CameraUnsupportedDeviceError()
    } else {
      navigator.mediaDevices.getUserMedia = (constraints) =>
        new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject)
        })
    }
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    return stream
  } catch (e) {
    if (e.name === 'NotAllowedError') {
      throw new CameraPermissionCamError()
    } else {
      throw new CameraFatalError()
    }
  }
}

const streamRosource = (() => {
  let state = 'pending'
  let result
  let promise

  function getPromise(constraints) {
    if (!promise) {
      promise = requestCameraStream(constraints)
        .then((streamObj) => {
          state = 'success'
          result = streamObj
        })
        .catch((err) => {
          state = 'error'
          result = err
        })
    }
    return promise
  }

  return {
    read(constraints) {
      const pendingPromise = getPromise(constraints)

      if (state === 'pending') {
        throw pendingPromise
      } else if (state === 'error') {
        throw result
      } else {
        return result
      }
    },
  }
})()

const CameraStream = ({ children }) => {
  const stream = streamRosource.read({
    audio: false,
    video: {
      facingMode: 'environment',
    },
  })
  return React.cloneElement(Children.only(children), { stream })
}

export default CameraStream
