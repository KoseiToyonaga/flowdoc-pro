// デモアカウント初期化用スクリプト
// このファイルは開発用です

export const initializeDemoAccount = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // デモアカウントが既に存在するかチェック
  const demoExists = users.find(u => u.email === 'demo@example.com');
  
  if (!demoExists) {
    const demoUser = {
      id: 'demo-user-001',
      name: 'デモユーザー',
      email: 'demo@example.com',
      password: 'demo1234', // 本番環境ではハッシュ化が必要
      createdAt: new Date('2024-01-01').toISOString(),
      avatar: null,
      role: 'user',
      department: 'システム開発部',
      position: 'エンジニア'
    };
    
    users.push(demoUser);
    localStorage.setItem('users', JSON.stringify(users));
    console.log('デモアカウントを初期化しました');
  }
};

// ページロード時に自動実行
if (typeof window !== 'undefined') {
  initializeDemoAccount();
}
