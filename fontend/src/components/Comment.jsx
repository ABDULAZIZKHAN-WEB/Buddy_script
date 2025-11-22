import { useState } from "react";
import api from "../api/axios";

export default function Comment({ comment, postId, currentUser, isReply = false }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState(comment.replies || []);
  const [isLiked, setIsLiked] = useState(comment.is_liked);
  const [likesCount, setLikesCount] = useState(comment.likes_count);
  const [likes, setLikes] = useState(comment.likes || []);
  const [showLikes, setShowLikes] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/api/likes/toggle",
        {
          likeable_type: "comment",
          likeable_id: comment.id,
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

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        `/api/posts/${postId}/comments`,
        {
          content: replyContent,
          parent_id: comment.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReplies([...replies, res.data]);
      setReplyContent("");
      setShowReplyForm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add reply");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/comments/${comment.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload(); // Simple refresh for now
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className={`_comment ${isReply ? '_reply' : ''}`}>
      <div className="_comment_header">
        <img src="/assets/images/profile.png" alt="Profile" className="_comment_avatar" />
        <div className="_comment_content">
          <div className="_comment_user_info">
            <h6 className="_comment_username">
              {comment.user.first_name} {comment.user.last_name}
            </h6>
            <span className="_comment_time">{formatDate(comment.created_at)}</span>
          </div>
          <p className="_comment_text">{comment.content}</p>
          
          <div className="_comment_actions">
            <button
              className={`_comment_action_btn ${isLiked ? '_liked' : ''}`}
              onClick={handleLike}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
              </svg>
              {isLiked ? 'Unlike' : 'Like'}
            </button>
            
            {likesCount > 0 && (
              <button
                className="_comment_action_btn"
                onClick={() => setShowLikes(!showLikes)}
              >
                {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
              </button>
            )}
            
            {!isReply && (
              <button
                className="_comment_action_btn"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                Reply
              </button>
            )}
            
            {currentUser && currentUser.id === comment.user.id && (
              <button className="_comment_action_btn _delete" onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
          
          {showLikes && likes.length > 0 && (
            <div className="_likes_list _mar_t10">
              <small>Liked by: {likes.map(like => like.name).join(', ')}</small>
            </div>
          )}
        </div>
      </div>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="_reply_form _mar_t10 _mar_l40">
          <div className="_comment_input_group">
            <img src="/assets/images/profile.png" alt="Profile" className="_comment_avatar" />
            <input
              type="text"
              className="form-control _comment_input"
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-sm _btn1"
              disabled={loading || !replyContent.trim()}
            >
              {loading ? "..." : "Reply"}
            </button>
          </div>
        </form>
      )}

      {replies.length > 0 && (
        <div className="_replies _mar_l40 _mar_t10">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUser={currentUser}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
