import { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import WorkQueue from './components/WorkQueue';
import EmailInbox from './components/EmailInbox';
import ONRReports from './components/ONRReports';
import ActionsScreen from './components/ActionsScreen';
import HelpOutForm from './components/HelpOutForm';
import AdjustmentDrilldown from './components/AdjustmentDrilldown';
import TransferDrilldown from './components/TransferDrilldown';
import DestructionDrilldown from './components/DestructionDrilldown';
import AdminConfig from './components/AdminConfig';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [region, setRegion] = useState('EMEA');
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = (screen, options) => {
    setActiveScreen(screen);
    setActiveFilter(options?.filter || null);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setActiveScreen('workqueue');
      setActiveFilter(null);
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />;
      case 'workqueue':
        return <WorkQueue onNavigate={navigate} activeFilter={activeFilter} searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} />;
      case 'emailinbox':
        return <EmailInbox />;
      case 'onr':
        return <ONRReports />;
      case 'actions':
        return <ActionsScreen />;
      case 'helpout':
        return <HelpOutForm />;
      case 'adj-drilldown':
        return <AdjustmentDrilldown onBack={() => navigate('dashboard')} />;
      case 'trf-drilldown':
        return <TransferDrilldown onBack={() => navigate('dashboard')} />;
      case 'dst-drilldown':
        return <DestructionDrilldown onBack={() => navigate('dashboard')} />;
      case 'admin':
        return <AdminConfig />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <ToastProvider>
      <div className="app-layout">
        <Sidebar
          activeScreen={activeScreen}
          onNavigate={navigate}
          region={region}
          onRegionChange={setRegion}
        />
        <div className="app-main">
          <TopBar activeScreen={activeScreen} searchQuery={searchQuery} onSearch={handleSearch} />
          <div className="main-content">
            {renderScreen()}
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
