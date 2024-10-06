import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from './Navbar';
import '../CSS/Profile.css';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);
    const { user, loading } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Effect running. User:", user, "Loading:", loading);
        if (!loading) {
            if (!user) {
                console.log("No user, navigating to login");
                navigate('/login');
                return;
            }
            fetchProfileData();
        }
    }, [user, loading, navigate]);

    const fetchProfileData = async () => {
        console.log("Fetching profile data. User object:", user);
        if (user && user.id) {
            try {
                const userRef = doc(db, 'Users', user.id);
                console.log("Fetching document for user ID:", user.id);
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists()) {
                    console.log("Document data:", userSnap.data());
                    setProfileData(userSnap.data());
                } else {
                    console.log("No such document! Using user object data.");
                    setProfileData(user);
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
                setError("Error fetching profile data: " + error.message);
            }
        } else {
            console.log("User or user.id is undefined");
            setError("User information is missing. User object: " + JSON.stringify(user));
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        if (timestamp.seconds) {
            return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }
        return 'Invalid Date';
    };

    if (loading) return <div>Loading user data...</div>;
    if (!user) return <div>No user logged in</div>;

    const displayData = profileData || user;

    const profileSections = [
        {
            title: "Personal Information",
            fields: [
                { label: "Username", key: "username" },
                { label: "Role", key: "role" },
                { label: "Email", key: "email" },
                { label: "Member since", key: "createdAt", format: formatDate }
            ]
        },
        {
            title: "Racing Statistics",
            fields: [
                { label: "Team", key: "team" },
                { label: "Points", key: "points" },
                { label: "Overall Points", key: "overAllPoints" },
                { label: "Wins", key: "wins" },
                { label: "Podiums", key: "podiums" },
                { label: "Fast Laps", key: "fastLaps" },
                { label: "DNFs", key: "dnfs" },
                { label: "DSQs", key: "dsqs" },
                { label: "Driver of the Day", key: "driverOfTheDay" },
                { label: "Championships", key: "championships" }
            ]
        }
    ];

    return (
        <>
            <Navbar />
            <div className="profile-container">
                <header className="profile-header">
                    <h1>User Profile</h1>
                </header>
                {error ? (
                    <p className="error-message">{error}</p>
                ) : displayData ? (
                    <main className="profile-content">
                        {profileSections.map((section, index) => (
                            <section key={index} className="profile-section">
                                <h2>{section.title}</h2>
                                {section.fields.map((field, fieldIndex) => (
                                    <div key={fieldIndex} className="info-item">
                                        <strong>{field.label}:</strong>
                                        <p>
                                            {field.format 
                                                ? field.format(displayData[field.key])
                                                : displayData[field.key] || 'N/A'}
                                        </p>
                                    </div>
                                ))}
                            </section>
                        ))}
                    </main>
                ) : (
                    <p>Loading profile data...</p>
                )}
            </div>
        </>
    );
}

export default Profile;