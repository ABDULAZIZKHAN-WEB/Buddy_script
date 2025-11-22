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
  const [error, setError] = useState("");

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
      setError("Failed to like comment");
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      setError("Please write a reply");
      return;
    }

    setLoading(true);
    setError("");

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
      setError("Failed to add reply. Please try again.");
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
      
      // Instead of refreshing the page, we should notify the parent component
      // to remove this comment from the list
      window.location.reload(); // Simple refresh for now
    } catch (err) {
      console.error(err);
      setError("Failed to delete comment");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`mb-3 ${isReply ? 'ms-4' : ''}`}>
      <div className="d-flex">
        {/* User avatar */}
        <div className="me-2">
          <img 
            src="/assets/images/profile.png" 
            alt={`${comment.user.first_name} ${comment.user.last_name}`}
            className="rounded-circle"
            style={{ width: '36px', height: '36px', objectFit: 'cover' }}
          />
        </div>
        
        {/* Comment content */}
        <div className="flex-grow-1">
          <div className="card bg-light border-0">
            <div className="card-body py-2 px-3">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="mb-0 fw-bold">
                    {comment.user.first_name} {comment.user.last_name}
                  </h6>
                  <small className="text-muted">{formatDate(comment.created_at)}</small>
                </div>
                {currentUser && currentUser.id === comment.user.id && (
                  <button 
                    className="btn btn-sm p-0" 
                    onClick={handleDelete}
                    aria-label="Delete comment"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash text-muted" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                  </button>
                )}
              </div>
              <p className="mb-1 mt-1">{comment.content}</p>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show mt-2 py-1 px-2 small" role="alert">
              {error}
              <button 
                type="button" 
                className="btn-close" 
                data-bs-dismiss="alert" 
                aria-label="Close"
                onClick={() => setError("")}
              ></button>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="d-flex align-items-center mt-1">
            <button
              className={`btn btn-sm me-2 ${isLiked ? 'text-primary' : 'text-muted'}`}
              onClick={handleLike}
              aria-label={isLiked ? "Unlike comment" : "Like comment"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-heart-fill" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
              </svg>
              <span className="ms-1">{likesCount}</span>
            </button>
            
            {!isReply && (
              <button
                className="btn btn-sm text-muted"
                onClick={() => setShowReplyForm(!showReplyForm)}
                aria-expanded={showReplyForm}
                aria-label="Reply to comment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-reply-fill" viewBox="0 0 16 16">
                  <path d="M5.921 11.9 1.353 8.62a.719.719 0 0 1 0-1.238L5.921 4.1A.716.716 0 0 1 7 4.719V6c1.5 0 6 0 7 8-2.5-4.5-7-4-7-4v1.281c0 .56-.606.898-1.079.62z"/>
                </svg>
                <span className="ms-1">Reply</span>
              </button>
            )}
          </div>
          
          {/* Likes list */}
          {showLikes && likes.length > 0 && (
            <div className="mt-2 small text-muted">
              Liked by: {likes.map(like => like.name).join(', ')}
            </div>
          )}
        </div>
      </div>
      
      {/* Reply form */}
      {showReplyForm && (
        <div className="mt-2 ms-5">
          <form onSubmit={handleReplySubmit}>
            <div className="d-flex align-items-start gap-2">
              <img 
                src="/assets/images/profile.png" 
                alt="Your profile" 
                className="rounded-circle" 
                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
              />
              <div className="flex-grow-1">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control rounded-pill px-3"
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => {
                      setReplyContent(e.target.value);
                      if (error) setError(""); // Clear error when user types
                    }}
                    disabled={loading}
                    style={{ 
                      backgroundColor: '#f8f9fa',
                      border: error ? '1px solid #dc3545' : '1px solid #e9ecef',
                      paddingRight: '80px'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill position-absolute end-0 me-2"
                    style={{ zIndex: 10 }}
                    disabled={loading || !replyContent.trim()}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      "Post"
                    )}
                  </button>
                </div>
                
                {/* Character counter and error message */}
                <div className="d-flex justify-content-between mt-1">
                  <small className="text-muted">{replyContent.length}/500</small>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
      
      {/* Replies */}
      {replies.length > 0 && (
        <div className="mt-2">
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