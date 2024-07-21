import { Link, useRouteError } from "react-router-dom";
import { useAuth } from "../authContext/context";

export default function ErrorPage() {
  const { isLoggedIn } = useAuth();
  const error = useRouteError();
  console.error(error);

  return (
    <div className="container d-flex min-vh-100 text-center align-items-center justify-content-center">
      <div>
        <h1>Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p>
          <p className="text-light">{error.statusText || error.message}</p>
          {isLoggedIn ? <Link to='/home' className="btn btns text-light mt-2">Home</Link> :
          <Link to='/' className="btn btns text-light mt-2">Back</Link>}
          
        </p>
      </div>
    </div>

  );
}