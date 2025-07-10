import { IValidateResponses, MaxInt, Page, Track } from "@spotify/web-api-ts-sdk";
import { convertTrack, SimpleTrack, Source } from "./simpleTrack";
import PQueue from 'p-queue';
import { useThrottle } from "@uidotdev/usehooks";
import pThrottle from 'p-throttle';
import { useEffect, useRef, useState } from "react";
export function processPage(tracks: Track[], source: Source, offset: number): SimpleTrack[] {
    return tracks.map((track, i) => convertTrack(track, source, offset + i));
}

export type Pager = (offset: number, pageSize: MaxInt<50>) => Promise<Page<Track>>;
type OnPage = (items: SimpleTrack[]) => void

async function requestPage(pager: Pager, offset: number, source: Source, pageSize: MaxInt<50>, queue: PQueue): Promise<SimpleTrack[]> {
    try {
        const page = await pager(offset, pageSize);
        const processed = processPage(page.items, source, offset);
        return processed;
    }
    catch (error) {
        if (error instanceof SpotifyApiError && error.statusCode === 429) {
            queue.pause();
            await new Promise(r => setTimeout(r, 2000));
            queue.start();
            return queue.add(() => requestPage(pager, offset, source, pageSize, queue), { throwOnTimeout: true });
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
        queue.add(() => requestPage(pager, i, source, pageSize, queue));
    }
}

export class SpotifyApiError extends Error {
    constructor(message: string, public statusCode: number) {
        super(message);
    }
}

export const responseValidator: IValidateResponses = {
    validateResponse: async response => {
        if (!response.status.toString().startsWith("20")) {
            throw new SpotifyApiError(response.statusText, response.status);
        }
    }
}

export function useQueue(concurrencyLimit: number = 5) {
    const queue = useRef(new PQueue({ concurrency: concurrencyLimit }));
    const pause = useThrottle(() => queue.current.pause(), 1000);
    return [queue.current, pause];
}

/**
 * 
 * Hook to manage pagination of Spotify tracks.
 * @param pager Function to retrieve a page of items
 * @param source Source of the tracks, e.g. LongTerm, ShortTerm, etc
 * @param pageSize Number of items per page, defaults to 50
 * @param concurrencyLimit Maximum number of concurrent requests to the pager function, defaults to 5
 * @returns A tuple containing:
 * - tracks: An array of SimpleTrack objects representing the tracks
 * - loadMore: A function to load more pages, which returns a promise that resolves to the new tracks
 * - hasMore: A boolean indicating if there are more tracks to load
 * - isLoading: A boolean indicating if the queue is currently processing or has items
*/
export function usePager(
    pager: Pager | null,
    source: Source = Source.LongTerm,
    pageSize: MaxInt<50> = 50,
    concurrencyLimit: number = 5,
): [SimpleTrack[], (pages: number) => Promise<SimpleTrack[]>, boolean, boolean] {
    const maxRequested = useRef<number>(0);
    // Total number of tracks available
    const [total, setTotal] = useState(Infinity);
    // Sparse array of all tracks we have
    const [tracks, setTracks] = useState<SimpleTrack[]>([]);
    // A throttled version of the tracks to avoid re-rendering too often
    const queue = useRef(new PQueue({ concurrency: concurrencyLimit }));
    const [isLoading, setIsLoading] = useState(false);

    // Update the loading state when the queue changes
    useEffect(() => {
        queue.current.on("add", ()=> {
            setIsLoading(true);
        })
        queue.current.on("idle", () => {
            setIsLoading(false);
        })
    })

    // We need to request the first page to know the total number of items
    async function getFirstPage() {
        if (!pager) return;
        // Wait for the first page, since we need to know the total number of items
        const firstPage = await pager(0, pageSize);
        const processed = processPage(firstPage.items, source, 0);
        insertTracks(processed);
        setTotal(firstPage.total);
        maxRequested.current += pageSize;
    }
    useEffect(() => { getFirstPage() }, [])

    /**
     * Splice new tracks into the existing tracks array at the specified index.
     */
    function insertTracks(newTracks: SimpleTrack[]) {
        setTracks(tracks => {
            for (const track of newTracks) {
                tracks[track.rank] = track;
            }
            return [...tracks];
        })
    }

    /**
     * Updates the page limit to load more pages.
     * @param pages Number of pages to load
     * @returns A promise that resolves to the new tracks loaded.
     */
    async function loadMorePages(pages: number): Promise<SimpleTrack[]> {
        // See https://github.com/spotify/spotify-web-api-ts-sdk/issues/125
        // We need to ensure the first page is loaded before we can load more pages
        if (maxRequested.current === 0) return [];
        if (!pager) return [];
        if (queue.current.pending > 0 || queue.current.size > 0){
            // If the queue is already processing or has items, we don't need to load more pages
            // Wait for the queue to finish processing before returning
            await queue.current.onIdle();
            return [];
        }

        const promises: Promise<SimpleTrack[]>[] = [];
        // setMaxRequested(maxRequested + pages * pageSize);
        for (let i = 0; i < pages; i++) {
            // Offset is block scoped, so it's stable in async calls
            const offset = maxRequested.current;
            if (offset >= total)
                break
            promises.push(queue.current.add(async () => {
                const result = await requestPage(pager, offset, source, pageSize, queue.current);
                // Add to the master list of tracks as soon as we get the result
                insertTracks(result);
                return result;
            }, {
                throwOnTimeout: true,
            }));
            maxRequested.current += pageSize;
        }

        // Wait until all pages are loaded, then return the new tracks
        const newTracks: SimpleTrack[] = [];
        for (const result of await Promise.all(promises)) {
            newTracks.push(...result);
        }
        return newTracks;
    }

    // Convert the cached tracks to a dense array, removing any undefined entries
    const denseTracks = tracks.filter(track => track !== undefined);

    const throttle = pThrottle({
        interval: 2000,
        limit: 4
    })

    return [denseTracks, throttle(loadMorePages), maxRequested.current < total, isLoading];
}