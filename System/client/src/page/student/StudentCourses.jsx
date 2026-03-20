import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaBook, FaGraduationCap, FaStar, FaCalendar, FaLayerGroup } from 'react-icons/fa';
import { MdSchool } from 'react-icons/md';

const typeColor = {
  Compulsory: { bg:'#fee2e2', color:'#991b1b' },
  Optional:   { bg:'#dbeafe', color:'#1e40af' },
  Elective:   { bg:'#f0fdf4', color:'#166534' },
};
const getTC = name => typeColor[name] || { bg:'#f3f4f6', color:'#374151' };

const semColors = ['#1e3a8a','#0369a1','#065f46','#7c3aed','#be185d','#92400e'];

const StudentCourses = () => {
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [semFilter, setSemFilter] = useState('all');

  useEffect(() => {
    api.get('dashboard/student/dashboard')
      .then(r => setCourses(r.data?.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const semesters = [...new Set(courses.map(c => c.semester))].sort();

  const filtered = courses.filter(c => {
    const statusOk = filter === 'all' || c.status === filter;
    const semOk    = semFilter === 'all' || String(c.semester) === semFilter;
    return statusOk && semOk;
  });

  const totalCredits = filtered.reduce((s, c) => s + (c.credits || 0), 0);

  return (
    <div style={{ fontFamily:"system-ui,sans-serif" }}>
      {/* Hero header */}
      <div style={{ background:'linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 60%,#2563eb 100%)', borderRadius:16, padding:'2rem 2.5rem', color:'white', marginBottom:'2rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-60, top:-60, width:220, height:220, background:'rgba(255,255,255,0.05)', borderRadius:'50%' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'.5rem' }}>
            <FaGraduationCap size={22} />
            <h2 style={{ margin:0, fontSize:'1.5rem', fontWeight:800, color:'white', fontFamily:"'Playfair Display',serif" }}>My Enrolled Courses</h2>
          </div>
          <p style={{ margin:0, opacity:.75, fontSize:'.88rem' }}>All courses you are currently enrolled in across all semesters</p>
          <div style={{ display:'flex', gap:'2rem', marginTop:'1.25rem', flexWrap:'wrap' }}>
            {[
              { label:'Total Courses', val: courses.length },
              { label:'Total Credits', val: totalCredits },
              { label:'Semesters',     val: semesters.length },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize:'1.8rem', fontWeight:800, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:'.75rem', opacity:.65, textTransform:'uppercase', letterSpacing:'.5px', marginTop:'.2rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
          {['all','Enrolled','Completed','Suspended'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding:'.35rem .85rem', borderRadius:20, border:'1px solid', cursor:'pointer', fontSize:'.8rem', fontWeight:600, transition:'all .15s',
                background: filter===s ? '#1e3a8a' : 'white',
                color:      filter===s ? 'white' : '#475569',
                borderColor: filter===s ? '#1e3a8a' : '#e2e8f0' }}>
              {s === 'all' ? 'All statuses' : s}
            </button>
          ))}
        </div>
        <select value={semFilter} onChange={e => setSemFilter(e.target.value)}
          style={{ padding:'.35rem .85rem', borderRadius:20, border:'1px solid #e2e8f0', fontSize:'.8rem', fontWeight:600, color:'#475569', outline:'none', cursor:'pointer', background:'white' }}>
          <option value="all">All semesters</option>
          {semesters.map(s => <option key={s} value={String(s)}>Semester {s}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'4rem', color:'#94a3b8' }}>Loading your courses…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'4rem', background:'white', borderRadius:14, border:'2px dashed #e2e8f0' }}>
          <FaBook size={36} style={{ color:'#cbd5e1', marginBottom:'1rem' }} />
          <h3 style={{ color:'#64748b', margin:'0 0 .4rem', fontFamily:"'Playfair Display',serif" }}>No courses found</h3>
          <p style={{ color:'#94a3b8', margin:0, fontSize:'.88rem' }}>Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div style={{ fontSize:'.8rem', color:'#94a3b8', marginBottom:'1rem', fontWeight:600 }}>
            Showing {filtered.length} of {courses.length} courses · {totalCredits} credits
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
            {filtered.map((c, i) => {
              const tc = getTC(c.course_type || '');
              const semCol = semColors[(c.semester - 1) % semColors.length];
              return (
                <div key={i} style={{ background:'white', borderRadius:12, border:'1px solid #e8ecf0', boxShadow:'0 2px 6px rgba(0,0,0,.04)', overflow:'hidden', display:'flex', flexDirection:'column' }}>
                  {/* Top accent with semester color */}
                  <div style={{ height:4, background:`linear-gradient(90deg,${semCol},${semCol}88)` }} />
                  <div style={{ padding:'1.1rem 1.25rem', flex:1 }}>
                    {/* Code + badges */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'.5rem', marginBottom:'.6rem' }}>
                      <span style={{ fontFamily:"monospace", fontSize:'.8rem', fontWeight:700, color:semCol, background:`${semCol}14`, padding:'.2rem .5rem', borderRadius:4 }}>{c.course_code}</span>
                      <div style={{ display:'flex', gap:'.4rem', flexWrap:'wrap' }}>
                        {c.course_type && (
                          <span style={{ fontSize:'.68rem', fontWeight:700, padding:'.18rem .5rem', borderRadius:20, background:tc.bg, color:tc.color }}>{c.course_type}</span>
                        )}
                        <span style={{ fontSize:'.68rem', fontWeight:700, padding:'.18rem .5rem', borderRadius:20,
                          background: c.status==='Enrolled'?'#dcfce7':c.status==='Completed'?'#dbeafe':'#fee2e2',
                          color:      c.status==='Enrolled'?'#166534':c.status==='Completed'?'#1e40af':'#991b1b' }}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                    {/* Course name */}
                    <h4 style={{ margin:'0 0 .75rem', fontSize:'.95rem', fontWeight:700, color:'#0f172a', lineHeight:1.35, fontFamily:"'Playfair Display',serif" }}>{c.course_name}</h4>
                    {/* Info rows */}
                    <div style={{ display:'flex', flexDirection:'column', gap:'.35rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'.5rem', fontSize:'.8rem', color:'#64748b' }}>
                        <MdSchool style={{ color:'#94a3b8', flexShrink:0 }} />
                        <span>{c.class_name}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'.5rem', fontSize:'.8rem', color:'#64748b' }}>
                        <FaCalendar style={{ color:'#94a3b8', flexShrink:0, fontSize:'.75rem' }} />
                        <span>Semester {c.semester}</span>
                        {c.academic_year && <><span style={{ color:'#e2e8f0' }}>·</span><span>{c.academic_year}</span></>}
                      </div>
                    </div>
                  </div>
                  {/* Footer: credits */}
                  <div style={{ padding:'.7rem 1.25rem', borderTop:'1px solid #f1f5f9', background:'#fafafa', display:'flex', alignItems:'center', gap:'.5rem' }}>
                    <FaStar style={{ color:'#d97706', fontSize:'.85rem' }} />
                    <span style={{ fontSize:'.8rem', fontWeight:700, color:'#374151' }}>{c.credits} Credit{c.credits !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentCourses;
