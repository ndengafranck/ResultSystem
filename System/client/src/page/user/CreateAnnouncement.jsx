import {React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styled from 'styled-components';
import { FaSave, FaTimes } from 'react-icons/fa';

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

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
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

const CreateAnnouncement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_type: 'department',
    target_class: '',
    target_department: '',
    uploaded_files: []
  });
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    
    const fetchProfile = async () => {
      try {
        const res = await api.get("user/profile/");
        setProfile(res.data);
      } catch (err) {
        console.log(`Profile error: ${err}`);
      }
    };
    fetchProfile();
    
    fetchDepartments();
  }, []);


  const fetchDepartments = async () => {
    try {
      if (user?.user_type === 'Admin') {
        // Director fetches only his school's departments (backend already scopes this)
        const response = await api.get('structure/departments/');
        setDepartments(response.data);
      }
      // For teachers, departments will be set from profile
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchClasses = async (departmentId) => {
    try {
      let url = 'structure/classes/';

      if (departmentId) {
        url += `?department=${departmentId}`;
      }
      const response = await api.get(url);
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

    if (name === 'target_type') {
      if (value === 'department' && user?.user_type === 'Teacher' && profile?.department_id) {
        setFormData(prev => ({
          ...prev,
          target_department: profile.department_id
        }));
      }
      if (value === 'department' || value === 'class') {
        fetchDepartments();
        fetchClasses(value === 'class' ? (user?.user_type === 'Admin' ? formData.target_department : profile?.department_id) : null);
      }
    }

    if (name === 'target_department' && user?.user_type === 'Admin') {
      fetchDepartments();
      fetchClasses(formData.target_type === 'class' ? value : null);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      uploaded_files: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('target_type', formData.target_type);

      if (formData.target_type === 'department' || formData.target_type === 'class') {
        submitData.append('target_department', formData.target_department);
      }

      if (formData.target_type === 'class') {
        submitData.append('target_class', formData.target_class);
      }

      formData.uploaded_files.forEach((file, index) => {
        submitData.append('uploaded_files', file);
      });
      console.log(formData);
      console.log(submitData);
      await api.post('announcements/announcements/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/announcements');
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Error creating announcement. Please try again.');
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
        <Title>Create Announcement</Title>
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
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="target_type">Target Type *</Label>
          <Select
            id="target_type"
            name="target_type"
            value={formData.target_type}
            onChange={handleInputChange}
            required
          >
            {user?.user_type === 'Admin' && (
              <option value="school">School</option>
            )}
            <option value="department">Department</option>
            <option value="class">Class</option>
          </Select>
        </FormGroup>

        {(formData.target_type === 'department' || formData.target_type === 'class') && user?.user_type === 'Admin' && (
          <FormGroup>
            <Label htmlFor="target_department">Department *</Label>
            <Select
              id="target_department"
              name="target_department"
              value={formData.target_department}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </Select>
          </FormGroup>
        )}

        {formData.target_type === 'class' && (
          <FormGroup>
            <Label htmlFor="target_class">Class *</Label>
            <Select
              id="target_class"
              name="target_class"
              value={formData.target_class}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </Select>
          </FormGroup>
        )}

        <FormGroup>
          <Label htmlFor="uploaded_files">Attachments</Label>
          <FileInput
            type="file"
            id="uploaded_files"
            name="uploaded_files"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          />
          <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
            You can upload multiple files. Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG
          </small>
        </FormGroup>

        <ButtonGroup>
          <Button type="button" onClick={() => navigate('/announcements')}>
            <FaTimes /> Cancel
          </Button>
          <Button type="submit" primary disabled={loading}>
            <FaSave /> {loading ? 'Creating...' : 'Create Announcement'}
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default CreateAnnouncement;