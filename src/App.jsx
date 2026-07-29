import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import Calculator     from './pages/Calculator';
import TreePlantation from './pages/TreePlantation';
import AirQuality     from './pages/AirQuality';
import History        from './pages/History';
import Profile        from './pages/Profile';
import Settings       from './pages/Settings';
import NotFound       from './pages/NotFound';

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(13, 26, 16, 0.95)',
              color: '#fff',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
              style: {
                border: '1px solid rgba(239, 68, 68, 0.2)',
              },
            },
          }}
        />

        <Routes>
          {/* Public routes */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login   />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes — all under AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard"         element={<Dashboard  />} />
            <Route path="/calculator"        element={<Calculator />} />
            <Route path="/tree-plantation"   element={<TreePlantation />} />
            <Route path="/air-quality"       element={<AirQuality />} />
            <Route path="/history"           element={<History    />} />
            <Route path="/profile"           element={<Profile    />} />
            <Route path="/settings"          element={<Settings   />} />
          </Route>

          {/* Catch-all */}
          <Route path="/404"  element={<NotFound />} />
          <Route path="*"     element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
