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

import {
  onAuthStateChanged
} from "firebase/auth";

import { auth, db } from "../firebase";

import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import Post from "../components/Post";
import RightSidebar from "../components/RightSidebar";


function MyCommunities() {

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [joinedCommunityNames, setJoinedCommunityNames] = useState([]);

  // ADDED: Track user auth state to prevent race conditions on refresh
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);


  // ==================================
  // CHECK AUTH STATE
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
  // LOAD USER JOINED COMMUNITIES IN REAL-TIME
  // ==================================

  useEffect(() => {

    if (authLoading) {
      return;
    }

    if (!user) {
      setJoinedCommunityNames([]);
      return;
    }

    const joinedRef = collection(db, "users", user.uid, "joinedCommunities");

    const unsubscribeJoined = onSnapshot(
      joinedRef,
      (snapshot) => {
        const names = snapshot.docs.map(docSnap => docSnap.id || docSnap.data().communityName);
        setJoinedCommunityNames(names);
      },
      (error) => {
        console.error("Error listening to joined communities:", error);
      }
    );

    return () => unsubscribeJoined();

  }, [user, authLoading]);


  // ==================================
  // LOAD ALL POSTS FROM FIRESTORE
  // ==================================

  useEffect(() => {
    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const postsData = snapshot.docs.map((document) => {
          const data = document.data();
          return {
            id: document.id,
            ...data,
            time: data.createdAt?.toDate().toLocaleString() || "Just now"
          };
        });

        setPosts(postsData);
        setLoadingPosts(false);
      },
      (error) => {
        console.error("My Communities posts error:", error);
        setLoadingPosts(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const normalizedSearch = searchText.trim().toLowerCase();

  // Filter posts to show ONLY joined communities + search match
  const filteredPosts = posts.filter((post) => {
    const postCommName = post.community?.replace("g/", "").trim().toLowerCase();
    
    const isJoined = joinedCommunityNames.some(
      name => name.trim().toLowerCase() === postCommName
    );

    if (!isJoined) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const title = post.title?.toLowerCase() || "";
    const content = post.content?.toLowerCase() || "";
    const username = post.username?.toLowerCase() || "";

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
              {normalizedSearch ? "Search Results" : "My Communities Feed"}
            </h2>
            <span className="page-description">
              Posts from communities you've joined
            </span>
          </div>

          <div className="post-list">
            {(authLoading || loadingPosts) && (
              <p className="feed-message">
                Loading posts...
              </p>
            )}

            {!authLoading && !loadingPosts && filteredPosts.length === 0 && (
              <div className="empty-feed">
                <h3>
                  No posts found
                </h3>
                <p>
                  {joinedCommunityNames.length === 0 
                    ? "You haven't joined any communities yet. Join some on the right sidebar!"
                    : "No posts found in your joined communities."}
                </p>
              </div>
            )}

            {!authLoading && !loadingPosts &&
              filteredPosts.map((post) => (
                <Post key={post.id} post={post} />
              ))}
          </div>
        </section>

        <RightSidebar />
      </main>
    </div>
  );
}

export default MyCommunities;