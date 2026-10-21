# Content refresh — 21 October 2026

Added 1,089 video IDs (894.4 hours) relative to the pre-refresh snapshot. 14 previous entries were removed during metadata revalidation. The dedicated-show channels remain exclusive to their named shows. Bollywood retains its video-song policy.

**Status: incomplete.** 63 of 125 channels meet the 168-hour distinct-video-ID runtime floor. This is not a certification of 168 hours of different footage: reuploads, compilations, and internally looping videos may overlap. Do not advertise a repeat-free week for every channel.

## Saved history

- [Complete pre-refresh catalogues](content-history/2026-10-21-before-refresh/catalogs.json)
- [Source configuration and runtime manifest](content-history/2026-10-21-before-refresh/manifest.json)
- [All additions with source links](content-history/2026-10-21-all-additions.json)
- [History-checked discovery additions](content-history/2026-10-21-additions.json)
- [Machine-readable coverage audit](weekly-content-audit.json)

## Remaining shortfalls

| Channel | Current hours | Hours short |
|---|---:|---:|
| Cricket | 64.0 | 104.0 |
| Jungle Book | 17.0 | 151.0 |
| Shaktimaan | 162.8 | 5.2 |
| Ramayan | 46.3 | 121.7 |
| Football | 105.5 | 62.5 |
| Vintage India | 2.8 | 165.2 |
| Dogs | 90.6 | 77.4 |
| Formula | 7.7 | 160.3 |
| Good News | 64.0 | 104.0 |
| Dance | 164.1 | 3.9 |
| Cats | 51.1 | 116.9 |
| Ocean | 158.9 | 9.1 |
| Classic Music | 168.0 | 0.0 |
| Mountains | 29.2 | 138.8 |
| Desert | 4.0 | 164.0 |
| Aurora | 32.5 | 135.5 |
| Clouds | 6.4 | 161.6 |
| Stars | 155.1 | 12.9 |
| Whales | 15.2 | 152.8 |
| Pandas | 25.5 | 142.5 |
| Bees | 19.1 | 148.9 |
| Farm | 24.2 | 143.8 |
| Choir | 69.3 | 98.7 |
| Blues | 36.3 | 131.7 |
| Reggae | 46.8 | 121.2 |
| Flamenco | 9.9 | 158.1 |
| Gospel | 4.0 | 164.0 |
| Disco | 4.2 | 163.8 |
| Funk | 20.6 | 147.4 |
| Score | 10.2 | 157.8 |
| Celtic | 2.4 | 165.6 |
| Sitar | 20.0 | 148.0 |
| Kora | 11.2 | 156.8 |
| Fado | 8.1 | 159.9 |
| Gagaku | 1.8 | 166.2 |
| Mariachi | 5.1 | 162.9 |
| Highlife | 124.9 | 43.1 |
| Gamelan | 75.8 | 92.2 |
| Harp | 13.2 | 154.8 |
| Organ | 5.5 | 162.5 |
| Ink | 25.6 | 142.4 |
| Paris | 76.3 | 91.7 |
| Venice | 126.5 | 41.5 |
| Kyoto | 70.6 | 97.4 |
| Marrakech | 48.9 | 119.1 |
| Havana | 47.1 | 120.9 |
| Seoul | 116.5 | 51.5 |
| Cairo | 68.1 | 99.9 |
| Andes | 43.2 | 124.8 |
| Iceland | 33.3 | 134.7 |
| Lisbon | 101.1 | 66.9 |
| Tai Chi | 2.2 | 165.8 |
| Rocks | 102.8 | 65.2 |
| Peloton | 149.9 | 18.1 |
| Camp | 167.1 | 0.9 |
| Bookshop | 0.6 | 167.4 |
| Vinyl | 79.0 | 89.0 |
| Dawn | 17.5 | 150.5 |
| Dusk | 43.6 | 124.4 |
| Wind | 23.0 | 145.0 |
| Puppets | 38.7 | 129.3 |
| Lakes | 85.5 | 82.5 |

## Constraints and verification

The user explicitly requires named-show channels to stay exclusive. New Shaktimaan search results repeated episode numbers already in the catalogue and were not added. Jungle Book and Ramayan remain below a week; additional distinct episodes from those same shows are required. Renaming channels, adding unrelated shows, duplicating uploads, and inflating durations are not acceptable substitutes.

All 125 current catalogues were revalidated through YouTube metadata. New discovery candidates were checked for public/embeddable status and India availability, and screened by title for relevance, obvious compilations, loops, and duplicate titles. This screening does not replace watching and fingerprinting the underlying media. Future curation should compare both episode identities and footage, not just video IDs.

Build passed; 258 catalogue/broadcast tests and 9 bundle tooling tests passed. The content audit intentionally exits nonzero because 62 channels remain short. Changes are local; no deployment was performed.
