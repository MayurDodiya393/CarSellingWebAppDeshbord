import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../UserStyleSheet/header.css";
import { Nav, NavDropdown, Navbar, Container } from "react-bootstrap";
import ProfilePopup from "./ProfilePopup"; // Import ProfilePopup component

function Header() {
  const [profileImage, setProfileImage] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false); // State for showing/hiding the popup
  const user = JSON.parse(localStorage.getItem("User-Info"));
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfileImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch the profile image from the API
  const fetchProfileImage = async () => {
    const { accessToken } = getTokens(); // Function to retrieve access token from local storage
    if (!accessToken) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/user/profile/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImage(
          data.profile_picture
            ? `http://127.0.0.1:8000${data.profile_picture}`
            : null
        );
      } else {
        console.error("Failed to fetch profile image");
      }
    } catch (error) {
      console.error("Error fetching profile image:", error);
    }
  };

  function getTokens() {
    const userInfo = localStorage.getItem("User-Info");
    if (userInfo) {
      try {
        const parsedInfo = JSON.parse(userInfo);
        return {
          accessToken: parsedInfo.access,
          refreshToken: parsedInfo.refresh,
        };
      } catch (error) {
        console.error("Error parsing User-Info from local storage:", error);
      }
    }
    return { accessToken: null, refreshToken: null };
  }

  function Logout() {
    localStorage.clear();
    navigate("/register");
  }

  // Toggle the visibility of the profile popup
  const openProfilePopup = () => {
    setShowProfilePopup(true);
  };

  const closeProfilePopup = () => {
    setShowProfilePopup(false);
  };

  return (
    <>
      <Navbar expand="lg" className="professional-header">
        <Container fluid>
          <NavLink className="navbar-brand no-hover" to="/">
            WheelTrade
          </NavLink>
          <Navbar.Toggle aria-controls="navbarNav" className="navbar-toggler">
            <span className="navbar-toggler-icon"></span>
          </Navbar.Toggle>
          <Navbar.Collapse id="navbarNav">
            <Nav className="ms-auto">
              {user ? (
                <>
                  <Nav.Item>
                    <NavLink className="nav-link" to="/">
                      Home
                    </NavLink>
                  </Nav.Item>
                  <Nav.Item>
                    <NavLink className="nav-link" to="/add-product">
                      Add Product
                    </NavLink>
                  </Nav.Item>
                  <Nav.Item>
                    <NavLink className="nav-link" to="/about">
                      About
                    </NavLink>
                  </Nav.Item>
                  <Nav.Item>
                    <NavLink className="nav-link" to="/update-product">
                      Update Product
                    </NavLink>
                  </Nav.Item>
                  <NavDropdown
                    title={
                      <span>
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="profile-img"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                              marginRight: "8px",
                            }}
                          />
                        ) : (
                          <span
                            role="img"
                            aria-label="profile-icon"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                              display: "inline-block",
                              backgroundColor: "#ddd",
                              textAlign: "center",
                              lineHeight: "30px",
                              fontSize: "18px",
                              marginRight: "8px",
                            }}
                          >
                            👤
                          </span>
                        )}
                        {user?.username || user?.user?.username || "User"}
                      </span>
                    }
                    id="user-dropdown"
                  >
                    <NavDropdown.Item onClick={Logout}>Logout</NavDropdown.Item>
                    <NavDropdown.Item onClick={openProfilePopup}>
                      Profile
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <Nav.Item>
                    <NavLink className="nav-link" to="/login">
                      Login
                    </NavLink>
                  </Nav.Item>
                  <Nav.Item>
                    <NavLink className="nav-link" to="/register">
                      Register
                    </NavLink>
                  </Nav.Item>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Conditionally render ProfilePopup based on showProfilePopup state */}
      {showProfilePopup && (
        <ProfilePopup show={showProfilePopup} closePopup={closeProfilePopup} />
      )}
    </>
  );
}

export default Header;
