import CircularProgress from '@mui/material/CircularProgress';
import { getAllPages, processPage } from './utils'
import { SimpleTrack, Source } from './simpleTrack';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Paper } from '@mui/material';
import { VotingList, VotingListName, VOTING_LISTS } from './votingList';

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
        field: 'album',
        headerName: 'Album',
        width: 200
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

export function InnerGrid(props: { tracks: SimpleTrack[] }) {
    return <DataGrid
        rows={props.tracks}
        columns={columns}
        getRowId={track => track.id}
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

/**
 * Wrapper component for the TrackGrid that shows a loading spinner if no tracks are available.
 */
export function TrackGrid({ tracks, seen }: {
    tracks: SimpleTrack[],
    seen: number
}) {
    let content = null;
    if (tracks.length > 0) {
        content = <InnerGrid tracks={tracks} />;
    }
    else {
        content = (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Paper sx={{ padding: 2, textAlign: 'center' }}>
                    <p>No tracks found</p>
                    <p>Seen {seen} tracks</p>
                    <CircularProgress />
                </Paper>
            </Box>
        );
    }

    return content;
}