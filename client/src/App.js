// client/src/App.js
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import './styles/animations.css';
import './chartConfig'; // Initialize Chart.js

// Modern components
import ModernLoginForm from './components/auth/ModernLoginForm';
import RegisterForm from './components/auth/RegisterForm';
import TestDashboard from './TestDashboard';
import TrainerDashboard from './TrainerDashboard';
import AdminDashboard from './AdminDashboard';
import { Loading } from './components/ui';
import { ThemeProvider } from './context/ThemeContext';

// Custom hooks
import { useAuth } from './hooks/useAuth';

export default function App() {
    const [showRegister, setShowRegister] = useState(false);
    const { user, loading, isAuthenticated, login, logout } = useAuth();
    
    // Debug logging
    console.log('App render - Auth state:', {
        user,
        loading,
        isAuthenticated,
        showRegister
    });

    const handleLogin = async (token) => {
        console.log('handleLogin called with token:', token);
        const result = login(token);
        console.log('Login result:', result);
        if (result.success) {
            setShowRegister(false);
            console.log('Login successful, user:', result.user);
            // Force component re-render by updating a state
            setTimeout(() => {
                console.log('Authentication state should be updated now');
            }, 100);
        } else {
            console.error('Login failed:', result.error);
        }
    };

    const handleRegisterSuccess = () => {
        setShowRegister(false);
    };

    // Show loading screen while authentication is being checked
    if (loading) {
        return (
            <Loading 
                fullScreen 
                size="lg" 
                variant="spinner" 
                text="Loading application..." 
            />
        );
    }

    // Show authentication forms if not logged in
    if (!isAuthenticated) {
        return (
            <>
                <AnimatePresence mode="wait">
                    {showRegister ? (
                        <RegisterForm 
                            key="register"
                            onRegisterSuccess={handleRegisterSuccess} 
                            onGoToLogin={() => setShowRegister(false)} 
                        />
                    ) : (
                        <ModernLoginForm 
                            key="login"
                            onLogin={handleLogin} 
                            onGoToRegister={() => setShowRegister(true)} 
                        />
                    )}
                </AnimatePresence>
                <ToastContainer 
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </>
        );
    }

    // Function to render appropriate dashboard based on user role
    const renderDashboard = () => {
        console.log('renderDashboard called with user:', user);
        
        if (!user) {
            console.log('No user found, showing TestDashboard');
            return <TestDashboard user={user} onLogout={logout} />;
        }
        
        console.log('User role:', user.role);
        
        switch (user.role) {
            case 'admin':
                console.log('Rendering AdminDashboard');
                return <AdminDashboard user={user} onLogout={logout} />;
            case 'trainer':
                console.log('Rendering TrainerDashboard');
                return (
                    <ThemeProvider>
                        <TrainerDashboard user={user} onLogout={logout} />
                    </ThemeProvider>
                );
            default:
                console.log('Unknown role, showing TestDashboard');
                return <TestDashboard user={user} onLogout={logout} />;
        }
    };

    // Show appropriate dashboard based on user role
    return (
        <>
            {renderDashboard()}
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    );
}
