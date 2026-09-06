import WebSocket from 'ws';

const withToken = (url, token) => `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;

/** Discover only currently-open PandaScore streams. Tokens remain server-side. */
export async function discoverLiveFeeds(token) {
  if (!token) return [];
  const response = await fetch(`https://api.pandascore.co/lives?token=${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error(`PandaScore lives request failed: ${response.status}`);
  const records = await response.json();
  return records.flatMap(record => (record.endpoints || []).filter(endpoint => endpoint.open).map(endpoint => ({
    matchId: endpoint.match_id, type: endpoint.type, expectedBeginAt: endpoint.expected_begin_at, url: endpoint.url,
  })));
}

/**
 * Keeps one connection per match/feed, forwards parsed messages to subscribers,
 * and never exposes PandaScore URLs with a token to the web client.
 */
export class LiveFeedHub {
  #sockets = new Map(); #listeners = new Set();
  constructor(token) { this.token = token; }
  subscribe(listener) { this.#listeners.add(listener); return () => this.#listeners.delete(listener); }
  emit(message) { for (const listener of this.#listeners) listener(message); }
  async sync() {
    const feeds = await discoverLiveFeeds(this.token);
    const permitted = new Set(feeds.map(feed => `${feed.matchId}:${feed.type}`));
    for (const [key, socket] of this.#sockets) if (!permitted.has(key)) { socket.close(); this.#sockets.delete(key); }
    for (const feed of feeds) this.connect(feed);
    return feeds.map(({ url, ...safe }) => safe);
  }
  connect(feed) {
    const key = `${feed.matchId}:${feed.type}`;
    if (this.#sockets.has(key)) return;
    const socket = new WebSocket(withToken(feed.url, this.token));
    this.#sockets.set(key, socket);
    socket.on('message', raw => { try { this.emit({ matchId:feed.matchId, feed:feed.type, receivedAt:new Date().toISOString(), data:JSON.parse(raw.toString()) }); } catch {} });
    socket.on('close', () => this.#sockets.delete(key));
    socket.on('error', () => socket.close());
  }
  stop() { for (const socket of this.#sockets.values()) socket.close(); this.#sockets.clear(); }
}
