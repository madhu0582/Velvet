import { useState, useMemo } from 'react';
import { destructionItems } from '../data/drilldownData';
import { useToast } from '../context/ToastContext';
import { NA_SCENARIOS, resolveNaScenario, buildNaEmail } from '../data/naDestructionScenarios';

// Derive an aging (days awaiting) for follow-up demo from value hash — stable per row.
function agingDays(item) {
  if (typeof item.agingDays === 'number') return item.agingDays;
  const s = (item.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return [2, 6, 9, 15, 22, 31][s % 6];
}

// Which stepper stages are already done based on the row's current status.
function completedStages(item, scenario) {
  const st = (item.status || '').toLowerCase();
  const done = new Set();
  const order = scenario.steps.map(s => s.key);
  // Map status keywords to a progress index.
  let idx = 0;
  if (st.includes('quote')) idx = order.indexOf('quote');
  else if (st.includes('security')) idx = Math.max(idx, order.indexOf('elcSecurity'));
  else if (st.includes('scheduled') || st.includes('pickup')) idx = Math.max(idx, order.indexOf('vendorPickup'));
  else if (st.includes('destroying') || st.includes('no charge')) idx = Math.max(idx, order.indexOf('vendorPickup'));
  else if (st.includes('written off') || st.includes('completed') || st.includes('closed')) idx = order.length;
  else if (st.includes('awaiting') || st.includes('confirm')) idx = Math.max(0, order.indexOf('confirmQty'));
  for (let i = 0; i < idx; i++) done.add(order[i]);
  return { done, currentIdx: Math.min(idx, order.length - 1) };
}

export default function DestructionDrilldown({ onBack }) {
  const { showToast } = useToast();
  const [region, setRegion] = useState('NA');
  const [activeSubTab, setActiveSubTab] = useState('All');
  const [fPlant, setFPlant] = useState('all');
  const [fStatus, setFStatus] = useState('all');
  const [fRoute, setFRoute] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [emailOpen, setEmailOpen] = useState(null); // `${id}:${stageKey}`
  const [progress, setProgress] = useState({}); // id -> extra completed stage keys

  const regionItems = destructionItems.filter(i => region === 'All' ? true : i.region === region);

  const subTabs = [
    { label: 'All', count: regionItems.length },
    { label: 'DAV (Excess/Discontinue)', count: regionItems.filter(i => i.source === 'DAV').length, filter: 'DAV' },
    { label: 'QN / Blocked Stock', count: regionItems.filter(i => i.source === 'QN/BLCK').length, filter: 'QN/BLCK' },
  ].filter(t => t.count > 0);

  const currentTab = subTabs.find(t => t.label === activeSubTab) || subTabs[0];

  const filtered = useMemo(() => regionItems.filter(item => {
    if (currentTab?.filter && item.source !== currentTab.filter) return false;
    if (fPlant !== 'all' && item.plant !== fPlant) return false;
    if (fStatus !== 'all' && item.status !== fStatus) return false;
    if (fRoute !== 'all' && item.route !== fRoute) return false;
    return true;
  }), [regionItems, currentTab, fPlant, fStatus, fRoute]);

  const plants = [...new Set(regionItems.map(i => i.plant))];
  const statuses = [...new Set(regionItems.map(i => i.status))];
  const routes = [...new Set(regionItems.map(i => i.route))];

  // KPI buckets
  const kpi = {
    awaiting: regionItems.filter(i => /awaiting|confirm|pending|quote/i.test(i.status)).length,
    scheduled: regionItems.filter(i => /scheduled|destroying/i.test(i.status)).length,
    written: regionItems.filter(i => /written off|completed/i.test(i.status)).length,
    overdue: regionItems.filter(i => agingDays(i) >= 14 && !/written off|completed/i.test(i.status)).length,
  };

  const isNa = region === 'NA';

  const markDone = (item, key, label) => {
    setProgress(prev => ({ ...prev, [item.id]: [...(prev[item.id] || []), key] }));
    showToast('✓ ' + item.id + ': ' + label + ' — done. Advancing destruction workflow.');
  };

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <h2 style={{ fontSize: '18px', color: '#333' }}>Scrapping &amp; Destruction — DAV / QN Processing</h2>
      </div>

      {/* Region tab strip */}
      <div className="onr-tabs" style={{ marginBottom: '12px' }}>
        {['NA', 'EMEA', 'APAC', 'All'].map(r => (
          <button key={r} className={`onr-tab ${region === r ? 'active' : ''}`}
            onClick={() => { setRegion(r); setActiveSubTab('All'); setExpanded(null); }}>
            {r} <span className="count">{destructionItems.filter(i => r === 'All' ? true : i.region === r).length}</span>
          </button>
        ))}
      </div>

      {/* KPI strip */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
        {[
          { k: 'Awaiting Confirmation / Pickup', v: kpi.awaiting, c: '#C2410C' },
          { k: 'Pickup Scheduled', v: kpi.scheduled, c: '#1D4ED8' },
          { k: 'Written Off / Completed', v: kpi.written, c: '#047857' },
          { k: 'Overdue (>14d)', v: kpi.overdue, c: '#DC2626' },
        ].map(x => (
          <div key={x.k} style={{ flex: 1, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', borderTop: '3px solid ' + x.c }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{x.k}</div>
            <div style={{ fontSize: '22px', fontFamily: 'Graphik-Bold', color: x.c }}>{x.v}</div>
          </div>
        ))}
      </div>

      {isNa && (
        <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'var(--info-light)', borderRadius: 'var(--radius)', fontSize: '11px', color: '#1D4ED8' }}>
          <strong>NA Policy (Jack May):</strong> All DAVs ship to an ELC-authorized disposal company — subcontractors should NOT destroy on ELC's behalf (exceptions: Sc 6 no-charge, Sc 4 internal-with-PO). Routing = haz-class + geography. Vendor emails never include cost (BR-17).
        </div>
      )}

      {/* Source sub-tabs */}
      <div className="onr-tabs">
        {subTabs.map(tab => (
          <button key={tab.label} className={`onr-tab ${activeSubTab === tab.label ? 'active' : ''}`}
            onClick={() => setActiveSubTab(tab.label)}>
            {tab.label} <span className="count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Functional filters */}
      <div className="filters-row" style={{ marginTop: '16px' }}>
        <select value={fPlant} onChange={e => setFPlant(e.target.value)}><option value="all">All Plants</option>{plants.map(p => <option key={p} value={p}>{p}</option>)}</select>
        <select value={fStatus} onChange={e => setFStatus(e.target.value)}><option value="all">All Status</option>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
        <select value={fRoute} onChange={e => setFRoute(e.target.value)}><option value="all">All Routes</option>{routes.map(r => <option key={r} value={r}>{r}</option>)}</select>
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>Showing {filtered.length} of {regionItems.length}</span>
      </div>

      {/* Table */}
      <div className="table-container" style={{ marginTop: '16px' }}>
        <table>
          <thead>
            <tr>
              <th>WI#</th><th>Source</th><th>Material#</th><th>Plant</th><th>Qty</th><th>Value</th>
              {isNa && <th>Scenario</th>}<th>TPM Vendor</th><th>Haz</th><th>Status</th><th>Route</th><th>Follow-Up</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const sc = isNa ? NA_SCENARIOS[resolveNaScenario(item)] : null;
              const aging = agingDays(item);
              const overdue = aging >= 14 && !/written off|completed/i.test(item.status);
              const due = aging >= 7 && !/written off|completed/i.test(item.status);
              const open = expanded === item.id;
              const cols = isNa ? 13 : 12;
              return (
                <>
                  <tr key={item.id} className={`clickable-row ${item.rowClass || ''}`} onClick={() => setExpanded(open ? null : item.id)}>
                    <td><strong>{item.id}</strong></td>
                    <td><span className={`type-badge ${item.sourceBadge}`}>{item.source}</span></td>
                    <td>{item.material}</td>
                    <td>{item.plant}</td>
                    <td>{item.qty}</td>
                    <td>{item.value}</td>
                    {isNa && <td><span className="type-badge type-transfer" title={sc?.name}>Sc {sc?.id}</span></td>}
                    <td style={{ fontSize: '11px' }}>{item.tpmVendor || '—'}</td>
                    <td>{item.dg === 'Yes' ? <span style={{ color: '#c62828', fontWeight: 700 }}>⚠ Haz</span> : <span style={{ color: '#047857' }}>Non-Haz</span>}</td>
                    <td><span className={`status-badge ${item.statusClass}`}>{item.status}</span></td>
                    <td style={{ fontSize: '11px' }}>{item.route}</td>
                    <td style={{ fontSize: '10px' }}>
                      {/written off|completed/i.test(item.status)
                        ? <span style={{ color: '#047857', fontWeight: 600 }}>✓ Closed</span>
                        : overdue
                          ? <span style={{ background: '#DC2626', color: '#fff', borderRadius: '3px', padding: '1px 5px', fontWeight: 700 }}>⏰ {aging}d Escalate</span>
                          : due
                            ? <span style={{ background: '#F59E0B', color: '#fff', borderRadius: '3px', padding: '1px 5px', fontWeight: 700 }}>Remind ({aging}d)</span>
                            : <span style={{ color: 'var(--text-muted)' }}>{aging}d</span>}
                    </td>
                    <td style={{ color: 'var(--primary)', fontSize: '10px', whiteSpace: 'nowrap' }}>{open ? '▲ Hide' : '▼ Workflow'}</td>
                  </tr>
                  {open && (
                    <tr>
                      <td colSpan={cols} style={{ padding: 0, borderBottom: '2px solid #e1bee7' }}>
                        <div className="expand-detail">
                          {isNa && sc ? (
                            <NaWorkflow item={item} sc={sc} aging={aging} due={due} overdue={overdue}
                              emailOpen={emailOpen} setEmailOpen={setEmailOpen}
                              progress={progress[item.id] || []} markDone={markDone} showToast={showToast} />
                          ) : (
                            <GenericDestruction item={item} showToast={showToast} />
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- NA scenario workflow panel ----
function NaWorkflow({ item, sc, aging, due, overdue, emailOpen, setEmailOpen, progress, markDone, showToast }) {
  const { done, currentIdx } = completedStages(item, sc);
  progress.forEach(k => done.add(k));
  const currentKey = sc.steps.find(s => !done.has(s.key))?.key || sc.steps[sc.steps.length - 1].key;

  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '13px', color: 'var(--primary-dark)' }}>
          Scenario {sc.id}: {sc.name}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '12px', fontSize: '12px', lineHeight: 1.8 }}>
          <div style={{ fontWeight: 700, color: '#1E40AF', marginBottom: '6px' }}>🚚 Routing</div>
          <div>• Vendor: <strong>{sc.vendor}</strong></div>
          <div>• Contact: {sc.contact}</div>
          <div>• DAV/QN: {item.davQn} | MvT: {item.movementType}</div>
          {sc.gate && <div>• Gate: <strong style={{ color: '#B91C1C' }}>{sc.gate} approval required</strong></div>}
          {sc.po && <div>• PO pool: {sc.po}</div>}
          {sc.bol && <div>• BOL: {sc.bol}</div>}
          {sc.note && <div style={{ color: '#92400E' }}>• Note: {sc.note}</div>}
        </div>
        <div style={{ background: overdue ? '#FEF2F2' : (due ? '#FFFBEB' : '#F0FDF4'), border: '1px solid ' + (overdue ? '#FECACA' : (due ? '#FDE68A' : '#BBF7D0')), borderRadius: '8px', padding: '12px', fontSize: '12px', lineHeight: 1.8 }}>
          <div style={{ fontWeight: 700, color: overdue ? '#B91C1C' : (due ? '#92400E' : '#166534'), marginBottom: '6px' }}>⏱ Follow-Up (Sc 9 ladder: 7 / 14 / 30d)</div>
          <div>• Awaiting response: <strong>{aging} days</strong></div>
          <div>• {overdue ? 'OVERDUE — escalate to Team Lead (30d) / chase (14d).' : due ? 'Reminder due — send "Please provide an update".' : 'Within SLA — no reminder yet.'}</div>
          {(due || overdue) && (
            <button className="btn btn-info" style={{ marginTop: '8px', padding: '5px 12px', fontSize: '11px' }}
              onClick={(e) => { e.stopPropagation(); showToast('✉ Follow-up reminder sent to ' + (item.tpmVendor || 'TPM') + ' for ' + item.id + '.'); }}>
              ✉ Send Follow-Up ({aging}d)
            </button>
          )}
        </div>
      </div>

      {/* Stepper */}
      <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '12px', color: 'var(--primary-dark)', marginBottom: '8px' }}>Destruction Workflow</div>
      <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '12px' }}>
        {sc.steps.map((step, i) => {
          const isDone = done.has(step.key);
          const isCurrent = step.key === currentKey && !isDone;
          const em = buildNaEmail(sc, step.key, item);
          const ekey = item.id + ':' + step.key;
          const emShown = emailOpen === ekey;
          const hasEmail = ['confirmQty', 'elcSecurity', 'notifyCarrier', 'vendorPickup', 'quote', 'acceptQuote', 'ehs', 'noCharge', 'canadaCoord', 'invoiceApprove', 'cod'].includes(step.key);
          return (
            <div key={step.key} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px' }}>{isDone ? '✅' : isCurrent ? '🟡' : '⚪'}</span>
                <span style={{ fontSize: '12.5px', fontWeight: isCurrent ? 700 : 400, color: isDone ? '#059669' : isCurrent ? 'var(--primary-dark)' : 'var(--text-secondary)' }}>{step.label}</span>
                {hasEmail && (
                  <button style={{ border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--primary)', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}
                    onClick={(e) => { e.stopPropagation(); setEmailOpen(emShown ? null : ekey); }}>
                    ✉ {emShown ? 'Hide email' : 'View email'}
                  </button>
                )}
                {isCurrent && (
                  <button className="btn btn-success" style={{ padding: '3px 10px', fontSize: '10px' }}
                    onClick={(e) => { e.stopPropagation(); markDone(item, step.key, step.label); }}>
                    {step.key === 'postSap' ? 'Post in SAP' : step.key === 'elcSecurity' ? 'Record Approval' : step.key === 'invoiceApprove' ? 'Approve Invoice' : step.key === 'close' ? 'Close WI' : 'Mark Done'}
                  </button>
                )}
              </div>
              {emShown && em && (
                <div style={{ margin: '6px 0 6px 26px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 12px', fontSize: '11px' }}>
                  {!em.vendorFacing && <div style={{ display: 'inline-block', background: '#EDE9FE', color: '#6D28D9', borderRadius: '3px', padding: '1px 6px', fontSize: '9px', fontWeight: 700, marginBottom: '6px' }}>INTERNAL — cost allowed</div>}
                  {em.vendorFacing && <div style={{ display: 'inline-block', background: '#FEE2E2', color: '#B91C1C', borderRadius: '3px', padding: '1px 6px', fontSize: '9px', fontWeight: 700, marginBottom: '6px' }}>VENDOR-FACING — NO cost (BR-17)</div>}
                  <div><strong>To:</strong> {em.to}</div>
                  <div><strong>Cc:</strong> {em.cc}</div>
                  <div><strong>Subject:</strong> {em.subject}</div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '6px 0' }} />
                  <div style={{ whiteSpace: 'pre-wrap' }}>{em.body}</div>
                  <button className="btn btn-primary" style={{ marginTop: '8px', padding: '4px 10px', fontSize: '10px' }}
                    onClick={(e) => { e.stopPropagation(); showToast('✉ Email sent for ' + item.id + ' (' + step.label + ')'); setEmailOpen(null); }}>Send</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Email trace from seeded thread */}
      {item.emailThread && item.emailThread.length > 0 && (
        <div style={{ marginTop: '14px' }}>
          <div style={{ fontFamily: 'Graphik-Semibold', fontSize: '12px', color: 'var(--primary-dark)', marginBottom: '6px' }}>Email Trace</div>
          {item.emailThread.map((t, i) => (
            <div key={i} className="thread-item">
              <div className="thread-sender">{t.sender}</div>
              <div className="thread-date">{t.date}</div>
              <div className="thread-body">{t.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Generic (EMEA/APAC) fallback panel ----
function GenericDestruction({ item, showToast }) {
  return (
    <div>
      <div className="expand-grid">
        <div className="expand-field"><label>Material</label><div className="val">{item.material} — {item.materialDesc}</div></div>
        <div className="expand-field"><label>TPM Vendor</label><div className="val">{item.tpmVendor || '—'}</div></div>
        <div className="expand-field"><label>Route</label><div className="val">{item.route}</div></div>
        <div className="expand-field"><label>Movement Type</label><div className="val">{item.movementType || '—'}</div></div>
        <div className="expand-field"><label>Approval</label><div className="val">{item.approvalStatus || '—'}</div></div>
        <div className="expand-field"><label>DAV/QN</label><div className="val">{item.davQn}</div></div>
      </div>
      <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        {item.region === 'APAC' ? 'APAC sequence: post SAP write-off FIRST → then arrange physical destruction via ' + item.route + '.' : 'EMEA sequence: destroy → COD → then post MB11.'}
      </div>
      {item.emailThread && (
        <div style={{ marginTop: '12px' }}>
          {item.emailThread.map((t, i) => (
            <div key={i} className="thread-item">
              <div className="thread-sender">{t.sender}</div>
              <div className="thread-date">{t.date}</div>
              <div className="thread-body">{t.body}</div>
            </div>
          ))}
        </div>
      )}
      {!/written off|completed/i.test(item.status) && (
        <button className="btn btn-success" style={{ marginTop: '12px', padding: '8px 20px', fontSize: '12px' }}
          onClick={(e) => { e.stopPropagation(); showToast('✓ ' + item.id + ': posted in SAP (' + item.movementType + ').'); }}>✓ Post Write-Off in SAP</button>
      )}
    </div>
  );
}
