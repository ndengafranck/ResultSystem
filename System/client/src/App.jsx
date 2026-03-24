/** @format */

import styled from "styled-components";
import DirectorDashboard from "./page/director/DirectorDashboard";
import StudentDashboard from "./page/student/StudentDashboard";
import StudentResult from "./page/student/StudentResult";
import StudentComplaint from "./page/student/StudentComplaint";
import StudentCourses from "./page/student/StudentCourses";
import StudentTranscript from "./page/student/StudentTranscript";
import StaffTranscripts from "./page/hod_staff/StaffTranscripts";
import Login from "./page/auth/Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PrivateRoutes from "./components/PrivateRoutes";
import HodStaffDashboard from "./page/hod_staff/HodStaffDashboard";
import HodStaffResults from "./page/hod_staff/HodStaffResults";
import Layout from "./components/Layout";
import "./index.css";
import Department from "./page/director/Department";
import LevelDegree from "./page/director/LevelDegree";
import Profile from "./page/user/Profile";
import PasswordReset from "./page/user/PasswordReset";
import Class from "./page/hod_staff/Class";
import StaffCourses from "./page/hod_staff/StaffCourses";
import ClassDetail from "./page/hod_staff/ClassDetail";
import DepartmentVisualization from "./page/hod_staff/DepartmentVisualization";
import StaffComplaints from "./page/hod_staff/StaffComplaints";
import Announcements from "./page/user/Announcements";
import CreateAnnouncement from "./page/user/CreateAnnouncement";
import Timetables from "./page/user/Timetables";
import CreateTimetable from "./page/user/CreateTimetable";
import NotFound from "./page/user/NotFound";

const Container = styled.div`
  
`;

function AppContent() {
  return (
    <Container>
      <Routes>
        <Route
          path="/login"
          element={<Login />} />
        <Route
          path="*"
          element={
            <Layout>
              <NotFound />
            </Layout>
          } />
        {/* Common user route */}
        <Route
          path="/profile"
          element={
            <PrivateRoutes allowedRoles={["Admin","Teacher","Student"]}>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/update/password"
          element={
            <PrivateRoutes allowedRoles={["Admin","Teacher","Student"]}>
              <Layout>
                <PasswordReset />
              </Layout>
            </PrivateRoutes>
          } />
        {/* Common user routes */}
        <Route
          path="/announcements"
          element={
            <PrivateRoutes allowedRoles={["Admin","Teacher","Student"]}>
              <Layout>
                <Announcements />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/create-announcement"
          element={
            <PrivateRoutes allowedRoles={["Admin","Teacher"]}>
              <Layout>
                <CreateAnnouncement />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/timetables"
          element={
            <PrivateRoutes allowedRoles={["Admin","Teacher","Student"]}>
              <Layout>
                <Timetables />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/create-timetable"
          element={
            <PrivateRoutes allowedRoles={["Admin","Teacher"]}>
              <Layout>
                <CreateTimetable />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/not-found"
          element={
              <Layout>
                <NotFound/>
              </Layout>
          } />
          
        {/* Admin's routes */}
        <Route
          path="/director/dashboard"
          element={
            <PrivateRoutes allowedRoles={["Admin"]}>
              <Layout>
                <DirectorDashboard />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/director/level-degree"
          element={
            <PrivateRoutes allowedRoles={["Admin"]}>
              <Layout>
                <LevelDegree />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/director/department"
          element={
            <PrivateRoutes allowedRoles={["Admin"]}>
              <Layout>
                <Department />
              </Layout>
            </PrivateRoutes>
          } />
        {/* Student's routes */}
        <Route
          path="/student/dashboard"
          element={
            <PrivateRoutes allowedRoles={["Student"]}>
              <Layout>
                <StudentDashboard />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/student/result"
          element={
            <PrivateRoutes allowedRoles={["Student"]}>
              <Layout>
                <StudentResult />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/student/complaint"
          element={
            <PrivateRoutes allowedRoles={["Student"]}>
              <Layout>
                <StudentComplaint />
              </Layout>
            </PrivateRoutes>
          } />
        {/* hod's or staff's routes */}
        <Route
          path="/hod/staff/dashboard"
          element={
            <PrivateRoutes allowedRoles={["Teacher"]}>
              <Layout>
                <HodStaffDashboard />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/hod/staff/results"
          element={
            <PrivateRoutes allowedRoles={["Teacher"]}>
              <Layout>
                <HodStaffResults />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/hod/staff/class"
          element={
            <PrivateRoutes allowedRoles={["Teacher"]}>
              <Layout>
                <Class />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/hod/staff/class/:id"
          element={
            <PrivateRoutes allowedRoles={["Teacher"]}>
              <Layout>
                <ClassDetail />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/hod/staff/courses"
          element={
            <PrivateRoutes allowedRoles={["Teacher"]}>
              <Layout>
                <StaffCourses />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/hod/staff/department-visualization"
          element={
            <PrivateRoutes allowedRoles={["Teacher"]}>
              <Layout>
                <DepartmentVisualization />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/hod/staff/complaints"
          element={
            <PrivateRoutes allowedRoles={["Teacher"]}>
              <Layout>
                <StaffComplaints />
              </Layout>
            </PrivateRoutes>
          } />
        <Route path="/student/courses" element={
          <PrivateRoutes allowedRoles={["Student"]}>
            <Layout>
              <StudentCourses />
            </Layout>
          </PrivateRoutes>} />
        <Route path="/student/transcript" element={
          <PrivateRoutes allowedRoles={["Student"]}>
            <Layout>
              <StudentTranscript />
            </Layout>
          </PrivateRoutes>} />
        <Route path="/hod/staff/transcripts" element={
          <PrivateRoutes allowedRoles={["Admin","Teacher"]}>
            <Layout>
              <StaffTranscripts />
            </Layout>
          </PrivateRoutes>} />
      </Routes>
    </Container>
  )
}
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
