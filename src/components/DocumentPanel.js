import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './DocumentPanel.css';

function DocumentPanel({ project, onSave, onDelete }) {
  const [documents, setDocuments] = useState(project?.documents || []);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [activeTab, setActiveTab] = useState('view');
  const [showDocModal, setShowDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const textareaRef = useRef(null);

  React.useEffect(() => {
    if (project) {
      setDocuments(project.documents || []);
      if (project.documents && project.documents.length > 0 && !currentDoc) {
        const firstDoc = project.documents[0];
        setCurrentDoc(firstDoc);
        setTitle(firstDoc.title);
        setContent(firstDoc.content);
      }
    }
  }, [project]);

  const handleCreateDoc = () => {
    if (newDocTitle.trim()) {
      const newDoc = {
        id: Date.now().toString(),
        title: newDocTitle.trim(),
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setDocuments([...documents, newDoc]);
      setCurrentDoc(newDoc);
      setTitle(newDoc.title);
      setContent('');
      setNewDocTitle('');
      setShowDocModal(false);
      setActiveTab('edit');
    }
  };

  const handleSelectDoc = (doc) => {
    setCurrentDoc(doc);
    setTitle(doc.title);
    setContent(doc.content);
    setActiveTab('view');
  };

  const handleSave = () => {
    if (currentDoc) {
      const updatedDoc = {
        ...currentDoc,
        title,
        content,
        updatedAt: new Date().toISOString()
      };
      onSave(updatedDoc);
      
      const updatedDocs = documents.map(d => 
        d.id === updatedDoc.id ? updatedDoc : d
      );
      setDocuments(updatedDocs);
      setCurrentDoc(updatedDoc);
      setActiveTab('view');
      alert('保存しました');
    }
  };

  const handleDeleteDoc = (docId) => {
    if (window.confirm('このドキュメントを削除しますか?')) {
      onDelete(docId);
      const updatedDocs = documents.filter(d => d.id !== docId);
      setDocuments(updatedDocs);
      
      if (currentDoc && currentDoc.id === docId) {
        if (updatedDocs.length > 0) {
          const nextDoc = updatedDocs[0];
          setCurrentDoc(nextDoc);
          setTitle(nextDoc.title);
          setContent(nextDoc.content);
        } else {
          setCurrentDoc(null);
          setTitle('');
          setContent('');
        }
      }
    }
  };

  const insertMarkdown = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleImagePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        
        reader.onload = (event) => {
          const base64 = event.target.result;
          insertMarkdown(`![画像](${base64})`);
        };
        
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  const handleImageDrop = async (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    
    if (files.length > 0 && files[0].type.indexOf('image') !== -1) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const base64 = event.target.result;
        insertMarkdown(`![画像](${base64})`);
      };
      
      reader.readAsDataURL(files[0]);
    }
  };

  if (!project) {
    return (
      <div className="document-panel">
        <div className="empty-panel">
          <p>プロジェクトを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="document-panel">
        <div className="panel-tabs">
          <div 
            className={`tab ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            表示
          </div>
          <div 
            className={`tab ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            編集
          </div>
          <div 
            className={`tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            一覧
          </div>
        </div>

        <div className="panel-content">
          {activeTab === 'list' && (
            <div className="doc-list-panel">
              <button className="btn btn-add" onClick={() => setShowDocModal(true)}>
                ➕ 新規ドキュメント
              </button>
              <div className="doc-list">
                {documents.length === 0 ? (
                  <p className="empty-text">ドキュメントがありません</p>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`doc-item ${currentDoc?.id === doc.id ? 'active' : ''}`}
                      onClick={() => handleSelectDoc(doc)}
                    >
                      <div className="doc-item-header">
                        <strong>{doc.title}</strong>
                        <button
                          className="doc-item-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDoc(doc.id);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="doc-date">
                        {new Date(doc.updatedAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'view' && (
            <div className="doc-view-panel">
              {!currentDoc ? (
                <div className="empty-state">
                  <p>ドキュメントを選択してください</p>
                  <button className="btn btn-primary" onClick={() => setActiveTab('list')}>
                    一覧を表示
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="doc-title">{title}</h2>
                  <div className="doc-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="doc-edit-panel">
              {!currentDoc ? (
                <div className="empty-state">
                  <p>編集するドキュメントを選択してください</p>
                  <button className="btn btn-primary" onClick={() => setActiveTab('list')}>
                    一覧を表示
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ドキュメントタイトル"
                  />

                  <div className="markdown-toolbar">
                    <button onClick={() => insertMarkdown('# ')} title="見出し1">H1</button>
                    <button onClick={() => insertMarkdown('## ')} title="見出し2">H2</button>
                    <button onClick={() => insertMarkdown('### ')} title="見出し3">H3</button>
                    <span className="divider">|</span>
                    <button onClick={() => insertMarkdown('**', '**')} title="太字"><strong>B</strong></button>
                    <button onClick={() => insertMarkdown('*', '*')} title="斜体"><em>I</em></button>
                    <button onClick={() => insertMarkdown('~~', '~~')} title="取り消し線"><s>S</s></button>
                    <span className="divider">|</span>
                    <button onClick={() => insertMarkdown('- ')} title="リスト">• List</button>
                    <button onClick={() => insertMarkdown('1. ')} title="番号付きリスト">1. List</button>
                    <button onClick={() => insertMarkdown('- [ ] ')} title="チェックボックス">☐</button>
                    <span className="divider">|</span>
                    <button onClick={() => insertMarkdown('[', '](url)')} title="リンク">🔗</button>
                    <button onClick={() => insertMarkdown('`', '`')} title="コード">&lt;/&gt;</button>
                    <button onClick={() => insertMarkdown('```\n', '\n```')} title="コードブロック">{ }</button>
                  </div>

                  <textarea
                    ref={textareaRef}
                    className="form-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onPaste={handleImagePaste}
                    onDrop={handleImageDrop}
                    onDragOver={(e) => e.preventDefault()}
                    placeholder="マークダウン形式で記述...&#10;&#10;画像をドラッグ&ドロップまたは貼り付けできます"
                  />

                  <button className="btn btn-primary" onClick={handleSave}>
                    💾 保存
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showDocModal && (
        <div className="modal-overlay" onClick={() => setShowDocModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>➕ 新規ドキュメント</span>
              <span className="close-modal" onClick={() => setShowDocModal(false)}>✕</span>
            </div>
            <div className="form-group">
              <label className="form-label">ドキュメントタイトル</label>
              <input
                type="text"
                className="form-input"
                placeholder="例: 業務手順書"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateDoc()}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowDocModal(false)}>
                キャンセル
              </button>
              <button className="btn btn-primary" onClick={handleCreateDoc}>
                作成
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DocumentPanel;
