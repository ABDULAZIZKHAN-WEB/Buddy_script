import { useState } from "react";
import api from "../api/axios";
import Comment from "./Comment";

export default function CommentSection({ postId, comments, currentUser, onCommentAdded }) {
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setLoading(true);

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
      alert("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="_comments_section _mar_t20">
      <form onSubmit={handleSubmit} className="_comment_form _mar_b20">
        <div className="_comment_input_group">
          <img src="/assets/images/profile.png" alt="Profile" className="_comment_avatar" />
          <input
            type="text"
            className="form-control _comment_input"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            type="submit"
            className="btn _btn1 _comment_submit"
            disabled={loading || !newComment.trim()}
          >
            {loading ? "..." : "Post"}
          </button>
        </div>
      </form>

      <div className="_comments_list">
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            postId={postId}
            currentUser={currentUser}
          />
        ))}
      </div>
    </div>
  );
}
