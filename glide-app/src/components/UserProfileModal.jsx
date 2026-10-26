import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import "./UserProfileModal.css";

function UserProfileModal({ selectedUser, currentUser, onClose }) {
  // Manage the friendship state ("none", "pending", or "accepted")
  const [friendStatus, setFriendStatus] = useState("none");

  // Fetch friendship data when the modal opens, just like fetching ToDos
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    // Listen to the 'friendships' collection in real-time
    const unsubscribe = onSnapshot(collection(db, "friendships"), (snapshot) => {
      let currentStatus = "none";
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        
        // Check if there is a relationship document between these two exact users
        const isSender = data.senderId === currentUser.uid && data.receiverId === selectedUser.id;
        const isReceiver = data.senderId === selectedUser.id && data.receiverId === currentUser.uid;

        if (isSender || isReceiver) {
          currentStatus = data.status;
        }
      });
      
      setFriendStatus(currentStatus);
    });

    return () => unsubscribe();
  }, [currentUser, selectedUser]);


  // CHECK IF THE PROFILE BELONGS TO THE CURRENT USER
  const isSelf = currentUser && currentUser.uid === selectedUser.id;


  // Handle the click event for adding a friend
  const handleAddFriend = (e) => {
    e.preventDefault();
    
    // Add a new document to the friendships collection
    addDoc(collection(db, "friendships"), {
      senderId: currentUser.uid,
      receiverId: selectedUser.id,
      status: "pending",
      timestamp: serverTimestamp() // Use Firebase's timestamp
    });
  };

  if (!selectedUser) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      {/* Stop the click from closing the modal if they click inside the box */}
      <div className="popup-box profile-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="popup-header">
          <h2>User Profile</h2>
          <button className="create-post-close" onClick={onClose}>✕</button>
        </div>

        <div className="popup-body profile-body">
          <div className="profile-avatar-large">
            {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "U"}
          </div>
          
          <h3 className="profile-name">{selectedUser.name}</h3>
          <p className="profile-email">{selectedUser.email || "Glide Member"}</p>

          <div className="profile-actions">
            
            {/* IF IT'S YOUR OWN PROFILE */}
            {isSelf ? (
              <button className="popup-btn-cancel" disabled style={{ opacity: 0.8 }}>
                This is you
              </button>
            ) : (
              /* IF IT'S SOMEONE ELSE'S PROFILE */
              <>
                {friendStatus === "none" && (
                  <button className="popup-btn-submit" onClick={handleAddFriend}>
                    + Add Friend
                  </button>
                )}
                
                {friendStatus === "pending" && (
                  <button className="popup-btn-cancel" disabled>
                    Request Sent
                  </button>
                )}

                {friendStatus === "accepted" && (
                  <button className="popup-btn-submit" style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}>
                    ✓ Friends
                  </button>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal;