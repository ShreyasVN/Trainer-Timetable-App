// client/src/App.js
import React, { useState, useEffect } from 'react';
import './index.css'
import './styles/animations.css'; // Import animation styles
import ThemeToggleFallback from './ThemeToggleFallback';
import { initializeAnimations } from './utils/animationUtils.js';
// Using fallback components that don't require external packages
import LoginFallback from './LoginFallback';
import RegisterFallback from './RegisterFallback';
import TrainerDashboard from './TrainerDashboard'; // Ensure client/src/TrainerDashboard.js exists with correct casing
import AdminDashboard from './AdminDashboard'; // Ensure client/src/AdminDashboard.js exists with correct casing

// --- Custom JWT Decode Function ---
function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error decoding JWT:", e);
        return null;
    }
}

export default function App() {
    const [user, setUser] = useState(null);
    const [showRegister, setShowRegister] = useState(false);

    useEffect(() => {
        console.log('App component mounted');
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = decodeJwt(token);
                if (decoded && decoded.exp * 1000 > Date.now()) {
                    setUser(decoded);
                    console.log('User logged in:', decoded);
                } else {
                    localStorage.removeItem('token');
                    console.log('Token expired, removed from localStorage');
                }
            } catch (error) {
                console.error("Failed to decode token or token invalid:", error);
                localStorage.removeItem('token');
            }
        } else {
            console.log('No token found, showing login page');
        }

        // Listen for auto-logout events from API client
        const handleAutoLogout = () => {
            console.log('Auto-logout event received');
            handleLogout();
        };

        window.addEventListener('auth:logout', handleAutoLogout);

        // Cleanup
        return () => {
            window.removeEventListener('auth:logout', handleAutoLogout);
        };
    }, []);

    useEffect(() => {
        // Initialize animations when component is mounted
        initializeAnimations();
    }, []);

    const handleLogin = (token) => {
        try {
            console.log('handleLogin called with token:', token);
            const decoded = decodeJwt(token);
            console.log('Decoded token:', decoded);
            if (decoded) {
                setUser(decoded);
                setShowRegister(false);
                console.log('Login successful, user set:', decoded);
            } else {
                throw new Error("Token decoding failed.");
            }
        } catch (error) {
            console.error("Invalid token received:", error);
            localStorage.removeItem('token');
            setUser(null);
        }
    };
    

    const handleRegisterSuccess = () => {
        setShowRegister(false);
        console.log('Registration successful, switching to login');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setShowRegister(false);
        console.log('User logged out');
    };

    console.log('App render - user:', user, 'showRegister:', showRegister);

    if (!user) {
        console.log('Rendering login/register page');
        return (
            <div className="app-container">
                <div className="theme-toggle-container">
                    <ThemeToggleFallback />
                </div>
                <div className={`auth-wrapper ${showRegister ? 'show-register' : 'show-login'}`}>
                    {showRegister ? (
                        <div key="register" className="auth-form slide-in-right">
                            <RegisterFallback onRegisterSuccess={handleRegisterSuccess} onGoToLogin={() => setShowRegister(false)} />
                        </div>
                    ) : (
                        <div key="login" className="auth-form slide-in-left">
                            <LoginFallback onLogin={handleLogin} onGoToRegister={() => setShowRegister(true)} />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    console.log('User logged in, rendering dashboard for role:', user.role);
    if (user.role === 'admin') {
        return (
            <div className="app-container">
                <div className="theme-toggle-container dashboard">
                    <ThemeToggleFallback />
                </div>
                <AdminDashboard user={user} onLogout={handleLogout} />
            </div>
        );
    }
    return (
        <div className="app-container">
            <div className="theme-toggle-container dashboard">
                <ThemeToggleFallback />
            </div>
            <TrainerDashboard user={user} onLogout={handleLogout} />
        </div>
    );
}
