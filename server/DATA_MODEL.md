# Live research model

The production board is computed from an immutable raw-event store and a normalized player-game table. Every record includes the provider timestamp, source identifier, game patch, match, map/game number, player, team, opponent, role, and stat values. This makes L5/L10/L15/L20, season, H2H, and same-patch filters reproducible.

Player profiles are resolved with `/players/{id_or_slug}` and joined to the roster snapshot valid at the time of each game; current profile data must never overwrite historical team/role context.

The searchable player directory is paged from `/players`; the sync job stores the provider ID as the canonical identity and updates display names without breaking prior game records.

The team catalog is paged from `/teams` and joined to match records by immutable provider IDs. Team profiles power roster checks, map/side splits, game-length distributions, and pace/style aggregates.

The match catalog uses `/matches`, `/matches/upcoming`, `/matches/running`, and `/matches/past` to maintain the complete research universe. All pagination should be exhausted server-side before reporting that a player or team has no relevant history.

## Detail card calculations

- **Distribution bars:** each finished game is displayed against the projection line; green means the selected More/Less result hit, red means it missed.
- **Team game length:** median, 25th/75th percentile, and share of games below/above configurable short/long thresholds. Thresholds are title-specific, not one global number.
- **Team style:** rolling early-game leads, objective/round conversion, pace, economy, and map/side splits. Only metrics available for the selected title are shown.
- **Player feed / usage:** rolling share of team kills, damage, gold/CS (where available), first-contact/first-blood involvement, and teammate-absent splits. The UI must label these as descriptive signals, not causal forecasts.
- **Patch context:** exact game patch stored for every game. The card compares player and team results within the current patch and labels a sample as insufficient when too small.
- **Dota hero context:** persist `hero_id`, localized hero name, and hero image URL with every Dota game. The catalog is synchronized from `/dota2/heroes`; player cards can then filter form, usage, and game length by hero or draft composition.
- **League champion context:** persist champion identity and patch-stamped champion metadata from `/lol/champions`. Show champion-specific form, role/champion pairing, composition history, and sample size separately from the player’s overall form.
- **Last-game replacement:** expected starting roster is compared with the most recent completed-game roster. The card reports substitutions, stand-ins, benchings, role swaps, and map-specific replacements.
- **Replacement impact:** for each absence/replacement, show the focal player's sample size, average, hit rate, usage share, and team game length with that teammate in versus out. This must remain a split, not an unsupported claim that a player will receive more opportunities.

## Refresh design

1. Poll the provider's incident/change feed every 60 seconds for fixture, roster, and result corrections.
2. Subscribe to the provider WebSocket only for live matches; persist frames/events with their provider timestamp.
3. Refresh a live match summary every 10–30 seconds, depending on the provider license and rate limit.
4. Recompute player and team aggregates after a final-game event, then invalidate only that match's cached cards.
5. Collect patch metadata daily from official patch-note feeds. Never infer a patch from a publication date alone.
6. Reconcile rosters before every upcoming match, then record a lineup snapshot when a game starts. Flag an event whenever the active five differs from the last completed map or from the announced roster.

For example, discover new Counter-Strike competitions with `/additions?type=tournament,serie,league&videogame=cs-go`; track roster changes through the changes feed; and treat deletions/merges as a cache invalidation event. Persist the incident checkpoint in the production database so restarts do not replay historical changes.

All displayed times are stored in UTC and formatted in the browser using the viewer's IANA timezone and locale.
