import { useState } from 'react';
import Navbar from './Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext/context';
import { baseUrl } from '../config/BaseUrl';
// import { fetchWithTokenRefresh } from '../utils/refreshToken';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { isLoggedIn } = useAuth();

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${baseUrl}/api/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data)
        navigate('/alert-page', { state: { registrationSuccess: data.message } });
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Error registering:', error);
    }
  };

  if (isLoggedIn) {
    navigate('/');
  }

  return (
    <div>
        <Navbar />
        <div className="container">
            <div className="row pt-3">
                <div className="col">
                    <h2>Register</h2>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <form className='form-width mb-3' onSubmit={handleRegister}>
                        <div>
                            <label className='pb-2'>Username</label>
                            <input
                                type="text"
                                className='form-control mb-3 bg-input-txt border border-0'
                                placeholder='username'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className='pb-2'>Email</label>
                            <input
                                type="email"
                                className='form-control mb-3 bg-input-txt border border-0'
                                placeholder='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className='pb-2'>Password</label>
                            <input
                                type="password"
                                className='form-control mb-3 bg-input-txt border border-0'
                                placeholder='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className='btn btns' type="submit">Register</button>
                    </form>
                    <p className='d-flex'>Already have an account? <Link className='nav-link nav-text px-2 text-info' to='/login'>Login</Link></p>
                </div>
            </div>
        </div>
    </div>

  );
};

export default Register;
