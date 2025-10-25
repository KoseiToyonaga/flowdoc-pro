import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import FlowEditor from './components/FlowEditor';
import RightPanel from './components/RightPanel';
import Breadcrumb from './components/Breadcrumb';
import ProjectSettings from './components/ProjectSettings';
import HelpPage from './components/HelpPage';
import { loadProjects, saveProjects } from './utils/storage';

function App() {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentFlow, setCurrentFlow] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [flowPath, setFlowPath] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [documentPanelWidth, setDocumentPanelWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const loadedProjects = loadProjects();
    setProjects(loadedProjects);
    if (loadedProjects.length > 0) {
      setCurrentProject(loadedProjects[0]);
      if (loadedProjects[0].flows && loadedProjects[0].flows.length > 0) {
        setCurrentFlow(loadedProjects[0].flows[0]);
        setFlowPath([loadedProjects[0].flows[0]]);
      }
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setDocumentPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleCreateProject = (name, description) => {
    const defaultStatuses = [
      { id: 'draft', name: '作成中', color: '#95a5a6' },
      { id: 'review', name: 'レビュー中', color: '#f39c12' },
      { id: 'published', name: '公開', color: '#27ae60' }
    ];

    const rootFlow = {
      id: 'flow-' + Date.now(),
      name: 'メインフロー',
      parentId: null,
      status: 'draft',
      nodes: [
        {
          id: 'start-1',
          type: 'default',
          position: { x: 250, y: 50 },
          data: { 
            label: '開始', 
            description: '',
            color: '#667eea',
            shape: 'rounded',
            hasSubFlow: false,
            subFlowId: null,
            status: 'draft',
            document: {
              id: 'doc-' + Date.now(),
              title: '',
              content: '',
              images: []
            },
            metrics: [],
            improvements: [],
            checklist: [],
            risks: []
          },
          style: {
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
          }
        }
      ],
      edges: [],
      connections: []
    };

    const newProject = {
      id: Date.now().toString(),
      name,
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      statuses: defaultStatuses,
      flows: [rootFlow]
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    setCurrentProject(newProject);
    setCurrentFlow(rootFlow);
    setFlowPath([rootFlow]);
    saveProjects(updatedProjects);
  };

  const handleSelectProject = (project) => {
    setCurrentProject(project);
    setSelectedNode(null);
    if (project.flows && project.flows.length > 0) {
      setCurrentFlow(project.flows[0]);
      setFlowPath([project.flows[0]]);
    }
  };

  const handleSelectFlow = (flow) => {
    setCurrentFlow(flow);
    setSelectedNode(null);
    const path = buildFlowPath(flow);
    setFlowPath(path);
  };

  const buildFlowPath = (targetFlow) => {
    if (!currentProject || !targetFlow) return [];
    
    const path = [];
    let currentFlowItem = targetFlow;
    
    while (currentFlowItem) {
      path.unshift(currentFlowItem);
      if (!currentFlowItem.parentId) break;
      currentFlowItem = currentProject.flows.find(f => f.id === currentFlowItem.parentId);
    }
    
    return path;
  };

  const handleCreateSubFlow = (parentFlowId, name) => {
    if (!currentProject) return null;

    const newFlowId = 'flow-' + Date.now();
    const newFlow = {
      id: newFlowId,
      name: name,
      parentId: parentFlowId,
      status: 'draft',
      nodes: [
        {
          id: 'start-' + Date.now(),
          type: 'default',
          position: { x: 250, y: 50 },
          data: { 
            label: '開始', 
            description: '',
            color: '#667eea',
            shape: 'rounded',
            hasSubFlow: false,
            subFlowId: null,
            status: 'draft',
            document: {
              id: 'doc-' + Date.now(),
              title: '',
              content: '',
              images: []
            },
            metrics: [],
            improvements: [],
            checklist: [],
            risks: []
          },
          style: {
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
          }
        }
      ],
      edges: [],
      connections: []
    };

    const updatedProject = {
      ...currentProject,
      flows: [...currentProject.flows, newFlow],
      updatedAt: new Date().toISOString(),
      version: incrementVersion(currentProject.version, 'minor')
    };

    updateProject(updatedProject);
    return newFlowId;
  };

  const handleUpdateFlow = (flowId, updates) => {
    if (!currentProject) return;

    const updatedFlows = currentProject.flows.map(flow =>
      flow.id === flowId ? { ...flow, ...updates } : flow
    );

    const updatedProject = {
      ...currentProject,
      flows: updatedFlows,
      updatedAt: new Date().toISOString(),
      version: incrementVersion(currentProject.version, 'patch')
    };

    updateProject(updatedProject);
    
    if (currentFlow && currentFlow.id === flowId) {
      const updatedCurrentFlow = { ...currentFlow, ...updates };
      setCurrentFlow(updatedCurrentFlow);
      
      // 選択中のノードを更新
      if (selectedNode && updates.nodes) {
        const updatedNode = updates.nodes.find(n => n.id === selectedNode.id);
        if (updatedNode) {
          setSelectedNode(updatedNode);
        }
      }
    }
  };

  const handleDeleteFlow = (flowId) => {
    if (!currentProject) return;

    const flowsToDelete = [flowId];
    const collectChildFlows = (parentId) => {
      currentProject.flows.forEach(flow => {
        if (flow.parentId === parentId) {
          flowsToDelete.push(flow.id);
          collectChildFlows(flow.id);
        }
      });
    };
    collectChildFlows(flowId);

    const updatedFlows = currentProject.flows.filter(
      flow => !flowsToDelete.includes(flow.id)
    );

    const updatedProject = {
      ...currentProject,
      flows: updatedFlows,
      updatedAt: new Date().toISOString()
    };

    updateProject(updatedProject);

    if (currentFlow && flowsToDelete.includes(currentFlow.id)) {
      const rootFlow = updatedFlows.find(f => !f.parentId);
      if (rootFlow) {
        setCurrentFlow(rootFlow);
        setFlowPath([rootFlow]);
        setSelectedNode(null);
      }
    }
  };

  const handleSaveFlowData = (flowId, flowData, connections) => {
    handleUpdateFlow(flowId, {
      nodes: flowData.nodes,
      edges: flowData.edges,
      connections: connections
    });
  };

  const handleUpdateNode = (updatedData) => {
    if (!selectedNode || !currentFlow) return;

    const updatedNodes = currentFlow.nodes.map((node) => {
      if (node.id === selectedNode.id) {
        const getNodeStyle = (shape, color) => {
          const baseStyle = { background: color, color: 'white', border: 'none' };
          switch (shape) {
            case 'rounded': return { ...baseStyle, borderRadius: '20px' };
            case 'diamond': return { ...baseStyle, borderRadius: '4px', transform: 'rotate(45deg)' };
            case 'circle': return { ...baseStyle, borderRadius: '50%', width: '100px', height: '100px' };
            case 'parallelogram': return { ...baseStyle, borderRadius: '4px', transform: 'skewX(-20deg)' };
            default: return { ...baseStyle, borderRadius: '6px' };
          }
        };

        return {
          ...node,
          data: {
            ...node.data,
            label: updatedData.title,
            description: updatedData.description,
            color: updatedData.color,
            shape: updatedData.shape,
            hasSubFlow: updatedData.hasSubFlow
          },
          style: getNodeStyle(updatedData.shape, updatedData.color)
        };
      }
      return node;
    });

    handleSaveFlowData(currentFlow.id, { nodes: updatedNodes, edges: currentFlow.edges }, currentFlow.connections);

    const updatedNode = updatedNodes.find(n => n.id === selectedNode.id);
    setSelectedNode(updatedNode);
  };

  const handleDeleteNode = (nodeId) => {
    if (!currentFlow) return;

    // ノードに紐づくサブフローを取得
    const node = currentFlow.nodes.find(n => n.id === nodeId);
    
    if (node && node.data.subFlowId) {
      // サブフローを削除
      handleDeleteFlow(node.data.subFlowId);
    }

    const updatedNodes = currentFlow.nodes.filter((node) => node.id !== nodeId);
    const updatedEdges = currentFlow.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
    const updatedConnections = currentFlow.connections.filter((conn) => conn.from !== nodeId && conn.to !== nodeId);

    handleSaveFlowData(currentFlow.id, { nodes: updatedNodes, edges: updatedEdges }, updatedConnections);
    setSelectedNode(null);
  };

  const handleUpdateProjectSettings = (settings) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      statuses: settings.statuses,
      updatedAt: new Date().toISOString()
    };

    updateProject(updatedProject);
    setShowProjectSettings(false);
  };

  const updateProject = (updatedProject) => {
    const updatedProjects = projects.map(p =>
      p.id === updatedProject.id ? updatedProject : p
    );
    setProjects(updatedProjects);
    setCurrentProject(updatedProject);
    saveProjects(updatedProjects);
  };

  const handleDeleteProject = (projectId) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    
    if (currentProject && currentProject.id === projectId) {
      if (updatedProjects.length > 0) {
        setCurrentProject(updatedProjects[0]);
        if (updatedProjects[0].flows && updatedProjects[0].flows.length > 0) {
          setCurrentFlow(updatedProjects[0].flows[0]);
          setFlowPath([updatedProjects[0].flows[0]]);
        }
      } else {
        setCurrentProject(null);
        setCurrentFlow(null);
        setFlowPath([]);
      }
      setSelectedNode(null);
    }
    
    saveProjects(updatedProjects);
  };

  const incrementVersion = (version, type) => {
    const [major, minor, patch] = version.split('.').map(Number);
    
    switch(type) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      default:
        return version;
    }
  };

  return (
    <div className="App">
      <header className="header">
        <button 
          className="sidebar-toggle" 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          ☰
        </button>
        <div className="logo">📊 FlowDoc Pro</div>
        {currentProject && (
          <div className="project-info">
            <span>{currentProject.name}</span>
            <span className="version">v{currentProject.version}</span>
          </div>
        )}
        <div className="header-icons">
          <button className="icon-btn" onClick={() => setShowHelp(true)} title="ヘルプ">❓</button>
          <button className="icon-btn" title="ユーザー">👤</button>
          <button className="icon-btn" title="設定">⚙️</button>
        </div>
      </header>

      <main className="container">
        <Sidebar
          projects={projects}
          currentProject={currentProject}
          currentFlow={currentFlow}
          collapsed={sidebarCollapsed}
          onCreateProject={handleCreateProject}
          onSelectProject={handleSelectProject}
          onSelectFlow={handleSelectFlow}
          onCreateSubFlow={handleCreateSubFlow}
          onDeleteFlow={handleDeleteFlow}
          onDeleteProject={handleDeleteProject}
          onOpenSettings={() => setShowProjectSettings(true)}
        />

        <div className="main-content">
          {currentProject && currentFlow && (
            <>
              <Breadcrumb 
                flowPath={flowPath}
                onSelectFlow={handleSelectFlow}
              />
              <FlowEditor
                project={currentProject}
                flow={currentFlow}
                onSave={handleSaveFlowData}
                onCreateSubFlow={handleCreateSubFlow}
                onSelectNode={setSelectedNode}
              />
            </>
          )}
        </div>

        <div 
          className="resize-handle"
          onMouseDown={() => setIsResizing(true)}
        />

        <div 
          className="document-panel-wrapper"
          style={{ width: `${documentPanelWidth}px` }}
        >
          <RightPanel
            flow={currentFlow}
            selectedNode={selectedNode}
            project={currentProject}
            onSave={handleSaveFlowData}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
            onCreateSubFlow={handleCreateSubFlow}
          />
        </div>
      </main>

      {showProjectSettings && currentProject && (
        <ProjectSettings
          project={currentProject}
          onSave={handleUpdateProjectSettings}
          onClose={() => setShowProjectSettings(false)}
        />
      )}

      {showHelp && (
        <HelpPage onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}

export default App;
