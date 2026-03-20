import React, { useEffect, useState } from 'react'
import api from '../../services/api';
import { PageLoader } from '../../components/UI';
import { FaBuilding } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';

function Department() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("structure/departments");
        setDepartments(res.data);
      } catch (err) {
        console.log(`Department error: ${err}`);
      } finally {
        setIsLoading(false)
      }
    }
    fetchDepartments();
  }, []);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}><FaBuilding /> Department Overview</h2>
        <div onClick={() => { navigate(-1) }} style={{ display: "flex", cursor: "pointer" }}>
          <MdArrowBack size={24} />
          <span>Go back</span>
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : departments.length > 0 ? (
        <div className="data-grid">
          {departments.map((department) => (
            <div key={department.id} className="data-card">
              <div className="data-card-header"
                style={{
                  backgroundImage: `url(${department.logo})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}>
                <h3 className="data-card-title">{department.name}</h3>
              </div>
              <div className="data-card-body">
                <p style={{ margin: 0 }}><strong>ID:</strong> {department.id}</p>
                <p style={{ marginTop: '0.5rem', marginBottom: 0, color: 'var(--accent)' }}>Click to view details</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No department found in the system. Try synchronisation.</p>
        </div>
      )}
    </div>
  )
}

export default Department
