
import './App.css'
import React from 'react'
import InfiniteBoard from './components/InfiniteBoard'
import AFKWatcher from './components/AFKWatcher'

function App() {

  const callbackAwake = () => {
    console.log('wake up');
  }

  const callbackOver = () => {
    console.log('sleep')
    // confirm('너 살아 있니?');
  }

  return (
    <div className="app">
      <AFKWatcher waitSecond={10} callbackAwake={callbackAwake} callbackOver={callbackOver} />
      <InfiniteBoard />
    </div>
  )
}

export default App
