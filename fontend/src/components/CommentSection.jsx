import { useState } from "react";
import api from "../api/axios";
import Comment from "./Comment";

export default function CommentSection({ postId, comments, currentUser, onCommentAdded }) {
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      setError("Please write a comment");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        `/api/posts/${postId}/comments`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onCommentAdded(res.data);
      setNewComment("");
    } catch (err) {
      console.error(err);
      setError("Failed to add comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-4">
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
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
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
                disabled={loading || !newComment.trim()}
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
              <small className="text-muted">{newComment.length}/500</small>
              {error && (
                <small className="text-danger">{error}</small>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Comments list */}
      <div className="mt-3">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="mb-3">
              <Comment
                comment={comment}
                postId={postId}
                currentUser={currentUser}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <div className="text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-chat-dots mb-2" viewBox="0 0 16 16">
                <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z"/>
              </svg>
              <p className="mb-0">No comments yet</p>
              <p className="small mb-0">Be the first to share what you think!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}