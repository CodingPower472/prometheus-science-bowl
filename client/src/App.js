import './darkly.bootstrap.min.css';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate
} from 'react-router-dom';
import Home from './pages/Home';
import Join from './pages/Join';
import Admin from './pages/Admin';
import Room from './pages/Room';
import Terms from './pages/Terms';
import { Navbar, Nav, Button } from 'react-bootstrap';
import logo from './prometheus.png';
import { auth, signOut } from './api';
import { useEffect, useState } from 'react';

function App() {
  const [authState, setAuthState] = useState(null);
  /*useEffect(() => {
    auth()
      .then(res => {
        if (res.data.isAuthed) {
          setAuthState(res.data.user);
        }
      })
      .catch(console.error);
  }, []);*/
  function ourSignOut() {
    signOut()
      .then(res => {
        if (res.data.success) {
          window.location.href = '/';
        }
      })
      .catch(console.error);
  }
  console.log('Received auth info');
  console.log(authState);
  return (
    <div className="App">
      <div className="container">
        <Router>
        <Navbar bg="dark" expand="lg" id="navbar">
          <Link to="/" style={{textDecoration: 'none'}}>
            <Navbar.Brand id="brand-logo">
              <img src={logo} alt="Prometheus Logo" className="d-inline-block align-top" width="80" height="80" />
              <h1 id="brand-name">Prometheus Science Bowl</h1>
            </Navbar.Brand>
          </Link>
            {authState && (
              <Nav className="ms-auto">
                <p id="welcome-name">Welcome, {authState.fullName.split(' ')[0]}!</p>
                <Button variant="danger" id="log-out-link" onClick={ourSignOut}>
                  Log Out
                </Button>
              </Nav>
            )}
            {/*<Link to="/tos" className="ms-auto tos-link">Terms of Service</Link>*/}
        </Navbar>
          <Routes>
            <Route path="/join/:joinCode" element={ <Join authCallback={setAuthState} /> } />
            <Route path="/admin" element={ <Admin authCallback={setAuthState} /> } />
            <Route path="/room/:roomId" element={ <Room authCallback={setAuthState} /> } />
            <Route path="/tos" element={ <Terms /> } />
            <Route path="/" element={ <Home authCallback={setAuthState} /> } />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
