import { MaxInt, Page, Track } from "@spotify/web-api-ts-sdk";
import {convertTrack, SimpleTrack, Source} from "./simpleTrack";

/**
 * Gets the start (inclusive) and end (exclusive) dates for eligible songs in that year. e.g. for 2019 this would be
 * 1 December 2018 and 30 November 2019
 */
export function eligibilityPeriod(year: number) : [Date, Date] {
    return [
        new Date(year - 1, 11, 1), // December of the previous year
        new Date(year, 11, 1), // December of the current year is too late
    ];
}

/**
 * Calculates the next Hottest 100 year based on the date
 */
export function upcomingYear(date: Date) : number {
    const votingCloses = new Date(
        date.getFullYear(),
        0,
        28,
        3,
    );

    if (date < votingCloses) {
        // If we're before the Hottest 100 date, the current year is the upcoming year
        return date.getFullYear() - 1;
    }
    else {
        // If we're after the Hottest 100 date, next year is the upcoming year
        return date.getFullYear();
    }
}


/**
 * Returns true if a track is eligible for the given year of hottest 100
 */
export function isEligible(track: Track, year: number) : boolean {
    const date = new Date(track.album.release_date);
    const [start, end] = eligibilityPeriod(year);
    return date >= start && date < end;
}

export function processPage(tracks: Track[], year: number, source: Source) : SimpleTrack[] {
    return tracks.filter(track => isEligible(track, year)).map(track => convertTrack(track, source));
}

/**
 * Repeatedly calls a pager function until all pages have been retrieved
 * @param pager Function to retrieve a page of items
 * @param pageSize Number of items per page
 * @returns All items from all pages
 */
export async function* getAllPages(pager: ((offset: number, pageSize: MaxInt<50>) => Promise<Page<Track>>), year: number, source: Source , pageSize: MaxInt<50> = 50) : AsyncGenerator<SimpleTrack[], void, void> {
    let currentPage = 0;
    let limit = 100;
    while (currentPage < limit) {
        const page = await pager(currentPage, pageSize);
        limit = page.total;
        yield processPage(page.items, year, source);
        currentPage += pageSize;
    }
}