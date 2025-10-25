import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './RightPanel.css';

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

function RightPanel({ flow, selectedNode, project, onSave, onUpdateNode, onDeleteNode, onCreateSubFlow }) {
  const [activeTab, setActiveTab] = useState('info');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [slashMenuFilter, setSlashMenuFilter] = useState('');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const textareaRef = useRef(null);

  // プロセス詳細編集用
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [processForm, setProcessForm] = useState({
    title: '',
    description: '',
    color: '#667eea',
    shape: 'default',
    hasSubFlow: false,
    status: 'draft'
  });

  // オペレーションエクセレンス関連のステート
  const [metrics, setMetrics] = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [risks, setRisks] = useState([]);

  // 新規追加用のステート
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [showImprovementModal, setShowImprovementModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);

  useEffect(() => {
    if (selectedNode) {
      setTitle(selectedNode.data.document?.title || '');
      setContent(selectedNode.data.document?.content || '');
      
      setProcessForm({
        title: selectedNode.data.label || '',
        description: selectedNode.data.description || '',
        color: selectedNode.data.color || '#667eea',
        shape: selectedNode.data.shape || 'default',
        hasSubFlow: selectedNode.data.hasSubFlow || false,
        status: selectedNode.data.status || 'draft'
      });
      
      setMetrics(selectedNode.data.metrics || []);
      setImprovements(selectedNode.data.improvements || []);
      setChecklist(selectedNode.data.checklist || []);
      setRisks(selectedNode.data.risks || []);
    }
  }, [selectedNode?.id]);

  const handleSaveDocument = () => {
    if (!selectedNode || !flow) return;

    const updatedNodes = flow.nodes.map(node => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          data: {
            ...node.data,
            document: {
              id: node.data.document?.id || `doc-${Date.now()}`,
              title: title,
              content: content
            },
            metrics: metrics,
            improvements: improvements,
            checklist: checklist,
            risks: risks
          }
        };
      }
      return node;
    });

    onSave(flow.id, { nodes: updatedNodes, edges: flow.edges }, flow.connections);
    setActiveTab('view');
  };

  const handleSaveProcessInfo = () => {
    if (!selectedNode) return;

    onUpdateNode({
      title: processForm.title,
      description: processForm.description,
      color: processForm.color,
      shape: processForm.shape,
      hasSubFlow: processForm.hasSubFlow,
      status: processForm.status
    });

    setIsEditingInfo(false);

    if (processForm.hasSubFlow && !selectedNode.data.subFlowId && flow) {
      setTimeout(() => {
        onCreateSubFlow(flow.id, processForm.title + ' 詳細');
      }, 100);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (!selectedNode || !flow) return;

    const updatedNodes = flow.nodes.map(node => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          data: {
            ...node.data,
            status: newStatus
          }
        };
      }
      return node;
    });

    onSave(flow.id, { nodes: updatedNodes, edges: flow.edges }, flow.connections);
    setProcessForm({ ...processForm, status: newStatus });
  };

  const handleDeleteProcess = () => {
    if (!selectedNode) return;
    if (window.confirm('このプロセスを削除しますか?\n※紐づくサブフローも全て削除されます。')) {
      onDeleteNode(selectedNode.id);
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

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setContent(newValue);

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

    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSaveDocument();
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
          insertMarkdown(`\n![画像](${base64})\n`);
        };
        
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  // メトリクス、改善、チェックリスト、リスクの関数は前回と同じなので省略

  const handleAddMetric = (metric) => {
    const newMetric = { id: Date.now().toString(), ...metric, createdAt: new Date().toISOString() };
    setMetrics([...metrics, newMetric]);
  };

  const handleAddImprovement = (improvement) => {
    const newImprovement = { id: Date.now().toString(), ...improvement, status: 'planned', createdAt: new Date().toISOString() };
    setImprovements([...improvements, newImprovement]);
  };

  const handleAddChecklistItem = (item) => {
    const newItem = { id: Date.now().toString(), ...item, checked: false, createdAt: new Date().toISOString() };
    setChecklist([...checklist, newItem]);
  };

  const handleAddRisk = (risk) => {
    const newRisk = { id: Date.now().toString(), ...risk, createdAt: new Date().toISOString() };
    setRisks([...risks, newRisk]);
  };

  const handleToggleChecklist = (id) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleUpdateImprovementStatus = (id, status) => {
    setImprovements(improvements.map(imp => imp.id === id ? { ...imp, status } : imp));
  };

  const filteredCommands = SLASH_COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(slashMenuFilter)
  );

  // プロジェクトのステータス定義を取得
  const projectStatuses = project?.statuses || [
    { id: 'draft', name: '作成中', color: '#95a5a6' },
    { id: 'review', name: 'レビュー中', color: '#f39c12' },
    { id: 'published', name: '公開', color: '#27ae60' }
  ];

  const currentStatus = projectStatuses.find(s => s.id === (selectedNode?.data.status || 'draft'));

  if (!selectedNode) {
    return (
      <div className="right-panel">
        <div className="empty-state">
          <p>プロセスを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="right-panel">
      <div className="article-tabs">
        <div 
          className={`tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          情報
        </div>
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
          className={`tab ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          メトリクス
        </div>
        <div 
          className={`tab ${activeTab === 'improvement' ? 'active' : ''}`}
          onClick={() => setActiveTab('improvement')}
        >
          改善
        </div>
        <div 
          className={`tab ${activeTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklist')}
        >
          チェック
        </div>
        <div 
          className={`tab ${activeTab === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveTab('risk')}
        >
          リスク
        </div>
      </div>

      <div className="article-content-wrapper">
        {activeTab === 'info' && (
          <div className="info-tab-content">
            <div className="process-badge">
              📌 プロセス: {selectedNode.data.label}
            </div>

            {/* ステータスバッジを大きく表示 */}
            <div className="status-display-section">
              <div className="detail-label">ステータス</div>
              <div className="status-selector-container">
                <select
                  className="status-select"
                  value={selectedNode.data.status || 'draft'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{
                    borderLeft: `4px solid ${currentStatus?.color || '#95a5a6'}`
                  }}
                >
                  {projectStatuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
                <div 
                  className="status-badge-large"
                  style={{background: currentStatus?.color || '#95a5a6'}}
                >
                  {currentStatus?.name || '作成中'}
                </div>
              </div>
              <p className="status-help-text">
                💡 プロセスの進行状況を管理します。プロジェクト設定で独自のステータスを追加できます。
              </p>
            </div>

            {!isEditingInfo ? (
              <>
                <div className="detail-section">
                  <div className="detail-label">プロセス名</div>
                  <div className="detail-value">{selectedNode.data.label}</div>
                </div>

                <div className="detail-section">
                  <div className="detail-label">説明</div>
                  <div className="detail-value description">
                    {selectedNode.data.description || '説明がありません'}
                  </div>
                </div>

                <div className="detail-section">
                  <div className="detail-label">色</div>
                  <div className="color-display">
                    <div 
                      className="color-box" 
                      style={{backgroundColor: selectedNode.data.color || '#667eea'}}
                    ></div>
                    <span>{selectedNode.data.color || '#667eea'}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <div className="detail-label">形状</div>
                  <div className="detail-value">
                    {selectedNode.data.shape === 'rounded' ? '角丸四角形' : 
                     selectedNode.data.shape === 'circle' ? '円形' :
                     selectedNode.data.shape === 'diamond' ? '菱形' :
                     selectedNode.data.shape === 'parallelogram' ? '平行四辺形' : '四角形'}
                  </div>
                </div>

                {selectedNode.data.subFlowId && (
                  <div className="detail-section">
                    <div className="detail-label">サブフロー</div>
                    <div className="detail-value">
                      <span className="badge-success">✓ 紐づいています</span>
                    </div>
                  </div>
                )}

                <div className="info-section">
                  <h3>オペレーションエクセレンス</h3>
                  <div className="info-item">
                    <span className="info-label">メトリクス:</span>
                    <span className="info-value">{metrics.length}件</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">改善提案:</span>
                    <span className="info-value">{improvements.length}件</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">チェックリスト:</span>
                    <span className="info-value">{checklist.filter(c => c.checked).length}/{checklist.length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">リスク:</span>
                    <span className="info-value">{risks.length}件</span>
                  </div>
                </div>

                <div className="detail-actions">
                  <button className="btn btn-primary" onClick={() => setIsEditingInfo(true)}>
                    ✏️ 編集
                  </button>
                  <button className="btn btn-danger" onClick={handleDeleteProcess}>
                    🗑️ 削除
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">プロセス名</label>
                  <input
                    type="text"
                    className="form-input"
                    value={processForm.title}
                    onChange={(e) => setProcessForm({ ...processForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">説明</label>
                  <textarea
                    className="form-textarea"
                    value={processForm.description}
                    onChange={(e) => setProcessForm({ ...processForm, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">色</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      className="color-input"
                      value={processForm.color}
                      onChange={(e) => setProcessForm({ ...processForm, color: e.target.value })}
                    />
                    <span className="color-value">{processForm.color}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">形状</label>
                  <select
                    className="form-input"
                    value={processForm.shape}
                    onChange={(e) => setProcessForm({ ...processForm, shape: e.target.value })}
                  >
                    <option value="default">四角形</option>
                    <option value="rounded">角丸四角形</option>
                    <option value="circle">円形</option>
                    <option value="diamond">菱形</option>
                    <option value="parallelogram">平行四辺形</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">ステータス</label>
                  <select
                    className="form-input"
                    value={processForm.status}
                    onChange={(e) => setProcessForm({ ...processForm, status: e.target.value })}
                  >
                    {projectStatuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={processForm.hasSubFlow}
                      onChange={(e) => setProcessForm({ ...processForm, hasSubFlow: e.target.checked })}
                      disabled={selectedNode.data.subFlowId}
                    />
                    <span>
                      {selectedNode.data.subFlowId ? 'サブフローが作成済み' : 'サブフローを作成する'}
                    </span>
                  </label>
                </div>

                <div className="detail-actions">
                  <button className="btn" onClick={() => setIsEditingInfo(false)}>
                    キャンセル
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveProcessInfo}>
                    💾 保存
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* 表示、編集、その他のタブは前回と同じなので省略 */}
        {activeTab === 'view' && (
          <div id="articleViewContent">
            <div className="process-badge">
              📌 プロセス: {selectedNode.data.label}
            </div>
            {title && <h2 className="article-title">{title}</h2>}
            {content ? (
              <div className="article-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="empty-doc">
                <p>ドキュメントがありません</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('edit')}>
                  ドキュメントを追加
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'edit' && (
          <div id="editTab">
            <div className="process-badge">
              📌 プロセス: {selectedNode.data.label}
            </div>
            
            <div style={{marginBottom: 16}}>
              <input
                type="text"
                className="form-input"
                placeholder="タイトル"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="markdown-toolbar">
              <button className="btn btn-sm" onClick={() => insertMarkdown('# ')}>見出し</button>
              <button className="btn btn-sm" onClick={() => insertMarkdown('**', '**')}>太字</button>
              <button className="btn btn-sm" onClick={() => insertMarkdown('- ')}>リスト</button>
              <button className="btn btn-sm" onClick={() => insertMarkdown('`', '`')}>コード</button>
            </div>

            <textarea
              ref={textareaRef}
              className="form-textarea"
              placeholder="'/' でコマンド表示
画像をペースト可能
Markdown形式で入力..."
              value={content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onPaste={handleImagePaste}
            />

            {showSlashMenu && filteredCommands.length > 0 && (
              <div 
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

            <div style={{display: 'flex', gap: 12, marginTop: 16}}>
              <button className="btn btn-primary" onClick={handleSaveDocument}>💾 保存</button>
              <button className="btn" onClick={() => setActiveTab('view')}>キャンセル</button>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <MetricsTab 
            metrics={metrics}
            onAdd={handleAddMetric}
            onUpdate={setMetrics}
            showModal={showMetricModal}
            setShowModal={setShowMetricModal}
          />
        )}

        {activeTab === 'improvement' && (
          <ImprovementTab 
            improvements={improvements}
            onAdd={handleAddImprovement}
            onUpdate={setImprovements}
            onUpdateStatus={handleUpdateImprovementStatus}
            showModal={showImprovementModal}
            setShowModal={setShowImprovementModal}
          />
        )}

        {activeTab === 'checklist' && (
          <ChecklistTab 
            checklist={checklist}
            onAdd={handleAddChecklistItem}
            onToggle={handleToggleChecklist}
            onUpdate={setChecklist}
            showModal={showChecklistModal}
            setShowModal={setShowChecklistModal}
          />
        )}

        {activeTab === 'risk' && (
          <RiskTab 
            risks={risks}
            onAdd={handleAddRisk}
            onUpdate={setRisks}
            showModal={showRiskModal}
            setShowModal={setShowRiskModal}
          />
        )}
      </div>
    </div>
  );
}

// メトリクスタブ、改善タブ、チェックリストタブ、リスクタブは前回と同じ
// （実装は長いので省略しますが、実際のファイルには全て含める必要があります）

function MetricsTab({ metrics, onAdd, onUpdate, showModal, setShowModal }) {
  const [form, setForm] = useState({ name: '', target: '', current: '', unit: '' });
  const handleSubmit = () => {
    if (form.name && form.target) {
      onAdd(form);
      setForm({ name: '', target: '', current: '', unit: '' });
      setShowModal(false);
    }
  };
  const handleDelete = (id) => {
    if (window.confirm('このメトリクスを削除しますか?')) {
      onUpdate(metrics.filter(m => m.id !== id));
    }
  };
  return (
    <div className="excellence-tab">
      <div className="tab-header">
        <h3>📊 プロセスメトリクス（KPI）</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          ➕ 追加
        </button>
      </div>
      {metrics.length === 0 ? (
        <div className="empty-state-small"><p>メトリクスが登録されていません</p></div>
      ) : (
        <div className="excellence-list">
          {metrics.map(metric => {
            const achievement = metric.current && metric.target 
              ? (parseFloat(metric.current) / parseFloat(metric.target) * 100).toFixed(1)
              : 0;
            return (
              <div key={metric.id} className="excellence-card">
                <div className="card-header">
                  <strong>{metric.name}</strong>
                  <button className="btn-delete-small" onClick={() => handleDelete(metric.id)}>🗑️</button>
                </div>
                <div className="metric-values">
                  <div className="metric-item">
                    <span className="metric-label">目標値:</span>
                    <span className="metric-value">{metric.target}{metric.unit}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">現在値:</span>
                    <span className="metric-value">{metric.current || '-'}{metric.unit}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">達成率:</span>
                    <span className={`metric-achievement ${achievement >= 100 ? 'success' : 'warning'}`}>
                      {achievement}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>メトリクス追加</span>
              <span className="close-modal" onClick={() => setShowModal(false)}>✕</span>
            </div>
            <div className="form-group">
              <label className="form-label">メトリクス名</label>
              <input type="text" className="form-input" placeholder="例: 処理時間" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">目標値</label>
                <input type="number" className="form-input" placeholder="100" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">現在値</label>
                <input type="number" className="form-input" placeholder="85" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
              </div>
              <div className="form-group" style={{flex: 0.5}}>
                <label className="form-label">単位</label>
                <input type="text" className="form-input" placeholder="分" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>キャンセル</button>
              <button className="btn btn-primary" onClick={handleSubmit}>追加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ImprovementTab({ improvements, onAdd, onUpdate, onUpdateStatus, showModal, setShowModal }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', cycle: 'plan' });
  const handleSubmit = () => {
    if (form.title) {
      onAdd(form);
      setForm({ title: '', description: '', priority: 'medium', cycle: 'plan' });
      setShowModal(false);
    }
  };
  const handleDelete = (id) => {
    if (window.confirm('この改善提案を削除しますか?')) {
      onUpdate(improvements.filter(i => i.id !== id));
    }
  };
  const priorityLabels = { high: '高', medium: '中', low: '低' };
  const priorityColors = { high: '#ff4757', medium: '#ffa502', low: '#3498db' };
  return (
    <div className="excellence-tab">
      <div className="tab-header">
        <h3>🔄 改善管理（PDCA）</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>➕ 追加</button>
      </div>
      {improvements.length === 0 ? (
        <div className="empty-state-small"><p>改善提案が登録されていません</p></div>
      ) : (
        <div className="excellence-list">
          {improvements.map(improvement => (
            <div key={improvement.id} className="excellence-card">
              <div className="card-header">
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <strong>{improvement.title}</strong>
                  <span className="priority-badge" style={{background: priorityColors[improvement.priority]}}>{priorityLabels[improvement.priority]}</span>
                </div>
                <button className="btn-delete-small" onClick={() => handleDelete(improvement.id)}>🗑️</button>
              </div>
              {improvement.description && <p className="card-description">{improvement.description}</p>}
              <div className="pdca-cycle">
                <span className="pdca-label">PDCAサイクル:</span>
                <span className="pdca-value">{improvement.cycle.toUpperCase()}</span>
              </div>
              <div className="status-selector">
                <select value={improvement.status} onChange={(e) => onUpdateStatus(improvement.id, e.target.value)} className="form-select-sm">
                  <option value="planned">計画中</option>
                  <option value="doing">実施中</option>
                  <option value="checking">検証中</option>
                  <option value="acting">完了</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>改善提案追加</span>
              <span className="close-modal" onClick={() => setShowModal(false)}>✕</span>
            </div>
            <div className="form-group">
              <label className="form-label">タイトル</label>
              <input type="text" className="form-input" placeholder="例: 処理時間の短縮" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">説明</label>
              <textarea className="form-textarea" placeholder="改善内容の詳細..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="form-row">
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">優先度</label>
                <select className="form-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">PDCAフェーズ</label>
                <select className="form-input" value={form.cycle} onChange={(e) => setForm({ ...form, cycle: e.target.value })}>
                  <option value="plan">Plan（計画）</option>
                  <option value="do">Do（実行）</option>
                  <option value="check">Check（検証）</option>
                  <option value="act">Act（改善）</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>キャンセル</button>
              <button className="btn btn-primary" onClick={handleSubmit}>追加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChecklistTab({ checklist, onAdd, onToggle, onUpdate, showModal, setShowModal }) {
  const [form, setForm] = useState({ title: '', description: '' });
  const handleSubmit = () => {
    if (form.title) {
      onAdd(form);
      setForm({ title: '', description: '' });
      setShowModal(false);
    }
  };
  const handleDelete = (id) => {
    if (window.confirm('このチェック項目を削除しますか?')) {
      onUpdate(checklist.filter(c => c.id !== id));
    }
  };
  const completionRate = checklist.length > 0 ? ((checklist.filter(c => c.checked).length / checklist.length) * 100).toFixed(0) : 0;
  return (
    <div className="excellence-tab">
      <div className="tab-header">
        <div>
          <h3>✅ チェックリスト</h3>
          {checklist.length > 0 && <div className="completion-rate">完了率: {completionRate}% ({checklist.filter(c => c.checked).length}/{checklist.length})</div>}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>➕ 追加</button>
      </div>
      {checklist.length === 0 ? (
        <div className="empty-state-small"><p>チェック項目が登録されていません</p></div>
      ) : (
        <div className="checklist-list">
          {checklist.map(item => (
            <div key={item.id} className="checklist-item">
              <input type="checkbox" checked={item.checked} onChange={() => onToggle(item.id)} className="checklist-checkbox" />
              <div className="checklist-content">
                <strong className={item.checked ? 'checked-text' : ''}>{item.title}</strong>
                {item.description && <p className="checklist-description">{item.description}</p>}
              </div>
              <button className="btn-delete-small" onClick={() => handleDelete(item.id)}>🗑️</button>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>チェック項目追加</span>
              <span className="close-modal" onClick={() => setShowModal(false)}>✕</span>
            </div>
            <div className="form-group">
              <label className="form-label">項目名</label>
              <input type="text" className="form-input" placeholder="例: マニュアルの確認" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">説明（オプション）</label>
              <textarea className="form-textarea" placeholder="チェック項目の詳細..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>キャンセル</button>
              <button className="btn btn-primary" onClick={handleSubmit}>追加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RiskTab({ risks, onAdd, onUpdate, showModal, setShowModal }) {
  const [form, setForm] = useState({ title: '', description: '', level: 'medium', mitigation: '' });
  const handleSubmit = () => {
    if (form.title) {
      onAdd(form);
      setForm({ title: '', description: '', level: 'medium', mitigation: '' });
      setShowModal(false);
    }
  };
  const handleDelete = (id) => {
    if (window.confirm('このリスクを削除しますか?')) {
      onUpdate(risks.filter(r => r.id !== id));
    }
  };
  const levelLabels = { high: '高', medium: '中', low: '低' };
  const levelColors = { high: '#ff4757', medium: '#ffa502', low: '#2ecc71' };
  return (
    <div className="excellence-tab">
      <div className="tab-header">
        <h3>⚠️ リスク管理</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>➕ 追加</button>
      </div>
      {risks.length === 0 ? (
        <div className="empty-state-small"><p>リスクが登録されていません</p></div>
      ) : (
        <div className="excellence-list">
          {risks.map(risk => (
            <div key={risk.id} className="excellence-card">
              <div className="card-header">
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <strong>{risk.title}</strong>
                  <span className="risk-level-badge" style={{background: levelColors[risk.level]}}>{levelLabels[risk.level]}</span>
                </div>
                <button className="btn-delete-small" onClick={() => handleDelete(risk.id)}>🗑️</button>
              </div>
              {risk.description && <p className="card-description">{risk.description}</p>}
              {risk.mitigation && <div className="mitigation"><strong>対応策:</strong> {risk.mitigation}</div>}
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>リスク追加</span>
              <span className="close-modal" onClick={() => setShowModal(false)}>✕</span>
            </div>
            <div className="form-group">
              <label className="form-label">リスク名</label>
              <input type="text" className="form-input" placeholder="例: システム障害" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">説明</label>
              <textarea className="form-textarea" placeholder="リスクの詳細..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="form-group">
              <label className="form-label">リスクレベル</label>
              <select className="form-input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">対応策</label>
              <textarea className="form-textarea" placeholder="対応策・軽減策..." value={form.mitigation} onChange={(e) => setForm({ ...form, mitigation: e.target.value })} rows={2} />
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>キャンセル</button>
              <button className="btn btn-primary" onClick={handleSubmit}>追加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RightPanel;
