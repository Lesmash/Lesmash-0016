import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, updateDoc, doc, query, where, increment, writeBatch, setDoc, getDoc } from 'firebase/firestore';
import Navbar from './Navbar';
import '../CSS/AdminPanel.css';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
    const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0 });
    const [command, setCommand] = useState('');
    const [consoleOutput, setConsoleOutput] = useState([]);
    const [teams, setTeams] = useState([]);
    const [newTeamName, setNewTeamName] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [userToAdd, setUserToAdd] = useState('');
    const { user, loading } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'Admin') {
                navigate('/dashboard');
                return;
            }
            fetchStats();
            fetchTeams();
        }
    }, [user, loading, navigate]);

    const fetchStats = async () => {
        const usersCollection = collection(db, 'Users');
        const userSnapshot = await getDocs(usersCollection);
        const totalUsers = userSnapshot.size;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeUsersQuery = query(usersCollection, where('lastLogin', '>=', thirtyDaysAgo));
        const activeUsersSnapshot = await getDocs(activeUsersQuery);
        const activeUsers = activeUsersSnapshot.size;

        setStats({ totalUsers, activeUsers });
    };

    const fetchTeams = async () => {
        const teamsCollection = collection(db, 'Teams');
        const teamSnapshot = await getDocs(teamsCollection);
        const teamList = teamSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeams(teamList);
    };

    const handleCommandSubmit = async (e) => {
        e.preventDefault();
        const parts = command.split(' ');
        const cmd = parts[0];

        switch(cmd) {
            case '/ap':
            case '/dp':
                await handlePointsCommand(parts, cmd === '/ap');
                break;
            case '/dnf':
                await handleDNFCommand(parts);
                break;
            case '/fl':
            case '/dfl':
                await handleFastLapCommand(parts, cmd === '/fl');
                break;
            case '/dsq':
                await handleDSQCommand(parts);
                break;
            case '/p1':
            case '/p2':
            case '/p3':
            case '/p1-fl':
            case '/p2-fl':
            case '/p3-fl':
                await handlePodiumCommand(parts, cmd);
                break;
            case '/dot':
                await handleDriverOfTheDayCommand(parts);
                break;
            case '/champion':
                await handleChampionCommand(parts);
                break;
            case '/help':
                displayHelp();
                break;
            default:
                addToConsole('Unknown command. Use /help for available commands.');
        }

        setCommand('');
    };

    const handlePointsCommand = async (parts, isAdd) => {
        if (parts.length !== 3) {
            addToConsole(`Invalid command. Usage: ${isAdd ? '/ap' : '/dp'} <username> <points>`);
            return;
        }

        const username = parts[1];
        const points = parseInt(parts[2]);

        if (isNaN(points)) {
            addToConsole('Invalid points value. Please enter a number.');
            return;
        }

        try {
            const userQuery = query(collection(db, 'Users'), where('username', '==', username));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                addToConsole(`User ${username} not found.`);
                return;
            }

            const userDoc = userSnapshot.docs[0];
            const userRef = doc(db, 'Users', userDoc.id);
            const currentPoints = userDoc.data().points || 0;
            const currentOverAllPoints = userDoc.data().overAllPoints || 0;
            const newPoints = isAdd ? currentPoints + points : currentPoints - points;
            const newOverAllPoints = isAdd ? currentOverAllPoints + points : currentOverAllPoints;

            await updateDoc(userRef, { 
                points: newPoints,
                overAllPoints: newOverAllPoints
            });

            addToConsole(`${isAdd ? 'Added' : 'Removed'} ${points} points ${isAdd ? 'to' : 'from'} ${username}. New total: ${newPoints}, Overall: ${newOverAllPoints}`);
        } catch (error) {
            addToConsole(`Error: ${error.message}`);
        }
    };

    const handleDNFCommand = async (parts) => {
        if (parts.length !== 2) {
            addToConsole('Invalid command. Usage: /dnf <username>');
            return;
        }

        const username = parts[1];

        try {
            const userQuery = query(collection(db, 'Users'), where('username', '==', username));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                addToConsole(`User ${username} not found.`);
                return;
            }

            const userDoc = userSnapshot.docs[0];
            const userRef = doc(db, 'Users', userDoc.id);
            const currentDNFs = userDoc.data().dnfs || 0;

            await updateDoc(userRef, { dnfs: currentDNFs + 1 });

            addToConsole(`Added DNF to ${username}. Total DNFs: ${currentDNFs + 1}`);
        } catch (error) {
            addToConsole(`Error: ${error.message}`);
        }
    };

    const handleFastLapCommand = async (parts, isAdd) => {
        if (parts.length !== 2) {
            addToConsole(`Invalid command. Usage: ${isAdd ? '/fl' : '/dfl'} <username>`);
            return;
        }

        const username = parts[1];

        try {
            const userQuery = query(collection(db, 'Users'), where('username', '==', username));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                addToConsole(`User ${username} not found.`);
                return;
            }

            const userDoc = userSnapshot.docs[0];
            const userRef = doc(db, 'Users', userDoc.id);
            const currentFastLaps = userDoc.data().fastLaps || 0;
            const currentPoints = userDoc.data().points || 0;
            const currentOverAllPoints = userDoc.data().overAllPoints || 0;

            if (!isAdd && currentFastLaps === 0) {
                addToConsole(`${username} has no fast laps to remove.`);
                return;
            }

            await updateDoc(userRef, { 
                fastLaps: isAdd ? increment(1) : increment(-1),
                points: isAdd ? increment(1) : increment(-1),
                overAllPoints: isAdd ? increment(1) : currentOverAllPoints
            });

            addToConsole(`${isAdd ? 'Added' : 'Removed'} fast lap ${isAdd ? 'to' : 'from'} ${username}. 
                          Fast Laps: ${isAdd ? currentFastLaps + 1 : currentFastLaps - 1}, 
                          Points: ${isAdd ? currentPoints + 1 : currentPoints - 1},
                          Overall Points: ${isAdd ? currentOverAllPoints + 1 : currentOverAllPoints}`);
        } catch (error) {
            addToConsole(`Error: ${error.message}`);
        }
    };

    const handleDSQCommand = async (parts) => {
        if (parts.length !== 2) {
            addToConsole('Invalid command. Usage: /dsq <username>');
            return;
        }

        const username = parts[1];

        try {
            const userQuery = query(collection(db, 'Users'), where('username', '==', username));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                addToConsole(`User ${username} not found.`);
                return;
            }

            const userDoc = userSnapshot.docs[0];
            const userRef = doc(db, 'Users', userDoc.id);
            const currentDSQs = userDoc.data().dsqs || 0;

            await updateDoc(userRef, { dsqs: currentDSQs + 1 });

            addToConsole(`Added DSQ to ${username}. Total DSQs: ${currentDSQs + 1}`);
        } catch (error) {
            addToConsole(`Error: ${error.message}`);
        }
    };

    const handlePodiumCommand = async (parts, cmd) => {
        if (parts.length !== 2) {
            addToConsole(`Invalid command. Usage: ${cmd} <username>`);
            return;
        }

        const username = parts[1];
        let points, win = 0, podium = 1, fastLap = 0;

        switch(cmd) {
            case '/p1':
                points = 25;
                win = 1;
                break;
            case '/p2':
                points = 18;
                break;
            case '/p3':
                points = 15;
                break;
            case '/p1-fl':
                points = 26;
                win = 1;
                fastLap = 1;
                break;
            case '/p2-fl':
                points = 19;
                fastLap = 1;
                break;
            case '/p3-fl':
                points = 16;
                fastLap = 1;
                break;
            default:
                addToConsole('Invalid command. Use /help for available commands.');
                return;
        }

        try {
            const userQuery = query(collection(db, 'Users'), where('username', '==', username));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                addToConsole(`User ${username} not found.`);
                return;
            }

            const userDoc = userSnapshot.docs[0];
            const userRef = doc(db, 'Users', userDoc.id);
            const userData = userDoc.data();

            await updateDoc(userRef, { 
                points: (userData.points || 0) + points,
                overAllPoints: (userData.overAllPoints || 0) + points,
                wins: (userData.wins || 0) + win,
                podiums: (userData.podiums || 0) + podium,
                fastLaps: (userData.fastLaps || 0) + fastLap
            });

            addToConsole(`Updated ${username}'s stats: +${points} points, +${win} win, +${podium} podium, +${fastLap} fast lap`);
        } catch (error) {
            addToConsole(`Error: ${error.message}`);
        }
    };

    const handleDriverOfTheDayCommand = async (parts) => {
        if (parts.length !== 2) {
            addToConsole('Invalid command. Usage: /dot <username>');
            return;
        }

        const username = parts[1];

        try {
            const userQuery = query(collection(db, 'Users'), where('username', '==', username));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                addToConsole(`User ${username} not found.`);
                return;
            }

            const userDoc = userSnapshot.docs[0];
            const userRef = doc(db, 'Users', userDoc.id);
            const currentDOTD = userDoc.data().driverOfTheDay || 0;

            await updateDoc(userRef, { driverOfTheDay: currentDOTD + 1 });

            addToConsole(`Added Driver of the Day to ${username}. Total DOTD: ${currentDOTD + 1}`);
        } catch (error) {
            addToConsole(`Error: ${error.message}`);
        }
    };

    const handleChampionCommand = async (parts) => {
        if (parts.length !== 2) {
            addToConsole('Invalid command. Usage: /champion <username>');
            return;
        }

        const username = parts[1];

        try {
            const userQuery = query(collection(db, 'Users'), where('username', '==', username));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                addToConsole(`User ${username} not found.`);
                return;
            }

            const userDoc = userSnapshot.docs[0];
            const userRef = doc(db, 'Users', userDoc.id);
            const currentChampionships = userDoc.data().championships || 0;

            await updateDoc(userRef, { championships: currentChampionships + 1 });

            addToConsole(`Added Championship to ${username}. Total Championships: ${currentChampionships + 1}`);
        } catch (error) {
            addToConsole(`Error: ${error.message}`);
        }
    };

    const displayHelp = () => {
        const helpText = `Available commands:
    /ap <username> <points> - Add points to a user
    /dp <username> <points> - Remove points from a user
    /dnf <username> - Add a DNF to a user
    /fl <username> - Add a fast lap to a user
    /dfl <username> - Remove a fast lap from a user
    /dsq <username> - Add a DSQ to a user
    /p1 <username> - Award 1st place (25 points, win, podium)
    /p2 <username> - Award 2nd place (18 points, podium)
    /p3 <username> - Award 3rd place (15 points, podium)
    /p1-fl <username> - Award 1st place with fastest lap (26 points, win, podium, fast lap)
    /p2-fl <username> - Award 2nd place with fastest lap (19 points, podium, fast lap)
    /p3-fl <username> - Award 3rd place with fastest lap (16 points, podium, fast lap)
    /dot <username> - Award Driver of the Day to a user
    /champion <username> - Award a Championship to a user
    /help - Display this help message`;
        addToConsole(helpText);
    };

    const handleResetSeason = async () => {
        if (window.confirm("Are you sure you want to reset the season? This will reset all users' points to 0.")) {
            try {
                const usersCollection = collection(db, 'Users');
                const userSnapshot = await getDocs(usersCollection);
                const batch = writeBatch(db);

                userSnapshot.docs.forEach((userDoc) => {
                    const userRef = doc(db, 'Users', userDoc.id);
                    batch.update(userRef, {
                        points: 0,
                        overAllPoints: 0,
                        fastLaps: 0,
                        dnfs: 0,
                        dsqs: 0,
                        wins: 0,
                        podiums: 0,
                        poles: 0
                    });
                });

                await batch.commit();
                addToConsole("Season reset successful. All users' points and stats have been reset to 0.");
            } catch (error) {
                addToConsole(`Error resetting season: ${error.message}`);
            }
        }
    };

    const handleAddTeam = async (e) => {
        e.preventDefault();
        if (newTeamName.trim() === '') {
            addToConsole('Team name cannot be empty.');
            return;
        }

        try {
            const teamRef = doc(collection(db, 'Teams'));
            await setDoc(teamRef, { name: newTeamName, members: [] });
            addToConsole(`Team "${newTeamName}" added successfully.`);
            setNewTeamName('');
            fetchTeams();
        } catch (error) {
            addToConsole(`Error adding team: ${error.message}`);
        }
    };

    const handleAddUserToTeam = async (e) => {
        e.preventDefault();
        if (selectedTeam === '' || userToAdd.trim() === '') {
            addToConsole('Please select a team and enter a username.');
            return;
        }

        try {
            const userQuery = query(collection(db, 'Users'), where('username', '==', userToAdd));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                addToConsole(`User ${userToAdd} not found.`);
                return;
            }

            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();

            const teamRef = doc(db, 'Teams', selectedTeam);
            const teamDoc = await getDoc(teamRef);

            if (!teamDoc.exists()) {
                addToConsole('Selected team not found.');
                return;
            }

            const teamData = teamDoc.data();

            if (userData.team && userData.team !== '') {
                const confirmChange = window.confirm(`User ${userToAdd} is already in team "${userData.team}". Do you want to change their team to "${teamData.name}"?`);
                if (!confirmChange) {
                    addToConsole(`Operation cancelled. User ${userToAdd} remains in team "${userData.team}".`);
                    return;
                }
            }

            const updatedMembers = [...(teamData.members || []), userDoc.id];

            await updateDoc(teamRef, { members: updatedMembers });
            await updateDoc(doc(db, 'Users', userDoc.id), { team: teamData.name });

            addToConsole(`User ${userToAdd} added to team "${teamData.name}" successfully.`);
            setUserToAdd('');
        } catch (error) {
            addToConsole(`Error adding user to team: ${error.message}`);
        }
    };

    const handleUpdateAllUsers = async () => {
        if (window.confirm("Are you sure you want to update all users with new stats? This may take a while for a large number of users.")) {
            try {
                const usersRef = collection(db, 'Users');
                const querySnapshot = await getDocs(usersRef);
                const batch = writeBatch(db);

                querySnapshot.forEach((userDoc) => {
                    const userRef = doc(db, 'Users', userDoc.id);
                    const userData = userDoc.data();

                    // Only update if the fields don't exist
                    if (!userData.hasOwnProperty('driverOfTheDay')) {
                        batch.update(userRef, { driverOfTheDay: 0 });
                    }
                    if (!userData.hasOwnProperty('championships')) {
                        batch.update(userRef, { championships: 0 });
                    }
                });

                await batch.commit();
                addToConsole("All users have been updated with new stats.");
            } catch (error) {
                addToConsole(`Error updating users: ${error.message}`);
            }
        }
    };

    const addToConsole = (message) => {
        const lines = message.split('\n');
        setConsoleOutput(prev => [...prev, ...lines]);
    };

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : user && user.role === 'Admin' ? (
                <>
                    <Navbar />
                    <div className="admin-panel">
                        <h1>Admin Panel</h1>
                        <div className="admin-stats">
                            <h2>System Statistics</h2>
                            <p>Total Users: {stats.totalUsers}</p>
                            <p>Active Users: {stats.activeUsers}</p>
                        </div>
                        <div className="admin-console">
                            <h2>Admin Console</h2>
                            <div className="console-output">
                                {consoleOutput.map((line, index) => (
                                    <p key={index}>{line}</p>
                                ))}
                            </div>
                            <form onSubmit={handleCommandSubmit}>
                                <input
                                    type="text"
                                    value={command}
                                    onChange={(e) => setCommand(e.target.value)}
                                    placeholder="Enter command (e.g., /ap username points)"
                                />
                                <button type="submit">Execute</button>
                            </form>
                        </div>
                        <div className="team-management">
                            <h2>Team Management</h2>
                            <form onSubmit={handleAddTeam}>
                                <input
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    placeholder="Enter new team name"
                                />
                                <button type="submit">Add Team</button>
                            </form>
                            <form onSubmit={handleAddUserToTeam}>
                                <select
                                    value={selectedTeam}
                                    onChange={(e) => setSelectedTeam(e.target.value)}
                                >
                                    <option value="">Select a team</option>
                                    {teams.map(team => (
                                        <option key={team.id} value={team.id}>{team.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={userToAdd}
                                    onChange={(e) => setUserToAdd(e.target.value)}
                                    placeholder="Enter username to add"
                                />
                                <button type="submit">Add User to Team</button>
                            </form>
                        </div>
                        <div className="admin-actions">
                            <button onClick={handleResetSeason} className="reset-season-button">Reset Season</button>
                            <button onClick={handleUpdateAllUsers} className="update-users-button">Update All Users</button>
                        </div>
                    </div>
                </>
            ) : null}
        </>
    );
}

export default AdminPanel;