import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
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
`;

const ComplaintGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Card = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
`;

const ComplaintItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const DetailSect = styled.div`
  h4 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
  }
  p {
    margin: 0 0 0.25rem 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  height: fit-content;
  
  ${props => {
        switch (props.$status) {
            case 'Submitted': return 'background: #eef2ff; color: #4f46e5;';
            case 'Approved': return 'background: #dcfce7; color: #16a34a;';
            case 'Responded': return 'background: #fef9c3; color: #ca8a04;';
            case 'Solved': return 'background: #dcfce7; color: #16a34a;';
            default: return 'background: #f3f4f6; color: #4b5563;';
        }
    }}
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-weight: 500;
    font-size: 0.9rem;
    color: var(--text-primary);
  }
  
  input, textarea, select {
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-family: inherit;
    font-size: 1rem;
    outline: none;
    background: white;
    
    &:focus {
      border-color: var(--primary);
    }
  }
`;

const SubmitBtn = styled.button`
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    background: var(--text-secondary);
    cursor: not-allowed;
  }
`;

const Alert = styled.div`
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  background: ${props => props.$type === 'success' ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.$type === 'success' ? '#16a34a' : '#dc2626'};
  border: 1px solid ${props => props.$type === 'success' ? '#bbf7d0' : '#fecaca'};
`;

const StudentComplaint = () => {
    const location = useLocation();
    const preloadResult = location.state?.resultInfo || null;

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        exam_exam_type_id: preloadResult?.exam_exam_type_id || '',
        original_mark: preloadResult?.mark_obtained || '',
        resolution_sought: '',
        concern: '',
        evidence: null
    });

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const res = await api.get('academics/complaints/');
            if (res.data) setComplaints(res.data);
        } catch (err) {
            console.error("Error fetching complaints", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'evidence') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const submissionData = new FormData();
        submissionData.append('exam_exam_type_id', formData.exam_exam_type_id);
        submissionData.append('original_mark', formData.original_mark);
        submissionData.append('resolution_sought', formData.resolution_sought);
        submissionData.append('concern', formData.concern);
        if (formData.evidence) {
            submissionData.append('evidence', formData.evidence);
        }

        try {
            await api.post('academics/complaints/', submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage({ type: 'success', text: 'Complaint submitted successfully!' });
            setFormData({
                exam_exam_type_id: '',
                original_mark: '',
                resolution_sought: '',
                concern: '',
                evidence: null
            });
            fetchComplaints();
        } catch (err) {
            console.error("Error submitting", err);
            setMessage({ type: 'error', text: 'Failed to submit complaint. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <HeaderSection>
                <h2 style={{ margin: 0 }}>Appeals & Complaints</h2>
            </HeaderSection>

            <Card>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Submit a New Complaint</h3>

                {message.text && (
                    <Alert $type={message.type}>{message.text}</Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    {preloadResult && (
                        <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '6px', marginBottom: '1rem' }}>
                            <p style={{ margin: 0 }}><strong>Filing complaint for:</strong> {preloadResult.course} ({preloadResult.exam_exam_type})</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Recorded Mark: {preloadResult.mark_obtained}%</p>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <FormGroup>
                            <label>Exam/Result ID (Required)</label>
                            <input
                                type="number"
                                name="exam_exam_type_id"
                                value={formData.exam_exam_type_id}
                                onChange={handleChange}
                                required
                                placeholder="Enter ID or select from Results page"
                                readOnly={!!preloadResult}
                            />
                        </FormGroup>
                        <FormGroup>
                            <label>Original Mark</label>
                            <input
                                type="number"
                                step="0.01"
                                name="original_mark"
                                value={formData.original_mark}
                                onChange={handleChange}
                                required
                                readOnly={!!preloadResult}
                            />
                        </FormGroup>
                    </div>

                    <FormGroup>
                        <label>Resolution Sought</label>
                        <input
                            type="text"
                            name="resolution_sought"
                            value={formData.resolution_sought}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Re-mark my script, Check addition error..."
                        />
                    </FormGroup>

                    <FormGroup>
                        <label>Detailed Concern</label>
                        <textarea
                            name="concern"
                            value={formData.concern}
                            onChange={handleChange}
                            required
                            rows="4"
                            placeholder="Explain the issue in detail..."
                        />
                    </FormGroup>

                    <FormGroup>
                        <label>Evidence (Optional Image)</label>
                        <input
                            type="file"
                            name="evidence"
                            accept="image/*"
                            onChange={handleChange}
                        />
                    </FormGroup>

                    <SubmitBtn type="submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Complaint'}
                    </SubmitBtn>
                </Form>
            </Card>

            <Card>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>My Complaint History</h3>

                {loading && complaints.length === 0 ? (
                    <p>Loading history...</p>
                ) : complaints.length > 0 ? (
                    <ComplaintGrid>
                        {complaints.map(comp => (
                            <ComplaintItem key={comp.id}>
                                <DetailSect>
                                    <h4>Complaint #{comp.id}</h4>
                                    <p><strong>Concern:</strong> {comp.concern.length > 50 ? comp.concern.substring(0, 50) + '...' : comp.concern}</p>
                                    <p><strong>Resolution Sought:</strong> {comp.resolution_sought}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Exam Type ID: {comp.exam_exam_type}</p>
                                </DetailSect>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    <StatusBadge $status={comp.status || 'Submitted'}>{comp.status || 'Submitted'}</StatusBadge>
                                    {comp.evidence && <a href={comp.evidence} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>View Evidence</a>}
                                </div>
                            </ComplaintItem>
                        ))}
                    </ComplaintGrid>
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: '#f9fafb', borderRadius: '6px' }}>
                        You haven't submitted any complaints yet.
                    </div>
                )}
            </Card>
        </PageContainer>
    );
};

export default StudentComplaint;
