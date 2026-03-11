import React, { useEffect, useState } from 'react'
import api from '../../services/api';
import { FaSchool } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';

const School = () => {

  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await api.get("/structure/schools");
        setSchools(res.data);
        console.log(res);
      } catch (err) {
        console.log(`Schools error: ${err}`);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchools()
  }, []);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}><FaSchool /> Schools Overview</h2>
        <div onClick={() => { navigate(-1) }} style={{ display: "flex", cursor: "pointer" }}>
          <MdArrowBack size={24} />
          <span>Go back</span>
        </div>
      </div>

      {isLoading ? (
        <p>Loading school data...</p>
      ) : schools.length > 0 ? (
        <div className="data-grid">
          {schools.map((school) => (
            <div key={school.id} className="data-card">
              <div className="data-card-header"
                style={{
                  backgroundImage: `url(${school.logo})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}>
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
          <p style={{ color: 'var(--text-secondary)' }}>No schools found in the system. Try synchronisation.</p>
        </div>
      )}
    </div>
  )
}

export default School
