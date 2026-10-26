import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";

import "./Friends.css";

function Friends() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("friends"); // "friends" or "requests"
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  
  const navigate = useNavigate();

  // check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // fetch incoming request and user detail
  useEffect(() => {
    if (!user) return;

    const requestsQuery = query(
      collection(db, "friendships"),
      where("receiverId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(requestsQuery, async (snapshot) => {
      // fetch the actual user profiles for the sender IDs
      const requestsPromises = snapshot.docs.map(async (requestDoc) => {
        const data = requestDoc.data();
        
        // grabs the sender's profile from the users collection
        const userRef = doc(db, "users", data.senderId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};

        return {
          id: requestDoc.id,
          ...data,
          // fallback through username -> display name -> generic
          senderName: userData.username || userData.displayName || "Glide User" 
        };
      });

      // wait for all profiles to load before setting state
      const resolvedRequests = await Promise.all(requestsPromises);
      setIncomingRequests(resolvedRequests);
    });

    return () => unsubscribe();
  }, [user]);

  // fetch active friends and User's detail
  useEffect(() => {
    if (!user) return;

    // listen to all accepted friendships
    const friendsQuery = query(
      collection(db, "friendships"),
      where("status", "==", "accepted")
    );

    const unsubscribe = onSnapshot(friendsQuery, async (snapshot) => {
      const friendPromises = snapshot.docs.map(async (friendDoc) => {
        const data = friendDoc.data();
        
        //keeps it if the current user is part of the accepted relationship
        if (data.senderId === user.uid || data.receiverId === user.uid) {
          
          // figure out the OTHER person's ID
          const friendId = data.senderId === user.uid ? data.receiverId : data.senderId;
          
          // fetch the friend's profile from the users collection
          const userRef = doc(db, "users", friendId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};

          return {
            id: friendDoc.id,
            friendId,
            ...data,
            friendName: userData.username || userData.displayName || "Glide User"
          };
        }
        return null;
      });

      // this will filter out any nulls (friendships you aren't part of) and set state
      const resolvedFriends = (await Promise.all(friendPromises)).filter(f => f !== null);
      setFriendsList(resolvedFriends);
    });

    return () => unsubscribe();
  }, [user]);

  // ==================================
  // ACTIONS
  // ==================================
  
  const handleAccept = async (requestId) => {
    try {
      const requestRef = doc(db, "friendships", requestId);
      await updateDoc(requestRef, { status: "accepted" });
    } catch (error) {
      console.error("Error accepting:", error);
    }
  };

  const handleDeclineOrRemove = async (requestId) => {
    try {
      const requestRef = doc(db, "friendships", requestId);
      await deleteDoc(requestRef);
    } catch (error) {
      console.error("Error removing:", error);
    }
  };

  return (
    <div className="app">
      <Navbar />

      <main className="friends-page-layout">
        <LeftSidebar />

        <section className="friends-container">
          <div className="friends-header">
            <h2>Friends Hub</h2>
            <div className="friends-tabs">
              <button 
                className={`friend-tab-btn ${activeTab === "friends" ? "active" : ""}`}
                onClick={() => setActiveTab("friends")}
              >
                My Friends
              </button>
              <button 
                className={`friend-tab-btn ${activeTab === "requests" ? "active" : ""}`}
                onClick={() => setActiveTab("requests")}
              >
                Requests {incomingRequests.length > 0 && `(${incomingRequests.length})`}
              </button>
            </div>
          </div>

          <div className="friends-content">
            
            {/* INCOMING REQUESTS TAB */}
            {activeTab === "requests" && (
              <div>
                {incomingRequests.length === 0 ? (
                  <p style={{ color: "#71869e" }}>No pending requests.</p>
                ) : (
                  incomingRequests.map(request => (
                    <div className="friend-card" key={request.id}>
                      <div className="friend-info">
                        <div className="friend-avatar">
                          {request.senderName.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="friend-name">{request.senderName}</h3>
                      </div>
                      <div className="friend-actions">
                        <button className="btn-accept" onClick={() => handleAccept(request.id)}>Accept</button>
                        <button className="btn-decline" onClick={() => handleDeclineOrRemove(request.id)}>Decline</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* MY FRIENDS TAB */}
            {activeTab === "friends" && (
              <div>
                {friendsList.length === 0 ? (
                  <p style={{ color: "#71869e" }}>You don't have any friends added yet.</p>
                ) : (
                  friendsList.map(friend => (
                    <div className="friend-card" key={friend.id}>
                      <div className="friend-info">
                        <div className="friend-avatar">
                          {friend.friendName.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="friend-name">{friend.friendName}</h3>
                      </div>
                      <div className="friend-actions">
                        <button className="btn-message" onClick={() => navigate("/messages")}>Message</button>
                        <button className="btn-decline" onClick={() => handleDeclineOrRemove(friend.id)}>Remove</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </section>

        <RightSidebar />
      </main>
    </div>
  );
}

export default Friends;