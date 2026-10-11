import {
  useEffect,
  useState
} from "react";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  auth,
  db
} from "../firebase";

import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import Post from "../components/Post";
import RightSidebar from "../components/RightSidebar";


function SavedPosts() {

  const [user, setUser] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [savedPosts, setSavedPosts] =
    useState([]);

  const [loadingPosts, setLoadingPosts] =
    useState(true);


  // ==================================
  // CHECK LOGIN
  // ==================================

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {

          setUser(currentUser);

          setAuthLoading(false);

        }
      );


    return () =>
      unsubscribe();

  }, []);


  // ==================================
  // LOAD SAVED POSTS
  // ==================================

  useEffect(() => {

    if (authLoading) {
      return;
    }


    // Not logged in

    if (!user) {

      setSavedPosts([]);

      setLoadingPosts(false);

      return;

    }


    setLoadingPosts(true);


    const savedPostsQuery =
      query(

        collection(
          db,
          "users",
          user.uid,
          "savedPosts"
        ),

        orderBy(
          "savedAt",
          "desc"
        )

      );


    const unsubscribe =
      onSnapshot(

        savedPostsQuery,

        async (snapshot) => {

          try {

            // Get each real post
            // from the posts collection.

            const postPromises =
              snapshot.docs.map(
                async (
                  savedDocument
                ) => {

                  const savedData =
                    savedDocument.data();


                  const postId =
                    savedData.postId ||
                    savedDocument.id;


                  const postReference =
                    doc(
                      db,
                      "posts",
                      postId
                    );


                  const postSnapshot =
                    await getDoc(
                      postReference
                    );


                  // Post may have
                  // been deleted.

                  if (
                    !postSnapshot.exists()
                  ) {

                    return null;

                  }


                  const postData =
                    postSnapshot.data();


                  return {

                    id:
                      postSnapshot.id,

                    ...postData,

                    time:
                      postData.createdAt
                        ?.toDate()
                        .toLocaleString() ||
                      "Just now"

                  };

                }
              );


            const loadedPosts =
              await Promise.all(
                postPromises
              );


            // Remove deleted posts

            setSavedPosts(

              loadedPosts.filter(
                (post) =>
                  post !== null
              )

            );


          } catch (error) {

            console.error(
              "Load saved posts error:",
              error
            );

          } finally {

            setLoadingPosts(
              false
            );

          }

        },

        (error) => {

          console.error(
            "Saved posts error:",
            error
          );


          setLoadingPosts(
            false
          );

        }

      );


    return () =>
      unsubscribe();

  }, [user, authLoading]);


  // ==================================
  // PAGE
  // ==================================

  return (

    <div className="app">


      <Navbar />


      <main className="home-layout">


        <LeftSidebar />


        <section className="feed">


          <div className="saved-page-header">

            <div>

              <h2>
                Saved Posts
              </h2>

              <p>
                Posts you saved on Glide
              </p>

            </div>

          </div>



          {/* AUTH LOADING */}

          {authLoading && (

            <div className="empty-feed">

              <p>
                Loading...
              </p>

            </div>

          )}



          {/* NOT LOGGED IN */}

          {!authLoading &&
            !user && (

              <div className="empty-feed">

                <h3>
                  Log in required
                </h3>

                <p>
                  Log in to view
                  your saved posts.
                </p>

              </div>

            )}



          {/* LOADING SAVED POSTS */}

          {!authLoading &&
            user &&
            loadingPosts && (

              <div className="empty-feed">

                <p>
                  Loading saved posts...
                </p>

              </div>

            )}



          {/* NO SAVED POSTS */}

          {!authLoading &&
            user &&
            !loadingPosts &&
            savedPosts.length === 0 && (

              <div className="empty-feed">

                <div className="saved-empty-icon">
                  ♡
                </div>

                <h3>
                  No saved posts
                </h3>

                <p>
                  Posts you save will
                  appear here.
                </p>

              </div>

            )}



          {/* SAVED POSTS */}

          {!authLoading &&
            user &&
            !loadingPosts &&
            savedPosts.length > 0 && (

              <div className="post-list">

                {savedPosts.map(
                  (post) => (

                    <Post
                      key={
                        post.id
                      }
                      post={
                        post
                      }
                    />

                  )
                )}

              </div>

            )}


        </section>


        <RightSidebar />


      </main>


    </div>

  );

}


export default SavedPosts;