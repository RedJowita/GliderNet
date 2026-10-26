import { useState } from "react";
import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from "firebase/auth";

import { auth } from "../firebase";

function Register() {
  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      username.trim() === "" ||
      email.trim() === "" ||
      password === "" ||
      confirmPassword === ""
    ) {
      alert("Please complete all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      await updateProfile(
        userCredential.user,
        {
          displayName: username.trim()
        }
      );

      // Sign out after registration.
      // User will log in from the Login page.
      await signOut(auth);

      alert(
        "Account created successfully!"
      );

      navigate("/login");

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {
        alert(
          "This email is already registered."
        );
      } else if (
        error.code ===
        "auth/invalid-email"
      ) {
        alert(
          "Please enter a valid email address."
        );
      } else if (
        error.code ===
        "auth/weak-password"
      ) {
        alert(
          "Password must be at least 6 characters."
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
          "Registration failed. Please try again."
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
          Create Account
        </h1>

        <p className="auth-subtitle">
          Join the Glide community
        </p>

        <form onSubmit={handleSubmit}>

          <div className="auth-form-group">

            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              disabled={loading}
            />

          </div>

          <div className="auth-form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
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

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              disabled={loading}
            />

          </div>

          <div className="auth-form-group">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Enter password again"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
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
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <p className="auth-switch">
          Already have an account?{" "}

          <Link to="/login">
            Log in
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Register;