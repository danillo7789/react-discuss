import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext/context';
import { baseUrl } from '../config/BaseUrl';

const Login = () => {
  const [access, setAccess] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();

  const handleGoogleLogin = () => {
    setIsSocialLoading(true)
    try {
      window.location.href = `${baseUrl}/auth/google`;
      setIsSocialLoading(false);
    } catch (error) {
      setError(error);
      setIsSocialLoading(false)
      console.error('Error logging in with Google:', error);
    }
  }

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${baseUrl}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ access, password }),
      });

      const data = await response.json();
      if (response.ok) {
        const token = data.token;

        login(token);        
        setIsLoading(false);
        setAccess('');
        setPassword('');
        navigate('/');
      } else {
        setIsLoading(false);
        setError(data.message);
        console.error('Error loggin user in');
      }
    } catch (error) {
      setIsLoading(false);
      setError('Error logging in. Please try again.');
      console.error('Error logging in:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn]);

  return (
    <div>
      <Navbar />
      <div className='container'>
        <div className='row pt-3'>
          <div className='col'>
            <h2 className='mb-4'>Login</h2>
            {error && (
              <div
                className='alert alert-danger text-danger alert-dismissible fade show'
                role='alert'
              >
                {error}
                <button
                  type='button'
                  className='btn-close'
                  data-bs-dismiss='alert'
                  aria-label='Close'
                ></button>
              </div>
            )}
            <form className='form-width mb-3' onSubmit={handleSubmit}>
              <div>
                <label className='pb-2'>Email</label>
                <input
                  type='text'
                  placeholder='Email or Username'
                  value={access}
                  className='form-control mb-3 bg-input-txt border border-0'
                  onChange={(e) => setAccess(e.target.value)}                  
                />
              </div>
              <div>
                <label className='pb-2'>Password</label>
                <input
                  type='password'
                  placeholder='Password'
                  value={password}
                  className='form-control mb-3 bg-input-txt border border-0'
                  onChange={(e) => setPassword(e.target.value)}                  
                />
              </div>
              <button style={{width: '290px'}} className='btn btns' type='submit' disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <div>
              <button style={{width: '290px'}} className='btn btn-light mb-3' disabled={isLoading} onClick={handleGoogleLogin}>
                {isSocialLoading ? 'Logging in with Google...' : <>Login with <img src='/google-icon.png' width={22} height={22} alt='Google' /> </>}                  
              </button>
            </div>
            <p className='d-flex'>
              Don't have an account?{' '}
              <Link className='nav-link nav-text px-2 text-info' to='/register'>
                Register
              </Link>
            </p>
            <p className='d-flex'>
              Forgot Password?
              <Link className='nav-link nav-text px-2 text-info' to='/forgot-password'>
                Click here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
