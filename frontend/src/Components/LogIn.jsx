import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import React from "react";
import axios from "../api/axios";
import bear from "../Assets/medbear_fb.png";
import '../Stylesheets/LoginRegister.css';
import SplitPane from 'react-split-pane';
import laptopVideo from '../Assets/medbear_blink.mp4';
import phoneVideo from '../Assets/medbear_pfp_blink.mp4';


const LOGIN_REGEX = /^(?:[A-z][A-z0-9-_]{3,23}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const LOGIN_URL = "/log-in";
const HOME_URL = "/home";
const GOOGLE_LOGIN_URL = "/google-login";

const LogIn = () => {
    const loginRef = useRef();
    const errRef = useRef();

    const [login, setLogin] = useState("");
    const [validLogin, setValidLogin] = useState(false);
    const [loginFocus, setLoginFocus] = useState(false);

    const [pwd, setPwd] = useState("");
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);
    const [type, setPwdType] = useState('password');

    const [errMsg, setErrMsg] = useState("");
    const [success, setSuccess] = useState(false);

    const [isMobile, setIsMobile] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        loginRef.current.focus();
    }, []);

    useEffect(() => {
        const result = LOGIN_REGEX.test(login);
        setValidLogin(result);
    }, [login]);

    useEffect(() => {
        const result = PASSWORD_REGEX.test(pwd);
        setValidPwd(result);
    }, [pwd]);

    useEffect(() => {
        setErrMsg("");
    }, [login, pwd]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v1 = LOGIN_REGEX.test(login);
        const v2 = PASSWORD_REGEX.test(pwd);
        if (!v1 || !v2) {
            setErrMsg('Invalid input. Please check fields.');
            return;
        }

        try {
            const response = await axios.post(LOGIN_URL,
                JSON.stringify({ login, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            const username = response.data.username;
            setSuccess(true);
            setPwd('');
            sessionStorage.setItem('username', username);
            navigate(HOME_URL, { state: { username } });
        }
        catch (err) {
            if (!err.response) {
                setErrMsg("Network error. Please try again.");
            }
            else if (err.response?.status === 401) {
                setErrMsg("Invalid username or password.");
            }
            else {
                setErrMsg("Login failed.");
            }
            errRef.current.focus();
        }
    }

    const handleGoogleLogin = async (credentialResponse) => {
        if (!credentialResponse || !credentialResponse.credential) {
            setErrMsg("Google Login failed. No credentials received.");
            return;
        }

        try {
            const response = await axios.post(
                GOOGLE_LOGIN_URL,
                JSON.stringify({ credential: credentialResponse.credential }),
                { headers: { "Content-Type": "application/json" } }
            );

            console.log("Server Response:", response.data);
            const { username, email } = response.data;

            navigate("/home", { state: { username, email } });
        } catch (error) {
            console.error("Error during Google login:", error);
            setErrMsg("Google Login failed. Please try again.");
        }
    };

    const togglePwdVisibility = () => setPwdType(type === 'password' ? 'text' : 'password');

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize(); 
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <section className="form-page">
            <div className="left-side">
                <div className="top-left-text">medbear</div>
                <div className="top-left-subtext">Your virtual blood test assistant — to help you understand results, not to replace your doctor.</div>
                <div className="video-container">
                <video
                    src={laptopVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                />
                </div>
            </div>

            <section className="form-container">
                <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">
                    {errMsg}
                </p>
                <h1>Log In</h1>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="login">
                        Username or Email:
                        <span className={validLogin ? "valid" : "hide"}>
                            <FontAwesomeIcon icon={faCheck} />
                        </span>
                        <span className={validLogin || !login ? "hide" : "invalid"}>
                            <FontAwesomeIcon icon={faTimes} />
                        </span>
                    </label>
                    <br></br>
                    <input
                        type="text"
                        id="login"
                        ref={loginRef}
                        autoComplete="off"
                        onChange={(e) => setLogin(e.target.value)}
                        value={login}
                        required
                        aria-invalid={validLogin ? "false" : "true"}
                        aria-describedby="loginnote"
                        onFocus={() => setLoginFocus(true)}
                        onBlur={() => setLoginFocus(false)}
                    />
                    <p id="loginnote" className={loginFocus && login && !validLogin ? "instructions" : "offscreen"}>
                        <FontAwesomeIcon icon={faInfoCircle} />
                        Enter a valid username (4-24 characters) or a valid email address.
                    </p>

                    <label htmlFor="password">
                        Password:
                        <FontAwesomeIcon icon={faCheck} className={validPwd ? "valid" : "hide"} />
                        <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? "hide" : "invalid"} />
                    </label>
                    <div className="password-container">
                        <input
                            type={type}
                            id="password"
                            onChange={(e) => setPwd(e.target.value)}
                            value={pwd}
                            required
                            aria-invalid={validPwd ? "false" : "true"}
                            aria-describedby="pwdnote"
                            onFocus={() => setPwdFocus(true)}
                            onBlur={() => setPwdFocus(false)}
                        />
                        <button type="button" onClick={togglePwdVisibility} className="eye-button">
                            {type === 'password' ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                        <p id="pwdnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            8 to 24 characters.<br />
                            Must include uppercase and lowercase letters, a number, and a special character.<br />
                            Allowed special characters: ! @ # $ %
                        </p>
    
                    <button className="form-button" disabled={!validLogin || !validPwd}>Log In</button>
                </form>
    
                <p>
                    First time here? <br />
                    <span className="line">
                        <Link to="/sign-up">Create an account</Link>
                    </span>
                </p>
                    </section>
               
            </section>
               
    );    
};

export default LogIn;