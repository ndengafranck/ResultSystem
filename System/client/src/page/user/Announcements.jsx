import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageLoader } from '../../components/UI';
import styled, { keyframes } from 'styled-components';
import { FaPlus, FaImage, FaFilePdf, FaFileAlt, FaDownload, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';

const fadeUp = keyframes`from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}`;
const Page = styled.div`animation:${fadeUp} .4s ease both;`;

const Header = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:1.75rem;flex-wrap:wrap;gap:1rem;`;
const Title  = styled.h2`margin:0;font-size:1.6rem;`;
const CreateBtn = styled.button`
  display:flex;align-items:center;gap:.5rem;background:var(--primary);color:white;
  border:none;padding:.65rem 1.4rem;border-radius:8px;font-weight:600;font-size:.88rem;cursor:pointer;
  transition:opacity .2s;&:hover{opacity:.88;}
`;

const List = styled.div`display:flex;flex-direction:column;gap:1.25rem;`;

const Card = styled.div`
  background:white;border:1px solid var(--border-color);border-radius:14px;overflow:hidden;
  box-shadow:0 2px 8px rgba(0,0,0,.04);animation:${fadeUp} .45s ease both;animation-delay:${p=>p.$d||'0s'};
`;

const CardAccent = styled.div`height:4px;background:${p=>({school:'#1e3a8a',department:'#16a34a',class:'#d97706'})[p.$type]||'#94a3b8'};`;
const CardBody   = styled.div`padding:1.4rem 1.75rem;`;

const TopRow = styled.div`display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:.75rem;flex-wrap:wrap;`;
const AnnoTitle = styled.h3`margin:0;font-size:1.05rem;color:var(--text-primary);`;

const Badge = styled.span`
  display:inline-block;padding:.22rem .7rem;border-radius:20px;font-size:.72rem;font-weight:700;text-transform:capitalize;flex-shrink:0;
  background:${p=>({school:'#e0e7ff',department:'#dcfce7',class:'#fef3c7'})[p.$type]||'#f3f4f6'};
  color:${p=>({school:'#3730a3',department:'#166534',class:'#92400e'})[p.$type]||'#374151'};
`;

const MetaRow = styled.div`display:flex;gap:1.25rem;font-size:.78rem;color:var(--text-secondary);margin-bottom:.9rem;`;
const Content  = styled.p`margin:0 0 1rem;line-height:1.7;color:var(--text-primary);font-size:.9rem;`;

/* Attachments */
const AttachSection = styled.div`display:flex;flex-direction:column;gap:.65rem;`;
const AttachItem    = styled.div`display:flex;align-items:center;gap:.75rem;padding:.6rem .85rem;background:#f8fafc;border:1px solid var(--border-color);border-radius:8px;`;
const FileIcon      = styled.span`font-size:1.1rem;color:${p=>p.$pdf?'#dc2626':p.$img?'#2563eb':'#6b7280'};`;
const FileName      = styled.span`flex:1;font-size:.82rem;font-weight:500;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`;
const AttachBtns    = styled.div`display:flex;gap:.4rem;flex-shrink:0;`;
const SmBtn         = styled.button`
  display:flex;align-items:center;gap:.3rem;padding:.3rem .65rem;border-radius:6px;font-size:.75rem;
  font-weight:600;cursor:pointer;transition:all .2s;border:1px solid ${p=>p.$primary?'var(--primary)':'var(--border-color)'};
  background:${p=>p.$primary?'var(--primary)':'white'};color:${p=>p.$primary?'white':'var(--text-secondary)'};
  &:hover{opacity:.85;}
`;

/* Inline image */
const InlineImg = styled.img`
  width:100%;max-height:360px;object-fit:contain;border-radius:8px;border:1px solid var(--border-color);
  margin-top:.5rem;cursor:zoom-in;
`;

/* PDF modal */
const Overlay = styled.div`
  position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:1000;
  display:flex;align-items:center;justify-content:center;padding:1.5rem;
`;
const Modal = styled.div`
  background:white;
  border-radius:14px;
  width:100%;
  max-width:860px;
  height:800vh;
  max-height:90vh;
  display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);
`;
const ModalHeader = styled.div`
  display:flex;justify-content:space-between;align-items:center;padding:1rem 1.5rem;
  border-bottom:1px solid var(--border-color);background:#f8fafc;flex-shrink:0;
`;
const ModalTitle = styled.h4`margin:0;font-size:.95rem;color:var(--text-primary);`;
const ModalActions = styled.div`display:flex;gap:.5rem;align-items:center;`;
const CloseBtn = styled.button`background:none;border:1px solid var(--border-color);border-radius:6px;padding:.3rem .6rem;cursor:pointer;color:var(--text-secondary);display:flex;align-items:center;&:hover{background:#fee2e2;color:#dc2626;}`;
const PdfFrame = styled.iframe`flex:1;border:none;min-height:0;`;

const Empty = styled.div`text-align:center;padding:4rem 2rem;background:white;border-radius:14px;border:1px solid var(--border-color);color:var(--text-secondary);`;

const BASE = 'http://127.0.0.1:8000';

function resolveUrl(u){ return u?.startsWith('http') ? u : `${BASE}${u}`; }
function isImage(u){ return /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(u); }
function isPdf(u){ return /\.pdf$/i.test(u); }

const Announcements = () => {
  const [items,    setItems]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [user,     setUser]    = useState(null);
  const [pdfModal, setPdfModal]= useState(null); // {url, name}
  const [blobUrl,setBlobUrl] = useState(null);

  useEffect(()=>{
    if(!pdfModal){setBlobUrl(null); return;}
    fetch(pdfModal.url,{headers:{Authorization: `Bearer ${localStorage.getItem('access')}`}})
    .then(r => r.blob())
    .then(blob => setBlobUrl(URL.createObjectURL(blob)))
    .catch(console.error);

    return () => {if (blobUrl) URL.revokeObjectURL(blobUrl);};
  },[pdfModal])

  useEffect(()=>{
    setUser(JSON.parse(localStorage.getItem('user')));
    api.get('announcements/announcements')
      .then(r=>setItems(r.data))
      .catch(console.error)
      .finally(()=>setLoading(false));
  },[]);

  console.log(pdfModal);
  const download = async (url, name) => {
    const full = resolveUrl(url);
    const res  = await fetch(full);
    const blob = await res.blob();
    const a    = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  };

  const canCreate = user?.user_type==='Admin'||user?.user_type==='Teacher';

  if(loading) return <PageLoader label='Loading announcements…' />;

  return (
    <Page>
      <Header>
        <Title>Announcements</Title>
        {canCreate && <CreateBtn onClick={()=>window.location.href='/create-announcement'}><FaPlus/> Create</CreateBtn>}
      </Header>

      {items.length===0 ? (
        <Empty><h3>No announcements yet</h3><p>Check back later.</p></Empty>
      ) : (
        <List>
          {items.map((a,i)=>(
            <Card key={a.id} $d={`${Math.min(i,5)*0.04}s`}>
              <CardAccent $type={a.target_type}/>
              <CardBody>
                <TopRow>
                  <AnnoTitle>{a.title}</AnnoTitle>
                  <Badge $type={a.target_type}>{a.target_type}</Badge>
                </TopRow>
                <MetaRow>
                  <span>By {a.sender_name||'—'}</span>
                  <span>{new Date(a.created_at).toLocaleDateString('en-GB',{year:'numeric',month:'short',day:'numeric'})}</span>
                </MetaRow>
                <Content>{a.content}</Content>

                {a.files?.length > 0 && (
                  <AttachSection>
                    {a.files.map((f,fi)=>{
                      const url  = resolveUrl(f.file);
                      const name = f.file.split('/').pop();
                      const img  = isImage(url);
                      const pdf  = isPdf(url);
                      return (
                        <div key={fi}>
                          <AttachItem>
                            <FileIcon $pdf={pdf} $img={img}>
                              {img ? <FaImage/> : pdf ? <FaFilePdf/> : <FaFileAlt/>}
                            </FileIcon>
                            <FileName title={name}>{name}</FileName>
                            <AttachBtns>
                              {pdf && (
                                <SmBtn $primary onClick={()=> setPdfModal({url,name})}>
                                  <FaExternalLinkAlt size={10}/> View
                                </SmBtn>
                              )}
                              <SmBtn onClick={()=>download(f.file,name)}>
                                <FaDownload size={10}/> Download
                              </SmBtn>
                            </AttachBtns>
                          </AttachItem>
                          {/* Inline image preview */}
                          {img && (
                            <InlineImg
                              src={url} alt={name}
                              onClick={()=>window.open(url,'_blank')}
                            />
                          )}
                        </div>
                      );
                    })}
                  </AttachSection>
                )}
              </CardBody>
            </Card>
          ))}
        </List>
      )}

      {/* PDF Viewer Modal */}
      {pdfModal && (
        <Overlay onClick={()=>setPdfModal(null)}>
          <Modal onClick={e=>e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle><FaFilePdf style={{marginRight:'.4rem',color:'#dc2626'}}/>{pdfModal.name}</ModalTitle>
              <ModalActions>
                <SmBtn onClick={()=>download(pdfModal.url,pdfModal.name)}><FaDownload size={11}/> Download</SmBtn>
                <CloseBtn onClick={()=>setPdfModal(null)}><FaTimes size={14}/></CloseBtn>
              </ModalActions>
            </ModalHeader>
            <PdfFrame src={blobUrl} title={pdfModal?.name}/>
          </Modal>
        </Overlay>
      )}
    </Page>
  );
};

export default Announcements;
