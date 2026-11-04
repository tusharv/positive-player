# Channel sharing cards

Eleven photorealistic broadcast posters, exported as 1200 × 630 PNGs:
one each for the first ten channels (Bollywood through Space), and `fallback.png`
for all other channels. The rooms are AI-generated imagined period scenes, not
archival photographs or broadcaster endorsements. The Jungle Book screen uses
a user-provided cartoon screenshot; other screen scenes are generated imagery.

Created with the built-in image-generation tool on 4 November 2026. The visual
direction is a lived-in late-1980s Indian living room, weathered teal walls,
warm amber light, a wood-grain CRT with curved reflective glass, lace and VHS
tapes. Ivory condensed titles and 1988.in branding sit in dark negative space
to the left; the channel-specific broadcast fills the television at the right.
The Jungle Book card uses the user's Mowgli close-up screenshot (4 November 2026,
1:27:47 PM), fitted inside the television in the photorealistic room.
The fallback screen shows analogue colour bars. The checked-in PNGs mean normal
builds and deployments do not depend on an image-generation service.

The station tagline is “Come back to a simpler time.”, also used by the landing
page and social metadata. All eleven cards carry this line at the bottom left.

`src/lib/channelShareCard.ts` selects the image used by both the share dialog
and the preview metadata. Selection uses channel names so reordering the lineup
cannot silently attach another channel's artwork.

`npm run build` generates `dist/share-pages/*.html` from the built app shell.
Vercel's `/watch` rewrite and the standalone Node server serve these pages for
`/watch?channel=N`. Each page retains the player app and built asset links, but
has its own title, description, canonical URL, Open Graph and Twitter tags.
Channels outside the featured ten retain their own metadata and use the generic
image. Invalid or missing channel parameters use the generic watch page.

Local development and `vite preview` display the card in the sharing dialog;
use `npm run build && npm start` to verify the server-returned social metadata.
Other static hosts need an equivalent `/watch` handler for query-based previews.
