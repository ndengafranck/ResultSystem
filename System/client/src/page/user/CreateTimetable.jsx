import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styled from 'styled-components';
import { FaSave, FaTimes, FaFilePdf } from 'react-icons/fa';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  margin: 0;
  color: var(--text-primary);
`;

const Form = styled.form`
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
`;

const ClassesSection = styled.div`
  margin-bottom: 1.5rem;
`;

const ClassesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
`;

const ClassCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }

  input {
    margin: 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;

  ${props => props.primary ? `
    background: var(--primary);
    color: white;

    &:hover {
      background: var(--primary-dark);
    }
  ` : `
    background: var(--bg-color);
    color: var(--text-primary);
    border: 1px solid var(--border-color);

    &:hover {
      background: var(--border-color);
    }
  `}
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: var(--text-secondary);
`;

const CreateTimetable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    pdf_file: null,
    class_ids: []
  });
  const [classes, setClasses] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      // Get teacher's department from user profile or assume it's available
      // For now, fetch all classes and the backend will validate
      const response = await api.get('structure/classes/');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      pdf_file: file
    }));
  };

  const handleClassChange = (classId, checked) => {
    setFormData(prev => ({
      ...prev,
      class_ids: checked
        ? [...prev.class_ids, classId]
        : prev.class_ids.filter(id => id !== classId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('pdf_file', formData.pdf_file);
      formData.class_ids.forEach(id => {
        submitData.append('class_ids', id);
      });

      await api.post('announcements/timetables/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/timetables');
    } catch (error) {
      console.error('Error creating timetable:', error);
      alert('Error creating timetable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.title) {
    return (
      <Container>
        <LoadingSpinner>Loading...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Create Timetable</Title>
      </Header>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Title *</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Spring 2024 Timetable"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="pdf_file">PDF File *</Label>
          <FileInput
            type="file"
            id="pdf_file"
            name="pdf_file"
            onChange={handleFileChange}
            accept=".pdf"
            required
          />
          <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
            Only PDF files are allowed
          </small>
        </FormGroup>

        <ClassesSection>
          <Label>Select Classes *</Label>
          <small style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
            Select the classes this timetable applies to
          </small>
          <ClassesGrid>
            {classes.length > 0 ? (
              classes.map((cls) => (
                <ClassCheckbox key={cls.id}>
                  <input
                    type="checkbox"
                    checked={formData.class_ids.includes(cls.id)}
                    onChange={(e) => handleClassChange(cls.id, e.target.checked)}
                  />
                  {cls.name}
                </ClassCheckbox>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No classes available for your department
              </div>
            )}
          </ClassesGrid>
        </ClassesSection>

        <ButtonGroup>
          <Button type="button" onClick={() => navigate('/timetables')}>
            <FaTimes /> Cancel
          </Button>
          <Button type="submit" primary disabled={loading || formData.class_ids.length === 0}>
            <FaSave /> {loading ? 'Creating...' : 'Create Timetable'}
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default CreateTimetable;