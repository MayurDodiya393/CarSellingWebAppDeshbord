import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../UserStyleSheet/ProfilePopup.css";
import Webcam from "react-webcam";

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

async function getNewAccessToken() {
  const { refreshToken } = getTokens();

  if (!refreshToken) {
    alert("Session expired. Please log in again.");
    return null;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      const userInfo = JSON.parse(localStorage.getItem("User-Info"));
      userInfo.access = data.access; // Update access token
      localStorage.setItem("User-Info", JSON.stringify(userInfo));
      return data.access;
    } else {
      alert("Session expired. Please log in again.");
      localStorage.clear();
      return null;
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    alert("Session expired. Please log in again.");
    return null;
  }
}

const ProfilePopup = ({ show, closePopup }) => {
  const [profileData, setProfileData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    profile_picture: "",
  });
  const [imageSrc, setImageSrc] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      fetchProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // const closePopup = () => {
  //   setShowPopup(false);
  //   navigate(); // Navigate back to the previous route
  // };

  // Rename this function to avoid conflict
  const handleClosePopup = () => {
    closePopup(); // Call the original closePopup prop
    navigate(); // Navigate back to the previous route
  };

  async function fetchProfileData() {
    const { accessToken } = getTokens();

    if (!accessToken) {
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/user/profile/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status === 401) {
        const newAccessToken = await getNewAccessToken();
        if (newAccessToken) {
          return fetchProfileData(); // Retry with new token
        } else {
          return;
        }
      }

      if (response.ok) {
        const data = await response.json();
        setProfileData({
          username: data.username || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          profile_picture: data.profile_picture || "",
        });
        setImageSrc(data.profile_picture);
      } else {
        console.error("Failed to fetch profile data:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTakePhoto = () => {
    if (cameraRef.current) {
      const imageSrc = cameraRef.current.getScreenshot();
      setImageSrc(imageSrc);

      // Convert base64 string to Blob with JPEG extension
      const byteString = atob(imageSrc.split(",")[1]);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const byteArray = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: "image/jpeg" });

      setSelectedFile(
        new File([blob], "profile_picture.jpg", { type: "image/jpeg" })
      );
    }
  };

  async function saveProfileData() {
    const { accessToken } = getTokens();

    if (!accessToken) {
      alert("Session expired. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("first_name", profileData.first_name);
    formData.append("last_name", profileData.last_name);
    formData.append("email", profileData.email);

    // Check if there's a file selected and append it correctly to FormData
    if (selectedFile) {
      formData.append("profile_picture", selectedFile);
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/user/profile/", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (response.ok) {
        alert("Profile updated successfully.");
        closePopup();
      } else {
        const errorText = await response.text();
        console.error("Failed to update profile:", errorText);
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  }

  if (!show) return null;

  return (
    <div className="popup-container">
      <div className="popup">
        <div className="popup-header">
          <h2>My Profile</h2>
          <button className="close-btn" onClick={handleClosePopup}>
            ✕
          </button>
        </div>

        {/* Profile Image Section */}
        <div className="profile-image">
          <div className="image-placeholder">
            {imageSrc ? (
              <img
                src={
                  selectedFile ? imageSrc : `http://127.0.0.1:8000/${imageSrc}`
                }
                alt="Profile Preview"
                className="profile-preview"
              />
            ) : (
              <span role="img" aria-label="placeholder">
                👤
              </span>
            )}
          </div>
          <div className="upload-container">
            <a
              href="#!"
              className="upload-link"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("fileInput").click();
              }}
            >
              Browse Photo
            </a>
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              className="file-input"
              onChange={handleFileChange}
            />
            {/* Camera Capture Section */}
            <button
              className="camera-btn"
              onClick={() => setShowCamera(!showCamera)}
            >
              {showCamera ? "Close Camera" : "Take Photo"}
            </button>
          </div>

          {showCamera && (
            <div className="camera-container">
              <Webcam
                audio={false}
                ref={cameraRef}
                screenshotFormat="image/jpeg"
                width="100%"
                videoConstraints={{
                  facingMode: "user",
                }}
              />
              <button onClick={handleTakePhoto} className="take-photo-btn">
                Take Photo
              </button>
            </div>
          )}
        </div>

        {/* Profile Form */}
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={profileData.username}
          disabled
        />
        <label htmlFor="first_name">First Name:</label>
        <input
          type="text"
          id="first_name"
          value={profileData.first_name}
          onChange={(e) =>
            setProfileData({ ...profileData, first_name: e.target.value })
          }
        />
        <label htmlFor="last_name">Last Name:</label>
        <input
          type="text"
          id="last_name"
          value={profileData.last_name}
          onChange={(e) =>
            setProfileData({ ...profileData, last_name: e.target.value })
          }
        />
        <label htmlFor="email">E-mail:</label>
        <input
          type="email"
          id="email"
          value={profileData.email}
          onChange={(e) =>
            setProfileData({ ...profileData, email: e.target.value })
          }
          disabled
        />

        <div className="popup-footer">
          <button className="cancel-btn" onClick={handleClosePopup}>
            Cancel
          </button>
          <button className="save-btn" onClick={saveProfileData}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopup;
