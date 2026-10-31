# Website verification

The site is a static community resource. Teaching interactions are exact small-number examples, separate from Scout, PGN work acceptance, records, coins and rewards.

## Repeatable checks

Run from the repository root:

```text
python tools/build.py
python tools/check.py
node --check assets/site.js
node tools/check-interactions.cjs
python tools/check.py --external
```

The integrity checker covers nine HTML documents, local targets/fragments, duplicate IDs, landmarks, metadata, labelled controls, script provenance, source coverage, and forbidden stale claims/PDF links. The current result is 256 internal links, 18 curated sources and zero errors.

The independent interaction harness checks five consecutive-prime examples, invalid selection recovery, all 16 sieve-pass combinations against trial division, the 15 surviving primes and largest gap 6, challenge/reset behavior, five session stages, library filtering/long input/reset/history restoration, menu Escape/focus, and horizontal table arrow/Home/End keys. It is not a rendering test.

## Browser review on 31 October 2026

All seven pages were rendered and screenshots inspected at CSS widths320, 768 and 1280 pixels. All seven were also checked at actual native Chrome 200% zoom, confirmed by the browser UI and device-pixel ratio 2; no document horizontal overflow was observed. A320px heading break inside “Extraordinary” was found and fixed with a narrower-phone type scale. The browser zoom was restored to 100%.

Computed foreground/background contrast was checked for rendered HTML text in the default states, using 4.5:1 for ordinary text and 3:1 for large text. There were no remaining failures in those samples. The original small-number label contrast of 4.485:1 was corrected. Control borders were strengthened and interactive targets enlarged. This is not an exhaustive audit of every visual state or a full assistive-technology audit.

Real browser checks cover:

- All five explorer options, including2→3 with zero interior integers.
- Sieve passes using Space/Enter and pointer input; wrong/correct challenge feedback. The exact state space is covered separately by the harness.
- All seven library categories, combined Videos+Maynard filtering, Unicode/punctuation and 160-character queries, empty results and clear/focus recovery.
- Browser Back after a committed Software navigation, verifying both Maynard text and Videos pressed state. A lost category was found and fixed using per-entry browser history state; no query is copied into a URL.
- Menu open/Escape/focus, skip-link focus on main, all 12 FAQ items, all five Scout session stages, and keyboard scrolling of wide tables.
- Real JavaScript-disabled teaching and library fallback: exact explanatory text remains available, inert controls are disabled, the navigation remains visible and the unused menu button is hidden.
- Reduced-motion mode makes document scrolling immediate. Temporary emulation was restored.
- The literary note opens with pointer/keyboard input, fits the narrow viewport, has no PDF or full-story reader link, states clearly that the complete story is not included, and closes with Escape while restoring summary focus.
- No page console errors were observed during the retained interaction runs.

Some browser bridge operations returned stale page context after Back. The decisive Back check used committed navigation plus the browser accessibility protocol to inspect the restored page, rather than mistaking bridge metadata for page behavior.

## Source review and deployment

See source-review.md for semantic checks, source-checks.json for bounded availability/video metadata, sources.json for attribution and scope, and release-check.json for the verification receipt. HTTP200 alone does not certify a claim.

The current source is published from main through GitHub Pages. Live content equality and the actual Pages build commit are recorded in the mission handoff after publication.

## Remaining boundaries

Robert/community editorial feedback remains useful. Network protocol details are attributed working proposals, not production verification. No GPU, consensus, reward or network-capacity test is claimed. The full literary reader awaits operator-supplied text; the current panel has an honest action opening the original visual study, while the full-story reader action remains absent. There is no public PDF URL or embed.

## Original cinematic prototype

The separate interlude.html route contains three original Canvas/SVG shots about chance, patience and checking. All three shots were rendered at 320, 768 and 1280 CSS pixels without document horizontal overflow. The scene buttons, Home/ArrowRight keyboard control, comparison overlay, pause, and an automatically advancing sequence were observed in the browser. Reduced-motion mode starts with still frames. The real JavaScript-disabled fallback exposes all three captions and disables playback controls. No page console errors were observed in the retained runs.

Motion uses a bounded frame loop, pauses when the page is hidden, and caps canvas pixel ratio at 1.5; these are implementation limits, not hardware-independent performance or energy claims. There is no generated video or audio asset. The new interlude’s additional native 200% zoom check was interrupted by a physical Escape stop before it ran; the earlier 200% check covered the seven main pages. No missing check is promoted to a pass.

The visual study is an original prototype, not a complete adaptation or a full text reader. Integration of the full story remains dependent on operator-supplied text.
