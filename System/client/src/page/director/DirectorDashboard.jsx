import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { Link, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';

const DirectorDashboard = () => {
  const [data,setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(()=>{
      const fetchData = async ()=>{
        try{
        const res = await api.get("dashboard/director/dashboard");
        setData(res.data);
        // console.log(res.data);
        }catch(err){
          console.log(`Error in fetching data ${err}`);

        }finally{
          setIsLoading(false);
        }
      }
      fetchData();
  },[])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Welcome Director ....</h2>
        <div onClick={()=>{navigate(-1)}} style={{display:"flex", cursor:"pointer"}}>
          <MdArrowBack size={24}/> 
          <span>Go back</span>
          </div>
      </div>

      {isLoading ? (
        <p>Loading department data...</p>
      ) : data ? (
        <>
        <div className="data-grid">
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Schools</h3>
              </div>
              <div className="data-card-body">
                <p style={{ margin: 0 }}><strong>#:</strong> {data.total_schools}</p>
                <Link style={{ marginTop: '0.5rem', marginBottom: 0, color: 'var(--accent)' }} to="/director/school">Click to view details</Link>
              </div>
            </div>
        
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Level Degrees</h3>
              </div>
              <div className="data-card-body">
                <p style={{ margin: 0 }}><strong>#:</strong> {data.total_level_degrees}</p>
                <Link style={{ marginTop: '0.5rem', marginBottom: 0, color: 'var(--accent)' }} to="/director/level-degree">Click to view details</Link>
              </div>
            </div>
        
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Departments</h3>
              </div>
              <div className="data-card-body">
                <p style={{ margin: 0 }}><strong>#:</strong> {data.total_departments}</p>
                <Link style={{ marginTop: '0.5rem', marginBottom: 0, color: 'var(--accent)' }} to="/director/department">Click to view details</Link>
              </div>
            </div>
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Signatures</h3>
              </div>
              <div className="data-card-body">
                <p style={{ margin: 0 }}><strong>#:</strong> 0</p>
                <Link style={{ marginTop: '0.5rem', marginBottom: 0, color: 'var(--accent)' }} to="#">Click to view details</Link>
              </div>
            </div>
        </div>
        </>
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No informations on this dashboard. Try synchronisation.</p>
        </div>
      )}
    </div>
  )
}

export default DirectorDashboard
