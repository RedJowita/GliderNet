import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

function RightSidebar() {
  const [communities, setCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [user, setUser] = useState(null);

  // Track auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch live communities from Firestore
  useEffect(() => {
    const q = query(collection(db, "communities"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((docSnap, index) => ({
        id: docSnap.id,
        name: docSnap.data().name,
        members: "1 member", // Can be dynamic later
        letter: docSnap.data().name.charAt(0).toUpperCase()
      }));
      setCommunities(fetched);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user's joined communities from Firestore
  useEffect(() => {
    if (!user) {
      setJoinedCommunities([]);
      return;
    }

    const fetchJoined = async () => {
      try {
        const joinedRef = collection(db, "users", user.uid, "joinedCommunities");
        const snapshot = await getDocs(joinedRef);
        const joinedIds = snapshot.docs.map(docSnap => docSnap.data().communityName);
        setJoinedCommunities(joinedIds);
      } catch (error) {
        console.error("Error fetching joined communities:", error);
      }
    };

    fetchJoined();
  }, [user]);

  // Handle Join / Unjoin toggle
  const handleJoin = async (communityName) => {
    if (!user) {
      alert("Please log in to join communities.");
      return;
    }

    try {
      const userJoinedRef = doc(db, "users", user.uid, "joinedCommunities", communityName);
      
      if (joinedCommunities.includes(communityName)) {
        // Unjoin
        await deleteDoc(userJoinedRef);
        setJoinedCommunities(prev => prev.filter(name => name !== communityName));
      } else {
        // Join
        await setDoc(userJoinedRef, {
          communityName: communityName,
          joinedAt: new Date()
        });
        setJoinedCommunities(prev => [...prev, communityName]);
      }
    } catch (error) {
      console.error("Error toggling join state:", error);
      alert("Could not update community membership.");
    }
  };

  const trendingTopics = [
    {
      id: 1,
      category: "Technology",
      title: "The future of artificial intelligence",
      posts: "2.4K posts"
    },
    {
      id: 2,
      category: "Gaming",
      title: "Most anticipated games this year",
      posts: "1.8K posts"
    },
    {
      id: 3,
      category: "Programming",
      title: "React development tips",
      posts: "956 posts"
    }
  ];

  return (
    <aside className="right-sidebar">

      <div className="right-card">

        <div className="right-card-header">
          <h3>Popular Communities</h3>
          <button>See All</button>
        </div>

        <div className="popular-community-list">

          {communities.map((community) => {
            const joined = joinedCommunities.includes(community.name);

            return (
              <div
                className="popular-community"
                key={community.id}
              >

                <div className="popular-community-icon">
                  {community.letter}
                </div>

                <div className="popular-community-info">
                  <strong>
                    g/{community.name}
                  </strong>

                  <span>
                    {community.members}
                  </span>
                </div>

                <button
                  className={
                    joined
                      ? "join-button joined"
                      : "join-button"
                  }
                  onClick={() =>
                    handleJoin(community.name)
                  }
                >
                  {joined ? "Joined" : "Join"}
                </button>

              </div>
            );
          })}

        </div>

      </div>


      <div className="right-card trending-card">

        <div className="right-card-header">
          <h3>Trending</h3>
        </div>

        <div className="trending-list">

          {trendingTopics.map((topic, index) => (
            <div
              className="trending-item"
              key={topic.id}
            >

              <span className="trending-number">
                {index + 1}
              </span>

              <div className="trending-info">

                <span className="trending-category">
                  {topic.category}
                </span>

                <strong>
                  {topic.title}
                </strong>

                <span className="trending-posts">
                  {topic.posts}
                </span>

              </div>

            </div>
          ))}

        </div>

      </div>

    </aside>
  );
}

export default RightSidebar;