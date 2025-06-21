import { Track } from "@spotify/web-api-ts-sdk";

export enum Source {
    LongTerm,
    MediumTerm,
    ShortTerm,
    Library
}

/**
 * A stripped-down version of Spotify's Track object to reduce the memory footprint
 */
export interface SimpleTrack {
    rank: number;
    id: string;
    name: string;
    album: string;
    artists: string[];
    sources: Source[];
    releaseDate: Date;
    spotifyUrl: string;
    thumbnail: string | null;
}

export function convertTrack(track: Track, source: Source, rank: number): SimpleTrack {
    return {
        rank: rank,
        id: track.id,
        name: track.name,
        album: track.album.name,
        artists: track.artists.map(artist => artist.name),
        sources: [source],
        releaseDate: new Date(track.album.release_date),
        spotifyUrl: track.external_urls.spotify,
        thumbnail: track.album.images.length > 0 ? track.album.images[0].url : null
    };
}

export function rerankTracks(tracks: SimpleTrack[]): SimpleTrack[] {
    return tracks.map((track, index) => ({
        ...track,
        rank: index + 1 // Ranks start at 1
    }));
}