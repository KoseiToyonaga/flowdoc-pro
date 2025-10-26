import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    position: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('必須項目を入力してください');
      return false;
    }

    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で設定してください');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('有効なメールアドレスを入力してください');
      return false;
    }

    if (!agreeTerms) {
      setError('利用規約に同意してください');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const user = register(formData);
      onRegister(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <div className="logo-large">📊</div>
          <h1>新規アカウント登録</h1>
          <p className="subtitle">FlowDoc Proへようこそ</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                お名前 <span className="required">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="山田 太郎"
                autoComplete="name"
                autoFocus
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">
                メールアドレス <span className="required">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">部署</label>
              <input
                id="department"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                placeholder="営業部"
                autoComplete="organization"
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">役職</label>
              <input
                id="position"
                name="position"
                type="text"
                value={formData.position}
                onChange={handleChange}
                placeholder="マネージャー"
                autoComplete="organization-title"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                パスワード <span className="required">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="6文字以上"
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                パスワード（確認） <span className="required">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="もう一度入力"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="password-strength">
            <div className="strength-bar">
              <div 
                className={`strength-fill ${
                  formData.password.length >= 8 ? 'strong' : 
                  formData.password.length >= 6 ? 'medium' : 'weak'
                }`}
                style={{
                  width: `${Math.min((formData.password.length / 8) * 100, 100)}%`
                }}
              />
            </div>
            <span className="strength-text">
              {formData.password.length >= 8 ? '強力' : 
               formData.password.length >= 6 ? '普通' : 
               formData.password.length > 0 ? '弱い' : ''}
            </span>
          </div>

          <div className="terms-agreement">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                <a href="#" className="terms-link">利用規約</a>と
                <a href="#" className="terms-link">プライバシーポリシー</a>に同意します
              </span>
            </label>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '登録中...' : 'アカウントを作成'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            既にアカウントをお持ちの方は
            <button 
              className="link-button" 
              onClick={onSwitchToLogin}
            >
              ログイン
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
