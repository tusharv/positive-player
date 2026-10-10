# Content history

Each refresh saves an immutable, dated snapshot before changing the deployed programme lists.

- `catalogs.json`: complete previous lists, keyed by channel name, with video IDs, editorial titles, and durations.
- `manifest.json`: channel numbers, source playlists, topic filters, archive timestamp, and unique duration totals.

The first snapshot, `2026-10-10-before-weekly-refresh`, preserves all 125 channels before the weekly expansion. Consult these snapshots when curating future additions; compare video IDs across snapshots to distinguish new content from material used before. These are metadata archives, not downloaded videos, and are outside the website bundle.

Do not overwrite or delete past snapshots. New refreshes use a new timestamp. Reusing an archive name is an error.

A week's coverage means at least 604,800 seconds of distinct video IDs per channel, using actual durations. Different uploads or compilations can contain overlapping footage; metadata uniqueness alone does not prove editorial uniqueness. Never fill a shortfall with duplicated IDs, inflated durations, or unrelated programmes.
