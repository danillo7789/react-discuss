import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext/context';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <li onClick={handleLogout}><p className='dropdown-item pointer' onClick={logout}>Logout</p></li>
  );
};

export default Logout;
