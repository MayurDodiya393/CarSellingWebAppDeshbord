import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../UserStyleSheet/register.css";
import Header from "./Header";
import { Link } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for sending/resending OTP
  const [resendTimer, setResendTimer] = useState(60); // Countdown timer
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("User-Info");
    if (userInfo) {
      navigate("/add-product");
    }
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0 && otpSent) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, otpSent]);

  async function sendOtp() {
    if (!email) {
      setErrorMessage("Email is required to send OTP.");
      return;
    }
    setLoading(true); // Start loading
    try {
      const result = await fetch("http://127.0.0.1:8000/api/send-otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const response = await result.json();
      if (result.status === 200) {
        setOtpSent(true);
        setResendTimer(60); // Reset timer
        setErrorMessage(""); // Clear any previous errors
      } else {
        setErrorMessage(response.message || "Error sending OTP");
      }
    } catch (error) {
      setErrorMessage("An error occurred while sending OTP.");
    } finally {
      setLoading(false); // Stop loading
    }
  }

  async function signUp() {
    if (!email || !username || !password || !otp) {
      setErrorMessage("All fields, including OTP, are required.");
      return;
    }
    try {
      const result = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, otp }),
      });
      const response = await result.json();
      if (result.status === 201) {
        localStorage.setItem("User-Info", JSON.stringify(response));
        navigate("/add-product");
      } else {
        setErrorMessage(response.error || "Registration failed");
      }
    } catch (error) {
      setErrorMessage("An error occurred during registration.");
    }
  }

  return (
    <>
      <Header />
      <div className="register-container">
        <div className="card register-card">
          <h2 className="card-title text-center">Sign Up</h2>
          <div className="card-body">
          <label className="lbl-title-l-r">Enter Your Email :</label>

            <input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              className="form-control mb-3"
              onChange={(e) => setEmail(e.target.value)}
            />
          <label className="lbl-title-l-r">Enter Your Username :</label>

            <input
              type="text"
              placeholder="Enter Your Username"
              value={username}
              className="form-control mb-3"
              onChange={(e) => setUsername(e.target.value)}
            />
          <label className="lbl-title-l-r">Enter Your Password :</label>
            <input
              type="password"
              placeholder="Enter Your Password"
              value={password}
              className="form-control mb-3"
              onChange={(e) => setPassword(e.target.value)}
            />
            {otpSent && (
              <div
                className="otp-section"
                style={{
                  display: "flex",
                }}
              >
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  className="form-control mb-3"
                  onChange={(e) => setOtp(e.target.value)}
                />
                <span
                  className="timer"
                  style={{
                    marginLeft: "11px",
                  }}
                >{`Resend in ${resendTimer}s`}</span>
              </div>
            )}
            {!otpSent && (
              <button
                className="btn btn-primary btn-block"
                onClick={sendOtp}
                disabled={loading}
                style={{ padding: "10px 3px", fontSize: "0.8rem" }}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {otpSent && resendTimer === 0 && (
                <button
                  className="btn btn-secondary"
                  onClick={sendOtp}
                  disabled={loading}
                  style={{
                    padding: "8px 19px",
                    fontSize: "0.8rem",
                    marginRight: "10px",
                    flex: "1", // Ensure proper spacing
                    maxWidth: "150px", // Optional for width control
                  }}
                >
                  {loading ? "Resending OTP..." : "Resend OTP"}
                </button>
              )}
              {otpSent && (
                <button
                  className="btn btn-primary"
                  onClick={signUp}
                  style={{
                    fontSize: "0.8rem",
                    flex: "1",
                    padding: "8px 19px",
                  }}
                >
                  Complete Registration
                </button>
              )}
            </div>

            {errorMessage && (
              <div className="alert alert-danger mt-3" role="alert">
                {errorMessage}
              </div>
            )}
            <p className="mt-3">
              Already have an account?{" "}
              <Link to="/login" className="link-primary">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
