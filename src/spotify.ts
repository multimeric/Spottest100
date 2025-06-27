import { IValidateResponses, MaxInt, Page, Track } from "@spotify/web-api-ts-sdk";
import { convertTrack, SimpleTrack, Source } from "./simpleTrack";
import PQueue from 'p-queue';
import { useThrottle } from "@uidotdev/usehooks";
import { useEffect, useRef, useState } from "react";
export function processPage(tracks: Track[], source: Source, offset: number): SimpleTrack[] {
    return tracks.map((track, i) => convertTrack(track, source, offset + i));
}

type Pager = (offset: number, pageSize: MaxInt<50>) => Promise<Page<Track>>;
type OnPage = (items: SimpleTrack[]) => void

async function requestPage(pager: Pager, offset: number, source: Source, pageSize: MaxInt<50>, queue: PQueue): Promise<SimpleTrack[]> {
    try {
        const page = await pager(offset, pageSize);
        const processed = processPage(page.items, source, offset);
        return processed;
    }
    catch (error) {
        if (error instanceof SpotifyApiError && error.statusCode === 429) {

            return queue.add(() => requestPage(pager, offset, source, pageSize, queue), {throwOnTimeout: true});
            console.warn("Rate limit exceeded. Pausing...");
            queue.pause();
            // Retry on rate limit errors
            queue.add(() => requestPage(pager, offset, source, pageSize, queue));
            // But wait a bit before retrying
            await new Promise(r => setTimeout(r, 2000));
            queue.start();
            console.warn("Resumed");
        }
        throw error;
    }
}

/**
 * Retrieves all pages of results, with sensible concurrency and retries
 * @param pager Function to retrieve a page of items
 * @param concurrencyLimit Maximum number of concurrent requests to the pager function
 * @param pageSize Number of items per page
 * @param onPage Callback to process each page of items
 */
export async function getAllPages(
    pager: Pager,
    onPage: OnPage,
    source: Source,
    pageSize: MaxInt<50> = 50,
    concurrencyLimit: number = 5
): Promise<void> {
    const queue = new PQueue({ concurrency: concurrencyLimit });
    // Wait for the first page, since we need to know the total number of items
    const firstPage = await pager(0, pageSize);
    onPage(processPage(firstPage.items, source, 0));

    for (let i = pageSize; i < firstPage.total; i += pageSize) {
        queue.add(() => requestPage(pager, i, source, pageSize, onPage, queue));
    }
}

export class SpotifyApiError extends Error {
    constructor(message: string, public statusCode: number) {
        super(message);
    }
}

export const responseValidator: IValidateResponses = {
    validateResponse: async response => {
        if (response.status != 200) {
            throw new SpotifyApiError(response.statusText, response.status);
        }
    }
}

export function useQueue(concurrencyLimit: number = 5) {
    const queue = useRef(new PQueue({ concurrency: concurrencyLimit }));
    const pause = useThrottle(() => queue.current.pause(), 1000);
    return [queue.current, pause];
}

export function usePager(
    pager: Pager,
    // Current track limit, to avoid requesting too many items at once
    limit: number = 100,
    source: Source = Source.LongTerm,
    pageSize: MaxInt<50> = 50,
    concurrencyLimit: number = 5,
){
    // Number of tracks requested so far
    const [maxRequested, setMaxRequested] = useState(0);
    // Total number of tracks available
    const [total, setTotal] = useState(0);
    const [tracks, setTracks] = useState<SimpleTrack[]>([]);
    // A throttled version of the tracks to avoid re-rendering too often
    const cachedTracks = useThrottle(tracks, 500);
    const queue = useRef(new PQueue({ concurrency: concurrencyLimit }));

    // We need to request the first page to know the total number of items
    async function getFirstPage(){
        // Wait for the first page, since we need to know the total number of items
        const firstPage = await pager(0, pageSize);
        const processed = processPage(firstPage.items, source, 0);
        setTracks(tracks => [...tracks, ...processed]);
        setTotal(firstPage.total);
    }
    useEffect(() => { getFirstPage() }, [pager, source])

    // As soon as we know the total number of items, we request the rest of the pages using the queue
    useEffect(() => {
        if (total === 0) return;

        for (let i = pageSize; i < Math.min(total, limit); i += pageSize) {
            queue.current.add(() => requestPage(pager, i, source, pageSize,queue.current));
        }
    }, [pager, source, total, limit, pageSize]);

    function loadMorePages(pages: number){
        setMaxRequested(maxRequested + pages * pageSize);
    }

    return [cachedTracks, loadMorePages];

}