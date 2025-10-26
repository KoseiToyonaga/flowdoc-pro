import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    setLoading(true);

    try {
      const user = login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@example.com');
    setPassword('demo1234');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="logo-large">📊</div>
          <h1>FlowDoc Pro</h1>
          <p className="subtitle">業務フロー&ナレッジ管理システム</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              ログイン状態を保持する
            </label>
            <a href="#" className="forgot-password">パスワードを忘れた方</a>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>

          <div className="demo-login">
            <button 
              type="button" 
              className="btn-demo" 
              onClick={handleDemoLogin}
            >
              デモアカウントで試す
            </button>
          </div>
        </form>

        <div className="login-footer">
          <p>
            アカウントをお持ちでない方は
            <button 
              className="link-button" 
              onClick={onSwitchToRegister}
            >
              新規登録
            </button>
          </p>
        </div>

        <div className="login-info">
          <div className="info-item">
            <span className="info-icon">✨</span>
            <span>業務フローの可視化</span>
          </div>
          <div className="info-item">
            <span className="info-icon">📝</span>
            <span>ナレッジ管理</span>
          </div>
          <div className="info-item">
            <span className="info-icon">🔄</span>
            <span>バージョン管理</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
