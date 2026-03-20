import React, { useState, useEffect } from 'react'
import api from '../../services/api';
import { useSync } from '../../context/SyncContext';
import { Alert, PageLoader, HeroSection, HeroTitle, HeroSub, SectionTitle, StatCard, IconBox, ActionBtn } from '../../components/UI';
import { useNavigate } from 'react-router-dom';

const HodStaffDashboard = () => {
  const { isSyncing, syncError, syncSuccess, startSync } = useSync();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    // Try HOD dashboard first, fall back to staff dashboard
    try {
      const res = await api.get("dashboard/hod/dashboard");
      setDashData(res.data);
    } catch {
      try {
        const res = await api.get("dashboard/staff/dashboard");
        setDashData(res.data);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const res = await api.get("sync/data");
      console.log(res);
    } catch (err) {
      console.log(`Error of synchronisation ${err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Department & Staff Overview</h2>
        <button className="btn btn-primary" onClick={startSync}>
          {isSyncing ? <span>Synchronising.....</span> : "Synchronise Databases"}
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : dashData ? (
        <>
          {/* Stats */}
          <div className="data-grid" style={{ marginBottom: '2rem' }}>
            <div className="data-card">
              <div className="data-card-header"><h3 className="data-card-title">Department</h3></div>
              <div className="data-card-body"><p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>{dashData.department}</p></div>
            </div>
            <div className="data-card">
              <div className="data-card-header"><h3 className="data-card-title">Classes</h3></div>
              <div className="data-card-body"><p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{dashData.total_classes}</p></div>
            </div>
            <div className="data-card">
              <div className="data-card-header"><h3 className="data-card-title">Students</h3></div>
              <div className="data-card-body"><p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{dashData.total_students}</p></div>
            </div>
            <div className="data-card">
              <div className="data-card-header"><h3 className="data-card-title">Pending Complaints</h3></div>
              <div className="data-card-body"><p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: dashData.pending_complaints > 0 ? '#dc2626' : 'var(--primary)' }}>{dashData.pending_complaints}</p></div>
            </div>
            {dashData.unpublished_results !== undefined && (
              <div className="data-card">
                <div className="data-card-header"><h3 className="data-card-title">Unpublished Results</h3></div>
                <div className="data-card-body"><p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: dashData.unpublished_results > 0 ? '#d97706' : 'var(--primary)' }}>{dashData.unpublished_results}</p></div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button className="btn" style={{ background: '#f8fafc', color: 'var(--primary)', border: '1px solid #cbd5e1' }} onClick={() => navigate('/hod/staff/results')}>Upload / Publish Results</button>
            <button className="btn" style={{ background: '#f8fafc', color: 'var(--primary)', border: '1px solid #cbd5e1' }} onClick={() => navigate('/hod/staff/class')}>Manage Classes</button>
            <button className="btn" style={{ background: '#f8fafc', color: 'var(--primary)', border: '1px solid #cbd5e1' }} onClick={() => navigate('/hod/staff/complaints')}>Manage Complaints</button>
            <button className="btn" style={{ background: '#f8fafc', color: 'var(--primary)', border: '1px solid #cbd5e1' }} onClick={() => navigate('/hod/staff/department-visualization')}>Department Analytics</button>
          </div>
        </>
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No data available. Try synchronising.</p>
        </div>
      )}
    </div>
  )
}

export default HodStaffDashboard
