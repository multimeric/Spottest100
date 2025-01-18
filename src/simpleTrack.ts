import { Track } from "@spotify/web-api-ts-sdk";

export enum Source {
    LongTerm,
    MediumTerm,
    ShortTerm,
    Library
}

/**
 * A stripped-down version of Spotify's Track object, removing superfluous fields
 */
export interface SimpleTrack {
    name: string;
    artists: string[];
    source: Source
}

export function convertTrack(track: Track, source: Source): SimpleTrack {
    return {
        name: track.name,
        artists: track.artists.map(artist => artist.name),
        source: source
    };
}