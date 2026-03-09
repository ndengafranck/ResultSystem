/** @format */

import styled from "styled-components";
import DirectorDashboard from "./page/director/DirectorDashboard";
import StudentDashboard from "./page/student/StudentDashboard";
import Login from "./page/auth/Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PrivateRoutes from "./components/PrivateRoutes";
import HodStaffDashboard from "./page/hod_staff/HodStaffDashboard";
import Layout from "./components/Layout";
import "./index.css";
import Department from "./page/director/Department";
import LevelDegree from "./page/director/LevelDegree";
import School from "./page/director/School";
import Profile from "./page/user/Profile";

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
                <Profile/>
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
