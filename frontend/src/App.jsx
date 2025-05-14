import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Components/Register';
import LogIn from './Components/LogIn';
import Home from './Components/Home';
import UserAccount from './Components/UserAccount';
import {GoogleOAuthProvider} from '@react-oauth/google';
import axios from "./api/axios";
import loadingVideo from './Assets/medbear_icon_spinner.mp4';

const GET_GOOGLE_CLIENT_ID_URL = '/get-google-client-id';

const App = () => {
    const [googleClientId, setClientId] = useState('');

    useEffect(() => {
        const fetchClientId = async () => {
            try {
                const response = await axios.get(GET_GOOGLE_CLIENT_ID_URL); 
                if (response.status === 200) {
                    setClientId(response.data.googleClientId);
                } else {
                    console.error('Failed to fetch Google Client ID');
                }
            } catch (error) {
                console.error('Error fetching Google Client ID:', error);
            }
        };

        fetchClientId();
    }, []);

    if (!googleClientId) {
        return (
            <div style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <div style={{
                    width: '40%',
                    height: '40%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <video
                        src={loadingVideo}
                        autoPlay
                        muted
                        loop
                        style={{ width: '60%', objectFit: 'cover' }}
                    />
                    <div className="text">medbear is connecting...</div>
                </div>
            </div>
        );
    }
    
    window.addEventListener("beforeunload", function () {
        navigator.sendBeacon("/log-out");
    });

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <Router>
                <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/sign-up" element={<Register />} />
                    <Route path="/log-in" element={<LogIn />} />
                    <Route path="/user-account" element={<UserAccount />} />
                    <Route path="/" element={<Navigate to="/log-in" />} />
                </Routes>
            </Router>
        </GoogleOAuthProvider>
    );
};

export default App;