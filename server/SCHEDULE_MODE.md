# Schedule-first mode

Pulse works before live market access is enabled.

1. Import upcoming matches and announced rosters from permitted schedule/roster sources.
2. Expand each scheduled team into its active roster, including substitutes where announced.
3. Attach pre-match player lines from a manually entered or licensed source.
4. Calculate L5/L10/L15/L20, H2H, team pace, game-length, role, loadout, champion/hero, patch, and replacement context from completed matches.
5. Mark every line with `source`, `publishedAt`, and `status: pre-match`.
6. Later, enable the live provider to add in-progress frames, events, and line changes without replacing the pre-match record.

This avoids claiming a board is live when it only contains pre-match information.
