import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
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

  // 1. Check Auth State
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

  // 2. Fetch Incoming Requests
  useEffect(() => {
    if (!user) return;

    const requestsQuery = query(
      collection(db, "friendships"),
      where("receiverId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIncomingRequests(requestsData);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Fetch Active Friends
  useEffect(() => {
    if (!user) return;

    // Listen to all accepted friendships
    const friendsQuery = query(
      collection(db, "friendships"),
      where("status", "==", "accepted")
    );

    const unsubscribe = onSnapshot(friendsQuery, (snapshot) => {
      const friendsData = [];
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        // Only keep it if the current user is part of the accepted relationship
        if (data.senderId === user.uid || data.receiverId === user.uid) {
          friendsData.push({
            id: doc.id,
            // Figure out the OTHER person's ID
            friendId: data.senderId === user.uid ? data.receiverId : data.senderId,
            ...data
          });
        }
      });
      setFriendsList(friendsData);
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
                        <div className="friend-avatar">U</div>
                        {/* We use a snippet of their ID here for now until we link user profiles! */}
                        <h3 className="friend-name">User: {request.senderId.substring(0, 5)}...</h3>
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
                        <div className="friend-avatar">F</div>
                        <h3 className="friend-name">Friend: {friend.friendId.substring(0, 5)}...</h3>
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