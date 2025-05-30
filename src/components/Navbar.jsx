// import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../authContext/context';
import Logout from './Logout';
import useUser from '../hooks/useUser';
import '../App.css';

const Navbar = () => {
  const { isLoggedIn, searchQuery, setSearchQuery } = useAuth();
  const blank_img = import.meta.env.VITE_BLANK_IMG;
  const { user } = useUser();
  const location = useLocation();
  const currentPath = location.pathname;

  const homeRefresh = () => {
    if (currentPath === '/') {
      window.location.reload();
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value); //update the searchQuery
  };

  return (
    <div className='sticky-top'>
      <nav className='navbar navbar-expand-lg bg-nav py-3'>
        <div className='container'>
          <Link onClick={homeRefresh} className='linkc brand-name' to='/'>
            <h4>
              <img src='/logo.svg' alt='' height={40} width={40} />
            </h4>
          </Link>
          <button
            className='navbar-toggler'
            style={{ backgroundColor: 'whitesmoke' }}
            type='button'
            data-bs-toggle='collapse'
            data-bs-target='#navbarSupportedContent'
            aria-controls='navbarSupportedContent'
            aria-expanded='false'
            aria-label='Toggle navigation'
          >
            <span className='navbar-toggler-icon'></span>
          </button>
          <div
            className='collapse navbar-collapse'
            id='navbarSupportedContent'
            style={{ color: 'white' }}
          >
            <ul className='navbar-nav me-auto mb-2 mb-lg-0'></ul>
            <form className='d-flex' role='search'>
              <input
                className='form-control me-2 bg-input-txt border border-0'
                id='searchbar'
                type='search'
                placeholder='Search'
                aria-label='Search'
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {/* <button className="btn btns" type="submit">Search</button> */}
            </form>

            {isLoggedIn ? (
              <ul className='navbar-nav nav-text mb-2 mb-lg-0'>
                <Link className='linkc' to={`/profile/${user?._id}`}>
                  <img
                    className='ms-3 rounded-circle navbar-dp display-pic'
                    src={user?.profilePicture?.url || blank_img}
                    alt='profile-picture'
                  />
                </Link>

                <li className='nav-item dropdown nav-text'>
                  <a
                    className='linkc dim'
                    href='#'
                    role='button'
                    data-bs-toggle='dropdown'
                    aria-expanded='false'
                  >
                    @{user?.username}{' '}
                    <img
                      width='30'
                      height='30'
                      src='https://img.icons8.com/ios-glyphs/30/7F91EB/expand-arrow--v1.png'
                      alt='expand-arrow--v1'
                    />
                  </a>
                  <ul className='dropdown-menu navb-dropdown'>
                    <li className='nav-btn'>
                      <Link
                        className='dropdown-item'
                        to={`/profile/${user?._id}`}
                      >
                        Profile
                      </Link>
                    </li>
                    <li className='nav-btn'>
                      <hr className='dropdown-divider' />
                    </li>
                    <Logout />
                  </ul>
                </li>

              </ul>
            ) : (
              <div className='d-flex'>
                <img
                  className='me-2 ms-3 rounded-circle display-pic'
                  src={blank_img}
                  alt='display picture'
                />
                <Link className='nav-link nav-text' to='/login'>
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
