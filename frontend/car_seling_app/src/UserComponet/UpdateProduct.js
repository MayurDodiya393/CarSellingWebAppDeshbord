import { useEffect, useState } from "react";
import Header from "./Header";
import { useParams, useNavigate } from "react-router-dom";
import "../UserStyleSheet/UpdateProduct.css";

function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    car_name: "",
    car_company: "",
    price: "",
    manufacture_year: "",
    registrationNumber: "",
    chassisNumber: "",
    engineNumber: "",
    is_available: true,
    car_image: null,
  });
  // eslint-disable-next-line no-unused-vars
  const [oldImage, setOldImage] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { accessToken } = getTokens();

      if (!accessToken) {
        alert("Session expired. Please log in again.");
        return;
      }

      try {
        const url = `http://127.0.0.1:8000/api/cars/${id}/`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.status === 401) {
          const newAccessToken = await getNewAccessToken();
          if (newAccessToken) {
            return fetchData();
          } else {
            return;
          }
        }

        if (!response.ok) {
          throw new Error("Product not found.");
        }

        const product = await response.json();
        setFormData({
          car_name: product.car_name || "",
          car_company: product.car_company || "",
          price: product.price || "",
          manufacture_year: product.manufacture_year || "",
          registration_number: product.registration_number || "",
          chassis_number: product.chassis_number || "",
          engine_number: product.engine_number || "",
          is_available: product.is_available || true,
          car_image: null, // For new uploads
          old_car_image: product.car_image || "", // Store the old image URL
        });
      } catch (error) {
        console.error("Error fetching product data:", error);
        setError("Error fetching product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, car_image: e.target.files[0] }));
  };

  const handleCheckboxChange = () => {
    setFormData((prev) => ({ ...prev, is_available: !prev.is_available }));
  };

  const handleUpdateProduct = async () => {
    const url = `http://127.0.0.1:8000/api/cars/${id}/`;
    const { accessToken } = getTokens();

    if (!accessToken) {
      alert("Session expired. Please log in again.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("car_name", formData.car_name);
    formDataToSend.append("car_company", formData.car_company);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("manufacture_year", formData.manufacture_year);
    formDataToSend.append("registration_number", formData.registration_number);
    formDataToSend.append("chassis_number", formData.chassis_number);
    formDataToSend.append("engine_number", formData.engine_number);
    formDataToSend.append("is_available", formData.is_available);
    if (formData.car_image) {
      formDataToSend.append("car_image", formData.car_image);
    }

    try {
      const response = await fetch(url, {
        method: "PATCH",
        body: formDataToSend,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        const newAccessToken = await getNewAccessToken();
        if (newAccessToken) {
          return handleUpdateProduct();
        } else {
          return;
        }
      }

      if (response.ok) {
        setSuccessMessage("Car updated successfully!");
        navigate("/");
      } else {
        throw new Error("Failed to update car.");
      }
    } catch (error) {
      console.error("Error updating car:", error);
      setError("Failed to update car. Please try again.");
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading-container">
          <h2>Loading product details...</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="update-product-container">
        <h1 className="page-title">Update Car</h1>
        <div className="form-card">
          {error && <div className="alert alert-danger">{error}</div>}
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}

          <label className="lbl-title">Enter Car Name :</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Car Name"
            name="car_name"
            value={formData.car_name}
            onChange={handleInputChange}
          />
          <label className="lbl-title">Enter Car Company :</label>

          <input
            type="text"
            className="form-control"
            placeholder="Enter Car Company"
            name="car_company"
            value={formData.car_company}
            onChange={handleInputChange}
          />
          <label className="lbl-title">Enter Car Price :</label>

          <input
            type="number"
            className="form-control"
            placeholder="Enter Car Price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
          />
          <label className="lbl-title">Enter Manufacture Year :</label>

          <input
            type="number"
            className="form-control"
            placeholder="Enter Manufacture Year"
            name="manufacture_year"
            value={formData.manufacture_year}
            onChange={handleInputChange}
          />
          <label className="lbl-title">Enter Registration Number :</label>

          <input
            type="text"
            className="form-control"
            placeholder="Enter Registration Number"
            name="registration_number"
            value={formData.registration_number}
            onChange={handleInputChange}
          />
          <label className="lbl-title">Enter Chassis Number :</label>

          <input
            type="text"
            className="form-control"
            placeholder="Enter Chassis Number"
            name="chassis_number"
            value={formData.chassis_number}
            onChange={handleInputChange}
          />
          <label className="lbl-title">Enter Engine Number :</label>

          <input
            type="text"
            className="form-control"
            placeholder="Enter Engine Number"
            name="engine_number"
            value={formData.engine_number}
            onChange={handleInputChange}
          />

          <div className="img-box">
            {/* Show old image if it exists */}
            {formData.old_car_image && (
              <div className="old-image-container">
                <img
                  src={`http://127.0.0.1:8000/${formData.old_car_image}`}
                  alt="Old Car"
                  className="old-car-image"
                />
              </div>
            )}

            <input
              type="file"
              className="form-control"
              onChange={handleFileChange}
            />
          </div>

          <label>
            Is Available:
            <input
              type="checkbox"
              checked={formData.is_available}
              onChange={handleCheckboxChange}
              style={{
                margin : '0px',
              }}
            />
          </label>

          <button className="btn-submit" onClick={handleUpdateProduct}>
            Update Car
          </button>
        </div>
      </div>
    </div>
  );
}

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
      userInfo.access = data.access;
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

export default UpdateProduct;
