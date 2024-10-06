import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import Navbar from './Navbar';
import '../CSS/AdminDashboard.css';
import { useUser } from './UserContext';

function UserDashboard() {
  const { user, loading } = useUser();
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const standingsQuery = query(
          collection(db, "Users"),
          orderBy("points", "desc"),
          limit(10)
        );
        const standingsSnapshot = await getDocs(standingsQuery);
        const standingsData = standingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStandings(standingsData);
      } catch (error) {
        console.error("Error fetching standings:", error);
      }
    };

    fetchStandings();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <div className="error">User not found. Please log in again.</div>;
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Welcome, {user.username}!</h1>
          <p>Role: {user.role}</p>
          <p>Team: {user.team}</p>
        </header>
        <main className="dashboard-content">
          <section className="standings">
            <h2>Championship Standings</h2>
            <table className="standings-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Driver</th>
                  <th>Team</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((driver, index) => (
                  <tr key={driver.id} className={driver.id === user.id ? "current-user" : ""}>
                    <td>{index + 1}</td>
                    <td>{driver.username}</td>
                    <td>{driver.team}</td>
                    <td>{driver.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="user-stats">
            <h2 className='stats-text'>Your Stats</h2>
            <p><strong>Overall Points:</strong> {user.overAllPoints}</p>
            <p><strong>DNFs:</strong> {user.dnfs || 0}</p>
            <p><strong>Rating:</strong> {user.rating || 'N/A'}</p>
            <p><strong>Team:</strong> {user.team}</p>
          </section>
        </main>
      </div>
    </>
  );
}

export default UserDashboard;