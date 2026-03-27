-- Add FK from post_comments.post_id to community_posts.id (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'post_comments_post_id_fkey') THEN
    ALTER TABLE public.post_comments
      ADD CONSTRAINT post_comments_post_id_fkey
      FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add FK from post_likes.post_id to community_posts.id (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'post_likes_post_id_fkey') THEN
    ALTER TABLE public.post_likes
      ADD CONSTRAINT post_likes_post_id_fkey
      FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE;
  END IF;
END $$;