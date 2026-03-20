import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../services/api';
import { Alert, Spinner, PageLoader } from '../../components/UI';

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

const Card = styled.div`
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
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
  
  select, input {
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-family: inherit;
    font-size: 1rem;
    outline: none;
    
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


const ResultGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ResultItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid var(--border-color);
  border-radius: 6px;
`;

const HodStaffResults = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pastResults, setPastResults] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState(1);
  const [classFilter, setClassFilter] = useState('');
  const [publishStatus, setPublishStatus] = useState([]);
  const [publishing, setPublishing] = useState(null);

  const [uploadData, setUploadData] = useState({
    exam_info: '',
    resut_file: null
  });

  useEffect(() => {
    fetchExams();
    fetchPublishStatus();
  }, []);

  useEffect(() => {
    const fetchPastResults = async () => {
      try {
        const res = await api.get(`academic/result/staff/retrieve/${semesterFilter}/${classFilter}`);
        if (res.data) {
          setPastResults(res.data);
          console.log(res)
        }
      } catch (err) {
        console.error("Error fetching past results", err);
        setPastResults([]); // Not well implemented backend or missing perm
      }
    };

    if (classFilter) {
      fetchPastResults();
    }
  }, [semesterFilter, classFilter]);

  const fetchExams = async () => {
    try {
      const res = await api.get('academic/exams');
      if (res.data && res.data.data) {
        setExams(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching exams", err);
    }
  };

  const fetchPublishStatus = async () => {
    try {
      const res = await api.get('academic/result/publish/status');
      if (res.data && res.data.data) {
        setPublishStatus(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching publish status", err);
    }
  };

  const handlePublish = async (exam_exam_type_id, action) => {
    setPublishing(exam_exam_type_id);
    try {
      const res = await api.post('academic/result/publish', { exam_exam_type_id, action });
      setMessage({ type: 'success', text: res.data.message });
      fetchPublishStatus();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update publish status.' });
      console.log(err.response);
    } finally {
      setPublishing(null);
    }
  };

  const handleUploadChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'resut_file') {
      setUploadData(prev => ({ ...prev, resut_file: files[0] }));
    } else {
      setUploadData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.exam_info || !uploadData.resut_file) {
      setMessage({ type: 'error', text: 'Please select an exam and file.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const [class_course_id, exam_exam_type_id] = uploadData.exam_info.split('|');

    const formData = new FormData();
    formData.append('class_course_id', class_course_id);
    formData.append('exam_exam_type_id', exam_exam_type_id);
    formData.append('resut_file', uploadData.resut_file); // MUST be 'resut_file' based on serializer

    try {
      const res = await api.post('academic/result/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log(res);
      setMessage({
        type: 'success',
        text: `Results uploaded successfully.\nCreated: ${res.data.created}\nUpdated: ${res.data.updated}\nSkipped: ${res.data.skipped}\nDetails:\n${res.data.skipped_details.map((d)=>(`${d.student_name} => ${d.reason}\n`))}`
      });
      setUploadData({ exam_info: '', resut_file: null });
      // Clear file input
      document.getElementById('resut_file').value = "";
    } catch (err) {
      // The backend returns errors in err.response.data
      let errorText = 'Failed to upload results. Check your file format.';
      if (err.response?.data?.detail) {
        errorText = err.response.data.detail;
      }
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  // Get distinct classes from exams for the filter dropdown
  const distinctClasses = Array.from(new Set(exams.map(e => JSON.stringify({ id: e.class_id, name: e.class })))).map(e => JSON.parse(e));

  return (
    <PageContainer>
      <HeaderSection>
        <h2 style={{ margin: 0 }}>Manage Class Results</h2>
      </HeaderSection>

      <Card>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Upload Exam Results (CSV/Excel)</h3>

        {message.text && (
          <Alert variant={message.type}>{message.text}</Alert>
        )}

        <Form onSubmit={handleUploadSubmit}>
          <FormGroup>
            <label>Select Exam & Course</label>
            <select name="exam_info" value={uploadData.exam_info} onChange={handleUploadChange} required>
              <option value="">-- Select Exam --</option>
              {exams.map((ext, idx) => (
                <option key={idx} value={`${ext.class_course_id}|${ext.exam_exam_type_id}`}>
                  {ext.class} - {ext.course} ({ext.exam_type} on {ext.exam_date})
                </option>
              ))}
            </select>
          </FormGroup>

          <FormGroup>
            <label>Result File (.csv, .xlsx)</label>
            <input
              type="file"
              name="resut_file"
              id="resut_file"
              accept=".csv, .xlsx, .xls"
              onChange={handleUploadChange}
              required
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
              File must have columns: student_name, mark_obtained
            </p>
          </FormGroup>

          <SubmitBtn type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Results'}
          </SubmitBtn>
        </Form>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>View Past Uploads</h3>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <FormGroup style={{ flex: 1 }}>
            <label>Semester</label>
            <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </FormGroup>
          <FormGroup style={{ flex: 1 }}>
            <label>Class</label>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="">-- Select Class --</option>
              {distinctClasses.map((c, i) => (
                <option key={i} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormGroup>
        </div>

        {pastResults.length > 0 ? (
          <ResultGrid>
            <ResultItem style={{ background: 'var(--primary)', color: 'white', fontWeight: 'bold' }}>
              <div style={{ flex: 2 }}>Student Name</div>
              <div style={{ flex: 1 }}>Course</div>
              <div style={{ flex: 1 }}>Exam Type</div>
              <div style={{ flex: 1 }}>Mark</div>
              <div style={{ flex: 1 }}>Remark</div>
            </ResultItem>
            {pastResults.map((r, i) => (
              <ResultItem key={i}>
                <div style={{ flex: 2 }}>{r.student}</div>
                <div style={{ flex: 1 }}>{r.course}</div>
                <div style={{ flex: 1 }}>{r.exam_exam_type}</div>
                <div style={{ flex: 1, fontWeight: 'bold' }}>{r.mark_obtained}%</div>
                <div style={{ flex: 1 }}>{r.remark}</div>
              </ResultItem>
            ))}
          </ResultGrid>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: '#f9fafb', borderRadius: '6px' }}>
            {classFilter ? 'No past results found for this selection.' : 'Select a class to view past uploads.'}
          </div>
        )}
      </Card>

      {/* Publish / Unpublish Panel */}
      <Card>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Publish Results to Students</h3>

        {message.text && (
          <Alert $type={message.type} style={{ marginBottom: '1rem' }}>{message.text}</Alert>
        )}

        {publishStatus.length > 0 ? (
          <ResultGrid>
            <ResultItem style={{ background: 'var(--primary)', color: 'white', fontWeight: 'bold' }}>
              <div style={{ flex: 2 }}>Course</div>
              <div style={{ flex: 1 }}>Class</div>
              <div style={{ flex: 1 }}>Exam Type</div>
              <div style={{ flex: 1 }}>Results</div>
              <div style={{ flex: 1 }}>Status</div>
              <div style={{ flex: 1 }}>Action</div>
            </ResultItem>
            {publishStatus.map((ps, i) => (
              <ResultItem key={i}>
                <div style={{ flex: 2 }}>{ps.course}</div>
                <div style={{ flex: 1 }}>{ps.class}</div>
                <div style={{ flex: 1 }}>{ps.exam_type}</div>
                <div style={{ flex: 1 }}>{ps.published_results}/{ps.total_results}</div>
                <div style={{ flex: 1 }}>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: ps.is_fully_published ? '#dcfce7' : '#fef9c3',
                    color: ps.is_fully_published ? '#16a34a' : '#92400e'
                  }}>
                    {ps.is_fully_published ? 'Published' : 'Unpublished'}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  {ps.total_results > 0 && (
                    <button
                      className="btn"
                      disabled={publishing === ps.exam_exam_type_id}
                      onClick={() => handlePublish(ps.exam_exam_type_id, ps.is_fully_published ? 'unpublish' : 'publish')}
                      style={{
                        padding: '0.3rem 0.75rem',
                        fontSize: '0.8rem',
                        background: ps.is_fully_published ? '#fee2e2' : '#dcfce7',
                        color: ps.is_fully_published ? '#dc2626' : '#16a34a',
                        border: `1px solid ${ps.is_fully_published ? '#fca5a5' : '#86efac'}`,
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {publishing === ps.exam_exam_type_id ? '...' : ps.is_fully_published ? 'Unpublish' : 'Publish'}
                    </button>
                  )}
                </div>
              </ResultItem>
            ))}
          </ResultGrid>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: '#f9fafb', borderRadius: '6px' }}>
            No exam results found to publish.
          </div>
        )}
      </Card>

    </PageContainer>
  );
};

export default HodStaffResults;
