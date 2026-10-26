import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";

// Import isolated CSS
import "./DirectMessages.css";

function DirectMessages() {
  const [user, setUser] = useState(null);
  const [messageText, setMessageText] = useState("");
  const navigate = useNavigate();

  // Mock data for UI layout - you can replace this with Firestore queries later
  const [activeChat, setActiveChat] = useState(1);
  const contacts = [
    { id: 1, name: "thelarpingman", preview: "Yeah that bug was annoying...", initial: "T" },
    { id: 2, name: "ggwp_dude", preview: "Are we still playing tonight?", initial: "G" },
    { id: 3, name: "glide_admin", preview: "Welcome to your new account!", initial: "G" }
  ];

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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    // Add Firestore push logic here later
    console.log("Sending:", messageText);
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
              {/* Dummy conversation layout */}
              <div className="dm-message-bubble dm-message-received">
                Hey, did you manage to fix that CSS bug in light mode?
              </div>
              <div className="dm-message-bubble dm-message-sent">
                Yeah, just added a separate CSS file for it. Looks super clean now.
              </div>
              <div className="dm-message-bubble dm-message-received">
                Awesome! Let me see a screenshot when you're done.
              </div>
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