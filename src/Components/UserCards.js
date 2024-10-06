import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import Navbar from './Navbar';
import '../CSS/UserCards.css';
import { FaCrown, FaTrophy, FaMedal } from 'react-icons/fa';

function DriverCards() {
    const [drivers, setDrivers] = useState([]);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        const usersRef = collection(db, 'Users');
        const q = query(usersRef, orderBy('points', 'desc'));
        const querySnapshot = await getDocs(q);
        const driversData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setDrivers(driversData);
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

    const getTeamColor = (team) => {
        const teamColors = {
            'Mercedes': '#00D2BE',
            'Red Bull': '#0600EF',
            'Ferrari': '#DC0000',
            'McLaren': '#FF8700',
            'Aston Martin': '#006F62',
            'Alpine': '#0090FF',
            'AlphaTauri': '#2B4562',
            'Alfa Romeo': '#900000',
            'Haas': '#FFFFFF',
            'Williams': '#005AFF'
        };
        return teamColors[team] || '#FFFFFF'; // Default to white if team not found
    };

    return (
        <>
            <Navbar />
            <div className="driver-cards-container">
                <h1>Driver Cards</h1>
                <div className="driver-cards-grid">
                    {drivers.map((driver, index) => (
                        <div key={driver.id} className="driver-card">
                            <h2 style={{ color: getTeamColor(driver.team) }}>
                                {driver.username}
                                {index === 0 && <FaCrown className="crown-icon" />}
                            </h2>
                            <p><strong>Team:</strong> {driver.team || 'N/A'}</p>
                            <p><strong>Points:</strong> {driver.points}</p>
                            <p><strong>Overall Points:</strong> {driver.overAllPoints}</p>
                            <p><strong>Wins:</strong> {driver.wins || 0}</p>
                            <p><strong>Podiums:</strong> {driver.podiums || 0}</p>
                            <p><strong>Fast Laps:</strong> {driver.fastLaps || 0}</p>
                            <p><strong>DNFs:</strong> {driver.dnfs || 0}</p>
                            <p><strong>DSQs:</strong> {driver.dsqs || 0}</p>
                            <p><strong>Driver of the Day:</strong> {driver.driverOfTheDay || 0} <FaMedal /></p>
                            <p><strong>Championships:</strong> {driver.championships || 0} <FaTrophy /></p>
                            <p><strong>Rating:</strong> {calculateRating(driver)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default DriverCards;