import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, orderBy, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";

import "./DirectMessages.css";

function DirectMessages() {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
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

  // fetch active friends for contacts list
  useEffect(() => {
    if (!user) return;

    const friendsQuery = query(
      collection(db, "friendships"),
      where("status", "==", "accepted")
    );

    const unsubscribe = onSnapshot(friendsQuery, async (snapshot) => {
      const friendPromises = snapshot.docs.map(async (friendDoc) => {
        const data = friendDoc.data();

        if (data.senderId === user.uid || data.receiverId === user.uid) {
          const friendId = data.senderId === user.uid ? data.receiverId : data.senderId;

          const userRef = doc(db, "users", friendId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};
          const name = userData.username || userData.displayName || "Glide User";

          return {
            id: friendId,
            name: name,
            preview: "Click to chat",
            initial: name.charAt(0).toUpperCase()
          };
        }
        return null;
      });

      const resolvedFriends = (await Promise.all(friendPromises)).filter(f => f !== null);
      setContacts(resolvedFriends);

      if (resolvedFriends.length > 0 && !activeChat) {
        setActiveChat(resolvedFriends[0].id);
      }
    });

    return () => unsubscribe();
  }, [user, activeChat]);

  // get messages from firebase
  useEffect(() => {
    if (!user || !activeChat) return;

    const messagesQuery = query(
      collection(db, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        item: doc.data(),
        time: doc.data().timestamp?.toDate().toLocaleString() || "Just now"
      }));

      // filter messages between current user and activeChat friend
      const chatMessages = allMessages.filter(
        (msg) =>
          (msg.item.senderId === user.uid && msg.item.receiverId === activeChat) ||
          (msg.item.senderId === activeChat && msg.item.receiverId === user.uid)
      );

      setMessages(chatMessages);
    });

    return () => unsubscribe();
  }, [user, activeChat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat) return;

    addDoc(collection(db, "messages"), {
      senderId: user.uid,
      receiverId: activeChat,
      text: messageText.trim(),
      timestamp: serverTimestamp()
    });

    setMessageText("");
  };

  return (
    <div className="app">
      <Navbar />

      {/* Note: Using dm-page-layout instead of home-layout to drop the right sidebar */}
      <main className="dm-page-layout">
        <LeftSidebar />

        <section className="dm-container">
          
          {/* CONTACTS SIDEBAR */}
          <div className="dm-sidebar">
            <div className="dm-sidebar-header">
              <h2>Messages</h2>
            </div>
            
            <div className="dm-contact-list">
              {contacts.map((contact) => (
                <div 
                  key={contact.id} 
                  className={`dm-contact-item ${activeChat === contact.id ? "active" : ""}`}
                  onClick={() => setActiveChat(contact.id)}
                >
                  <div className="dm-contact-avatar">{contact.initial}</div>
                  <div className="dm-contact-info">
                    <span className="dm-contact-name">{contact.name}</span>
                    <span className="dm-contact-preview">{contact.preview}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE CHAT AREA */}
          <div className="dm-chat-area">
            <div className="dm-chat-header">
              <div className="dm-contact-avatar">
                {contacts.find(c => c.id === activeChat)?.initial}
              </div>
              <h3>{contacts.find(c => c.id === activeChat)?.name}</h3>
            </div>

            <div className="dm-messages">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`dm-message-bubble ${msg.item.senderId === user.uid ? "dm-message-sent" : "dm-message-received"}`}
                >
                  <div>{msg.item.text}</div>
                  <div className="dm-message-time">{msg.time}</div>
                </div>
              ))}
            </div>

            <form className="dm-input-area" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="Write a message..." 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button type="submit" className="dm-send-btn">
                ↑
              </button>
            </form>
          </div>

        </section>
      </main>
    </div>
  );
}

export default DirectMessages;