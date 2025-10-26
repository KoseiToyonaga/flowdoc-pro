import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ローカルストレージから保存されたユーザー情報を読み込む
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const register = (userData) => {
    // ユーザー登録処理
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // メールアドレスの重複チェック
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('このメールアドレスは既に登録されています');
    }

    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      password: userData.password, // 本番環境ではハッシュ化が必要
      createdAt: new Date().toISOString(),
      avatar: userData.avatar || null,
      role: userData.role || 'user',
      department: userData.department || '',
      position: userData.position || ''
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // パスワードを除外してログイン
    const { password, ...userWithoutPassword } = newUser;
    setCurrentUser(userWithoutPassword);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

    return userWithoutPassword;
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    const { password: _, ...userWithoutPassword } = user;
    setCurrentUser(userWithoutPassword);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

    return userWithoutPassword;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateProfile = (updates) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => 
      u.id === currentUser.id ? { ...u, ...updates } : u
    );
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    return updatedUser;
  };

  const value = {
    currentUser,
    register,
    login,
    logout,
    updateProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
