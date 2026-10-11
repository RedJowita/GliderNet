import { useState } from "react";

import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import { auth, db } from "../firebase";


function CreatePost() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [community, setCommunity] = useState("g/general"); // New community tagging feature
  const [loading, setLoading] = useState(false);


  const handleOpenForm = () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in before creating a post.");
      return;
    }

    setShowForm(true);
  };


  const handleCancel = () => {
    setTitle("");
    setContent("");
    setCommunity("g/general"); // New community tagging feature
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

          community: community, // New community tagging feature

          userId: user.uid,

          username:
            user.displayName ||
            user.email ||
            "Glide User",

          votes: 0,

          comments: 0,

          createdAt: serverTimestamp()
        }
      );

      setTitle("");
      setContent("");
      setCommunity("g/general"); // New community tagging feature
      setShowForm(false);

    } catch (error) {
      console.error(
        "Create post error:",
        error
      );

      alert(
        "Could not create post. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  if (!showForm) {
    return (
      <div className="create-post-box">

        <div className="create-post-top">

          <div className="user-avatar">
            {auth.currentUser
              ?.displayName
              ?.charAt(0)
              .toUpperCase() ||
              "G"}
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

      <form
        className="create-post-form"
        onSubmit={handleSubmit}
      >

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

        {/* New community tagging feature */}
        <select
          className="create-post-community"
          value={community}
          onChange={(event) => setCommunity(event.target.value)}
          disabled={loading}
          style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#1A2837", color: "white", border: "1px solid #2D3A4A", borderRadius: "5px", width: "100%", outline: "none" }}
        >
          <option value="g/general">g/general</option>
          <option value="g/programming">g/programming</option>
          <option value="g/gaming">g/gaming</option>
          <option value="g/technology">g/technology</option>
          <option value="g/fitness">g/fitness</option>
          <option value="g/movies">g/movies</option>
        </select>


        <input
          type="text"
          className="create-post-title"
          placeholder="Post title"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          maxLength={150}
          disabled={loading}
          autoFocus
        />

        <div className="post-title-count">
          {title.length}/150
        </div>


        <textarea
          className="create-post-content"
          placeholder="Write something..."
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
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
            disabled={
              loading ||
              !title.trim()
            }
          >
            {loading
              ? "Posting..."
              : "Post"}
          </button>

        </div>

      </form>

    </div>
  );
}


export default CreatePost;