# Source-first illustrated reader foundation

This is preparation for a real source-backed reader, not an adaptation or a published story. No complete narrative is bundled, and the current three generic visual shots are not its storyboard or a scene-count limit.

The dormant `assets/story-reader.js` module separates canonical text blocks from visual scenes. A manifest may contain any positive number of scenes. Several shots may refer to the same source block, so the text does not have to be rewritten or cut into three artificial units.

The model requires a supplied-source declaration, reviewed SHA-256 receipt, exact text blocks with source locations, and scene references. It preserves the order of each source block’s first appearance and rejects omissions, missing references and duplicate IDs. Text is inserted through `textContent`, with line breaks preserved. The declaration is a content-pipeline guard, not proof that an attachment was actually received; human intake remains mandatory.

The reader component builds scene navigation from the manifest length, with previous/next bounds, a scene list, keyboard controls, semantic paragraphs/headings and a motion control. Local images or explicitly registered renderers supply the visuals. Renderer lifecycle methods pause hidden/reduced-motion views and dispose each scene. The base module creates no audio and imports no external media. Any future audio requires explicit opt-in.

No reader page currently loads this module. `LITERARY_READER` remains unset in the generator; an action to enter a story must not appear until a real local HTML reader and reviewed source-backed manifest exist. The current public interlude is labelled a generic technical sample, not the story’s events, final scene plan or complete text.

Next intake sequence:

1. Receive the user-provided file/text and record its digest without publishing private paths.
2. Review the actual page columns and continuations. The reference scan’s final page interleaves material from another story; flat extraction must not be copied blindly.
3. Preserve the exact narrative as canonical source blocks, then design as many illustrated scenes as its events and reading rhythm require.
4. Produce and review the actual assets, connect the reader, test it with the real text across devices and motion preferences, then publish it as a functioning narrative.

`node tools/check-story-reader.cjs` exercises synthetic data only: one, seven and seventeen scenes, source preservation and coverage/order failures. DOM presentation and real narrative integration remain untested until the actual book input and assets exist.
