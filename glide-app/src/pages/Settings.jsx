import {
  useState,
  useEffect
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  updateProfile,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged
} from "firebase/auth";

import {
  auth
} from "../firebase";

import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";


function Settings() {

  const [user, setUser] =
    useState(null);

  const [displayName, setDisplayName] =
    useState("");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const navigate =
    useNavigate();


  // ==================================
  // AUTH STATE
  // ==================================

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(

        auth,

        (currentUser) => {

          if (currentUser) {

            setUser(
              currentUser
            );

            setDisplayName(
              currentUser.displayName || ""
            );

          } else {

            navigate(
              "/login"
            );

          }

        }

      );


    return () =>
      unsubscribe();

  }, [navigate]);


  // ==================================
  // UPDATE PROFILE
  // ==================================

  const handleUpdateProfile =
    async (e) => {

      e.preventDefault();

      if (!displayName.trim()) {

        alert(
          "Display name cannot be empty."
        );

        return;

      }

      try {

        setLoading(
          true
        );

        await updateProfile(
          auth.currentUser,
          {
            displayName:
              displayName.trim()
          }
        );

        alert(
          "Profile updated successfully!"
        );

      } catch (error) {

        console.error(
          "Update profile error:",
          error
        );

        alert(
          "Could not update profile."
        );

      } finally {

        setLoading(
          false
        );

      }

    };


  // ==================================
  // UPDATE PASSWORD
  // ==================================

  const handleUpdatePassword =
    async (e) => {

      e.preventDefault();

      if (!newPassword || newPassword.length < 6) {

        alert(
          "New password must be at least 6 characters."
        );

        return;

      }

      if (!currentPassword) {

        alert(
          "Please enter your current password to confirm changes."
        );

        return;

      }

      try {

        setLoading(
          true
        );

        const credential =
          EmailAuthProvider.credential(
            user.email,
            currentPassword
          );

        await reauthenticateWithCredential(
          auth.currentUser,
          credential
        );

        await updatePassword(
          auth.currentUser,
          newPassword
        );

        alert(
          "Password updated successfully!"
        );

        setCurrentPassword(
          ""
        );

        setNewPassword(
          ""
        );

      } catch (error) {

        console.error(
          "Update password error:",
          error
        );

        alert(
          "Incorrect current password or update failed."
        );

      } finally {

        setLoading(
          false
        );

      }

    };


  // ==================================
  // DELETE ACCOUNT
  // ==================================

  const handleDeleteAccount =
    async () => {

      const confirmed =
        window.confirm(
          "Are you sure you want to delete your Glide account? This action is permanent."
        );

      if (!confirmed) {
        return;
      }

      const passwordConfirm =
        prompt(
          "Please enter your password to confirm account deletion:"
        );

      if (!passwordConfirm) {
        return;
      }

      try {

        setLoading(
          true
        );

        const credential =
          EmailAuthProvider.credential(
            user.email,
            passwordConfirm
          );

        await reauthenticateWithCredential(
          auth.currentUser,
          credential
        );

        await deleteUser(
          auth.currentUser
        );

        alert(
          "Your account has been deleted."
        );

        navigate(
          "/register"
        );

      } catch (error) {

        console.error(
          "Delete account error:",
          error
        );

        alert(
          "Incorrect password or deletion failed."
        );

      } finally {

        setLoading(
          false
        );

      }

    };


  // ==================================
  // PAGE
  // ==================================

  return (

    <div className="app">


      {/* NAVBAR */}

      <Navbar />


      <main className="home-layout">


        {/* LEFT SIDEBAR */}

        <LeftSidebar />


        {/* MAIN FEED / SETTINGS */}

        <section className="feed">


          <div className="feed-heading">

            <h2>
              Account Settings
            </h2>

            <span className="page-description">
              Manage your Glide profile and security
            </span>

          </div>


          {/* PROFILE CARD */}

          <div className="settings-card">

            <h3>
              Profile Information
            </h3>

            <form
              onSubmit={
                handleUpdateProfile
              }
            >

              <div className="auth-form-group">

                <label>
                  Username / Display Name
                </label>


                <input
                  type="text"
                  value={
                    displayName
                  }
                  onChange={(e) =>
                    setDisplayName(
                      e.target.value
                    )
                  }
                  disabled={
                    loading
                  }
                />

              </div>


              <button
                type="submit"
                className="settings-submit-btn"
                disabled={
                  loading
                }
              >
                Save Profile
              </button>

            </form>

          </div>


          {/* PASSWORD CARD */}

          <div className="settings-card">

            <h3>
              Change Password
            </h3>

            <form
              onSubmit={
                handleUpdatePassword
              }
            >

              <div className="auth-form-group">

                <label>
                  Current Password
                </label>


                <input
                  type="password"
                  value={
                    currentPassword
                  }
                  onChange={(e) =>
                    setCurrentPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter current password"
                  disabled={
                    loading
                  }
                />

              </div>


              <div className="auth-form-group">

                <label>
                  New Password
                </label>


                <input
                  type="password"
                  value={
                    newPassword
                  }
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter new password (min 6 chars)"
                  disabled={
                    loading
                  }
                />

              </div>


              <button
                type="submit"
                className="settings-submit-btn"
                disabled={
                  loading
                }
              >
                Update Password
              </button>

            </form>

          </div>


          {/* DANGER ZONE CARD */}

          <div className="settings-card danger-card">

            <h3 style={{ color: "#f87171" }}>
              Danger Zone
            </h3>


            <p className="settings-danger-text">
              Once you delete your account, there is no going back. Please be certain.
            </p>


            <button
              type="button"
              onClick={
                handleDeleteAccount
              }
              className="settings-danger-btn"
              disabled={
                loading
              }
            >
              Delete Account
            </button>

          </div>


        </section>


        {/* RIGHT SIDEBAR */}

        <RightSidebar />


      </main>


    </div>

  );

}

export default Settings;