import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import '../Stylesheets/UserAccount.css';
import axios from "../api/axios";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const EDIT_ACCOUNT_URL = '/edit-account';
const FETCH_ACCOUNT_URL = '/get-account';
const GET_USER_ID_URL = '/get-id-for-username';

const UserAccount = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [id, setId] = useState(location.state?.id || null); 
    const [username, setUsername] = useState(location.state?.username || "Guest");
    const [email, setEmail] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!id && username !== "Guest") {
            const fetchId = async () => {
                try {
                    const response = await axios.get(GET_USER_ID_URL, { username }, {
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (response.status === 200) {
                        setId(response.data.id);
                        setUsername(response.data.username);
                        setEmail(response.data.email);
                    } else {
                        setErrorMessage('Unable to load account information');
                    }
                } catch (error) {
                    console.error(error);
                    setErrorMessage('Unable to load account information');
                }
            };

            fetchId();
        }
    }, [id, username]);

    const goToHomePage = () => {
        navigate('/home', { state: { username } });
    };

    const handleToggleCollapse = async () => {
        if (isCollapsed) {
            try {
                const response = await axios.post(FETCH_ACCOUNT_URL, 
                    { id: id }, 
                    {
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
    
                if (response.status === 200) {
                    const data = response.data;
                    setId(data.id || null);
                    setUsername(data.username || "Guest");
                    setEmail(data.email || "");
                } else {
                    setErrorMessage('Unable to load account information');
                }
            } catch (error) {
                console.error(error);
                setErrorMessage('Unable to load account information');
            }
        }
        setIsCollapsed(!isCollapsed);
    };
    

    const handleSaveClick = async () => {
        if (!EMAIL_REGEX.test(email)) {
            setErrorMessage('Invalid email format');
            return;
        }

        try {
            const response = await axios.post(EDIT_ACCOUNT_URL, {
                id, username, email
            });

            if (response.status !== 200) {
                throw new Error('Failed to update account information');
            }

            setIsEditing(false);
            setErrorMessage('');
        } catch (error) {
            console.error(error);
            setErrorMessage('An error occurred while saving the information');
        }
    };

    return (
        <>
            <button className="back-button" onClick={goToHomePage}>
                <FontAwesomeIcon icon={faArrowAltCircleLeft} />
            </button>

            <div className="account-container">
                <h1 className="welcome-message">hello, {username}</h1>
                <div className="collapsible-section">
                    <div className="header-edit" onClick={handleToggleCollapse}>
                        <span>Account Information</span>
                        <button className="toggle-button">
                            {isCollapsed ? '▼' : '▲'}
                        </button>
                    </div>
                    {!isCollapsed && (
                        <div className="content">
                            {errorMessage && <p className="error-message">{errorMessage}</p>}
                            <div className="field">
                                <label>Username:</label>
                                <input
                                    type="text"
                                    value={username}
                                    disabled={!isEditing}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="field">
                                <label>Email:</label>
                                <input className="edit-name"
                                    type="email"
                                    value={email}
                                    disabled={!isEditing}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {isEditing ? (
                                <button className="save-button" onClick={handleSaveClick}>
                                    Save
                                </button>
                            ) : (
                                <button className="edit-button" onClick={() => setIsEditing(true)}>
                                    Edit
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserAccount;