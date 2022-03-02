
import './error.css';
import { Link } from 'react-router-dom';

function ErrorPage(props) {
    let errorMessage = props.error;
    return (
        <div className="ErrorPage text-center">
            <h1 className="error">{errorMessage}</h1>
            <Link className="err-back-link" to="/"><button className="btn btn-success">Go back home</button></Link>
        </div>
    )
}

export default ErrorPage;
