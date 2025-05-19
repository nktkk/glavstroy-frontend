import { useState } from 'react'
import './App.css'
import OfferList from './pages/OfferList/OfferList'
import {ThemeProvider } from '@mui/material/styles';
import formThemes from './themes.jsx'
import DataAdmin from './pages/Data/DataAdmin.jsx';
import DataContractor from './pages/Data/DataContractor.jsx';
import Auth from './pages/Auth/Auth.jsx';
import DashboardContractor from './pages/Dashboard/DashboardContractor.jsx';
import DashboardAdmin from './pages/Dashboard/DashboardAdmin.jsx';
import { UserProvider } from './contexts/UserContext.jsx';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<ThemeProvider theme={formThemes.registerFormTheme}><Auth/></ThemeProvider>} />
            <Route path='/' element={<ThemeProvider theme={formThemes.registerFormTheme}><Auth/></ThemeProvider>} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  )
}

export default App
