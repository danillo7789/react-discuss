import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useState } from 'react';
import { baseUrl } from '../config/BaseUrl';

const ResetPassword = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${baseUrl}/api/user/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword, confirmNewPassword, resetToken }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsLoading(false);
        navigate('/login');
      } else {
        setIsLoading(false);
        setError(data.message);
        console.error('Error resetting password');
      }
    } catch (error) {
      setIsLoading(false);
      setError('Error resetting password. Please try again.');
      console.error('Error resetting password:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className='container'>
        <div className='row pt-3'>
          <div className='col'>
            <h2 className='mb-4'>Reset Password</h2>
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
                <label htmlFor='password' className='form-label'>
                  Token
                </label>
                <input
                  type='text'
                  placeholder='Password reset token'
                  value={resetToken}
                  className='form-control mb-3 bg-input-txt border border-0'
                  onChange={(e) => setResetToken(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor='password' className='form-label'>
                  New Password
                </label>
                <input
                  type='password'
                  placeholder='New Password'
                  value={newPassword}
                  className='form-control mb-3 bg-input-txt border border-0'
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor='password' className='form-label'>
                  Confirm New Password
                </label>
                <input
                  type='password'
                  placeholder='Confirm New Password'
                  value={confirmNewPassword}
                  className='form-control mb-3 bg-input-txt border border-0'
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
              <button
                style={{ width: '290px' }}
                className='btn btns'
                type='submit'
                disabled={isLoading}
              >
                {isLoading ? 'Resetting Password...' : 'Reset'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
