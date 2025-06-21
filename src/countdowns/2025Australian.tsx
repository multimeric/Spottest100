import { SimpleTrack } from "../simpleTrack";
import { useVotingList } from "../votingList";
import { TrackGrid } from "../trackGrid";
import { byVotingList, byArtistMaxSongs } from "../filters"
import { useForm } from "react-hook-form"
import { Grid2 } from "@mui/material"
import { ArtistLimit } from "../artistLimit";

type Inputs = {
    limitPerArtist: number
}

export function Australian2025Countdown({ favourites }: {
    favourites: SimpleTrack[],
}) {
    const { watch, control } = useForm<Inputs>({
        defaultValues: { limitPerArtist: Infinity }
    })
    const limitPerArtist = watch("limitPerArtist");
    const votingList = useVotingList("2025_australian.json");
    const filtered: SimpleTrack[] = votingList ?
        byArtistMaxSongs(byVotingList(favourites, votingList), limitPerArtist).sort(track => track.rank)
        :
        [];

    return (
        <Grid2 container spacing={2}>
            <ArtistLimit control={control} />
            <TrackGrid tracks={filtered}/>
        </Grid2>
    )
}