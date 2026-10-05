# Channel popularity and playback health

The app emits events to the existing Google Tag Manager data layer and the Microsoft Clarity client API. This code does not create GA4 properties, install a Clarity project, publish GTM changes, or configure reports automatically. Deploy the app changes and complete the setup below. If your base GA4 and Clarity tags already exist, reuse them rather than installing duplicates.

## What is measured

| Event | Meaning | Counting rule |
| --- | --- | --- |
| `channel_select` | A viewer turns on the TV or changes to a different channel | Once per tune; excludes automatic retries and selections while powered off |
| `channel_play` | YouTube confirms playback on that channel | Once per tune; excludes buffering resumes and subsequent programmes on the same channel |
| `channel_error` | Catalog, player, or player-script failure | Once per distinct reason/code/video per tune; identical automatic retries are suppressed |

Every GA4 event includes `channel_number`, `channel_name`, and `channel_category`. It also includes `video_id`, `failure_stage`, `failure_reason`, and `error_code`; unused fields are empty so GTM does not carry a previous error into a successful play event. No pairing codes, remote tokens, arbitrary error messages, API keys, or personal identifiers are included.

Popularity here means successful tunes, not minutes watched. A channel may recover after an error, so a tune can have both a play and an error. Multiple different videos can fail in one tune: error count divided by selection count is not a percentage failure rate. Analytics blockers and provider consent settings affect coverage. Clarity replay cannot show the contents of the cross-origin YouTube iframe; the custom events expose the app's playback state.

## Google Tag Manager and GA4: one-time setup

1. Open the site's existing GTM container (configured by `VITE_GTM_ID`). Ensure its Google tag uses your GA4 web-stream measurement ID.
2. Create Data Layer Variables, version 2, for these seven names: `channel_number`, `channel_name`, `channel_category`, `video_id`, `failure_stage`, `failure_reason`, `error_code`. Name the variables `DLV - channel_name`, etc.
3. Create a **Custom Event** trigger. Enable regular-expression matching and use exactly `^channel_(select|play|error)$`.
4. Create a **Google Analytics: GA4 Event** tag using the existing Google tag/measurement ID. Set Event Name to the built-in `{{Event}}` variable. Add the seven event parameters using the same names and their matching Data Layer Variables. Attach the trigger from step 3. Apply your existing analytics consent settings.
5. In GTM Preview, turn on the TV, change channels, and confirm `channel_select` then `channel_play`. A load alone must not produce `channel_play`. Check that each has the correct channel and that the GA4 event tag fires once. Confirm receipt in GA4 DebugView, then publish the GTM container.
6. In GA4 **Admin → Custom definitions**, create event-scoped dimensions for `channel_name`, `channel_number`, `channel_category`, `failure_stage`, `failure_reason`, and `error_code`. Keep `video_id` available in DebugView/BigQuery rather than registering it by default: individual videos can produce high cardinality. Custom dimensions need processing time and do not backfill historical reports.

### Most popular channels

Create a Free-form Exploration with **Channel name** as rows, **Event count** and **Total users** as values, and filter **Event name exactly matches `channel_play`**. Sort by Event count descending. Save as **Popular channels**. Use `channel_select` in a separate exploration to see attempts, including attempts that never started.

### Failing channels

Create a Free-form Exploration with **Channel name**, **Failure stage**, and **Failure reason** as rows, **Event count** and **Total users** as values, and filter **Event name exactly matches `channel_error`**. Save as **Channel failures**. Compare failure volume with channel selection/popularity volume; a busy channel naturally has more opportunities to fail. `error_code` distinguishes YouTube player errors, such as 100 (unavailable), 101/150 (embedding blocked), and 153 (player configuration).

`catalog_empty` means no eligible videos remain, including an unavailable playlist or exhausted failed videos. `catalog_fetch` covers unsuccessful API responses; `quota_exceeded` covers quota responses recognized by the loader. `network_error`, `missing_api_key`, and `iframe_script_failed` distinguish other operational failures. A cached catalog that successfully serves playback after a refresh failure is not reported as a viewer playback failure. Silent hangs/autoplay blocking without a YouTube error callback are not counted as errors.

## Microsoft Clarity: one-time setup

Ensure the site's Clarity tracking tag is installed in the existing GTM container and configured with your Clarity project ID and consent settings. The app queues a bounded number of API calls if that tag loads late; it does not load an additional Clarity script.

The app sends both generic events (`channel_select`, `channel_play`, `channel_error`) and channel-specific events such as:

- `channel_play_001`: confirmed Bollywood viewing
- `channel_play_002`: confirmed Cricket viewing
- `channel_error_002`: Cricket encountered a failure

Use **Smart events** in Clarity to compare the channel-specific play events and filter recordings by a channel-specific error event. Custom tags `channel_name`, `channel_number`, and `channel_failure` help find sessions. Tags accumulate within a session and are not event-scoped: a viewer who visits several channels can have several tags. Use `channel_error_002`, rather than combining the generic error event with a visited-channel tag, to attribute failures to Cricket.

Open a failed session recording to inspect the surrounding interactions and custom-event timeline. Do not add a second GTM tag that forwards these same data-layer events to Clarity: the app already calls Clarity directly.

## Verification and limitations

Automated tests exercise actual store event emission, confirmed playback, duplicate callbacks, automatic retries, stale video callbacks, Clarity late-load queuing, and provider failures. YouTube callbacks are mocked; receiving data in your GA4/Clarity accounts must be verified in GTM Preview, GA4 DebugView, and Clarity after deployment.

The privacy page describes these analytics events. Preserve provider consent controls; the app does not grant consent through either analytics API.

References: [Google data layer](https://developers.google.com/tag-platform/devguides/datalayer), [GTM custom event triggers](https://support.google.com/tagmanager/answer/7679219), [Clarity client API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api), [YouTube player errors](https://developers.google.com/youtube/iframe_api_reference#onError).
