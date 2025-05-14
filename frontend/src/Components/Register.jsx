import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import React from "react";
import axios from "../api/axios";
import '../Stylesheets/LoginRegister.css';
import laptopVideo from '../Assets/medbear_blink.mp4';

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const REGISTER_URL = "/sign-up";

const Register = () => {
  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState("");
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [confirmPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [pwdType, setPwdType] = useState("password");
  const [confirmPwdType, setConfirmPwdType] = useState("password");

  const [gdprConsent, setGdprConsent] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    const result = USER_REGEX.test(user);
    setValidName(result);
  }, [user]);

  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    setValidEmail(result);
  }, [email]);

  useEffect(() => {
    const result = PASSWORD_REGEX.test(pwd);
    setValidPwd(result);
    const match = pwd === confirmPwd;
    setValidMatch(match);
  }, [pwd, confirmPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [user, email, pwd, confirmPwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v1 = USER_REGEX.test(user);
    const v2 = EMAIL_REGEX.test(email);
    const v3 = PASSWORD_REGEX.test(pwd);
    if (!v1 || !v2 || !v3) {
      setErrMsg("Invalid input. Please check fields.");
      return;
    }

    try {
      const response = await axios.post(
        REGISTER_URL,
        JSON.stringify({ user, email, pwd }),
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(response.data);
      setSuccess(true);
      setUser("");
      setEmail("");
      setPwd("");
      setMatchPwd("");
      navigate("/log-in");
    } catch (err) {
      if (!err.response) {
        console.error(err);
        setErrMsg("Network error. Please try again.");
      } else if (err.response?.status === 409) {
        setErrMsg("Username or email already exists.");
      } else {
        setErrMsg("Registration failed.");
      }
      errRef.current.focus();
    }
  };

  const togglePwdVisibility = () => setPwdType(pwdType === "password" ? "text" : "password");
  const toggleConfirmPwdVisibility = () =>
    setConfirmPwdType(confirmPwdType === "password" ? "text" : "password");

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

      
      <section className="register-form-container">
        <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">
          {errMsg}
        </p>
          <h1>Sign Up</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">
              Username:
              <span className={validName ? "valid" : "hide"}>
                <FontAwesomeIcon icon={faCheck} />
              </span>
              <span className={validName || !user ? "hide" : "invalid"}>
                <FontAwesomeIcon icon={faTimes} />
              </span>
            </label>
            <input
              type="text"
              id="username"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setUser(e.target.value)}
              required
              aria-invalid={validName ? "false" : "true"}
              aria-describedby="uidnote"
              onFocus={() => setUserFocus(true)}
              onBlur={() => setUserFocus(false)}
            />
            <p id="uidnote" className={userFocus && user && !validName ? "instructions" : "offscreen"}>
              <FontAwesomeIcon icon={faInfoCircle} />
              4 to 24 characters. <br />
              Must begin with a letter. <br />
              Letters, numbers, underscores, hyphens allowed.
            </p>

            <label htmlFor="email">
              Email:
              <span className={validEmail ? "valid" : "hide"}>
                <FontAwesomeIcon icon={faCheck} />
              </span>
              <span className={validEmail || !email ? "hide" : "invalid"}>
                <FontAwesomeIcon icon={faTimes} />
              </span>
            </label>
            <input
              type="email"
              id="email"
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              aria-invalid={validEmail ? "false" : "true"}
              aria-describedby="emailnote"
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
            />
            <p id="emailnote" className={emailFocus && email && !validEmail ? "instructions" : "offscreen"}>
              <FontAwesomeIcon icon={faInfoCircle} />
              Please enter a valid email address.
            </p>

            <label htmlFor="password">
              Password:
              <FontAwesomeIcon icon={faCheck} className={validPwd ? "valid" : "hide"} />
              <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? "hide" : "invalid"} />
            </label>
            <div className="password-container">
              <input
                type={pwdType}
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
                {pwdType === "password" ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            <p id="pwdnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
              <FontAwesomeIcon icon={faInfoCircle} />
              8 to 24 characters.<br />
              Must include uppercase and lowercase letters, a number, and a special character.<br />
              Allowed special characters: ! @ # $ %
            </p>

            <label htmlFor="confirm_pwd">
              Confirm Password:
              <FontAwesomeIcon icon={faCheck} className={validMatch && confirmPwd ? "valid" : "hide"} />
              <FontAwesomeIcon icon={faTimes} className={validMatch || !confirmPwd ? "hide" : "invalid"} />
            </label>
            <div className="password-container">
              <input
                type={confirmPwdType}
                id="confirm_pwd"
                onChange={(e) => setMatchPwd(e.target.value)}
                value={confirmPwd}
                required
                aria-invalid={validMatch ? "false" : "true"}
                aria-describedby="confirmnote"
                onFocus={() => setMatchFocus(true)}
                onBlur={() => setMatchFocus(false)}
              />
              <button type="button" onClick={toggleConfirmPwdVisibility} className="eye-button">
                {confirmPwdType === "password" ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
              <FontAwesomeIcon icon={faInfoCircle} />
              Must match the first password input field.
            </p>

            <div>
              <input
                type="checkbox"
                id="gdpr"
                onChange={(e) => setGdprConsent(e.target.checked)}
              />
              <label htmlFor="gdpr">I agree to the GDPR terms and conditions.</label>
            </div>

            <button disabled={!validName || !validEmail || !validPwd || !validMatch || !gdprConsent}
              className="form-button">
              Sign Up
            </button>
          </form>

          <p>
            Already have an account? <br />
            <span className="line">
              <Link to="/log-in">Log In</Link>
            </span>
          </p>
      </section>
      
    </section>
  );
};

export default Register;