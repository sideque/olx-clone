
import React from 'react'
import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext' 

const ThemeToggle = () => {
    const { darkMode, toggleDarkMode } = useContext(ThemeContext)
  return (
    <button onClick={toggleDarkMode}>
        {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    </button>
  )
}

export default ThemeToggle