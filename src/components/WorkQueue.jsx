import { useState, useEffect, useMemo } from 'react';
import { adjustmentItems, transferItems, destructionItems } from '../data/drilldownData';
import { useToast } from '../context/ToastContext';

// Build a unified work items list from drilldown data
function buildAllItems() {
  const adj = adjustmentItems.map(i => ({
    ...i,
    processArea: 'adjustment',
    normalizedStatus: normalizeStatus(i.status),
    region: i.region || 'EMEA',
    priority: getPriority(i),
  }));
  const trf = transferItems.map(i => ({
    ...i,
    processArea: 'transfer',
    normalizedStatus: normalizeStatus(i.status),
    region: i.region || 'EMEA',
    priority: getPriority(i),
    vendor: i.vendor || '—',
    value: i.value || 'N/A',
  }));
  const dst = destructionItems.map(i => ({
    ...i,
    processArea: 'destruction',
    normalizedStatus: normalizeStatus(i.status),
    region: 'APAC',
    priority: getPriority(i),
    vendor: i.route || '—',
    value: i.value || '—',
  }));
  return [...adj, ...trf, ...dst];
}

function normalizeStatus(status) {
  if (!status) return 'new';
  const s = status.toLowerCase();
  if (s.includes('new') || s.includes('ready to write')) return 'new';
  if (s.includes('progress') || s.includes('rca') || s.includes('pgi') || s.includes('confirming') || s.includes('escalated')) return 'in-progress';
  if (s.includes('pending') || s.includes('blocked') || s.includes('awaiting')) return 'pending';
  if (s.includes('completed') || s.includes('resolved') || s.includes('written off')) return 'completed';
  return 'in-progress';
}

function getPriority(item) {
  if (item.rowClass === 'row-amber' || item.rowClass === 'row-red') return 'high';
  const s = (item.status || '').toLowerCase();
  if (s.includes('pending') || s.includes('blocked') || s.includes('awaiting')) return 'medium';
  if (s.includes('completed') || s.includes('resolved') || s.includes('written off')) return 'low';
  return 'medium';
}

function getStatusBadgeClass(normalizedStatus) {
  const map = { 'new': 'status-new', 'in-progress': 'status-progress', 'pending': 'status-pending', 'completed': 'status-completed' };
  return map[normalizedStatus] || '';
}

export default function WorkQueue({ onNavigate, activeFilter, searchQuery, onClearSearch }) {
  const { showToast } = useToast();
  const [filterProcess, setFilterProcess] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [itemStatuses, setItemStatuses] = useState({}); // track runtime status overrides

  const allItems = useMemo(() => buildAllItems(), []);

  // Apply dashboard tile filter
  useEffect(() => {
    if (activeFilter === 'pending') {
      setFilterStatus('pending');
      setFilterProcess('all');
      setFilterRegion('all');
      setFilterPriority('all');
    } else if (activeFilter === 'overdue') {
      setFilterPriority('high');
      setFilterStatus('all');
      setFilterProcess('all');
      setFilterRegion('all');
    } else if (activeFilter === 'completed') {
      setFilterStatus('completed');
      setFilterProcess('all');
      setFilterRegion('all');
      setFilterPriority('all');
    }
  }, [activeFilter]);

  // Merge runtime status overrides into items
  const itemsWithOverrides = useMemo(() => {
    return allItems.map(item => {
      const override = itemStatuses[item.id];
      if (!override) return item;
      return { ...item, status: override.status, normalizedStatus: override.normalizedStatus, statusClass: override.statusClass };
    });
  }, [allItems, itemStatuses]);

  // Apply all filters dynamically
  const filtered = useMemo(() => {
    return itemsWithOverrides.filter(item => {
      if (filterProcess !== 'all' && item.processArea !== filterProcess) return false;
      if (filterStatus !== 'all' && item.normalizedStatus !== filterStatus) return false;
      if (filterRegion !== 'all' && item.region !== filterRegion) return false;
      if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
      // Global search — matches against id, material, materialDesc, vendor, status, region
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const searchable = [
          item.id, item.material, item.materialDesc, item.vendor,
          item.status, item.region, item.plant, item.plantName,
          item.po, item.batch, item.assignedTo
        ].filter(Boolean).join(' ').toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [itemsWithOverrides, filterProcess, filterStatus, filterRegion, filterPriority, searchQuery]);

  const selectedCount = Object.keys(selectedItems).filter(k => selectedItems[k]).length;
  const selectedIds = Object.keys(selectedItems).filter(k => selectedItems[k]);

  const toggleSelectAll = () => {
    const newState = !selectAll;
    setSelectAll(newState);
    const sel = {};
    if (newState) filtered.forEach(item => { sel[item.id] = true; });
    setSelectedItems(sel);
  };

  const toggleItem = (id) => {
    setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRowClick = (item) => {
    if (item.processArea === 'adjustment') onNavigate('adj-drilldown');
    else if (item.processArea === 'transfer') onNavigate('trf-drilldown');
    else if (item.processArea === 'destruction') onNavigate('dst-drilldown');
  };

  const clearFilters = () => {
    setFilterProcess('all');
    setFilterStatus('all');
    setFilterRegion('all');
    setFilterPriority('all');
    if (onClearSearch) onClearSearch();
    onNavigate('workqueue');
  };

  // === BULK ACTIONS ===

  const handleGenerateEmail = () => {
    if (selectedCount === 0) {
      showToast('Select at least one item to generate email');
      return;
    }
    // Navigate to email composer
    onNavigate('actions');
    showToast(`Email composer opened for ${selectedCount} item${selectedCount > 1 ? 's' : ''}`);
  };

  const handleApprove = () => {
    if (selectedCount === 0) {
      showToast('Select at least one item to approve');
      return;
    }
    // Only pending items can be approved
    const pendingSelected = selectedIds.filter(id => {
      const item = allItems.find(i => i.id === id);
      return item && item.normalizedStatus === 'pending';
    });

    if (pendingSelected.length === 0) {
      showToast('No pending items in selection — only "Pending Approval" items can be approved');
      return;
    }

    // Approve: move items to completed status
    const newStatuses = { ...itemStatuses };
    pendingSelected.forEach(id => {
      newStatuses[id] = { status: 'Approved ✓', normalizedStatus: 'completed', statusClass: 'status-completed' };
    });
    setItemStatuses(newStatuses);
    setSelectedItems({});
    setSelectAll(false);

    const skipped = selectedCount - pendingSelected.length;
    const msg = `${pendingSelected.length} item${pendingSelected.length > 1 ? 's' : ''} approved` +
      (skipped > 0 ? ` (${skipped} skipped — not in pending status)` : '');
    showToast(msg);
  };

  const handleEscalate = () => {
    if (selectedCount === 0) {
      showToast('Select at least one item to escalate');
      return;
    }
    // Only non-completed items can be escalated
    const escalatable = selectedIds.filter(id => {
      const item = allItems.find(i => i.id === id);
      return item && item.normalizedStatus !== 'completed';
    });

    if (escalatable.length === 0) {
      showToast('No active items in selection — completed items cannot be escalated');
      return;
    }

    const newStatuses = { ...itemStatuses };
    escalatable.forEach(id => {
      newStatuses[id] = { status: 'Escalated ↑', normalizedStatus: 'in-progress', statusClass: 'status-progress' };
    });
    setItemStatuses(newStatuses);
    setSelectedItems({});
    setSelectAll(false);
    showToast(`${escalatable.length} item${escalatable.length > 1 ? 's' : ''} escalated to Team Lead`);
  };

  const hasActiveFilter = filterProcess !== 'all' || filterStatus !== 'all' || filterRegion !== 'all' || filterPriority !== 'all' || (searchQuery && searchQuery.trim());

  return (
    <div>
      <div className="filters-row">
        <select value={filterProcess} onChange={e => setFilterProcess(e.target.value)}>
          <option value="all">All Process Areas</option>
          <option value="adjustment">Adjustment</option>
          <option value="transfer">Transfer</option>
          <option value="destruction">Destruction</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="in-progress">In Progress</option>
          <option value="pending">Pending Approval</option>
          <option value="completed">Completed</option>
        </select>
        <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
          <option value="all">All Regions</option>
          <option value="EMEA">EMEA</option>
          <option value="NA">NA</option>
          <option value="APAC">APAC</option>
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <div className="bulk-actions">
          {hasActiveFilter && (
            <button className="btn btn-secondary" onClick={clearFilters}>✕ Clear</button>
          )}
          {selectedCount > 0 && (
            <span style={{ fontSize: 12, fontFamily: 'Graphik-Medium', color: 'var(--text-secondary)', alignSelf: 'center' }}>
              {selectedCount} selected
            </span>
          )}
          <button className="btn btn-primary" onClick={handleGenerateEmail} disabled={selectedCount === 0} title="Generate follow-up email for selected items">
            ✉ Email
          </button>
          <button className="btn btn-success" onClick={handleApprove} disabled={selectedCount === 0} title="Approve selected pending items (within threshold)">
            ✓ Approve
          </button>
          <button className="btn btn-warning" onClick={handleEscalate} disabled={selectedCount === 0} title="Escalate selected items to Team Lead">
            ↑ Escalate
          </button>
        </div>
      </div>

      {hasActiveFilter && (
        <div style={{ marginBottom: 14, padding: '8px 16px', background: 'var(--primary-light)', borderRadius: 'var(--radius)', border: '1px solid #D8B4FE', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Graphik-Medium', fontSize: 13, color: 'var(--primary-dark)' }}>
            {searchQuery && searchQuery.trim() ? `Search: "${searchQuery.trim()}" — ` : ''}Showing {filtered.length} of {allItems.length} records
          </span>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" checked={selectAll} onChange={toggleSelectAll} /></th>
              <th>WI#</th>
              <th>Type</th>
              <th>Material#</th>
              <th>Vendor</th>
              <th>Qty</th>
              <th>Value</th>
              <th>Status</th>
              <th>Region</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="11" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontFamily: 'Graphik-Regular' }}>No records match the selected filters</td></tr>
            ) : (
              filtered.map(item => (
                <tr key={item.id} className={`clickable-row ${item.rowClass || ''}`} onClick={() => handleRowClick(item)}>
                  <td><input type="checkbox" checked={!!selectedItems[item.id]} onChange={() => toggleItem(item.id)} onClick={e => e.stopPropagation()} /></td>
                  <td><strong>{item.id}</strong></td>
                  <td><span className={`type-badge type-${item.processArea}`}>{item.processArea.charAt(0).toUpperCase() + item.processArea.slice(1)}</span></td>
                  <td>{item.material}</td>
                  <td>{item.vendor || '—'}</td>
                  <td>{item.qty}</td>
                  <td>{item.value || '—'}</td>
                  <td><span className={`status-badge ${getStatusBadgeClass(item.normalizedStatus)}`}>{item.status}</span></td>
                  <td>{item.region}</td>
                  <td><span className={`priority-${item.priority}`}>{item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}</span></td>
                  <td><button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={e => { e.stopPropagation(); handleRowClick(item); }}>View</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
