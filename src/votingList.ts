import { useEffect, useState } from "react";

export interface Track {
    title: string;
    artist_name: string;
    spotify_track_id: string;
}

export const VOTING_LISTS = {
    "Australian Songs (2025)": "2025_australian.json"
    // "2024": "2025_australian.json",
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


export type VotingListName = keyof typeof VOTING_LISTS;

export class VotingList {
    tracks: Track[];
    spotifyIds: Set<string>;

    constructor(tracks: Track[]) {
        this.tracks = tracks;
        this.spotifyIds = new Set(tracks.map(track => track.spotify_track_id));
    }

    hasId(id: string): boolean {
        return this.spotifyIds.has(id);
    }
}

