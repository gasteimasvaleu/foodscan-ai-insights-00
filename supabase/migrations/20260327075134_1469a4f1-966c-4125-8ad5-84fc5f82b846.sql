-- Add FK from community_posts.user_id to profiles.id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'community_posts_user_id_fkey') THEN
    ALTER TABLE public.community_posts
      ADD CONSTRAINT community_posts_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add FK from post_comments.user_id to profiles.id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'post_comments_user_id_fkey') THEN
    ALTER TABLE public.post_comments
      ADD CONSTRAINT post_comments_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;