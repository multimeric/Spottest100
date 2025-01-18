import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { SimpleTrack, Source } from "./simpleTrack"

const formatSource: Record<Source, string> = {
    [Source.ShortTerm]: 'Short Term Favourite',
    [Source.MediumTerm]: 'Medium Term Favourite',
    [Source.LongTerm]: 'Long Term Favourite',
    [Source.Library]: 'Saved Track'
};

const columns: GridColDef<SimpleTrack>[] = [
    {
        field: 'name',
        headerName: 'Name',
        width: 200,
        renderCell: x => <a href={x.row.spotifyUrl}>{x.row.name}</a>
    },
    {
        field: 'artists',
        headerName: 'Artists',
        width: 200,
        valueGetter: (artists: string[]) => artists.join(', ')
    },
    {
        field: 'releaseDate',
        headerName: 'Release Date',
        width: 200,
        valueGetter: (value: Date) => value.toLocaleDateString()
    },
    {
        field: 'sources',
        headerName: 'Source',
        width: 200,
        valueGetter: (sources: Source[]) => sources.map(source => formatSource[source]).join(', ')
    },
]

export function TrackGrid(props: { tracks: SimpleTrack[] }) {
    return <DataGrid
        rows={props.tracks}
        columns={columns}
        getRowId={track => track.name}
        disableRowSelectionOnClick
        initialState={{
            pagination: {
                paginationModel: {
                    pageSize: 10
                }
            }
        }}
    />
}