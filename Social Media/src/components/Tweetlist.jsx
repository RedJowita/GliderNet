import { useState } from 'react'
import Tweet from './Tweet'

const TweetList = () => {
  const [tweets, setTweet] = useState([
    {
      title: 'Hello',
      content: 'React!',
      likes: 2,
      id: 0
    },
    {
      title: '2nd Tweet',
      content: 'What a world!',
      likes: 6,
      id: 1
    },
    {
      title: 'Feeling Good',
      content: 'Loving life',
      likes: 9,
      id: 2
    }
  ])

  return (
    <div>
      {tweets.map(tweet => (
        <Tweet
          title={tweet.title}
          content={tweet.content}
          likes={tweet.likes}
          key={tweet.id}
        />
      ))}
    </div>
  )
}

export default TweetList