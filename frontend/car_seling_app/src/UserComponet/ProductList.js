import { useEffect, useState } from "react";
import Header from "./Header";
import "../UserStyleSheet/ProductList.css";
import "../UserStyleSheet/table-mobile-theme.css";
import "../UserStyleSheet/table-mobile.css";
import { Link } from "react-router-dom";

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

function ProductList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [showUpdateProduct, setShowUpdateProduct] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditClick = () => {
    setShowUpdateProduct(true);
  };

  async function fetchData() {
    setLoading(true);
    const { accessToken } = getTokens();

    if (!accessToken) {
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/cars/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status === 401) {
        const newAccessToken = await getNewAccessToken();
        if (newAccessToken) {
          return fetchData(); // Retry with new token
        } else {
          return;
        }
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteOperation(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    const { accessToken } = getTokens();
    if (!accessToken) {
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/cars/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status === 401) {
        const newAccessToken = await getNewAccessToken();
        if (newAccessToken) {
          return deleteOperation(id); // Retry with new token
        } else {
          return;
        }
      }

      if (response.ok) {
        alert("Product deleted successfully");
        fetchData(); // Refresh the product list
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }

  async function search(key) {
    setSearchKey(key);
    const { accessToken } = getTokens();
    if (!accessToken) {
      alert("Session expired. Please log in again.");
      return;
    }

    if (key.trim() === "") {
      fetchData();
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/searchProduct/?query=${key}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.status === 401) {
        const newAccessToken = await getNewAccessToken();
        if (newAccessToken) {
          return search(key); // Retry with new token
        } else {
          return;
        }
      }

      const result = await response.json();
      if (result && Array.isArray(result)) {
        setData(result);
      } else {
        console.error("Unexpected response format:", result);
      }
    } catch (error) {
      console.error("Error searching product:", error);
    }
  }

  async function downloadInvoice(id) {
    const { accessToken } = getTokens();
    if (!accessToken) {
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/generate_invoice/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const pdfBlob = await response.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const newTab = window.open(pdfUrl, "_blank");
        if (newTab) {
          newTab.focus();
        } else {
          alert("Please enable pop-ups for this site.");
        }
      } else {
        alert("Failed to generate invoice.");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("An error occurred while generating the invoice.");
    }
  }

  useEffect(() => {
    const tableSelector = "table.table-mobile";
    const tableLabels = [];
  
    // Get the table labels (column names)
    document.querySelectorAll(`${tableSelector} thead th`).forEach((el, i) => {
      tableLabels.push(el.innerText);
      document
        .querySelectorAll(`${tableSelector} tbody td:nth-child(${i + 1})`)
        .forEach((el) => el.setAttribute("data-label", tableLabels[i]));
    });
  
    // Compute the index of the first row for the current page
    const indexOfFirstRow = (currentPage - 1) * rowsPerPage;
  
    // Update the first column to show index and product name
    const rows = document.querySelectorAll(`${tableSelector} tbody tr`);
    rows.forEach((row, index) => {
      const productNameCell = row.querySelector("td:nth-child(2)"); // Product Name cell (second column)
      const indexCell = row.querySelector("td:nth-child(1)"); // Index cell (first column)
  
      if (productNameCell && indexCell) {
        const productName = productNameCell.innerText;
        indexCell.innerText = `${indexOfFirstRow + index + 1} - ${productName}`; // Concatenate the index and product name
      }
    });
  
    // Attach click event to rows when the component loads or re-renders
    rows.forEach((row) => {
      row.removeEventListener("click", handleRowClick);
      row.addEventListener("click", handleRowClick);
    });
  
    function handleRowClick(e) {
      if (window.matchMedia("(max-width: 38rem)").matches) {
        e.currentTarget.classList.toggle("open");
      }
    }
  
    // Cleanup the event listeners to avoid memory leaks
    return () => {
      rows.forEach((row) => {
        row.removeEventListener("click", handleRowClick);
      });
    };
  }, [data, currentPage, rowsPerPage]); // Added rowsPerPage to dependencies
  
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <Header />
      <div className="product-list-container">
        <h1 className="product-list-title">Product List</h1>
        <input
          type="text"
          className="search-input"
          placeholder="Search by Product Name"
          value={searchKey}
          onChange={(e) => search(e.target.value)}
        />

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <div className="table-responsive">
            <table className="table-mobile table-mobile-theme" width="100%">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Car Name</th>
                  <th>Car Image</th>
                  <th>Car Company</th>
                  <th>Model</th>
                  <th>Registration Number</th>
                  <th>Chassis Number</th>
                  <th>Engine Number</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((item, index) => (
                    <tr key={index}>
                      <td>{indexOfFirstRow + index + 1  }</td>
                      <td>{item.car_name}</td>
                      <td className="cccc">
                        <img
                          src={"http://127.0.0.1:8000" + item.car_image}
                          alt={item.car_name}
                          className="product-image"
                        />
                      </td>
                      <td>{item.car_company}</td>
                      <td>{item.manufacture_year}</td>
                      <td>{item.registration_number}</td>
                      <td>{item.chassis_number}</td>
                      <td>{item.engine_number}</td>
                      <td>₹{item.price}</td>
                      <td>
                        <p
                          style={{
                            textAlign: "center",
                            fontSize: "1.5rem",
                          }}
                        >
                          {item.is_available ? "✅" : "❌"}
                        </p>
                      </td>
                      <td>
                        <Link to={`update-product/${item.id}`}>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEditClick()}
                          >
                            Edit
                          </button>
                        </Link>
                        <button
                          className="btn btn-sm btn-danger ml-2"
                          onClick={() => deleteOperation(item.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="btn btn-sm btn-info ml-2"
                          onClick={() => downloadInvoice(item.id)}
                        >
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center">
                      No Products Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="pagination-container">
              <ul className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                    onClick={() => paginate(index + 1)}
                  >
                    <button className="page-link">{index + 1}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;
