import { adjustmentItems, transferItems, destructionItems } from '../data/drilldownData';

export default function Dashboard({ onNavigate }) {
  const adjCount = adjustmentItems.length;
  const trfCount = transferItems.length;
  const dstCount = destructionItems.length;
  const totalCount = adjCount + trfCount + dstCount;

  // Pending: items awaiting approval/blocked/awaiting info
  const pendingAdj = adjustmentItems.filter(i => i.status === 'Pending Approval');
  const pendingTrf = transferItems.filter(i => i.status === 'Blocked' || i.status === 'Awaiting CC#');
  const pendingCount = pendingAdj.length + pendingTrf.length;

  // Overdue: items flagged amber (row-amber) indicating aging/risk
  const overdueAdj = adjustmentItems.filter(i => i.rowClass === 'row-amber');
  const overdueTrf = transferItems.filter(i => i.rowClass === 'row-amber');
  const overdueDst = destructionItems.filter(i => i.rowClass === 'row-amber');
  const overdueCount = overdueAdj.length + overdueTrf.length + overdueDst.length;

  // Completed: resolved/completed/written-off items
  const completedAdj = adjustmentItems.filter(i => i.status === 'Completed' || i.status === 'Resolved (No Adj)');
  const completedTrf = transferItems.filter(i => i.status === 'Completed');
  const completedDst = destructionItems.filter(i => i.status === 'Written Off');
  const completedCount = completedAdj.length + completedTrf.length + completedDst.length;

  const activities = [
    { text: 'WI-1042 approved by Manager', time: '2 min ago' },
    { text: 'New email parsed: Hanes Erie adjustment', time: '15 min ago' },
    { text: 'WI-1038 posted to SAP (MB1A)', time: '28 min ago' },
    { text: 'Follow-up sent for DAV 50001234', time: '1 hr ago' },
    { text: 'WI-1035 escalated to Team Lead', time: '2 hrs ago' },
  ];

  // Dynamic bar heights based on relative counts
  const maxCount = Math.max(adjCount, trfCount, dstCount);
  const adjHeight = Math.round((adjCount / maxCount) * 140);
  const trfHeight = Math.round((trfCount / maxCount) * 140);
  const dstHeight = Math.round((dstCount / maxCount) * 140);

  return (
    <div>
      <div className="cards-row">
        <div className="card clickable-card" onClick={() => onNavigate('workqueue')}>
          <div className="card-label">Open Work Items</div>
          <div className="card-value purple">{totalCount}</div>
        </div>
        <div className="card clickable-card" onClick={() => onNavigate('workqueue', { filter: 'pending' })}>
          <div className="card-label">Pending Approval</div>
          <div className="card-value orange">{pendingCount}</div>
        </div>
        <div className="card clickable-card" onClick={() => onNavigate('workqueue', { filter: 'overdue' })}>
          <div className="card-label">Overdue (&gt;30 days)</div>
          <div className="card-value red">{overdueCount}</div>
        </div>
        <div className="card clickable-card" onClick={() => onNavigate('workqueue', { filter: 'completed' })}>
          <div className="card-label">Completed Today</div>
          <div className="card-value green">{completedCount}</div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-box">
          <h3>Work Items by Process Area</h3>
          <div className="bar-chart">
            <div className="bar-item" onClick={() => onNavigate('adj-drilldown')}>
              <div className="bar-count">{adjCount}</div>
              <div className="bar" style={{ height: `${adjHeight}px`, background: 'var(--primary-gradient)' }}></div>
              <div className="bar-label">Adjustment ({adjCount})</div>
            </div>
            <div className="bar-item" onClick={() => onNavigate('trf-drilldown')}>
              <div className="bar-count">{trfCount}</div>
              <div className="bar" style={{ height: `${trfHeight}px`, background: '#1565c0' }}></div>
              <div className="bar-label">Transfer ({trfCount})</div>
            </div>
            <div className="bar-item" onClick={() => onNavigate('dst-drilldown')}>
              <div className="bar-count">{dstCount}</div>
              <div className="bar" style={{ height: `${dstHeight}px`, background: '#c62828' }}></div>
              <div className="bar-label">Destruction ({dstCount})</div>
            </div>
          </div>
        </div>
        <div className="chart-box">
          <h3>Recent Activity</h3>
          <ul className="activity-feed">
            {activities.map((a, i) => (
              <li key={i}>
                <span>{a.text}</span>
                <span className="activity-time">{a.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
