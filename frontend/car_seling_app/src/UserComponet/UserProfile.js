/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useState } from 'react';

function UserProfile() {
  const [nickname, setNickname] = useState('');
  const [userId, setUserId] = useState('');
  const [darkTheme, setDarkTheme] = useState(false);

  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
  };

  const handleUserIdChange = (event) => {
    setUserId(event.target.value);
  };

  const handleDarkThemeChange = () => {
    setDarkTheme(!darkTheme);
  };

  const handleSubmit = () => {
    // Handle form submission here
    console.log('Nickname:', nickname);
    console.log('User ID:', userId);
    console.log('Dark Theme:', darkTheme);
  };

  return (
    <div className="popup">
      <div className="popup-content">
        <h2>My profile</h2>
        <button className="close-button">X</button>
        <div className="profile-image">
          <img src="placeholder.jpg" alt="Profile Image" />
          <button className="upload-button">Upload</button>
        </div>
        <div className="form-group">
          <label htmlFor="nickname">Nickname:</label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={handleNicknameChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="userId">User ID:</label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={handleUserIdChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="dark-theme">Dark theme:</label>
          <input
            type="checkbox"
            id="dark-theme"
            checked={darkTheme}
            onChange={handleDarkThemeChange}
          />
        </div>
        <div className="button-group">
          <button className="cancel-button" onClick={() => {
            // Close the popup
          }}>Cancel</button>
          <button className="save-button" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;