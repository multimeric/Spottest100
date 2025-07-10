import { SimpleTrack } from "./simpleTrack";
import { VotingList } from "./votingList";

/**
 * Gets the start (inclusive) and end (exclusive) dates for eligible songs in that year. e.g. for 2019 this would be
 * 1 December 2018 and 30 November 2019
 */
function eligibilityPeriod(year: number): [Date, Date] {
    return [
        new Date(year - 1, 11, 1), // December of the previous year
        new Date(year, 11, 1), // December of the current year is too late
    ];
}

/**
 * Filters tracks by year, returning only those tracks eligible for the given year.
 * @param year The year to filter tracks by.
 */
export function byYear(tracks: SimpleTrack[], year: number): SimpleTrack[] {
    const [start, end] = eligibilityPeriod(year);
    return tracks.filter(track => {
        const date = new Date(track.releaseDate);
        return date >= start && date < end;
    })
}

/**
 * Filters tracks by a voting list, returning only those tracks that are in the voting list.
 */
export function byVotingList(tracks: SimpleTrack[], votingList: VotingList | null): SimpleTrack[] {
    if (!votingList) {
        // If no voting list is provided, return all tracks
        return tracks;
    }
    return tracks.filter(track => votingList.hasId(track.id));
}

/**
 * Filters tracks by artist, ensuring that no artist has more than a specified number of songs in the result.
 * @param tracks The array of tracks to filter.
 * @param maxSongs The maximum number of songs allowed per artist.
 */
export function byArtistMaxSongs(tracks: SimpleTrack[], maxSongs: number): SimpleTrack[] {
    // We can bypass the filtering if maxSongs is set to Infinity, meaning no limit.
    if (maxSongs == Infinity) return tracks;
    
    const artistCount = new Map<string, number>();
    return tracks.filter(track => {
        for (const artist of track.artists) {
            const currentCount = (artistCount.get(artist) || 0) + 1;
            if (currentCount > maxSongs) 
                return false
            artistCount.set(artist, currentCount);
        }
        return true;
    });
}