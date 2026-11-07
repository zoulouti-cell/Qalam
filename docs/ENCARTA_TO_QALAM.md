# Using Encarta’s organization in Qalam

Encarta is a reference for organizing knowledge resources and relationships. Its original text, images, video, audio, and interactive assets remain separate from Qalam’s publishable content unless their reuse rights are established.

## Structure carried forward

| Encarta pattern | Qalam destination |
| --- | --- |
| Article IDs and titles | Stable `Article.id`, localized titles, canonical slugs |
| Numbered article sections | Structured article sections and learning steps |
| Related-article links | `Article.related` knowledge graph |
| Key facts | Labeled fact cards with source references |
| Suggested citations | Per-language source records, revision links, attribution, and license |
| Illustration, audio, video, map, and interactive object | Separate asset records with individual source, credit, license, and accessibility text |
| Search resource types | Filters for articles, diagrams, maps, media, simulations, and learning paths |

## What the Encarta extraction report provides

The local reverse-engineering report describes a large title catalog, section-heading index, descriptive snippets, quizzes, and atlas data. It also states that full article bodies in the Encarta content packages have not yet been extracted. Qalam should use the report to inform taxonomy and authoring priorities; it should not treat the catalog as a substitute for a source-verified modern article corpus.

## Current Qalam pilot

The Sun article now has a time-and-space sequence from the early universe to early evidence of life. Each milestone links to a NASA source, and the copy changes between the child and school reading levels. The existing Three.js solar-system scene remains available alongside the timeline. This pattern can be extended to history, Earth systems, technology, and human development with reviewed datasets and separately credited media.
