import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { logOut } from '../services/auth';
import { MdClass, MdDashboard, MdReportProblem, MdSchool } from "react-icons/md"
import { FaBook, FaBuilding, FaChartBar, FaGraduationCap, FaSchool, FaTachometerAlt, FaUser } from "react-icons/fa"
import api from '../services/api';
import { FiLogOut } from 'react-icons/fi';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-color);

  @media (max-width: 768px){
    flex-direction: column;
  }
`;

const Sidebar = styled.aside`
  width: 260px;
  position: fixed;
  height: 100vh;
  left:0;
  top:0;
  background-color: var(--primary);
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  z-index: 10;

  @media (max-width: 768px){
    position: relative;
    width: 100%;
    height: auto;
  }
`;

const SidebarHeader = styled.div`
  padding: 2rem 1.5rem;
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  
  span {
    color: var(--accent);
  }
  
`;

const SidebarNav = styled.nav`
  flex: 1;
  padding: 1.5rem 0;
`;

const NavItem = styled.div`
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 500;
  
  &:hover {
    background-color: rgba(255,255,255,0.1);
    color: var(--accent);
  }
  
  @media (max-width: 768px){
      display: inline;
  }
  
`;
const NavLabel = styled.span`
    display: inline;
    @media (max-width: 768px){
      display: none;
  }
`;

const MainContent = styled.main`
  margin-left: 260px;
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  width: calc(100%-260px);

  @media (max-width: 768px){
    margin-left: 0;
    height: auto;
  }
`;

const TopHeader = styled.header`
  height: 70px;
  widht: calc(100%-260px);
  background-color: white;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 2rem;
  flex-wrap: wrap;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);

  @media (max-width: 768px){
      font-size: 0.7rem;
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    color: var(--danger);
  }
`;

const PageContent = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logOut();
  };

  const adminNavItems = [
    { id: "dashboard", label: "Dashboard", icon: <MdDashboard />, route: "/director/dashboard" },
    { id: "schools", label: "Schools", icon: <FaSchool />, route: "/director/school" },
    { id: "level_degree", label: "Level Degrees", icon: <FaGraduationCap />, route: "/director/level-degree" },
    { id: "departments", label: "Departments", icon: <FaBuilding />, route: "/director/department" },
    { id: "profile", label: "Profile", icon: <FaUser />, route: "/profile" },
  ];

  const hod_staffNavItems = [
    { id: "dashboard", label: "Dashboard", icon: <MdDashboard />, route: "/hod/staff/dashboard" },
    { id: "class", label: "Classes", icon: <MdClass />, route: "#" },
    { id: "course", label: "Courses", icon: <FaBook />, route: "#" },
    { id: "result", label: "Results", icon: <FaChartBar />, route: "/hod/staff/results" },
    { id: "profile", label: "Profile", icon: <FaUser />, route: "/profile" },
  ]
  const studentNavItems = [
    { id: "dashboard", label: "Dashboard", icon: <MdDashboard />, route: "/student/dashboard" },
    { id: "result", label: "Result", icon: <FaChartBar />, route: "/student/result" },
    { id: "course", label: "Courses", icon: <FaBook />, route: "#" },
    { id: "complaint", label: "Complaints", icon: <MdReportProblem />, route: "/student/complaint" },
    { id: "profile", label: "Profile", icon: <FaUser />, route: "/profile" },
  ]
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");

    } else {
      setUser(storedUser);
      // Get the user's profile infos
      const fetchProfile = async () => {
        try {
          const res = await api.get("user/profile/");
          setProfile(res.data);
          console.log(profile);
        } catch (err) {
          console.log(`Profile error: ${err}`);
        }

      }
      fetchProfile();
      console.log(user);
    }
  }, [navigate]);
  return (
    <LayoutContainer >
      <Sidebar >
        <SidebarHeader>
          Uni<span>Portal</span>
        </SidebarHeader>
        <SidebarNav>
          {user?.user_type === "Admin" ? (
            adminNavItems.map((item) => (
              <NavItem key={item.id} className={`${activeTab === item.id ? "btn-accent" : ""}`} onClick={() => {
                navigate(item.route)
                setActiveTab(item.id)
              }}>
                {item.icon} <NavLabel>{item.label}</NavLabel>
              </NavItem>
            ))
          ) : ""}
          {user?.user_type === "Teacher" ? (
            hod_staffNavItems.map((item) => (
              <NavItem key={item.id} className={`${activeTab === item.id ? "btn-accent" : ""}`} onClick={() => {
                navigate(item.route)
                setActiveTab(item.id)
              }}>
                {item.icon} <NavLabel>{item.label}</NavLabel>
              </NavItem>
            ))
          ) : ""}
          {user?.user_type === "Student" ? (
            studentNavItems.map((item) => (
              <NavItem key={item.id} className={`${activeTab === item.id ? "btn-accent" : ""}`} onClick={() => {
                navigate(item.route)
                setActiveTab(item.id)
              }}>
                {item.icon} <NavLabel>{item.label}</NavLabel>
              </NavItem>
            ))
          ) : ""}
        </SidebarNav>
      </Sidebar>
      <MainContent>
        <TopHeader>
          <UserProfile>
            {profile ? (
              <>
                <div className='justify-content-start'>
                  <h3>{profile.role}</h3>
                </div>
                <div className='flex-col'>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>E-mail: {profile.email} </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Matricule: {profile.matricule} </span>
                </div>
                <img src={profile.profile} alt="profile" style={{ width: "3rem", borderRadius: "50%" }} />
              </>
            ) : (
              <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Profile</span>
            )}
            <LogoutButton onClick={handleLogout}><FiLogOut size={30} /></LogoutButton>
          </UserProfile>
        </TopHeader>
        <PageContent>
          {children}
        </PageContent>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
