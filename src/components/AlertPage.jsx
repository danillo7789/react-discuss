import { Link, useLocation } from "react-router-dom"
import Navbar from "./Navbar";

const AlertPage = () => {
  const location = useLocation();
  const { registrationSuccess } = location.state || {};
  return (
    <div>
      <Navbar />
      {registrationSuccess && (
        <div className="alert alert-success" role="alert">
          <h3>{registrationSuccess}</h3>
          <p className='d-flex'>Click here to proceed to Login <Link className='nav-link nav-text px-2 text-info' to='/login'>Login</Link></p>
        </div>
      )}  
    </div>
  )
}

export default AlertPage