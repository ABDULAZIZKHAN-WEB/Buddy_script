import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import MiddleFeed from "./MiddleFeed";
import RightSidebar from "./RightSidebar";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      const res = await api.get("/api/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error(err);
      navigate("/login");
    }
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/posts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <>
      <Header user={user} />
      
      <div className="container _custom_container">
        <div className="_layout_inner_wrap">
          <div className="row">
            {/* Left Sidebar */}
            <LeftSidebar />

            {/* Middle Feed */}
            <MiddleFeed 
              posts={posts}
              user={user}
              onPostCreated={handlePostCreated}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />

            {/* Right Sidebar */}
            <RightSidebar />
          </div>
        </div>
      </div>
    </>
  );
}
