# Content expansion audit — 10 October 2026

**Target: 168 continuous hours per channel, without repeating a video ID. Status: 62/125 channels meet the measured duration threshold; 63 do not. This task's full content requirement remains incomplete.**

Compared with the [original snapshot](content-history/2026-10-10-before-weekly-refresh/manifest.json), this expansion adds **42,781 per-channel video entries** (12,619.9 hours of programming across channels), including **41,575 video IDs not present anywhere in the original lineup**. It removes 64 previously listed entries that failed availability or editorial checks. Videos shared between relevant channels are counted separately in per-channel totals; each individual channel contains unique IDs.

The full original lists, titles, durations, and channel sources are retained in [content history](content-history/README.md). Intermediate refresh snapshots are retained too. Current lists remain in `src/data/programs/`; their content hashes were regenerated so browsers will not reuse the old selections.

## Collection and limits

- Expanded the configured playlists beyond the old 50-video bundle limit, scanning up to 100 pages per source until the duration target was reached or the playlist ended.
- Added individually selected IDs from additional publishers in [the supplementary source list](../scripts/weekly-supplements.json). Entries record publisher names/IDs or the originating curated channel. Craft includes woodworking/pottery and Classic Music includes traditional music from its existing specialist channels.
- Checked actual YouTube durations, public status, embedding, India region availability, age restrictions, and whether streams had ended. Existing short vintage ad spots and editorial labels were preserved.
- Retained Formula's alternative publishers rather than importing the known iframe-blocked official Formula 1 upload feed.
- The count is metadata-based, not a review of every video in an iframe or every minute of footage. Compilations and different uploads can overlap internally; ambient films may contain loops. These figures therefore do not certify 168 hours of entirely distinct footage.
- The existing scheduler already traverses multi-day catalogues continuously without a daily reset. No schedule padding or invented durations were introduced.
- Narrow channels remain short. Related-show expansion has not been applied to Jungle Book or Ramayan while that editorial decision is pending. Other narrow themes need further sources or a broader remit, too.

`npm run audit:content` deliberately fails until every channel has valid entries, no duplicate IDs, and at least 604,800 seconds. Normal software tests can pass while this content-coverage check fails. `npm run refresh:weekly` writes improvements but exits with code 2 if any channel remains short or encounters an API error.

## Per-channel coverage

“Added” compares with the original snapshot, not just the last collection pass. Hours are rounded for display; the threshold is checked using exact seconds.

| Channel | Name | Videos | Hours | Hours still needed | Added | Status |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| 001 | Bollywood | 472 | 230.0 | 0.0 | 471 | Meets duration |
| 002 | Cricket | 66 | 50.4 | 117.6 | 48 | SHORT / needs curation |
| 003 | Jungle Book | 48 | 17.0 | 151.0 | 36 | SHORT / needs curation |
| 004 | Shaktimaan | 235 | 162.8 | 5.2 | 223 | SHORT / needs curation |
| 005 | DD Classics | 2,133 | 824.5 | 0.0 | 0 | Meets duration |
| 006 | Ramayan | 78 | 46.3 | 121.7 | 66 | SHORT / needs curation |
| 007 | Mahabharat | 1,234 | 172.2 | 0.0 | 1,222 | Meets duration |
| 008 | Animals | 345 | 170.6 | 0.0 | 335 | Meets duration |
| 009 | Street Food | 448 | 174.2 | 0.0 | 436 | Meets duration |
| 010 | Space | 135 | 193.1 | 0.0 | 129 | Meets duration |
| 011 | Football | 73 | 102.2 | 65.8 | 50 | SHORT / needs curation |
| 012 | Tokyo | 148 | 184.5 | 0.0 | 98 | Meets duration |
| 013 | Vintage India | 198 | 2.8 | 165.2 | 0 | SHORT / needs curation |
| 014 | Dogs | 1,453 | 85.4 | 82.6 | 1,403 | SHORT / needs curation |
| 015 | Kitchen | 721 | 174.2 | 0.0 | 671 | Meets duration |
| 016 | Formula | 15 | 7.7 | 160.3 | 12 | SHORT / needs curation |
| 017 | Craft | 742 | 168.3 | 0.0 | 692 | Meets duration |
| 018 | Good News | 412 | 63.9 | 104.1 | 362 | SHORT / needs curation |
| 019 | Safari | 847 | 295.2 | 0.0 | 797 | Meets duration |
| 020 | Dance | 1,883 | 144.9 | 23.1 | 1,833 | SHORT / needs curation |
| 021 | Olympics | 572 | 170.5 | 0.0 | 522 | Meets duration |
| 022 | Talks | 940 | 175.4 | 0.0 | 890 | Meets duration |
| 023 | Cats | 671 | 45.4 | 122.6 | 621 | SHORT / needs curation |
| 024 | Circus | 652 | 172.1 | 0.0 | 602 | Meets duration |
| 025 | Nature | 419 | 177.3 | 0.0 | 370 | Meets duration |
| 026 | Ocean | 326 | 158.9 | 9.1 | 276 | SHORT / needs curation |
| 027 | Lofi | 81 | 172.0 | 0.0 | 31 | Meets duration |
| 028 | Classic Music | 1,445 | 168.0 | 0.0 | 1,395 | SHORT / needs curation |
| 029 | Rain | 51 | 510.1 | 0.0 | 1 | Meets duration |
| 030 | Fireplace | 27 | 299.5 | 0.0 | 19 | Meets duration |
| 031 | Forest | 39 | 171.4 | 0.0 | 28 | Meets duration |
| 032 | Mountains | 12 | 29.2 | 138.8 | 5 | SHORT / needs curation |
| 033 | Desert | 4 | 4.0 | 164.0 | 0 | SHORT / needs curation |
| 034 | River | 50 | 170.0 | 0.0 | 0 | Meets duration |
| 035 | Falls | 87 | 402.4 | 0.0 | 37 | Meets duration |
| 036 | Snow | 50 | 543.8 | 0.0 | 0 | Meets duration |
| 037 | Aurora | 15 | 32.5 | 135.5 | 5 | SHORT / needs curation |
| 038 | Clouds | 100 | 6.4 | 161.6 | 50 | SHORT / needs curation |
| 039 | Stars | 2,141 | 155.0 | 13.0 | 2,091 | SHORT / needs curation |
| 040 | Aquarium | 231 | 334.1 | 0.0 | 181 | Meets duration |
| 041 | Birds | 45 | 208.3 | 0.0 | 30 | Meets duration |
| 042 | Whales | 15 | 7.8 | 160.2 | 10 | SHORT / needs curation |
| 043 | Horses | 122 | 190.1 | 0.0 | 72 | Meets duration |
| 044 | Pandas | 110 | 25.5 | 142.5 | 88 | SHORT / needs curation |
| 045 | Bees | 30 | 19.1 | 148.9 | 0 | SHORT / needs curation |
| 046 | Farm | 9 | 5.3 | 162.7 | 0 | SHORT / needs curation |
| 047 | Reef | 23 | 184.1 | 0.0 | 16 | Meets duration |
| 048 | Piano | 100 | 213.1 | 0.0 | 50 | Meets duration |
| 049 | Guitar | 1,109 | 168.3 | 0.0 | 1,059 | Meets duration |
| 050 | Violin | 829 | 171.4 | 0.0 | 779 | Meets duration |
| 051 | Choir | 499 | 69.3 | 98.7 | 449 | SHORT / needs curation |
| 052 | Ambient | 110 | 295.6 | 0.0 | 60 | Meets duration |
| 053 | Soul | 2,325 | 168.0 | 0.0 | 2,275 | Meets duration |
| 054 | Blues | 31 | 36.3 | 131.7 | 24 | SHORT / needs curation |
| 055 | Reggae | 561 | 46.8 | 121.2 | 511 | SHORT / needs curation |
| 056 | Bossa | 235 | 953.4 | 0.0 | 221 | Meets duration |
| 057 | Flamenco | 16 | 1.2 | 166.8 | 0 | SHORT / needs curation |
| 058 | Gospel | 36 | 4.0 | 164.0 | 0 | SHORT / needs curation |
| 059 | Disco | 50 | 4.2 | 163.8 | 0 | SHORT / needs curation |
| 060 | Funk | 207 | 20.6 | 147.4 | 157 | SHORT / needs curation |
| 061 | Score | 127 | 10.2 | 157.8 | 77 | SHORT / needs curation |
| 062 | Celtic | 60 | 2.4 | 165.6 | 11 | SHORT / needs curation |
| 063 | Sitar | 68 | 11.1 | 156.9 | 20 | SHORT / needs curation |
| 064 | Kora | 88 | 8.3 | 159.7 | 77 | SHORT / needs curation |
| 065 | Fado | 92 | 8.1 | 159.9 | 42 | SHORT / needs curation |
| 066 | Gagaku | 11 | 1.8 | 166.2 | 0 | SHORT / needs curation |
| 067 | Mariachi | 25 | 5.1 | 162.9 | 0 | SHORT / needs curation |
| 068 | Highlife | 1,206 | 124.9 | 43.1 | 1,156 | SHORT / needs curation |
| 069 | Gamelan | 354 | 75.8 | 92.2 | 304 | SHORT / needs curation |
| 070 | Opera | 900 | 171.1 | 0.0 | 850 | Meets duration |
| 071 | Harp | 202 | 12.7 | 155.3 | 152 | SHORT / needs curation |
| 072 | Flute | 31 | 268.6 | 0.0 | 0 | Meets duration |
| 073 | Organ | 45 | 5.5 | 162.5 | 0 | SHORT / needs curation |
| 074 | Baking | 773 | 148.7 | 19.3 | 723 | SHORT / needs curation |
| 075 | Coffee | 630 | 179.1 | 0.0 | 580 | Meets duration |
| 076 | Tea | 428 | 169.7 | 0.0 | 378 | Meets duration |
| 077 | Pasta | 850 | 173.4 | 0.0 | 800 | Meets duration |
| 078 | Clay | 852 | 198.3 | 0.0 | 802 | Meets duration |
| 079 | Wood | 709 | 188.0 | 0.0 | 659 | Meets duration |
| 080 | Glass | 351 | 182.9 | 0.0 | 301 | Meets duration |
| 081 | Ink | 47 | 2.7 | 165.3 | 0 | SHORT / needs curation |
| 082 | Paint | 386 | 173.1 | 0.0 | 336 | Meets duration |
| 083 | Yarn | 947 | 199.3 | 0.0 | 897 | Meets duration |
| 084 | Paper | 780 | 182.6 | 0.0 | 730 | Meets duration |
| 085 | Paris | 11 | 23.1 | 144.9 | 2 | SHORT / needs curation |
| 086 | Venice | 31 | 53.2 | 114.8 | 0 | SHORT / needs curation |
| 087 | Kyoto | 5 | 8.5 | 159.5 | 0 | SHORT / needs curation |
| 088 | Marrakech | 21 | 13.2 | 154.8 | 2 | SHORT / needs curation |
| 089 | Havana | 37 | 10.6 | 157.4 | 0 | SHORT / needs curation |
| 090 | Seoul | 221 | 46.2 | 121.8 | 171 | SHORT / needs curation |
| 091 | Cairo | 15 | 25.1 | 142.9 | 0 | SHORT / needs curation |
| 092 | Andes | 134 | 9.1 | 158.9 | 84 | SHORT / needs curation |
| 093 | Iceland | 3 | 3.0 | 165.0 | 0 | SHORT / needs curation |
| 094 | Kerala | 2,157 | 170.0 | 0.0 | 2,107 | Meets duration |
| 095 | Lisbon | 362 | 14.0 | 154.0 | 312 | SHORT / needs curation |
| 096 | Yoga | 492 | 183.9 | 0.0 | 442 | Meets duration |
| 097 | Still | 198 | 174.0 | 0.0 | 148 | Meets duration |
| 098 | Tai Chi | 12 | 2.2 | 165.8 | 0 | SHORT / needs curation |
| 099 | Museum | 370 | 197.4 | 0.0 | 320 | Meets duration |
| 100 | Buildings | 625 | 178.5 | 0.0 | 575 | Meets duration |
| 101 | History | 161 | 173.7 | 0.0 | 140 | Meets duration |
| 102 | Rocks | 388 | 75.6 | 92.4 | 338 | SHORT / needs curation |
| 103 | Words | 2,002 | 169.3 | 0.0 | 1,952 | Meets duration |
| 104 | Chess | 61 | 171.4 | 0.0 | 11 | Meets duration |
| 105 | Gardens | 347 | 183.3 | 0.0 | 297 | Meets duration |
| 106 | Trains | 51 | 184.1 | 0.0 | 1 | Meets duration |
| 107 | Sailing | 529 | 168.6 | 0.0 | 479 | Meets duration |
| 108 | Tennis | 849 | 191.9 | 0.0 | 799 | Meets duration |
| 109 | Hoops | 487 | 169.4 | 0.0 | 437 | Meets duration |
| 110 | Peloton | 1,153 | 109.9 | 58.1 | 1,147 | SHORT / needs curation |
| 111 | Ice | 493 | 170.7 | 0.0 | 443 | Meets duration |
| 112 | Surf | 682 | 563.7 | 0.0 | 632 | Meets duration |
| 113 | Trail | 52 | 171.5 | 0.0 | 2 | Meets duration |
| 114 | Camp | 435 | 167.1 | 0.9 | 385 | SHORT / needs curation |
| 115 | Library | 193 | 193.7 | 0.0 | 143 | Meets duration |
| 116 | Bookshop | 14 | 0.6 | 167.4 | 0 | SHORT / needs curation |
| 117 | Vinyl | 54 | 79.0 | 89.0 | 5 | SHORT / needs curation |
| 118 | Dawn | 7 | 17.5 | 150.5 | 0 | SHORT / needs curation |
| 119 | Dusk | 14 | 43.6 | 124.4 | 0 | SHORT / needs curation |
| 120 | Storm | 242 | 456.0 | 0.0 | 192 | Meets duration |
| 121 | Wind | 5 | 23.0 | 145.0 | 1 | SHORT / needs curation |
| 122 | Market | 290 | 188.3 | 0.0 | 240 | Meets duration |
| 123 | Festival | 237 | 173.0 | 0.0 | 190 | Meets duration |
| 124 | Puppets | 130 | 4.9 | 163.1 | 80 | SHORT / needs curation |
| 125 | Lakes | 32 | 85.5 | 82.5 | 0 | SHORT / needs curation |

## Verification

- All 125 original lists were compared with the pre-change Git versions and match the archived snapshot exactly.
- Application tests: 558 passed. Bundle/archive/eligibility tests: 9 passed.
- Production build, changed-file lint, and whitespace checks passed.
- Offline content coverage: 62 passed, 63 below the threshold; no duplicate video IDs or invalid entries were reported.
- The local browser reached the player consent screen. No consent was accepted, and this is not claimed as successful iframe playback verification.
- Changes are local; no deployment was performed.

## Bollywood video-only correction

Bollywood now contains 472 publisher-labelled video-song/video-jukebox entries, totalling 230.0 hours by distinct video ID. The correction removes 113 audio-labelled or ambiguous entries and adds 414 qualifying entries compared with the immediate previous Bollywood list. Titles labelled audio, lyrical/lyrics, visualizer, karaoke, instrumental, or lofi are rejected even if they also say “video.” Unlabelled mixes are excluded rather than assumed to contain filmed songs.

Sources include T-Series, YRF, Zee Music Company, Tips Official, and Saregama Music. New IDs were checked for actual duration, public/embeddable status, India availability, age restrictions, and live status. Video format is established from publisher labels, not a frame-by-frame review of all 230 hours. Different compilations may still contain the same songs.

The previous Bollywood list and its supplementary candidates are in [the video-only correction archive](content-history/2026-10-10-bollywood-before-video-only/manifest.json). The weekly collector applies the policy to both retained and new metadata, and the bundle writer rejects noncompliant Bollywood entries before writing any files. The hand-picked reference now uses this curated list so it cannot restore the old audio/mix seeds. Content hashes have been updated to invalidate old cached selections.
