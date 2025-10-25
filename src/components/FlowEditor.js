import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './FlowEditor.css';
import ConnectionTable from './ConnectionTable';

function FlowEditor({ project, flow, onSave, onCreateSubFlow, onSelectNode }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(flow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow?.edges || []);
  const [connections, setConnections] = useState(flow?.connections || []);
  const [showTable, setShowTable] = useState(false);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [nodeForm, setNodeForm] = useState({ 
    title: '', 
    description: '',
    color: '#667eea',
    shape: 'default',
    hasSubFlow: false,
    subFlowId: null
  });

  useEffect(() => {
    if (flow) {
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
      setConnections(flow.connections || []);
    }
  }, [flow?.id, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#667eea',
        },
        style: { stroke: '#667eea', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      
      const newConnection = {
        id: Date.now().toString(),
        from: params.source,
        to: params.target,
        condition: ''
      };
      setConnections([...connections, newConnection]);
      
      // 自動保存
      autoSave({ nodes, edges: [...edges, newEdge] }, [...connections, newConnection]);
    },
    [setEdges, connections, nodes, edges]
  );

  const getNodeStyle = (shape, color) => {
    const baseStyle = {
      background: color,
      color: 'white',
      border: 'none',
    };

    switch (shape) {
      case 'rounded':
        return { ...baseStyle, borderRadius: '20px' };
      case 'diamond':
        return { ...baseStyle, borderRadius: '4px', transform: 'rotate(45deg)' };
      case 'circle':
        return { ...baseStyle, borderRadius: '50%', width: '100px', height: '100px' };
      case 'parallelogram':
        return { ...baseStyle, borderRadius: '4px', transform: 'skewX(-20deg)' };
      default:
        return { ...baseStyle, borderRadius: '6px' };
    }
  };

  const autoSave = (flowData, connectionsData) => {
    if (flow) {
      onSave(flow.id, flowData, connectionsData || connections);
    }
  };

  const handleAddNode = () => {
    const newNodeId = `node-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: 'default',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { 
        label: nodeForm.title || '新しいプロセス',
        description: nodeForm.description || '',
        color: nodeForm.color || '#667eea',
        shape: nodeForm.shape || 'default',
        hasSubFlow: nodeForm.hasSubFlow,
        subFlowId: null,
        document: {
          id: `doc-${Date.now()}`,
          title: '',
          content: ''
        },
        metrics: [],
        improvements: [],
        checklist: [],
        risks: []
      },
      style: getNodeStyle(nodeForm.shape || 'default', nodeForm.color || '#667eea')
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    setNodeForm({ title: '', description: '', color: '#667eea', shape: 'default', hasSubFlow: false, subFlowId: null });
    setShowNodeModal(false);

    // 自動保存
    autoSave({ nodes: updatedNodes, edges }, connections);

    // サブフローを作成する場合
    if (nodeForm.hasSubFlow && flow) {
      setTimeout(() => {
        const subFlowId = onCreateSubFlow(flow.id, nodeForm.title + ' 詳細');
        setNodes((nds) => 
          nds.map(n => 
            n.id === newNodeId 
              ? { ...n, data: { ...n.data, subFlowId } }
              : n
          )
        );
      }, 100);
    }
  };

  const handleSave = () => {
    autoSave({ nodes, edges }, connections);
    alert('保存しました');
  };

  const onNodeClick = (event, node) => {
    // 右パネルに表示するためにコールバック
    onSelectNode(node);
  };

  const handleConnectionsUpdate = (updatedConnections) => {
    setConnections(updatedConnections);
    
    const newEdges = updatedConnections
      .filter(conn => conn.from && conn.to)
      .map(conn => ({
        id: `e${conn.from}-${conn.to}`,
        source: conn.from,
        target: conn.to,
        label: conn.condition,
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#667eea',
        },
        style: { stroke: '#667eea', strokeWidth: 2 },
        labelStyle: { fill: '#667eea', fontWeight: 600, fontSize: 12 },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
      }));
    
    setEdges(newEdges);
    
    // 自動保存
    autoSave({ nodes, edges: newEdges }, updatedConnections);
  };

  if (!flow) {
    return (
      <div className="flow-editor">
        <div className="empty-panel">
          <p>フローを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flow-editor">
      <div className="editor-toolbar">
        <div className="panel-title">📊 {flow.name}</div>
        <div className="toolbar-actions">
          <button 
            className={`btn btn-sm ${showTable ? 'btn-active' : ''}`}
            onClick={() => setShowTable(!showTable)}
          >
            📋 接続テーブル
          </button>
          <button 
            className="btn btn-sm" 
            onClick={() => {
              setNodeForm({ title: '', description: '', color: '#667eea', shape: 'default', hasSubFlow: false, subFlowId: null });
              setShowNodeModal(true);
            }}
          >
            ➕ プロセス追加
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>
            💾 保存
          </button>
        </div>
      </div>

      {showTable && (
        <ConnectionTable
          nodes={nodes}
          connections={connections}
          onConnectionsUpdate={handleConnectionsUpdate}
        />
      )}

      <div className="flow-content-wrapper">
        <div className="flow-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>

      {showNodeModal && (
        <div className="modal-overlay" onClick={() => setShowNodeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>➕ プロセス追加</span>
              <span className="close-modal" onClick={() => setShowNodeModal(false)}>✕</span>
            </div>
            
            <div className="form-group">
              <label className="form-label">プロセス名</label>
              <input
                type="text"
                className="form-input"
                placeholder="例: 在庫確認"
                value={nodeForm.title}
                onChange={(e) => setNodeForm({ ...nodeForm, title: e.target.value })}
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">説明</label>
              <textarea
                className="form-textarea"
                placeholder="プロセスの説明を入力..."
                value={nodeForm.description}
                onChange={(e) => setNodeForm({ ...nodeForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">色</label>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    className="color-input"
                    value={nodeForm.color}
                    onChange={(e) => setNodeForm({ ...nodeForm, color: e.target.value })}
                  />
                  <span className="color-value">{nodeForm.color}</span>
                </div>
              </div>

              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">形状</label>
                <select
                  className="form-input"
                  value={nodeForm.shape}
                  onChange={(e) => setNodeForm({ ...nodeForm, shape: e.target.value })}
                >
                  <option value="default">四角形</option>
                  <option value="rounded">角丸四角形</option>
                  <option value="circle">円形</option>
                  <option value="diamond">菱形</option>
                  <option value="parallelogram">平行四辺形</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={nodeForm.hasSubFlow}
                  onChange={(e) => setNodeForm({ ...nodeForm, hasSubFlow: e.target.checked })}
                />
                <span>このプロセスにサブフローを作成する</span>
              </label>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn" 
                onClick={() => {
                  setShowNodeModal(false);
                  setNodeForm({ title: '', description: '', color: '#667eea', shape: 'default', hasSubFlow: false, subFlowId: null });
                }}
              >
                キャンセル
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleAddNode}
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlowEditor;
