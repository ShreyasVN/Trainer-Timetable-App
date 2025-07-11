// Fallback App.js with CSS-only animations instead of Framer Motion
import React, { useState, useEffect } from 'react';
import './index.css'
import './styles/animations.css';
import ThemeToggle from './ThemeToggle';
import { initializeAnimations } from './utils/animationUtils.js';
import LoginFallback from './LoginFallback';
import RegisterFallback from './RegisterFallback'; 
import TrainerDashboard from './TrainerDashboard';
import AdminDashboard from './AdminDashboard';

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

export default function AppFallback() {
    const [user, setUser] = useState(null);
    const [showRegister, setShowRegister] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

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
            const decoded = decodeJwt(token);
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

    const handleToggleMode = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setShowRegister(!showRegister);
            setIsTransitioning(false);
        }, 250);
    };

    console.log('App render - user:', user, 'showRegister:', showRegister);

    if (!user) {
        console.log('Rendering login/register page');
        return (
            <div className="app-container">
                <div className="theme-toggle-container">
                    <ThemeToggle />
                </div>
                <div className={`auth-wrapper ${isTransitioning ? 'transitioning' : ''}`}>
                    {showRegister ? (
                        <div key="register" className={`auth-form ${isTransitioning ? 'slide-out-left' : 'slide-in-right'}`}>
                            <RegisterFallback 
                                onRegisterSuccess={handleRegisterSuccess} 
                                onGoToLogin={() => handleToggleMode()} 
                            />
                        </div>
                    ) : (
                        <div key="login" className={`auth-form ${isTransitioning ? 'slide-out-right' : 'slide-in-left'}`}>
                            <LoginFallback 
                                onLogin={handleLogin} 
                                onGoToRegister={() => handleToggleMode()} 
                            />
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
                    <ThemeToggle />
                </div>
                <AdminDashboard user={user} onLogout={handleLogout} />
            </div>
        );
    }
    return (
        <div className="app-container">
            <div className="theme-toggle-container dashboard">
                <ThemeToggle />
            </div>
            <TrainerDashboard user={user} onLogout={handleLogout} />
        </div>
    );
}
