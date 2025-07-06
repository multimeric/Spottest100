import React from "react";
import { SimpleTrack } from "../simpleTrack";
import { useForm } from "react-hook-form";
import { useVotingList } from "../votingList";
import { byArtistMaxSongs, byVotingList } from "../filters";

// const countdowns: Record<string, CountdownHook> = {
//   "2025-Australian": useAustralian2025Countdown,
//   // "2024": {
//   //   name: "Hottest 100 of 2024",
//   //   component: Countdown2024
//   // }
// }

type CountDownId = "2024" | "2025-Australian";


export type Countdown = {
    // Countdown name
    name: string
    // Components that 
    settings: React.FC
    filter: (tracks: SimpleTrack[]) => SimpleTrack[]
}

export function useCountdown(countdown: CountDownId ): Countdown {
    let defaults;
    let votingListUrl;
    if (countdown === "2025-Australian") {
    }
    else if (countdown === "2024") {
    }


    const { watch, control } = useForm({
        defaultValues: { limitPerArtist: Infinity }
    })
    const limitPerArtist = watch("limitPerArtist");
    const votingList = useVotingList("2025_australian.json");
    const filter = (tracks: SimpleTrack[]) => {
        if (votingList)
            return byArtistMaxSongs(byVotingList(tracks, votingList), limitPerArtist).sort(track => track.rank)
        else
            return [];
    }

    return {
        name: "Hottest 100 of Australian Songs",
        settings: () => <ArtistLimit control={control} />,
        filter: filter
    }
}
