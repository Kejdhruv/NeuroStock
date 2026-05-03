import React, { useState } from "react";
import "./Login.Css";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ArcTransactionGlobe from "../../Components/Login/Globe";

const LoginPage = () => {
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setFormData({ firstName: "", lastName: "", email: "", password: "" });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error("Email and Password are required!");
      return false;
    }
    if (isSignUp && (!formData.firstName || !formData.lastName)) {
      toast.error("Please fill all sign up fields!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch(
        isSignUp
          ? "http://localhost:3001/Auth/Signup"
          : "http://localhost:3001/Auth/Login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: isSignUp
            ? JSON.stringify(formData)
            : JSON.stringify({
                email: formData.email,
                password: formData.password,
              }),
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success(isSignUp ? "Sign up successful!" : "Login successful!");
        localStorage.setItem("isLoggedIn", "true");
        setTimeout(() => navigate(`/Dashboard`), 1500);
      } else {
        toast.error(data.message || "Authentication failed");
      }
    } catch (err) {
      toast.error("Something went wrong" , err );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="ambient-glow" />

      {/* LEFT SIDE (FORM) */}
      <section className="login-left">
        <div className="login-box">
          <header className="login-header">
            <span className="system-status">SYSTEM ONLINE</span>
            <h1>{isSignUp ? "CREATE ACCOUNT" : "WELCOME BACK"}</h1>
            <p>
              {isSignUp
                ? "Initialize your NeuroStock account"
                : "Access your NeuroStock dashboard"}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="login-form">
            {isSignUp && (
              <>
                <div className="input-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            <div className="input-group">
              <label>Identification</label>
              <input
                type="email"
                name="email"
                placeholder="email@neurostock.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Security Key</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className={`login-button ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading
                  ? "PROCESSING..."
                  : isSignUp
                  ? "CREATE ACCOUNT"
                  : "AUTHORIZE"}
              </button>

              <button
                type="button"
                className="toggle-btn"
                onClick={toggleMode}
              >
                {isSignUp
                  ? "Already have an account? Login"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>

          <footer className="login-footer">
            <p>Secured with Blockchain Authentication</p>
          </footer>
        </div>
      </section>

      {/* RIGHT SIDE (VISUAL) */}
      <section className="login-right">
        <div className="dark-core-container">
          <ArcTransactionGlobe/>
          <div className="scanline" />
          <div className="core-text">
            <div className="badge">NEUROSTOCK v1.0</div>
            <h2>NEUROSTOCK</h2>
            <div className="divider" />
            <p>
              "Trade smarter.<br /> Invest better."
            </p>
          </div>
        </div>
      </section>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        theme="colored"
      />
    </div>
  );
};

export default LoginPage;