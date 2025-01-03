import { Link } from "react-router-dom"; // Import Link for navigation

function PageNotFound() {
  const pageNotFoundStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f8f9fa",
    color: "#333",
    fontFamily: "'Arial', sans-serif",
    textAlign: "center",
  };

  const headingStyle = {
    fontSize: "4rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  };

  const paragraphStyle = {
    fontSize: "1.2rem",
    marginBottom: "2rem",
  };

  const linkStyle = {
    fontSize: "1rem",
    color: "#007bff", // Default link blue color
    textDecoration: "underline", // Underline to indicate a link
    cursor: "pointer",
  };

  return (
    <div>
      <div style={pageNotFoundStyle}>
        <h1 style={headingStyle}>404</h1>
        <p style={paragraphStyle}>The page you are looking for does not exist.</p>
        <Link to="/" style={linkStyle}>
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

export default PageNotFound;
