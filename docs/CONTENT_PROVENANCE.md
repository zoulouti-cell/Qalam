# Content provenance and attribution

Qalam keeps the origin of article text visible and records it with the article data. This lets readers inspect the original source and lets future imports preserve the exact revision used.

## Imported Wikipedia excerpts

- `src/wikiArticles.json` stores a source record for every available language of each imported article.
- Source records identify the Wikipedia page, contributors, applicable text license, and a link to the license.
- The current cache has page links but predates revision tracking. Rerunning `scripts/fetch_wiki.cjs` refreshes the curated topics; `scripts/fetch_wiki_cats.cjs` refreshes the category harvest. Both record the revision ID and timestamp, link to that fixed revision, and merge updates without dropping the rest of the corpus.
- Imported content is an introductory excerpt, shortened and reformatted for the learning interface. The article view labels this adaptation and links to the source.
- Wikipedia text is reused under CC BY-SA 4.0. Reused text and adapted text must retain attribution and comply with the license terms.
- The article header no longer claims every item was updated in 2026. A date should appear only when a source revision or editorial review date is actually recorded.

## Original Qalam content and media

- Original Qalam articles without a source record are explicitly labeled as having no verified source recorded yet; this is a reminder to add references before treating them as fact-checked.
- Images, video, audio, maps, and 3D models need their own source and license records. An article's text license does not automatically apply to its media.
- `public/assets/media-manifest.json` lists the current banner, brand, and map assets. The 18 local records are marked for source/license review because the original project did not preserve their credits.
- `scripts/fetch_imgs.cjs` now requests Commons file-page metadata and saves newly found images as candidates outside `public/`, with the source page, author/credit, license, and retrieval time recorded. Candidates stay out of the app until reviewed and selected. Commons notes that its machine-readable metadata can be incomplete, so it still needs human review.
- Encarta-derived material is kept out of the distributable article corpus. Encarta can inform Qalam's taxonomy, article relationships, and multimedia organization; each Encarta text or media item requires separate rights review before reuse.

## Refreshing imported excerpts

Run `node scripts/fetch_wiki.cjs` from the project root to refresh the curated school-topic list, or `node scripts/fetch_wiki_cats.cjs` to refresh category-harvested topics. Both write extracted text and source/revision records together to `src/wikiArticles.json` while preserving other articles.
