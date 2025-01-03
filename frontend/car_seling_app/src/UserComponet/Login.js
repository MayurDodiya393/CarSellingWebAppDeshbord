import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../UserStyleSheet/register.css";
import Header from "./Header";
import { Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); // Use email for login
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const userInfo = localStorage.getItem("User-Info");
    if (userInfo) {
      navigate("/add-product");
    }
  }, [navigate]);

  // Login.js (Frontend)
  async function login() {
    let item = { email, password }; // Payload includes email and password
    try {
      const result = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      const response = await result.json();

      if (result.status === 200 && response.access) {
        localStorage.setItem("User-Info", JSON.stringify(response));
        navigate("/add-product");
      } else {
        setErrorMessage(response.detail || "Invalid credentials");
      }
    } catch (error) {
      setErrorMessage("An error occurred during login.");
    }
  }

  return (
    <div>
      <Header />
      <div className="register-container">
        <div className="card register-card">
          <h2 className="card-title text-center">Login</h2>
          <div className="card-body">
          <label className="lbl-title-l-r">Enter Your Email :</label>
            <input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              className="form-control mb-3"
              onChange={(e) => setEmail(e.target.value)}
            />
          <label className="lbl-title-l-r">Enter Your Password :</label>
            <input
              type="password"
              placeholder="Enter Your Password"
              value={password}
              className="form-control mb-3"
              onChange={(e) => setPassword(e.target.value)}
            />
            {errorMessage && (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            )}
            <button
              className="btn btn-primary btn-block"
              onClick={login}
              style={{
                padding: "10px 3px",
                fontSize: "0.8rem",
              }}
            >
              Login
            </button>
            <p className="mt-3">
              Don't have an account?{" "}
              <Link to="/register" className="link-primary">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
