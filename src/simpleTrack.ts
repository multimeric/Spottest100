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
    id: string;
    name: string;
    artists: string[];
    sources: Source[];
    releaseDate: Date;
    spotifyUrl: string;
}

export function convertTrack(track: Track, source: Source): SimpleTrack {
    return {
        id: track.id,
        name: track.name,
        artists: track.artists.map(artist => artist.name),
        sources: [source],
        releaseDate: new Date(track.album.release_date),
        spotifyUrl: track.external_urls.spotify,
    };
}