<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Post;
use App\Models\Comment;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function toggle(Request $request)
    {
        $request->validate([
            'likeable_type' => 'required|in:post,comment',
            'likeable_id' => 'required|integer',
        ]);

        $likeableType = $request->likeable_type === 'post' ? Post::class : Comment::class;
        $userId = $request->user()->id;

        $like = Like::where([
            'user_id' => $userId,
            'likeable_type' => $likeableType,
            'likeable_id' => $request->likeable_id,
        ])->first();

        if ($like) {
            $like->delete();
            return response()->json(['liked' => false, 'message' => 'Unliked']);
        } else {
            Like::create([
                'user_id' => $userId,
                'likeable_type' => $likeableType,
                'likeable_id' => $request->likeable_id,
            ]);
            return response()->json(['liked' => true, 'message' => 'Liked']);
        }
    }
}
