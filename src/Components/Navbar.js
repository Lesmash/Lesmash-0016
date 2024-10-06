import React, { useState } from 'react'
import '../CSS/Navbar.css'
import { auth } from './firebase';
import { FaCalendar, FaHome, FaSignOutAlt, FaUser, FaBars, FaCog, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { user } = useUser();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    }

    async function handleLogout() {
        try {
          await auth.signOut();
          navigate('/login');
        } catch (error) {
          console.error("Error logging out:", error);
          // Handle error (e.g., show an error message to the user)
        }
    }

    return (
        <header className='nav-header'>
            <div className='container'>
                <nav>
                    <div className='logo'>
                        <h2>LESMASH - V5</h2>
                    </div>
                    <ul className={isOpen ? 'nav-link active' : 'nav-link'}>
                        <li>
                            <a href='/dashboard'>Home <FaHome style={{ verticalAlign: '-0.125em' }} /></a>
                        </li>
                        <li>
                            <a href='/calendar'>Calendar <FaCalendar style={{ verticalAlign: '-0.125em' }} /></a>
                        </li>
                        <li>
                            <a href='/driver_cards'>Driver Cards <FaUsers style={{ verticalAlign: '-0.125em' }} /></a>
                        </li>
                        <li>
                            <a href='/profile'>Profile <FaUser style={{ verticalAlign: '-0.125em' }} /></a>
                        </li>
                        {user && user.role === 'Admin' && (
                            <li>
                                <a href='/admin_panel'>Admin Panel <FaCog style={{ verticalAlign: '-0.125em' }} /></a>
                            </li>
                        )}
                    </ul>
                    <div className='logout'>
                        <button onClick={handleLogout}>Logout <FaSignOutAlt style={{ verticalAlign: 'middle' }} /></button>
                    </div>
                    <div className='burger-icon' onClick={toggleMenu}>
                        <FaBars />
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Navbar