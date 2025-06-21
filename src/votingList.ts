import { useEffect, useState } from "react";

export interface VotingListTrack {
    title: string;
    artist_name: string;
    spotify_track_id: string;
}

export function useVotingList(url: string) {
    const [votingList, setVotingList] = useState<VotingList | null>(null);
    async function loadVotingList(url: string) {
        const res = await fetch(url);
        const parsed = await res.json();
        setVotingList(new VotingList(parsed));
    }
    useEffect(() => {
        loadVotingList(url);
    }, [url]);

    return votingList;
}

export class VotingList {
    tracks: VotingListTrack[];
    spotifyIds: Set<string>;

    constructor(tracks: VotingListTrack[]) {
        this.tracks = tracks;
        this.spotifyIds = new Set(tracks.map(track => track.spotify_track_id));
    }

    hasId(id: string): boolean {
        return this.spotifyIds.has(id);
    }
}

