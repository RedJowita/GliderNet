import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useParams
} from "react-router-dom";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  auth,
  db
} from "../firebase";

import UserProfileModal from "../components/UserProfileModal";


function PostDetails() {

  const { postId } = useParams();

  const [post, setPost] =
    useState(null);

  const [comments, setComments] =
    useState([]);

  const [commentText, setCommentText] =
    useState("");

  const [loadingPost, setLoadingPost] =
    useState(true);

  const [loadingComments, setLoadingComments] =
    useState(true);

  const [postingComment, setPostingComment] =
    useState(false);

  const [user, setUser] =
    useState(null);

  const [deletingCommentId, setDeletingCommentId] =
    useState(null);

  const [selectedProfile, setSelectedProfile] = 
    useState(null);


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
  // LOAD POST
  // ==================================

  useEffect(() => {

    const postReference = doc(
      db,
      "posts",
      postId
    );


    const unsubscribe =
      onSnapshot(

        postReference,

        (snapshot) => {

          if (snapshot.exists()) {

            const data =
              snapshot.data();


            setPost({

              id:
                snapshot.id,

              ...data,

              time:
                data.createdAt
                  ?.toDate()
                  .toLocaleString() ||
                "Just now"

            });

          } else {

            setPost(null);

          }


          setLoadingPost(false);

        },

        (error) => {

          console.error(
            "Load post error:",
            error
          );

          setLoadingPost(false);

        }

      );


    return () =>
      unsubscribe();

  }, [postId]);


  // ==================================
  // LOAD COMMENTS
  // ==================================

  useEffect(() => {

    const commentsQuery =
      query(

        collection(
          db,
          "posts",
          postId,
          "comments"
        ),

        orderBy(
          "createdAt",
          "asc"
        )

      );


    const unsubscribe =
      onSnapshot(

        commentsQuery,

        (snapshot) => {

          const commentsData =
            snapshot.docs.map(
              (commentDocument) => {

                const data =
                  commentDocument.data();


                return {

                  id:
                    commentDocument.id,

                  ...data,

                  time:
                    data.createdAt
                      ?.toDate()
                      .toLocaleString() ||
                    "Just now"

                };

              }
            );


          setComments(
            commentsData
          );

          setLoadingComments(
            false
          );

        },

        (error) => {

          console.error(
            "Load comments error:",
            error
          );

          setLoadingComments(
            false
          );

        }

      );


    return () =>
      unsubscribe();

  }, [postId]);


  // ==================================
  // ADD COMMENT
  // ==================================

  const handleAddComment =
    async (event) => {

      event.preventDefault();


      const currentUser =
        auth.currentUser;


      if (!currentUser) {

        alert(
          "Please log in before commenting."
        );

        return;

      }


      if (!commentText.trim()) {

        alert(
          "Please write a comment first."
        );

        return;

      }


      try {

        setPostingComment(true);


        const commentsReference =
          collection(
            db,
            "posts",
            postId,
            "comments"
          );


        await addDoc(
          commentsReference,
          {

            userId:
              currentUser.uid,

            username:
              currentUser.displayName ||
              currentUser.email ||
              "Glide User",

            content:
              commentText.trim(),

            createdAt:
              serverTimestamp()

          }
        );


        // Increase comment count

        const postReference = doc(
          db,
          "posts",
          postId
        );


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


            const currentComments =
              postSnapshot
                .data()
                .comments ?? 0;


            transaction.update(
              postReference,
              {

                comments:
                  currentComments + 1

              }
            );

          }

        );


        setCommentText("");


      } catch (error) {

        console.error(
          "Add comment error:",
          error
        );


        alert(
          "Could not add comment. Please try again."
        );


      } finally {

        setPostingComment(false);

      }

    };


  // ==================================
  // DELETE COMMENT
  // ==================================

  const handleDeleteComment =
    async (comment) => {


      if (!user) {

        alert(
          "Please log in first."
        );

        return;

      }


      // Frontend ownership check

      if (
        user.uid !==
        comment.userId
      ) {

        alert(
          "You can only delete your own comments."
        );

        return;

      }


      const confirmed =
        window.confirm(
          "Are you sure you want to delete this comment?"
        );


      if (!confirmed) {

        return;

      }


      try {

        setDeletingCommentId(
          comment.id
        );


        // ==================================
        // DELETE COMMENT
        // ==================================

        const commentReference =
          doc(
            db,
            "posts",
            postId,
            "comments",
            comment.id
          );


        await deleteDoc(
          commentReference
        );


        // ==================================
        // REDUCE COMMENT COUNT
        // ==================================

        const postReference =
          doc(
            db,
            "posts",
            postId
          );


        await runTransaction(

          db,

          async (transaction) => {

            const postSnapshot =
              await transaction.get(
                postReference
              );


            if (
              !postSnapshot.exists()
            ) {

              return;

            }


            const currentComments =
              postSnapshot
                .data()
                .comments ?? 0;


            transaction.update(
              postReference,
              {

                comments:
                  Math.max(
                    currentComments - 1,
                    0
                  )

              }
            );

          }

        );


      } catch (error) {

        console.error(
          "Delete comment error:",
          error
        );


        alert(
          "Could not delete this comment."
        );


      } finally {

        setDeletingCommentId(
          null
        );

      }

    };


  // ==================================
  // LOADING POST
  // ==================================

  if (loadingPost) {

    return (

      <div className="post-details-page">

        <div className="post-details-container">

          <Link
            to="/"
            className="back-home"
          >
            ← Back to Home
          </Link>


          <div className="post-details-card">

            <p className="details-message">
              Loading post...
            </p>

          </div>

        </div>

      </div>

    );

  }


  // ==================================
  // POST NOT FOUND
  // ==================================

  if (!post) {

    return (

      <div className="post-details-page">

        <div className="post-details-container">

          <Link
            to="/"
            className="back-home"
          >
            ← Back to Home
          </Link>


          <div className="post-details-card">

            <h2>
              Post not found
            </h2>

            <p className="details-message">

              This post may have
              been deleted.

            </p>

          </div>

        </div>

      </div>

    );

  }


  // ==================================
  // PAGE
  // ==================================

  return (

    <div className="post-details-page">


      <div className="post-details-container">


        <Link
          to="/"
          className="back-home"
        >
          ← Back to Home
        </Link>



        {/* ==========================
            POST
        ========================== */}

        <article className="post-details-card">


          <div className="post-header">


            <div className="post-community-icon">

              {post.username
                ?.charAt(0)
                .toUpperCase() ||
                "G"}

            </div>


            <div>

              {/* ADDED: Show the community tag */}
              <div className="post-community" style={{ fontWeight: "bold", color: "white" }}>
                {post.community || "g/general"}
              </div>


              {/* UPDATED: Show the username and time */}
              <div className="post-info">
                Posted by{" "}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (post.userId) {
                      setSelectedProfile({
                        id: post.userId,
                        name: post.username || "Glide User"
                      });
                    }
                  }}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                  title={`View ${post.username || "User"}'s profile`}
                >
                  {post.username || "Glide User"}
                </span>
                {" • "}
                {post.time || "Just now"}
              </div>

            </div>


          </div>



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



          <div className="details-stats">


            <span>

              ▲ {post.votes ?? 0} Votes

            </span>


            <span>

              💬 {post.comments ?? 0} Comments

            </span>


          </div>


        </article>



        {/* ==========================
            ADD COMMENT
        ========================== */}

        <div className="comment-form-card">


          <h3>
            Add a Comment
          </h3>


          <form
            onSubmit={
              handleAddComment
            }
          >


            <textarea
              placeholder="What are your thoughts?"
              value={
                commentText
              }
              onChange={
                (event) =>
                  setCommentText(
                    event.target.value
                  )
              }
              maxLength={500}
              disabled={
                postingComment
              }
            />


            <div className="comment-form-footer">


              <span className="comment-character-count">

                {commentText.length}/500

              </span>


              <button
                type="submit"
                disabled={
                  postingComment ||
                  !commentText.trim()
                }
              >

                {postingComment
                  ? "Commenting..."
                  : "Comment"}

              </button>


            </div>


          </form>


        </div>



        {/* ==========================
            COMMENTS
        ========================== */}

        <div className="comments-section">


          <h3>

            Comments ({comments.length})

          </h3>



          {loadingComments && (

            <div className="no-comments">

              Loading comments...

            </div>

          )}



          {!loadingComments &&
            comments.length === 0 && (

              <div className="no-comments">

                No comments yet.
                Be the first to comment!

              </div>

            )}



          {!loadingComments &&
            comments.map(
              (comment) => {


                const isCommentOwner =
                  user &&
                  user.uid ===
                    comment.userId;


                return (

                  <div
                    className="comment-card"
                    key={
                      comment.id
                    }
                  >


                    <div className="comment-avatar">

                      {comment.username
                        ?.charAt(0)
                        .toUpperCase() ||
                        "G"}

                    </div>



                    <div className="comment-body">


                      <div className="comment-header">


                        <div className="comment-user-info">

                          <strong
                            onClick={(e) => {
                              e.stopPropagation();
                              if (comment.userId) {
                                setSelectedProfile({
                                  id: comment.userId,
                                  name: comment.username || "Glide User"
                                });
                              }
                            }}
                            style={{ cursor: "pointer", textDecoration: "underline" }}
                            title={`View ${comment.username || "User"}'s profile`}
                          >

                            {comment.username ||
                              "Glide User"}

                          </strong>


                          <span>

                            {comment.time}

                          </span>

                        </div>



                        {/* DELETE OWN COMMENT */}

                        {isCommentOwner && (

                          <button
                            type="button"
                            className="delete-comment-button"
                            onClick={() =>
                              handleDeleteComment(
                                comment
                              )
                            }
                            disabled={
                              deletingCommentId ===
                              comment.id
                            }
                          >

                            {deletingCommentId ===
                            comment.id
                              ? "Deleting..."
                              : "Delete"}

                          </button>

                        )}


                      </div>



                      <p>

                        {comment.content}

                      </p>


                    </div>


                  </div>

                );

              }
            )}


        </div>


      </div>

      {selectedProfile && (
        <UserProfileModal 
          selectedUser={selectedProfile}
          currentUser={user}
          onClose={() => setSelectedProfile(null)}
        />
      )}

    </div>

  );

}


export default PostDetails;