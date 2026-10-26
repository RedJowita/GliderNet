import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { auth, db } from "../firebase";

function CreatePost() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [community, setCommunity] = useState("g/general"); 
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  
  // Store communities from Firebase
  const [communitiesList, setCommunitiesList] = useState([]);

  // Fetch live communities for the dropdown
  useEffect(() => {
    const q = query(collection(db, "communities"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => doc.data().name);
      setCommunitiesList(fetched);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenForm = () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in before creating a post.");
      return;
    }
    
    // If we aren't currently on the home page, route home first so the form appears correctly
    if (location.pathname !== "/") {
      navigate("/");
    }
    
    setShowForm(true);
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setCommunity("g/general"); 
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in before creating a post.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a post title.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(
        collection(db, "posts"),
        {
          title: title.trim(),
          content: content.trim(),
          community: community, 
          userId: user.uid,
          username: user.displayName || user.email || "Glide User",
          votes: 0,
          comments: 0,
          createdAt: serverTimestamp()
        }
      );

      setTitle("");
      setContent("");
      setCommunity("g/general"); 
      setShowForm(false);

    } catch (error) {
      console.error("Create post error:", error);
      alert("Could not create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="create-post-box">
        <div className="create-post-top">
          <div className="user-avatar">
            {auth.currentUser?.displayName?.charAt(0).toUpperCase() || "G"}
          </div>
          <button
            type="button"
            className="create-post-placeholder"
            onClick={handleOpenForm}
          >
            Create a post...
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-post-box">
      <form className="create-post-form" onSubmit={handleSubmit}>
        <div className="create-post-form-header">
          <h3>Create Post</h3>
          <button
            type="button"
            className="create-post-close"
            onClick={handleCancel}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Dynamic dropdown fetching exclusively from Firebase */}
        <select
          id="post-community-select"
          name="postCommunity"
          aria-label="Select community"
          className="create-post-community"
          value={community}
          onChange={(event) => setCommunity(event.target.value)}
          disabled={loading}
          style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#1A2837", color: "white", border: "1px solid #2D3A4A", borderRadius: "5px", width: "100%", outline: "none" }}
        >
          {communitiesList.length === 0 ? (
            <option value="g/general">g/general</option>
          ) : (
            communitiesList.map((comm) => (
              <option key={comm} value={`g/${comm}`}>
                g/{comm}
              </option>
            ))
          )}
        </select>

        <input
          id="post-title-input"
          name="postTitle"
          aria-label="Post title"
          type="text"
          className="create-post-title"
          placeholder="Post title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={150}
          disabled={loading}
          autoFocus
        />

        <div className="post-title-count">
          {title.length}/150
        </div>

        <textarea
          id="post-content-input"
          name="postContent"
          aria-label="Post content"
          className="create-post-content"
          placeholder="Write something..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={2000}
          disabled={loading}
        />

        <div className="post-content-count">
          {content.length}/2000
        </div>

        <div className="create-post-form-actions">
          <button
            type="button"
            className="cancel-post-button"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-post-button"
            disabled={loading || !title.trim()}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;