import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ProcessDocument.css';

const SLASH_COMMANDS = [
  { label: '見出し 1', command: '# ', icon: 'H1' },
  { label: '見出し 2', command: '## ', icon: 'H2' },
  { label: '見出し 3', command: '### ', icon: 'H3' },
  { label: '箇条書きリスト', command: '- ', icon: '•' },
  { label: '番号付きリスト', command: '1. ', icon: '1.' },
  { label: 'チェックリスト', command: '- [ ] ', icon: '☐' },
  { label: '引用', command: '> ', icon: '❝' },
  { label: 'コード', command: '`', icon: '<>' },
  { label: 'コードブロック', command: '```\n', icon: '{}' },
  { label: '区切り線', command: '\n---\n', icon: '—' },
];

function ProcessDocument({ node, onUpdateDocument }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [slashMenuFilter, setSlashMenuFilter] = useState('');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const textareaRef = useRef(null);
  const slashMenuRef = useRef(null);

  useEffect(() => {
    if (node && node.data.document) {
      const markdownContent = node.data.document.blocks?.map(b => b.content).join('\n\n') || '';
      setContent(markdownContent);
    }
  }, [node?.id]);

  const handleSave = () => {
    const blocks = content.split('\n\n').map((block, index) => ({
      id: `block-${index}`,
      type: 'paragraph',
      content: block
    }));

    const documentData = {
      id: node.data.document?.id || `doc-${Date.now()}`,
      title: '',
      blocks: blocks
    };

    onUpdateDocument(node.id, documentData);
    setIsEditing(false);
  };

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setContent(newValue);

    // / でスラッシュコマンドメニューを表示
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
    
    if (lastSlashIndex !== -1) {
      const textAfterSlash = textBeforeCursor.substring(lastSlashIndex + 1);
      const isNewLine = lastSlashIndex === 0 || textBeforeCursor[lastSlashIndex - 1] === '\n';
      
      if (isNewLine && !textAfterSlash.includes('\n')) {
        setSlashMenuFilter(textAfterSlash.toLowerCase());
        setShowSlashMenu(true);
        setSelectedCommandIndex(0);
        
        // カーソル位置を計算
        const textarea = textareaRef.current;
        if (textarea) {
          const lineHeight = 24;
          const lines = textBeforeCursor.split('\n').length;
          setSlashMenuPosition({
            top: lines * lineHeight + 80,
            left: 40
          });
        }
      } else {
        setShowSlashMenu(false);
      }
    } else {
      setShowSlashMenu(false);
    }
  };

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
      textAfterCursor;
    
    setContent(newText);
    setShowSlashMenu(false);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = lastSlashIndex + command.command.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e) => {
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

    // Ctrl/Cmd + S で保存
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
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
          const textarea = textareaRef.current;
          const cursorPosition = textarea.selectionStart;
          const newContent = 
            content.substring(0, cursorPosition) + 
            `\n![画像](${base64})\n` + 
            content.substring(cursorPosition);
          setContent(newContent);
        };
        
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  const filteredCommands = SLASH_COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(slashMenuFilter)
  );

  return (
    <div className="process-document">
      {!isEditing ? (
        <>
          {content ? (
            <div className="doc-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="doc-empty">
              <p>ドキュメントがありません</p>
            </div>
          )}
          <button className="btn-edit" onClick={() => setIsEditing(true)}>
            ✏️ 編集
          </button>
        </>
      ) : (
        <>
          <textarea
            ref={textareaRef}
            className="doc-textarea"
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onPaste={handleImagePaste}
            placeholder="'/' でコマンド表示
画像をペースト可能
⌘ + S で保存"
            autoFocus
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

          <div className="doc-actions">
            <button className="btn-cancel" onClick={() => setIsEditing(false)}>
              キャンセル
            </button>
            <button className="btn-save" onClick={handleSave}>
              💾 保存
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ProcessDocument;
