import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SelectFilter = styled.select`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: white;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
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

const ComplaintGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ComplaintItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const ComplaintDetails = styled.div`
  flex: 1;
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

const StatusSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  min-width: 150px;
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
      case 'Under Review': return 'background: #fef3c7; color: #d97706;';
      case 'Approved': return 'background: #dcfce7; color: #16a34a;';
      case 'Responded': return 'background: #fef9c3; color: #ca8a04;';
      case 'Solved': return 'background: #dcfce7; color: #16a34a;';
      case 'Rejected': return 'background: #fee2e2; color: #dc2626;';
      default: return 'background: #f3f4f6; color: #4b5563;';
    }
  }}
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background: var(--text-secondary);
    cursor: not-allowed;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;

  label {
    font-weight: 500;
    font-size: 0.9rem;
    color: var(--text-primary);
  }

  textarea {
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-family: inherit;
    font-size: 1rem;
    outline: none;
    min-height: 100px;
    resize: vertical;

    &:focus {
      border-color: var(--primary);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const StaffComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
    console.log(complaints)
  }, [complaints, statusFilter]);

  const fetchComplaints = async () => {
    try {
      // Assuming an endpoint for staff to view all complaints
      const res = await api.get('academic/complaints/');
      if (res.data) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.error("Error fetching complaints:", err);
      // Fallback mock data
      setComplaints([
        {
          id: 1,
          student_name: 'John Doe',
          student_id: 'STU001',
          course: 'Mathematics',
          exam_exam_type: 'Final Exam',
          original_mark: 65,
          concern: 'I believe there was an error in marking my calculus questions',
          resolution_sought: 'Re-mark my script',
          evidence: null,
          status: 'Submitted',
          submitted_date: '2024-01-15'
        },
        {
          id: 2,
          student_name: 'Jane Smith',
          student_id: 'STU002',
          course: 'Physics',
          exam_exam_type: 'Mid-term Exam',
          original_mark: 72,
          concern: 'The marking scheme seems inconsistent with the rubric provided',
          resolution_sought: 'Review marking scheme',
          evidence: 'evidence_url.jpg',
          status: 'Under Review',
          submitted_date: '2024-01-12'
        },
        {
          id: 3,
          student_name: 'Bob Johnson',
          student_id: 'STU003',
          course: 'Chemistry',
          exam_exam_type: 'Final Exam',
          original_mark: 58,
          concern: 'Addition error in the total calculation',
          resolution_sought: 'Correct addition error',
          evidence: null,
          status: 'Solved',
          submitted_date: '2024-01-10'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    if (statusFilter === 'all') {
      setFilteredComplaints(complaints);
    } else {
      setFilteredComplaints(complaints.filter(c => c.status === statusFilter));
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await api.patch(`academic/complaints/${complaintId}/`, { status: newStatus });
      setComplaints(complaints.map(c =>
        c.id === complaintId ? { ...c, status: newStatus } : c
      ));
    } catch (err) {
      console.error("Error updating status:", err);
      // Fallback for demo
      setComplaints(complaints.map(c =>
        c.id === complaintId ? { ...c, status: newStatus } : c
      ));
    }
  };

  const handleRespond = async () => {
    if (!selectedComplaint || !responseText.trim()) return;

    setResponding(true);
    try {
      await api.post(`academic/complaints/${selectedComplaint.id}/respond/`, {
        response: responseText
      });
      setComplaints(complaints.map(c =>
        c.id === selectedComplaint.id ? { ...c, status: 'Responded' } : c
      ));
      setSelectedComplaint(null);
      setResponseText('');
    } catch (err) {
      console.error("Error sending response:", err);
      // Fallback
      setComplaints(complaints.map(c =>
        c.id === selectedComplaint.id ? { ...c, status: 'Responded' } : c
      ));
      setSelectedComplaint(null);
      setResponseText('');
    } finally {
      setResponding(false);
    }
  };

  const getStatusOptions = () => {
    const statuses = ['all', 'Submitted', 'Under Review', 'Approved', 'Responded', 'Solved', 'Rejected'];
    return statuses.filter(status => status !== 'all' || status === 'all');
  };

  return (
    <PageContainer>
      <HeaderSection>
        <h2 style={{ margin: 0 }}>Student Complaints Management</h2>
        <FilterSection>
          <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Filter by Status:</label>
          <SelectFilter value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Complaints</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Responded">Responded</option>
            <option value="Solved">Solved</option>
            <option value="Rejected">Rejected</option>
          </SelectFilter>
        </FilterSection>
      </HeaderSection>

      <Card>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          Complaints ({filteredComplaints.length})
        </h3>

        {loading ? (
          <p>Loading complaints...</p>
        ) : filteredComplaints.length > 0 ? (
          <ComplaintGrid>
            {filteredComplaints.map(complaint => (
              <ComplaintItem key={complaint.id}>
                <ComplaintDetails>
                  <h4>Complaint #{complaint.id} - {complaint.student.school_mail} ({complaint.student.matricule})</h4>
                  <p><strong>Course:</strong> {complaint.course} - {complaint.exam_exam_type}</p>
                  <p><strong>Original Mark:</strong> {complaint.original_mark}%</p>
                  <p><strong>Concern:</strong> {complaint.concern}</p>
                  <p><strong>Resolution Sought:</strong> {complaint.resolution_sought}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Submitted: {new Date(complaint.created_at).toLocaleDateString()}
                  </p>
                  {complaint.evidence && (
                    <p>
                      <a href={complaint.evidence} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                        View Evidence
                      </a>
                    </p>
                  )}
                </ComplaintDetails>
                <StatusSection>
                  <StatusBadge $status={complaint.status}>{complaint.status}</StatusBadge>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {complaint.status === 'Submitted' && (
                      <ActionButton
                        onClick={() => handleStatusUpdate(complaint.id, 'Under Review')}
                        style={{ background: '#f59e0b' }}
                      >
                        Review
                      </ActionButton>
                    )}
                    {complaint.status === 'Under Review' && (
                      <>
                        <ActionButton
                          onClick={() => setSelectedComplaint(complaint)}
                          style={{ background: '#10b981' }}
                        >
                          Respond
                        </ActionButton>
                        <ActionButton
                          onClick={() => handleStatusUpdate(complaint.id, 'Approved')}
                          style={{ background: '#059669' }}
                        >
                          Approve
                        </ActionButton>
                        <ActionButton
                          onClick={() => handleStatusUpdate(complaint.id, 'Rejected')}
                          style={{ background: '#dc2626' }}
                        >
                          Reject
                        </ActionButton>
                      </>
                    )}
                    {(complaint.status === 'Approved' || complaint.status === 'Responded') && (
                      <ActionButton
                        onClick={() => handleStatusUpdate(complaint.id, 'Solved')}
                        style={{ background: '#059669' }}
                      >
                        Mark Solved
                      </ActionButton>
                    )}
                  </div>
                </StatusSection>
              </ComplaintItem>
            ))}
          </ComplaintGrid>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: '#f9fafb', borderRadius: '6px' }}>
            No complaints found with the selected filter.
          </div>
        )}
      </Card>

      {selectedComplaint && (
        <Modal>
          <ModalContent>
            <h3>Respond to Complaint #{selectedComplaint.id}</h3>
            <p><strong>Student:</strong> {selectedComplaint.student_name}</p>
            <p><strong>Concern:</strong> {selectedComplaint.concern}</p>
            <FormGroup>
              <label>Your Response:</label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Enter your response to the student's complaint..."
                required
              />
            </FormGroup>
            <ButtonGroup>
              <ActionButton
                onClick={() => {
                  setSelectedComplaint(null);
                  setResponseText('');
                }}
                style={{ background: '#6b7280' }}
              >
                Cancel
              </ActionButton>
              <ActionButton
                onClick={handleRespond}
                disabled={responding || !responseText.trim()}
              >
                {responding ? 'Sending...' : 'Send Response'}
              </ActionButton>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};

export default StaffComplaints;