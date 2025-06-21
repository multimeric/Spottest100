import { Controller, Control } from "react-hook-form"
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"

/**
 * Re-usable component for selecting the maximum number of songs per artist.
 */
export function ArtistLimit({ control }: { control: Control<any> }) {
    return (
        <FormControl fullWidth>
            <InputLabel>Max Songs per Artist</InputLabel>
            <Controller
                name="limitPerArtist"
                control={control}
                render={({ field }) => <Select
                    {...field}
                    label="Max Songs per Artist"
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
