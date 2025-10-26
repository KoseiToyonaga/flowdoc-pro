import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UserProfile.css';

const UserProfile = ({ onClose }) => {
  const { currentUser, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    department: currentUser?.department || '',
    position: currentUser?.position || ''
  });
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB制限
        setError('画像サイズは2MB以下にしてください');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      updateProfile({
        ...formData,
        avatar: avatarPreview
      });
      setMessage('プロフィールを更新しました');
      setIsEditing(false);
      
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (err) {
      setError('更新に失敗しました');
    }
  };

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか?')) {
      logout();
      onClose();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 ユーザープロフィール</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="profile-avatar-section">
            <div className="avatar-large">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {currentUser?.name?.charAt(0) || '👤'}
                </div>
              )}
            </div>
            {isEditing && (
              <div className="avatar-upload">
                <label htmlFor="avatar-input" className="avatar-upload-btn">
                  📷 画像を変更
                </label>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <p className="avatar-note">2MB以下のJPG、PNGファイル</p>
              </div>
            )}
          </div>

          {message && (
            <div className="success-message">
              <span className="success-icon">✓</span>
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {!isEditing ? (
            <div className="profile-view">
              <div className="profile-field">
                <label>お名前</label>
                <div className="field-value">{currentUser?.name}</div>
              </div>

              <div className="profile-field">
                <label>メールアドレス</label>
                <div className="field-value">{currentUser?.email}</div>
              </div>

              <div className="profile-field">
                <label>部署</label>
                <div className="field-value">{currentUser?.department || '未設定'}</div>
              </div>

              <div className="profile-field">
                <label>役職</label>
                <div className="field-value">{currentUser?.position || '未設定'}</div>
              </div>

              <div className="profile-field">
                <label>アカウント作成日</label>
                <div className="field-value">{formatDate(currentUser?.createdAt)}</div>
              </div>

              <div className="profile-stats">
                <div className="stat-item">
                  <div className="stat-icon">📊</div>
                  <div className="stat-label">作成プロジェクト</div>
                  <div className="stat-value">0</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">📝</div>
                  <div className="stat-label">作成ドキュメント</div>
                  <div className="stat-value">0</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">🔄</div>
                  <div className="stat-label">最終更新</div>
                  <div className="stat-value">今日</div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="profile-edit-form">
              <div className="form-group">
                <label htmlFor="name">お名前</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">メールアドレス</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">部署</label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
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
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  💾 保存
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: currentUser?.name || '',
                      email: currentUser?.email || '',
                      department: currentUser?.department || '',
                      position: currentUser?.position || ''
                    });
                    setAvatarPreview(currentUser?.avatar || null);
                  }}
                >
                  キャンセル
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="modal-footer">
          {!isEditing ? (
            <>
              <button 
                className="btn-edit" 
                onClick={() => setIsEditing(true)}
              >
                ✏️ 編集
              </button>
              <button 
                className="btn-logout" 
                onClick={handleLogout}
              >
                🚪 ログアウト
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
