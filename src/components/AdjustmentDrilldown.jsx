import { useState } from 'react';
import { adjustmentItems } from '../data/drilldownData';
import { useToast } from '../context/ToastContext';
import ExpandableRow from './ExpandableRow';

export default function AdjustmentDrilldown({ onBack }) {
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('All');

  const subTabs = [
    { label: 'All', count: adjustmentItems.length },
    { label: 'Consumption Correction', count: adjustmentItems.filter(i => i.classification === 'Consumption').length, filter: 'Consumption' },
    { label: 'Stock Discrepancy', count: adjustmentItems.filter(i => i.classification === 'Stock Discrepancy').length, filter: 'Stock Discrepancy' },
    { label: 'ASN Reversal', count: adjustmentItems.filter(i => i.classification === 'ASN Reversal').length, filter: 'ASN Reversal' },
    { label: 'ASN Deletion', count: adjustmentItems.filter(i => i.classification === 'ASN Deletion').length, filter: 'ASN Deletion' },
    { label: 'GR Reversal', count: adjustmentItems.filter(i => i.classification === 'GR Reversal').length, filter: 'GR Reversal' },
    { label: 'Batch Transfer', count: adjustmentItems.filter(i => i.classification === 'Batch Transfer').length, filter: 'Batch Transfer' },
  ].filter(t => t.count > 0);

  const currentTab = subTabs.find(t => t.label === activeSubTab);
  const filteredItems = currentTab?.filter
    ? adjustmentItems.filter(item => item.classification === currentTab.filter)
    : adjustmentItems;

  const getAdjustmentAction = (item) => {
    const s = (item.status || '').toLowerCase();
    if (s.includes('completed') || s.includes('resolved')) {
      return <button className="btn btn-secondary" onClick={e => { e.stopPropagation(); showToast(`${item.id}: Closed — posted to SAP`); }}>Closed</button>;
    }
    if (s.includes('pending approval')) {
      return <button className="btn btn-success" onClick={e => { e.stopPropagation(); showToast(`${item.id}: Approval request sent to manager`); }}>Request Approval</button>;
    }
    if (s.includes('new')) {
      return <button className="btn btn-primary" onClick={e => { e.stopPropagation(); showToast(`${item.id}: Investigation started — MB52/MB51 check`); }}>Investigate</button>;
    }
    if (s.includes('rca') || s.includes('progress')) {
      return <button className="btn btn-info" onClick={e => { e.stopPropagation(); showToast(`${item.id}: Follow-up sent to vendor`); }}>Follow Up</button>;
    }
    if (s.includes('escalated')) {
      return <button className="btn btn-warning" onClick={e => { e.stopPropagation(); showToast(`${item.id}: Escalated to Team Lead`); }}>Escalated</button>;
    }
    return <button className="btn btn-secondary" onClick={e => { e.stopPropagation(); showToast(`${item.id}: Details viewed`); }}>View</button>;
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <h2 style={{ fontSize: '18px', color: '#333' }}>Inventory Adjustments</h2>
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
        <select><option>All Status</option><option>New</option><option>RCA Active</option><option>Pending Approval</option><option>Ready to Post</option><option>Completed</option></select>
        <select><option>All Vendors</option><option>Intercos</option><option>COSMAX</option><option>Kolmar</option><option>Hanes Erie</option><option>Arcade Beauty</option></select>
      </div>
      <div className="table-container" style={{ marginTop: '16px' }}>
        <table>
          <thead>
            <tr>
              <th>WI#</th>
              <th>Classification</th>
              <th>Material#</th>
              <th>Plant</th>
              <th>Vendor</th>
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
                    <td><span className={`type-badge ${item.classBadge}`}>{item.classification}</span></td>
                    <td>{item.material}</td>
                    <td>{item.plant}</td>
                    <td>{item.vendor}</td>
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
