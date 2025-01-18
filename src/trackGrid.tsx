import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { SimpleTrack, Source } from "./simpleTrack"

const formatSource: Record<Source, string> = {
    [Source.ShortTerm]: 'Short Term Favourite',
    [Source.MediumTerm]: 'Medium Term Favourite',
    [Source.LongTerm]: 'Long Term Favourite',
};

const columns: GridColDef<SimpleTrack>[] = [
    {
        field: 'name',
        headerName: 'Name',
        width: 300
    },
    {
        field: 'artists',
        headerName: 'Artists',
        width: 300,
        valueGetter: value => value.join(', ')
    },
    {
        field: 'source',
        headerName: 'Source',
        width: 200,
        valueGetter: value => formatSource[value]
    },
]

export function TrackGrid(props: { tracks: SimpleTrack[] }) {
    return <DataGrid
        rows={props.tracks}
        columns={columns}
        getRowId={track => track.name}
    />
}