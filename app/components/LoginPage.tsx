// app/components/LoginPage.tsx
"use client";

import { useState } from 'react';
import { account } from '../components/lib/appwrite';
import { encryptionService } from '../components/lib/encryption';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (email.toLowerCase() !== 'ifnashaikh@gmail.com') {
        setError('Access denied. Please use the authorized email.');
        setLoading(false);
        return;
      }

      // Login with Appwrite
      await account.createEmailSession(email, password);
      
      // 🔐 Initialize encryption with user's password (silent)
      encryptionService.initialize(password);
      sessionStorage.setItem('love_app_password', password);
      
      localStorage.setItem('love_app_logged_in', 'true');
      onLogin();
    } catch (err: any) {
      if (err.code === 409) {
        encryptionService.initialize(password);
        sessionStorage.setItem('love_app_password', password);
        localStorage.setItem('love_app_logged_in', 'true');
        onLogin();
        return;
      }
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Login</h1>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="login-input"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="login-input"
            />
          </div>
          
          {error && <div className="login-error">{error}</div>}
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}