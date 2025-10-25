import React from 'react';
import './ConnectionTable.css';

function ConnectionTable({ nodes, connections, onConnectionsUpdate }) {
  const handleAddConnection = () => {
    const newConnection = {
      id: Date.now().toString(),
      from: '',
      to: '',
      condition: ''
    };
    onConnectionsUpdate([...connections, newConnection]);
  };

  const handleUpdateConnection = (id, field, value) => {
    const updated = connections.map(conn =>
      conn.id === id ? { ...conn, [field]: value } : conn
    );
    onConnectionsUpdate(updated);
  };

  const handleDeleteConnection = (id) => {
    const updated = connections.filter(conn => conn.id !== id);
    onConnectionsUpdate(updated);
  };

  const getNodeLabel = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.data.label : '';
  };

  return (
    <div className="connection-table-container">
      <div className="table-header">
        <h3>📋 接続テーブル</h3>
        <button className="btn btn-sm" onClick={handleAddConnection}>
          ➕ 接続を追加
        </button>
      </div>
      
      <div className="table-wrapper">
        <table className="connection-table">
          <thead>
            <tr>
              <th style={{width: '50px'}}>#</th>
              <th>開始プロセス</th>
              <th style={{width: '50px', textAlign: 'center'}}>→</th>
              <th>終了プロセス</th>
              <th>条件</th>
              <th style={{width: '80px'}}>操作</th>
            </tr>
          </thead>
          <tbody>
            {connections.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row">
                  接続がありません。「➕ 接続を追加」ボタンで追加してください。
                </td>
              </tr>
            ) : (
              connections.map((conn, index) => (
                <tr key={conn.id}>
                  <td className="index-cell">{index + 1}</td>
                  <td>
                    <select
                      className="table-select"
                      value={conn.from}
                      onChange={(e) => handleUpdateConnection(conn.id, 'from', e.target.value)}
                    >
                      <option value="">選択してください</option>
                      {nodes.map(node => (
                        <option key={node.id} value={node.id}>
                          {node.data.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="arrow-cell">→</td>
                  <td>
                    <select
                      className="table-select"
                      value={conn.to}
                      onChange={(e) => handleUpdateConnection(conn.id, 'to', e.target.value)}
                    >
                      <option value="">選択してください</option>
                      {nodes.map(node => (
                        <option key={node.id} value={node.id}>
                          {node.data.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="table-input"
                      placeholder="例: はい/いいえ"
                      value={conn.condition}
                      onChange={(e) => handleUpdateConnection(conn.id, 'condition', e.target.value)}
                    />
                  </td>
                  <td>
                    <button
                      className="btn-delete-sm"
                      onClick={() => handleDeleteConnection(conn.id)}
                      title="削除"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-hint">
        💡 ヒント: 接続を追加・編集すると、自動的にフローチャートに反映されます
      </div>
    </div>
  );
}

export default ConnectionTable;
