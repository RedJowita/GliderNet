import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate,
  useLocation
} from "react-router-dom";

import {
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import {
  auth
} from "../firebase";


function Navbar({
  searchText = "",
  setSearchText
}) {

  const [user, setUser] =
    useState(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  // ADDED: State for profile dropdown menu open/close
  const [showDropdown, setShowDropdown] =
    useState(false);

  // ADDED: Dark/Light mode state (persisted in localStorage)
  const [isDarkMode, setIsDarkMode] =
    useState(() => {
      const savedTheme = localStorage.getItem("glide_theme");
      return savedTheme ? savedTheme === "dark" : true;
    });

  const navigate =
    useNavigate();

  const location =
    useLocation();


  // ==================================
  // AUTH STATE
  // ==================================

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(

        auth,

        (currentUser) => {

          setUser(
            currentUser
          );

          setLoadingUser(
            false
          );

        }

      );


    return () =>
      unsubscribe();

  }, []);


  // ==================================
  // THEME TOGGLE EFFECT
  // ==================================

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove("light-mode");
      localStorage.setItem("glide_theme", "dark");
    } else {
      document.body.classList.add("light-mode");
      localStorage.setItem("glide_theme", "light");
    }
  }, [isDarkMode]);


  // ==================================
  // LOGOUT
  // ==================================

  const handleLogout =
    async () => {

      try {

        await signOut(
          auth
        );

        setShowDropdown(false);

        navigate(
          "/login"
        );

      } catch (error) {

        console.error(
          "Logout error:",
          error
        );

        alert(
          "Logout failed. Please try again."
        );

      }

    };


  // ==================================
  // USER INITIAL
  // ==================================

  const getUserInitial = () => {

    if (user?.displayName) {

      return user
        .displayName
        .charAt(0)
        .toUpperCase();

    }


    if (user?.email) {

      return user
        .email
        .charAt(0)
        .toUpperCase();

    }


    return "U";

  };


  // ==================================
  // CREATE POST BUTTON
  // ==================================

  const handleCreatePost = () => {

    if (!user) {

      alert(
        "Please log in before creating a post."
      );

      navigate(
        "/login"
      );

      return;

    }


    // If we aren't on the Home page, navigate to Home first
    if (location.pathname !== "/") {
      navigate("/");
    }


    // Scroll to top and click the placeholder to open the form
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    
    setTimeout(() => {
      const createBox = document.querySelector('.create-post-placeholder');
      if (createBox) {
        createBox.click();
      }
    }, 150);

  };


  // ==================================
  // SEARCH
  // ==================================

  const handleSearchChange =
    (event) => {

      if (setSearchText) {

        setSearchText(
          event.target.value
        );

      }

    };

  // ==================================
  // LOGO CLICK 
  // ==================================
  
  const handleLogoClick = (event) => {
    event.preventDefault();
    
    if (setSearchText) {
      setSearchText("");
    }
    
    navigate("/");
    
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };


  // ==================================
  // PAGE
  // ==================================

  return (

    <header className="navbar">


      {/* LOGO */}

      <Link
        to="/"
        className="brand"
        onClick={handleLogoClick}
      >

        <div className="brand-logo">
          G
        </div>

        <span>
          Glide
        </span>

      </Link>


      {/* SEARCH */}

      <div className="search-box">

        <span className="search-icon">
          🔍
        </span>


        <input
          type="text"
          placeholder="Search Glide..."
          value={
            searchText
          }
          onChange={
            handleSearchChange
          }
        />


        {searchText && (
          <button
            type="button"
            className="search-clear-button"
            onClick={() => {

              if (setSearchText) {
                setSearchText("");
              }

            }}
            title="Clear search"
          >
            ✕
          </button>
        )}

      </div>


      {/* NAVBAR ACTIONS */}

      <div className="navbar-actions">


        <button
          type="button"
          className="create-button"
          onClick={
            handleCreatePost
          }
        >
          + Create Post
        </button>


        <button
          type="button"
          className="notification-button"
        >
          🔔
        </button>


        {/* LOGGED OUT */}

        {!loadingUser &&
          !user && (

            <>

              <Link
                to="/login"
                className="login-nav-button"
              >
                Log In
              </Link>


              <Link
                to="/register"
                className="signup-nav-button"
              >
                Sign Up
              </Link>

            </>

          )}


        {/* LOGGED IN */}

        {!loadingUser &&
          user && (

            <div className="navbar-profile-container" style={{ position: "relative" }}>

              <div 
                className="navbar-user"
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ cursor: "pointer" }}
              >


                <div className="navbar-avatar">

                  {getUserInitial()}

                </div>


                <div className="navbar-user-info">


                  <span className="navbar-username">

                    {user.displayName ||
                      "Glide User"}

                  </span>


                  <span className="navbar-email">

                    {user.email}

                  </span>


                </div>


              </div>


              {/* PROFILE DROPDOWN MENU */}
              {showDropdown && (
                <div className="profile-dropdown-menu">
                  
                  {/* Direct Messages */}
                  <div 
                    className="dropdown-item"
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/messages");
                    }}
                    style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}
                  >
                    <span>💬</span> Direct Messages
                  </div>

                  <div className="dropdown-divider"></div>

                  {/* Settings Link */}
                  <div 
                    className="dropdown-item"
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/settings");
                    }}
                  >
                    <span>⚙️</span> Settings
                  </div>

                  <div className="dropdown-divider"></div>

                  {/* Dark Mode Toggle */}
                  <div 
                    className="dropdown-item"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span>{isDarkMode ? "🌙" : "☀️"}</span> Dark Mode
                    </span>
                    <span className={`theme-toggle-pill ${isDarkMode ? "dark" : "light"}`}>
                      <span className="theme-toggle-thumb"></span>
                    </span>
                  </div>

                  <div className="dropdown-divider"></div>

                  {/* Log Out */}
                  <div 
                    className="dropdown-item logout-dropdown-item"
                    onClick={handleLogout}
                  >
                    <span>🚪</span> Log Out
                  </div>

                </div>
              )}

            </div>

          )}


      </div>


    </header>

  );

}

export default Navbar;