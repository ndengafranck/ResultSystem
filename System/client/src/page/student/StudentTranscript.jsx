import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaScroll, FaCheckCircle, FaClock, FaTimesCircle, FaFileDownload, FaPen, FaUserTie } from 'react-icons/fa';
import { MdVerifiedUser, MdGavel } from 'react-icons/md';
import remarkGrade from '../../services/grade';

const statusMeta = {
  Pending:   { icon:<FaClock />,       color:'#d97706', bg:'#fef3c7', label:'Pending Validation' },
  Validated: { icon:<FaCheckCircle />, color:'#16a34a', bg:'#dcfce7', label:'Validated' },
  Rejected:  { icon:<FaTimesCircle />, color:'#dc2626', bg:'#fee2e2', label:'Rejected' },
};


const gradeColor = g =>
  g==='A+'||g==='A' ? '#16a34a' : g==='B' ? '#2563eb' : g==='C' ? '#d97706' : g==='D' ? '#ea580c' : '#dc2626';

const SigBadge = ({ label, url, name }) => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'.5rem', padding:'1rem', background:url?'#f0fdf4':'#f8fafc', border:`1px solid ${url?'#bbf7d0':'#e2e8f0'}`, borderRadius:10, minWidth:120, flex:1 }}>
    {url
      ? <img src={url} alt={`${name} signature`} style={{ height:50, objectFit:'contain', filter:'invert(20%)' }} />
      : <div style={{ height:50, display:'flex', alignItems:'center', justifyContent:'center', color:'#cbd5e1' }}><FaPen size={22} /></div>
    }
    <div style={{ fontSize:'.72rem', fontWeight:700, color: url?'#16a34a':'#94a3b8', textAlign:'center', textTransform:'uppercase', letterSpacing:'.4px' }}>
      {url ? '✓ ' : ''}{label}
    </div>
  </div>
);

const StudentTranscript = () => {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [requesting, setRequesting]   = useState(false);
  const [message, setMessage]         = useState('');
  const [expanded, setExpanded]       = useState(null);
  const [acYear, setAcYear]           = useState('');

  const fetch = () => {
    api.get('academic/transcript/')
      .then(r => setTranscripts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleRequest = async () => {
    setRequesting(true); setMessage('');
    try {
      await api.post('academic/transcript/', { academic_year: acYear });
      setMessage('success:Transcript request submitted successfully!');
      setAcYear(''); fetch();
    } catch (e) {
      setMessage('error:' + (e.response?.data?.error || 'Request failed.'));
    } finally { setRequesting(false); }
  };

  const hasPending = transcripts.some(t => t.status === 'Pending');

  return (
    <div style={{ fontFamily:"system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#1d4ed8 100%)', borderRadius:16, padding:'2rem 2.5rem', color:'white', marginBottom:'2rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-40, top:-40, width:180, height:180, background:'rgba(255,255,255,0.04)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', left:-30, bottom:-50, width:140, height:140, background:'rgba(255,255,255,0.03)', borderRadius:'50%' }} />
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:'1rem' }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>
            <FaScroll />
          </div>
          <div>
            <h2 style={{ margin:0, fontSize:'1.5rem', fontWeight:800, color:'white', fontFamily:"'Playfair Display',serif" }}>My Transcripts</h2>
            <p style={{ margin:'.2rem 0 0', opacity:.65, fontSize:'.85rem' }}>Request, view and track official academic transcripts</p>
          </div>
        </div>
      </div>

      {/* Request new transcript */}
      {!hasPending && (
        <div style={{ background:'white', borderRadius:14, border:'1px solid #e8ecf0', padding:'1.5rem', marginBottom:'2rem', boxShadow:'0 2px 6px rgba(0,0,0,.04)' }}>
          <h3 style={{ margin:'0 0 1rem', fontSize:'1rem', fontWeight:700, color:'#0f172a', display:'flex', alignItems:'center', gap:'.5rem' }}>
            <FaFileDownload style={{ color:'#1e3a8a' }} /> Request a New Transcript
          </h3>
          {message && (
            <div style={{ padding:'.75rem 1rem', borderRadius:8, marginBottom:'1rem', fontSize:'.85rem', fontWeight:600,
              background: message.startsWith('success') ? '#dcfce7' : '#fee2e2',
              color:      message.startsWith('success') ? '#166534' : '#dc2626',
              border: `1px solid ${message.startsWith('success') ? '#bbf7d0' : '#fecaca'}` }}>
              {message.replace(/^(success|error):/, '')}
            </div>
          )}
          <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap', alignItems:'flex-end' }}>
            <div style={{ flex:1, minWidth:160 }}>
              <label style={{ display:'block', fontSize:'.8rem', fontWeight:700, color:'#475569', marginBottom:'.4rem', textTransform:'uppercase', letterSpacing:'.4px' }}>Academic Year (optional)</label>
              <input value={acYear} onChange={e => setAcYear(e.target.value)} placeholder="e.g. 2024/2025"
                style={{ width:'100%', padding:'.6rem .85rem', border:'1px solid #e2e8f0', borderRadius:8, fontSize:'.9rem', outline:'none', boxSizing:'border-box' }} />
            </div>
            <button onClick={handleRequest} disabled={requesting}
              style={{ padding:'.65rem 1.5rem', background:'linear-gradient(135deg,#1e3a8a,#2563eb)', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:'.9rem', boxShadow:'0 4px 12px rgba(30,58,138,.25)', opacity: requesting ? .7 : 1 }}>
              {requesting ? 'Requesting…' : 'Request Transcript'}
            </button>
          </div>
        </div>
      )}
      {hasPending && (
        <div style={{ padding:'1rem 1.25rem', background:'#fef9c3', border:'1px solid #fde047', borderRadius:10, marginBottom:'1.5rem', fontSize:'.88rem', color:'#92400e', fontWeight:600 }}>
          ⏳ You have a pending transcript request. Wait for it to be validated before requesting another.
        </div>
      )}

      {/* Transcript list */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'4rem', color:'#94a3b8' }}>Loading transcripts…</div>
      ) : transcripts.length === 0 ? (
        <div style={{ textAlign:'center', padding:'4rem', background:'white', borderRadius:14, border:'2px dashed #e2e8f0' }}>
          <FaScroll size={36} style={{ color:'#cbd5e1', marginBottom:'1rem' }} />
          <h3 style={{ color:'#64748b', margin:'0 0 .4rem', fontFamily:"'Playfair Display',serif" }}>No transcript requests yet</h3>
          <p style={{ color:'#94a3b8', margin:0, fontSize:'.88rem' }}>Use the form above to request your first transcript.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          {transcripts.map(t => {
            const sm = statusMeta[t.status] || statusMeta.Pending;
            const isOpen = expanded === t.id;
            // Group results by semester
            const bySem = {};
            (t.results || []).forEach(r => { (bySem[r.semester] = bySem[r.semester] || []).push(r); });
            return (
              <div key={t.id} style={{ background:'white', borderRadius:14, border:'1px solid #e8ecf0', boxShadow:'0 2px 6px rgba(0,0,0,.04)', overflow:'hidden' }}>
                <div style={{ height:3, background:`linear-gradient(90deg,${sm.color},${sm.color}55)` }} />
                <div style={{ padding:'1.25rem 1.5rem' }}>
                  {/* Card header */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap' }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'.4rem' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:'.35rem', padding:'.28rem .75rem', borderRadius:20, fontSize:'.75rem', fontWeight:700, background:sm.bg, color:sm.color }}>
                          {sm.icon} {sm.label}
                        </span>
                        {t.academic_year && (
                          <span style={{ fontSize:'.78rem', color:'#94a3b8', fontWeight:500 }}>Year: <strong style={{ color:'#475569' }}>{t.academic_year}</strong></span>
                        )}
                      </div>
                      <div style={{ fontSize:'.78rem', color:'#94a3b8' }}>
                        Requested: <strong style={{ color:'#475569' }}>{new Date(t.requested_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</strong>
                        {t.validated_at && <> · Validated: <strong style={{ color:'#475569' }}>{new Date(t.validated_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</strong></>}
                      </div>
                      {t.notes && <div style={{ marginTop:'.4rem', fontSize:'.82rem', color:'#64748b', fontStyle:'italic' }}>Note: {t.notes}</div>}
                    </div>
                    <button onClick={() => setExpanded(isOpen ? null : t.id)}
                      style={{ padding:'.45rem 1rem', background: isOpen?'#f1f5f9':'#1e3a8a', color: isOpen?'#475569':'white', border:`1px solid ${isOpen?'#e2e8f0':'#1e3a8a'}`, borderRadius:8, cursor:'pointer', fontSize:'.82rem', fontWeight:700, flexShrink:0 }}>
                      {isOpen ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  {/* Signatures */}
                  <div style={{ display:'flex', gap:'.75rem', marginTop:'1rem', flexWrap:'wrap' }}>
                    <SigBadge label="Director"  url={t.director_sig_url} />
                    <SigBadge label="HOD"       url={t.hod_sig_url} />
                    <SigBadge label="Staff"     url={t.staff_sig_url} />
                  </div>

                  {/* Expanded results */}
                  {isOpen && (
                    <div style={{ marginTop:'1.5rem', borderTop:'1px solid #f1f5f9', paddingTop:'1.5rem' }}>
                      <h4 style={{ margin:'0 0 1rem', fontSize:'.9rem', fontWeight:700, color:'#0f172a' }}>Academic Record</h4>
                      {Object.keys(bySem).sort().map(sem => (
                        <div key={sem} style={{ marginBottom:'1.5rem' }}>
                          <div style={{ fontSize:'.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:'#94a3b8', marginBottom:'.6rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
                            <div style={{ height:1, flex:1, background:'#f1f5f9' }} />
                            Semester {sem}
                            <div style={{ height:1, flex:1, background:'#f1f5f9' }} />
                          </div>
                          <div style={{ display:'flex', flexDirection:'column', gap:'.4rem' }}>
                            {/* Table header */}
                            <div style={{ display:'grid', gridTemplateColumns:'3rem 1fr 5rem 4rem 5rem', gap:'.75rem', padding:'.4rem .75rem', fontSize:'.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.4px', color:'#94a3b8' }}>
                              <span>Code</span><span>Course</span><span style={{ textAlign:'center' }}>Type</span><span style={{ textAlign:'center' }}>Mark</span><span style={{ textAlign:'center' }}>Grade</span>
                            </div>
                            {bySem[sem].map((r, i) => {
                              const grade = remarkGrade[r.remark] || '—';
                              return (
                                <div key={i} style={{ display:'grid', gridTemplateColumns:'3rem 1fr 5rem 4rem 5rem', gap:'.75rem', padding:'.6rem .75rem', background: i%2===0?'#f8fafc':'white', borderRadius:6, fontSize:'.83rem', alignItems:'center' }}>
                                  <span style={{ fontFamily:'monospace', fontSize:'.72rem', color:'#64748b', fontWeight:600 }}>{r.course_code}</span>
                                  <span style={{ fontWeight:500, color:'#0f172a', lineHeight:1.3 }}>{r.course}</span>
                                  <span style={{ textAlign:'center', fontSize:'.72rem', color:'#64748b' }}>{r.exam_type}</span>
                                  <span style={{ textAlign:'center', fontWeight:700, color: parseFloat(r.mark)>=50?'#059669':'#dc2626' }}>{r.mark}%</span>
                                  <span style={{ textAlign:'center' }}>
                                    <span style={{ fontWeight:800, fontSize:'.9rem', color: gradeColor(grade) }}>{grade}</span>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {t.results && t.results.length === 0 && (
                        <p style={{ color:'#94a3b8', textAlign:'center', fontSize:'.88rem' }}>No published results included yet.</p>
                      )}
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

export default StudentTranscript;
