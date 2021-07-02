import React, { Suspense, useEffect, useState } from 'react'
import { LoadingProvider } from './Loading'
import ErrorBoundary from './ErrorBoundary'
import HomeDetails from './HomeDetails'
import Loading from './Loading'
import Page from './Page'
import Scene from './Scene'

const scrollToElement = (elementId) => {
  const el = document.getElementById(elementId)
  el.scrollIntoView({ behavior: 'smooth' })
}

const Layout = ({ showArBtn }) => {
  return (
    <div className="w-full h-full relative lg:flex lg:flex-row lg:overflow-hidden">
      <section
        id="top"
        className="w-full h-full bg-grey-100 relative vignette lg:w-6/12"
      >
        <div className="container mx-auto w-full h-full flex flex-col">
          <header className="py-10 px-2 text-center">
            <h1 className="text-xl text-grey-800">
              Welcome to Kwara State University, Malete
              <em className="block text-sm text-grey-600 uppercase font-normal not-italic">
                World Class University
              </em>
            </h1>
          </header>
          <ErrorBoundary>
            <Scene />
          </ErrorBoundary>
          <div className="py-4 flex flex-col justify-center mt-auto items-center lg:hidden">
            <button
              onClick={() => scrollToElement('detail')}
              className="w-12 h-12 rounded-full bg-grey-100 text-2xl text-green-800 outline-none"
            >
              <span className="icon-down-dir"></span>
            </button>
          </div>
        </div>
        {showArBtn && (
          <a
            href="ar.html"
            className="btn absolute right-0 bottom-0 bg-grey-50 bg-opacity-40 text-grey-600 font-bold border-grey-500"
          >
            AR
          </a>
        )}
      </section>
      <section
        id="detail"
        className="w-full h-full relative bg-grey-50 lg:w-max lg:flex-1 lg:overflow-auto"
      >
        <div className="w-full h-full">
          <div className="container mx-auto w-full h-full flex flex-col">
            <div className="py-4 flex flex-col justify-center items-center lg:hidden">
              <button onClick={() => scrollToElement('top')}>
                <span className="icon-up-dir text-2xl text-green-800"></span>
              </button>
            </div>
            <div className="flex-1 min-h-0 px-2 lg:px-6">
              <HomeDetails />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const Home = () => {
  const [showArBtn, setShowArBtn] = useState(false)
  useEffect(() => {
    const handleHashChange = () => {
      setShowArBtn(window.location.hash === '#/qrscan')
    }
    window.addEventListener('hashchange', handleHashChange)
    handleHashChange()
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <Page title="Kwasu AR Demo">
      <LoadingProvider>
        <Suspense fallback={<Loading />}>
          <Layout showArBtn={showArBtn} />
        </Suspense>
      </LoadingProvider>
    </Page>
  )
}

export default Home
