import { useState } from 'react';
import { useToast } from '../context/ToastContext';

const modalTabs = ['Details', 'Email Thread', 'Investigation', 'SAP Data', 'Actions'];

export default function WorkItemModal({ item, onClose }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('Details');

  const getTypeLabel = (type) => {
    const map = { adjustment: 'Adjustment', transfer: 'Transfer', destruction: 'Destruction' };
    return map[type] || type;
  };

  const getStatusLabel = (status) => {
    const map = { 'in-progress': 'In Progress', 'pending-approval': 'Pending Approval', 'new': 'New', 'completed': 'Completed' };
    return map[status] || status;
  };

  const getStatusClass = (status) => {
    if (status.includes('progress')) return 'status-progress';
    if (status.includes('pending')) return 'status-pending';
    if (status === 'new') return 'status-new';
    return 'status-completed';
  };

  return (
    <div className="modal-overlay show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <h2>
            {item.id}{' '}
            <span className={`type-badge type-${item.type}`}>{getTypeLabel(item.type)}</span>{' '}
            <span className={`status-badge ${getStatusClass(item.status)}`}>{getStatusLabel(item.status)}</span>
          </h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-tabs">
          {modalTabs.map(tab => (
            <button key={tab} className={`modal-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
        <div className="modal-body">
          {activeTab === 'Details' && <DetailsPanel item={item} />}
          {activeTab === 'Email Thread' && <EmailThreadPanel />}
          {activeTab === 'Investigation' && <InvestigationPanel item={item} />}
          {activeTab === 'SAP Data' && <SAPDataPanel item={item} />}
          {activeTab === 'Actions' && <ActionsPanel item={item} onClose={onClose} />}
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { showToast('Changes saved'); onClose(); }}>Save & Close</button>
        </div>
      </div>
    </div>
  );
}

function DetailsPanel({ item }) {
  const { showToast } = useToast();
  const [showComposer, setShowComposer] = useState(false);

  // Determine which mandatory fields are missing/blank for this work item
  const isMissing = (v) => v === undefined || v === null || String(v).trim() === '' || String(v).toUpperCase() === 'N/A';
  const mandatory = [
    { label: 'Batch Number', value: item.batch },
    { label: 'PO Number', value: item.po },
    { label: 'Quantity', value: item.qty },
    { label: 'Unit of Measure', value: item.unit },
    { label: 'Storage Location', value: item.sloc },
  ];
  const missingFields = mandatory.filter(f => isMissing(f.value)).map(f => f.label);
  // In the demo most records are complete; fall back to a representative set so the template is always meaningful
  const requestedFields = missingFields.length > 0
    ? missingFields
    : ['Confirmed on-hand Quantity', 'Batch Number', 'PO / Line reference'];

  const vendorDomain = (item.vendor || 'vendor').toLowerCase().replace(/[^a-z]/g, '') + '.com';
  const toAddress = `tpm.contact@${vendorDomain}`;
  const subject = `[Action Required] Missing information for ${item.material} — ${item.id}`;
  const bulletList = requestedFields.map(f => `   - ${f}`).join('\n');
  const body =
`Dear ${item.vendor} Team,

We are processing an inventory adjustment (Ref: ${item.id}) for the item below and require some mandatory details before we can complete our SAP validation checks.

Material        : ${item.material} (${item.materialDesc})
Plant           : ${item.plant} (${item.plantName})
Vendor          : ${item.vendor} (${item.vendorId})
Current Qty     : ${item.qty} ${item.unit}

Please confirm the following missing / unverified details:
${bulletList}

Kindly reply to this email with the above information so we can proceed with the adjustment and reconciliation.

Best regards,
${item.assignedTo}
TPM Inventory Analyst — SynOps`;

  const [to, setTo] = useState(toAddress);
  const [subj, setSubj] = useState(subject);
  const [emailBody, setEmailBody] = useState(body);

  return (
    <div>
      <div className="field-grid">
        <div className="field-item"><label>Material Number</label><div className="value">{item.material}</div></div>
        <div className="field-item"><label>Material Description</label><div className="value">{item.materialDesc}</div></div>
        <div className="field-item"><label>Vendor</label><div className="value">{item.vendor} ({item.vendorId})</div></div>
        <div className="field-item"><label>Plant</label><div className="value">{item.plant} ({item.plantName})</div></div>
        <div className="field-item"><label>Storage Location</label><div className="value">{item.sloc}</div></div>
        <div className="field-item"><label>Quantity</label><input type="number" defaultValue={item.qty} /></div>
        <div className="field-item"><label>Unit</label><div className="value">{item.unit}</div></div>
        <div className="field-item"><label>Batch</label><div className="value">{item.batch}</div></div>
        <div className="field-item"><label>PO Number</label><div className="value">{item.po}</div></div>
        <div className="field-item"><label>Value</label><input type="text" defaultValue={item.value} /></div>
        <div className="field-item"><label>Region</label><div className="value">{item.region}</div></div>
        <div className="field-item"><label>Assigned To</label><div className="value">{item.assignedTo}</div></div>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => setShowComposer(s => !s)}>
          ✉ Request additional inputs
        </button>
        {missingFields.length > 0 ? (
          <span style={{ fontSize: '12px', color: 'var(--warning, #B45309)' }}>
            {missingFields.length} mandatory field{missingFields.length > 1 ? 's' : ''} missing: {missingFields.join(', ')}
          </span>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-muted, #6B7280)' }}>
            Draft a request to the TPM vendor for any unverified details.
          </span>
        )}
      </div>

      {showComposer && (
        <div style={{ marginTop: '14px', border: '1px solid var(--border, #E5E7EB)', borderRadius: '8px', padding: '14px', background: 'var(--surface, #F9FAFB)' }}>
          <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '13px', marginBottom: '10px' }}>
            Request Additional Inputs — Email to TPM Vendor
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted, #6B7280)', marginBottom: '3px' }}>To</label>
              <input type="text" value={to} onChange={e => setTo(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted, #6B7280)', marginBottom: '3px' }}>Subject</label>
              <input type="text" value={subj} onChange={e => setSubj(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted, #6B7280)', marginBottom: '3px' }}>Message</label>
              <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={14} style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setShowComposer(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={() => {
                showToast(`Missing-info request sent to ${to} for ${item.id}`);
                setShowComposer(false);
              }}
            >
              Send to Vendor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmailThreadPanel() {
  const threads = [
    { sender: 'Sarah.Miller@haneserie.com', date: 'Jan 15, 2025 09:42 AM', body: 'Hi Anna,\n\nWe have identified a quantity discrepancy for Material J0HW010701 (Clinique Happy EDP 50ML) at Plant 4010. Our records show 144 units received against PO 4503255627, but your system shows 120 units. Could you please investigate?\n\nRegards,\nSarah Miller\nHanes Erie Warehouse' },
    { sender: 'anna.polkowska@elcompanies.com', date: 'Jan 15, 2025 11:15 AM', body: 'Hi Sarah,\n\nThank you for flagging this. I will check MB52 and MB51 for the stock movements and revert by EOD.\n\nBest regards,\nAnna' },
    { sender: 'anna.polkowska@elcompanies.com', date: 'Jan 15, 2025 04:30 PM', body: 'Hi Sarah,\n\nConfirmed — we found 24 units on a pending GR that was not posted. I will process the adjustment (701 movement) now. You should see the stock updated by tomorrow.\n\nBest regards,\nAnna' },
  ];

  return (
    <div>
      {threads.map((t, i) => (
        <div key={i} className="thread-item">
          <div className="thread-sender">{t.sender}</div>
          <div className="thread-date">{t.date}</div>
          <div className="thread-body" style={{ whiteSpace: 'pre-wrap' }}>{t.body}</div>
        </div>
      ))}
    </div>
  );
}

function InvestigationPanel({ item }) {
  return (
    <div>
      <div className="investigation-section">
        <h4>MB52 — Stock Overview</h4>
        <table className="inv-table">
          <thead>
            <tr><th>Material</th><th>Plant</th><th>SLoc</th><th>Unrestricted</th><th>Blocked</th><th>In Transit</th></tr>
          </thead>
          <tbody>
            <tr><td>{item.material}</td><td>{item.plant}</td><td>{item.sloc}</td><td>120 EA</td><td>0</td><td>24 EA</td></tr>
          </tbody>
        </table>
      </div>
      <div className="investigation-section">
        <h4>MB51 — Movement History (Last 30 days)</h4>
        <table className="inv-table">
          <thead>
            <tr><th>Date</th><th>MvT</th><th>Qty</th><th>PO/Ref</th><th>User</th></tr>
          </thead>
          <tbody>
            <tr><td>Jan 12</td><td>101 (GR)</td><td>+120</td><td>{item.po}</td><td>SYSTEM</td></tr>
            <tr><td>Jan 10</td><td>601 (Transfer)</td><td>-50</td><td>STO 430288</td><td>A.POLKOWSKA</td></tr>
            <tr><td>Jan 05</td><td>101 (GR)</td><td>+200</td><td>4503255590</td><td>SYSTEM</td></tr>
          </tbody>
        </table>
      </div>
      <div className="investigation-section">
        <h4>ME23N — PO Details</h4>
        <table className="inv-table">
          <thead>
            <tr><th>PO</th><th>Line</th><th>Material</th><th>Ordered</th><th>Delivered</th><th>Remaining</th></tr>
          </thead>
          <tbody>
            <tr><td>{item.po}</td><td>10</td><td>{item.material}</td><td>144 EA</td><td>120 EA</td><td>24 EA</td></tr>
          </tbody>
        </table>
      </div>
      <div className="investigation-section">
        <h4>RCA Checks</h4>
        <table className="inv-table">
          <tbody>
            <tr><td>GR complete vs PO?</td><td className="check-fail">✗ Partial — 24 units pending</td></tr>
            <tr><td>Stock in transit?</td><td className="check-pass">✓ 24 EA in transit (matches gap)</td></tr>
            <tr><td>Tolerance exceeded?</td><td className="check-fail">✗ 16.7% variance (threshold: 5%)</td></tr>
            <tr><td>Vendor dispute?</td><td className="check-pass">✓ No open disputes</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SAPDataPanel({ item }) {
  return (
    <div className="field-grid">
      <div className="field-item">
        <label>Transaction</label>
        <select defaultValue="MIGO">
          <option value="MIGO">MIGO - Goods Movement</option>
          <option value="MB1A">MB1A - Goods Issue</option>
          <option value="MB1C">MB1C - Other Goods Receipt</option>
        </select>
      </div>
      <div className="field-item"><label>Movement Type</label><input type="text" defaultValue="701" /></div>
      <div className="field-item"><label>Plant</label><input type="text" defaultValue={item.plant} /></div>
      <div className="field-item"><label>Storage Location</label><input type="text" defaultValue={item.sloc} /></div>
      <div className="field-item"><label>Material</label><input type="text" defaultValue={item.material} /></div>
      <div className="field-item"><label>Batch</label><input type="text" defaultValue={item.batch} /></div>
      <div className="field-item"><label>Quantity</label><input type="number" defaultValue="24" /></div>
      <div className="field-item"><label>Unit of Measure</label><input type="text" defaultValue={item.unit} /></div>
      <div className="field-item">
        <label>Reason Code</label>
        <select defaultValue="01">
          <option value="01">01 - Quantity Correction</option>
          <option value="02">02 - Goods Receipt Adjustment</option>
          <option value="03">03 - Inventory Recount</option>
        </select>
      </div>
      <div className="field-item"><label>Reference Document</label><input type="text" defaultValue={item.po} /></div>
      <div className="field-item"><label>Header Text</label><input type="text" defaultValue={`Adj per ${item.id} - GR shortfall correction`} /></div>
      <div className="field-item"><label>Posting Date</label><input type="date" defaultValue="2025-01-16" /></div>
    </div>
  );
}

function ActionsPanel({ item, onClose }) {
  const { showToast } = useToast();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
      <button className="btn btn-success" onClick={() => { showToast('SAP posting initiated — Movement Document created'); onClose(); }}>Post to SAP</button>
      <button className="btn btn-primary" onClick={() => showToast('Email composer opened')}>Send Email</button>
      <button className="btn btn-warning" onClick={() => showToast('Work item escalated to Team Lead')}>Escalate</button>
      <button className="btn btn-secondary" onClick={() => { showToast('Work item closed'); onClose(); }}>Close</button>
      <button className="btn btn-danger" onClick={() => { showToast('Work item rejected'); onClose(); }}>Reject</button>
    </div>
  );
}
