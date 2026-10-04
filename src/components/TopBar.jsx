import { useToast } from '../context/ToastContext';
import EsteeLauderLogo from './EsteeLauderLogo';

const screenTitles = {
  dashboard: 'Dashboard',
  workqueue: 'Work Queue',
  emailinbox: 'Email Inbox',
  onr: 'ONR Reports',
  actions: 'Email Composer',
  'adj-drilldown': 'Inventory Adjustments',
  'trf-drilldown': 'Transfers',
  'dst-drilldown': 'Scrapping & Destruction',
};

export default function TopBar({ activeScreen, searchQuery, onSearch }) {
  const { showToast } = useToast();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(e.target.value);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{screenTitles[activeScreen] || 'Dashboard'}</h1>
        <span className="topbar-breadcrumb">SynOps for Supply Chain / TPM Inventory / {screenTitles[activeScreen]}</span>
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <input
            type="text"
            placeholder="Search work items, materials..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button className="topbar-icon-btn" onClick={() => showToast('3 new notifications')} aria-label="Notifications">
          🔔
          <span className="notif-dot"></span>
        </button>
        <button className="topbar-icon-btn" onClick={() => showToast('Settings opened')} aria-label="Settings">
          ⚙️
        </button>
        <div className="topbar-divider"></div>
        <EsteeLauderLogo height={34} />
      </div>
    </header>
  );
}
