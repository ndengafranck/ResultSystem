import React, { useEffect, useState } from 'react'
import api from '../../services/api'

const DirectorDashboard = () => {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await api.get("/structure/schools");
        setSchools(res.data);
      } catch (err) {
        console.error(`School error: ${err}`);
      } finally {
        setLoading(false);
      }
    }
    fetchSchools()
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>University Structural Overview</h2>
        <button className="btn btn-primary">Add New School</button>
      </div>

      {loading ? (
        <p>Loading school data...</p>
      ) : schools.length > 0 ? (
        <div className="data-grid">
          {schools.map((school) => (
            <div key={school.id} className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">{school.name}</h3>
              </div>
              <div className="data-card-body">
                <p style={{ margin: 0 }}><strong>ID:</strong> {school.id}</p>
                <p style={{ marginTop: '0.5rem', marginBottom: 0, color: 'var(--accent)' }}>Click to view details</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No schools found in the system. Start by creating structural units.</p>
        </div>
      )}
    </div>
  )
}

export default DirectorDashboard
