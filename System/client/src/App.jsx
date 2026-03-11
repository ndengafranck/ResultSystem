/** @format */

import styled from "styled-components";
import DirectorDashboard from "./page/director/DirectorDashboard";
import StudentDashboard from "./page/student/StudentDashboard";
import StudentResult from "./page/student/StudentResult";
import StudentComplaint from "./page/student/StudentComplaint";
import Login from "./page/auth/Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PrivateRoutes from "./components/PrivateRoutes";
import HodStaffDashboard from "./page/hod_staff/HodStaffDashboard";
import HodStaffResults from "./page/hod_staff/HodStaffResults";
import Layout from "./components/Layout";
import "./index.css";
import Department from "./page/director/Department";
import LevelDegree from "./page/director/LevelDegree";
import School from "./page/director/School";
import Profile from "./page/user/Profile";
import PasswordReset from "./page/user/PasswordReset";

const Container = styled.div`
  
`;

function AppContent() {
  return (
    <Container>
      <Routes>
        <Route
          path="/login"
          element={<Login />} />
        {/* Common user route */}
        <Route
          path="/profile"
          element={
            <PrivateRoutes>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/update/password"
          element={
            <PrivateRoutes>
              <Layout>
                <PasswordReset />
              </Layout>
            </PrivateRoutes>
          } />
        {/* Director's routes */}
        <Route
          path="/director/dashboard"
          element={
            <PrivateRoutes>
              <Layout>
                <DirectorDashboard />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/director/school"
          element={
            <PrivateRoutes>
              <Layout>
                <School />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/director/level-degree"
          element={
            <PrivateRoutes>
              <Layout>
                <LevelDegree />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/director/department"
          element={
            <PrivateRoutes>
              <Layout>
                <Department />
              </Layout>
            </PrivateRoutes>
          } />
        {/* Student's routes */}
        <Route
          path="/student/dashboard"
          element={
            <PrivateRoutes>
              <Layout>
                <StudentDashboard />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/student/result"
          element={
            <PrivateRoutes>
              <Layout>
                <StudentResult />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/student/complaint"
          element={
            <PrivateRoutes>
              <Layout>
                <StudentComplaint />
              </Layout>
            </PrivateRoutes>
          } />
        {/* hod's or staff's routes */}
        <Route
          path="/hod/staff/dashboard"
          element={
            <PrivateRoutes>
              <Layout>
                <HodStaffDashboard />
              </Layout>
            </PrivateRoutes>
          } />
        <Route
          path="/hod/staff/results"
          element={
            <PrivateRoutes>
              <Layout>
                <HodStaffResults />
              </Layout>
            </PrivateRoutes>
          } />
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
