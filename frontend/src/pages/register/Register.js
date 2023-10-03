import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./register.scss";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    password: "",
    role: "user", // Default role value
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8800/api/auth/register",
        inputs
      );

      if (response.status === 200) {
        navigate("/login");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Registration failed. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <p>
            Create an account Be a part of Extrovertism
          </p>
          <span>Do you have an account?</span>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>
        <div className="right">
          <h1>Register</h1>
          <form>
            <input
              type="text"
              placeholder="Name"
              name="name"
              onChange={handleChange}
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
            />
            {/* Dropdown input for selecting role */}
            <select
              name="role"
              onChange={handleChange}
              value={inputs.role}
            >
              <option value="">Select User</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {error && <div className="error">{error}</div>}
            <button onClick={handleClick}>Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
