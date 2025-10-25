import React from 'react';
import './Breadcrumb.css';

function Breadcrumb({ flowPath, onSelectFlow }) {
  if (!flowPath || flowPath.length === 0) return null;

  return (
    <div className="breadcrumb">
      {flowPath.map((flow, index) => (
        <React.Fragment key={flow.id}>
          <span
            className={`breadcrumb-item ${index === flowPath.length - 1 ? 'active' : ''}`}
            onClick={() => index < flowPath.length - 1 && onSelectFlow(flow)}
          >
            {flow.name}
          </span>
          {index < flowPath.length - 1 && (
            <span className="breadcrumb-separator">/</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default Breadcrumb;
