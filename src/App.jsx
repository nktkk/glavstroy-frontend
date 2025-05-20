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
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
            {/* <Route path='/login' element={<ThemeProvider theme={formThemes.registerFormTheme}><Auth/></ThemeProvider>} /> */}
            <Route path='/login' element={<ThemeProvider theme={formThemes.offerFormTheme}><DashboardContractor/></ThemeProvider>} />
            <Route path='/data/admin' element={
              <ProtectedRoute requiredRole="ADMIN">
                <ThemeProvider theme={formThemes.registerFormTheme}>
                  <DataAdmin/>
                </ThemeProvider>
              </ProtectedRoute>
            } />
            <Route path='/dashboard/admin' element={
              <ProtectedRoute requiredRole="ADMIN">
                <ThemeProvider theme={formThemes.offerFormTheme}>
                  <DashboardAdmin/>
                </ThemeProvider>
              </ProtectedRoute>
            } />
            <Route path='/proposals' element={
              <ProtectedRoute requiredRole="ADMIN">
                <ThemeProvider theme={formThemes.offerFormTheme}>
                  <OfferList/>
                </ThemeProvider>
              </ProtectedRoute>
            } />
            <Route path='/contractor/:contractorId' element={
              <ProtectedRoute requiredRole="ADMIN">
                <ThemeProvider theme={formThemes.offerFormTheme}>
                  <DashboardContractor view={true}/>
                </ThemeProvider>
              </ProtectedRoute>
            } />

            <Route path='/data/contractor' element={
              <ProtectedRoute requiredRole="CONTRACTOR">
                <ThemeProvider theme={formThemes.registerFormTheme}>
                  <DataContractor/>
                </ThemeProvider>
              </ProtectedRoute>
            } />
            <Route path='/dashboard/contractor/:contractorId' element={
              <ProtectedRoute requiredRole="CONTRACTOR">
                <ThemeProvider theme={formThemes.offerFormTheme}>
                  <DashboardContractor view={false}/>
                </ThemeProvider>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  )
}

export default App
