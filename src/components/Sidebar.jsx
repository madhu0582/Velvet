import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import SynOpsLogo from './SynOpsLogo';
import { adjustmentItems, transferItems, destructionItems } from '../data/drilldownData';

export default function Sidebar({ activeScreen, onNavigate, region, onRegionChange }) {
  const { showToast } = useToast();
  const [workQueueOpen, setWorkQueueOpen] = useState(true);

  const adjCount = adjustmentItems.length;
  const trfCount = transferItems.length;
  const dstCount = destructionItems.length;
  const totalCount = adjCount + trfCount + dstCount;
  const isWorkQueueArea = ['workqueue', 'adj-drilldown', 'trf-drilldown', 'dst-drilldown'].includes(activeScreen);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <SynOpsLogo size={38} />
        <div className="brand-text">
          <span className="brand-name">SynOps</span>
          <span className="brand-sub">TPM Inventory</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">MAIN MENU</div>

        {/* Dashboard */}
        <button
          className={`sidebar-item ${activeScreen === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <span className="sidebar-icon">📊</span>
          <span className="sidebar-label">Dashboard</span>
        </button>

        {/* Work Queue — expandable with sub-items */}
        <button
          className={`sidebar-item ${isWorkQueueArea ? 'active' : ''}`}
          onClick={() => { setWorkQueueOpen(!workQueueOpen); onNavigate('workqueue'); }}
        >
          <span className="sidebar-icon">📋</span>
          <span className="sidebar-label">Work Queue</span>
          <span className="sidebar-badge">{totalCount}</span>
          <span className={`sidebar-chevron ${workQueueOpen ? 'open' : ''}`}>›</span>
        </button>

        {/* Sub-items under Work Queue */}
        {workQueueOpen && (
          <div className="sidebar-sub-items">
            <button
              className={`sidebar-sub-item ${activeScreen === 'adj-drilldown' ? 'active' : ''}`}
              onClick={() => onNavigate('adj-drilldown')}
            >
              <span className="sidebar-sub-icon">🔄</span>
              <span className="sidebar-label">Adjustments</span>
              <span className="sidebar-count">{adjCount}</span>
            </button>
            <button
              className={`sidebar-sub-item ${activeScreen === 'trf-drilldown' ? 'active' : ''}`}
              onClick={() => onNavigate('trf-drilldown')}
            >
              <span className="sidebar-sub-icon">🔀</span>
              <span className="sidebar-label">Transfers</span>
              <span className="sidebar-count">{trfCount}</span>
            </button>
            <button
              className={`sidebar-sub-item ${activeScreen === 'dst-drilldown' ? 'active' : ''}`}
              onClick={() => onNavigate('dst-drilldown')}
            >
              <span className="sidebar-sub-icon">🗑️</span>
              <span className="sidebar-label">Destruction</span>
              <span className="sidebar-count">{dstCount}</span>
            </button>
          </div>
        )}

        {/* Email Inbox */}
        <button
          className={`sidebar-item ${activeScreen === 'emailinbox' ? 'active' : ''}`}
          onClick={() => onNavigate('emailinbox')}
        >
          <span className="sidebar-icon">📧</span>
          <span className="sidebar-label">Email Inbox</span>
          <span className="sidebar-badge accent">5</span>
        </button>

        {/* ONR Reports */}
        <button
          className={`sidebar-item ${activeScreen === 'onr' ? 'active' : ''}`}
          onClick={() => onNavigate('onr')}
        >
          <span className="sidebar-icon">📑</span>
          <span className="sidebar-label">ONR Reports</span>
        </button>

        {/* Actions */}
        <button
          className={`sidebar-item ${activeScreen === 'actions' ? 'active' : ''}`}
          onClick={() => onNavigate('actions')}
        >
          <span className="sidebar-icon">⚡</span>
          <span className="sidebar-label">Actions</span>
        </button>

        {/* Help Out Form */}
        <button
          className={`sidebar-item ${activeScreen === 'helpout' ? 'active' : ''}`}
          onClick={() => onNavigate('helpout')}
        >
          <span className="sidebar-icon">📝</span>
          <span className="sidebar-label">Help Out Form</span>
        </button>

        {/* Admin Config */}
        <button
          className={`sidebar-item ${activeScreen === 'admin' ? 'active' : ''}`}
          onClick={() => onNavigate('admin')}
        >
          <span className="sidebar-icon">⚙</span>
          <span className="sidebar-label">Admin Config</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-divider"></div>
        <div className="sidebar-user">
          <div className="user-avatar">AP</div>
          <div className="user-details">
            <span className="user-name">Anna Polkowska</span>
            <span className="user-role">TPM Analyst</span>
          </div>
        </div>
        <div className="sidebar-region">
          <label>Region</label>
          <select value={region} onChange={(e) => onRegionChange(e.target.value)}>
            <option value="EMEA">EMEA</option>
            <option value="NA">NA</option>
            <option value="APAC">APAC</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
