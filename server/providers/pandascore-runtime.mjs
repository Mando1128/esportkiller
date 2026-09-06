import { LiveFeedHub } from './pandascore-live.mjs';
import { startLolReplay, startCsgoReplay } from './pandascore-replay.mjs';

/** One service facade for live subscriptions and sandbox replays. */
export class PandaScoreRuntime {
  constructor(token) { this.token = token; this.live = new LiveFeedHub(token); }
  subscribe(listener) { return this.live.subscribe(listener); }
  syncLive() { return this.live.sync(); }
  stop() { this.live.stop(); }
  async startReplay({ title, gameId, ingameTimestamp, roundNumber, playbackSpeed } = {}) {
    const replay = title === 'lol'
      ? await startLolReplay(this.token, { gameId, ingameTimestamp, playbackSpeed })
      : await startCsgoReplay(this.token, { gameId, roundNumber, playbackSpeed });
    return { title, ...replay };
  }
}
