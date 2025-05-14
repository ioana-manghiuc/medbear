import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faPaperPlane, faHistory} from '@fortawesome/free-solid-svg-icons';
import '../Stylesheets/Home.css';
import axios from "../api/axios";

const GET_USER_ID_URL = '/get-id-for-username';
const LOG_IN_URL = '/log-in';
const LOG_OUT_URL = '/log-out';
const HOME_URL = '/home';
const USER_ACCOUNT_URL = '/user-account';
const SEND_MESSAGE_URL = '/send-message'; 
const BOT_RESPONSE_URL = '/get-bot-response';
const GET_CHAT_ID_URL = '/get-chat-id';
const CREATE_CHAT_URL = '/create-chat';
const GET_USER_CHATS_URL = '/get-user-chats';
const RESTORE_CHAT_HISTORY_URL = '/restore-chat-history';
const COMPARE_MODELS_URL = '/models-replies';

const Home = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const username = location.state?.username || sessionStorage.getItem('username');
    const [userId, setUserId] = useState(null);
    const [chatId, setChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const historyRef = useRef(null);
    const menuRef = useRef(null);

    
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get(HOME_URL);
                if (response.data.expired) {
                    sessionStorage.clear();
                    navigate(LOG_IN_URL, { state: { message: 'Session expired. Please log in again.' } });
                }
            } catch (err) {
                console.error("Unexpected error during session check", err);
            }
        };
    
        checkSession();
    }, [navigate]);
    
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await axios.post(GET_USER_ID_URL, { username });
                if (response.status === 200) {
                    setUserId(response.data.id);
                }
            } catch (error) {
                navigate(LOG_IN_URL);
                console.error("Error fetching user ID:", error);
            }
        };
        fetchUserId();
    }, [username]);

    useEffect(() => {
        const handleBackNavigation = async () => {
            try {
                await axios.post('/log-out');
                sessionStorage.clear();
                navigate('/log-in', { state: { message: 'You have been logged out.' } });
            } catch (err) {
                console.error("Error logging out on back navigation", err);
            }
        };
    
        const listener = () => {
            if (document.referrer.includes('/log-in')) {
                handleBackNavigation();
            }
        };
    
        window.addEventListener('popstate', listener);
        return () => window.removeEventListener('popstate', listener);
    }, []);
    
    useEffect(() => {
        if (!username) {
            navigate(LOG_IN_URL, { state: { message: 'Please log in.' } });
        }
    }, [username]);    

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }

            if (historyRef.current && !historyRef.current.contains(event.target)) {
                setIsHistoryOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchChatId = async () => {
            if (userId) {
                try 
                {
                    const response = await axios.get(`${GET_CHAT_ID_URL}/${userId}`);
                    if (response.status === 200 && response.data.chat_id !== -1) 
                    {
                        setChatId(response.data.chat_id);
                    } 
                    else 
                    {
                        const createChatResponse = await axios.post(CREATE_CHAT_URL, { user_id: userId });
                        if (createChatResponse.status === 201) {
                            console.log('Chat created:', createChatResponse.data.chat_id);
                            setChatId(createChatResponse.data.chat_id);
                        }
                    }
                } 
                catch (error) {
                    console.error("Error fetching chat ID:", error);
                }
            }
        };
        fetchChatId();
    }, [userId]);

    const fetchChatHistory = async () => {
        if (userId) {
            try {
                const response = await axios.get(`${GET_USER_CHATS_URL}/${userId}`);
                if (response.status === 200) {
                    setChatHistory(response.data.chats);
                }
            } catch (error) {
                console.error("Error fetching chat history:", error);
            }
        }
    };

    const toggleHistory = () => {
        setIsHistoryOpen(!isHistoryOpen);
        if (!isHistoryOpen) fetchChatHistory();
    };

    const loadChat = async (selectedChatId) => {
        try {
            const response = await axios.get(`${RESTORE_CHAT_HISTORY_URL}/${selectedChatId}`);
            if (response.status === 200) {
                setMessages([
                    ...response.data.messages_sent.map(msg => ({ sender: "user", text: msg })),
                    ...response.data.messages_received.map(msg => ({ sender: "bot", text: msg }))
                ]);
                setChatId(selectedChatId);
            }
        } catch (error) {
            console.error("Error restoring chat:", error);
        }
    };

    
    const restoreHistory = async () => {
        if (chatId) {
            try {
                const response = await axios.get(`${RESTORE_CHAT_HISTORY_URL}/${chatId}`);
                console.log('Messages Response:', response);
    
                if (response.status === 200) {
                    if (Array.isArray(response.data.messages_sent)) {
                        setMessages([...response.data.messages_sent]);
                    } else {
                        console.log("No messages_sent found in response.");
                        setMessages([]); 
                    }
                } else {
                    console.error("Failed to fetch messages: ", response.status);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        } else {
            console.log("Chat ID is null.");
        }
    };
    
    const handleInputChange = (e) => setInput(e.target.value);

    const handleLogout = async () => {
        try {
            await axios.post(LOG_OUT_URL); 
            sessionStorage.clear();
            navigate(LOG_IN_URL, { state: { message: 'You have been logged out.' } });
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const goToAccount = async () => {
        try {
            navigate(USER_ACCOUNT_URL, { state: { username, id: userId } });
        } catch (error) {
            console.error("Error navigating to user account:", error);
        }
    };

    const handleSend = async () => {
        if (input.trim() && chatId && userId) {
            const userMessage = input.trim();
            setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
            setInput("");
            setIsBotTyping(true);
    
            try {
                // Store the message
                await axios.post(SEND_MESSAGE_URL, {
                    chat_id: chatId,
                    message: userMessage,
                    sender_id: userId
                });
    
                // Get both model replies
                const response = await axios.post(COMPARE_MODELS_URL, {
                    chat_id: chatId,
                    message: userMessage
                });
    
                if (response.status === 200) {
                    const { biomistral, meditron } = response.data;
    
                    setMessages(prev => [
                        ...prev,
                        { sender: "biomistral", text: biomistral || "No response from BioMistral." },
                        { sender: "meditron", text: meditron || "No response from Meditron." }
                    ]);
                }
            } catch (error) {
                console.error("Error sending message or getting responses:", error);
            } finally {
                setIsBotTyping(false);
            }
        }
    };    

    return (
        <div className="home-container">
            <header className="header">
                <button className="chat-history-button" onClick={toggleHistory}>
                    <FontAwesomeIcon icon={faHistory} />
                </button>
                <h1 className="home">hello, {username}!</h1>
                <button className="menu-button top-right-button" onClick={toggleMenu}>
                    <FontAwesomeIcon icon={faBars} />
                </button>
            </header>

            <div className={`chat-history ${isHistoryOpen ? "open" : ""}`} ref={historyRef}>
                <h2>Chat History</h2>
                {chatHistory.length > 0 ? (
                    chatHistory.map((chat, index) => (
                        <button className="chat-button" key={chat.chat_id} onClick={() => loadChat(chat.chat_id)}>
                            {chat.title || `Chat ${index + 1}`}
                        </button>
                    ))
                ) : (
                    <p>No previous chats</p>
                )}
            </div>

            <div className="chat-container">
                <div className="chat-messages">
                {(() => {
                    const rendered = [];
                    for (let i = 0; i < messages.length; i++) {
                    const msg = messages[i];

                    if (msg.sender === "biomistral" && messages[i + 1]?.sender === "meditron") {
                        rendered.push(
                        <div key={i} className="bot-response-pair">
                            <div className="chat-message biomistral">
                            <strong>BioMistral:</strong><br />
                            {msg.text}
                            </div>
                            <div className="chat-message meditron">
                            <strong>Meditron:</strong><br />
                            {messages[i + 1].text}
                            </div>
                        </div>
                        );
                        i++; 
                    } else if (
                        msg.sender === "meditron" &&
                        messages[i - 1]?.sender === "biomistral"
                    ) {
                        continue; 
                    } else {
                        rendered.push(
                        <div key={i} className={`chat-message ${msg.sender}`}>
                            <strong>{msg.sender === 'user' ? 'You' : msg.sender}:</strong><br />
                            {msg.text}
                        </div>
                        );
                    }
                    }

                    return rendered;
                })()}

                {isBotTyping && <div className="chat-message bot">medbear is typing...</div>}
            </div>

            <div className="chat-input-container">
            <button className="upload-button"  onClick={() => document.getElementById('file-upload').click()}>+</button>
            <input
                id="file-upload"
                type="file"
                style={{ display: "none" }}
                onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                    console.log("Selected file:", file.name);
                    // handle upload logic here
                }
                }}
            />
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="chat-input"
                />
                <button onClick={handleSend} className="send-button">
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </div>
        </div>

        <div ref={menuRef}
            className={`side-menu ${isMenuOpen ? "open" : ""}`}>
            <h2>Menu</h2>
            <div className="line"></div>
            <button className="account-button" onClick={goToAccount}>
                {`${username}'s Account`}
            </button>
            <button className="logout-button" onClick={handleLogout}>
                Log Out
            </button>
        </div>

        </div>
    );
};

export default Home;