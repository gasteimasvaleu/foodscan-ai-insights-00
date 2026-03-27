-- Drop existing FKs pointing to auth.users
ALTER TABLE public.community_posts DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;
ALTER TABLE public.post_comments DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey;
ALTER TABLE public.post_likes DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;

-- Recreate FKs pointing to public.profiles
ALTER TABLE public.community_posts
  ADD CONSTRAINT community_posts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.post_comments
  ADD CONSTRAINT post_comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.post_likes
  ADD CONSTRAINT post_likes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;