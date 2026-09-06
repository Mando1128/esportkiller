const liveBase = 'https://live.pandascore.co/api';

/** Starts a PandaScore sandbox replay for testing the live LoL pipeline. */
export async function startLolReplay(token, { gameId, ingameTimestamp = 0, playbackSpeed = 1 } = {}) {
  if (!token) throw new Error('PANDASCORE_TOKEN is required for sandbox replay');
  if (!gameId) throw new Error('A PandaScore LoL gameId is required for sandbox replay');
  const response = await fetch(`${liveBase}/lol/replay?token=${encodeURIComponent(token)}`, {
    method: 'POST', headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ game_id: gameId, ingame_timestamp: ingameTimestamp, playback_speed: playbackSpeed }),
  });
  if (!response.ok) throw new Error(`PandaScore LoL replay request failed: ${response.status}`);
  return response.json();
}

/** Starts a Counter-Strike replay; roundNumber is optional for seeking. */
export async function startCsgoReplay(token, { gameId, roundNumber = null, playbackSpeed = 1 } = {}) {
  if (!token) throw new Error('PANDASCORE_TOKEN is required for sandbox replay');
  const body = { playback_speed: playbackSpeed, round_number: roundNumber };
  if (gameId) body.game_id = gameId;
  const response = await fetch(`${liveBase}/csgo/replay?token=${encodeURIComponent(token)}`, {
    method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`PandaScore CS2 replay request failed: ${response.status}`);
  return response.json();
}
