import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { PageLoader } from '../../components/UI';
import styled from 'styled-components';

const Section = styled.div`
  margin-bottom: 2rem;
`;

const Table = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: ${props => (props.header ? 'var(--primary)' : '#f9fafb')};
  color: ${props => (props.header ? 'white' : 'inherit')};
  font-weight: ${props => (props.header ? 'bold' : 'normal')};
  border-radius: 4px;
`;

const StudentResults = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get(`academic/result/staff/retrieve/${studentId}`);
        setResults(res.data);
      } catch (err) {
        console.error('Error fetching student results', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [studentId]);

  const studentName = results.length > 0 ? results[0].student : '';

  // group by semester then exam type
  const grouped = results.reduce((acc, r) => {
    const sem = r.semester_num || 'Unknown';
    const exam = r.exam_exam_type || 'Unknown';
    acc[sem] = acc[sem] || {};
    acc[sem][exam] = acc[sem][exam] || [];
    acc[sem][exam].push(r);
    return acc;
  }, {});

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
        &larr; Back
      </button>
      <h2 style={{ marginTop: 0 }}>Results for {studentName || `#${studentId}`}</h2>

      {loading ? (
        <PageLoader />
      ) : results.length === 0 ? (
        <p>No results available for this student.</p>
      ) : (
        Object.entries(grouped).map(([semester, exams]) => (
          <Section key={semester}>
            <h3>Semester {semester}</h3>
            {Object.entries(exams).map(([examType, entries]) => (
              <div key={examType} style={{ marginBottom: '1rem' }}>
                <h4>{examType}</h4>
                <Table>
                  <Row header>
                    <div style={{ flex: 1 }}>Course code</div>
                    <div style={{ flex: 2 }}>Course name</div>
                    <div style={{ flex: 1 }}>Course type</div>
                    <div style={{ flex: 1 }}>Mark</div>
                    <div style={{ flex: 1 }}>Remark</div>
                  </Row>
                  {entries.map((e, i) => (
                    <Row key={i}>
                      <div style={{ flex: 1 }}>{e.course_code || ''}</div>
                      <div style={{ flex: 2 }}>{e.course || ''}</div>
                      <div style={{ flex: 1 }}>{e.course_type || ''}</div>
                      <div style={{ flex: 1 }}>{e.mark_obtained}%</div>
                      <div style={{ flex: 1 }}>{e.remark || ''}</div>
                    </Row>
                  ))}
                </Table>
              </div>
            ))}
          </Section>
        ))
      )}
    </div>
  );
};

export default StudentResults;
