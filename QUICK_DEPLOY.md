# 🚀 クイックデプロイガイド

## 最速でデプロイする方法

### 方法1: バッチスクリプトを使用（推奨）

1. **index.jsを更新**
   - `src\index.js` を開く
   - 以下のコードに置き換える：

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

2. **バッチスクリプトを実行**
   ```
   deploy.bat をダブルクリック
   ```

3. **完了！**
   - 5-10分待つ
   - https://koseitoyonaga.github.io/flowdoc-pro/ にアクセス

---

### 方法2: コマンドラインで実行

PowerShellまたはコマンドプロンプトを開いて：

```bash
# 1. プロジェクトフォルダに移動
cd C:\Users\toyon\Desktop\flow-knowledge-manager

# 2. gh-pagesをインストール
npm install --save-dev gh-pages

# 3. ビルド
npm run build

# 4. デプロイ
npm run deploy
```

---

## ✅ 必須チェック項目

デプロイ前に確認：

- [ ] `src\index.js` に `AuthProvider` が含まれている
- [ ] `package.json` に `deploy` スクリプトがある
- [ ] `gh-pages` パッケージがインストールされている

---

## 🐛 よくあるエラーと解決策

### エラー: "gh-pages: command not found"

```bash
npm install --save-dev gh-pages
```

### エラー: "Failed to get remote.origin.url"

```bash
git remote add origin https://github.com/koseitoyonaga/flowdoc-pro.git
```

### エラー: "白い画面が表示される"

`src\index.js` が更新されていません：
1. `src\index.js` を開く
2. `AuthProvider` でラップされているか確認
3. 再デプロイ: `npm run deploy`

---

## 📞 困ったら

詳細な手順は `DEPLOY_GUIDE.md` を参照してください。

---

**公開URL**: https://koseitoyonaga.github.io/flowdoc-pro/

**デモアカウント**:
- メール: `demo@example.com`
- パスワード: `demo123`
