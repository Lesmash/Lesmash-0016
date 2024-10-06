import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import Navbar from './Navbar';
import '../CSS/UserDashboard.css';
import { useUser } from './UserContext';
import { FaCrown, FaTrophy, FaMedal } from 'react-icons/fa';

function UserDashboard() {
    const [standings, setStandings] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        fetchStandings();
    }, []);

    const fetchStandings = async () => {
        const usersRef = collection(db, 'Users');
        const q = query(usersRef, orderBy('points', 'desc'));
        const querySnapshot = await getDocs(q);
        const standingsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setStandings(standingsData);
    };

    const calculateRating = (userData) => {
        const { points, wins, podiums, fastLaps, dnfs, dsqs } = userData;
        const score = points + (wins * 5) + (podiums * 3) + (fastLaps * 2) - (dnfs * 2) - (dsqs * 3);
        
        if (score >= 100) return 'S';
        if (score >= 80) return 'A';
        if (score >= 60) return 'B';
        if (score >= 40) return 'C';
        if (score >= 20) return 'D';
        return 'F';
    };

    const handleUserClick = (userData) => {
        setSelectedUser(userData);
    };

    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <h1>Welcome, {user?.username}!</h1>
                <div className="dashboard-content">
                <div className="dashboard-section">
                        <h2>Your Stats</h2>
                        <p>Points: {user?.points}</p>
                        <p>Overall Points: {user?.overAllPoints}</p>
                        <p>Wins: {user?.wins}</p>
                        <p>Podiums: {user?.podiums}</p>
                        <p>Fast Laps: {user?.fastLaps}</p>
                        <p>DNFs: {user?.dnfs}</p>
                        <p>DSQs: {user?.dsqs}</p>
                        <p>Driver of the Day: {user?.driverOfTheDay || 0} <FaMedal /></p>
                        <p>Championships: {user?.championships || 0} <FaTrophy /></p>
                    </div>
                    <div className="dashboard-section">
                        <h2>Recent Results</h2>
                        {/* Add recent results here */}
                    </div>
                    <div className="dashboard-section">
                        <h2>Upcoming Events</h2>
                        {/* Add upcoming events here */}
                    </div>
                </div>
                <section className="standings">
                    <h2>Championship Standings</h2>
                    <table className="standings-table">
                        <thead>
                            <tr>
                                <th>Position</th>
                                <th>Driver</th>
                                <th>Team</th>
                                <th>Points</th>
                                <th>Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((driver, index) => (
                                <tr 
                                    key={driver.id} 
                                    className={driver.id === user?.id ? "current-user" : ""}
                                    onClick={() => handleUserClick(driver)}
                                >
                                    <td>{index + 1}</td>
                                    <td>
                                        {driver.username}
                                        {index === 0 && <FaCrown className="crown-icon" />}
                                    </td>
                                    <td>{driver.team}</td>
                                    <td>{driver.points}</td>
                                    <td>{calculateRating(driver)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </>
    );
}

export default UserDashboard;