# Buddy Script - Social Media Platform

A modern social media platform built with React and Laravel, featuring posts, comments, likes, and privacy controls.

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- npm

### Installation

**1. Clone and Setup Backend**
```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```
Backend runs on: http://127.0.0.1:8000

**2. Setup Frontend**
```bash
cd fontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5173

**3. Open Browser**
Navigate to http://localhost:5173 and start using the app!

## ✨ Features

### Authentication
- ✅ User registration with first name and last name
- ✅ Secure login with Laravel Sanctum
- ✅ Token-based authentication
- ✅ Logout functionality

### Posts
- ✅ Create posts with text and images
- ✅ Public and private post visibility
- ✅ Like/unlike posts
- ✅ View who liked posts
- ✅ Delete own posts
- ✅ Newest posts first

### Comments & Replies
- ✅ Add comments to posts
- ✅ Reply to comments (nested)
- ✅ Like/unlike comments and replies
- ✅ View who liked comments/replies
- ✅ Delete own comments/replies

### Privacy
- ✅ Public posts: Visible to all users
- ✅ Private posts: Only visible to author
- ✅ Privacy indicator badge

## 📁 Project Structure

```
.
├── backend/              # Laravel 12 API
│   ├── app/
│   │   ├── Models/      # User, Post, Comment, Like
│   │   └── Http/Controllers/
│   ├── database/
│   │   └── migrations/
│   └── routes/
│       └── api.php
│
├── fontend/             # React Frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── api/         # Axios configuration
│   │   └── App.jsx
│   └── public/
│       └── assets/      # Images, fonts, etc.
│
└── design/              # Original HTML designs
    └── assets/
```

## 🔌 API Endpoints

### Authentication
```
POST /api/register       - Register new user
POST /api/login          - Login user
POST /api/logout         - Logout user (auth)
GET  /api/user           - Get current user (auth)
```

### Posts
```
GET    /api/posts        - Get all posts
POST   /api/posts        - Create post (with image)
DELETE /api/posts/{id}   - Delete post
```

### Comments
```
POST   /api/posts/{id}/comments  - Add comment/reply
DELETE /api/comments/{id}        - Delete comment
```

### Likes
```
POST /api/likes/toggle   - Toggle like on post/comment
```

## 🛠️ Tech Stack

### Backend
- Laravel 12
- Laravel Sanctum (Authentication)
- SQLite (Database)
- PHP 8.2+

### Frontend
- React 19
- React Router DOM
- Axios
- Vite
- Bootstrap 5

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes
- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Detailed setup guide
- **[FEED_FEATURES.md](FEED_FEATURES.md)** - Complete feature documentation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** - Testing guide
- **[FIXES_APPLIED.md](FIXES_APPLIED.md)** - Recent fixes and solutions

## 🎯 Key Features Breakdown

### 1. Create Posts
- Write text content
- Upload images (with preview)
- Choose public or private visibility
- Images stored in Laravel storage

### 2. Interactions
- Like/unlike posts, comments, and replies
- Real-time UI updates
- See who liked (click on like count)
- Instant feedback

### 3. Comments System
- Add comments to posts
- Reply to comments (unlimited nesting)
- Like comments and replies
- Delete own comments

### 4. Privacy System
- Public posts visible to everyone
- Private posts only visible to author
- Backend filtering ensures privacy
- Visual badge for private posts

## 🔒 Security

- ✅ Laravel Sanctum token authentication
- ✅ CSRF protection
- ✅ Password hashing (bcrypt)
- ✅ Authorization checks
- ✅ SQL injection protection (Eloquent ORM)
- ✅ XSS protection (React escaping)

## 🧪 Testing

Run the complete test suite using the [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md):

1. Authentication tests
2. Post creation tests
3. Like/unlike tests
4. Comment tests
5. Reply tests
6. Privacy tests
7. Delete tests

## 🐛 Troubleshooting

Having issues? Check the **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** guide for solutions to common problems:

- JavaScript errors (custom.js)
- Database column errors
- CSS not loading
- CORS issues
- Image upload problems
- Port conflicts
- And more...

### Quick Fixes

**Database errors:**
```bash
cd backend
php artisan migrate:fresh
```

**Frontend errors:**
```bash
cd fontend
rm -rf node_modules package-lock.json
npm install
```

**Clear everything:**
```bash
# Backend
cd backend
php artisan config:clear
php artisan cache:clear

# Frontend - restart dev server
cd fontend
npm run dev
```

## 📱 Usage

### Register
1. Go to http://localhost:5173/register
2. Fill in your details
3. Click "Register now"

### Login
1. Go to http://localhost:5173/login
2. Enter email and password
3. Click "Login now"

### Create Post
1. Click in "What's on your mind?"
2. Write your content
3. Optionally add an image
4. Choose Public or Private
5. Click "Post"

### Interact
- Click ❤️ to like
- Click "Comment" to add comment
- Click "Reply" to reply to comment
- Click like count to see who liked

## 🎨 Design

The React components are based on the HTML designs in the `design/` folder. All assets (images, fonts) are available in `fontend/public/assets/`.

## 📊 Database Schema

- **users**: id, first_name, last_name, email, password
- **posts**: id, user_id, content, image, visibility
- **comments**: id, user_id, post_id, parent_id, content
- **likes**: id, user_id, likeable_type, likeable_id (polymorphic)

## 🚀 Deployment

For production deployment:

1. Update `.env` with production database
2. Set `APP_ENV=production`
3. Run `php artisan config:cache`
4. Run `npm run build` for frontend
5. Serve built files from `fontend/dist/`

## 🤝 Contributing

This is a complete implementation of the required features. For enhancements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License

## 👥 Authors

Built as a technical task demonstrating full-stack development with React and Laravel.

## 🎉 Acknowledgments

- Design assets from the original HTML templates
- Bootstrap for UI components
- Laravel and React communities

---

**Need Help?** Check the documentation files or review the inline code comments.

**Ready to Start?** Run `php artisan serve` and `npm run dev` and you're good to go! 🚀
