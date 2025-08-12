-- Fix the corrupted video_url with the correct YouTube URL
UPDATE workout_content 
SET video_url = 'https://www.youtube.com/watch?v=-RqEm6ZbMtw'
WHERE id = 'fd32e9d4-32a9-4245-a3e7-0bb5673f4e16';