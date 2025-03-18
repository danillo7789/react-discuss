
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useState } from 'react';
import { baseUrl } from '../config/BaseUrl';

const ForgotPassword = () => {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        setIsLoading(true);
        e.preventDefault();
        setError('');        

        try {
            const response = await fetch(`${baseUrl}/api/user/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },                
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                setIsLoading(false);
                navigate('/reset-password');
            } else {
                setIsLoading(false);
                setError(data.message);
                console.error('Error sending email');
            }
        } catch (error) {
            setIsLoading(false);
            setError('Error sending email. Please try again.');
            console.error('Error sending email:', error);
        }
    }

  return (
    <div>
      <Navbar />
      <div className='container'>
        <div className='row pt-3'>
          <div className='col'>
            <h2 className='mb-4'>Forgot Password</h2>
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
                <label htmlFor='email' className='form-label'>
                  Email
                </label>
                <input
                  type='email'
                  placeholder='Enter email'
                  value={email}
                  className='form-control mb-3 bg-input-txt border border-0'
                  onChange={(e) => setEmail(e.target.value)}                  
                />
              </div>
              <button style={{width: '290px'}} className='btn btns' type='submit' disabled={isLoading}>
                {isLoading ? 'Sending mail...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
