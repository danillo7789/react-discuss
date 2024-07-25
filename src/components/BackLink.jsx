import { useNavigate, useLocation } from 'react-router-dom';

const BackLink = ({ visibleActivity, setVisibleActivity }) => {
  const navigate = useNavigate();
  const location = useLocation() // to stay on the same page

  const handleBackClick = () => {
    if (visibleActivity) {
      setVisibleActivity(!visibleActivity)
      navigate(location.pathname);
    }
    navigate(-1); 
  };

  return (
    <div onClick={handleBackClick} className="pointer">
      <small className='back_arrow'>
        <img width="24" height="24" src="https://img.icons8.com/forma-thin/24/000000/left.png" alt="left"/>
      </small>
    </div>
  );
};

export default BackLink;
