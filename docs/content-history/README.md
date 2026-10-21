# Content history

Each refresh saves an immutable, dated snapshot before changing the deployed programme lists.

- `catalogs.json`: complete previous lists, keyed by channel name, with video IDs, editorial titles, and durations.
- `manifest.json`: channel numbers, source playlists, topic filters, archive timestamp, and unique duration totals.

The first snapshot, `2026-10-10-before-weekly-refresh`, preserves all 125 channels before the weekly expansion. Consult these snapshots when curating future additions; compare video IDs across snapshots to distinguish new content from material used before. These are metadata archives, not downloaded videos, and are outside the website bundle.

Do not overwrite or delete past snapshots. New refreshes use a new timestamp. Reusing an archive name is an error.

A week's coverage means at least 604,800 seconds of distinct video IDs per channel, using actual durations. Different uploads or compilations can contain overlapping footage; metadata uniqueness alone does not prove editorial uniqueness. Never fill a shortfall with duplicated IDs, inflated durations, or unrelated programmes.

## 21 October 2026 refresh

The complete pre-refresh state is in `2026-10-21-before-refresh/`. Consult `2026-10-21-all-additions.json` for all newly introduced IDs and source links, and `2026-10-21-additions.json` for the history-checked discovery batch. The user requires dedicated-show channels to stay exclusive to their named show. Do not broaden them to fill runtime gaps. See [the audit](../content-audit-2026-10-21.md) for unresolved shortfalls.
