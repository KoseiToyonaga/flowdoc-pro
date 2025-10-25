import React, { useState } from 'react';
import './ProcessDetailPanel.css';
import ProcessDocument from './ProcessDocument';

function ProcessDetailPanel({ node, onUpdate, onDelete, onClose, onUpdateDocument }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'document'
  const [formData, setFormData] = useState({
    title: node.data.label || '',
    description: node.data.description || '',
    color: node.data.color || '#667eea',
    shape: node.data.shape || 'default',
    hasSubFlow: node.data.hasSubFlow || false
  });

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('このプロセスを削除しますか?')) {
      onDelete(node.id);
    }
  };

  return (
    <div className="process-detail-panel">
      <div className="detail-header">
        <h3>プロセス詳細</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="detail-tabs">
        <div 
          className={`detail-tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          情報
        </div>
        <div 
          className={`detail-tab ${activeTab === 'document' ? 'active' : ''}`}
          onClick={() => setActiveTab('document')}
        >
          ドキュメント
        </div>
      </div>

      <div className="detail-content">
        {activeTab === 'info' && (
          <>
            {!isEditing ? (
              <>
                <div className="detail-section">
                  <div className="detail-label">プロセス名</div>
                  <div className="detail-value">{node.data.label}</div>
                </div>

                <div className="detail-section">
                  <div className="detail-label">説明</div>
                  <div className="detail-value description">
                    {node.data.description || '説明がありません'}
                  </div>
                </div>

                <div className="detail-section">
                  <div className="detail-label">色</div>
                  <div className="color-display">
                    <div 
                      className="color-box" 
                      style={{backgroundColor: node.data.color || '#667eea'}}
                    ></div>
                    <span>{node.data.color || '#667eea'}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <div className="detail-label">形状</div>
                  <div className="detail-value">
                    {node.data.shape === 'rounded' ? '角丸四角形' : 
                     node.data.shape === 'circle' ? '円形' :
                     node.data.shape === 'diamond' ? '菱形' :
                     node.data.shape === 'parallelogram' ? '平行四辺形' : '四角形'}
                  </div>
                </div>

                {node.data.subFlowId && (
                  <div className="detail-section">
                    <div className="detail-label">サブフロー</div>
                    <div className="detail-value">
                      <span className="badge-success">✓ 紐づいています</span>
                    </div>
                  </div>
                )}

                <div className="detail-actions">
                  <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                    ✏️ 編集
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete}>
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
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">説明</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">色</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      className="color-input"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                    <span className="color-value">{formData.color}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">形状</label>
                  <select
                    className="form-input"
                    value={formData.shape}
                    onChange={(e) => setFormData({ ...formData, shape: e.target.value })}
                  >
                    <option value="default">四角形</option>
                    <option value="rounded">角丸四角形</option>
                    <option value="circle">円形</option>
                    <option value="diamond">菱形</option>
                    <option value="parallelogram">平行四辺形</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.hasSubFlow}
                      onChange={(e) => setFormData({ ...formData, hasSubFlow: e.target.checked })}
                      disabled={node.data.subFlowId} // 既にサブフローがある場合は無効
                    />
                    <span>
                      {node.data.subFlowId ? 'サブフローが作成済み' : 'サブフローを作成する'}
                    </span>
                  </label>
                </div>

                <div className="detail-actions">
                  <button className="btn" onClick={() => setIsEditing(false)}>
                    キャンセル
                  </button>
                  <button className="btn btn-primary" onClick={handleSave}>
                    💾 保存
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'document' && (
          <ProcessDocument
            node={node}
            onUpdateDocument={onUpdateDocument}
          />
        )}
      </div>
    </div>
  );
}

export default ProcessDetailPanel;
