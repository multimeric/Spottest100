import { useEffect, useMemo, useState } from "react";
import { SimpleTrack } from "./simpleTrack";
import { useVotingList, VotingList } from "./votingList";
import { SpotifyApi, Track } from '@spotify/web-api-ts-sdk';
import { TrackGrid } from "./trackGrid";
import { byVotingList, byArtistMaxSongs } from "./filters"
import { useForm, SubmitHandler, Controller, Control } from "react-hook-form"
import { FormControl, Grid2, Input, InputLabel, MenuItem, Select } from "@mui/material"
import { useDerivedState } from "./useDerived";

type Inputs = {
    limitPerArtist: number
}

function ArtistLimit({ control }: { control: Control<Inputs> }) {
    return (
        <FormControl fullWidth>
            <InputLabel>Max Songs per Artist</InputLabel>
            <Controller
                name="limitPerArtist"
                control={control}
                render={({ field }) => <Select
                    {...field}
                    label="Max Songs per Artist"
                // You can also add `error` or `helperText` from fieldState if needed
                >
                    <MenuItem value={Infinity}>Any</MenuItem>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(value => (
                        <MenuItem key={value} value={value}>{value}</MenuItem>
                    ))}
                </Select>}
            />
        </FormControl>
    )
}

export function Australian2025Countdown({ favourites }: {
    favourites: SimpleTrack[],
}) {
    const {
        watch,
        control,
        formState: { errors },
    } = useForm<Inputs>({
        defaultValues: {
            limitPerArtist: Infinity, // Default to no limit
        }
    })
    const limitPerArtist = watch("limitPerArtist");

    const votingList = useVotingList("2025_australian.json");
    // const filtered = useDerivedState(favourites, (tracks) => {
    //     if (!votingList) return tracks;
    //     return byArtistMaxSongs(byVotingList(tracks, votingList), limitPerArtist);
    // }, [])
    let filtered: SimpleTrack[];
    if (!votingList) {
        filtered = []
    }
    else {
        filtered = byArtistMaxSongs(byVotingList(favourites, votingList), limitPerArtist).sort(track => track.rank);
    }

    return (
        <Grid2 container spacing={2}>
            <ArtistLimit control={control} />
            <TrackGrid tracks={filtered} seen={favourites.length} />
        </Grid2>
    )
}


// export function use2025Countdown(tracks: SimpleTrack[]): [JSX.Element, SimpleTrack[]] {
//     const {
//         watch,
//         control,
//         formState: { errors },
//     } = useForm<Inputs>()
//     const limitPerArtist = watch("limitPerArtist");

//     const form = (
//         <Controller
//             name="limitPerArtist"
//             control={control}
//             render={({ field }) => <Input {...field} />}
//         />
//     )

//     const filtered = useDerivedState(tracks, (tracks) => byArtistMaxSongs(tracks, limitPerArtist))

//     return [
//         form,
//         filtered
//     ]
// }