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
import Post from "../components/Post";
import RightSidebar from "../components/RightSidebar";


function AllPosts() {

  const [posts, setPosts] =
    useState([]);

  const [loadingPosts, setLoadingPosts] =
    useState(true);

  const [searchText, setSearchText] =
    useState("");


  useEffect(() => {

    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
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
                id: document.id,
                ...data,

                time:
                  data.createdAt
                    ?.toDate()
                    .toLocaleString() ||
                  "Just now"
              };

            }
          );


        setPosts(postsData);

        setLoadingPosts(false);

      },

      (error) => {

        console.error(
          "All posts error:",
          error
        );

        setLoadingPosts(false);

      }
    );


    return () =>
      unsubscribe();

  }, []);


  const normalizedSearch =
    searchText
      .trim()
      .toLowerCase();


  const filteredPosts =
    posts.filter((post) => {

      if (!normalizedSearch) {
        return true;
      }


      const title =
        post.title
          ?.toLowerCase() || "";

      const content =
        post.content
          ?.toLowerCase() || "";

      const username =
        post.username
          ?.toLowerCase() || "";


      return (
        title.includes(normalizedSearch) ||
        content.includes(normalizedSearch) ||
        username.includes(normalizedSearch)
      );

    });


  return (

    <div className="app">

      <Navbar
        searchText={searchText}
        setSearchText={setSearchText}
      />


      <main className="home-layout">

        <LeftSidebar />


        <section className="feed">

          <div className="feed-heading">

            <h2>
              {normalizedSearch
                ? "Search Results"
                : "All Posts"}
            </h2>

            <span className="page-description">
              All Glide posts
            </span>

          </div>


          <div className="post-list">

            {loadingPosts && (

              <p className="feed-message">
                Loading posts...
              </p>

            )}


            {!loadingPosts &&
              posts.length === 0 && (

                <div className="empty-feed">

                  <h3>
                    No posts yet
                  </h3>

                  <p>
                    Posts will appear
                    here.
                  </p>

                </div>

              )}


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


            {!loadingPosts &&
              filteredPosts.map(
                (post) => (

                  <Post
                    key={post.id}
                    post={post}
                  />

                )
              )}

          </div>

        </section>


        <RightSidebar />

      </main>

    </div>

  );

}


export default AllPosts;