import {
  NavLink
} from "react-router-dom";


function LeftSidebar() {

  const communities = [
    "programming",
    "gaming",
    "technology",
    "general",
    "fitness",
    "movies"
  ];


  // ==================================
  // ACTIVE MENU STYLE
  // ==================================

  const getMenuClass =
    ({ isActive }) => {

      return isActive
        ? "menu-item active"
        : "menu-item";

    };


  return (

    <aside className="left-sidebar">


      {/* ==================================
          MAIN MENU
      ================================== */}

      <nav className="main-menu">


        {/* HOME */}

        <NavLink
          to="/"
          end
          className={getMenuClass}
        >

          <span className="menu-icon">
            ⌂
          </span>

          <span>
            Home
          </span>

        </NavLink>



        {/* POPULAR */}

        <NavLink
          to="/popular"
          className={getMenuClass}
        >

          <span className="menu-icon">
            🔥
          </span>

          <span>
            Popular
          </span>

        </NavLink>



        {/* ALL */}

        <NavLink
          to="/all"
          className={getMenuClass}
        >

          <span className="menu-icon">
            ▦
          </span>

          <span>
            All
          </span>

        </NavLink>



        {/* MY COMMUNITIES */}

        <button
          type="button"
          className="menu-item"
        >

          <span className="menu-icon">
            ♙
          </span>

          <span>
            My Communities
          </span>

        </button>



        {/* SAVED */}

        <NavLink
          to="/saved"
          className={getMenuClass}
        >

          <span className="menu-icon">
            ♡
          </span>

          <span>
            Saved
          </span>

        </NavLink>


      </nav>



      {/* ==================================
          DIVIDER
      ================================== */}

      <div className="sidebar-divider">
      </div>



      {/* ==================================
          COMMUNITIES
      ================================== */}

      <p className="community-heading">

        COMMUNITIES

      </p>



      <div className="community-menu">


        {communities.map(
          (community) => (

            <button
              type="button"
              className="community-item"
              key={community}
            >

              <span className="community-circle">

                {community
                  .charAt(0)
                  .toUpperCase()}

              </span>


              <span>

                g/{community}

              </span>

            </button>

          )
        )}


      </div>



      {/* ==================================
          CREATE COMMUNITY
      ================================== */}

      <button
        type="button"
        className="create-community"
      >

        <span className="plus-icon">
          +
        </span>

        <span>
          Create Community
        </span>

      </button>


    </aside>

  );

}


export default LeftSidebar;