import React, { useEffect, useState } from 'react'
import api from '../../services/api';
import { FaGraduationCap } from 'react-icons/fa';

const LevelDegree = () => {
  const [levelDegrees, setLevelDegrees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLevelDegrees = async () => {
      try {
        const res = await api.get("structure/level-degrees");
        setLevelDegrees(res.data);
      } catch (err) {
        console.log(`LevelDegree error: ${err}`);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLevelDegrees();
  }, []);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}><FaGraduationCap /> Level degree Overview</h2>
      </div>

      {isLoading ? (
        <p>Loading level degree data...</p>
      ) : levelDegrees.length > 0 ? (
        <div className="data-grid">
          {levelDegrees.map((levelDegree) => (
            <div key={levelDegree.id} className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">{levelDegree.name}</h3>
              </div>
              <div className="data-card-body">
                <p style={{ margin: 0 }}><strong>ID:</strong> {levelDegree.id}</p>
                <p style={{ marginTop: '0.5rem', marginBottom: 0, color: 'var(--accent)' }}>Click to view details</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No level degree found in the system. Try synchronisation.</p>
        </div>
      )}
    </div>
  )
}

export default LevelDegree
