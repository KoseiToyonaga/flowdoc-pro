import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './NotionDocument.css';

// スラッシュコマンド定義
const SLASH_COMMANDS = [
  { label: '見出し 1', command: '# ', icon: 'H1' },
  { label: '見出し 2', command: '## ', icon: 'H2' },
  { label: '見出し 3', command: '### ', icon: 'H3' },
  { label: '太字', command: '**', icon: 'B', wrap: true },
  { label: '斜体', command: '*', icon: 'I', wrap: true },
  { label: '取り消し線', command: '~~', icon: 'S', wrap: true },
  { label: 'インラインコード', command: '`', icon: '<>', wrap: true },
  { label: '箇条書きリスト', command: '- ', icon: '•' },
  { label: '番号付きリスト', command: '1. ', icon: '1.' },
  { label: 'チェックリスト', command: '- [ ] ', icon: '☐' },
  { label: '引用', command: '> ', icon: '❝' },
  { label: 'コードブロック', command: '```\n', icon: '{}', end: '\n```' },
  { label: '区切り線', command: '\n---\n', icon: '—' },
  { label: 'リンク', command: '[', icon: '🔗', end: '](url)' },
  { label: 'テーブル', command: '| 列1 | 列2 |\n|---|---|\n| ', icon: '▦' },
];

function NotionDocument({ flow, glossary = [], onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showToolbar, setShowToolbar] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [slashMenuFilter, setSlashMenuFilter] = useState('');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [hoveredGlossary, setHoveredGlossary] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [versions, setVersions] = useState([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const textareaRef = useRef(null);
  const titleRef = useRef(null);
  const slashMenuRef = useRef(null);

  useEffect(() => {
    if (flow && flow.document) {
      setTitle(flow.document.title || '');
      const markdownContent = flow.document.content || '';
      setContent(markdownContent);
      setImages(flow.document.images || []);
      setVersions(flow.document.versions || []);
      setUnsavedChanges(false);
    }
  }, [flow?.id]);

  // バージョン管理（自動採番）
  const incrementVersion = (type = 'patch') => {
    if (!versions || versions.length === 0) return '1.0.0';
    
    const latest = versions[versions.length - 1].version;
    const [major, minor, patch] = latest.split('.').map(Number);
    
    switch(type) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  };

  // ドキュメント保存
  const handleSave = () => {
    if (!flow) return;

    const newVersion = incrementVersion('patch');
    const documentData = {
      id: flow.document?.id || `doc-${Date.now()}`,
      title: title,
      content: content,
      images: images,
      versions: [
        ...(versions || []),
        {
          version: newVersion,
          title: title,
          savedAt: new Date().toISOString(),
          changes: `更新: ${title}` // 簡易版。実際には差分を記録
        }
      ],
      lastModified: new Date().toISOString()
    };

    onSave(flow.id, documentData);
    setIsEditing(false);
    setUnsavedChanges(false);
  };

  // Markdown挿入（ラップ型対応）
  const insertMarkdown = (before, after = '', wrap = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText;
    if (wrap && selectedText) {
      newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    } else {
      newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    }
    
    setContent(newText);
    setUnsavedChanges(true);
    
    setTimeout(() => {
      textarea.focus();
      const cursorPos = start + before.length + (wrap && selectedText ? selectedText.length : 0);
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  // 画像貼り付け
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
          const imageId = `img-${Date.now()}`;
          setImages([...images, { id: imageId, data: base64 }]);
          insertMarkdown(`\n![画像](${imageId})\n`);
        };
        
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  // ドラッグ&ドロップ画像
  const handleImageDrop = (e) => {
    if (!isEditing) return;
    e.preventDefault();
    
    const files = e.dataTransfer?.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      if (files[i].type.indexOf('image') !== -1) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          const base64 = event.target.result;
          const imageId = `img-${Date.now()}-${i}`;
          setImages([...images, { id: imageId, data: base64 }]);
          insertMarkdown(`\n![画像](${imageId})\n`);
        };
        
        reader.readAsDataURL(files[i]);
      }
    }
  };

  // スラッシュコマンドメニュー表示
  const handleTextChange = (e) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setContent(newValue);
    setUnsavedChanges(true);

    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
    
    if (lastSlashIndex !== -1) {
      const textAfterSlash = textBeforeCursor.substring(lastSlashIndex + 1);
      const isNewLine = lastSlashIndex === 0 || textBeforeCursor[lastSlashIndex - 1] === '\n';
      
      if (isNewLine && !textAfterSlash.includes('\n')) {
        setSlashMenuFilter(textAfterSlash.toLowerCase());
        setShowSlashMenu(true);
        setSelectedCommandIndex(0);
        
        const textarea = textareaRef.current;
        if (textarea) {
          const lineHeight = 20;
          const lines = textBeforeCursor.split('\n').length;
          setSlashMenuPosition({
            top: lines * lineHeight + 60,
            left: 20
          });
        }
      } else {
        setShowSlashMenu(false);
      }
    } else {
      setShowSlashMenu(false);
    }
  };

  // スラッシュコマンド実行
  const insertCommand = (command) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPosition);
    const textAfterCursor = content.substring(cursorPosition);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
    
    const newText = 
      content.substring(0, lastSlashIndex) + 
      command.command + 
      (command.end || '') +
      textAfterCursor;
    
    setContent(newText);
    setShowSlashMenu(false);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = lastSlashIndex + command.command.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // キーボード操作
  const handleKeyDown = (e) => {
    // スラッシュメニュー表示時の操作
    if (showSlashMenu) {
      const filteredCommands = SLASH_COMMANDS.filter(cmd => 
        cmd.label.toLowerCase().includes(slashMenuFilter)
      );

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex((prev) => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex((prev) => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedCommandIndex]) {
          insertCommand(filteredCommands[selectedCommandIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowSlashMenu(false);
      }
      return;
    }

    // Cmd/Ctrl + S で保存
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    
    // Cmd/Ctrl + B で太字
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      insertMarkdown('**', '**', true);
    }
    
    // Cmd/Ctrl + I で斜体
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      insertMarkdown('*', '*', true);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      textareaRef.current?.focus();
    }
  };

  // MarkdownをHTMLにレンダリング（画像ID置換）
  const renderMarkdownWithImages = (markdown) => {
    let result = markdown;
    images.forEach(img => {
      const regex = new RegExp(`!\\[([^\\]]*)]\\(${img.id}\\)`, 'g');
      result = result.replace(regex, `![${img.id}](${img.data})`);
    });
    return result;
  };

  // 用語集ハイライト（表示モード）
  const renderContentWithGlossary = () => {
    if (!glossary || glossary.length === 0) {
      return (
        <div className="notion-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {renderMarkdownWithImages(content)}
          </ReactMarkdown>
        </div>
      );
    }

    return (
      <div className="notion-content glossary-enabled">
        <div className="glossary-terms-wrapper">
          {glossary.map(term => (
            <span
              key={term.id}
              className="glossary-tooltip-wrapper"
              onMouseEnter={(e) => {
                setHoveredGlossary(term);
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPosition({
                  top: rect.bottom + 5,
                  left: rect.left
                });
              }}
              onMouseLeave={() => setHoveredGlossary(null)}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {renderMarkdownWithImages(content)}
              </ReactMarkdown>
            </span>
          ))}
        </div>
        
        {hoveredGlossary && (
          <div 
            className="glossary-tooltip"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`
            }}
          >
            <div className="tooltip-term">{hoveredGlossary.term}</div>
            <div className="tooltip-description">{hoveredGlossary.description}</div>
          </div>
        )}
      </div>
    );
  };

  const filteredCommands = SLASH_COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(slashMenuFilter)
  );

  if (!flow) {
    return (
      <div className="notion-document">
        <div className="empty-state">
          <p>フローを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notion-document">
      {!isEditing ? (
        <>
          <div className="notion-header">
            <div className="header-left">
              {flow.document?.versions && flow.document.versions.length > 0 && (
                <span className="version-badge">v{flow.document.versions[flow.document.versions.length - 1].version}</span>
              )}
            </div>
            <div className="header-actions">
              {flow.document?.versions && flow.document.versions.length > 1 && (
                <button 
                  className="history-btn"
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  title="バージョン履歴"
                >
                  📜 {flow.document.versions.length}
                </button>
              )}
              <button 
                className="edit-btn"
                onClick={() => {
                  setIsEditing(true);
                  setTimeout(() => {
                    if (!title) {
                      titleRef.current?.focus();
                    }
                  }, 100);
                }}
              >
                ✏️ 編集
              </button>
            </div>
          </div>

          {showVersionHistory && (
            <div className="version-history-panel">
              <h3>バージョン履歴</h3>
              <div className="version-list">
                {flow.document?.versions && flow.document.versions.map((version, index) => (
                  <div key={index} className="version-item">
                    <div className="version-header">
                      <span className="version-number">v{version.version}</span>
                      <span className="version-date">{new Date(version.savedAt).toLocaleString('ja-JP')}</span>
                    </div>
                    <div className="version-changes">{version.changes}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="notion-view">
            {title ? (
              <h1 className="notion-title">{title}</h1>
            ) : (
              <h1 className="notion-title empty">タイトルなし</h1>
            )}
            
            {content ? (
              renderContentWithGlossary()
            ) : (
              <div className="notion-empty">
                <p>このフローのドキュメントを作成してください</p>
                <button className="btn-primary" onClick={() => setIsEditing(true)}>
                  ドキュメントを追加
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="notion-edit-header">
            <div className="unsaved-indicator">
              {unsavedChanges && <span className="unsaved-badge">● 変更中</span>}
            </div>
            <div className="header-actions">
              <button className="save-btn" onClick={handleSave}>
                💾 完了
              </button>
              <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                ✕ キャンセル
              </button>
            </div>
          </div>

          <div 
            className="notion-edit"
            onDrop={handleImageDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              ref={titleRef}
              type="text"
              className="notion-title-input"
              placeholder="タイトルなし"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setUnsavedChanges(true);
              }}
              onKeyDown={handleTitleKeyDown}
            />

            <div className="editor-toolbar-section">
              <div 
                className="toolbar-trigger"
                onMouseEnter={() => setShowToolbar(true)}
                onMouseLeave={() => setShowToolbar(false)}
              >
                {showToolbar && (
                  <div className="floating-toolbar">
                    <button onClick={() => insertMarkdown('# ')} title="見出し1">H1</button>
                    <button onClick={() => insertMarkdown('## ')} title="見出し2">H2</button>
                    <button onClick={() => insertMarkdown('### ')} title="見出し3">H3</button>
                    <span className="toolbar-divider"></span>
                    <button onClick={() => insertMarkdown('**', '**', true)} title="太字 (⌘B)"><strong>B</strong></button>
                    <button onClick={() => insertMarkdown('*', '*', true)} title="斜体 (⌘I)"><em>I</em></button>
                    <button onClick={() => insertMarkdown('~~', '~~', true)} title="取り消し線"><s>S</s></button>
                    <button onClick={() => insertMarkdown('`', '`', true)} title="コード">{`</>`}</button>
                    <span className="toolbar-divider"></span>
                    <button onClick={() => insertMarkdown('- ')} title="箇条書き">•</button>
                    <button onClick={() => insertMarkdown('1. ')} title="番号付きリスト">1.</button>
                    <button onClick={() => insertMarkdown('- [ ] ')} title="チェックリスト">☐</button>
                    <span className="toolbar-divider"></span>
                    <button onClick={() => insertMarkdown('|テーブル|テーブル|\n|---|---|\n|', '|')} title="テーブル">▦</button>
                    <button onClick={() => insertMarkdown('[', '](url)', true)} title="リンク">🔗</button>
                    <button onClick={() => insertMarkdown('> ')} title="引用">❝</button>
                    <button onClick={() => insertMarkdown('```\n', '\n```')} title="コードブロック">{ }</button>
                  </div>
                )}
              </div>

              <div className="toolbar-help">
                <span>💡 '/' でコマンド表示 | 画像をドラッグ&ドロップ可</span>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              className="notion-textarea"
              placeholder="内容を入力してください...

'/' でブロックコマンド表示
画像をペーストまたはドロップ
⌘ + S で保存"
              value={content}
              onChange={handleTextChange}
              onPaste={handleImagePaste}
              onKeyDown={handleKeyDown}
            />

            {showSlashMenu && filteredCommands.length > 0 && (
              <div 
                ref={slashMenuRef}
                className="slash-menu"
                style={slashMenuPosition}
              >
                {filteredCommands.map((cmd, index) => (
                  <div
                    key={cmd.label}
                    className={`slash-menu-item ${index === selectedCommandIndex ? 'selected' : ''}`}
                    onClick={() => insertCommand(cmd)}
                    onMouseEnter={() => setSelectedCommandIndex(index)}
                  >
                    <span className="slash-icon">{cmd.icon}</span>
                    <span className="slash-label">{cmd.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="keyboard-shortcuts">
              <span>⌘ + S 保存</span>
              <span>⌘ + B 太字</span>
              <span>⌘ + I 斜体</span>
              <span>' /' コマンド</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotionDocument;