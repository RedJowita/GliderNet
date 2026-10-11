import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  deleteDoc,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc
} from "firebase/firestore";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  auth,
  db
} from "../firebase";


function Post({ post }) {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [userVote, setUserVote] =
    useState(0);

  const [voting, setVoting] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);


  // ==================================
  // AUTH STATE
  // ==================================

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
        }
      );

    return () =>
      unsubscribe();

  }, []);


  // ==================================
  // LOAD USER VOTE
  // ==================================

  useEffect(() => {

    const loadUserVote =
      async () => {

        if (!user || !post.id) {

          setUserVote(0);

          return;
        }


        try {

          const voteReference = doc(
            db,
            "posts",
            post.id,
            "votes",
            user.uid
          );


          const voteSnapshot =
            await getDoc(
              voteReference
            );


          if (voteSnapshot.exists()) {

            setUserVote(
              voteSnapshot.data().value
            );

          } else {

            setUserVote(0);

          }

        } catch (error) {

          console.error(
            "Load vote error:",
            error
          );

        }

      };


    loadUserVote();

  }, [user, post.id]);


  // ==================================
  // LOAD SAVED STATUS
  // ==================================

  useEffect(() => {

    const loadSavedStatus =
      async () => {

        if (!user || !post.id) {

          setSaved(false);

          return;
        }


        try {

          const savedReference = doc(
            db,
            "users",
            user.uid,
            "savedPosts",
            post.id
          );


          const savedSnapshot =
            await getDoc(
              savedReference
            );


          setSaved(
            savedSnapshot.exists()
          );

        } catch (error) {

          console.error(
            "Load saved post error:",
            error
          );

        }

      };


    loadSavedStatus();

  }, [user, post.id]);


  // ==================================
  // VOTE
  // ==================================

  const handleVote =
    async (selectedVote) => {

      if (!user) {

        alert(
          "Please log in before voting."
        );

        return;
      }


      if (voting) {
        return;
      }


      try {

        setVoting(true);


        const postReference = doc(
          db,
          "posts",
          post.id
        );


        const voteReference = doc(
          db,
          "posts",
          post.id,
          "votes",
          user.uid
        );


        const finalUserVote =
          await runTransaction(

            db,

            async (transaction) => {

              const postSnapshot =
                await transaction.get(
                  postReference
                );


              if (!postSnapshot.exists()) {

                throw new Error(
                  "Post does not exist."
                );

              }


              const voteSnapshot =
                await transaction.get(
                  voteReference
                );


              const currentVotes =
                postSnapshot.data()
                  .votes ?? 0;


              let previousVote = 0;


              if (voteSnapshot.exists()) {

                previousVote =
                  voteSnapshot.data()
                    .value;

              }


              let newVote = 0;

              let voteChange = 0;


              if (
                previousVote ===
                selectedVote
              ) {

                newVote = 0;

                voteChange =
                  -previousVote;


                transaction.delete(
                  voteReference
                );

              } else {

                newVote =
                  selectedVote;


                voteChange =
                  selectedVote -
                  previousVote;


                transaction.set(
                  voteReference,
                  {
                    userId:
                      user.uid,

                    value:
                      selectedVote
                  }
                );

              }


              transaction.update(
                postReference,
                {
                  votes:
                    currentVotes +
                    voteChange
                }
              );


              return newVote;

            }

          );


        setUserVote(
          finalUserVote
        );


      } catch (error) {

        console.error(
          "Vote error:",
          error
        );


        alert(
          "Could not update vote. Please try again."
        );


      } finally {

        setVoting(false);

      }

    };


  const handleUpvote = () => {

    handleVote(1);

  };


  const handleDownvote = () => {

    handleVote(-1);

  };


  // ==================================
  // SAVE / UNSAVE
  // ==================================

  const handleSave =
    async () => {

      if (!user) {

        alert(
          "Please log in before saving posts."
        );

        return;
      }


      if (saving) {
        return;
      }


      try {

        setSaving(true);


        const savedReference = doc(
          db,
          "users",
          user.uid,
          "savedPosts",
          post.id
        );


        if (saved) {

          await deleteDoc(
            savedReference
          );

          setSaved(false);

        } else {

          await setDoc(
            savedReference,
            {
              postId:
                post.id,

              savedAt:
                serverTimestamp()
            }
          );


          setSaved(true);

        }


      } catch (error) {

        console.error(
          "Save post error:",
          error
        );


        alert(
          "Could not save this post."
        );


      } finally {

        setSaving(false);

      }

    };


  // ==================================
  // COMMENTS
  // ==================================

  const handleOpenComments = () => {

    navigate(
      `/post/${post.id}`
    );

  };


  // ==================================
  // SHARE
  // ==================================

  const handleShare =
    async () => {

      const postUrl =
        `${window.location.origin}/post/${post.id}`;


      try {

        if (navigator.share) {

          await navigator.share({
            title:
              post.title,

            text:
              post.title,

            url:
              postUrl
          });

        } else {

          await navigator.clipboard.writeText(
            postUrl
          );


          alert(
            "Post link copied!"
          );

        }


      } catch (error) {

        if (
          error.name !==
          "AbortError"
        ) {

          console.error(
            "Share error:",
            error
          );


          alert(
            "Could not share this post."
          );

        }

      }

    };


  // ==================================
  // DELETE POST
  // ==================================

  const handleDeletePost =
    async () => {

      if (!user) {

        alert(
          "Please log in first."
        );

        return;
      }


      // Extra frontend ownership check

      if (
        user.uid !==
        post.userId
      ) {

        alert(
          "You can only delete your own posts."
        );

        return;
      }


      const confirmed =
        window.confirm(
          "Are you sure you want to delete this post?"
        );


      if (!confirmed) {
        return;
      }


      try {

        setDeleting(true);


        const postReference = doc(
          db,
          "posts",
          post.id
        );


        await deleteDoc(
          postReference
        );


      } catch (error) {

        console.error(
          "Delete post error:",
          error
        );


        alert(
          "Could not delete this post."
        );


      } finally {

        setDeleting(false);

      }

    };


  // ==================================
  // CHECK POST OWNERSHIP
  // ==================================

  const isPostOwner =
    user &&
    user.uid === post.userId;


  // ==================================
  // DISPLAY
  // ==================================

  return (

    <article className="post-card">


      {/* POST HEADER */}

      <div className="post-header">


        <div className="post-community-icon">

          {post.username
            ?.charAt(0)
            .toUpperCase() ||
            "G"}

        </div>


        <div>

          <div className="post-community">

            {post.username ||
              "Glide User"}

          </div>


          <div className="post-info">

            Posted{" • "}

            {post.time ||
              "Just now"}

          </div>

        </div>


      </div>



      {/* POST CONTENT */}

      <div className="post-content">

        <h2>
          {post.title}
        </h2>


        {post.content && (

          <p>
            {post.content}
          </p>

        )}

      </div>



      {/* POST ACTIONS */}

      <div className="post-actions">


        {/* VOTE */}

        <div className="vote-box">


          <button
            type="button"
            className={
              userVote === 1
                ? "vote-button active-upvote"
                : "vote-button"
            }
            onClick={
              handleUpvote
            }
            disabled={
              voting
            }
            title="Upvote"
          >
            ▲
          </button>


          <span className="vote-number">

            {post.votes ?? 0}

          </span>


          <button
            type="button"
            className={
              userVote === -1
                ? "vote-button active-downvote"
                : "vote-button"
            }
            onClick={
              handleDownvote
            }
            disabled={
              voting
            }
            title="Downvote"
          >
            ▼
          </button>


        </div>



        {/* COMMENTS */}

        <button
          type="button"
          className="action-button"
          onClick={
            handleOpenComments
          }
        >

          💬{" "}

          {post.comments ?? 0}

          {" "}Comments

        </button>



        {/* SHARE */}

        <button
          type="button"
          className="action-button"
          onClick={
            handleShare
          }
        >
          ↗ Share
        </button>



        {/* SAVE */}

        <button
          type="button"
          className={
            saved
              ? "action-button saved-button"
              : "action-button"
          }
          onClick={
            handleSave
          }
          disabled={
            saving
          }
        >

          {saving
            ? "Saving..."
            : saved
              ? "♥ Saved"
              : "♡ Save"}

        </button>



        {/* DELETE - OWNER ONLY */}

        {isPostOwner && (

          <button
            type="button"
            className="action-button delete-post-button"
            onClick={
              handleDeletePost
            }
            disabled={
              deleting
            }
          >

            {deleting
              ? "Deleting..."
              : "🗑 Delete"}

          </button>

        )}


      </div>


    </article>

  );

}


export default Post;