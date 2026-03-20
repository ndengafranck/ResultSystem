import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { FaArrowUp, FaUsers, FaTrophy, FaExclamationTriangle, FaMedal } from 'react-icons/fa';
import api from '../../services/api';
import remarkGrade from '../../services/grade';

const fadeUp = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}`;

const Page = styled.div`display:flex;flex-direction:column;gap:1.75rem;animation:${fadeUp} .4s ease both;`;

const Hero = styled.div`
  background:linear-gradient(135deg, var(--primary) 55%, #1d4ed8);
  border-radius:16px; padding:2rem 2.5rem; color:white;
  display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;
`;
const HeroLeft = styled.div``;
const HeroTitle= styled.h2`margin:0 0 .25rem; color:white; font-size:1.75rem;`;
const HeroSub  = styled.p`margin:0; opacity:.7; font-size:.88rem;`;

const SemSelect = styled.select`
  padding:.55rem 1.1rem; border-radius:8px; border:1.5px solid rgba(255,255,255,.3);
  background:rgba(255,255,255,.12); color:white; font-weight:600; font-size:.88rem;
  cursor:pointer; outline:none;
  option{background:var(--primary);color:white;}
`;

const StatsRow = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;`;
const StatCard = styled.div`
  background:white; border-radius:12px; border:1px solid var(--border-color);
  padding:1.25rem 1.5rem; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,.04);
`;
const StatVal  = styled.div`font-size:1.8rem;font-weight:700;color:${p=>p.$c||'var(--primary)'};font-family:'Playfair Display',serif;`;
const StatLbl  = styled.div`font-size:.78rem;color:var(--text-secondary);font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-top:.25rem;`;

const Card = styled.div`background:white;border:1px solid var(--border-color);border-radius:14px;padding:1.5rem;box-shadow:0 2px 6px rgba(0,0,0,.04);`;

/* Ranking table */
const RankTable = styled.table`width:100%;border-collapse:collapse;font-size:.88rem;`;
const Th = styled.th`padding:.7rem 1rem;text-align:left;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary);border-bottom:2px solid var(--border-color);`;
const Td = styled.td`padding:.75rem 1rem;border-bottom:1px solid #f1f5f9;`;
const MeRow = styled.tr`background:#eff6ff;font-weight:700;`;

/* Result item */
const ResultItem = styled.div`
  display:flex; justify-content:space-between; align-items:center;
  padding:1rem 1.25rem; background:#f8fafc; border:1px solid var(--border-color);
  border-radius:10px; margin-bottom:.75rem;
  @media(max-width:600px){flex-direction:column;align-items:flex-start;gap:.75rem;}
`;
const CourseInfo = styled.div`h4{margin:0 0 .2rem;color:var(--text-primary);font-size:.95rem;} p{margin:0;color:var(--text-secondary);font-size:.8rem;}`;
const GradeInfo  = styled.div`display:flex;align-items:center;gap:1.25rem;`;
const MarkBig    = styled.span`font-size:1.4rem;font-weight:700;color:${p=>p.$c||'var(--primary)'};`;
const RemarkBadge= styled.span`padding:.25rem .7rem;border-radius:20px;font-size:.78rem;font-weight:700;background:${p=>p.$bg};color:${p=>p.$c};`;
const GPABadge = styled.span`

`
const ComplainBtn= styled.button`padding:.4rem .9rem;background:white;color:var(--danger);border:1px solid var(--danger);border-radius:6px;font-size:.78rem;font-weight:600;cursor:pointer;transition:all .2s;&:hover{background:var(--danger);color:white;}`;

const Empty = styled.div`padding:2.5rem;text-align:center;color:var(--text-secondary);background:#f9fafb;border-radius:10px;`;

function remarkColor(r){
  const map={Excellent:['#dcfce7','#16a34a'],'Very Good':['#d1fae5','#059669'],Good:['#dbeafe','#2563eb'],'Fairly Good':['#fef3c7','#d97706'],Average:['#fef9c3','#ca8a04'],Weak:['#fee2e2','#dc2626']};
  return map[r]||['#f3f4f6','#374151'];
}
function markColor(m){ if(m>=75)return'#16a34a'; if(m>=60)return'#2563eb'; if(m>=50)return'#d97706'; return'#dc2626'; }

const StudentResult = () => {
  const [semester, setSemester] = useState(1);
  const [results,  setResults]  = useState([]);
  const [ranking,  setRanking]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{ fetchAll(); }, [semester]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rRes, rkRes] = await Promise.allSettled([
        api.get(`academic/result/student/retrieve/${semester}`),
        api.get(`academic/result/student/ranking/${semester}/`),
      ]);
      if(rRes.status==='fulfilled' && rRes.value.data?.user) setResults(rRes.value.data.user);
      else setResults([]);
      if(rkRes.status==='fulfilled') setRanking(rkRes.value.data);
      else setRanking(null);
    } catch(e){ setResults([]); setRanking(null); }
    finally{ setLoading(false); }
  };

  const avg = results.length ? (results.reduce((s,r)=>s+parseFloat(r.mark_percent),0)/results.length).toFixed(1) : null;
  const chartData = results.map(r=>({ name:r.course.length>14?r.course.slice(0,14)+'…':r.course, mark:parseFloat(r.mark_percent) }));

  return (
    <Page>
      <Hero>
        <HeroLeft>
          <HeroTitle>My Academic Results</HeroTitle>
          <HeroSub>View published results and class standing</HeroSub>
        </HeroLeft>
        <SemSelect value={semester} onChange={e=>setSemester(Number(e.target.value))}>
          {[1,2,3,4,5,6].map(s=><option key={s} value={s}>Semester {s}</option>)}
        </SemSelect>
      </Hero>

      {/* Stats row */}
      <StatsRow>
        <StatCard>
          <StatVal $c={avg ? markColor(parseFloat(avg)) : 'var(--primary)'}>{avg ?? '—'}%</StatVal>
          <StatLbl>My Average</StatLbl>
        </StatCard>
        <StatCard>
          <StatVal>{results.length}</StatVal>
          <StatLbl>Results</StatLbl>
        </StatCard>
        {ranking && <>
          <StatCard>
            <StatVal $c="#d97706" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'.3rem'}}>
              <FaTrophy size={20}/> #{ranking.my_rank ?? '—'}
            </StatVal>
            <StatLbl>Class Rank</StatLbl>
          </StatCard>
          <StatCard>
            <StatVal>{ranking.class_average ?? '—'}%</StatVal>
            <StatLbl>Class Average</StatLbl>
          </StatCard>
          <StatCard>
            <StatVal>{ranking.total_students}</StatVal>
            <StatLbl>Students <FaUsers size={13}/></StatLbl>
          </StatCard>
        </>}
      </StatsRow>

      {/* Class Ranking */}
      {ranking && ranking.ranking?.length > 0 && (
        <Card>
          <h3 style={{margin:'0 0 1.25rem',display:'flex',alignItems:'center',gap:'.5rem'}}>
            <FaMedal color="#d97706"/> Class Ranking — {ranking.class_name}
          </h3>
          <div style={{overflowX:'auto'}}>
            <RankTable>
              <thead>
                <tr>
                  <Th>Rank</Th>
                  <Th>Student</Th>
                  <Th>Matricule</Th>
                  <Th>Average</Th>
                </tr>
              </thead>
              <tbody>
                {ranking.ranking.slice(0,10).map(s=>{
                  const RowEl = s.is_me ? MeRow : 'tr';
                  return (
                    <RowEl key={s.student_id}>
                      <Td>
                        <span style={{display:'flex',alignItems:'center',gap:'.4rem'}}>
                          {s.rank<=3 && <FaTrophy color={['#f59e0b','#94a3b8','#cd7c3c'][s.rank-1]} size={13}/>}
                          #{s.rank}{s.is_me && <span style={{fontSize:'.7rem',background:'var(--primary)',color:'white',padding:'.1rem .4rem',borderRadius:'4px'}}>You</span>}
                        </span>
                      </Td>
                      <Td>{s.name}</Td>
                      <Td style={{fontFamily:'monospace',fontSize:'.82rem'}}>{s.matricule}</Td>
                      <Td><strong style={{color:markColor(s.average)}}>{s.average}%</strong></Td>
                    </RowEl>
                  );
                })}
              </tbody>
            </RankTable>
          </div>
        </Card>
      )}

      {/* Chart */}
      {results.length > 0 && (
        <Card style={{height:340}}>
          <h3 style={{margin:'0 0 1rem',fontSize:'1rem'}}>Performance Chart</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData} margin={{top:5,right:20,left:0,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb"/>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#6b7280',fontSize:11}}/>
              <YAxis domain={[0,100]} axisLine={false} tickLine={false} tick={{fill:'#6b7280',fontSize:11}}/>
              <Tooltip cursor={{fill:'#f3f4f6'}} contentStyle={{borderRadius:'8px',border:'none',boxShadow:'0 4px 6px -1px rgba(0,0,0,.1)'}}/>
              <Bar dataKey="mark" radius={[5,5,0,0]} barSize={36} name="Mark (%)">
                {chartData.map((e,i)=><Cell key={i} fill={markColor(e.mark)}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Detailed results */}
      <Card>
        <h3 style={{margin:'0 0 1.25rem'}}>Detailed Results</h3>
        {loading ? <p>Loading…</p>
        : results.length > 0 ? results.map((r,i)=>{
          const [bg,c] = remarkColor(r.remark);
          return (
            <ResultItem key={i}>
              <CourseInfo>
                <h4>{r.course}</h4>
                <p>{r.exam_exam_type}</p>
              </CourseInfo>
              <GradeInfo>
                <MarkBig $c={markColor(parseFloat(r.mark_percent))}>{r.mark_obtained}/{r.max_mark}</MarkBig>
                <RemarkBadge $bg={bg} $c={c}>{remarkGrade[r.remark]}</RemarkBadge>
                <ComplainBtn onClick={()=>navigate('/student/complaint',{state:{resultInfo:r}})}>
                  <FaExclamationTriangle size={10}/> Complain
                </ComplainBtn>
              </GradeInfo>
            </ResultItem>
          );
        })
        : <Empty>No results published for this semester yet.</Empty>}
      </Card>
    </Page>
  );
};

export default StudentResult;
