import React from 'react'
import Home from './Components/Pages/Home'
import { Route, Routes } from 'react-router-dom'
import Details from './Components/Details/Details'
import MyAds from './Components/Pages/MyAds'
import ThemeToggle from './Components/ThemeToggle'
import { ThemeProvider } from './context/ThemeContext'

const App = () => {
  return (
    <>
    <ThemeProvider>

      <Routes>
        <Route path="" element={<Home />} />
        <Route path="/details" element={<Details />} />
        <Route path="/my-ads" element={<MyAds />} />
      </Routes>
      <ThemeToggle />
    </ThemeProvider>
    </>
  )
}

export default App