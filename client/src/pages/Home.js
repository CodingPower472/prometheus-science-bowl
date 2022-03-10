
import './Home.css'
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { auth, signIn } from '../api';
import ClipLoader from 'react-spinners/ClipLoader';
import GoogleLogin from 'react-google-login';
import ErrorPage from './ErrorPage';

let override = `
display: block;
margin: 0 auto;
margin-top: 30px;
`;

function Home({ authCallback }) {
    const [authResult, setAuthResult] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('effect');
        auth()
            .then(res => {
                setAuthResult(res.data);
                if (res.data.isAuthed) {
                    authCallback(res.data.user);
                }
            })
            .catch(console.error);
    }, []);

    function loginSuccess(data) {
        let gtoken = data.tokenId;
        signIn(gtoken)
            .then(res => {
                if (res.data.success) {
                    console.log('set auth result');
                    authCallback(res.data.user);
                }
                setAuthResult(res.data);
            })
            .catch(console.error);
    }

    function loginFail(err) {
        console.error(err);
    }

    let main = null;
    if (authResult === null) {
        main = (
            <ClipLoader loading={authResult === null} css={override} size={50}></ClipLoader>
        );
    } else {
        if (authResult.isAuthed) {
            let user = authResult.user;
            if (user.isPlayer || user.isMod) {
                if (user.roomId) {
                    main = (
                        <div className="main">
                            <h1>Your room is available</h1>
                            <Link to={`/room/${user.roomId}`}>
                                <button className="btn btn-primary">Take me there</button>
                            </Link>
                        </div>
                    )
                } else {
                    main = (
                        <div className="main">
                            <h1>No room assignment</h1>
                            <h4>You aren't currently assigned to any rooms.  If you believe this to be in error, please contact an administrator.</h4>
                        </div>
                    )
                }
            } else if (user.isAdmin) {
                console.log('Navigating to admin')
                //navigate('/admin');
                return <Navigate to="/admin"></Navigate>
            } else {
                console.error('User is not an admin, player, or mod!');
            }
        } else {
            main = (
                <div className="main">
                    <h1>Log In</h1>
                    <GoogleLogin 
                        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                        buttonText="Log in with Google"
                        onSuccess={loginSuccess}
                        onFailure={loginFail}
                        cookiePolicy={'single_host_origin'}
                    />
                    {!authResult.success && (
                        <ErrorPage noGoHome error="Sorry, a user with this account does not exist.  If you are trying to create a new account, please use a join link given by an administrator or team captain." />
                    )}
                </div>
            )
        }
    }
    return (
        <div className="Home text-center">
            {main}
        </div>
    )
}

export default Home;
