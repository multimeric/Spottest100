import { SimpleTrack } from "./simpleTrack";

/**
 * Processes incoming tracks and retrieves them as an array
 */
export class TrackRegistry {
    private tracks: Map<string, SimpleTrack>;

    constructor(tracks: Map<string, SimpleTrack> = new Map()) {
        this.tracks = new Map(tracks);
    }

    get length() {
        return this.tracks.size;
    }   
    
    processTrackSet(tracks: SimpleTrack[]) {
        for (let track of tracks) {
            const current = this.tracks.get(track.id);
            if (current){
                if (!current.sources.includes(track.sources[0]))
                    current.sources.push(track.sources[0]);
            }
            else {
                this.tracks.set(track.id, track);
            }
        }
        return new TrackRegistry(this.tracks);
    }

    toArray() {
        return Array.from(this.tracks.values());
    }
}