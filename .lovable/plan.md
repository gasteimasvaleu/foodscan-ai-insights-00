

## Reverting VideoModal.tsx and AdminTreinos.tsx

The user wants to undo the glassmorphism styling changes made to these two files. The easiest way is to use the built-in revert feature.

However, since the user only wants to revert **specific files** (not the entire project state), and the revert button would revert ALL changes from that message, I should advise using the revert button if they want to undo everything, or note that selective file reversion isn't available via the UI.

Since these files already had the glassmorphism styling applied in the previous message alongside other files, the user can revert the entire message and then re-apply changes only to the files they want to keep.

Alternatively, I can simply restore the original classes in those two files directly.

**Recommended approach:** Revert the styling changes in just those 2 files by restoring the original `DialogContent` and `AlertDialogContent` classes.

### Changes

**1. `src/components/VideoModal.tsx`** (line 56)
- Remove glassmorphism classes, restore original: `max-w-4xl h-[80vh] flex flex-col`

**2. `src/pages/AdminTreinos.tsx`**
- Workout dialog (~line 288): restore original classes with just `max-w-2xl max-h-[90vh] overflow-y-auto`
- Delete AlertDialog (~line 559): restore to default (no extra classes)

