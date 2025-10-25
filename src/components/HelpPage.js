import React, { useState } from 'react';
import './HelpPage.css';

function HelpPage({ onClose }) {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: '📖 概要', icon: '📖' },
    { id: 'getting-started', title: '🚀 はじめに', icon: '🚀' },
    { id: 'flow', title: '📊 フロー管理', icon: '📊' },
    { id: 'document', title: '📝 ドキュメント', icon: '📝' },
    { id: 'excellence', title: '⭐ オペレーションエクセレンス', icon: '⭐' },
    { id: 'status', title: '🔄 ステータス管理', icon: '🔄' },
    { id: 'shortcuts', title: '⌨️ ショートカット', icon: '⌨️' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-header">
          <h2>❓ FlowDoc Pro ヘルプ</h2>
          <button className="close-modal" onClick={onClose}>✕</button>
        </div>

        <div className="help-container">
          <div className="help-sidebar">
            {sections.map(section => (
              <div
                key={section.id}
                className={`help-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="help-nav-icon">{section.icon}</span>
                <span>{section.title}</span>
              </div>
            ))}
          </div>

          <div className="help-content">
            {activeSection === 'overview' && (
              <div className="help-section">
                <h3>📖 FlowDoc Proとは？</h3>
                <p>
                  FlowDoc Proは、業務フローとナレッジを統合管理できる
                  オペレーションエクセレンスツールです。
                </p>
                
                <h4>主な機能</h4>
                <ul>
                  <li><strong>視覚的なフロー管理:</strong> ドラッグ&ドロップで直感的にフローチャートを作成</li>
                  <li><strong>階層的な構造:</strong> サブフローで詳細な業務プロセスを表現</li>
                  <li><strong>プロセスドキュメント:</strong> 各プロセスに詳細な手順書を紐づけ</li>
                  <li><strong>KPI管理:</strong> プロセスごとにメトリクスを設定して達成率を追跡</li>
                  <li><strong>改善管理:</strong> PDCAサイクルで継続的な改善を実現</li>
                  <li><strong>ステータス管理:</strong> kintone風のプロセス管理でワークフローを可視化</li>
                </ul>
              </div>
            )}

            {activeSection === 'getting-started' && (
              <div className="help-section">
                <h3>🚀 はじめに</h3>
                
                <h4>1. プロジェクトを作成</h4>
                <div className="help-step">
                  <p>左サイドバーの「➕ 新規プロジェクト」ボタンをクリック</p>
                  <p>プロジェクト名と説明を入力して作成します。</p>
                </div>

                <h4>2. プロセスを追加</h4>
                <div className="help-step">
                  <p>中央のフローエディタで「➕ プロセス追加」をクリック</p>
                  <p>プロセス名、説明、色、形状を設定します。</p>
                  <p>サブフローを作成する場合はチェックを入れます。</p>
                </div>

                <h4>3. プロセスを接続</h4>
                <div className="help-step">
                  <p>プロセスの端をドラッグして他のプロセスに接続します。</p>
                  <p>接続テーブルで条件を追加できます。</p>
                </div>

                <h4>4. ドキュメントを作成</h4>
                <div className="help-step">
                  <p>プロセスをクリックして右パネルを開きます。</p>
                  <p>「編集」タブでドキュメントを作成します。</p>
                  <p>Markdown形式で記述できます。</p>
                </div>
              </div>
            )}

            {activeSection === 'flow' && (
              <div className="help-section">
                <h3>📊 フロー管理</h3>
                
                <h4>フローの作成</h4>
                <p>プロジェクトを作成すると、自動的に「メインフロー」が作成されます。</p>

                <h4>サブフローの作成</h4>
                <ul>
                  <li><strong>方法1:</strong> プロセス追加時に「サブフローを作成する」にチェック</li>
                  <li><strong>方法2:</strong> 左サイドバーのフローにマウスホバーして「➕」をクリック</li>
                  <li><strong>方法3:</strong> プロセスを選択後、右パネルの情報タブで設定</li>
                </ul>

                <h4>階層構造</h4>
                <p>サブフローは無限にネストできます。パンくずリストで現在の階層を確認できます。</p>

                <h4>フローの削除</h4>
                <p>サブフローを削除すると、そのサブフローに紐づく全ての子フローも削除されます。</p>
              </div>
            )}

            {activeSection === 'document' && (
              <div className="help-section">
                <h3>📝 ドキュメント機能</h3>
                
                <h4>Markdown記法</h4>
                <ul>
                  <li><code># 見出し1</code> - 大見出し</li>
                  <li><code>## 見出し2</code> - 中見出し</li>
                  <li><code>### 見出し3</code> - 小見出し</li>
                  <li><code>**太字**</code> - 太字</li>
                  <li><code>*斜体*</code> - 斜体</li>
                  <li><code>`コード`</code> - インラインコード</li>
                  <li><code>- リスト</code> - 箇条書き</li>
                  <li><code>1. リスト</code> - 番号付きリスト</li>
                </ul>

                <h4>スラッシュコマンド</h4>
                <p>
                  編集画面で <code>/</code> を入力すると、挿入可能な要素がメニューで表示されます。
                  矢印キーで選択、Enterで挿入できます。
                </p>

                <h4>画像の追加</h4>
                <ul>
                  <li>編集画面で画像をコピー&ペースト</li>
                  <li>画像は自動的にBase64形式で埋め込まれます</li>
                  <li>編集画面でもプレビュー表示されます</li>
                </ul>

                <h4>キーボードショートカット</h4>
                <ul>
                  <li><code>Ctrl + S</code> / <code>⌘ + S</code> - 保存</li>
                  <li><code>Ctrl + B</code> / <code>⌘ + B</code> - 太字</li>
                  <li><code>Ctrl + I</code> / <code>⌘ + I</code> - 斜体</li>
                </ul>
              </div>
            )}

            {activeSection === 'excellence' && (
              <div className="help-section">
                <h3>⭐ オペレーションエクセレンス</h3>
                
                <h4>メトリクス（KPI）管理</h4>
                <p>プロセスごとにKPIを設定し、達成状況を追跡します。</p>
                <ul>
                  <li>目標値と現在値を入力</li>
                  <li>達成率が自動計算される</li>
                  <li>単位をカスタマイズ可能</li>
                </ul>

                <h4>改善管理（PDCA）</h4>
                <p>継続的な改善活動を記録・管理します。</p>
                <ul>
                  <li><strong>Plan:</strong> 改善計画を立案</li>
                  <li><strong>Do:</strong> 改善を実施</li>
                  <li><strong>Check:</strong> 効果を検証</li>
                  <li><strong>Act:</strong> 改善を標準化</li>
                </ul>

                <h4>チェックリスト</h4>
                <p>運用準備や品質確認の項目を管理します。</p>
                <ul>
                  <li>チェック状態を記録</li>
                  <li>完了率が自動計算される</li>
                </ul>

                <h4>リスク管理</h4>
                <p>プロセスに潜むリスクを特定し、対応策を文書化します。</p>
                <ul>
                  <li>リスクレベル（高/中/低）を設定</li>
                  <li>対応策・軽減策を記録</li>
                  <li>色分けで視覚的に管理</li>
                </ul>
              </div>
            )}

            {activeSection === 'status' && (
              <div className="help-section">
                <h3>🔄 ステータス管理</h3>
                
                <h4>ステータスとは？</h4>
                <p>
                  kintoneのプロセス管理のように、フローやプロセスの進行状況を
                  段階的に管理できます。
                </p>

                <h4>ステータスの設定</h4>
                <ol>
                  <li>左サイドバーのプロジェクトにマウスホバー</li>
                  <li>⚙️ アイコンをクリック</li>
                  <li>プロジェクト設定画面でステータスを追加・編集</li>
                  <li>ステータス名と色を設定</li>
                </ol>

                <h4>ステータスの適用</h4>
                <p>
                  右パネルの情報タブで、フローやプロセスにステータスを設定できます。
                </p>

                <h4>デフォルトステータス</h4>
                <ul>
                  <li><span style={{color: '#95a5a6'}}>●</span> 作成中 - 初期状態</li>
                  <li><span style={{color: '#f39c12'}}>●</span> レビュー中 - 確認待ち</li>
                  <li><span style={{color: '#27ae60'}}>●</span> 公開 - 運用中</li>
                </ul>
              </div>
            )}

            {activeSection === 'shortcuts' && (
              <div className="help-section">
                <h3>⌨️ キーボードショートカット</h3>
                
                <h4>ドキュメント編集</h4>
                <table className="shortcuts-table">
                  <tbody>
                    <tr>
                      <td><kbd>Ctrl</kbd> + <kbd>S</kbd></td>
                      <td>保存</td>
                    </tr>
                    <tr>
                      <td><kbd>Ctrl</kbd> + <kbd>B</kbd></td>
                      <td>太字</td>
                    </tr>
                    <tr>
                      <td><kbd>Ctrl</kbd> + <kbd>I</kbd></td>
                      <td>斜体</td>
                    </tr>
                    <tr>
                      <td><kbd>/</kbd></td>
                      <td>スラッシュコマンド</td>
                    </tr>
                    <tr>
                      <td><kbd>↑</kbd> <kbd>↓</kbd></td>
                      <td>スラッシュメニュー選択</td>
                    </tr>
                    <tr>
                      <td><kbd>Enter</kbd></td>
                      <td>スラッシュメニュー挿入</td>
                    </tr>
                    <tr>
                      <td><kbd>Esc</kbd></td>
                      <td>スラッシュメニューを閉じる</td>
                    </tr>
                  </tbody>
                </table>

                <h4>Mac</h4>
                <p><kbd>Ctrl</kbd> の代わりに <kbd>⌘ Command</kbd> を使用します。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpPage;
