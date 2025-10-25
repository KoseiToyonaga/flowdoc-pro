import React, { useState, useEffect } from 'react';
import './GlossaryManager.css';

function GlossaryManager({ glossary = [], onUpdate, onClose }) {
  const [terms, setTerms] = useState(glossary);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ term: '', description: '' });

  useEffect(() => {
    setTerms(glossary);
  }, [glossary]);

  const handleAddTerm = () => {
    if (formData.term.trim() && formData.description.trim()) {
      const newTerm = {
        id: `glossary-${Date.now()}`,
        term: formData.term,
        description: formData.description,
        createdAt: new Date().toISOString()
      };

      if (editingId) {
        const updatedTerms = terms.map(t => 
          t.id === editingId ? { ...t, ...formData } : t
        );
        setTerms(updatedTerms);
        onUpdate(updatedTerms);
        setEditingId(null);
      } else {
        const updatedTerms = [...terms, newTerm];
        setTerms(updatedTerms);
        onUpdate(updatedTerms);
      }

      setFormData({ term: '', description: '' });
      setShowAddForm(false);
    }
  };

  const handleEditTerm = (term) => {
    setFormData({ term: term.term, description: term.description });
    setEditingId(term.id);
    setShowAddForm(true);
  };

  const handleDeleteTerm = (id) => {
    if (window.confirm('この用語を削除しますか？')) {
      const updatedTerms = terms.filter(t => t.id !== id);
      setTerms(updatedTerms);
      onUpdate(updatedTerms);
    }
  };

  const handleCancel = () => {
    setFormData({ term: '', description: '' });
    setEditingId(null);
    setShowAddForm(false);
  };

  const filteredTerms = terms.filter(term =>
    term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    term.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="glossary-manager-modal">
      <div className="glossary-overlay" onClick={onClose}></div>
      <div className="glossary-modal-content">
        <div className="glossary-header">
          <h2>📚 用語集管理</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="glossary-body">
          {/* 検索バー */}
          <div className="glossary-search-bar">
            <input
              type="text"
              placeholder="用語を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <span className="term-count">全 {terms.length} 件</span>
          </div>

          {/* 用語フォーム */}
          {!showAddForm ? (
            <button 
              className="btn-add-term"
              onClick={() => {
                setShowAddForm(true);
                setEditingId(null);
                setFormData({ term: '', description: '' });
              }}
            >
              ➕ 新しい用語を追加
            </button>
          ) : (
            <div className="term-form">
              <div className="form-group">
                <label>用語名 *</label>
                <input
                  type="text"
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  placeholder="例: API"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>説明 *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="用語の説明を入力してください..."
                  rows={4}
                />
              </div>

              <div className="form-actions">
                <button className="btn-cancel" onClick={handleCancel}>
                  キャンセル
                </button>
                <button 
                  className="btn-save"
                  onClick={handleAddTerm}
                  disabled={!formData.term.trim() || !formData.description.trim()}
                >
                  {editingId ? '更新' : '追加'}
                </button>
              </div>
            </div>
          )}

          {/* 用語リスト */}
          <div className="glossary-list">
            {filteredTerms.length > 0 ? (
              filteredTerms.map(term => (
                <div key={term.id} className="glossary-item">
                  <div className="item-content">
                    <h3 className="item-term">{term.term}</h3>
                    <p className="item-description">{term.description}</p>
                    {term.createdAt && (
                      <span className="item-date">
                        {new Date(term.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </div>

                  <div className="item-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditTerm(term)}
                      title="編集"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteTerm(term.id)}
                      title="削除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-terms">
                <p>用語が見つかりません</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlossaryManager;
