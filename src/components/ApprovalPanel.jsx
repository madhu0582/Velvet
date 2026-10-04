import { getApprovalRequirement, processAreaRules, approvalThresholds } from '../data/approvalWorkflow';
import { useToast } from '../context/ToastContext';

/**
 * ApprovalPanel - Reusable approval workflow display
 * Shows threshold check, approver routing, and approval status
 */
export default function ApprovalPanel({ value, region, processArea, status, approverName }) {
  const { showToast } = useToast();
  const approval = getApprovalRequirement(value, region, processArea);
  const regionConfig = approvalThresholds[region];
  const currencySymbol = regionConfig?.currency === 'EUR' ? '€' : '$';
  const rules = processAreaRules[processArea];

  return (
    <div className="approval-panel" onClick={e => e.stopPropagation()}>
      <div className="approval-header">
        <span className="approval-title">🔐 Approval Workflow</span>
        <span className={`approval-status-badge ${approval.required ? (status === 'approved' ? 'approved' : 'pending') : 'auto'}`}>
          {!approval.required ? '✓ Auto-Approved' : status === 'approved' ? '✓ Approved' : '⏳ Pending Approval'}
        </span>
      </div>

      <div className="approval-body">
        {/* Value & Threshold */}
        <div className="approval-row">
          <span className="approval-label">Value</span>
          <span className="approval-value" style={{ fontSize: '16px', fontWeight: 800 }}>{currencySymbol}{value.toLocaleString()}</span>
        </div>
        <div className="approval-row">
          <span className="approval-label">Region</span>
          <span className="approval-value">{region}</span>
        </div>
        <div className="approval-row">
          <span className="approval-label">Process Area</span>
          <span className="approval-value">{rules?.label || processArea}</span>
        </div>
        <div className="approval-row">
          <span className="approval-label">Threshold Applied</span>
          <span className="approval-value">{approval.required ? `${currencySymbol}${approval.threshold?.toLocaleString() || '0'} (${approval.level})` : 'Below threshold — no approval needed'}</span>
        </div>

        {/* Approver */}
        {approval.required && approval.approver && (
          <div className="approval-row" style={{ background: '#FEF3C7', padding: '10px 12px', borderRadius: '6px', marginTop: '8px' }}>
            <span className="approval-label">Routed To</span>
            <span className="approval-value" style={{ fontWeight: 700 }}>
              {approverName || approval.approver.name} — {approval.approver.title}
            </span>
          </div>
        )}

        {/* Destruction special rule */}
        {processArea === 'destruction' && approval.reason && (
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#DC2626', fontWeight: 600, padding: '6px 10px', background: '#FEE2E2', borderRadius: '4px' }}>
            ⚠ {approval.reason}
          </div>
        )}

        {/* Regional Threshold Reference */}
        <div className="approval-thresholds-ref">
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', marginTop: '12px' }}>
            {region} THRESHOLD MATRIX
          </div>
          <table className="inv-table" style={{ fontSize: '11px' }}>
            <thead>
              <tr><th>Value Range</th><th>Approver</th></tr>
            </thead>
            <tbody>
              {regionConfig?.levels.map((l, i) => (
                <tr key={i} style={{ background: value >= l.min && value < l.max ? '#EDE9FE' : 'transparent' }}>
                  <td>{l.max === Infinity ? `> ${currencySymbol}${l.min.toLocaleString()}` : `${currencySymbol}${l.min.toLocaleString()} – ${currencySymbol}${l.max.toLocaleString()}`}</td>
                  <td style={{ fontWeight: value >= l.min && value < l.max ? 700 : 400 }}>{l.approver || 'Auto-approved'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        {approval.required && status !== 'approved' && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button className="btn btn-primary" onClick={() => showToast(`Approval request sent to ${approval.approver?.name || 'approver'}`)}>
              Send Approval Request
            </button>
            <button className="btn btn-info" onClick={() => showToast('Follow-up reminder sent')}>
              Chase Approval
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
