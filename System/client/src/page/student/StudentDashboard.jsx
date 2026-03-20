import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const StudentDashboard = () => {
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ total_courses: 0, total_results_published: 0, pending_complaints: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const dashRes = await api.get('dashboard/student/dashboard');
      if (dashRes.data) {
        const { courses: apiCourses, total_courses, total_results_published, pending_complaints } = dashRes.data;
        setCourses(apiCourses || []);
        setStats({ total_courses, total_results_published, pending_complaints });
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    }

    try {
      const res = await api.get('academic/result/student/retrieve/1');
      if (res.data && res.data.user) {
        setResults(res.data.user.slice(0, 5));
      }
    } catch (err) {
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = results.map(r => ({
    name: r.course.length > 15 ? r.course.substring(0, 15) + '...' : r.course,
    mark: parseFloat(r.mark_obtained)
  }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>My Academic Overview</h2>
        <a href="/student/result" className="btn btn-accent">View Full Results</a>
      </div>

      {/* Stats row */}
      <div className="data-grid" style={{ marginBottom: '2rem' }}>
        <div className="data-card">
          <div className="data-card-header"><h3 className="data-card-title">Enrolled Courses</h3></div>
          <div className="data-card-body"><p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{stats.total_courses}</p></div>
        </div>
        <div className="data-card">
          <div className="data-card-header"><h3 className="data-card-title">Published Results</h3></div>
          <div className="data-card-body"><p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{stats.total_results_published}</p></div>
        </div>
        <div className="data-card">
          <div className="data-card-header"><h3 className="data-card-title">Pending Complaints</h3></div>
          <div className="data-card-body"><p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: stats.pending_complaints > 0 ? '#dc2626' : 'var(--primary)' }}>{stats.pending_complaints}</p></div>
        </div>
      </div>

      <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>My Enrolled Courses</h3>

      {loading ? (
        <p>Loading courses...</p>
      ) : courses.length > 0 ? (
        <div className="data-grid">
          {courses.map((course, idx) => (
            <div key={idx} className="data-card">
              <div className="data-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="data-card-title">{course.course_code}</h3>
                <span style={{ background: '#e0e7ff', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>{course.credits} Credits</span>
              </div>
              <div className="data-card-body">
                <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)' }}>{course.course_name}</p>
                <p style={{ marginTop: '0.25rem', marginBottom: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{course.class_name} · Semester {course.semester}</p>
                <p style={{ marginTop: '0.25rem', marginBottom: 0, fontSize: '0.8rem' }}>Status: <strong>{course.status}</strong></p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', color: 'var(--text-secondary)' }}>
          No courses enrolled yet.
        </div>
      )}

      <h3 style={{ marginTop: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Recent Results Visualization</h3>
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
        {loading ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Loading results...
          </div>
        ) : results.length > 0 ? (
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="mark" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} name="Mark Obtained (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            No published results available yet
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a href="/student/result" style={{ color: 'var(--primary)', fontWeight: 500 }}>View Detailed Results &rarr;</a>
        </div>
      </div>

      <h3 style={{ marginTop: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Recent Announcements</h3>
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem' }}>
        <p style={{ margin: 0 }}>Stay updated with the latest announcements from your department and university.</p>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a href="/announcements" style={{ color: 'var(--primary)', fontWeight: 500 }}>View All Announcements &rarr;</a>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
