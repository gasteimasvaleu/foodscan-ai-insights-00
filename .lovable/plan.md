

## Add delete own posts in community

### Changes

**1. `src/components/community/PostCard.tsx`**
- Add `onPostDeleted` callback prop
- Show a `Trash2` icon button in the header only when `post.user_id === userId`
- Add confirmation dialog (AlertDialog) before deleting
- On confirm: call `supabase.from("community_posts").delete().eq("id", post.id)`, then invoke `onPostDeleted`
- Show toast on success/error

**2. `src/pages/Comunidade.tsx`**
- Pass `onPostDeleted={fetchPosts}` to each `PostCard`

### Notes
- RLS policy "Users can delete their own posts" already exists on `community_posts`, so no database changes needed
- Related likes/comments should cascade-delete via existing FK constraints (`post_comments.post_id` and `post_likes.post_id` reference `community_posts.id` with `ON DELETE CASCADE`)

