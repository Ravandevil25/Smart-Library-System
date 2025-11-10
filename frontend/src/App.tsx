import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Borrow from './pages/Borrow';
import Return from './pages/Return';
import History from './pages/History';
import WishlistPage from './pages/Wishlist';
import Admin from './pages/Admin';
import AI from './pages/AI';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/ai" element={<AI />} />
                <Route path="/borrow" element={<Borrow />} />
                <Route path="/return" element={<Return />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/history" element={<History />} />
              </Route>
            </Routes>
          </Layout>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
