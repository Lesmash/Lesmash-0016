import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { setDoc, doc } from "firebase/firestore";
import "../CSS/Register.css";
import { useNavigate } from 'react-router-dom';

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "Users", user.uid), {
                email: user.email,
                username: username,
                role: 'User', // Change this to 'Admin' for admin accounts
                points: 0,
                overAllPoints: 0,
                fastestLaps: 0,
                dsq: 0,
                dnf: 0,
                wins: 0,
                podiums: 0,
                poles: 0,
                lastLogin: new Date(),
                createdAt: new Date()
            });

            console.log("User registered successfully");
            navigate('/dashboard');
        } catch (error) {
            console.error("Error registering user:", error);
            // Handle error (e.g., show error message to user)
        }
    };

    return (
        <form className="register-form">
            <h2 className="register-title">Register</h2>
            <div className="input-group">
                <label>Username:</label>
                <input 
                    type="text"
                    placeholder="Username..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>

            <div className="input-group">
                <label>Email:</label>
                <input 
                    type="email"
                    placeholder="Email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="input-group">
                <label>Password:</label>
                <input 
                    type="password"
                    placeholder="Password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <button className="register-button" onClick={handleRegister}>Register</button>
            <div className="login-link-container"><p>Already have an account?</p><a href="/login" className="login-link">Login</a></div>
        </form>
    );
}

export default Register;