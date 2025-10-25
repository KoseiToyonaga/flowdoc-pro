import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar({ 
  projects, 
  currentProject, 
  currentFlow,
  collapsed, 
  onCreateProject, 
  onSelectProject, 
  onSelectFlow,
  onCreateSubFlow,
  onDeleteFlow,
  onDeleteProject,
  onOpenSettings
}) {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [flowName, setFlowName] = useState('');
  const [parentFlowId, setParentFlowId] = useState(null);
  const [expandedFlows, setExpandedFlows] = useState({});

  const handleCreateProject = () => {
    if (projectName.trim()) {
      onCreateProject(projectName.trim(), projectDesc.trim());
      setProjectName('');
      setProjectDesc('');
      setShowProjectModal(false);
    }
  };

  const handleCreateFlow = () => {
    if (flowName.trim() && parentFlowId) {
      onCreateSubFlow(parentFlowId, flowName.trim());
      setFlowName('');
      setParentFlowId(null);
      setShowFlowModal(false);
    }
  };

  const handleDeleteProject = (e, projectId) => {
    e.stopPropagation();
    if (window.confirm('このプロジェクトを削除しますか?')) {
      onDeleteProject(projectId);
    }
  };

  const handleDeleteFlow = (e, flowId) => {
    e.stopPropagation();
    if (window.confirm('このフローとサブフローをすべて削除しますか?')) {
      onDeleteFlow(flowId);
    }
  };

  const toggleExpand = (e, flowId) => {
    e.stopPropagation();
    setExpandedFlows(prev => ({
      ...prev,
      [flowId]: !prev[flowId]
    }));
  };

  const openCreateFlowModal = (e, parentId) => {
    e.stopPropagation();
    setParentFlowId(parentId);
    setShowFlowModal(true);
  };

  const handleOpenSettings = (e, project) => {
    e.stopPropagation();
    onSelectProject(project);
    onOpenSettings();
  };

  const renderFlowTree = (flows, parentId = null, level = 0) => {
    const childFlows = flows.filter(f => f.parentId === parentId);
    
    return childFlows.map(flow => {
      const hasChildren = flows.some(f => f.parentId === flow.id);
      const isExpanded = expandedFlows[flow.id];
      const isActive = currentFlow?.id === flow.id;

      return (
        <div key={flow.id} className="flow-tree-item">
          <div
            className={`flow-item ${isActive ? 'active' : ''}`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
            onClick={() => onSelectFlow(flow)}
          >
            {hasChildren && (
              <span 
                className="expand-icon"
                onClick={(e) => toggleExpand(e, flow.id)}
              >
                {isExpanded ? '▼' : '▶'}
              </span>
            )}
            {!hasChildren && <span className="expand-icon-placeholder"></span>}
            
            <span className="flow-icon">📊</span>
            <span className="flow-name">{flow.name}</span>
            
            <div className="flow-actions">
              <button
                className="flow-action-btn"
                onClick={(e) => openCreateFlowModal(e, flow.id)}
                title="サブフロー追加"
              >
                ➕
              </button>
              {parentId !== null && (
                <button
                  className="flow-action-btn delete"
                  onClick={(e) => handleDeleteFlow(e, flow.id)}
                  title="削除"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div className="flow-children">
              {renderFlowTree(flows, flow.id, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-section">
          <div className="sidebar-title">プロジェクト</div>
          <div className="sidebar-list">
            {projects.map(project => (
              <div key={project.id}>
                <div
                  className={`sidebar-item ${currentProject?.id === project.id ? 'active' : ''}`}
                  onClick={() => onSelectProject(project)}
                >
                  <span className="sidebar-item-name">{project.name}</span>
                  <div className="sidebar-item-actions">
                    <button
                      className="sidebar-item-settings"
                      onClick={(e) => handleOpenSettings(e, project)}
                      title="プロジェクト設定"
                    >
                      ⚙️
                    </button>
                    <button
                      className="sidebar-item-delete"
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      title="削除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {currentProject?.id === project.id && project.flows && (
                  <div className="flow-tree">
                    {renderFlowTree(project.flows)}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="btn btn-add" onClick={() => setShowProjectModal(true)}>
            ➕ 新規プロジェクト
          </button>
        </div>
      </div>

      {showProjectModal && (
        <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>➕ 新しいプロジェクト</span>
              <span className="close-modal" onClick={() => setShowProjectModal(false)}>✕</span>
            </div>
            
            <div className="form-group">
              <label className="form-label">プロジェクト名</label>
              <input
                type="text"
                className="form-input"
                placeholder="例: 受注業務フロー"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">説明（オプション）</label>
              <textarea
                className="form-textarea"
                placeholder="プロジェクトの説明を入力..."
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowProjectModal(false)}>
                キャンセル
              </button>
              <button className="btn btn-primary" onClick={handleCreateProject}>
                作成
              </button>
            </div>
          </div>
        </div>
      )}

      {showFlowModal && (
        <div className="modal-overlay" onClick={() => setShowFlowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>➕ サブフロー追加</span>
              <span className="close-modal" onClick={() => setShowFlowModal(false)}>✕</span>
            </div>
            
            <div className="form-group">
              <label className="form-label">フロー名</label>
              <input
                type="text"
                className="form-input"
                placeholder="例: 在庫確認詳細"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFlow()}
                autoFocus
              />
            </div>
            
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowFlowModal(false)}>
                キャンセル
              </button>
              <button className="btn btn-primary" onClick={handleCreateFlow}>
                作成
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
