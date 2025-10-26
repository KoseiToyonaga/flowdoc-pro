// ログイン機能のテストスクリプト
// ブラウザのコンソールで実行してください

console.log('=== FlowDoc Pro ログイン機能テスト ===\n');

// 1. LocalStorageの確認
console.log('1. LocalStorageデータの確認:');
const users = JSON.parse(localStorage.getItem('users') || '[]');
const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

console.log(`  登録ユーザー数: ${users.length}人`);
console.log(`  現在のログインユーザー: ${currentUser ? currentUser.name : 'なし'}`);

if (users.length > 0) {
  console.log('\n  登録済みユーザー一覧:');
  users.forEach((user, index) => {
    console.log(`    ${index + 1}. ${user.name} (${user.email})`);
  });
}

// 2. デモアカウントの確認
console.log('\n2. デモアカウントの確認:');
const demoUser = users.find(u => u.email === 'demo@example.com');
if (demoUser) {
  console.log('  ✓ デモアカウントが存在します');
  console.log(`    名前: ${demoUser.name}`);
  console.log(`    メール: ${demoUser.email}`);
  console.log(`    部署: ${demoUser.department}`);
  console.log(`    役職: ${demoUser.position}`);
} else {
  console.log('  ✗ デモアカウントが見つかりません');
}

// 3. テストユーザーの作成（オプション）
console.log('\n3. テストユーザーの作成:');
console.log('  以下のコードを実行してテストユーザーを作成できます:');
console.log(`
  const testUser = {
    id: 'test-' + Date.now(),
    name: 'テストユーザー',
    email: 'test@example.com',
    password: 'test1234',
    createdAt: new Date().toISOString(),
    avatar: null,
    role: 'user',
    department: 'テスト部',
    position: 'テスター'
  };
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  users.push(testUser);
  localStorage.setItem('users', JSON.stringify(users));
  console.log('テストユーザーを作成しました！');
`);

// 4. データのクリア方法
console.log('\n4. データのクリア方法:');
console.log('  すべてのユーザーデータをクリアする場合:');
console.log('  localStorage.removeItem("users");');
console.log('  localStorage.removeItem("currentUser");');
console.log('  location.reload();');

console.log('\n=== テスト完了 ===');

// テストユーザー作成関数をエクスポート
window.createTestUser = function(name, email, password) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // 重複チェック
  if (users.find(u => u.email === email)) {
    console.error('このメールアドレスは既に登録されています');
    return false;
  }
  
  const newUser = {
    id: 'test-' + Date.now(),
    name: name,
    email: email,
    password: password,
    createdAt: new Date().toISOString(),
    avatar: null,
    role: 'user',
    department: 'テスト部',
    position: 'テスター'
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  console.log('✓ テストユーザーを作成しました:', name);
  return true;
};

// データクリア関数をエクスポート
window.clearAllUsers = function() {
  if (confirm('すべてのユーザーデータを削除しますか？')) {
    localStorage.removeItem('users');
    localStorage.removeItem('currentUser');
    console.log('✓ すべてのデータを削除しました');
    location.reload();
  }
};

console.log('\n便利な関数:');
console.log('  createTestUser("名前", "email@example.com", "password")');
console.log('  clearAllUsers()');
