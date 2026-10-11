import { useState } from "react";

function RightSidebar() {
  const [joinedCommunities, setJoinedCommunities] = useState([]);

  const communities = [
    {
      id: 1,
      name: "programming",
      members: "128K members",
      letter: "P"
    },
    {
      id: 2,
      name: "gaming",
      members: "94K members",
      letter: "G"
    },
    {
      id: 3,
      name: "technology",
      members: "76K members",
      letter: "T"
    }
  ];

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

  const handleJoin = (communityId) => {
    setJoinedCommunities((currentJoined) => {
      if (currentJoined.includes(communityId)) {
        return currentJoined.filter(
          (id) => id !== communityId
        );
      }

      return [
        ...currentJoined,
        communityId
      ];
    });
  };

  return (
    <aside className="right-sidebar">

      <div className="right-card">

        <div className="right-card-header">
          <h3>Popular Communities</h3>
          <button>See All</button>
        </div>

        <div className="popular-community-list">

          {communities.map((community) => {
            const joined =
              joinedCommunities.includes(community.id);

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
                    handleJoin(community.id)
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