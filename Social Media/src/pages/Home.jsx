import {
  useEffect,
  useState
} from "react";

import {
  collection,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";

import { db } from "../firebase";

import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import CreatePost from "../components/CreatePost";
import Post from "../components/Post";
import RightSidebar from "../components/RightSidebar";


function Home() {

  // ==================================
  // STATES
  // ==================================

  const [posts, setPosts] =
    useState([]);

  const [loadingPosts, setLoadingPosts] =
    useState(true);

  const [searchText, setSearchText] =
    useState("");

  // ADDED: Memory for which community is clicked
  const [activeCommunity, setActiveCommunity] = 
    useState("");


  // ==================================
  // LOAD POSTS FROM FIRESTORE
  // ==================================

  useEffect(() => {

    const postsQuery = query(

      collection(
        db,
        "posts"
      ),

      orderBy(
        "createdAt",
        "desc"
      )

    );


    const unsubscribe = onSnapshot(

      postsQuery,

      (snapshot) => {

        const postsData =
          snapshot.docs.map(
            (document) => {

              const data =
                document.data();


              return {

                id:
                  document.id,

                ...data,

                time:
                  data.createdAt
                    ?.toDate()
                    .toLocaleString() ||
                  "Just now"

              };

            }
          );


        setPosts(
          postsData
        );

        setLoadingPosts(
          false
        );

      },

      (error) => {

        console.error(
          "Firestore error:",
          error
        );

        setLoadingPosts(
          false
        );

      }

    );


    return () =>
      unsubscribe();

  }, []);


  // ==================================
  // SEARCH POSTS
  // ==================================

  const normalizedSearch =
    searchText
      .trim()
      .toLowerCase();


  const filteredPosts =
    posts.filter(
      (post) => {

        // ADDED: If a community is selected, filter out posts that don't match
        if (activeCommunity && post.community !== `g/${activeCommunity}`) {
          return false;
        }

        // If search is empty, show every post (that passed the community check).
        if (!normalizedSearch) {
          return true;
        }


        const title =
          post.title
            ?.toLowerCase() ||
          "";


        const content =
          post.content
            ?.toLowerCase() ||
          "";


        const username =
          post.username
            ?.toLowerCase() ||
          "";


        return (
          title.includes(
            normalizedSearch
          ) ||

          content.includes(
            normalizedSearch
          ) ||

          username.includes(
            normalizedSearch
          )
        );

      }
    );


  // ==================================
  // PAGE
  // ==================================

  return (

    <div className="app">


      {/* NAVBAR */}

      <Navbar
        searchText={
          searchText
        }

        setSearchText={
          setSearchText
        }
      />


      <main className="home-layout">


        {/* LEFT SIDEBAR */}

        <LeftSidebar 
          activeCommunity={activeCommunity} 
          setActiveCommunity={setActiveCommunity} 
        />


        {/* MAIN FEED */}

        <section className="feed">


          <CreatePost />


          <div className="feed-heading">

            <h2>
              {activeCommunity ? "g/" + activeCommunity : (normalizedSearch ? "Search Results" : "Home")}
            </h2>


            <button
              type="button"
            >
              New
            </button>

          </div>


          <div className="post-list">


            {/* LOADING */}

            {loadingPosts && (

              <p className="feed-message">

                Loading posts...

              </p>

            )}


            {/* NO POSTS AT ALL */}

            {!loadingPosts &&
              posts.length === 0 && (

                <div className="empty-feed">

                  <h3>
                    No posts yet
                  </h3>

                  <p>

                    Be the first person
                    to post on Glide.

                  </p>

                </div>

              )}


            {/* NO SEARCH RESULTS */}

            {!loadingPosts &&
              posts.length > 0 &&
              filteredPosts.length === 0 && (

                <div className="empty-feed">

                  <h3>
                    No posts found
                  </h3>

                  <p>

                    No posts match
                    "{searchText}".

                  </p>

                  <button
                    type="button"
                    className="clear-search-button"
                    onClick={() =>
                      setSearchText("")
                    }
                  >
                    Clear Search
                  </button>

                </div>

              )}


            {/* POSTS */}

            {!loadingPosts &&
              filteredPosts.map(
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


        </section>


        {/* RIGHT SIDEBAR */}

        <RightSidebar />


      </main>


    </div>

  );

}


export default Home;