import { useState } from 'react';
import { useToast } from '../context/ToastContext';

export default function ApprovalScreen({ item, onClose }) {
  const { showToast } = useToast();
  const [approvalStatus, setApprovalStatus] = useState('pending'); // pending, submitted, approved
  const [comments, setComments] = useState('');

  // Determine approval details based on item
  const getApprovalDetails = () => {
    const value = item.value || '$0';
    const numericValue = parseInt((value).replace(/[^0-9]/g, '')) || 0;
    const region = item.region || 'NA';

    let threshold = '';
    let approver = '';
    let approverRole = '';
    let level = '';

    if (region === 'NA') {
      if (numericValue > 3000) { approver = 'Eric Simmons'; approverRole = 'Manager — NA TPM'; level = 'Manager'; threshold = '$3,000'; }
      else if (numericValue > 1000) { approver = 'Jack May'; approverRole = 'Team Lead — NA Inventory'; level = 'Team Lead'; threshold = '$1,000'; }
    } else if (region === 'EMEA') {
      if (numericValue > 5000) { approver = 'Thomas Berger'; approverRole = 'Executive Manager — EMEA'; level = 'Executive Manager'; threshold = '€5,000'; }
      else if (numericValue > 1000) { approver = 'Marc Dubois'; approverRole = 'Category Leader — EMEA'; level = 'Category Leader'; threshold = '€1,000'; }
    } else {
      if (numericValue > 3000) { approver = 'Steven Zhang'; approverRole = 'Sr. Planner — APAC'; level = 'Sr. Planner'; threshold = '$3,000'; }
    }

    if (!approver) { approver = 'Auto-Approved'; approverRole = 'Below threshold'; level = 'None'; threshold = 'N/A'; }

    return { value, numericValue, region, threshold, approver, approverRole, level };
  };

  const details = getApprovalDetails();

  const handleSubmit = () => {
    setApprovalStatus('submitted');
    showToast(`Approval request sent to ${details.approver}`);
  };

  const handleSimulateApproval = () => {
    setApprovalStatus('approved');
    showToast(`✓ Approved by ${details.approver}. Ready to post.`);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '12px', width: '720px', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '16px', color: '#1e293b', margin: 0 }}>Approval Request — {item.id}</h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>{item.classification || item.type} | {item.materialDesc}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {approvalStatus === 'pending' && <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>⏳ Pending Review</span>}
            {approvalStatus === 'submitted' && <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>📤 Sent to Approver</span>}
            {approvalStatus === 'approved' && <span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>✓ Approved</span>}
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>

          {/* Threshold Matrix */}
          <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed', marginBottom: '12px' }}>📊 Approval Threshold Matrix — {details.region} Region</div>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={thStyle}>Value Range</th>
                  <th style={thStyle}>Approval Level</th>
                  <th style={thStyle}>Approver</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {details.region === 'NA' && (
                  <>
                    <tr style={details.numericValue <= 1000 ? activeRowStyle : {}}><td style={tdStyle}>&lt; $1,000</td><td style={tdStyle}>Auto-Approved</td><td style={tdStyle}>—</td><td style={tdStyle}>{details.numericValue <= 1000 ? '← This item' : ''}</td></tr>
                    <tr style={details.numericValue > 1000 && details.numericValue <= 3000 ? activeRowStyle : {}}><td style={tdStyle}>$1,000 — $3,000</td><td style={tdStyle}>Team Lead</td><td style={tdStyle}>Jack May</td><td style={tdStyle}>{details.numericValue > 1000 && details.numericValue <= 3000 ? '← This item' : ''}</td></tr>
                    <tr style={details.numericValue > 3000 ? activeRowStyle : {}}><td style={tdStyle}>&gt; $3,000</td><td style={tdStyle}>Manager</td><td style={tdStyle}>Eric Simmons</td><td style={tdStyle}>{details.numericValue > 3000 ? '← This item' : ''}</td></tr>
                  </>
                )}
                {details.region === 'EMEA' && (
                  <>
                    <tr style={details.numericValue <= 1000 ? activeRowStyle : {}}><td style={tdStyle}>&lt; €1,000</td><td style={tdStyle}>Auto-Approved</td><td style={tdStyle}>—</td><td style={tdStyle}>{details.numericValue <= 1000 ? '← This item' : ''}</td></tr>
                    <tr style={details.numericValue > 1000 && details.numericValue <= 5000 ? activeRowStyle : {}}><td style={tdStyle}>€1,000 — €5,000</td><td style={tdStyle}>Category Leader</td><td style={tdStyle}>Marc Dubois</td><td style={tdStyle}>{details.numericValue > 1000 && details.numericValue <= 5000 ? '← This item' : ''}</td></tr>
                    <tr style={details.numericValue > 5000 ? activeRowStyle : {}}><td style={tdStyle}>&gt; €5,000</td><td style={tdStyle}>Executive Manager</td><td style={tdStyle}>Thomas Berger</td><td style={tdStyle}>{details.numericValue > 5000 ? '← This item' : ''}</td></tr>
                  </>
                )}
                {details.region === 'APAC' && (
                  <>
                    <tr style={details.numericValue <= 3000 ? activeRowStyle : {}}><td style={tdStyle}>&lt; $3,000</td><td style={tdStyle}>Auto-Approved</td><td style={tdStyle}>—</td><td style={tdStyle}>{details.numericValue <= 3000 ? '← This item' : ''}</td></tr>
                    <tr style={details.numericValue > 3000 ? activeRowStyle : {}}><td style={tdStyle}>&gt; $3,000</td><td style={tdStyle}>Sr. Planner</td><td style={tdStyle}>Steven Zhang</td><td style={tdStyle}>{details.numericValue > 3000 ? '← This item' : ''}</td></tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Work Item Summary */}
          <div style={{ background: 'white', borderRadius: '8px', padding: '16px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>📋 Work Item Details for Approval</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div><span style={fieldLabel}>Work Item</span><span style={fieldValue}>{item.id}</span></div>
              <div><span style={fieldLabel}>Classification</span><span style={fieldValue}>{item.classification || item.type}</span></div>
              <div><span style={fieldLabel}>Material</span><span style={fieldValue}>{item.material}</span></div>
              <div><span style={fieldLabel}>Material Desc</span><span style={fieldValue}>{item.materialDesc || '—'}</span></div>
              <div><span style={fieldLabel}>Plant</span><span style={fieldValue}>{item.plant || item.from}</span></div>
              <div><span style={fieldLabel}>Vendor</span><span style={fieldValue}>{item.vendor}</span></div>
              <div><span style={fieldLabel}>Quantity</span><span style={fieldValue}>{item.qty}</span></div>
              <div><span style={fieldLabel}>Value</span><span style={{ ...fieldValue, color: '#DC2626', fontWeight: 700 }}>{item.value}</span></div>
              <div><span style={fieldLabel}>Region</span><span style={fieldValue}>{item.region}</span></div>
              <div><span style={fieldLabel}>Batch</span><span style={fieldValue}>{item.batch || '—'}</span></div>
              <div><span style={fieldLabel}>PO / STO</span><span style={fieldValue}>{item.po || item.sto || '—'}</span></div>
              <div><span style={fieldLabel}>Assigned To</span><span style={fieldValue}>{item.assignedTo || '—'}</span></div>
            </div>
          </div>

          {/* Approval Routing */}
          <div style={{ background: '#f5f3ff', borderRadius: '8px', padding: '16px', marginBottom: '20px', border: '1px solid #ddd6fe' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed', marginBottom: '12px' }}>🔀 Approval Routing</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={stepBubble('completed')}>1</div>
              <div style={stepLine(true)}></div>
              <div style={stepBubble(approvalStatus !== 'pending' ? 'completed' : 'active')}>2</div>
              <div style={stepLine(approvalStatus === 'approved')}></div>
              <div style={stepBubble(approvalStatus === 'approved' ? 'completed' : 'inactive')}>3</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
              <span>Investigation Complete</span>
              <span>Awaiting {details.approver}</span>
              <span>Post to SAP</span>
            </div>

            <div style={{ marginTop: '16px', padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                <div><strong>Approver:</strong> {details.approver}</div>
                <div><strong>Role:</strong> {details.approverRole}</div>
                <div><strong>Threshold Exceeded:</strong> {details.value} &gt; {details.threshold}</div>
                <div><strong>Level:</strong> {details.level}</div>
              </div>
            </div>
          </div>

          {/* Comments */}
          {approvalStatus === 'pending' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Justification / Comments for Approver</label>
              <textarea
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', height: '70px', resize: 'vertical' }}
                placeholder="Add context for the approver (investigation summary, urgency, etc.)..."
                value={comments}
                onChange={e => setComments(e.target.value)}
              />
            </div>
          )}

          {/* Approval Response (after submitted) */}
          {approvalStatus === 'submitted' && (
            <div style={{ background: '#dbeafe', borderRadius: '8px', padding: '16px', marginBottom: '20px', border: '1px solid #93c5fd' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>📤 Approval Request Sent</div>
              <p style={{ fontSize: '12px', color: '#1e3a5f', margin: 0 }}>
                Email sent to <strong>{details.approver}</strong> ({details.approverRole}) at {new Date().toLocaleTimeString()}.
                Awaiting response. SLA: 24 hours.
              </p>
              <button className="btn btn-success" style={{ marginTop: '12px', fontSize: '12px' }} onClick={handleSimulateApproval}>
                ▶ Simulate: Approver Clicks "Approve"
              </button>
            </div>
          )}

          {/* Approved */}
          {approvalStatus === 'approved' && (
            <div style={{ background: '#d1fae5', borderRadius: '8px', padding: '16px', marginBottom: '20px', border: '1px solid #6ee7b7' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#065f46', marginBottom: '8px' }}>✓ Approved by {details.approver}</div>
              <p style={{ fontSize: '12px', color: '#064e3b', margin: 0 }}>
                Approved on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}.
                Work Item can now proceed to SAP posting.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            {approvalStatus === 'pending' && (
              <button className="btn btn-primary" onClick={handleSubmit} style={{ padding: '10px 24px' }}>
                📤 Submit for Approval
              </button>
            )}
            {approvalStatus === 'approved' && (
              <button className="btn btn-success" onClick={() => { showToast('SAP posting initiated — MIGO pre-populated'); onClose(); }} style={{ padding: '10px 24px' }}>
                ✓ Proceed to Post
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const thStyle = { padding: '8px 10px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #e2e8f0' };
const tdStyle = { padding: '8px 10px', borderBottom: '1px solid #f1f5f9' };
const activeRowStyle = { background: '#fef3c7', fontWeight: 600 };
const fieldLabel = { fontSize: '10.5px', color: '#94a3b8', display: 'block', marginBottom: '2px' };
const fieldValue = { fontSize: '13px', color: '#1e293b', fontWeight: 500, display: 'block' };

function stepBubble(state) {
  const colors = { completed: { bg: '#7c3aed', color: 'white' }, active: { bg: '#fbbf24', color: '#1e293b' }, inactive: { bg: '#e2e8f0', color: '#94a3b8' } };
  const c = colors[state] || colors.inactive;
  return { width: '28px', height: '28px', borderRadius: '50%', background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 };
}

function stepLine(active) {
  return { flex: 1, height: '3px', background: active ? '#7c3aed' : '#e2e8f0', borderRadius: '2px' };
}
