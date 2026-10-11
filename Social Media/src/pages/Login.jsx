import { useState } from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  signInWithEmailAndPassword
} from "firebase/auth";

import { auth } from "../firebase";

function Login() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      email.trim() === "" ||
      password === ""
    ) {
      alert("Please complete all fields.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      navigate("/");

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      if (
        error.code ===
        "auth/invalid-credential"
      ) {
        alert(
          "Incorrect email or password."
        );
      } else if (
        error.code ===
        "auth/invalid-email"
      ) {
        alert(
          "Please enter a valid email."
        );
      } else if (
        error.code ===
        "auth/too-many-requests"
      ) {
        alert(
          "Too many attempts. Try again later."
        );
      } else if (
        error.code ===
        "auth/network-request-failed"
      ) {
        alert(
          "Network error. Check your internet connection."
        );
      } else {
        alert(
          "Login failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <Link
        to="/"
        className="auth-logo"
      >
        <div className="brand-logo">
          G
        </div>

        <span>Glide</span>
      </Link>

      <div className="auth-card">

        <h1>
          Welcome back
        </h1>

        <p className="auth-subtitle">
          Log in to continue to Glide
        </p>

        <form onSubmit={handleSubmit}>

          <div className="auth-form-group">

            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              disabled={loading}
            />

          </div>

          <div className="auth-form-group">

            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              disabled={loading}
            />

          </div>

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Log In"}
          </button>

        </form>

        <p className="auth-switch">
          New to Glide?{" "}

          <Link to="/register">
            Create an account
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;