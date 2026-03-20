import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { PageLoader } from '../../components/UI';
import styled from 'styled-components';

const StudentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StudentItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid var(--border-color);
  border-radius: 6px;
`;

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [classInfo, setClassInfo] = useState(null);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await api.get(`structure/class/${id}`);
        setClassInfo(res.data);
      } catch (err) {
        console.error('Error fetching class info', err);
      }
    };

    fetchClass();
  }, [id]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // backend may expose students under this subroute; if not, adjust accordingly
        const res = await api.get(`user/students/${id}/class/`);
        setStudents(res.data);
      } catch (err) {
        console.error('Error fetching students for class', err);
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [id]);

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
        &larr; Back
      </button>
      <h2 style={{ marginTop: 0 }}>
        {classInfo ? classInfo.name : `Class ${id}`}
      </h2>

      {isLoading ? (
        <PageLoader />
      ) : students.length > 0 ? (
        <StudentGrid>
          <StudentItem
            style={{ background: 'var(--primary)', color: 'white', fontWeight: 'bold' }}
          >
            <div style={{ flex: 1 }}>Student Matricule</div>
            <div style={{ flex: 2 }}>Student Name</div>
            <div style={{ flex: 2 }}>School Mail</div>
            <div style={{ flex: 1 }}>Enrolled Year</div>
          </StudentItem>
          {students.map((s) => (
            <StudentItem key={s.id || s.pk || JSON.stringify(s)}>
              <div style={{ flex: 1 }}>
                {s.student_matricule}
              </div>
              <div style={{ flex: 2 }}>
                {s.student_name}
              </div>
              <div style={{ flex: 2 }}>
                {s.student_email}
              </div>
              <div style={{ flex: 1 }}>
                {s.enrolled_year}
              </div>
            </StudentItem>
          ))}
        </StudentGrid>
      ) : (
        <p>No students found for this class.</p>
      )}
    </div>
  );
};

export default ClassDetail;
