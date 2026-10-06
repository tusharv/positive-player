# Channel 005 — DD Classics

Checked on 2026-10-06 using YouTube Data API video metadata.

2135 distinct video IDs, 825.49 hours (34 days, 9 hours, 29 minutes, 23 seconds). Includes 26 programme/ad groups and 204 vintage ad spots. Video counts include split episode parts, two opening themes, and advertisements; they are not counts of complete episodes.

[Full ordered catalogue, sources, durations and relative cycle times](dd-classics-catalogue.csv). Cycle day 1 is the beginning of the catalogue, not a calendar date. The broadcast clock uses Unix time modulo the full cycle duration; every viewer with the same available catalogue shares the same schedule.

## Included content

| Series / category | Videos | Hours | Sources |
| --- | ---: | ---: | --- |
| Surabhi | 58 | 23.90 | [Source 1](https://www.youtube.com/playlist?list=PLUiMfS6qzIMzE8lgWFaQ3qvVFCCONXALQ), [Source 2](https://www.youtube.com/playlist?list=UUZsUMUcdvXdW3GJp4wpchHA) |
| Vikram Aur Betaal | 26 | 10.04 | [Source 1](https://www.youtube.com/playlist?list=PL-eaGjSO6F70C3-LkA3kEqAIHkdDLhI6Q) |
| Shri Krishna | 219 | 168.23 | [Source 1](https://www.youtube.com/playlist?list=PLFPJRCFRDARR9IkjkVi6O9ue5DjKiKtkI) |
| Malgudi Days | 7 | 2.60 | [Source 1](https://www.youtube.com/playlist?list=PLIhvrpwTgKyrXD3jx9PSxMaP7_j53RmXS) |
| Dekh Bhai Dekh | 151 | 20.62 | [Source 1](https://www.youtube.com/playlist?list=UUYdB1nhxEAtjp-TLnv5utzg) |
| Flop Show | 10 | 4.06 | [Source 1](https://www.youtube.com/playlist?list=PLUiMfS6qzIMyisp9Ks0FxE9Ba4EpLQm0Z) |
| Wagle Ki Duniya | 12 | 4.69 | [Source 1](https://www.youtube.com/playlist?list=PL5TZ-0sMyEgVQcbG4E10bBeGcQEQ3WR-S) |
| Byomkesh Bakshi | 33 | 22.33 | [Source 1](https://www.youtube.com/playlist?list=PLUiMfS6qzIMxiHu2N2Px1ISp5vxCm3PMo) |
| Fauji | 13 | 4.99 | [Source 1](https://www.youtube.com/playlist?list=PLYqSow41YJ2I) |
| Circus | 19 | 7.80 | [Source 1](https://www.youtube.com/playlist?list=PLUiMfS6qzIMzAqteEcp055VDYpgZDbeyT) |
| Bharat Ek Khoj | 53 | 44.25 | [Source 1](https://www.youtube.com/playlist?list=PLqtVCj5iilH4w0Y8KBB4fqBu25T0sGhXG) |
| Chanakya | 84 | 37.90 | [Source 1](https://www.youtube.com/playlist?list=PLY-qGtGftCjm1_tDxT2TsDAXXC2p-iutt) |
| Hum Log | 59 | 21.73 | [Source 1](https://www.youtube.com/playlist?list=PLaNSOkABhCUE) |
| Nukkad | 22 | 8.45 | [Source 1](https://www.youtube.com/playlist?list=PLDXzvDkBVqqSGYLZPlZQfl_Vn-JmuiTDN) |
| Udaan | 20 | 9.14 | [Source 1](https://www.youtube.com/playlist?list=PLFSBneXK-Uv8l6Fs99d5HyhaMlW8q8tWk) |
| Alif Laila | 89 | 31.73 | [Source 1](https://www.youtube.com/playlist?list=PLqmdsOwstpJfOtjWGMFTGMruqQV7C5XoL) |
| Chandrakanta | 130 | 42.03 | [Source 1](https://www.youtube.com/playlist?list=PLKfQh0u-9j2YaM54LNfASdQYllxsoU05a) |
| Om Namah Shivay | 19 | 6.93 | [Source 1](https://www.youtube.com/playlist?list=PL5A5QJkW7MkuEgaSMSlkmc51V_jBHv6fO) |
| Swabhimaan | 745 | 260.08 | [Source 1](https://www.youtube.com/playlist?list=PLZeNWB9l7494) |
| Junoon | 18 | 7.04 | [Source 1](https://www.youtube.com/playlist?list=PLrkDcuaB2OX_ZuAo48tg5pEa2BjdoM8Y2) |
| The Great Maratha | 42 | 30.42 | [Source 1](https://www.youtube.com/playlist?list=PLL8R100698nc9lYCs25j4FrcGDyqdtq_B) |
| The Sword of Tipu Sultan | 52 | 36.51 | [Source 1](https://www.youtube.com/playlist?list=PLL8R100698ndzARBsLB6Z8jYs_52cDJJ7) |
| Tehkikaat | 48 | 17.53 | [Source 1](https://www.youtube.com/playlist?list=PLImQCagB5etA0FMEJ7yrWIUBCzxgOBikn) |
| Vintage ads | 204 | 2.41 | [Source 1](https://www.youtube.com/playlist?list=PLycor1XF7S9HVMnWxndl27HgZJM5S8wRT), [Source 2](https://www.youtube.com/playlist?list=PLhgnBue3FjS1UaszaMj5FPFLsG7rvL0Bn) |
| Alice in Wonderland | 1 | 0.03 | [Video](https://www.youtube.com/watch?v=r7Xqy2J6B90) |
| Potli Baba Ki | 1 | 0.04 | [Video](https://www.youtube.com/watch?v=ZjS77v9pQQE) |

## Source and availability limits

- Public, processed, embeddable recordings with a positive API duration were selected. India region exclusions were filtered out. Metadata eligibility is not a guarantee of iframe playback in every region; the existing player skips failed videos.
- Episodes are sorted within each series. Alternate uploads of the same numbered episode/part are collapsed, and full versions take precedence over split copies. Split parts of an episode stay together. Series blocks and ad spots are distributed throughout the cycle, not appended as single-show marathons. Missing episodes are not manufactured or repeated to reach the duration target.
- Alice in Wonderland: original Hindi opening theme only (90 seconds). No verified full Hindi episode source found. Modern adaptations and English uploads were excluded.
- Potli Baba Ki: Hindi title song only (132 seconds). No verified full episode source found. Short uploads misleadingly titled “Episode 1” were not treated as full episodes.
- Himgiri Ka Veer: not added; no verified full Hindi episode source found. Search results included retrospectives and unrelated kung-fu series. The programme is associated with Home TV in historical references, not confirmed as a DD original.
- Malgudi Days, Dekh Bhai Dekh and several other series have incomplete availability. Many prominent publisher uploads disable embedding. Available alternatives and episode parts are included with their source links.
- Long-running DD shows, including Swabhimaan, supplement the priority shows to exceed 720 hours without padding with repeat video IDs.

## Maintenance

The authoritative curated selection is `src/data/programs/005.json`. `HAND_PICKED_PROGRAMS['DD Classics']` imports that selection, so `npm run bundle:programs` preserves the month-long schedule instead of restoring the old twelve Chanakya videos. Update the ordered catalogue and this source audit together; regenerate the manifest content hash when programming changes.

Runtime validation processes all curated IDs in 50-video batches, retains curated labels (including theme-only labels), and permits intentionally curated sub-minute ad spots. Live playlist/search discovery retains its existing limits and minimum length. Catalogues longer than one day use a continuous clock; shorter catalogues retain their daily rotation.
