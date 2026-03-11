import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SelectSemester = styled.select`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: white;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  outline: none;
  &:focus {
    border-color: var(--primary);
  }
`;

const Card = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
`;

const ChartContainer = styled(Card)`
  height: 400px;
`;

const ResultGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ResultItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const CourseInfo = styled.div`
  h4 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
  }
  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
`;

const GradeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  .mark {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary);
  }
  
  .remark {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    background: ${props => props.$isFail ? '#fee2e2' : '#dcfce7'};
    color: ${props => props.$isFail ? '#dc2626' : '#16a34a'};
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background: white;
  color: var(--danger);
  border: 1px solid var(--danger);
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--danger);
    color: white;
  }
`;

const StudentResult = () => {
    const [semester, setSemester] = useState(1);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchResults();
    }, [semester]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const res = await api.get(`academics/result/student/retrieve/${semester}`);
            if (res.data && res.data.user) {
                setResults(res.data.user);
            } else {
                setResults([]);
            }
        } catch (err) {
            console.error("Error fetching results:", err);
            // Fallback for UI visualization if API fails or backend gives 403
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleComplaint = (result) => {
        navigate('/student/complaint', { state: { resultInfo: result } });
    };

    // Prepare chart data format
    const chartData = results.map(r => ({
        name: r.course.length > 15 ? r.course.substring(0, 15) + '...' : r.course,
        mark: parseFloat(r.mark_obtained)
    }));

    return (
        <PageContainer>
            <HeaderSection>
                <h2 style={{ margin: 0 }}>My Academic Results</h2>
                <div>
                    <SelectSemester value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
                        <option value={1}>Semester 1</option>
                        <option value={2}>Semester 2</option>
                        <option value={3}>Semester 3</option>
                        <option value={4}>Semester 4</option>
                        <option value={5}>Semester 5</option>
                        <option value={6}>Semester 6</option>
                    </SelectSemester>
                </div>
            </HeaderSection>

            <ChartContainer>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Performance Analytics</h3>
                {results.length > 0 ? (
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Bar dataKey="mark" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} name="Mark Obtained (%)" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ height: '85%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        {loading ? 'Loading analytics...' : 'No data available for this semester'}
                    </div>
                )}
            </ChartContainer>

            <Card>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Detailed Results</h3>

                {loading ? (
                    <p>Loading results...</p>
                ) : results.length > 0 ? (
                    <ResultGrid>
                        {results.map((result, idx) => {
                            const { course, exam_exam_type, mark_obtained, remark } = result;
                            const isFail = remark === "Weak";

                            return (
                                <ResultItem key={idx}>
                                    <CourseInfo>
                                        <h4>{course}</h4>
                                        <p>Exam Type: {exam_exam_type}</p>
                                    </CourseInfo>
                                    <GradeInfo $isFail={isFail}>
                                        <span className="mark">{mark_obtained}%</span>
                                        <span className="remark">{remark}</span>
                                        <ActionButton onClick={() => handleComplaint(result)}>
                                            File Complaint
                                        </ActionButton>
                                    </GradeInfo>
                                </ResultItem>
                            );
                        })}
                    </ResultGrid>
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: '#f9fafb', borderRadius: '6px' }}>
                        No results published for this semester yet.
                    </div>
                )}
            </Card>
        </PageContainer>
    );
};

export default StudentResult;
