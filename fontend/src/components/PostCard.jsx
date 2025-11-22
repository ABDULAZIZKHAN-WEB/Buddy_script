import { useState } from "react";
import api from "../api/axios";
import CommentSection from "./CommentSection";

export default function PostCard({ post, currentUser, onDelete, onUpdate }) {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [likes, setLikes] = useState(post.likes || []);
  const [showLikes, setShowLikes] = useState(false);
  const [comments, setComments] = useState(post.comments || []);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/api/likes/toggle",
        {
          likeable_type: "post",
          likeable_id: post.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsLiked(res.data.liked);
      setLikesCount(res.data.liked ? likesCount + 1 : likesCount - 1);
      
      if (res.data.liked) {
        setLikes([...likes, { id: currentUser.id, name: `${currentUser.first_name} ${currentUser.last_name}` }]);
      } else {
        setLikes(likes.filter(like => like.id !== currentUser.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete(post.id);
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments([...comments, newComment]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img src="/assets/images/profile.png" alt="Profile" className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">
                {post.user.first_name} {post.user.last_name}
              </h4>
              <p className="_feed_inner_timeline_post_box_para">
                {formatDate(post.created_at)} · <a href="#0">{post.visibility === 'public' ? 'Public' : 'Private'}</a>
              </p>
            </div>
          </div>

          {currentUser && currentUser.id === post.user.id && (
            <div className="_feed_inner_timeline_post_box_dropdown">
              <div className="_feed_timeline_post_dropdown">
                <button className="_feed_timeline_post_dropdown_link" onClick={handleDelete}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                    <circle cx="2" cy="2" r="2" fill="#C4C4C4"></circle>
                    <circle cx="2" cy="8" r="2" fill="#C4C4C4"></circle>
                    <circle cx="2" cy="15" r="2" fill="#C4C4C4"></circle>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        <h4 className="_feed_inner_timeline_post_title">{post.content}</h4>

        {post.image && (
          <div className="_feed_inner_timeline_image">
            <img src={post.image} alt="Post" className="_time_img" />
          </div>
        )}
      </div>

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_image" onClick={() => setShowLikes(!showLikes)} style={{ cursor: 'pointer' }}>
          {likesCount > 0 && (
            <>
              <img src="/assets/images/react_img1.png" alt="Like" className="_react_img1" />
              <p className="_feed_inner_timeline_total_reacts_para">{likesCount}</p>
            </>
          )}
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <a href="#0" onClick={(e) => { e.preventDefault(); setShowComments(!showComments); }}>
              <span>{comments.length}</span> Comment{comments.length !== 1 ? 's' : ''}
            </a>
          </p>
        </div>
      </div>

      {showLikes && likes.length > 0 && (
        <div className="_likes_list _padd_r24 _padd_l24 _mar_b15">
          <h6>Liked by:</h6>
          <ul>
            {likes.map((like, index) => (
              <li key={index}>{like.name}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="_feed_inner_timeline_reaction _padd_r24 _padd_l24">
        <button
          className={`_feed_reaction ${isLiked ? '_feed_reaction_active' : ''}`}
          onClick={handleLike}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19">
                <path fill={isLiked ? "#377DFF" : "#65676b"} d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z"/>
                <path fill="#fff" d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z"/>
              </svg>
              {isLiked ? 'Liked' : 'Like'}
            </span>
          </span>
        </button>

        <button
          className="_feed_reaction"
          onClick={() => setShowComments(!showComments)}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19">
                <path fill="#65676b" d="M9.5 0C4.253 0 0 3.806 0 8.5c0 2.4 1.056 4.575 2.772 6.156-.253 1.425-.95 2.85-1.9 3.8-.237.237-.3.594-.156.9.144.306.45.5.784.5 2.85 0 5.225-1.425 6.65-2.85.95.237 1.9.356 2.85.356 5.247 0 9.5-3.806 9.5-8.5S14.747 0 9.5 0z"/>
              </svg>
              Comment
            </span>
          </span>
        </button>
      </div>

      {showComments && (
        <CommentSection
          postId={post.id}
          comments={comments}
          currentUser={currentUser}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
}
