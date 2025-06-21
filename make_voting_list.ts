import type { VotingListTrack } from "src/votingList";

const chunks = [];
for await (const chunk of process.stdin) {
    chunks.push(chunk);
}

const parsed = JSON.parse(chunks.join(""));
const simplified: VotingListTrack[] = Object.values(parsed).map(track => ({
    track: track.spotify_track_id,
    title: track.title,
    artist: track.artists.map(artist => artist.title).join(", "),
}));
process.stdout.write(JSON.stringify(simplified));
export { };

