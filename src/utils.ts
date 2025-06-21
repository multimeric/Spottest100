import { MaxInt, Page, Track } from "@spotify/web-api-ts-sdk";
import {convertTrack, SimpleTrack, Source} from "./simpleTrack";
import pLimit from "p-limit";

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

export function processPage(tracks: Track[], source: Source, offset: number) : SimpleTrack[] {
    return tracks.map((track, i) => convertTrack(track, source, offset + i));
}


/**
 * When awaited, will return an array of promises, each of which resolves to a page of tracks.
 * All such promises will be resolved in parallel.
 * @param pager Function to retrieve a page of items
 * @param concurrencyLimit Maximum number of concurrent requests to the pager function
 * @param pageSize Number of items per page
 */
export async function getAllPages(pager: ((offset: number, pageSize: MaxInt<50>) => Promise<Page<Track>>), source: Source, pageSize: MaxInt<50> = 50, concurrencyLimit: number = 5) : Promise<Promise<SimpleTrack[]>[]>{
    const concurrencyLimiter = pLimit(concurrencyLimit);

    // Wait for the first page, since we need to know the total number of items
    const firstPage = await pager(0, pageSize);
    const promises: Promise<SimpleTrack[]>[] = [Promise.resolve(processPage(firstPage.items, source, 0))];

    for (let i = pageSize; i < firstPage.total; i += pageSize) {
        promises.push(concurrencyLimiter(() => pager(i, pageSize).then(page => processPage(page.items, source, i))));
    }
    return promises;
}