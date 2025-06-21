import { SimpleTrack } from "../simpleTrack";
import { useVotingList } from "../votingList";
import { TrackGrid } from "../trackGrid";
import { byVotingList, byArtistMaxSongs, byYear } from "../filters"
import { Controller, useForm } from "react-hook-form"
import { Checkbox, FormControl, FormControlLabel, FormLabel, Grid2, InputLabel, OutlinedInput, Stack, Switch, TextField, Typography } from "@mui/material"
import { ArtistLimit } from "../artistLimit";

type Inputs = {
    limitPerArtist: number
    votingListFilter: boolean
}

export function Countdown2024({ favourites }: {
    favourites: SimpleTrack[],
}) {
    const { watch, control } = useForm<Inputs>({
        defaultValues: { limitPerArtist: Infinity, votingListFilter: false }
    })
    const limitPerArtist = watch("limitPerArtist");
    const votingListFilter = watch("votingListFilter");
    const votingList = useVotingList("2024.json");
    let filtered: SimpleTrack[] = favourites;

    // Successively apply filters based on the user's selection
    if (votingListFilter) {
        if (votingList)
            filtered = byVotingList(filtered, votingList);
        else
            // Show no results if the voting list is not available
            filtered = []
    }
    else {
        filtered = byYear(filtered, 2024);
    }
    // Always apply the artist limit after filtering by year or voting list, since it's the most computationally expensive filter.
    filtered = byArtistMaxSongs(filtered, limitPerArtist).sort(track => track.rank);

    return (
        <Grid2 container spacing={2}>
            <ArtistLimit control={control} />
            <TextField
                variant="outlined"
                label="Eligibility"
                multiline
                slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                        inputComponent: () => <Stack direction="row" spacing={2} alignItems="center" sx={{ padding: '8px' }}>
                            <Typography>Release Year</Typography>
                            <Controller
                                name="votingListFilter"
                                control={control}
                                render={({ field }) => <Switch {...field} />}
                            />
                            <Typography>Voting List</Typography>
                        </Stack>
                    }
                }}
            />
            <TrackGrid tracks={filtered} />
        </Grid2>
    )
}