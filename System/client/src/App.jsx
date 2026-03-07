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
          path="/director/dashboard"
          element={
            <PrivateRoutes>
              <Layout>
                <DirectorDashboard />
              </Layout>
            </PrivateRoutes>
          } />

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
