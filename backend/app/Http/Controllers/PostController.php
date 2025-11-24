<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get public posts and user's own private posts
        $posts = Post::where(function($query) use ($user) {
            $query->where('visibility', 'public')
                  ->orWhere(function($q) use ($user) {
                      $q->where('visibility', 'private')
                        ->where('user_id', $user->id);
                  });
        })
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function($post) use ($user) {
            return [
                'id' => $post->id,
                'content' => $post->content,
                'image' => $post->image ? url('storage/' . $post->image) : null,
                'video' => $post->video ? url('storage/' . $post->video) : null,
                'visibility' => $post->visibility,
                'created_at' => $post->created_at,
                'user' => [
                    'id' => $post->user->id,
                    'first_name' => $post->user->first_name,
                    'last_name' => $post->user->last_name,
                    'email' => $post->user->email,
                ],
                'likes_count' => $post->likes_count,
                'comments_count' => $post->comments_count,
                'is_liked' => $post->isLikedBy($user->id),
                'likes' => $post->likes->map(fn($like) => [
                    'id' => $like->user->id,
                    'name' => $like->user->first_name . ' ' . $like->user->last_name,
                ]),
                'comments' => $post->comments->map(function($comment) use ($user) {
                    return $this->formatComment($comment, $user);
                }),
            ];
        });

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'image' => 'nullable|image|max:5120', // 5MB
            'video' => 'nullable|mimetypes:video/mp4,video/avi,video/mpeg,video/quicktime|max:10240', // 10MB
            'visibility' => 'required|in:public,private',
        ]);

        $imagePath = null;
        $videoPath = null;
        
        // Handle image upload
        if ($request->hasFile('image')) {
            // Create a directory based on the post ID (will be available after saving)
            // For now, we'll save with a temporary name and rename after post creation
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('posts/temp', $imageName, 'public');
        }
        
        // Handle video upload
        if ($request->hasFile('video')) {
            // Create a directory based on the post ID (will be available after saving)
            // For now, we'll save with a temporary name and rename after post creation
            $video = $request->file('video');
            $videoName = time() . '_' . $video->getClientOriginalName();
            $videoPath = $video->storeAs('posts/temp', $videoName, 'public');
        }

        $post = Post::create([
            'user_id' => $request->user()->id,
            'content' => $request->content,
            'image' => $imagePath,
            'video' => $videoPath,
            'visibility' => $request->visibility,
        ]);

        // Now that we have the post ID, move the media files to a proper directory
        if ($imagePath || $videoPath) {
            $postId = $post->id;
            $postIdDir = 'posts/' . $postId;
            
            // Create directory for this post
            Storage::disk('public')->makeDirectory($postIdDir);
            
            // Move the image from temp to the post directory
            if ($imagePath) {
                $imageName = basename($imagePath);
                $newImagePath = $postIdDir . '/' . $imageName;
                Storage::disk('public')->move($imagePath, $newImagePath);
                // Update the post with the new image path
                $post->image = $newImagePath;
            }
            
            // Move the video from temp to the post directory
            if ($videoPath) {
                $videoName = basename($videoPath);
                $newVideoPath = $postIdDir . '/' . $videoName;
                Storage::disk('public')->move($videoPath, $newVideoPath);
                // Update the post with the new video path
                $post->video = $newVideoPath;
            }
            
            $post->save();
        }

        // Load relationships and return the created post
        $post->load(['user', 'likes', 'comments']);
        
        // Format the response to match the index method
        $formattedPost = [
            'id' => $post->id,
            'content' => $post->content,
            'image' => $post->image ? url('storage/' . $post->image) : null,
            'video' => $post->video ? url('storage/' . $post->video) : null,
            'visibility' => $post->visibility,
            'created_at' => $post->created_at,
            'user' => [
                'id' => $post->user->id,
                'first_name' => $post->user->first_name,
                'last_name' => $post->user->last_name,
                'email' => $post->user->email,
            ],
            'likes_count' => $post->likes_count,
            'comments_count' => $post->comments_count,
            'is_liked' => false, // New posts aren't liked by anyone initially
            'likes' => [],
            'comments' => [],
        ];

        return response()->json($formattedPost, 201);
    }

    public function update(Request $request, Post $post)
    {
        // Check if the authenticated user is the owner of the post
        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'content' => 'sometimes|string',
            'visibility' => 'sometimes|in:public,private',
        ]);

        // Update only the fields that are provided
        if ($request->has('content')) {
            $post->content = $request->content;
        }
        
        if ($request->has('visibility')) {
            $post->visibility = $request->visibility;
        }

        $post->save();

        // Return the updated post with relationships, formatted consistently
        $user = $request->user();
        $formattedPost = [
            'id' => $post->id,
            'content' => $post->content,
            'image' => $post->image ? url('storage/' . $post->image) : null,
            'video' => $post->video ? url('storage/' . $post->video) : null,
            'visibility' => $post->visibility,
            'created_at' => $post->created_at,
            'user' => [
                'id' => $post->user->id,
                'first_name' => $post->user->first_name,
                'last_name' => $post->user->last_name,
                'email' => $post->user->email,
            ],
            'likes_count' => $post->likes_count,
            'comments_count' => $post->comments_count,
            'is_liked' => $post->isLikedBy($user->id),
            'likes' => $post->likes->map(fn($like) => [
                'id' => $like->user->id,
                'name' => $like->user->first_name . ' ' . $like->user->last_name,
            ]),
            'comments' => $post->comments->map(function($comment) use ($user) {
                return $this->formatComment($comment, $user);
            }),
        ];

        return response()->json($formattedPost);
    }

    public function destroy(Request $request, Post $post)
    {
        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete the post's media directory if it exists
        if ($post->image || $post->video) {
            $postIdDir = 'posts/' . $post->id;
            Storage::disk('public')->deleteDirectory($postIdDir);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }

    private function formatComment($comment, $user)
    {
        return [
            'id' => $comment->id,
            'content' => $comment->content,
            'created_at' => $comment->created_at,
            'user' => [
                'id' => $comment->user->id,
                'first_name' => $comment->user->first_name,
                'last_name' => $comment->user->last_name,
            ],
            'likes_count' => $comment->likes_count,
            'is_liked' => $comment->isLikedBy($user->id),
            'likes' => $comment->likes->map(fn($like) => [
                'id' => $like->user->id,
                'name' => $like->user->first_name . ' ' . $like->user->last_name,
            ]),
            'replies' => $comment->replies->map(function($reply) use ($user) {
                return $this->formatComment($reply, $user);
            }),
        ];
    }
}