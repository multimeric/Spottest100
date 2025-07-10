const chunks = [];
for await (const chunk of process.stdin) {
    chunks.push(chunk);
}

const parsed = JSON.parse(chunks.join(""));
const simplified = Object.values(
    parsed
).filter(
    // Triple J exclude certain tracks on the voting list
    track => track.is_official && track.is_active
).map(track => ({
    id: track.spotify_track_id,
    title: track.title,
    artist: track.artists.map(artist => artist.title).join(", "),
}));
process.stdout.write(JSON.stringify(simplified));
export { };