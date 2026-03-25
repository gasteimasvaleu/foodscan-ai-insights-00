

## Fix: Video preview squeezed in VideoModal

The issue is that the video container has `aspect-video` on the wrapper div, but the `flex-1` parent with `overflow-y-auto` is compressing it. On a 390px mobile screen with `h-[80vh]`, the header + button take space, leaving little room for the video, which gets squeezed.

### Fix

**`src/components/VideoModal.tsx`**:
- Remove fixed `h-[80vh]` from DialogContent -- let it size naturally with `max-h-[90vh]`
- Keep `overflow-y-auto` on the content area so long descriptions scroll
- Change the video container: remove `aspect-video` from wrapper, use `w-full h-0 pb-[56.25%] relative` for a stable 16:9 ratio that won't be compressed by flex, with the iframe/video absolutely positioned inside
- Alternatively, simpler: just add `flex-shrink-0` to the video container so flex doesn't compress it

Simplest fix: add `flex-shrink-0` to the `aspect-video` div so it maintains its 16:9 ratio and isn't squeezed by the flex container.

