import { useState } from 'react';
import { transferItems } from '../data/drilldownData';
import { useToast } from '../context/ToastContext';
import ExpandableRow from './ExpandableRow';

export default function TransferDrilldown({ onBack }) {
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('All');

  const subTabs = [
    { label: 'All', count: transferItems.length },
    { label: 'Cross-Plant STO', count: transferItems.filter(i => i.type === 'Cross-Plant STO').length, filter: 'Cross-Plant STO' },
    { label: 'Same-Plant 542/541', count: transferItems.filter(i => i.type === 'Same-Plant 542/541').length, filter: 'Same-Plant 542/541' },
    { label: 'Samples / Cost Center', count: transferItems.filter(i => i.type === 'Sample/CC').length, filter: 'Sample/CC' },
  ].filter(t => t.count > 0);

  const currentTab = subTabs.find(t => t.label === activeSubTab);
  const filteredItems = currentTab?.filter
    ? transferItems.filter(item => item.type === currentTab.filter)
    : transferItems;

  const getTransferAction = (item) => {
    const s = (item.status || '').toLowerCase();
    if (s.includes('completed')) {
      return <button className="btn btn-secondary" onClick={e => { e.stopPropagation(); showToast(`${item.id}: Transfer completed — no action needed`); }}>Closed</button>;
    }
    if (s.includes('pgi')) {
      return <button className="btn btn-info" onClick={e => { e.stopPropagation(); showToast(`${item.id}: GR monitoring active — tracking delivery`); }}>Track GR</button>;
    }
    if (s.includes('new') || s === 'new') {
      return <button className="btn btn-primary" onClick={e => { e.stopPropagation(); showToast(`${item.id}: 542 posting initiated`); }}>Post 542</button>;
    }
    if (s.includes('blocked') || s.includes('awaiting')) {
      return <button className="btn btn-warning" onClick={e => { e.stopPropagation(); showToast(`${item.id}: Follow-up sent to resolve blocker`); }}>Follow Up</button>;
    }
    return <button className="btn btn-info" onClick={e => { e.stopPropagation(); showToast(`${item.id}: Status checked — in progress`); }}>Check</button>;
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <h2 style={{ fontSize: '18px', color: '#333' }}>Transfers — Transfer to Other TPMs or EL Plant</h2>
      </div>
      <div className="onr-tabs">
        {subTabs.map(tab => (
          <button
            key={tab.label}
            className={`onr-tab ${activeSubTab === tab.label ? 'active' : ''}`}
            onClick={() => setActiveSubTab(tab.label)}
          >
            {tab.label} <span className="count">{tab.count}</span>
          </button>
        ))}
      </div>
      <div className="filters-row" style={{ marginTop: '16px' }}>
        <select><option>All Plants</option><option>6010</option><option>6020</option><option>6030</option><option>6050</option><option>4010</option></select>
        <select><option>All Status</option><option>542 Pending</option><option>PGI Done</option><option>GR Pending</option><option>Completed</option></select>
      </div>
      <div className="table-container" style={{ marginTop: '16px' }}>
        <table>
          <thead>
            <tr>
              <th>WI#</th>
              <th>Type</th>
              <th>Material#</th>
              <th>From</th>
              <th>To</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Current Step</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <ExpandableRow
                key={item.id}
                item={item}
                columns={8}
                renderRow={(item) => (
                  <>
                    <td>{item.id}</td>
                    <td><span className={`type-badge ${item.typeBadge}`}>{item.type}</span></td>
                    <td>{item.material}</td>
                    <td>{item.from}</td>
                    <td>{item.to}</td>
                    <td>{item.qty}</td>
                    <td><span className={`status-badge ${item.statusClass}`}>{item.status}</span></td>
                    <td>{item.step}</td>
                  </>
                )}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
