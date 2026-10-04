import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

// Email templates organized by process area and status trigger
const templatesByProcess = {
  adjustment: {
    label: 'Adjustment',
    templates: [
      { value: 'adj-stock-confirmation', label: 'Stock Confirmation Request', status: 'New / RCA Active', description: 'Ask vendor to confirm physical count' },
      { value: 'adj-investigation-update', label: 'Investigation Update', status: 'RCA Active', description: 'Request MB51/MB52 data or BLCK trace from vendor' },
      { value: 'adj-approval-request', label: 'Approval Request', status: 'Pending Approval', description: 'Submit adjustment for manager/category leader approval' },
      { value: 'adj-posting-confirmation', label: 'Posting Confirmation', status: 'Completed', description: 'Notify vendor that SAP posting is done (701/702)' },
      { value: 'adj-followup-overdue', label: 'Follow-up (Overdue)', status: 'Overdue >30d', description: 'Escalation reminder for aging work items' },
      { value: 'adj-batch-correction', label: 'Batch Correction Notice', status: 'In Progress', description: 'Notify about batch swap / MIGO A08 posting' },
    ]
  },
  transfer: {
    label: 'Transfer',
    templates: [
      { value: 'trf-sto-request', label: 'STO Transfer Request', status: 'New', description: 'Request cross-plant STO creation and shipping' },
      { value: 'trf-cost-center-verify', label: 'Cost Center Verification', status: 'Awaiting CC#', description: 'Ask Brand/Marketing to confirm cost center' },
      { value: 'trf-pgi-confirmation', label: 'PGI / Shipment Confirmation', status: 'PGI Done', description: 'Confirm shipment dispatched, request GR monitoring' },
      { value: 'trf-gr-confirmation', label: 'GR Confirmation Request', status: 'In Transit', description: 'Ask receiving plant to confirm goods receipt' },
      { value: 'trf-sample-proforma', label: 'Sample Pro-Forma Invoice', status: 'Blocked (outside-EU)', description: 'Request pro-forma for cross-border sample transfer' },
      { value: 'trf-followup-overdue', label: 'Follow-up (Overdue)', status: 'Overdue >30d', description: 'Escalation for stuck transfers' },
    ]
  },
  destruction: {
    label: 'Destruction',
    templates: [
      { value: 'dst-tpm-confirm', label: 'TPM Confirmation Request', status: 'TPM Confirming', description: 'Ask TPM to confirm material for destruction' },
      { value: 'dst-dsv-schedule', label: 'DSV Destruction Scheduling', status: 'Ready to Write-Off', description: 'Coordinate destruction date with DSV logistics' },
      { value: 'dst-approval-request', label: 'Destruction Approval', status: 'Awaiting Approval', description: 'Submit DAV/QN for finance/manager approval' },
      { value: 'dst-certificate-request', label: 'Certificate of Destruction', status: 'Written Off', description: 'Request CoD from destruction service provider' },
      { value: 'dst-dg-ehs-signoff', label: 'DG / EHS Sign-off', status: 'Dangerous Goods', description: 'Request EHS team approval for hazardous materials' },
      { value: 'dst-followup-overdue', label: 'Follow-up (Overdue)', status: 'Overdue >30d', description: 'Escalation for aging destruction items' },
    ]
  }
};

// Full email template bodies
const templateBodies = {
  // === ADJUSTMENT TEMPLATES ===
  'adj-stock-confirmation': {
    to: 'warehouse.ops@{vendor}.com',
    cc: 'tpm.inventory@elcompanies.com',
    subject: 'Stock Confirmation Required - Material {material} at Plant {plant}',
    body: `Dear Warehouse Team,

We are writing to confirm the current stock position for the following material:

Material: {material} - {materialDesc}
Plant: {plant} ({plantName})
Storage Location: {sloc}
PO Reference: {po}

Our SAP system shows a discrepancy against the expected quantity. Could you please confirm the physical stock count at your end and advise if there are any variances?

Please respond by end of business tomorrow.

Best regards,
{analyst}
TPM Inventory Team`
  },
  'adj-investigation-update': {
    to: 'warehouse.ops@{vendor}.com',
    cc: 'tpm.inventory@elcompanies.com; planning.team@elcompanies.com',
    subject: 'Investigation Update Required - {id} Material {material}',
    body: `Dear Team,

We are investigating a stock discrepancy for the following work item:

Work Item: {id}
Material: {material} - {materialDesc}
Plant: {plant}
Variance: {variance}

To complete our root cause analysis, we need the following information:
1. MB51 movement history for the past 30 days
2. Confirmation of any recent goods movements (GR/GI)
3. Any pending ASN or in-transit shipments
4. BLCK stock status (if applicable)

Please provide this information within 48 hours.

Regards,
{analyst}
TPM Inventory Team`
  },
  'adj-approval-request': {
    to: 'approver@elcompanies.com',
    cc: 'tpm.inventory@elcompanies.com',
    subject: 'Approval Required - Inventory Adjustment {id} ({value})',
    body: `Dear {approver},

The following inventory adjustment requires your approval:

Work Item: {id}
Material: {material} - {materialDesc}
Plant: {plant} ({plantName})
Quantity: {qty}
Value: {value}
Root Cause: {classification}

Investigation Summary:
- Physical count confirmed by vendor
- SAP vs Physical variance verified
- Movement type: 701 (write-off) / 702 (write-on)

Please approve or reject via the SynOps approval portal, or reply to this email with your decision.

Regards,
{analyst}
TPM Inventory Team`
  },
  'adj-posting-confirmation': {
    to: 'warehouse.ops@{vendor}.com',
    cc: 'tpm.inventory@elcompanies.com',
    subject: 'SAP Posting Completed - {id} Material {material}',
    body: `Dear Team,

This is to confirm that the following inventory adjustment has been posted in SAP:

Work Item: {id}
Material: {material}
Plant: {plant}
Quantity Adjusted: {qty}
Movement Type: 701/702
Posting Date: {today}

The SAP stock now reflects the corrected physical count. No further action is required from your side.

Best regards,
{analyst}
TPM Inventory Team`
  },
  'adj-followup-overdue': {
    to: 'warehouse.ops@{vendor}.com',
    cc: 'tpm.inventory@elcompanies.com; tpm.teamlead@elcompanies.com',
    subject: '⚠️ OVERDUE - Follow-up Required - {id} (Aging: >30 days)',
    body: `Dear Team,

This is an escalation follow-up. The below work item has exceeded our 30-day SLA:

Work Item: {id}
Material: {material} - {materialDesc}
Plant: {plant}
Status: {status}
Days Open: >30 days

This item requires immediate attention. If we do not receive a response within 48 hours, it will be escalated to management.

Please provide an update or complete the outstanding action.

Regards,
{analyst}
TPM Inventory Team`
  },
  'adj-batch-correction': {
    to: 'warehouse.ops@{vendor}.com',
    cc: 'tpm.inventory@elcompanies.com',
    subject: 'Batch Correction Completed - Material {material}',
    body: `Dear Team,

A batch correction has been processed for the following material:

Material: {material} - {materialDesc}
Plant: {plant}
Old Batch: {oldBatch}
New Batch (Corrected): {newBatch}
Quantity: {qty}
Movement: MIGO A08 (Batch Swap)

SAP now reflects the correct production batch. Please update your records accordingly.

Best regards,
{analyst}
TPM Inventory Team`
  },

  // === TRANSFER TEMPLATES ===
  'trf-sto-request': {
    to: 'logistics@{vendor}.com',
    cc: 'tpm.inventory@elcompanies.com; planning.team@elcompanies.com',
    subject: 'Stock Transfer Request - {material} from {fromPlant} to {toPlant}',
    body: `Dear Logistics Team,

We require a stock transfer for the following:

Material: {material} - {materialDesc}
Quantity: {qty}
From: Plant {fromPlant} ({fromName})
To: Plant {toPlant} ({toName})
STO Reference: {sto}

Please confirm:
1. Shipping schedule
2. Expected dispatch date
3. Tracking details once shipped

Expected delivery window: 5-7 business days.

Best regards,
{analyst}
TPM Inventory Team`
  },
  'trf-cost-center-verify': {
    to: 'brand.marketing@elcompanies.com',
    cc: 'tpm.inventory@elcompanies.com',
    subject: 'Cost Center Confirmation Required - Transfer {id}',
    body: `Dear Brand Team,

We have received a sample/cost center transfer request but require cost center confirmation:

Work Item: {id}
Material: {material} - {materialDesc}
Quantity: {qty}
Destination: {toName}
Requested By: {requestedBy}

Please confirm:
1. Valid Cost Center number
2. Approving manager for this cost center
3. Whether this is a permanent transfer or loan

Without confirmation, we cannot process the 201 (cost center) posting.

Regards,
{analyst}
TPM Inventory Team`
  },
  'trf-pgi-confirmation': {
    to: 'logistics@{vendor}.com',
    cc: 'tpm.inventory@elcompanies.com',
    subject: 'PGI Confirmed - STO {sto} Shipped',
    body: `Dear Team,

This is to confirm that Post Goods Issue (PGI) has been completed for:

STO: {sto}
Delivery: {delivery}
Material: {material}
Quantity: {qty}
From: {fromPlant} ({fromName})
To: {toPlant} ({toName})

The shipment is now in transit. Please confirm receipt (Goods Receipt) upon delivery.

Regards,
{analyst}
TPM Inventory Team`
  },
  'trf-gr-confirmation': {
    to: 'warehouse.receiving@{vendor}.com',
    cc: 'tpm.inventory@elcompanies.com',
    subject: 'GR Confirmation Needed - STO {sto} Material {material}',
    body: `Dear Receiving Team,

A shipment is en route to your location. Please confirm Goods Receipt upon delivery:

STO: {sto}
Delivery: {delivery}
Material: {material} - {materialDesc}
Expected Qty: {qty}
ETA: Within 5-7 business days

Please post GR in SAP (MIGO) upon physical receipt and notify us of any discrepancies.

Regards,
{analyst}
TPM Inventory Team`
  },
  'trf-sample-proforma': {
    to: 'logistics@{vendor}.com',
    cc: 'tpm.inventory@elcompanies.com; customs@elcompanies.com',
    subject: 'Pro-Forma Invoice Required - Sample Transfer {id}',
    body: `Dear Team,

A sample transfer has been requested to a destination outside the EU. A pro-forma invoice is required for customs clearance:

Work Item: {id}
Material: {material} - {materialDesc}
Quantity: {qty}
From: {fromPlant} ({fromName})
To: {toPlant} ({toName})
Purpose: Sample / Testing (non-commercial)

Please prepare the pro-forma invoice with declared value for customs purposes.

Regards,
{analyst}
TPM Inventory Team`
  },
  'trf-followup-overdue': {
    to: 'logistics@{vendor}.com',
    cc: 'tpm.inventory@elcompanies.com; tpm.teamlead@elcompanies.com',
    subject: '⚠️ OVERDUE - Transfer Follow-up - {id} (Aging: >30 days)',
    body: `Dear Team,

This transfer has exceeded our standard processing SLA:

Work Item: {id}
Material: {material}
From: {fromPlant} → To: {toPlant}
Status: {status}
Days Open: >30 days

Please provide an immediate update on:
1. Current shipment status
2. Any blockers or issues
3. Expected completion date

If no response within 48 hours, this will be escalated.

Regards,
{analyst}
TPM Inventory Team`
  },

  // === DESTRUCTION TEMPLATES ===
  'dst-tpm-confirm': {
    to: 'warehouse.ops@{vendor}.com',
    cc: 'tpm.inventory@elcompanies.com',
    subject: 'Destruction Confirmation Required - {material} at {plant}',
    body: `Dear TPM Team,

The following material has been flagged for destruction. Please confirm:

Material: {material}
Plant: {plant}
Quantity: {qty}
Value: {value}
Source: DAV / QN

Please confirm:
1. Material is physically segregated and ready for collection
2. No outstanding production requirements
3. Dangerous goods classification (if applicable)

Regards,
{analyst}
TPM Inventory Team`
  },
  'dst-dsv-schedule': {
    to: 'destruction.services@dsv.com',
    cc: 'tpm.inventory@elcompanies.com',
    subject: 'Destruction Scheduling - {material} ({qty})',
    body: `Dear DSV Destruction Services,

Please schedule destruction collection for the following approved material:

Material: {material}
Quantity: {qty}
Value: {value}
Plant/Location: {plant}
Route: {route}
Dangerous Goods: {dg}

This item has been fully approved for write-off. Please confirm:
1. Available collection date
2. Transportation arrangements
3. Certificate of Destruction timeline

Best regards,
{analyst}
TPM Inventory Team`
  },
  'dst-approval-request': {
    to: 'approver@elcompanies.com',
    cc: 'tpm.inventory@elcompanies.com; finance@elcompanies.com',
    subject: 'Destruction Approval Required - {material} ({value})',
    body: `Dear {approver},

The following destruction request requires your approval:

Material: {material}
Quantity: {qty}
Write-off Value: {value}
Plant: {plant}
Source: {source} (DAV/QN)
Reason: Expiry / Quality Failure / Excess beyond redeployment

All destruction postings require minimum Category Leader approval per policy. Items above threshold require Finance Controller sign-off.

Please approve or reject.

Regards,
{analyst}
TPM Inventory Team`
  },
  'dst-certificate-request': {
    to: 'destruction.services@dsv.com',
    cc: 'tpm.inventory@elcompanies.com',
    subject: 'Certificate of Destruction Required - {material}',
    body: `Dear DSV Team,

The following material has been written off and destruction was completed. Please provide the Certificate of Destruction:

Material: {material}
Quantity: {qty}
Destruction Date: {today}
Plant: {plant}

We require the CoD for our audit records. Please send within 5 business days.

Regards,
{analyst}
TPM Inventory Team`
  },
  'dst-dg-ehs-signoff': {
    to: 'ehs.team@elcompanies.com',
    cc: 'tpm.inventory@elcompanies.com',
    subject: 'EHS Sign-off Required - Dangerous Goods Destruction - {material}',
    body: `Dear EHS Team,

The following material is classified as Dangerous Goods and requires EHS sign-off before destruction can proceed:

Material: {material}
Quantity: {qty}
Plant: {plant}
DG Classification: Yes
Hazard Type: [To be confirmed]

Please review and provide:
1. EHS clearance for destruction
2. Special handling/disposal requirements
3. Approved destruction facility confirmation

Regards,
{analyst}
TPM Inventory Team`
  },
  'dst-followup-overdue': {
    to: 'destruction.services@dsv.com',
    cc: 'tpm.inventory@elcompanies.com; tpm.teamlead@elcompanies.com',
    subject: '⚠️ OVERDUE - Destruction Follow-up - {material} (Aging: >30 days)',
    body: `Dear Team,

This destruction item has exceeded our 30-day SLA:

Material: {material}
Quantity: {qty}
Value: {value}
Status: {status}
Route: {route}

Please provide an immediate update on collection/destruction schedule. Failure to respond within 48 hours will result in management escalation.

Regards,
{analyst}
TPM Inventory Team`
  }
};

export default function ActionsScreen() {
  const { showToast } = useToast();
  const [selectedProcess, setSelectedProcess] = useState('adjustment');
  const [selectedTemplate, setSelectedTemplate] = useState('adj-stock-confirmation');
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Get templates for current process area
  const currentTemplates = templatesByProcess[selectedProcess]?.templates || [];

  // Load template when selection changes
  useEffect(() => {
    const tpl = templateBodies[selectedTemplate];
    if (tpl) {
      setTo(tpl.to);
      setCc(tpl.cc);
      setSubject(tpl.subject);
      setBody(tpl.body);
    }
  }, [selectedTemplate]);

  // When process area changes, select first template in that area
  useEffect(() => {
    const templates = templatesByProcess[selectedProcess]?.templates;
    if (templates && templates.length > 0) {
      setSelectedTemplate(templates[0].value);
    }
  }, [selectedProcess]);

  return (
    <div className="template-section">
      <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Email Template Composer</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 20 }}>
        <div className="form-group">
          <label>Process Area</label>
          <select value={selectedProcess} onChange={e => setSelectedProcess(e.target.value)}>
            {Object.entries(templatesByProcess).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Template</label>
          <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
            {currentTemplates.map(t => (
              <option key={t.value} value={t.value}>{t.label} — {t.status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Template description */}
      {currentTemplates.find(t => t.value === selectedTemplate) && (
        <div style={{ marginBottom: 16, padding: '8px 14px', background: 'var(--primary-light)', borderRadius: 'var(--radius)', fontSize: 12, fontFamily: 'Graphik-Medium', color: 'var(--primary-dark)' }}>
          {currentTemplates.find(t => t.value === selectedTemplate)?.description}
        </div>
      )}

      <div className="form-group">
        <label>To</label>
        <input type="text" value={to} onChange={e => setTo(e.target.value)} />
      </div>
      <div className="form-group">
        <label>CC</label>
        <input type="text" value={cc} onChange={e => setCc(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Subject</label>
        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Body</label>
        <textarea value={body} onChange={e => setBody(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={() => showToast('Draft saved successfully')}>Save Draft</button>
        <button className="btn btn-primary" onClick={() => showToast('Email sent successfully ✓')}>Send</button>
      </div>
    </div>
  );
}
