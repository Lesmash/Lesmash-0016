import './CSS/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './Components/login'
import Register from './Components/register'
import UserDashboard from './Components/UserDashboard'
import AdminPanel from './Components/AdminPanel'
import Profile from './Components/Profile'
import DriverCards from './Components/UserCards'
import Calendar from './Components/Calendar'
import { UserProvider } from './Components/UserContext';

function App() {
  return (
    <Router>
      <UserProvider>
        <div className='App'>
          <div className='auth-wrapper'>
            <div className='auth-inner'>
              <Routes>
                <Route path='/' element={<Login />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/dashboard' element={<UserDashboard />} />
                <Route path='/admin_panel' element={<AdminPanel />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/driver_cards' element={<DriverCards />} />
                <Route path='/calendar' element={<Calendar />} />
              </Routes>
            </div>
          </div>
        </div>
      </UserProvider>
    </Router>
  );
}

export default App;