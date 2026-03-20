import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaScroll, FaCheck, FaTimes, FaClock, FaCheckCircle, FaTimesCircle, FaPen, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MdVerifiedUser } from 'react-icons/md';

const statusMeta = {
  Pending:   { icon:<FaClock />,       color:'#d97706', bg:'#fef3c7' },
  Validated: { icon:<FaCheckCircle />, color:'#16a34a', bg:'#dcfce7' },
  Rejected:  { icon:<FaTimesCircle />, color:'#dc2626', bg:'#fee2e2' },
};
const remarkGrade = { Excellent:'A+', 'Very Good':'A', Good:'B', 'Fairly Good':'C', Average:'D', Weak:'F' };
const gradeColor = g => g==='A+'||g==='A' ? '#16a34a' : g==='B' ? '#2563eb' : g==='C' ? '#d97706' : g==='D' ? '#ea580c' : '#dc2626';

const SigBadge = ({ label, url }) => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'.35rem', padding:'.75rem', background:url?'#f0fdf4':'#f8fafc', border:`1px solid ${url?'#bbf7d0':'#e2e8f0'}`, borderRadius:8, flex:1, minWidth:90 }}>
    {url
      ? <img src={url} alt="sig" style={{ height:36, objectFit:'contain' }} />
      : <FaPen style={{ color:'#cbd5e1', fontSize:'1.1rem' }} />
    }
    <span style={{ fontSize:'.65rem', fontWeight:700, color:url?'#16a34a':'#94a3b8', textTransform:'uppercase', letterSpacing:'.3px' }}>{url?'✓ ':''}{label}</span>
  </div>
);

const TranscriptValidation = () => {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [expanded, setExpanded]       = useState(null);
  const [acting, setActing]           = useState(null);
  const [notes, setNotes]             = useState({});
  const [messages, setMessages]       = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  const load = () => {
    setLoading(true);
    api.get('academic/transcript/').then(r => setTranscripts(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const act = async (id, action) => {
    setActing(id + action);
    try {
      const res = await api.post(`academic/transcript/${id}/validate/`, { action, notes: notes[id] || '' });
      setMessages(m => ({ ...m, [id]: { type:'success', text: res.data.message } }));
      load();
    } catch (e) {
      setMessages(m => ({ ...m, [id]: { type:'error', text: e.response?.data?.error || 'Action failed.' } }));
    } finally { setActing(null); }
  };

  const filtered = transcripts.filter(t => filterStatus === 'all' || t.status === filterStatus);

  return (
    <div style={{ fontFamily:"system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#4c1d95,#7c3aed)', borderRadius:16, padding:'2rem 2.5rem', color:'white', marginBottom:'2rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-50, top:-50, width:200, height:200, background:'rgba(255,255,255,0.05)', borderRadius:'50%' }} />
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:'1rem' }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}><FaScroll /></div>
          <div>
            <h2 style={{ margin:0, fontSize:'1.5rem', fontWeight:800, color:'white', fontFamily:"'Playfair Display',serif" }}>Transcript Validation</h2>
            <p style={{ margin:'.2rem 0 0', opacity:.65, fontSize:'.85rem' }}>Review and sign student transcript requests with your digital signature</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:'1.5rem', marginTop:'1.25rem', flexWrap:'wrap' }}>
          {['Pending','Validated','Rejected'].map(s => {
            const count = transcripts.filter(t => t.status === s).length;
            return (
              <div key={s} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.6rem', fontWeight:800, lineHeight:1 }}>{count}</div>
                <div style={{ fontSize:'.72rem', opacity:.65, textTransform:'uppercase', letterSpacing:'.5px', marginTop:'.2rem' }}>{s}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:'.5rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {['all','Pending','Validated','Rejected'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{ padding:'.35rem .9rem', borderRadius:20, border:'1px solid', cursor:'pointer', fontSize:'.8rem', fontWeight:600, transition:'all .15s',
              background: filterStatus===s ? '#7c3aed' : 'white',
              color:      filterStatus===s ? 'white'   : '#475569',
              borderColor: filterStatus===s ? '#7c3aed' : '#e2e8f0' }}>
            {s === 'all' ? `All (${transcripts.length})` : `${s} (${transcripts.filter(t=>t.status===s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'4rem', color:'#94a3b8' }}>Loading transcripts…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'4rem', background:'white', borderRadius:14, border:'2px dashed #e2e8f0' }}>
          <FaScroll size={36} style={{ color:'#cbd5e1', marginBottom:'1rem' }} />
          <h3 style={{ color:'#64748b', margin:'0 0 .4rem', fontFamily:"'Playfair Display',serif" }}>No transcripts found</h3>
          <p style={{ color:'#94a3b8', margin:0, fontSize:'.88rem' }}>No transcript requests match the selected filter.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          {filtered.map(t => {
            const sm = statusMeta[t.status] || statusMeta.Pending;
            const isOpen = expanded === t.id;
            const msg = messages[t.id];
            const bySem = {};
            (t.results || []).forEach(r => { (bySem[r.semester] = bySem[r.semester] || []).push(r); });

            return (
              <div key={t.id} style={{ background:'white', borderRadius:14, border:'1px solid #e8ecf0', boxShadow:'0 2px 6px rgba(0,0,0,.04)', overflow:'hidden' }}>
                <div style={{ height:3, background:`linear-gradient(90deg,${sm.color},${sm.color}55)` }} />
                <div style={{ padding:'1.25rem 1.5rem' }}>
                  {/* Card header */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap', marginBottom:'1rem' }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'.4rem', flexWrap:'wrap' }}>
                        <span style={{ fontWeight:800, fontSize:'1rem', color:'#0f172a', fontFamily:"'Playfair Display',serif" }}>{t.student_name}</span>
                        <span style={{ fontFamily:'monospace', fontSize:'.78rem', color:'#64748b', background:'#f3f4f6', padding:'.15rem .5rem', borderRadius:4 }}>{t.student_matricule}</span>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:'.3rem', padding:'.22rem .7rem', borderRadius:20, fontSize:'.72rem', fontWeight:700, background:sm.bg, color:sm.color }}>
                          {sm.icon} {t.status}
                        </span>
                      </div>
                      <div style={{ fontSize:'.78rem', color:'#94a3b8' }}>
                        {t.student_email && <span>{t.student_email} · </span>}
                        {t.academic_year && <span>Year: <strong style={{ color:'#475569' }}>{t.academic_year}</strong> · </span>}
                        <span>Requested: <strong style={{ color:'#475569' }}>{new Date(t.requested_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</strong></span>
                      </div>
                      {t.notes && <div style={{ marginTop:'.4rem', fontSize:'.82rem', color:'#64748b', fontStyle:'italic' }}>Note: {t.notes}</div>}
                    </div>
                    <button onClick={() => setExpanded(isOpen ? null : t.id)}
                      style={{ display:'flex', alignItems:'center', gap:'.35rem', padding:'.45rem 1rem', background:isOpen?'#f1f5f9':'#1e3a8a', color:isOpen?'#475569':'white', border:`1px solid ${isOpen?'#e2e8f0':'#1e3a8a'}`, borderRadius:8, cursor:'pointer', fontSize:'.82rem', fontWeight:700, flexShrink:0 }}>
                      {isOpen ? <><FaChevronUp size={11}/> Hide</> : <><FaChevronDown size={11}/> View</>}
                    </button>
                  </div>

                  {/* Signatures */}
                  <div style={{ display:'flex', gap:'.6rem', flexWrap:'wrap', marginBottom: t.status==='Pending'?'1rem':0 }}>
                    <SigBadge label="Director" url={t.director_sig_url} />
                    <SigBadge label="HOD"      url={t.hod_sig_url} />
                    <SigBadge label="Staff"    url={t.staff_sig_url} />
                  </div>

                  {/* Validate / Reject (only for pending) */}
                  {t.status === 'Pending' && (
                    <div style={{ padding:'1rem', background:'#fafafa', borderRadius:10, border:'1px solid #f1f5f9' }}>
                      {msg && (
                        <div style={{ padding:'.6rem .9rem', borderRadius:7, marginBottom:'.75rem', fontSize:'.83rem', fontWeight:600,
                          background:msg.type==='success'?'#dcfce7':'#fee2e2', color:msg.type==='success'?'#166534':'#dc2626',
                          border:`1px solid ${msg.type==='success'?'#bbf7d0':'#fecaca'}` }}>
                          {msg.text}
                        </div>
                      )}
                      <textarea value={notes[t.id] || ''} onChange={e => setNotes(n => ({ ...n, [t.id]: e.target.value }))}
                        placeholder="Optional notes (shown to student)…"
                        rows={2}
                        style={{ width:'100%', padding:'.6rem .85rem', border:'1px solid #e2e8f0', borderRadius:8, fontSize:'.85rem', resize:'vertical', fontFamily:'inherit', outline:'none', boxSizing:'border-box', marginBottom:'.75rem' }} />
                      <div style={{ display:'flex', gap:'.6rem', flexWrap:'wrap' }}>
                        <button onClick={() => act(t.id, 'validate')} disabled={acting}
                          style={{ display:'flex', alignItems:'center', gap:'.4rem', padding:'.5rem 1.2rem', background:'linear-gradient(135deg,#065f46,#059669)', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:'.85rem', opacity:acting?0.7:1 }}>
                          <FaCheck /> {acting===t.id+'validate' ? 'Validating…' : 'Validate & Sign'}
                        </button>
                        <button onClick={() => act(t.id, 'reject')} disabled={acting}
                          style={{ display:'flex', alignItems:'center', gap:'.4rem', padding:'.5rem 1.2rem', background:'white', color:'#dc2626', border:'1px solid #fca5a5', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:'.85rem', opacity:acting?0.7:1 }}>
                          <FaTimes /> {acting===t.id+'reject' ? 'Rejecting…' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expanded result table */}
                  {isOpen && (
                    <div style={{ marginTop:'1.5rem', borderTop:'1px solid #f1f5f9', paddingTop:'1.5rem' }}>
                      <h4 style={{ margin:'0 0 1rem', fontSize:'.9rem', fontWeight:700, color:'#0f172a' }}>Academic Record — {t.results?.length || 0} results</h4>
                      {Object.keys(bySem).sort((a,b)=>a-b).map(sem => (
                        <div key={sem} style={{ marginBottom:'1.25rem' }}>
                          <div style={{ fontSize:'.73rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:'#94a3b8', marginBottom:'.5rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
                            <div style={{ height:1, flex:1, background:'#f1f5f9' }} />Semester {sem}<div style={{ height:1, flex:1, background:'#f1f5f9' }} />
                          </div>
                          {bySem[sem].map((r, i) => {
                            const grade = remarkGrade[r.remark] || '—';
                            return (
                              <div key={i} style={{ display:'grid', gridTemplateColumns:'3.5rem 1fr 4rem 4rem 3.5rem', gap:'.5rem', padding:'.55rem .6rem', background:i%2===0?'#f8fafc':'white', borderRadius:6, fontSize:'.82rem', alignItems:'center', marginBottom:2 }}>
                                <span style={{ fontFamily:'monospace', fontSize:'.7rem', color:'#64748b' }}>{r.course_code}</span>
                                <span style={{ fontWeight:500, color:'#0f172a' }}>{r.course}</span>
                                <span style={{ textAlign:'center', fontSize:'.72rem', color:'#64748b' }}>{r.exam_type}</span>
                                <span style={{ textAlign:'center', fontWeight:700, color:parseFloat(r.mark)>=50?'#059669':'#dc2626' }}>{r.mark}%</span>
                                <span style={{ textAlign:'center', fontWeight:800, color:gradeColor(grade) }}>{grade}</span>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                      {(!t.results || t.results.length === 0) && <p style={{ color:'#94a3b8', fontSize:'.88rem' }}>No published results on file.</p>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TranscriptValidation;
