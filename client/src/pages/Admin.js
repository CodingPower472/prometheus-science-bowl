
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader';
import { auth } from '../api';
import ErrorPage from './ErrorPage';

const loaderCSS = `
display: block;
margin: 0 auto;
margin-top: 30px;
`;

function AdminPage(props) {
    return (
        <div className="AdminPage">
            
        </div>
    )
}

function Admin() {

    const [authResult, setAuthResult] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        auth()
            .then(data => {
                setAuthResult(data.data);
            })
            .catch(console.error);
    }, []);

    let main = null;
    if (authResult) {
        if (authResult.isAuthed && authResult.user.isAdmin) {
            main = (
                <AdminPage user={authResult.user} />
            )
        } else {
            return <ErrorPage error="Sorry, you don't have permissions to view this page." />
        }
    } else {
        main = (
            <ClipLoader loading={authResult === null} css={loaderCSS} size={50}></ClipLoader>
        )
    }
    return (
        <div className="Admin">
            {main}
        </div>
    )
}

export default Admin;
