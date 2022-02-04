import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import Home from './pages/Home';
import Join from './pages/Join';
import Admin from './pages/Admin';

function App() {
  return (
    <div className="App">
      <div className="container">
        <Router>
          <Routes>
            <Route path="/join/:joinCode" element={ <Join /> } />
            <Route path="/admin" element={ <Admin /> } />
            <Route path="/" element={ <Home /> } />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
