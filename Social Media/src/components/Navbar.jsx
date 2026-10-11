import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate
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
  // LOGOUT
  // ==================================

  const handleLogout =
    async () => {

      try {

        await signOut(
          auth
        );

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


    // Scroll to the top where
    // Create Post is located.

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    
    // Tell the browser to virtually click the create post box
    setTimeout(() => {
      const createBox = document.querySelector('.create-post-placeholder');
      if (createBox) createBox.click();
    }, 100);

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
    
    // 1. Clear any active search
    if (setSearchText) {
      setSearchText("");
    }
    
    // 2. Navigate home (if on another page)
    navigate("/");
    
    // 3. Scroll to the top
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

            <>

              <div className="navbar-user">


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


              <button
                type="button"
                className="logout-button"
                onClick={
                  handleLogout
                }
              >
                Log Out
              </button>

            </>

          )}


      </div>


    </header>

  );

}


export default Navbar;