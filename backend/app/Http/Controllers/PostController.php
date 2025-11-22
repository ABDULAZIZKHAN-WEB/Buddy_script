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
            'image' => 'nullable|image|max:2048',
            'visibility' => 'required|in:public,private',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('posts', 'public');
        }

        $post = Post::create([
            'user_id' => $request->user()->id,
            'content' => $request->content,
            'image' => $imagePath,
            'visibility' => $request->visibility,
        ]);

        return response()->json($post->load(['user', 'likes', 'comments']), 201);
    }

    public function destroy(Request $request, Post $post)
    {
        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($post->image) {
            Storage::disk('public')->delete($post->image);
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
