import React, { useState } from 'react'
import api from '../../services/api';

const HodStaffDashboard = () => {
  const [isSyncing,setIsSyncing] = useState(false);
  
  const assignedClasses = [
    { id: 1, name: 'Computer Science Yr1', courseCount: 4 },
    { id: 2, name: 'Software Engineering Yr2', courseCount: 2 },
  ];

  const handleSync = async () =>{
    try{
      setIsSyncing(true);
      const res = await api.get("sync/data");
      console.log(res);
    }catch(err){
      console.log(`Error of synchronisation ${err}`);
    }finally{
      setIsSyncing(false)
    }
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Department & Staff Overview</h2>
        <button className="btn btn-primary" onClick={()=>handleSync()}>
          {isSyncing ? 
          <span>Synchronising.....</span> :
          "Synchronise Databases"
          } 
          </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '2rem' }}>
        <div>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Assigned Classes</h3>

          <div className="data-grid">
            {assignedClasses.map(cls => (
              <div key={cls.id} className="data-card">
                <div className="data-card-header">
                  <h3 className="data-card-title">{cls.name}</h3>
                </div>
                <div className="data-card-body">
                  <p style={{ margin: 0 }}>Courses Taught: {cls.courseCount}</p>
                  <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                    <a href="#" style={{ color: 'var(--accent)', fontWeight: 500 }}>Manage Class &rarr;</a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Panel for Quick Actions */}
        <div>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Quick Actions</h3>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><button className="btn" style={{ width: '100%', textAlign: 'left', background: '#f8fafc', color: 'var(--primary)', border: '1px solid #cbd5e1' }}>View Department Degrees</button></li>
              <li><button className="btn" style={{ width: '100%', textAlign: 'left', background: '#f8fafc', color: 'var(--primary)', border: '1px solid #cbd5e1' }}>Evaluate Exams</button></li>
              <li><button className="btn" style={{ width: '100%', textAlign: 'left', background: '#f8fafc', color: 'var(--primary)', border: '1px solid #cbd5e1' }}>Generate Report</button></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HodStaffDashboard
