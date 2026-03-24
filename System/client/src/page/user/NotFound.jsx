
import { useNavigate } from 'react-router-dom';
import { ROLE_DASHBOARD_ROUTES } from '../../utils/rolesDashboardRoutes';

function NotFound() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const dashboardPath = user ? ROLE_DASHBOARD_ROUTES[user.user_type] : '/login';
  console.log(dashboardPath);
  return (
    <div style={styles.container}>
      <h1 style={styles.code}>404</h1>
      <p style={styles.message}>Oops! You don't have access to this page.</p>
      <button onClick={() => navigate(dashboardPath)} style={styles.btn}>
        Go to My Dashboard
      </button>
    </div>
  );
}

const styles = {
  container: { textAlign: 'center', marginTop: '10vh' },
  code:      { fontSize: '6rem', margin: 0 },
  message:   { fontSize: '1.2rem', marginBottom: '2rem' },
  btn:       { padding: '0.75rem 2rem', fontSize: '1rem', cursor: 'pointer' },
};

export default NotFound;