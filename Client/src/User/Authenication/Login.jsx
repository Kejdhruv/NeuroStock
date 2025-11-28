import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setFormData({ firstName: '', lastName: '', email: '', password: '' });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error('Email and Password are required!');
      return false;
    }
    if (isSignUp && (!formData.firstName || !formData.lastName)) {
      toast.error('Please fill all sign up fields!');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await fetch(
        isSignUp ? 'http://localhost:3001/Auth/Signup' : 'http://localhost:3001/Auth/Login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: isSignUp
            ? JSON.stringify(formData)
            : JSON.stringify({ email: formData.email, password: formData.password }),
          credentials: 'include', // keeps cookies working if backend sends any
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success(isSignUp ? 'Sign up successful!' : 'Login successful!');
        setTimeout(() => navigate(`/Dashboard`), 1500);
      } else {
        toast.error(data.message || (isSignUp ? 'Sign up failed' : 'Invalid credentials'));
      }

    } catch (err) {
      toast.error('Something went wrong' , err );
    }
  };

  return (
    <div className="auth-container">
      <div className="background-image"></div>

      <div className="left-side">
        <div className="left-overlay">
          <h1>Neurostock</h1>
          <p>"Invest in knowledge. It pays the best interest."</p>
        </div>
      </div>

      <div className="right-side">
        <div className="right-overlay">
          <form className="form-box" onSubmit={handleSubmit}>
            <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>

            {isSignUp && (
              <>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />

            <button type="submit" className="Login-btn">
              {isSignUp ? 'Create Account' : 'Login'}
            </button>

            <button type="button" className="toggle-btn" onClick={toggleMode}>
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign up"}
            </button>
          </form>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar theme="colored" />
    </div>
  );
};

export default AuthPage;