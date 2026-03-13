import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import PrivateRoute from './components/Layout/PrivateRoute';
import Sidebar from './components/Layout/Sidebar';
import MobileNav from './components/Layout/MobileNav';
import Dashboard from './components/Dashboard/Dashboard';
import Expenses from './components/Expenses/Expenses';
import Categories from './components/Categories/Categories';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="min-h-screen bg-gray-100">
                {/* Desktop Sidebar - hidden on mobile */}
                <div className="desktop-only fixed inset-y-0 left-0 w-64">
                  <Sidebar />
                </div>
                
                {/* Main Content */}
                <div className="lg:pl-64 main-content">
                  <div className="container-mobile">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/categories" element={<Categories />} />
                    </Routes>
                  </div>
                </div>
                
                {/* Mobile Bottom Navigation */}
                <MobileNav />
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;