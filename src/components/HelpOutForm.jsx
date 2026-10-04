import { useState } from 'react';
import { useToast } from '../context/ToastContext';

const requestTypes = [
  { id: 'adjustment', label: 'Inventory Adjustment / Subsequent Adjustment', icon: '🔄' },
  { id: 'batch-transfer', label: 'Batch Transfer / Batch Swap', icon: '🔀' },
  { id: 'cross-plant', label: 'Cross-Plant Transfer (STO)', icon: '🚚' },
  { id: 'same-plant', label: 'Same-Plant Transfer (TPM to TPM)', icon: '↔️' },
  { id: 'samples', label: 'Samples / Cost Center Transfer', icon: '📦' },
  { id: 'asn-reversal', label: 'ASN Reversal', icon: '⏪' },
];

// Simulated SynOps pre-filled data (from Master Data + Transaction Data)
const synOpsPreFill = {
  plannerName: 'Bhagirath Tanna',
  plannerEmail: 'btanna@estee.com',
  plannerRole: 'TPM Planner — NA',
  submittedDate: new Date().toISOString().split('T')[0],
  region: 'NA',
};

export default function HelpOutForm() {
  const { showToast } = useToast();
  const [requestType, setRequestType] = useState('');
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    showToast('Help Out Form submitted successfully. Work Item created and routed to Inventory Analyst.');
  };

  const handleReset = () => {
    setRequestType('');
    setFormData({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ color: '#059669', marginBottom: '12px' }}>Form Submitted Successfully</h2>
        <p style={{ color: '#64748b', marginBottom: '8px' }}>Work Item has been created and routed to the Inventory Analyst queue.</p>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>WI Reference: <strong style={{ color: '#7c3aed' }}>WI-{Math.floor(3000 + Math.random() * 999)}</strong></p>
        <button className="btn btn-primary" onClick={handleReset}>Submit Another Request</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', color: '#333', marginBottom: '4px' }}>Help Out Form — TPM Planner Request</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>Submit a structured request to the Inventory Analyst team. Fields marked with 🤖 are pre-filled by SynOps from master/transaction data.</p>
      </div>

      {/* Pre-filled Planner Info */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', marginBottom: '10px' }}>🤖 SynOps Pre-Filled — Requestor Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
          <div><label style={labelStyle}>Planner Name</label><div style={prefilledStyle}>{synOpsPreFill.plannerName}</div></div>
          <div><label style={labelStyle}>Email</label><div style={prefilledStyle}>{synOpsPreFill.plannerEmail}</div></div>
          <div><label style={labelStyle}>Role</label><div style={prefilledStyle}>{synOpsPreFill.plannerRole}</div></div>
          <div><label style={labelStyle}>Date</label><div style={prefilledStyle}>{synOpsPreFill.submittedDate}</div></div>
        </div>
      </div>

      {/* Request Type Selection */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ ...labelStyle, marginBottom: '10px', display: 'block' }}>Select Request Type *</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {requestTypes.map(rt => (
            <button
              key={rt.id}
              onClick={() => { setRequestType(rt.id); setFormData({}); }}
              style={{
                padding: '14px 16px', border: requestType === rt.id ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                borderRadius: '8px', background: requestType === rt.id ? '#f5f3ff' : 'white', cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.15s', fontSize: '12.5px', fontWeight: 600,
                color: requestType === rt.id ? '#7c3aed' : '#475569'
              }}
            >
              <span style={{ fontSize: '18px', marginRight: '8px' }}>{rt.icon}</span>{rt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Form Fields Based on Request Type */}
      {requestType && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', color: '#1e293b', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
            {requestTypes.find(r => r.id === requestType)?.icon} {requestTypes.find(r => r.id === requestType)?.label}
          </h3>

          {requestType === 'adjustment' && <AdjustmentFields formData={formData} updateField={updateField} />}
          {requestType === 'batch-transfer' && <BatchTransferFields formData={formData} updateField={updateField} />}
          {requestType === 'cross-plant' && <CrossPlantFields formData={formData} updateField={updateField} />}
          {requestType === 'same-plant' && <SamePlantFields formData={formData} updateField={updateField} />}
          {requestType === 'samples' && <SamplesFields formData={formData} updateField={updateField} />}
          {requestType === 'asn-reversal' && <ASNReversalFields formData={formData} updateField={updateField} />}

          {/* Common: Notes & Attachments */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Additional Notes / Comments</label>
                <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} placeholder="Any additional context..." value={formData.notes || ''} onChange={e => updateField('notes', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Attachments (Packing List, Screenshot, etc.)</label>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                  📎 Drag & drop files here or click to upload
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={handleReset}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} style={{ padding: '10px 28px' }}>Submit Help Out Form</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ADJUSTMENT FIELDS
// ═══════════════════════════════════════════════════════════
function AdjustmentFields({ formData, updateField }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
      <div><label style={labelStyle}>PO Number *</label><input style={inputStyle} placeholder="e.g. 4503298670" value={formData.po || ''} onChange={e => updateField('po', e.target.value)} /></div>
      <div><label style={labelStyle}>PO Line *</label><input style={inputStyle} placeholder="e.g. 10, 20" value={formData.poLine || ''} onChange={e => updateField('poLine', e.target.value)} /></div>
      <div><label style={labelStyle}>Material Number *</label><input style={inputStyle} placeholder="e.g. J0HW010701" value={formData.material || ''} onChange={e => updateField('material', e.target.value)} /></div>
      <div><label style={labelStyle}>🤖 Material Description</label><div style={prefilledStyle}>{formData.material ? 'Auto-fetched from SAP' : '—'}</div></div>
      <div><label style={labelStyle}>Quantity *</label><input style={inputStyle} placeholder="e.g. 600" value={formData.qty || ''} onChange={e => updateField('qty', e.target.value)} /></div>
      <div><label style={labelStyle}>UoM</label><input style={inputStyle} placeholder="EA / KG / L" value={formData.uom || ''} onChange={e => updateField('uom', e.target.value)} /></div>
      <div><label style={labelStyle}>Plant *</label><input style={inputStyle} placeholder="e.g. 2020" value={formData.plant || ''} onChange={e => updateField('plant', e.target.value)} /></div>
      <div><label style={labelStyle}>🤖 Vendor Name</label><div style={prefilledStyle}>{formData.plant ? 'Auto-fetched from Plant Master' : '—'}</div></div>
      <div><label style={labelStyle}>Vendor Code</label><input style={inputStyle} placeholder="e.g. 10045732" value={formData.vendorCode || ''} onChange={e => updateField('vendorCode', e.target.value)} /></div>
      <div><label style={labelStyle}>Batch (if applicable)</label><input style={inputStyle} placeholder="e.g. B2026050101" value={formData.batch || ''} onChange={e => updateField('batch', e.target.value)} /></div>
      <div><label style={labelStyle}>Reason for Adjustment *</label>
        <select style={inputStyle} value={formData.reason || ''} onChange={e => updateField('reason', e.target.value)}>
          <option value="">Select reason...</option>
          <option value="scrap">Scrap — No physical stock</option>
          <option value="consumption-error">Wrong consumption qty</option>
          <option value="stock-mismatch">Stock mismatch (TPM vs SAP)</option>
          <option value="gr-error">GR Error — Wrong qty posted</option>
          <option value="other">Other (specify in notes)</option>
        </select>
      </div>
      <div><label style={labelStyle}>Total Cost (for approval) *</label><input style={inputStyle} placeholder="e.g. $1,800" value={formData.totalCost || ''} onChange={e => updateField('totalCost', e.target.value)} /></div>
      <div><label style={labelStyle}>🤖 MB52 Unrestricted Qty</label><div style={prefilledStyle}>{formData.material && formData.plant ? '600 EA (auto-queried)' : '—'}</div></div>
      <div><label style={labelStyle}>🤖 Approval Required?</label><div style={prefilledStyle}>{formData.totalCost ? (parseInt(formData.totalCost.replace(/[^0-9]/g, '')) > 1000 ? '⚠ YES (> $1K)' : '✓ No') : '—'}</div></div>
      <div><label style={labelStyle}>Approver (if {'>'}$1K)</label><input style={inputStyle} placeholder="Manager name" value={formData.approver || ''} onChange={e => updateField('approver', e.target.value)} /></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BATCH TRANSFER FIELDS
// ═══════════════════════════════════════════════════════════
function BatchTransferFields({ formData, updateField }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
      <div><label style={labelStyle}>PO Number *</label><input style={inputStyle} placeholder="e.g. 4503298670" value={formData.po || ''} onChange={e => updateField('po', e.target.value)} /></div>
      <div><label style={labelStyle}>PO Line</label><input style={inputStyle} placeholder="e.g. 10" value={formData.poLine || ''} onChange={e => updateField('poLine', e.target.value)} /></div>
      <div><label style={labelStyle}>Material Number *</label><input style={inputStyle} placeholder="e.g. J1KP010163" value={formData.material || ''} onChange={e => updateField('material', e.target.value)} /></div>
      <div><label style={labelStyle}>🤖 Material Description</label><div style={prefilledStyle}>{formData.material ? 'Auto-fetched from SAP' : '—'}</div></div>
      <div><label style={labelStyle}>Plant *</label><input style={inputStyle} placeholder="e.g. 2020" value={formData.plant || ''} onChange={e => updateField('plant', e.target.value)} /></div>
      <div><label style={labelStyle}>🤖 Vendor Name</label><div style={prefilledStyle}>{formData.plant ? 'Auto-fetched' : '—'}</div></div>
      <div><label style={labelStyle}>Quantity *</label><input style={inputStyle} placeholder="e.g. 1800" value={formData.qty || ''} onChange={e => updateField('qty', e.target.value)} /></div>
      <div><label style={labelStyle}>UoM</label><input style={inputStyle} placeholder="EA / KG" value={formData.uom || ''} onChange={e => updateField('uom', e.target.value)} /></div>
      <div><label style={labelStyle}>Storage Location</label><input style={inputStyle} placeholder="e.g. FG01 / MRP Area" value={formData.sloc || ''} onChange={e => updateField('sloc', e.target.value)} /></div>
      <div style={{ gridColumn: 'span 3', background: '#fef3c7', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fcd34d' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>⚠ Batch Details (Required)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div><label style={labelStyle}>Wrong Batch (currently in SAP) *</label><input style={inputStyle} placeholder="e.g. B2026060501" value={formData.wrongBatch || ''} onChange={e => updateField('wrongBatch', e.target.value)} /></div>
          <div><label style={labelStyle}>Correct Batch (physical stock) *</label><input style={inputStyle} placeholder="e.g. B2026071001" value={formData.correctBatch || ''} onChange={e => updateField('correctBatch', e.target.value)} /></div>
          <div><label style={labelStyle}>Wrong Batch Expiry</label><input style={inputStyle} type="date" value={formData.wrongBatchExpiry || ''} onChange={e => updateField('wrongBatchExpiry', e.target.value)} /></div>
          <div><label style={labelStyle}>Correct Batch Expiry</label><input style={inputStyle} type="date" value={formData.correctBatchExpiry || ''} onChange={e => updateField('correctBatchExpiry', e.target.value)} /></div>
        </div>
      </div>
      <div><label style={labelStyle}>Reason *</label>
        <select style={inputStyle} value={formData.reason || ''} onChange={e => updateField('reason', e.target.value)}>
          <option value="">Select...</option>
          <option value="wrong-gr">Wrong batch selected during GR</option>
          <option value="wrong-consumption">Wrong batch during consumption</option>
          <option value="asn-batch">ASN had wrong batch from vendor</option>
          <option value="late-substitution">Late production batch substitution</option>
        </select>
      </div>
      <div><label style={labelStyle}>🤖 MB52 Stock (Wrong Batch)</label><div style={prefilledStyle}>{formData.wrongBatch && formData.plant ? '1,800 EA Unrestricted ✓' : '—'}</div></div>
      <div><label style={labelStyle}>🤖 Transaction</label><div style={prefilledStyle}>MIGO A08 (MvT 309)</div></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CROSS-PLANT TRANSFER FIELDS
// ═══════════════════════════════════════════════════════════
function CrossPlantFields({ formData, updateField }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
      <div><label style={labelStyle}>Material Number *</label><input style={inputStyle} placeholder="e.g. 3891045672" value={formData.material || ''} onChange={e => updateField('material', e.target.value)} /></div>
      <div><label style={labelStyle}>🤖 Material Description</label><div style={prefilledStyle}>{formData.material ? 'Auto-fetched' : '—'}</div></div>
      <div><label style={labelStyle}>Quantity *</label><input style={inputStyle} placeholder="e.g. 400" value={formData.qty || ''} onChange={e => updateField('qty', e.target.value)} /></div>
      <div><label style={labelStyle}>UoM</label><input style={inputStyle} placeholder="EA / KG" value={formData.uom || ''} onChange={e => updateField('uom', e.target.value)} /></div>
      <div><label style={labelStyle}>Batch</label><input style={inputStyle} placeholder="e.g. 000672B24" value={formData.batch || ''} onChange={e => updateField('batch', e.target.value)} /></div>
      <div><label style={labelStyle}>STO Number (if created)</label><input style={inputStyle} placeholder="e.g. 4302776084" value={formData.sto || ''} onChange={e => updateField('sto', e.target.value)} /></div>
      <div style={{ gridColumn: 'span 3', background: '#eff6ff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>📍 From / To Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div><label style={labelStyle}>Sending Plant *</label><input style={inputStyle} placeholder="e.g. 6010" value={formData.fromPlant || ''} onChange={e => updateField('fromPlant', e.target.value)} /></div>
          <div><label style={labelStyle}>Receiving Plant *</label><input style={inputStyle} placeholder="e.g. 6030" value={formData.toPlant || ''} onChange={e => updateField('toPlant', e.target.value)} /></div>
          <div><label style={labelStyle}>🤖 Sending Vendor</label><div style={prefilledStyle}>{formData.fromPlant ? 'Auto-fetched from Plant Master' : '—'}</div></div>
          <div><label style={labelStyle}>🤖 Receiving Vendor</label><div style={prefilledStyle}>{formData.toPlant ? 'Auto-fetched from Plant Master' : '—'}</div></div>
        </div>
      </div>
      <div><label style={labelStyle}>Reason for Transfer *</label>
        <select style={inputStyle} value={formData.reason || ''} onChange={e => updateField('reason', e.target.value)}>
          <option value="">Select...</option>
          <option value="shortage">Shortage at destination plant</option>
          <option value="production-ramp">Production ramp-up at destination</option>
          <option value="rebalancing">Inventory rebalancing</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div><label style={labelStyle}>🤖 MB52 Stock at Sending Plant</label><div style={prefilledStyle}>{formData.fromPlant && formData.material ? '520 EA Unrestricted ✓' : '—'}</div></div>
      <div><label style={labelStyle}>Requested Delivery Date</label><input style={inputStyle} type="date" value={formData.deliveryDate || ''} onChange={e => updateField('deliveryDate', e.target.value)} /></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SAME-PLANT TRANSFER FIELDS
// ═══════════════════════════════════════════════════════════
function SamePlantFields({ formData, updateField }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
      <div><label style={labelStyle}>Material Number *</label><input style={inputStyle} placeholder="e.g. 5612034789" value={formData.material || ''} onChange={e => updateField('material', e.target.value)} /></div>
      <div><label style={labelStyle}>🤖 Material Description</label><div style={prefilledStyle}>{formData.material ? 'Auto-fetched' : '—'}</div></div>
      <div><label style={labelStyle}>Plant *</label><input style={inputStyle} placeholder="e.g. 6030" value={formData.plant || ''} onChange={e => updateField('plant', e.target.value)} /></div>
      <div><label style={labelStyle}>Quantity *</label><input style={inputStyle} placeholder="e.g. 100" value={formData.qty || ''} onChange={e => updateField('qty', e.target.value)} /></div>
      <div><label style={labelStyle}>UoM</label><input style={inputStyle} placeholder="KG / EA" value={formData.uom || ''} onChange={e => updateField('uom', e.target.value)} /></div>
      <div><label style={labelStyle}>Batch</label><input style={inputStyle} placeholder="e.g. 000789C25" value={formData.batch || ''} onChange={e => updateField('batch', e.target.value)} /></div>
      <div><label style={labelStyle}>Sending Vendor Code *</label><input style={inputStyle} placeholder="e.g. 10089234" value={formData.fromVendor || ''} onChange={e => updateField('fromVendor', e.target.value)} /></div>
      <div><label style={labelStyle}>🤖 Sending Vendor Name</label><div style={prefilledStyle}>{formData.fromVendor ? 'COSMAX Korea (auto)' : '—'}</div></div>
      <div><label style={labelStyle}>Receiving Vendor Code *</label><input style={inputStyle} placeholder="e.g. 10078901" value={formData.toVendor || ''} onChange={e => updateField('toVendor', e.target.value)} /></div>
      <div><label style={labelStyle}>🤖 Receiving Vendor Name</label><div style={prefilledStyle}>{formData.toVendor ? 'Kolmar Korea (auto)' : '—'}</div></div>
      <div><label style={labelStyle}>Reason *</label>
        <select style={inputStyle} value={formData.reason || ''} onChange={e => updateField('reason', e.target.value)}>
          <option value="">Select...</option>
          <option value="secondary-filler">Secondary filler needs material</option>
          <option value="production-shift">Production responsibility shift</option>
          <option value="excess-rebalance">Excess rebalancing between vendors</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div><label style={labelStyle}>🤖 Movement Types</label><div style={prefilledStyle}>MvT 542 → MvT 541 (via EXFER)</div></div>
      <div><label style={labelStyle}>Physical Material Already Moved?</label>
        <select style={inputStyle} value={formData.alreadyMoved || ''} onChange={e => updateField('alreadyMoved', e.target.value)}>
          <option value="">Select...</option>
          <option value="yes">Yes — already at receiving vendor</option>
          <option value="no">No — awaiting SAP posting first</option>
        </select>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SAMPLES / COST CENTER FIELDS
// ═══════════════════════════════════════════════════════════
function SamplesFields({ formData, updateField }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
      <div><label style={labelStyle}>Material Number *</label><input style={inputStyle} placeholder="e.g. J0P2100012" value={formData.material || ''} onChange={e => updateField('material', e.target.value)} /></div>
      <div><label style={labelStyle}>🤖 Material Description</label><div style={prefilledStyle}>{formData.material ? 'Auto-fetched' : '—'}</div></div>
      <div><label style={labelStyle}>Quantity *</label><input style={inputStyle} placeholder="e.g. 90" value={formData.qty || ''} onChange={e => updateField('qty', e.target.value)} /></div>
      <div><label style={labelStyle}>Plant *</label><input style={inputStyle} placeholder="e.g. 7001" value={formData.plant || ''} onChange={e => updateField('plant', e.target.value)} /></div>
      <div><label style={labelStyle}>Vendor Code *</label><input style={inputStyle} placeholder="e.g. 10002829" value={formData.vendorCode || ''} onChange={e => updateField('vendorCode', e.target.value)} /></div>
      <div><label style={labelStyle}>Batch</label><input style={inputStyle} placeholder="If applicable" value={formData.batch || ''} onChange={e => updateField('batch', e.target.value)} /></div>
      <div><label style={labelStyle}>Cost Center *</label><input style={inputStyle} placeholder="e.g. 16765517007001" value={formData.costCenter || ''} onChange={e => updateField('costCenter', e.target.value)} /></div>
      <div><label style={labelStyle}>🤖 CC Validation</label><div style={prefilledStyle}>{formData.costCenter ? (formData.costCenter.length > 10 ? '✓ Valid' : '⚠ Check format') : '—'}</div></div>
      <div><label style={labelStyle}>Company Code</label><input style={inputStyle} placeholder="e.g. 1676" value={formData.companyCode || ''} onChange={e => updateField('companyCode', e.target.value)} /></div>
      <div><label style={labelStyle}>Ship-To Address *</label><input style={{ ...inputStyle, gridColumn: 'span 2' }} placeholder="Full address including Attn:" value={formData.shipTo || ''} onChange={e => updateField('shipTo', e.target.value)} /></div>
      <div><label style={labelStyle}>Brand / Requestor *</label><input style={inputStyle} placeholder="e.g. Megan Garcia (Le Labo)" value={formData.requestor || ''} onChange={e => updateField('requestor', e.target.value)} /></div>
      <div><label style={labelStyle}>Purpose *</label>
        <select style={inputStyle} value={formData.purpose || ''} onChange={e => updateField('purpose', e.target.value)}>
          <option value="">Select...</option>
          <option value="package-testing">Package Testing</option>
          <option value="stability-testing">Stability Testing</option>
          <option value="formulation-testing">Formulation Testing</option>
          <option value="marketing-samples">Marketing Samples</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div><label style={labelStyle}>🤖 Movement Types</label><div style={prefilledStyle}>MvT 542 → MvT 201 (Issue to CC)</div></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ASN REVERSAL FIELDS
// ═══════════════════════════════════════════════════════════
function ASNReversalFields({ formData, updateField }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
      <div><label style={labelStyle}>PO Number *</label><input style={inputStyle} placeholder="e.g. 4503271664" value={formData.po || ''} onChange={e => updateField('po', e.target.value)} /></div>
      <div><label style={labelStyle}>PO Line *</label><input style={inputStyle} placeholder="e.g. 10" value={formData.poLine || ''} onChange={e => updateField('poLine', e.target.value)} /></div>
      <div><label style={labelStyle}>Material Number *</label><input style={inputStyle} placeholder="e.g. M3HX010000" value={formData.material || ''} onChange={e => updateField('material', e.target.value)} /></div>
      <div><label style={labelStyle}>🤖 Material Description</label><div style={prefilledStyle}>{formData.material ? 'Auto-fetched' : '—'}</div></div>
      <div><label style={labelStyle}>Quantity *</label><input style={inputStyle} placeholder="e.g. 2400" value={formData.qty || ''} onChange={e => updateField('qty', e.target.value)} /></div>
      <div><label style={labelStyle}>Plant *</label><input style={inputStyle} placeholder="e.g. 2020" value={formData.plant || ''} onChange={e => updateField('plant', e.target.value)} /></div>
      <div><label style={labelStyle}>🤖 ASN / Inbound Delivery#</label><div style={prefilledStyle}>{formData.po ? 'Auto-queried from ME23N Confirmation Tab' : '—'}</div></div>
      <div><label style={labelStyle}>🤖 STO# (Auto-created)</label><div style={prefilledStyle}>{formData.po ? 'Auto-identified via ZMRGT' : '—'}</div></div>
      <div><label style={labelStyle}>🤖 GR Status at DC</label><div style={prefilledStyle}>{formData.po ? 'Checking...' : '—'}</div></div>
      <div><label style={labelStyle}>Reason for Reversal *</label>
        <select style={inputStyle} value={formData.reason || ''} onChange={e => updateField('reason', e.target.value)}>
          <option value="">Select...</option>
          <option value="wrong-batch">Wrong batch consumed in portal</option>
          <option value="wrong-qty">Wrong quantity consumed</option>
          <option value="po-change">PO needs modification before GR</option>
          <option value="cancel-shipment">Shipment cancelled</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div><label style={labelStyle}>Correct Batch (for recreation)</label><input style={inputStyle} placeholder="e.g. B2026070301" value={formData.correctBatch || ''} onChange={e => updateField('correctBatch', e.target.value)} /></div>
      <div><label style={labelStyle}>Correct Qty (if different)</label><input style={inputStyle} placeholder="Same or corrected qty" value={formData.correctQty || ''} onChange={e => updateField('correctQty', e.target.value)} /></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════════════════════
const labelStyle = { fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px', display: 'block' };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', color: '#1e293b', outline: 'none' };
const prefilledStyle = { padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '12.5px', color: '#065f46', fontWeight: 500 };
