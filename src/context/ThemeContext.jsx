import React, { createContext, useEffect, useState } from 'react'

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem("dark-mode");
        return savedMode === true;
    });

    useEffect(() => {
        localStorage.setItem('dark-mode', darkMode);
        document.body.className = darkMode ? "dark-mode" : '';
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode((prevMode) => !prevMode);
    }

    return (
        <ThemeContext.Provider value={{darkMode, toggleDarkMode}}>
            {
                children
            }
        </ThemeContext.Provider>
    )
}