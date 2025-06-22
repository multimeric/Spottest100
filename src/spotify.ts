import { MaxInt, Page, Track } from "@spotify/web-api-ts-sdk";
import { convertTrack, SimpleTrack, Source } from "./simpleTrack";
import pLimit from "p-limit";
import PQueue from 'p-queue';
import pRetry, { AbortError } from 'p-retry';
export function processPage(tracks: Track[], source: Source, offset: number): SimpleTrack[] {
    return tracks.map((track, i) => convertTrack(track, source, offset + i));
}

type Pager = (offset: number, pageSize: MaxInt<50>) => Promise<Page<Track>>;
type OnPage = (items: SimpleTrack[]) => void

async function requestPage(pager: Pager, offset: number, source: Source, pageSize: MaxInt<50>, onPage: OnPage, queue: PQueue) {
    try {
        const page = await pager(offset, pageSize);
        const processed = processPage(page.items, source, offset);
        onPage(processed);
    }
    catch (error) {
        if (error instanceof Error && error.message.includes("exceeded its rate limits")) {
            console.warn("Rate limit exceeded. Pausing...");
            queue.pause();
            // Retry on rate limit errors
            queue.add(() => requestPage(pager, offset, source, pageSize, onPage, queue));
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