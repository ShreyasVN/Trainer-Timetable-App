// src/components/Register.js
import React, { useState } from 'react';
import './App.css';

function Register({ onRegisterSuccess, onGoToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('trainer');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !name) {
      alert('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      alert(data.message);
      
      // Clear form on success
      setEmail('');
      setPassword('');
      setRole('trainer');
      setName('');
      
      // Notify parent component
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (err) {
      alert(`Registration failed: ${err.message}`);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2 className="register-title">Register</h2>
        <div className="form-group">
          <input 
            type="text" 
            placeholder="Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <select 
            onChange={(e) => setRole(e.target.value)} 
            value={role}
            disabled={loading}
            className="form-select"
          >
            <option value="trainer">Trainer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button onClick={handleRegister} disabled={loading} className="register-button">
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p className="register-link">
          Already have an account? 
          <button 
            onClick={onGoToLogin}
            className="login-button"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
