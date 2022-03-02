
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { checkJoinCode, getUserInfo, join } from '../api';
import GoogleLogin from 'react-google-login';
import ErrorPage from './ErrorPage';

function Join() {
    const [codeInfo, setCodeInfo] = useState(null);
    const [googleToken, setGoogleToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState(null);
    let { joinCode } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        checkJoinCode(joinCode)
            .then(res => setCodeInfo(res.data))
            .catch(console.error);
    }, [joinCode])
    if (!joinCode) {
        console.error('No join code found');
        return;
    }
    function loginSuccess(gdata) {
        let gtoken = gdata.tokenId;
        setGoogleToken(gtoken);
        getUserInfo(gtoken)
            .then(res => {
                setUserInfo(res.data);
                setFullName(res.data.name);
            })
            .catch(console.error);
    }
    function loginFail(err) {
        console.error('Error logging in', err);
    }
    let joinMessage;
    if (!googleToken) {
        if (codeInfo) {
            if (codeInfo.success) {
                if (codeInfo.role === 'player') {
                    joinMessage = <h1>Join {codeInfo.teamName}</h1>
                } else {
                    joinMessage = <h1>Join as {codeInfo.role}</h1>
                }
            } else {
                joinMessage = <h1 className="error">Sorry, your join code is invalid.</h1>
                return (
                    <ErrorPage error="Sorry, your join code is invalid." />
                );
            }
        } else {
            joinMessage = <h1>Join</h1>
        }
    }
    let login = null;
    if (codeInfo && codeInfo.success && !googleToken) {
        login = (
            <div className="login">
                <GoogleLogin 
                    clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                    buttonText="Log in with Google"
                    onSuccess={loginSuccess}
                    onFailure={loginFail}
                    cookiePolicy={'single_host_origin'}
                />
            </div>
        )
    }
    function submitUser() {
        join(joinCode, fullName, googleToken)
            .then(res => {
                if (!res.data.success) {
                    console.error(`Error joining: ${res.data.errorMessage}`);
                    setError(res.data);
                    return;
                }
                navigate('/');
            })
            .catch(console.error);
    }
    console.log('google token');
    console.log(googleToken);
    let userDisplay = null;
    if (userInfo) {
        userDisplay = (
            <div id="user-info">
                <h1>Customize User</h1>
                <img src={userInfo.picture} alt="Profile" id="pfp" />
                <div id="user-info-text">
                    <input id="name" defaultValue={userInfo.name} onChange={e => setFullName(e.target.value)} />
                    <p id="email">{userInfo.email}</p>
                </div>
                <button className="btn btn-primary" onClick={submitUser}>Submit</button>
            </div>
        )
    }
    if (error) {
        return <ErrorPage error={error.errorMessage} />
    }
    return (
        <div className="Join">
            <div className="text-center">{ joinMessage }</div>
            <div className="login-container text-center">{ login }</div>
            {userDisplay}
        </div>
    );
}

export default Join;
