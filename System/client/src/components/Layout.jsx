import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { clearTokens } from '../services/auth';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-color);
`;

const Sidebar = styled.aside`
  width: 260px;
  background-color: var(--primary);
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  z-index: 10;
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
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TopHeader = styled.header`
  height: 70px;
  background-color: white;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
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
    removeTokens();
    navigate('/login');
  };

  return (
    <LayoutContainer>
      <Sidebar>
        <SidebarHeader>
          Uni<span>Portal</span>
        </SidebarHeader>
        <SidebarNav>
          <NavItem onClick={() => navigate(-1)}>Dashboard Home</NavItem>
          {/* Add more nav items based on user role if needed */}
        </SidebarNav>
      </Sidebar>
      <MainContent>
        <TopHeader>
          <UserProfile>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>My Account</span>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
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
