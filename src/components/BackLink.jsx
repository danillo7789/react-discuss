import { useNavigate } from 'react-router-dom';

const BackLink = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1); 
  };

  return (
    <div onClick={handleBackClick} className="pointer">
      <small className='back_arrow'>
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <title>back</title>
            <path d="M13.723 2.286l-13.723 13.714 13.719 13.714 1.616-1.611-10.96-10.96h27.625v-2.286h-27.625l10.965-10.965-1.616-1.607z"></path>
        </svg>
      </small>
    </div>
  );
};

export default BackLink;
