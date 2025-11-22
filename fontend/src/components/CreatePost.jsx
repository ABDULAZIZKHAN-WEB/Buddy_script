import { useState } from "react";
import api from "../api/axios";

export default function CreatePost({ onPostCreated, user }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setError("Please select a valid image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(""); // Clear any previous errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Please write something");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("content", content);
      formData.append("visibility", visibility);
      if (image) {
        formData.append("image", image);
      }

      const res = await api.post("/api/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      onPostCreated(res.data);
      setContent("");
      setImage(null);
      setImagePreview(null);
      setVisibility("public");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* Header with user profile */}
          <div className="d-flex align-items-start mb-3">
            <img 
              src="/assets/images/profile.png" 
              alt="Profile" 
              className="rounded-circle me-3" 
              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            />
            <div className="flex-grow-1">
              <h6 className="mb-0">{user ? `${user.first_name} ${user.last_name}` : 'User'}</h6>
              <div className="d-flex align-items-center">
                <select
                  className="form-select form-select-sm w-auto border-0 bg-light rounded-pill px-2 py-1"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  aria-label="Post visibility"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div className="mb-3">
            <textarea
              placeholder={`What's on your mind, ${user ? user.first_name : 'User'}?`}
              className="form-control border-0 p-0"
              style={{ minHeight: '100px', resize: 'none' }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
            ></textarea>
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="mb-3 position-relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="img-fluid rounded"
                style={{ maxHeight: '300px', objectFit: 'cover' }}
              />
              <button
                type="button"
                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle"
                onClick={removeImage}
                aria-label="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
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
          <div className="d-flex justify-content-between align-items-center border-top pt-3">
            <div className="d-flex">
              <label className="btn btn-light rounded-circle me-2 p-2" style={{ cursor: 'pointer' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  disabled={loading}
                  aria-label="Add photo"
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                  <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                </svg>
              </label>
              
              <button 
                type="button" 
                className="btn btn-light rounded-circle p-2 me-2"
                aria-label="Add video"
                disabled
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8v6h.5a.5.5 0 0 0 .5-.5V9h-1zm-1 2.5v3h-5v-3h5zm-7 3H3V9h1v6zm-2-7V2h1v1h10V2h1v4H2z"/>
                </svg>
              </button>
            </div>

            <div className="d-flex align-items-center">
              <span className="text-muted small me-2">
                {content.length}/500
              </span>
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4"
                disabled={loading || (!content.trim() && !image)}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}