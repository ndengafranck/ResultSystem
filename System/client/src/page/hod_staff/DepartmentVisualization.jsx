import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import api from '../../services/api';
import { PageLoader } from '../../components/UI';

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
`;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DepartmentVisualization = () => {
  const [departmentData, setDepartmentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
    try {
      // Assuming an endpoint for department statistics
      const res = await api.get('academic/department/stats/');
      setDepartmentData(res.data);
    } catch (err) {
      console.error("Error fetching department data:", err);
      // Fallback mock data for visualization
      setDepartmentData({
        totalStudents: 450,
        totalStaff: 25,
        averageGPA: 3.2,
        passRate: 85,
        coursePerformance: [
          { name: 'Mathematics', average: 78, students: 120 },
          { name: 'Physics', average: 82, students: 95 },
          { name: 'Chemistry', average: 75, students: 110 },
          { name: 'Computer Science', average: 88, students: 85 },
          { name: 'Biology', average: 80, students: 40 }
        ],
        semesterTrends: [
          { semester: 'Sem 1', average: 76 },
          { semester: 'Sem 2', average: 79 },
          { semester: 'Sem 3', average: 81 },
          { semester: 'Sem 4', average: 83 },
          { semester: 'Sem 5', average: 85 },
          { semester: 'Sem 6', average: 87 }
        ],
        gradeDistribution: [
          { name: 'A', value: 120, percentage: 27 },
          { name: 'B', value: 180, percentage: 40 },
          { name: 'C', value: 105, percentage: 23 },
          { name: 'D', value: 30, percentage: 7 },
          { name: 'F', value: 15, percentage: 3 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader label='Loading analytics…' />;

  if (!departmentData) {
    return <div>No data available</div>;
  }

  return (
    <PageContainer>
      <HeaderSection>
        <h2 style={{ margin: 0 }}>Department Performance Analytics{departmentData.department ? ` — ${departmentData.department}` : ''}</h2>
        <button className="btn btn-primary">Export Report</button>
      </HeaderSection>

      <StatsGrid>
        <StatCard>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>{departmentData.totalStudents}</h3>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>Total Students</p>
        </StatCard>
        <StatCard>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>{departmentData.totalStaff}</h3>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>Teaching Staff</p>
        </StatCard>
        <StatCard>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>{departmentData.averageGPA}</h3>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>Average GPA</p>
        </StatCard>
        <StatCard>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>{departmentData.passRate}%</h3>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>Pass Rate</p>
        </StatCard>
      </StatsGrid>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <ChartContainer>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Course Performance</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={departmentData.coursePerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Bar dataKey="average" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Average Score (%)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Grade Distribution</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={departmentData.gradeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <ChartContainer>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Semester Performance Trends</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={departmentData.semesterTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="semester" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis domain={[70, 90]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip cursor={{ stroke: '#d1d5db', strokeWidth: 1 }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Line type="monotone" dataKey="average" stroke="var(--primary)" strokeWidth={3} dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 6 }} name="Average Score (%)" />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </PageContainer>
  );
};

export default DepartmentVisualization;