import './App.css';
import GoogleLogin from 'react-google-login';
import React, { Component } from 'react';

class App extends Component {
  constructor() {
    super();
    this.state = {
      loggedIn: false,
      user: null
    }
    this.successLogin = this.successLogin.bind(this);
    this.failureLogin = this.failureLogin.bind(this);
  }

  successLogin(gdata) {
    console.log('login success');
    var token = gdata.tokenId;
    this.setState({ loggedIn: true })
    fetch('http://localhost:8000/api', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token
      })
    })
      .then(res => res.json())
      .then(res => {
        this.setState({ user: res })
      })
      .catch(err => {
        console.log('issue with sending back oauth token');
        console.error(err);
      });
  }

  failureLogin(err) {
    console.log('login fail');
    console.error(err);
  }
  
  render() {
    const login = (
      <GoogleLogin
          clientId={process.env.REACT_APP_CLIENT_ID}
          buttonText="Log in with Google"
          onSuccess={this.successLogin}
          onFailure={this.failureLogin}
          cookiePolicy={'single_host_origin'}
        />
    );
    let user = this.state.user;
    const userInfo = this.state.user ? (
      <div>
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <img src={user.picture} alt="Profile" />
      </div>
    ) : null;
    return (
      <div>
        <h1>Google SSO Test</h1>
        { !this.state.loggedIn && login }
        { this.state.user != null && userInfo}
      </div>
    );
  }
}

export default App;
