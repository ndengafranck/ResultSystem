import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageLoader } from '../../components/UI';
import styled, { keyframes } from 'styled-components';
import { FaPlus, FaFilePdf, FaDownload, FaTimes, FaExternalLinkAlt, FaCalendarAlt, FaBuilding } from 'react-icons/fa';

const fadeUp = keyframes`from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}`;
const Page = styled.div`animation:${fadeUp} .4s ease both;`;

const Header = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:1.75rem;flex-wrap:wrap;gap:1rem;`;
const Title  = styled.h2`margin:0;font-size:1.6rem;`;
const CreateBtn = styled.button`
  display:flex;align-items:center;gap:.5rem;background:var(--primary);color:white;
  border:none;padding:.65rem 1.4rem;border-radius:8px;font-weight:600;font-size:.88rem;cursor:pointer;
  transition:opacity .2s;&:hover{opacity:.88;}
`;

const Grid = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.25rem;`;

const Card = styled.div`
  background:white;border:1px solid var(--border-color);border-radius:14px;overflow:hidden;
  box-shadow:0 2px 8px rgba(0,0,0,.04);display:flex;flex-direction:column;
  animation:${fadeUp} .45s ease both;animation-delay:${p=>p.$d||'0s'};
  transition:transform .2s,box-shadow .2s;
  &:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(30,58,138,.09);}
`;

const CardTop = styled.div`
  background:linear-gradient(135deg,var(--primary),#1d4ed8);
  padding:1.25rem 1.5rem;color:white;
  display:flex;justify-content:space-between;align-items:flex-start;
`;
const TTitle  = styled.h3`margin:0 0 .25rem;color:white;font-size:1rem;`;
const DeptBadge = styled.span`
  background:rgba(255,255,255,.18);color:white;font-size:.72rem;font-weight:700;
  padding:.2rem .6rem;border-radius:6px;flex-shrink:0;
`;
const CardBody = styled.div`padding:1.1rem 1.5rem;flex:1;display:flex;flex-direction:column;gap:.6rem;`;
const MetaRow  = styled.div`display:flex;align-items:center;gap:.5rem;font-size:.8rem;color:var(--text-secondary);`;
const ClassTags = styled.div`display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.25rem;`;
const ClassTag  = styled.span`background:#f3f4f6;color:var(--text-primary);font-size:.72rem;font-weight:500;padding:.2rem .55rem;border-radius:5px;`;

const CardFooter = styled.div`padding:.85rem 1.5rem;border-top:1px solid #f1f5f9;display:flex;gap:.6rem;`;
const Btn = styled.button`
  display:flex;align-items:center;gap:.4rem;padding:.45rem .9rem;border-radius:6px;
  font-size:.78rem;font-weight:600;cursor:pointer;transition:all .2s;flex:1;justify-content:center;
  background:${p=>p.$primary?'var(--primary)':'white'};
  color:${p=>p.$primary?'white':'var(--text-secondary)'};
  border:1px solid ${p=>p.$primary?'var(--primary)':'var(--border-color)'};
  &:hover{opacity:.85;}
`;

/* PDF Modal (same pattern as Announcements) */
const Overlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1.5rem;`;
const Modal   = styled.div`background:white;
border-radius:14px;
width:100%;
max-width:860px;
height: 70vh;
max-height:90vh;
display:flex;
flex-direction:column;
overflow:hidden;
box-shadow:0 20px 60px rgba(0,0,0,.3);`;
const MHeader = styled.div`display:flex;justify-content:space-between;align-items:center;padding:1rem 1.5rem;border-bottom:1px solid var(--border-color);background:#f8fafc;flex-shrink:0;`;
const MTitle  = styled.h4`margin:0;font-size:.95rem;`;
const MActions= styled.div`display:flex;gap:.5rem;align-items:center;`;
const CloseBtn= styled.button`background:none;border:1px solid var(--border-color);border-radius:6px;padding:.3rem .6rem;cursor:pointer;color:var(--text-secondary);display:flex;align-items:center;&:hover{background:#fee2e2;color:#dc2626;}`;
const PdfFrame= styled.iframe`flex:1;border:none;min-height:0;`;

const Empty = styled.div`text-align:center;padding:4rem 2rem;background:white;border-radius:14px;border:1px solid var(--border-color);color:var(--text-secondary);`;

const BASE = 'http://127.0.0.1:8000';
function resolveUrl(u){ return u?.startsWith('http') ? u : `${BASE}${u}`; }

const Timetables = () => {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [user,    setUser]    = useState(null);
  const [modal,   setModal]   = useState(null);

  useEffect(()=>{
    setUser(JSON.parse(localStorage.getItem('user')));
    api.get('announcements/timetables')
      .then(r=>setItems(r.data))
      .catch(console.error)
      .finally(()=>setLoading(false));
  },[]);

  const download = async (url, name) => {
    const full = resolveUrl(url);
    const res  = await fetch(full);
    const blob = await res.blob();
    const a    = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name||'timetable.pdf';
    document.body.appendChild(a); a.click(); a.remove();
  };

  const canCreate = user?.user_type==='Teacher';

  if(loading) return <PageLoader label='Loading timetables…' />;

  return (
    <Page>
      <Header>
        <Title>Timetables</Title>
        {canCreate && <CreateBtn onClick={()=>window.location.href='/create-timetable'}><FaPlus/> Upload Timetable</CreateBtn>}
      </Header>

      {items.length===0 ? (
        <Empty>
          <FaFilePdf size={40} style={{opacity:.3,marginBottom:'1rem',color:'#dc2626'}}/>
          <h3>No timetables available</h3>
          <p>Check back later for updates.</p>
        </Empty>
      ) : (
        <Grid>
          {items.map((t,i)=>{
            const pdfUrl  = resolveUrl(t.pdf_file);
            const pdfName = `${t.title}.pdf`;
            return (
              <Card key={t.id} $d={`${Math.min(i,5)*0.05}s`}>
                <CardTop>
                  <div>
                    <TTitle>{t.title}</TTitle>
                    <div style={{opacity:.75,fontSize:'.78rem'}}>{new Date(t.uploaded_at).toLocaleDateString('en-GB',{year:'numeric',month:'short',day:'numeric'})}</div>
                  </div>
                  <DeptBadge>{t.department_name}</DeptBadge>
                </CardTop>
                <CardBody>
                  <MetaRow><FaBuilding size={11}/> {t.department_name}</MetaRow>
                  <MetaRow><FaCalendarAlt size={11}/> Uploaded by {t.uploaded_by_name||'—'}</MetaRow>
                  {t.classes?.length > 0 && (
                    <div>
                      <div style={{fontSize:'.75rem',fontWeight:700,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:'.35rem'}}>Classes</div>
                      <ClassTags>
                        {t.classes.map(c=><ClassTag key={c.id}>{c.class_name}</ClassTag>)}
                      </ClassTags>
                    </div>
                  )}
                </CardBody>
                <CardFooter>
                  <Btn $primary onClick={()=>setModal({url:pdfUrl,name:pdfName})}>
                    <FaExternalLinkAlt size={10}/> View PDF
                  </Btn>
                  <Btn onClick={()=>download(t.pdf_file, pdfName)}>
                    <FaDownload size={10}/> Download
                  </Btn>
                </CardFooter>
              </Card>
            );
          })}
        </Grid>
      )}

      {/* PDF Modal */}
      {modal && (
        <Overlay onClick={()=>setModal(null)}>
          <Modal onClick={e=>e.stopPropagation()}>
            <MHeader>
              <MTitle><FaFilePdf style={{marginRight:'.4rem',color:'#dc2626'}}/>{modal.name}</MTitle>
              <MActions>
                <Btn style={{flex:'none',padding:'.35rem .8rem',fontSize:'.78rem'}} onClick={()=>download(modal.url,modal.name)}>
                  <FaDownload size={11}/> Download
                </Btn>
                <CloseBtn onClick={()=>setModal(null)}><FaTimes size={14}/></CloseBtn>
              </MActions>
            </MHeader>
            <PdfFrame src={modal.url} title={modal.name}/>
          </Modal>
        </Overlay>
      )}
    </Page>
  );
};

export default Timetables;
