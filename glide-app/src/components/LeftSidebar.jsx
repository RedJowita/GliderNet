import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase";

function LeftSidebar({ activeCommunity, setActiveCommunity }) {
  const [communities, setCommunities] = useState([]);

  // Popup States
  const [showPopup, setShowPopup] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch communities from Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, "communities"), orderBy("name", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCommunities = snapshot.docs.map(doc => doc.data().name);
      setCommunities(fetchedCommunities);
    });

    return () => unsubscribe();
  }, []);

  const handlePopupSubmit = async (e) => {
    e.preventDefault(); 
    
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to create a community.");
      return;
    }
    
    if (newCommunityName && newCommunityName.trim() !== "") {
      const formattedName = newCommunityName.trim().toLowerCase();
      
      if (communities.includes(formattedName)) {
        alert("This community already exists!");
        return;
      }

      try {
        setLoading(true);

        await addDoc(collection(db, "communities"), {
          name: formattedName
        });
        
        setNewCommunityName(""); 
        setShowPopup(false);

      } catch (error) {
        setCommunities(prev => [...prev, formattedName]);
        setShowPopup(false);
        setNewCommunityName("");
      } finally {
        setLoading(false);
      }
    }
  };

  const getMenuClass = ({ isActive }) => {
    return isActive ? "menu-item active" : "menu-item";
  };

  return (
    <>
      <aside className="left-sidebar">
        {/* MAIN MENU */}
        <nav className="main-menu">
          <NavLink to="/" end className={getMenuClass} onClick={() => setActiveCommunity("")}>
            <span className="menu-icon">⌂</span>
            <span>Home</span>
          </NavLink>

          <NavLink to="/popular" className={getMenuClass}>
            <span className="menu-icon">🔥</span>
            <span>Popular</span>
          </NavLink>

          <NavLink to="/all" className={getMenuClass}>
            <span className="menu-icon">▦</span>
            <span>All</span>
          </NavLink>

          <NavLink to="/my-communities" className={getMenuClass}>
            <span className="menu-icon">♙</span>
            <span>My Communities</span>
          </NavLink>

          <NavLink to="/saved" className={getMenuClass}>
            <span className="menu-icon">♡</span>
            <span>Saved</span>
          </NavLink>
        </nav>

        {/* DIVIDER */}
        <div className="sidebar-divider"></div>

        {/* COMMUNITIES */}
        <p className="community-heading">COMMUNITIES</p>

        <div className="community-menu">
          {communities.map((community) => (
            <button
              type="button"
              className={activeCommunity === community ? "community-item active" : "community-item"}
              key={community}
              onClick={() => setActiveCommunity(community)}
            >
              <span className="community-circle">
                {community.charAt(0).toUpperCase()}
              </span>
              <span>g/{community}</span>
            </button>
          ))}
        </div>

        {/* CREATE COMMUNITY BUTTON */}
        <button
          type="button"
          className="create-community"
          onClick={() => setShowPopup(true)}
        >
          <span className="plus-icon">+</span>
          <span>Create Community</span>
        </button>
      </aside>

      {/* COMMUNITY CREATION POPUP */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            
            <div className="popup-header">
              <h2>Create a community</h2>
              <p>Build a new home for discussions and interests.</p>
            </div>

            <form onSubmit={handlePopupSubmit}>
              <div className="popup-body">
                <label>Community Name</label>
                  <div className="popup-input-wrapper">
                    <span className="popup-input-prefix">g/</span>
                    <input
                      type="text"
                      value={newCommunityName}
                      onChange={(e) => setNewCommunityName(e.target.value)}
                      placeholder="e.g., cooking, music"
                      autoFocus
                      disabled={loading} 
                    />
                </div>
              </div>

              <div className="popup-actions">
                <button 
                  type="button" 
                  className="popup-btn-cancel" 
                  onClick={() => {
                    setShowPopup(false);
                    setNewCommunityName("");
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="popup-btn-submit" 
                  disabled={loading || !newCommunityName.trim()}
                >
                  {loading ? "Creating..." : "Create Community"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}

export default LeftSidebar;