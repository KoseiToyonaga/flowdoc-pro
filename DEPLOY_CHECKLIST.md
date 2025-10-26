# 📋 デプロイ最終チェックリスト

## 🎯 ゴール
https://koseitoyonaga.github.io/flowdoc-pro/ にログイン機能付きアプリをデプロイ

---

## ⚠️ 必須: index.jsの更新

**最重要ステップです！**

`src\index.js` を開いて、以下のコードに置き換えてください：

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

**確認方法**:
`src\index.js` を開いて `AuthProvider` という文字列が含まれているか確認

---

## 🚀 デプロイ実行（3つの方法）

### 方法1: バッチファイル（最も簡単）

```
deploy.bat をダブルクリック
```

### 方法2: コマンドプロンプト

```bash
cd C:\Users\toyon\Desktop\flow-knowledge-manager
deploy.bat
```

### 方法3: 手動実行

```bash
cd C:\Users\toyon\Desktop\flow-knowledge-manager
npm install --save-dev gh-pages
npm run build
npm run deploy
```

---

## ✅ デプロイ前チェックリスト

- [ ] `src\index.js` に `AuthProvider` が含まれている
- [ ] `package.json` に以下が含まれている：
  ```json
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
  ```
- [ ] ローカルでテスト済み（`npm start` で動作確認）
- [ ] Gitが設定されている（`git remote -v` で確認）

---

## 📊 デプロイの進行状況

### ステップ1: ビルド（1-2分）
```
Creating an optimized production build...
Compiled successfully.
File sizes after gzip:
  ...
```

### ステップ2: デプロイ（30秒）
```
Published
```

### ステップ3: 反映待ち（5-10分）
GitHubが自動的にページを更新します

---

## 🔍 デプロイ後の確認

### 1. GitHubで確認

https://github.com/koseitoyonaga/flowdoc-pro

- [ ] `gh-pages` ブランチが存在する
- [ ] Settings > Pages で以下を確認：
  - Source: Deploy from a branch
  - Branch: gh-pages
  - Folder: / (root)

### 2. 公開URLで動作確認

https://koseitoyonaga.github.io/flowdoc-pro/

以下を確認：
- [ ] ログイン画面が表示される（白い画面ではない）
- [ ] デモアカウントでログインできる
  - メール: `demo@example.com`
  - パスワード: `demo123`
- [ ] プロジェクトが作成できる
- [ ] フローエディターが動作する
- [ ] プロフィール画面が開く
- [ ] ログアウトできる

---

## 🐛 トラブルシューティング

### 問題1: 白い画面が表示される

**原因**: `index.js` が更新されていない

**解決策**:
1. `src\index.js` を開く
2. `AuthProvider` が含まれているか確認
3. 含まれていない場合は上記のコードに置き換え
4. 再デプロイ: `npm run deploy`

### 問題2: 404 Not Found

**原因**: GitHub Pagesの設定

**解決策**:
1. https://github.com/koseitoyonaga/flowdoc-pro/settings/pages
2. Branch を `gh-pages` に設定
3. Save をクリック
4. 10分待つ

### 問題3: gh-pages: command not found

**原因**: パッケージがインストールされていない

**解決策**:
```bash
npm install --save-dev gh-pages
npm run deploy
```

### 問題4: ログイン後に何も表示されない

**原因**: ブラウザのLocalStorage

**解決策**:
1. F12 で開発者ツールを開く
2. Application > Local Storage
3. Clear All
4. ページをリロード

---

## 🔄 デプロイ後の更新方法

コードを変更した場合：

```bash
# Gitにコミット
git add .
git commit -m "更新内容"
git push origin main

# デプロイ
npm run deploy
```

または `deploy.bat` を実行

---

## 🎉 完了確認

全て完了したら：

- [ ] https://koseitoyonaga.github.io/flowdoc-pro/ にアクセスできる
- [ ] ログイン画面が表示される
- [ ] デモアカウントでログインできる
- [ ] 全機能が動作する
- [ ] モバイルでも表示される

---

## 📞 次のステップ

1. **GitHubリポジトリの設定**
   - Description: 業務フロー&ナレッジ管理システム
   - Website: https://koseitoyonaga.github.io/flowdoc-pro/
   - Topics: react, workflow, knowledge-management, reactflow

2. **README.mdの更新**
   - 公開URLを追記
   - デモアカウント情報を記載

3. **テストユーザーを招待**
   - フィードバックを収集

---

## 🔗 重要リンク

- **公開URL**: https://koseitoyonaga.github.io/flowdoc-pro/
- **GitHubリポジトリ**: https://github.com/koseitoyonaga/flowdoc-pro
- **クイックガイド**: QUICK_DEPLOY.md
- **ログインマニュアル**: LOGIN_MANUAL.md

---

**デモアカウント**:
- メール: `demo@example.com`
- パスワード: `demo123`

**🚀 準備完了！deploy.bat を実行してデプロイしましょう！**
