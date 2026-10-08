# Fix the recipe search

## What is happening
The search uses an international recipe site that only understands English. The app translates the word you type (for example "macarrão" to "pasta") before searching. That translation used the old OpenAI key, which stopped working (the same problem we had in FoodScan). Without the translation, the search goes out in Portuguese and finds nothing.

Test I ran:
- "macarrão" returns 0 recipes.
- "pasta" returns several recipes.

Recipe titles, ingredients and preparation steps are also no longer being translated into Portuguese.

## Fix
1. Switch the translation to the Lovable AI, the same one already used in FoodScan and the other features.
2. This covers the search word (Portuguese to English) and the recipe titles, ingredients and steps (English to Portuguese).
3. If the translation fails, the search keeps working in English instead of silently returning empty.
4. Test with "macarrão" (with and without filters) and open a recipe to confirm the text is in Portuguese.

## Technical details
- `supabase/functions/spoonacular-recipes/index.ts`: `translateText` and `translateBatch` call `https://ai.gateway.lovable.dev/v1/chat/completions` with `LOVABLE_API_KEY`, model `openai/gpt-6-astra`, `reasoning_effort: "low"`, no `temperature`.
- Check `res.ok` and log the status and body on failure, returning the original text.
- No change on screen.
