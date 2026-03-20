import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Alert, Spinner, PageLoader } from '../../components/UI';
import styled, { keyframes } from 'styled-components';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaFileAlt, FaSearch } from 'react-icons/fa';
import { MdVerifiedUser } from 'react-icons/md';

const fadeUp = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}`;
const Page = styled.div`animation:${fadeUp} .4s ease both;`;

const Hero = styled.div`
  background:linear-gradient(135deg,var(--primary) 55%,#1d4ed8);
  border-radius:16px;padding:2rem 2.5rem;color:white;margin-bottom:2rem;
`;
const HeroTitle = styled.h2`margin:0 0 .25rem;color:white;font-size:1.75rem;`;
const HeroSub   = styled.p`margin:0;opacity:.7;font-size:.88rem;`;

const FilterRow = styled.div`display:flex;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap;align-items:center;`;
const FilterBtn = styled.button`
  padding:.4rem 1rem;border-radius:20px;font-weight:600;font-size:.82rem;cursor:pointer;transition:all .2s;
  border:1.5px solid ${p=>p.$active?'var(--primary)':'var(--border-color)'};
  background:${p=>p.$active?'var(--primary)':'white'};
  color:${p=>p.$active?'white':'var(--text-secondary)'};
`;

const SearchBox = styled.div`position:relative;margin-left:auto;`;
const SearchInput = styled.input`
  padding:.45rem .75rem .45rem 2.2rem;border:1.5px solid var(--border-color);border-radius:8px;
  font-size:.85rem;outline:none;width:220px;
  &:focus{border-color:var(--primary);}
`;

const Card = styled.div`
  background:white;border:1px solid var(--border-color);border-radius:14px;
  margin-bottom:1.25rem;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.04);
  animation:${fadeUp} .4s ease both;
`;
const CardTop = styled.div`
  padding:1.1rem 1.5rem;background:#f8fafc;border-bottom:1px solid var(--border-color);
  display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem;
`;
const StudentName = styled.h3`margin:0;font-size:1rem;color:var(--text-primary);`;
const Meta = styled.div`font-size:.8rem;color:var(--text-secondary);margin-top:.2rem;`;

const StatusBadge = styled.span`
  display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .85rem;
  border-radius:20px;font-size:.78rem;font-weight:700;
  background:${p=>({Pending:'#fef9c3',Validated:'#dcfce7',Rejected:'#fee2e2'})[p.$s]||'#f3f4f6'};
  color:${p=>({Pending:'#92400e',Validated:'#16a34a',Rejected:'#dc2626'})[p.$s]||'#374151'};
`;

const CardBody = styled.div`padding:1.25rem 1.5rem;`;

const ResultTable = styled.table`width:100%;border-collapse:collapse;font-size:.82rem;margin-bottom:1.25rem;`;
const Th = styled.th`padding:.55rem .85rem;text-align:left;background:#f8fafc;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary);border-bottom:2px solid var(--border-color);`;
const Td = styled.td`padding:.6rem .85rem;border-bottom:1px solid #f1f5f9;`;

const SigRow = styled.div`display:flex;gap:1.5rem;flex-wrap:wrap;padding:1rem 0;border-top:1px solid var(--border-color);border-bottom:1px solid var(--border-color);margin-bottom:1rem;`;
const SigBox = styled.div`flex:1;min-width:120px;text-align:center;`;
const SigImg = styled.img`max-height:50px;object-fit:contain;border-bottom:2px solid #334155;padding-bottom:.4rem;margin-bottom:.3rem;`;
const SigLbl = styled.div`font-size:.72rem;color:var(--text-secondary);font-weight:600;text-transform:uppercase;letter-spacing:.04em;`;

const ActionRow = styled.div`display:flex;gap:.75rem;flex-wrap:wrap;`;
const Btn = styled.button`
  padding:.5rem 1.1rem;border-radius:8px;font-weight:700;font-size:.83rem;cursor:pointer;transition:all .2s;
  background:${p=>p.$v?'#16a34a':p.$r?'#dc2626':'white'};
  color:${p=>(p.$v||p.$r)?'white':'var(--text-secondary)'};
  border:1.5px solid ${p=>p.$v?'#16a34a':p.$r?'#dc2626':'var(--border-color)'};
  &:hover{opacity:.85;} &:disabled{opacity:.5;cursor:not-allowed;}
`;
const NotesInput = styled.textarea`
  width:100%;border:1.5px solid var(--border-color);border-radius:8px;padding:.6rem .85rem;
  font-family:inherit;font-size:.85rem;resize:vertical;outline:none;box-sizing:border-box;
  &:focus{border-color:var(--primary);}
`;

function statusIcon(s){
  if(s==='Validated') return <FaCheckCircle color="#16a34a"/>;
  if(s==='Rejected')  return <FaTimesCircle color="#dc2626"/>;
  return <FaHourglassHalf color="#d97706"/>;
}

const StaffTranscripts = () => {
  const [transcripts, setTranscripts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('Pending');
  const [search,   setSearch]   = useState('');
  const [notes,    setNotes]    = useState({});
  const [busy,     setBusy]     = useState({});
  const [msgs,     setMsgs]     = useState({});

  const fetchAll = () => {
    setLoading(true);
    api.get('academic/transcript/')
      .then(r=>setTranscripts(r.data))
      .catch(console.error)
      .finally(()=>setLoading(false));
  };
  useEffect(fetchAll,[]);

  const handle = async (id, action) => {
    setBusy(b=>({...b,[id]:true}));
    setMsgs(m=>({...m,[id]:null}));
    try {
      await api.post(`academic/transcript/${id}/validate/`,{ action, notes: notes[id]||'' });
      setMsgs(m=>({...m,[id]:{t:'success',text: action==='validate'?'Transcript validated successfully.':'Transcript rejected.'}}));
      fetchAll();
    } catch(e) {
      setMsgs(m=>({...m,[id]:{t:'error',text: e.response?.data?.error||'Action failed.'}}));
    } finally {
      setBusy(b=>({...b,[id]:false}));
    }
  };

  const visible = transcripts
    .filter(t=> filter==='All' || t.status===filter)
    .filter(t=> !search || t.student_name.toLowerCase().includes(search.toLowerCase()) || t.student_matricule.includes(search));

  const counts = { All:transcripts.length, Pending:transcripts.filter(t=>t.status==='Pending').length, Validated:transcripts.filter(t=>t.status==='Validated').length, Rejected:transcripts.filter(t=>t.status==='Rejected').length };

  return (
    <Page>
      <Hero>
        <HeroTitle>Transcript Validation</HeroTitle>
        <HeroSub>Review and sign student transcript requests for your department</HeroSub>
      </Hero>

      <FilterRow>
        {['All','Pending','Validated','Rejected'].map(f=>(
          <FilterBtn key={f} $active={filter===f} onClick={()=>setFilter(f)}>
            {f} ({counts[f]})
          </FilterBtn>
        ))}
        <SearchBox>
          <FaSearch style={{position:'absolute',left:'8px',top:'50%',transform:'translateY(-50%)',color:'#94a3b8',fontSize:'.8rem'}}/>
          <SearchInput placeholder="Search student…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </SearchBox>
      </FilterRow>

      {loading ? <PageLoader />
      : visible.length===0 ? (
        <div style={{padding:'3rem',textAlign:'center',background:'white',borderRadius:'14px',border:'1px solid var(--border-color)'}}>
          <FaFileAlt size={36} style={{opacity:.3,marginBottom:'1rem'}}/>
          <h3>No transcripts found</h3>
        </div>
      ) : visible.map(t=>(
        <Card key={t.id}>
          <CardTop>
            <div>
              <StudentName>{t.student_name}</StudentName>
              <Meta>Matricule: {t.student_matricule} · {t.student_email} · Requested {new Date(t.requested_at).toLocaleDateString()}</Meta>
            </div>
            <StatusBadge $s={t.status}>{statusIcon(t.status)} {t.status}</StatusBadge>
          </CardTop>

          <CardBody>
            {/* Results */}
            {t.results?.length > 0 ? (
              <div style={{overflowX:'auto',marginBottom:'1rem'}}>
                <ResultTable>
                  <thead><tr>
                    <Th>Course</Th><Th>Code</Th><Th>Sem</Th><Th>Type</Th><Th>Mark</Th><Th>Remark</Th>
                  </tr></thead>
                  <tbody>
                    {t.results.map((r,i)=>(
                      <tr key={i}>
                        <Td>{r.course}</Td>
                        <Td style={{fontFamily:'monospace',fontSize:'.78rem'}}>{r.course_code}</Td>
                        <Td>{r.semester}</Td>
                        <Td>{r.exam_type}</Td>
                        <Td><strong>{r.mark}%</strong></Td>
                        <Td>{r.remark}</Td>
                      </tr>
                    ))}
                  </tbody>
                </ResultTable>
              </div>
            ) : <p style={{color:'var(--text-secondary)',fontSize:'.85rem'}}>No published results yet.</p>}

            {/* Current signatures */}
            <SigRow>
              <SigBox>
                {t.hod_sig_url ? <SigImg src={t.hod_sig_url} alt="HOD sig"/> : <div style={{height:'50px',borderBottom:'2px dashed #cbd5e1',marginBottom:'.3rem'}}/>}
                <SigLbl><MdVerifiedUser/> HOD {t.has_hod_sig?'✓':'—'}</SigLbl>
              </SigBox>
              <SigBox>
                {t.staff_sig_url ? <SigImg src={t.staff_sig_url} alt="Staff sig"/> : <div style={{height:'50px',borderBottom:'2px dashed #cbd5e1',marginBottom:'.3rem'}}/>}
                <SigLbl><MdVerifiedUser/> Staff {t.has_staff_sig?'✓':'—'}</SigLbl>
              </SigBox>
              <SigBox>
                {t.director_sig_url ? <SigImg src={t.director_sig_url} alt="Dir sig"/> : <div style={{height:'50px',borderBottom:'2px dashed #cbd5e1',marginBottom:'.3rem'}}/>}
                <SigLbl><MdVerifiedUser/> Director {t.has_director_sig?'✓':'—'}</SigLbl>
              </SigBox>
            </SigRow>

            {/* Notes */}
            <NotesInput
              rows={2}
              placeholder="Optional notes…"
              value={notes[t.id]||''}
              onChange={e=>setNotes(n=>({...n,[t.id]:e.target.value}))}
              style={{marginBottom:'.75rem'}}
            />

            {msgs[t.id] && <Alert variant={msgs[t.id].t}>{msgs[t.id].text}</Alert>}

            {t.status==='Pending' && (
              <ActionRow>
                <Btn $v onClick={()=>handle(t.id,'validate')} disabled={!!busy[t.id]}>
                  <FaCheckCircle style={{marginRight:'.3rem'}}/> {busy[t.id]?'Processing…':'Validate & Sign'}
                </Btn>
                <Btn $r onClick={()=>handle(t.id,'reject')} disabled={!!busy[t.id]}>
                  <FaTimesCircle style={{marginRight:'.3rem'}}/> Reject
                </Btn>
              </ActionRow>
            )}
            {t.status!=='Pending' && (
              <p style={{fontSize:'.8rem',color:'var(--text-secondary)',margin:0}}>
                {t.status==='Validated'?'✓ Already validated':'✗ Rejected'} · {t.validated_at ? new Date(t.validated_at).toLocaleDateString() : ''}
              </p>
            )}
          </CardBody>
        </Card>
      ))}
    </Page>
  );
};

export default StaffTranscripts;
