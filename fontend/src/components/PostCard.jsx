import { useState, useEffect } from "react";
import api from "../api/axios";
import CommentSection from "./CommentSection";

export default function PostCard({ post, currentUser, onDelete, onUpdate }) {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [likes, setLikes] = useState(post.likes || []);
  const [showLikes, setShowLikes] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editVisibility, setEditVisibility] = useState(post.visibility);
  const [loading, setLoading] = useState(false);

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

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(post.content);
    setEditVisibility(post.visibility);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(post.content);
    setEditVisibility(post.visibility);
  };

  const handleSaveEdit = async () => {
    if (editContent === post.content && editVisibility === post.visibility) {
      // No changes made
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.put(`/api/posts/${post.id}`, {
        content: editContent,
        visibility: editVisibility
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update the post in the parent component
      onUpdate(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update post:", err);
      console.error("Error response:", err.response);
      alert("Failed to update post: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
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

  // Simple dropdown toggle function
  const toggleDropdown = (e) => {
    e.preventDefault();
    const dropdown = e.currentTarget.nextElementSibling; // This is now the div with id="_timeline_drop"
    const isOpen = dropdown.classList.contains('show');
    
    // Close all dropdowns first
    document.querySelectorAll('._feed_timeline_dropdown').forEach(menu => {
      menu.classList.remove('show');
    });
    
    // Toggle current dropdown
    if (!isOpen) {
      dropdown.classList.add('show');
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('._feed_timeline_dropdown').forEach(menu => {
          menu.classList.remove('show');
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
              {isEditing ? (
                <div className="d-flex flex-column">
                  <textarea
                    className="form-control mb-2"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    disabled={loading}
                    style={{ minHeight: '80px' }}
                  />
                  <div className="d-flex align-items-center">
                    <select
                      className="form-select form-select-sm w-auto border-0 bg-light rounded-pill px-3 py-1 pe-4 me-2"
                      value={editVisibility}
                      onChange={(e) => setEditVisibility(e.target.value)}
                      aria-label="Post visibility"
                      disabled={loading}
                    >
                      <option value="public">🌍 Public</option>
                      <option value="private">🔒 Private</option>
                    </select>
                  </div>
                </div>
              ) : (
                <p className="_feed_inner_timeline_post_box_para">
                  {formatDate(post.created_at)} · <a href="#0">{post.visibility === 'public' ? 'Public' : 'Private'}</a>
                </p>
              )}
            </div>
          </div>

          {currentUser && currentUser.id === post.user.id && (
            <div className="_feed_inner_timeline_post_box_dropdown">
              <div className="dropdown">
                <button 
                  className="_feed_timeline_post_dropdown_link" 
                  type="button" 
                  onClick={toggleDropdown}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                    <circle cx="2" cy="2" r="2" fill="#C4C4C4"></circle>
                    <circle cx="2" cy="8" r="2" fill="#C4C4C4"></circle>
                    <circle cx="2" cy="15" r="2" fill="#C4C4C4"></circle>
                  </svg>
                </button>
                <div id="_timeline_drop" className="_feed_timeline_dropdown _timeline_dropdown">
                  <ul className="_feed_timeline_dropdown_list">
                    <li className="_feed_timeline_dropdown_item">
                      <a href="#0" className="_feed_timeline_dropdown_link">
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                            <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M14.25 15.75L9 12l-5.25 3.75v-12a1.5 1.5 0 011.5-1.5h7.5a1.5 1.5 0 011.5 1.5v12z"/>
                          </svg>										  
                        </span>
                        Save Post	
                      </a>
                    </li>
                    <li className="_feed_timeline_dropdown_item">
                      <a href="#0" className="_feed_timeline_dropdown_link">
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" fill="none" viewBox="0 0 20 22">
                            <path fill="#377DFF" fillRule="evenodd" d="M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 011.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002c-1.155-.001-2.248-.506-3.077-1.424a.762.762 0 01.057-1.083.774.774 0 011.092.057zM9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0zm0 1.535c-3.6 0-6.11 2.802-6.11 5.316 0 2.127-.595 3.11-1.12 3.978-.422.697-.755 1.247-.755 2.444.173 1.93 1.455 2.944 7.986 2.944 6.494 0 7.817-1.06 7.988-3.01-.003-1.13-.336-1.681-.757-2.378-.526-.868-1.12-1.851-1.12-3.978 0-2.514-2.51-5.316-6.111-5.316z" clipRule="evenodd"/>
                          </svg>										
                        </span>
                        Turn On Notification 
                      </a>
                    </li>
                    <li className="_feed_timeline_dropdown_item">
                      <a href="#0" className="_feed_timeline_dropdown_link">
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                            <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M14.25 2.25H3.75a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V3.75a1.5 1.5 0 00-1.5-1.5zM6.75 6.75l4.5 4.5M11.25 6.75l-4.5 4.5"/>
                          </svg>										
                        </span>
                        Hide	
                      </a>
                    </li>
                    <li className="_feed_timeline_dropdown_item">
                      <button className="_feed_timeline_dropdown_link" onClick={handleEdit} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                            <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M8.25 3H3a1.5 1.5 0 00-1.5 1.5V15A1.5 1.5 0 003 16.5h10.5A1.5 1.5 0 0015 15V9.75"/>
                            <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M13.875 1.875a1.591 1.591 0 112.25 2.25L9 11.25 6 12l.75-3 7.125-7.125z"/>
                          </svg>									
                        </span>
                        Edit Post	
                      </button>
                    </li>
                    <li className="_feed_timeline_dropdown_item">
                      <button className="_feed_timeline_dropdown_link" onClick={handleDelete} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                            <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M2.25 4.5h13.5M6 4.5V3a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0112 3v1.5m2.25 0V15a1.5 1.5 0 01-1.5 1.5h-7.5a1.5 1.5 0 01-1.5-1.5V4.5h10.5zM7.5 8.25v4.5M10.5 8.25v4.5"/>
                          </svg>										
                        </span>
                        Delete Post	
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <h4 className="_feed_inner_timeline_post_title">{isEditing ? editContent : post.content}</h4>

        {post.image && (
          <div className="_feed_inner_timeline_image">
            <img 
              src={post.image} 
              alt="Post" 
              className="_time_img" 
              style={{ maxWidth: '100%', height: 'auto' }}
              onError={(e) => {
                console.log('Image failed to load:', post.image);
                console.log('Image URL:', e.target.src);
                // Try to reload the image after a short delay
                setTimeout(() => {
                  e.target.src = post.image + '?' + new Date().getTime();
                }, 1000);
              }}
              onLoad={(e) => {
                console.log('Image loaded successfully:', post.image);
                console.log('Image URL:', e.target.src);
              }}
            />
          </div>
        )}
        
        {post.video && (
          <div className="_feed_inner_timeline_video">
            <video 
              src={post.video} 
              controls
              className="_time_video" 
              style={{ maxWidth: '100%', height: 'auto' }}
              onError={(e) => {
                console.log('Video failed to load:', post.video);
                console.log('Video URL:', e.target.src);
              }}
            />
          </div>
        )}
      </div>

      {isEditing && (
        <div className="d-flex justify-content-end _padd_r24 _padd_l24 _mar_b10">
          <button 
            className="btn btn-sm btn-outline-secondary me-2" 
            onClick={handleCancelEdit}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn btn-sm btn-primary" 
            onClick={handleSaveEdit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      )}

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
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${isLiked ? '_feed_reaction_active' : ''}`}
          onClick={handleLike}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19">
                <path fill={isLiked ? "#FFCC4D" : "#65676b"} d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z"/>
                {isLiked ? (
                  <>
                    <path fill="#664500" d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z"/>
                    <path fill="#fff" d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z"/>
                    <path fill="#664500" d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z"/>
                  </>
                ) : (
                  <path fill="#fff" d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z"/>
                )}
              </svg>
              {isLiked ? 'Liked' : 'Like'}
            </span>
          </span>
        </button>
        
        <button
          className="_feed_inner_timeline_reaction_comment _feed_reaction"
          onClick={() => setShowComments(!showComments)}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
                <path stroke="#000" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z"/>
                <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563"/>
              </svg>
              Comment
            </span>
          </span>
        </button>
        
        <button 
          className="_feed_inner_timeline_reaction_share _feed_reaction"
          onClick={(event) => {
            // Copy post link to clipboard
            navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`).then(() => {
              // Show a temporary confirmation message
              const originalText = event.target.innerText;
              event.target.innerText = 'Link Copied!';
              setTimeout(() => {
                event.target.innerText = originalText;
              }, 2000);
            }).catch(err => {
              console.error('Failed to copy link: ', err);
            });
          }}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="24" height="21" fill="none" viewBox="0 0 24 21">
                <path stroke="#000" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z"/>
              </svg>
              Share
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