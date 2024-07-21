// import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../authContext/context';
import Logout from './Logout';

const Navbar = () => {
    const { currentUser, isLoggedIn, logout } = useAuth();
    return (
        <div className='sticky-top'>
            <nav className="navbar navbar-expand-lg bg-nav py-3">
                <div className="container">
                    <Link className="navbar-brand nav-text" to='/home'><h4>Diskors</h4></Link>
                    <button className="navbar-toggler" style={{ backgroundColor: 'whitesmoke' }} type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon" ></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ color: 'white' }}>
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
  
                        </ul>
                        <form className="d-flex" role="search">
                            <input className="form-control me-2 bg-element-light border border-0" type="search" placeholder="Search" aria-label="Search" />
                            <button className="btn btns" type="submit">Search</button>
                        </form>
                        
                        {isLoggedIn? (<ul className="navbar-nav nav-text mb-2 mb-lg-0">
                            <img className='ms-3' src="" alt="profile-picture" />
                            <li className="nav-item dropdown nav-text">
                                <a className="nav-link dropdown nav-text-toggle nav-text" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    @{currentUser.username}
                                </a>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="#">Profile</a></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <Logout />                                    
                                </ul>
                            </li>
                        </ul>) : (<div className='d-flex'>
                            <img className='me-2 ms-3' src="wait" alt="pic" />
                            <Link className='nav-link nav-text' to='/login'>Login</Link>
                        </div>)}
                    </div>
                </div>
            </nav>
        </div>

    );
};

export default Navbar;
