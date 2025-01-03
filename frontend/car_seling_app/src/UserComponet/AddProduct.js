import { useState } from "react";
import Header from "./Header";
import "../UserStyleSheet/AddProduct.css"; // Import the external CSS

function AddProduct() {
  const [name, setName] = useState("");
  const [carImage, setCarImage] = useState(null); // Image state for storing file
  const [price, setPrice] = useState("");
  const [manufactureYear, setManufactureYear] = useState("");
  const [carCompany, setCarCompany] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [engineNumber, setEngineNumber] = useState("");

  // Function to parse and retrieve tokens from local storage
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

  // Function to refresh access token
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
        userInfo.access = data.access; // Update the access token
        localStorage.setItem("User-Info", JSON.stringify(userInfo));
        return data.access;
      } else {
        alert("Session expired. Please log in again.");
        localStorage.clear(); // Clear tokens if refresh fails
        return null;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      alert("Session expired. Please log in again.");
      return null;
    }
  }

  async function addProduct() {
    const { accessToken } = getTokens();
    console.warn("Access Token:", accessToken);

    if (!accessToken) {
      alert("Session expired. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("car_name", name);
    formData.append("car_company", carCompany);
    formData.append("price", price);
    formData.append("manufacture_year", manufactureYear);
    formData.append("is_available", isAvailable);
    formData.append("registration_number", registrationNumber);
    formData.append("chassis_number", chassisNumber);
    formData.append("engine_number", engineNumber);
    if (carImage) {
      formData.append("car_image", carImage);
    }

    const url = "http://127.0.0.1:8000/api/cars/";

    try {
      let result = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (result.status === 401) {
        const errorData = await result.json();
        if (errorData.code === "token_not_valid") {
          const newAccessToken = await getNewAccessToken();
          if (newAccessToken) {
            result = await fetch(url, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
              },
              body: formData,
            });
          } else {
            return; // Stop if refresh fails
          }
        }
      }

      if (result.ok) {
        alert("Car added successfully!");
        setName("");
        setCarImage(null);
        setPrice("");
        setManufactureYear("");
        setCarCompany("");
        setRegistrationNumber("");
        setChassisNumber("");
        setEngineNumber("");
        setIsAvailable(true);
      } else {
        const errorData = await result.json();
        alert(
          `Failed to add car. Error: ${errorData.detail || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error adding car:", error);
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <div>
      <Header />
      <div className="add-product-container">
        <h1 className="page-title">Add New Car</h1>
        <div className="form-card">

        <label className="lbl-title">Enter Car Name :</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Car Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="lbl-title">Enter Car Company :</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Car Company"
            value={carCompany}
            onChange={(e) => setCarCompany(e.target.value)}
          />

          <label className="lbl-title">Enter Registration Number :</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Registration Number"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
          />

          <label className="lbl-title">Enter Chassis Number :</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Chassis Number"
            value={chassisNumber}
            onChange={(e) => setChassisNumber(e.target.value)}
          />

          <label className="lbl-title">Enter Engine Number :</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Engine Number"
            value={engineNumber}
            onChange={(e) => setEngineNumber(e.target.value)}
          />

          <label className="lbl-title">Enter Car Price :</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter Car Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          
          <label className="lbl-title">Enter Manufacture Year :</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter Manufacture Year"
            value={manufactureYear}
            onChange={(e) => setManufactureYear(e.target.value)}
          />

          <input
            type="file"
            className="form-control"
            onChange={(e) => setCarImage(e.target.files[0])}
          />
          
          <label>
            Is Available:
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={() => setIsAvailable(!isAvailable)}
              style={{
                margin : '0px'
              }}
            />
          </label>
          <button className="btn-submit" onClick={addProduct}>
            Add Car
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
