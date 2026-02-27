import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="navbar">
      <div className="navInner">
        <Link to="/" className="brand">
          VideoLab
        </Link>

        <div className="navLinks">
          {token ? (
            <>
              <Link className="navLink" to="/admin">
                Admin
              </Link>
              <button className="btn btnSmall" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="navLink" to="/login">
                Login
              </Link>
              <Link className="navLink" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}