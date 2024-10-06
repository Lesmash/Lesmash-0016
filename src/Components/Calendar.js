import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import '../CSS/Calendar.css';
import { useUser } from './UserContext'; // Assuming you have a UserContext
import Navbar from './Navbar';

function Calendar() {
    const [calendars, setCalendars] = useState([]);
    const [selectedCalendar, setSelectedCalendar] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [newTrack, setNewTrack] = useState({ name: '', date: '' });
    const [newCalendarName, setNewCalendarName] = useState('');
    const [view, setView] = useState('list');
    const [editCalendarName, setEditCalendarName] = useState('');
    const { user } = useUser(); // Get the current user from context

    const isAdmin = user && user.role === 'Admin';

    useEffect(() => {
        fetchCalendars();
    }, []);

    const fetchCalendars = async () => {
        const querySnapshot = await getDocs(collection(db, 'calendars'));
        const calendarList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCalendars(calendarList);
    };

    const fetchTracks = async (calendarId) => {
        const querySnapshot = await getDocs(collection(db, 'calendars', calendarId, 'tracks'));
        const trackList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTracks(trackList.sort((a, b) => new Date(a.date) - new Date(b.date)));
    };

    const handleCalendarSelect = (calendar) => {
        setSelectedCalendar(calendar);
        setEditCalendarName(calendar.name);
        fetchTracks(calendar.id);
        setView('edit');
    };

    const handleAddTrack = async (e) => {
        e.preventDefault();
        if (selectedCalendar && newTrack.name && newTrack.date) {
            await addDoc(collection(db, 'calendars', selectedCalendar.id, 'tracks'), newTrack);
            setNewTrack({ name: '', date: '' });
            fetchTracks(selectedCalendar.id);
        }
    };

    const handleDeleteTrack = async (trackId) => {
        if (!isAdmin) {
            alert("Only Admins can delete tracks.");
            return;
        }
        await deleteDoc(doc(db, 'calendars', selectedCalendar.id, 'tracks', trackId));
        fetchTracks(selectedCalendar.id);
    };

    const handleCreateCalendar = async () => {
        if (newCalendarName) {
            const docRef = await addDoc(collection(db, 'calendars'), { name: newCalendarName });
            setNewCalendarName('');
            fetchCalendars();
            handleCalendarSelect({ id: docRef.id, name: newCalendarName });
        }
    };

    const handleDeleteCalendar = async () => {
        if (!isAdmin) {
            alert("Only Admins can delete calendars.");
            return;
        }
        if (selectedCalendar && window.confirm(`Are you sure you want to delete the calendar "${selectedCalendar.name}"?`)) {
            await deleteDoc(doc(db, 'calendars', selectedCalendar.id));
            setSelectedCalendar(null);
            setView('list');
            fetchCalendars();
        }
    };

    const handleRenameCalendar = async () => {
        if (selectedCalendar && editCalendarName) {
            await updateDoc(doc(db, 'calendars', selectedCalendar.id), { name: editCalendarName });
            setSelectedCalendar({ ...selectedCalendar, name: editCalendarName });
            fetchCalendars();
        }
    };

    return (
        <>
            <Navbar />
            <div className="calendar-container">
            <h1>Race Calendars</h1>
            
            {view === 'list' && (
                <>
                    <div className="calendar-list">
                        <h2>Available Calendars</h2>
                        {calendars.map(calendar => (
                            <button key={calendar.id} onClick={() => handleCalendarSelect(calendar)}>
                                {calendar.name}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setView('create')}>Create New Calendar</button>
                </>
            )}

            {view === 'create' && (
                <div className="create-calendar">
                    <h2>Create New Calendar</h2>
                    <input 
                        type="text" 
                        value={newCalendarName} 
                        onChange={(e) => setNewCalendarName(e.target.value)} 
                        placeholder="New Calendar Name"
                    />
                    <button onClick={handleCreateCalendar}>Create Calendar</button>
                    <button onClick={() => setView('list')}>Back to List</button>
                </div>
            )}

            {view === 'edit' && selectedCalendar && (
                <div className="selected-calendar">
                    <div className="calendar-header">
                        <input 
                            type="text" 
                            value={editCalendarName} 
                            onChange={(e) => setEditCalendarName(e.target.value)}
                        />
                        <button onClick={handleRenameCalendar}>Rename</button>
                        {isAdmin && <button onClick={handleDeleteCalendar}>Delete Calendar</button>}
                    </div>
                    <form onSubmit={handleAddTrack} className="add-track-form">
                        <input 
                            type="text" 
                            value={newTrack.name} 
                            onChange={(e) => setNewTrack({...newTrack, name: e.target.value})} 
                            placeholder="Track Name"
                        />
                        <input 
                            type="date" 
                            value={newTrack.date} 
                            onChange={(e) => setNewTrack({...newTrack, date: e.target.value})} 
                        />
                        <button type="submit">Add Track</button>
                    </form>
                    <div className="track-list">
                        {tracks.map(track => (
                            <div key={track.id} className="track-item">
                                <div className="track-info">
                                    <span className="track-name">{track.name}</span>
                                    <span className="track-date">{new Date(track.date).toLocaleDateString()}</span>
                                </div>
                                {isAdmin && <button onClick={() => handleDeleteTrack(track.id)}>Delete</button>}
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setView('list')}>Back to List</button>
                </div>
            )}
        </div>
        </>
    );
}

export default Calendar;