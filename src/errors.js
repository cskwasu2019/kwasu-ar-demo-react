class CameraUnsupportedDeviceError extends Error {
  constructor() {
    super('Device not supported')
  }
}

class CameraPermissionCamError extends Error {
  constructor() {
    super('Access to Camera Not Permitted')
  }
}

class CameraFatalError extends Error {
  constructor() {
    super('An Error occurred')
  }
}

class ChildNotFuncError extends Error {
  constructor() {
    super('Child should be a function that returns React Component')
  }
}

export {
  CameraUnsupportedDeviceError,
  CameraPermissionCamError,
  CameraFatalError,
  ChildNotFuncError,
}
