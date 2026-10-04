import { useState } from 'react';
import { ruleCatalog, ruleApproval, ruleScrapDecision, ruleLDEligibility, ruleMovementType, ruleGuards, ruleFormulaRoute, ruleStoChain } from '../data/onrBusinessRules';

const tabs = [
  { id: 'vendor-email', label: 'Vendor Email Domain Map', icon: '📧' },
  { id: 'vendor-plant', label: 'Vendor-Plant Assignment', icon: '🏭' },
  { id: 'ia-master', label: 'IA User Master', icon: '👤' },
  { id: 'plant-region', label: 'Plant-Region Config', icon: '🌍' },
  { id: 'approval', label: 'Approval Thresholds', icon: '✅' },

  { id: 'destruction', label: 'Destruction Routing', icon: '🗑' },
  { id: 'onr-rules', label: 'ONR Business Rules (EMEA)', icon: '⚙' },
];

const vendorEmailData = [
  { domain: 'cosmax.co.kr', vendor: '10089234', name: 'COSMAX Korea', plant: '6030', region: 'APAC', country: 'KR', active: 'Y' },
  { domain: 'kolmar.co.kr', vendor: '10078901', name: 'Kolmar Korea', plant: '6030', region: 'APAC', country: 'KR', active: 'Y' },
  { domain: 'intercos-china.com', vendor: '10045891', name: 'Intercos China', plant: '6010', region: 'APAC', country: 'CN', active: 'Y' },
  { domain: 'cosmax-japan.co.jp', vendor: '10091234', name: 'COSMAX Japan', plant: '6020', region: 'APAC', country: 'JP', active: 'Y' },
  { domain: 'intercos-mic.com', vendor: '10067234', name: 'Intercos MIC', plant: '6050', region: 'APAC', country: 'CN', active: 'Y' },
  { domain: 'haneserie.com', vendor: '10045732', name: 'Hanes Erie', plant: '2020', region: 'NA', country: 'US', active: 'Y' },
  { domain: 'arcadebeauty.com', vendor: '10056789', name: 'Arcade Beauty', plant: '2020', region: 'NA', country: 'US', active: 'Y' },
  { domain: 'cosmax-usa.com', vendor: '10056789', name: 'COSMAX USA', plant: '2020', region: 'NA', country: 'US', active: 'Y' },
  { domain: 'contractcandles.com', vendor: '10034567', name: 'Contract Candles', plant: '3550', region: 'EMEA', country: 'BE', active: 'Y' },
  { domain: 'c-care.de', vendor: '10045891', name: 'C-Care', plant: '2020', region: 'NA', country: 'US', active: 'Y' },
];

const vendorPlantData = [
  { vendor: '10089234', plant: '6030', region: 'APAC', name: 'COSMAX Korea', country: 'KR', specStock: 'O', mrpArea: '6030', assignedIA: 'CWANG01', backupIA: 'NVENNA01', active: 'Y' },
  { vendor: '10078901', plant: '6030', region: 'APAC', name: 'Kolmar Korea', country: 'KR', specStock: 'O', mrpArea: '6030', assignedIA: 'CWANG01', backupIA: 'NVENNA01', active: 'Y' },
  { vendor: '10045891', plant: '6010', region: 'APAC', name: 'Intercos China', country: 'CN', specStock: 'O', mrpArea: '6010', assignedIA: 'CWANG01', backupIA: 'NVENNA01', active: 'Y' },
  { vendor: '10091234', plant: '6020', region: 'APAC', name: 'COSMAX Japan', country: 'JP', specStock: 'O', mrpArea: '6020', assignedIA: 'CWANG01', backupIA: 'NVENNA01', active: 'Y' },
  { vendor: '10045732', plant: '2020', region: 'NA', name: 'Hanes Erie', country: 'US', specStock: 'O', mrpArea: '2020', assignedIA: 'STIWARI01', backupIA: 'AMISHRA01', active: 'Y' },
  { vendor: '10056789', plant: '2020', region: 'NA', name: 'Arcade Beauty', country: 'US', specStock: 'O', mrpArea: '2020', assignedIA: 'STIWARI01', backupIA: 'AMISHRA01', active: 'Y' },
  { vendor: '10045732', plant: '4010', region: 'EMEA', name: 'Hanes Erie (Oevel)', country: 'BE', specStock: 'O', mrpArea: '4010', assignedIA: 'APOLKOW01', backupIA: 'NVENNA01', active: 'Y' },
  { vendor: '10034567', plant: '3550', region: 'EMEA', name: 'Contract Candles', country: 'BE', specStock: 'O', mrpArea: '3550', assignedIA: 'APOLKOW01', backupIA: 'NVENNA01', active: 'Y' },
];

const iaMasterData = [
  { id: 'CWANG01', name: 'Chris Wang', email: 'chris.wang@elcompanies.com', region: 'APAC', role: 'Inventory Analyst', teamLead: 'SZHAN01', maxWork: 50, available: 'Y', active: 'Y' },
  { id: 'STIWARI01', name: 'Sunand Tiwari', email: 'sunand.tiwari@elcompanies.com', region: 'NA', role: 'Inventory Analyst', teamLead: 'ERISU01', maxWork: 50, available: 'Y', active: 'Y' },
  { id: 'APOLKOW01', name: 'Anna Polkowska', email: 'anna.polkowska@elcompanies.com', region: 'EMEA', role: 'Inventory Analyst', teamLead: 'EMGR01', maxWork: 50, available: 'Y', active: 'Y' },
  { id: 'NVENNA01', name: 'Nayana Venna', email: 'nayana.venna@elcompanies.com', region: 'ALL', role: 'Inventory Analyst', teamLead: 'EMGR01', maxWork: 40, available: 'Y', active: 'Y' },
  { id: 'AMISHRA01', name: 'Anamika Mishra', email: 'anamika.mishra@elcompanies.com', region: 'NA', role: 'Inventory Analyst', teamLead: 'ERISU01', maxWork: 40, available: 'Y', active: 'Y' },
  { id: 'SZHAN01', name: 'Steven Zhang', email: 'steven.zhang@elcompanies.com', region: 'APAC', role: 'Sr. Planner', teamLead: '', maxWork: 20, available: 'Y', active: 'Y' },
];

const plantRegionData = [
  { plant: '2020', name: 'NA (Virtual — All NA TPM Vendors)', region: 'NA', country: 'US', companyCode: '4070', isVirtual: 'Y', deliveryTcode: 'VL10G', mvtSamePlant: '301', destructionRoute: 'ACA/MXI/Veolia', active: 'Y' },
  { plant: '4010', name: 'Oevel (Belgium)', region: 'EMEA', country: 'BE', companyCode: '4070', isVirtual: 'N', deliveryTcode: 'VL10B', mvtSamePlant: '542+541', destructionRoute: 'Local/3550/3020', active: 'Y' },
  { plant: '3550', name: 'DSV Belgium', region: 'EMEA', country: 'BE', companyCode: '4070', isVirtual: 'N', deliveryTcode: 'VL10B', mvtSamePlant: '542+541', destructionRoute: 'DSV Facility', active: 'Y' },
  { plant: '3020', name: 'Plant 3020 (Destruction)', region: 'EMEA', country: 'BE', companyCode: '4070', isVirtual: 'N', deliveryTcode: 'VL10B', mvtSamePlant: 'N/A', destructionRoute: 'Demand Suppression', active: 'Y' },
  { plant: '6010', name: 'China Bonded', region: 'APAC', country: 'CN', companyCode: '4070', isVirtual: 'N', deliveryTcode: 'VL10H', mvtSamePlant: '301', destructionRoute: 'DSV HK', active: 'Y' },
  { plant: '6020', name: 'Japan', region: 'APAC', country: 'JP', companyCode: '4070', isVirtual: 'N', deliveryTcode: 'VL10H', mvtSamePlant: '301', destructionRoute: 'DSV Japan', active: 'Y' },
  { plant: '6030', name: 'Korea', region: 'APAC', country: 'KR', companyCode: '4070', isVirtual: 'N', deliveryTcode: 'VL10H', mvtSamePlant: '301', destructionRoute: 'DSV Korea / TPM Local', active: 'Y' },
  { plant: '6050', name: 'China MIC', region: 'APAC', country: 'CN', companyCode: '4070', isVirtual: 'N', deliveryTcode: 'VL10H', mvtSamePlant: '301', destructionRoute: 'DSV Shanghai', active: 'Y' },
];

const approvalData = [
  { region: 'APAC', min: '0', max: '1000', required: 'N', role: 'NONE', approver: '—', currency: 'USD', escalation: '—', active: 'Y' },
  { region: 'APAC', min: '1000', max: '10000', required: 'Y', role: 'Sr. Planner', approver: 'Steven Zhang', currency: 'USD', escalation: '48', active: 'Y' },
  { region: 'APAC', min: '10000', max: '999999', required: 'Y', role: 'Regional Lead', approver: 'Rita', currency: 'USD', escalation: '48', active: 'Y' },
  { region: 'NA', min: '0', max: '1000', required: 'N', role: 'NONE', approver: '—', currency: 'USD', escalation: '—', active: 'Y' },
  { region: 'NA', min: '1000', max: '5000', required: 'Y', role: 'Sr. Planner', approver: 'Sr. Planner NA', currency: 'USD', escalation: '48', active: 'Y' },
  { region: 'NA', min: '5000', max: '999999', required: 'Y', role: 'Regional Lead', approver: 'Eric Su', currency: 'USD', escalation: '48', active: 'Y' },
  { region: 'EMEA', min: '0', max: '999999', required: 'N', role: 'NONE', approver: '—', currency: 'EUR', escalation: '—', active: 'Y' },
];

const keywordData = [
  { keyword: 'adjust', category: 'ADJUSTMENT', subCategory: 'SUBSEQUENT_ADJ', weight: 8, lang: 'EN', active: 'Y' },
  { keyword: 'discrepancy', category: 'ADJUSTMENT', subCategory: 'STOCK_DISCREPANCY', weight: 9, lang: 'EN', active: 'Y' },
  { keyword: 'mismatch', category: 'ADJUSTMENT', subCategory: 'STOCK_DISCREPANCY', weight: 8, lang: 'EN', active: 'Y' },
  { keyword: 'consumption', category: 'ADJUSTMENT', subCategory: 'SUBSEQUENT_ADJ', weight: 7, lang: 'EN', active: 'Y' },
  { keyword: 'ASN', category: 'ASN', subCategory: 'ASN_REVERSAL', weight: 10, lang: 'EN', active: 'Y' },
  { keyword: 'reversal', category: 'ASN', subCategory: 'ASN_REVERSAL', weight: 9, lang: 'EN', active: 'Y' },
  { keyword: 'delete ASN', category: 'ASN', subCategory: 'ASN_DELETION', weight: 10, lang: 'EN', active: 'Y' },
  { keyword: 'batch swap', category: 'ADJUSTMENT', subCategory: 'BATCH_SWAP', weight: 10, lang: 'EN', active: 'Y' },
  { keyword: 'transfer', category: 'TRANSFER', subCategory: 'CROSS_PLANT', weight: 8, lang: 'EN', active: 'Y' },
  { keyword: 'sample', category: 'TRANSFER', subCategory: 'SAMPLE_CC', weight: 8, lang: 'EN', active: 'Y' },
  { keyword: 'cost center', category: 'TRANSFER', subCategory: 'SAMPLE_CC', weight: 9, lang: 'EN', active: 'Y' },
  { keyword: 'ship to', category: 'TRANSFER', subCategory: 'CROSS_PLANT', weight: 7, lang: 'EN', active: 'Y' },
  { keyword: 'same plant', category: 'TRANSFER', subCategory: 'SAME_PLANT', weight: 9, lang: 'EN', active: 'Y' },
  { keyword: 'destroy', category: 'DESTRUCTION', subCategory: 'DESTRUCTION', weight: 9, lang: 'EN', active: 'Y' },
  { keyword: 'blocked', category: 'ADJUSTMENT', subCategory: 'BLCK_STOCK', weight: 7, lang: 'EN', active: 'Y' },
];

const destructionData = [
  { region: 'APAC', plant: '6010', dg: 'No', threshold: '5000', routeAbove: 'DSV HK', routeBelow: 'TPM Local', dsvEmail: 'dsv.hk@dsv.com', active: 'Y' },
  { region: 'APAC', plant: '6020', dg: 'No', threshold: '5000', routeAbove: 'DSV Japan', routeBelow: 'TPM Local', dsvEmail: 'dsv.japan@dsv.com', active: 'Y' },
  { region: 'APAC', plant: '6030', dg: 'No', threshold: '5000', routeAbove: 'DSV Korea', routeBelow: 'TPM Local', dsvEmail: 'dsv.korea@dsv.com', active: 'Y' },
  { region: 'APAC', plant: '6050', dg: 'No', threshold: '5000', routeAbove: 'DSV Shanghai', routeBelow: 'TPM Local', dsvEmail: 'dsv.shanghai@dsv.com', active: 'Y' },
  { region: 'EMEA', plant: 'ALL', dg: 'No', threshold: '0', routeAbove: 'Formula Sheet', routeBelow: 'Formula Sheet', dsvEmail: 'N/A', active: 'Y' },
  { region: 'NA', plant: '2020', dg: 'No', threshold: '0', routeAbove: 'ACA Waste', routeBelow: 'ACA Waste', dsvEmail: 'N/A', active: 'Y' },
  { region: 'NA', plant: '2020', dg: 'Yes', threshold: '0', routeAbove: 'MXI/Veolia', routeBelow: 'MXI/Veolia', dsvEmail: 'N/A', active: 'Y' },
];

function renderTable(headers, data) {
  return (
    <div className="table-container" style={{ marginTop: '12px' }}>
      <table>
        <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>{Object.values(row).map((v, j) => (
              <td key={j} style={{ fontSize: '11px' }}>
                {v === 'Y' ? <span style={{ color: '#059669', fontWeight: 700 }}>✓ Active</span> :
                 v === 'N' ? <span style={{ color: '#9CA3AF' }}>Inactive</span> : v}
              </td>
            ))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminConfig() {
  const [activeTab, setActiveTab] = useState('vendor-email');

  return (
    <div>
      <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'var(--primary-light)', borderRadius: 'var(--radius)', border: '1px solid #D8B4FE' }}>
        <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '14px', color: 'var(--primary-dark)' }}>⚙ Admin Configuration — Work Assignment Mapping Rules</div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Configure vendor-plant-IA assignment, approval thresholds, classification keywords, and destruction routing rules. Changes take effect immediately.</div>
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding: '8px 14px', borderRadius: '6px', border: activeTab === tab.id ? '2px solid var(--primary)' : '1px solid var(--border)', background: activeTab === tab.id ? 'var(--primary-light)' : 'var(--surface)', fontSize: '11px', fontFamily: 'Graphik-Medium', cursor: 'pointer', color: activeTab === tab.id ? 'var(--primary-dark)' : 'var(--text-secondary)' }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'vendor-email' && (
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Maps sender email domains to SAP vendor numbers. Used to identify which vendor sent the email and route to correct IA.</div>
          {renderTable(['Email Domain', 'Vendor#', 'Vendor Name', 'Primary Plant', 'Region', 'Country', 'Active'], vendorEmailData)}
        </div>
      )}

      {activeTab === 'vendor-plant' && (
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Core assignment rule: Vendor + Plant determines which IA receives the work item. Includes backup IA for OOO coverage.</div>
          {renderTable(['Vendor#', 'Plant', 'Region', 'Name', 'Country', 'SpecStock', 'MRP Area', 'Assigned IA', 'Backup IA', 'Active'], vendorPlantData)}
        </div>
      )}

      {activeTab === 'ia-master' && (
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Inventory Analyst user profiles with region, role, escalation targets, and availability status.</div>
          {renderTable(['IA ID', 'Full Name', 'Email', 'Region', 'Role', 'Team Lead', 'Max Workload', 'Available', 'Active'], iaMasterData)}
        </div>
      )}

      {activeTab === 'plant-region' && (
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Plant-level configuration: regional delivery T-code, movement type logic, virtual plant flag, and destruction routing defaults.</div>
          {renderTable(['Plant', 'Name', 'Region', 'Country', 'Co.Code', 'Virtual?', 'Delivery TCode', 'Same-Plant MvT', 'Destruction Route', 'Active'], plantRegionData)}
        </div>
      )}

      {activeTab === 'approval' && (
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Value-based approval thresholds per region. Determines who approves adjustments based on financial value.</div>
          {renderTable(['Region', 'Min Value', 'Max Value', 'Approval Reqd?', 'Approver Role', 'Approver Name', 'Currency', 'Escalation (hrs)', 'Active'], approvalData)}
        </div>
      )}



      {activeTab === 'destruction' && (
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Destruction routing rules: determines whether material goes to DSV or TPM local destruction based on region, plant, DG classification, and value.</div>
          {renderTable(['Region', 'Plant', 'Hazardous?', 'Threshold ($)', 'Route (Above)', 'Route (Below)', 'DSV Email', 'Active'], destructionData)}
        </div>
      )}

      {activeTab === 'onr-rules' && (
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>EMEA ONR decision logic, codified as configurable rules (replaces the analyst's manual Excel formulas). Each rule is traceable - the ONR Reports screen shows which rule ID derived each value. Editing thresholds/mappings here changes the derived decisions immediately.</div>

          {/* Rule catalog cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
            {ruleCatalog.map(r => (
              <div key={r.id} style={{ border: '1px solid var(--border)', borderTop: '3px solid var(--primary)', borderRadius: 'var(--radius)', padding: '10px 12px', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Graphik-Semibold', fontSize: '12px', color: 'var(--text)' }}>{r.name}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '10px', color: 'var(--primary)', background: 'var(--primary-light)', padding: '1px 6px', borderRadius: '3px' }}>{r.id}</span>
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.35 }}>{r.desc}</div>
              </div>
            ))}
          </div>

          {/* Editable-looking config tables for the two threshold rules */}
          <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '12px', color: 'var(--primary-dark)', margin: '8px 0 4px' }}>Approval Routing tiers ({ruleApproval.id})</div>
          {renderTable(['Min (EUR)', 'Max (EUR)', 'Approver Role', 'Currency'], ruleApproval.tiers.map(t => ({ min: t.min, max: (t.max > 1e11 ? 'no cap' : t.max), role: t.role, cur: t.currency })))}

          <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '12px', color: 'var(--primary-dark)', margin: '14px 0 4px' }}>Scrap decision threshold ({ruleScrapDecision.id})</div>
          {renderTable(['Parameter', 'Value'], [
            { p: 'Cost-difference threshold', v: 'EUR ' + ruleScrapDecision.costDiffThreshold },
            { p: 'Rule: qty equal', v: 'OK to scrap' },
            { p: 'Rule: cost diff < threshold', v: 'OK to scrap' },
            { p: 'Rule: cost diff > threshold', v: 'Request additional notification (contact planner)' },
          ])}

          <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '12px', color: 'var(--primary-dark)', margin: '14px 0 4px' }}>Scrapping transaction & movement type ({ruleMovementType.id})</div>
          {renderTable(['Condition', 'Transaction / MvT', 'Note'], [
            { c: 'QN write-off', m: ruleMovementType.transaction + ' / ' + ruleMovementType.mvtQN, n: 'Quality Notification scrapping' },
            { c: 'DAV write-off', m: ruleMovementType.transaction + ' / ' + ruleMovementType.mvtDAV, n: 'Destruction Approval Voucher write-off' },
            { c: 'Customs FREE/BONDED', m: 'per CUSTOM_STATUS', n: 'IPR -> BONDED; never mix FREE/BONDED' },
            { c: 'MIGO line cap', m: '-', n: 'Max ' + ruleMovementType.maxLinesPerMigo + ' lines/transaction' },
          ])}

          <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '12px', color: 'var(--primary-dark)', margin: '14px 0 4px' }}>EMEA Formula Sheet routing ({ruleFormulaRoute.id})</div>
          {renderTable(['When', 'Route', 'Receiving Plant', 'Approver'], ruleFormulaRoute.rows.map(r => ({ when: r.when, then: r.then, plant: r.receivingPlant, appr: r.approver })))}

          <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '12px', color: 'var(--primary-dark)', margin: '14px 0 4px' }}>STO & logistics chain ({ruleStoChain.id})</div>
          {renderTable(['Parameter', 'Value'], [
            { p: 'STO Type / PO Type / Purch Grp', v: ruleStoChain.stoType + ' / ' + ruleStoChain.poType + ' / ' + ruleStoChain.purchaseGroup },
            { p: 'Company Code / Plant Code', v: ruleStoChain.companyCode + ' / ' + ruleStoChain.plantCode },
            { p: 'Delivery / PGI / GR tcodes', v: ruleStoChain.deliveryTcode + ' / ' + ruleStoChain.pgiTcode + ' / ' + ruleStoChain.grTcode },
            { p: 'Delivery lead time', v: ruleStoChain.deliveryLeadDays + ' calendar days' },
            { p: 'Demand-suppression plants (ME22N delete/restore)', v: ruleStoChain.demandSuppressionPlants.join(', ') },
          ])}

          <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '12px', color: 'var(--primary-dark)', margin: '14px 0 4px' }}>LD eligibility mappings ({ruleLDEligibility.id})</div>
          {renderTable(['Blocked Material Groups (no LD)', 'TPMs that do not perform LD'], [
            { mg: ruleLDEligibility.matGroupNoLD.join(', ') || '(none)', tpm: ruleLDEligibility.tpmNoLD.join(', ') || '(none)' },
          ])}

          <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '12px', color: 'var(--primary-dark)', margin: '14px 0 4px' }}>Hard guards ({ruleGuards.id}) - non-negotiable</div>
          {renderTable(['Code', 'Guard'], ruleGuards.items.map(g => ({ code: g.code, text: g.text })))}
        </div>
      )}

    </div>
  );
}
