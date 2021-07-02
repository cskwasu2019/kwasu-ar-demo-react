import React, { useContext, useEffect, useState, createContext } from 'react'

const Loading = ({ shouldSetContext }) => {
  const [, setLoading] = useContext(LoadingContext)

  useEffect(() => {
    if (!shouldSetContext) {
      return
    }

    setLoading(true)
    return () => setLoading(false)
  }, [])

  return (
    <div className="w-screen h-screen flex flex-col bg-grey-50 items-center justify-center loading">
      <div className="h-32 flex flex-col justify-center items-center relative">
        <img src="icon.png" alt="logo icon" className="w-full" />
      </div>
      <span className="uppercase text-lg relative -top-8 font-bold text-grey-500">
        Loading
      </span>
    </div>
  )
}

Loading.defaultProps = {
  shouldSetContext: true,
}

const LoadingContext = createContext([])
const LoadingProvider = ({ children }) => {
  const state = useState(true)
  return (
    <LoadingContext.Provider value={state}>{children}</LoadingContext.Provider>
  )
}

export default Loading
export { LoadingContext }
export { LoadingProvider }
