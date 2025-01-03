import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Protected(props) {
  const navigate = useNavigate();
  let Cmp = props.Cmp;

  useEffect(() => {
    const userInfo = localStorage.getItem("User-Info");
    // If not logged in, redirect to login page
    if (!userInfo) {
      navigate("/register");
    }
  }, [navigate]);

  return (
    <div>
      <Cmp /> {/* Render the component passed via props */}
    </div>
  );
}

export default Protected;
