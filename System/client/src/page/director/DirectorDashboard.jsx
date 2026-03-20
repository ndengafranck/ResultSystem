import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  FaSitemap, FaChalkboardTeacher, FaUserGraduate, FaArrowRight,
  FaSync, FaExclamationTriangle, FaFileAlt, FaChartBar
} from 'react-icons/fa';
import { MdVerifiedUser } from 'react-icons/md';
import { useSync } from "../../context/syncContext";
import { Alert, Spinner,PageLoader } from '../../components/UI';

const fadeUp = keyframes`from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}`;
const spin    = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;

const Page = styled.div`animation:${fadeUp} .4s ease both;`;

const SchoolHero = styled.div`
  background:linear-gradient(120deg,var(--primary) 55%,#1d4ed8);
  border-radius:16px;padding:2rem 2.5rem;color:white;margin-bottom:2rem;
  display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;position:relative;overflow:hidden;
  &::after{content:'';position:absolute;right:-60px;top:-60px;width:280px;height:280px;
    background:rgba(255,255,255,.05);border-radius:50%;}
`;
const SchoolLogo = styled.img`
  width:72px;height:72px;border-radius:12px;object-fit:cover;
  border:3px solid rgba(255,255,255,.3);flex-shrink:0;background:white;
`;
const SchoolLogoFallback = styled.div`
  width:72px;height:72px;border-radius:12px;background:rgba(255,255,255,.15);
  display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:700;
  color:white;flex-shrink:0;border:3px solid rgba(255,255,255,.25);
`;
const HeroInfo = styled.div`flex:1;z-index:1;`;
const SchoolName = styled.h1`margin:0 0 .2rem;color:white;font-size:1.8rem;`;
const SchoolCode = styled.p`margin:0;opacity:.65;font-size:.9rem;letter-spacing:.06em;text-transform:uppercase;`;
const HeroActions = styled.div`display:flex;gap:.75rem;margin-top:1.25rem;flex-wrap:wrap;`;
const SyncBtn = styled.button`
  display:inline-flex;align-items:center;gap:.45rem;background:rgba(255,255,255,.13);
  color:white;border:1px solid rgba(255,255,255,.25);border-radius:8px;
  padding:.5rem 1.1rem;font-size:.85rem;font-weight:600;cursor:pointer;transition:background .2s;
  &:hover{background:rgba(255,255,255,.22);} &:disabled{opacity:.5;cursor:not-allowed;}
`;
const SpinIcon = styled.span`display:inline-flex;animation:${p=>p.$s?`${spin} 1s linear infinite`:'none'};`;

const SectionTitle = styled.h3`
  font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;
  color:var(--text-secondary);margin:0 0 1rem;
`;

const StatsGrid = styled.div`
  display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1.1rem;margin-bottom:2rem;
`;
const StatCard = styled.div`
  background:white;border-radius:12px;padding:1.25rem 1.5rem;
  border:1px solid var(--border-color);box-shadow:0 2px 6px rgba(0,0,0,.04);
  display:flex;flex-direction:column;gap:.55rem;
  animation:${fadeUp} .5s ease both;animation-delay:${p=>p.$d||'0s'};
  transition:transform .2s,box-shadow .2s;
  &:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(30,58,138,.09);}
`;
const IconBox = styled.div`
  width:40px;height:40px;border-radius:9px;background:${p=>p.$bg};color:${p=>p.$c};
  display:flex;align-items:center;justify-content:center;font-size:1.1rem;
`;
const StatNum = styled.div`font-size:2rem;font-weight:700;color:var(--primary);line-height:1;font-family:'Playfair Display',serif;`;
const StatLbl = styled.div`font-size:.76rem;color:var(--text-secondary);font-weight:600;text-transform:uppercase;letter-spacing:.04em;`;
const AlertNum = styled(StatNum)`color:${p=>p.$warn?'#dc2626':'var(--primary)'};`;

/* Department cards */
const DeptGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.1rem;margin-bottom:2rem;`;
const DeptCard = styled.div`
  background:white;border:1px solid var(--border-color);border-radius:12px;overflow:hidden;
  box-shadow:0 2px 6px rgba(0,0,0,.04);
  animation:${fadeUp} .5s ease both;animation-delay:${p=>p.$d||'0s'};
  transition:transform .2s,box-shadow .2s;
  &:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(30,58,138,.09);}
`;
const DeptTop = styled.div`
  height:72px;background:${p=>p.$img?`url(${p.$img}) center/cover`:'linear-gradient(135deg,var(--primary),#1d4ed8)'};
  display:flex;align-items:flex-end;padding:.75rem 1rem;
`;
const DeptName = styled.span`
  color:white;font-weight:700;font-size:.92rem;text-shadow:0 1px 4px rgba(0,0,0,.5);
  background:rgba(0,0,0,.3);padding:.2rem .55rem;border-radius:5px;
`;
const DeptBody = styled.div`padding:1rem 1.1rem;display:flex;justify-content:space-between;align-items:center;`;
const DeptMeta = styled.div`font-size:.8rem;color:var(--text-secondary);`;
const ViewBtn  = styled(Link)`
  font-size:.78rem;font-weight:700;color:var(--accent);display:flex;align-items:center;gap:.25rem;
  &:hover{text-decoration:underline;}
`;

/* Quick actions */
const QuickGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.9rem;`;
const QuickCard = styled(Link)`
  background:white;border:1px solid var(--border-color);border-radius:11px;
  padding:1rem 1.25rem;display:flex;align-items:center;gap:.75rem;
  color:var(--text-primary);font-weight:600;font-size:.87rem;text-decoration:none;
  transition:all .2s;
  .icon{font-size:1.05rem;color:var(--primary);}
  &:hover{border-color:var(--primary);background:#f0f4ff;color:var(--primary);}
`;

const NoSchool = styled.div`
  padding:3rem;text-align:center;background:white;border-radius:14px;
  border:1px solid var(--border-color);color:var(--text-secondary);
`;

const DirectorDashboard = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const { isSyncing, syncError, syncSuccess, startSync } = useSync();
  const today = new Date().toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  useEffect(()=>{
    api.get('dashboard/director/dashboard')
      .then(r=>setData(r.data))
      .catch(console.error)
      .finally(()=>setLoading(false));
  },[]);

  if(loading) return <PageLoader label='Loading dashboard…' />;

  if(!data || data.error) return (
    <Page>
      <NoSchool>
        <h3>No school assigned</h3>
        <p>Your director account is not yet linked to a school. Please contact the system administrator.</p>
      </NoSchool>
    </Page>
  );

  const initials = data.school_name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  return (
    <Page>
      {/* School hero */}
      <SchoolHero>
        {data.school_logo
          ? <SchoolLogo src={data.school_logo} alt={data.school_name}/>
          : <SchoolLogoFallback>{initials}</SchoolLogoFallback>
        }
        <HeroInfo>
          <SchoolName>{data.school_name}</SchoolName>
          <SchoolCode>{data.school_code} · Director's Portal</SchoolCode>
          <p style={{margin:'.4rem 0 0',opacity:.65,fontSize:'.82rem'}}>{today}</p>
          <HeroActions>
            <SyncBtn onClick={startSync} disabled={isSyncing}>
              <SpinIcon $s={isSyncing}><FaSync size={12}/></SpinIcon>
              {isSyncing ? 'Synchronising…' : 'Synchronise Data'}
            </SyncBtn>
          </HeroActions>
        </HeroInfo>
      </SchoolHero>

      {/* Stats */}
      <SectionTitle>School Overview</SectionTitle>
      <StatsGrid>
        <StatCard $d=".05s">
          <IconBox $bg="#dcfce7" $c="#16a34a"><FaSitemap/></IconBox>
          <StatNum>{data.total_departments}</StatNum>
          <StatLbl>Departments</StatLbl>
        </StatCard>
        <StatCard $d=".10s">
          <IconBox $bg="#fce7f3" $c="#db2777"><FaChalkboardTeacher/></IconBox>
          <StatNum>{data.total_classes}</StatNum>
          <StatLbl>Classes</StatLbl>
        </StatCard>
        <StatCard $d=".15s">
          <IconBox $bg="#e0f2fe" $c="#0369a1"><FaUserGraduate/></IconBox>
          <StatNum>{data.total_students}</StatNum>
          <StatLbl>Students</StatLbl>
        </StatCard>
        <StatCard $d=".20s">
          <IconBox $bg="#fee2e2" $c="#dc2626"><FaExclamationTriangle/></IconBox>
          <AlertNum $warn={data.pending_complaints>0}>{data.pending_complaints}</AlertNum>
          <StatLbl>Pending Complaints</StatLbl>
        </StatCard>
        <StatCard $d=".25s">
          <IconBox $bg="#fef9c3" $c="#92400e"><FaFileAlt/></IconBox>
          <AlertNum $warn={data.pending_transcripts>0}>{data.pending_transcripts}</AlertNum>
          <StatLbl>Pending Transcripts</StatLbl>
        </StatCard>
        <StatCard $d=".30s">
          <IconBox $bg="#f3e8ff" $c="#7c3aed"><FaChartBar/></IconBox>
          <AlertNum $warn={data.unpublished_results>0}>{data.unpublished_results}</AlertNum>
          <StatLbl>Unpublished Results</StatLbl>
        </StatCard>
      </StatsGrid>

      {/* Departments in this school */}
      {data.departments?.length > 0 && (
        <>
          <SectionTitle>Departments in {data.school_name}</SectionTitle>
          <DeptGrid>
            {data.departments.map((d,i)=>(
              <DeptCard key={d.id} $d={`${i*0.05}s`}>
                <DeptTop $img={d.logo}>
                  <DeptName>{d.name}</DeptName>
                </DeptTop>
                <DeptBody>
                  <DeptMeta>
                    <div><strong>{d.classes}</strong> classes</div>
                    <div><strong>{d.students}</strong> students</div>
                  </DeptMeta>
                  <ViewBtn to="/director/department">
                    Details <FaArrowRight size={10}/>
                  </ViewBtn>
                </DeptBody>
              </DeptCard>
            ))}
          </DeptGrid>
        </>
      )}

      {/* Quick actions */}
      <SectionTitle>Quick Actions</SectionTitle>
      <QuickGrid>
        {[
          {to:'/director/department',    icon:<FaSitemap/>,           lbl:'Departments'},
          {to:'/director/level-degree',  icon:<FaChalkboardTeacher/>, lbl:'Level Degrees'},
          {to:'/hod/staff/transcripts',  icon:<FaFileAlt/>,           lbl:'Transcripts'},
          {to:'/announcements',          icon:<FaExclamationTriangle/>,lbl:'Announcements'},
          {to:'/timetables',             icon:<FaChartBar/>,          lbl:'Timetables'},
          {to:'/profile',                icon:<MdVerifiedUser/>,      lbl:'Profile & Signature'},
        ].map(q=>(
          <QuickCard key={q.to} to={q.to}>
            <span className="icon">{q.icon}</span>{q.lbl}
          </QuickCard>
        ))}
      </QuickGrid>
    </Page>
  );
};

export default DirectorDashboard;
