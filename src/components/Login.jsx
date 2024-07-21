import React, { useState } from 'react';
import Navbar from './Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext/context';
import { baseUrl } from '../config/BaseUrl';

const Login = () => {
  const [access, setAccess] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // setAccess('');
    // setPassword('');

    try {
        const response = await fetch(`${baseUrl}/api/user/login`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access, password }),
        });

        const data = await response.json();
        if (response.ok) {
            const token = data.token;
            login(token);
            
            setAccess('');
            setPassword('');
            navigate('/home');
        } else {
            setError(data.message);
        }
    } catch (error) {
        setError('Error logging in. Please try again.');
        console.error('Error logging in:', error);
    }
  }

  if (isLoggedIn) {
    navigate('/home');
  }


  return (
    <div>
        <Navbar />
        <div className='container'>
            <div className='row pt-3'>
                <div className="col">
                    <h2 className='mb-4'>Login</h2>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <form className='form-width' onSubmit={handleSubmit}>
                        <div>
                            <label className='pb-2'>Email</label>
                            <input
                                type="text"
                                placeholder='Email or Username'
                                value={access}
                                className='form-control mb-3 bg-input-txt border border-0'
                                onChange={(e) => setAccess(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className='pb-2'>Password</label>
                            <input
                                type="password"
                                placeholder='Password'
                                value={password}
                                className='form-control mb-3 bg-input-txt border border-0'
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className='btn btns' type="submit">Login</button>
                    </form>
                    <p className='d-flex'>Don't have an account? <Link className='nav-link nav-text px-2 text-info' to='/register'>Register</Link></p>
                </div>
            </div>
        </div>
    </div>

  );
};

export default Login;
