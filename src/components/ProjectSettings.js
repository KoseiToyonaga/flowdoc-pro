import React, { useState } from 'react';
import './ProjectSettings.css';

function ProjectSettings({ project, onSave, onClose }) {
  const [statuses, setStatuses] = useState(project.statuses || []);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#3498db');

  const handleAddStatus = () => {
    if (!newStatusName.trim()) return;

    const newStatus = {
      id: 'status-' + Date.now(),
      name: newStatusName.trim(),
      color: newStatusColor
    };

    setStatuses([...statuses, newStatus]);
    setNewStatusName('');
    setNewStatusColor('#3498db');
  };

  const handleDeleteStatus = (statusId) => {
    if (statuses.length <= 1) {
      alert('最低1つのステータスは必要です');
      return;
    }
    setStatuses(statuses.filter(s => s.id !== statusId));
  };

  const handleUpdateStatus = (statusId, field, value) => {
    setStatuses(statuses.map(s => 
      s.id === statusId ? { ...s, [field]: value } : s
    ));
  };

  const handleSave = () => {
    if (statuses.length === 0) {
      alert('最低1つのステータスを設定してください');
      return;
    }
    onSave({ statuses });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content project-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>⚙️ プロジェクト設定: {project.name}</span>
          <span className="close-modal" onClick={onClose}>✕</span>
        </div>

        <div className="settings-section">
          <h3>ステータス設定</h3>
          <p className="settings-description">
            フローやプロセスのステータスを管理します。kintoneのプロセス管理のように、
            作成中→レビュー中→公開のようなワークフローを設定できます。
          </p>

          <div className="status-list">
            {statuses.map((status, index) => (
              <div key={status.id} className="status-item">
                <div className="status-order">{index + 1}</div>
                <div 
                  className="status-color-preview"
                  style={{background: status.color}}
                ></div>
                <input
                  type="text"
                  className="status-name-input"
                  value={status.name}
                  onChange={(e) => handleUpdateStatus(status.id, 'name', e.target.value)}
                  placeholder="ステータス名"
                />
                <input
                  type="color"
                  className="status-color-input"
                  value={status.color}
                  onChange={(e) => handleUpdateStatus(status.id, 'color', e.target.value)}
                />
                <button 
                  className="btn-delete-status"
                  onClick={() => handleDeleteStatus(status.id)}
                  disabled={statuses.length <= 1}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <div className="add-status-form">
            <input
              type="text"
              className="form-input"
              placeholder="新しいステータス名"
              value={newStatusName}
              onChange={(e) => setNewStatusName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStatus()}
            />
            <input
              type="color"
              className="status-color-input-large"
              value={newStatusColor}
              onChange={(e) => setNewStatusColor(e.target.value)}
            />
            <button 
              className="btn btn-secondary"
              onClick={handleAddStatus}
            >
              ➕ 追加
            </button>
          </div>
        </div>

        <div className="settings-info">
          <h4>💡 ステータスの使い方</h4>
          <ul>
            <li>各フローやプロセスにステータスを設定できます</li>
            <li>ステータスは上から順番に進行します</li>
            <li>色分けで視覚的に管理できます</li>
            <li>チーム全体でステータスを統一できます</li>
          </ul>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>キャンセル</button>
          <button className="btn btn-primary" onClick={handleSave}>💾 保存</button>
        </div>
      </div>
    </div>
  );
}

export default ProjectSettings;
