import React from 'react'

const StudentDashboard = () => {
  // Placeholder mock data that maps to the planned endpoints
  const courses = [
    { id: 101, code: 'ENG101', name: 'Intro to Engineering', credits: 3 },
    { id: 102, code: 'MTH201', name: 'Calculus II', credits: 4 },
    { id: 103, code: 'PHY101', name: 'General Physics', credits: 4 },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>My Academic Overview</h2>
        <button className="btn btn-accent">Download Transcript</button>
      </div>

      <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Current Semester Courses</h3>

      <div className="data-grid">
        {courses.map(course => (
          <div key={course.id} className="data-card">
            <div className="data-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="data-card-title">{course.code}</h3>
              <span style={{ background: '#e0e7ff', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>{course.credits} Credits</span>
            </div>
            <div className="data-card-body">
              <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)' }}>{course.name}</p>
              <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.875rem' }}>Status: Enrolled</p>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Recent Announcements</h3>
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem' }}>
        <p style={{ margin: 0 }}>Welcome to the new University Portal. Your results for the previous semester have been published.</p>
      </div>
    </div>
  )
}

export default StudentDashboard
