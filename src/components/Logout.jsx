import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext/context';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <li onClick={handleLogout}><p className='dropdown-item pointer'>Logout</p></li>
  );
};

export default Logout;
