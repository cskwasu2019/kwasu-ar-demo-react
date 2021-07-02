import React, { Suspense, useState } from 'react'

import QRImage from '../assets/images/qr.png'
import Loading from './Loading'
import ErrorBoundary from './ErrorBoundary'
import CameraStream from './CameraStream'
import { LoadingProvider } from './Loading'
import ARScreamOutput from './ARScreamOutput'
import Page from './Page'

const ErrorLayout = (error) => (
  <div className="w-screen h-screen relative flex flex-col">
    <div className="m-auto flex flex-col gap-2 items-center uppercase text-center">
      <span className="icon-aperture text-9xl text-red-200"></span>
      <span className="block mt-1 text-red-400 font-bold">{error.message}</span>
      <button
        className="btn bg-red-200 mt-2"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </div>
  </div>
)

const Layout = () => {
  const [state, setState] = useState('initial')

  return (
    <CameraStream>
      <div className="w-screen h-screen relative flex flex-col">
        {state === 'initial' && (
          <div className="m-auto flex flex-col gap-2 items-center uppercase text-center">
            <a href={QRImage} target="_blank">
              <img src={QRImage} alt="qr image" className="w-40 h-40" />
            </a>
            <h1 className="font-bold">
              Camera Stream is ready for AR
              <span className="block text-sm font-normal">
                Make sure you have the QRCode Ready
              </span>
            </h1>
            <button
              className="btn bg-grey-100 mt-2"
              onClick={() => setState('ready')}
            >
              Proceed &raquo;
            </button>
          </div>
        )}

        {state === 'ready' && (
          <div className="w-screen h-screen">
            <CameraStream>
              <ARScreamOutput />
            </CameraStream>
          </div>
        )}
      </div>
    </CameraStream>
  )
}

const AR = () => {
  return (
    <Page title="AR Mode - Kwasu AR Demo">
      <ErrorBoundary fallback={ErrorLayout}>
        <LoadingProvider>
          <Suspense fallback={<Loading />}>
            <Layout />
          </Suspense>
        </LoadingProvider>
      </ErrorBoundary>
    </Page>
  )
}

export default AR
