import CircularProgress from '@mui/material/CircularProgress';
import { getAllPages, processPage } from './utils'
import { rerankTracks, SimpleTrack, Source } from './simpleTrack';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Avatar, Box, Grid, Grid2, Link, Paper, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { VotingList, VotingListName, VOTING_LISTS } from './votingList';

const formatSource: Record<Source, string> = {
    [Source.ShortTerm]: 'Short Term Favourite',
    [Source.MediumTerm]: 'Medium Term Favourite',
    [Source.LongTerm]: 'Long Term Favourite',
    [Source.Library]: 'Saved Track'
};

const columns: GridColDef<SimpleTrack>[] = [
    {
        field:"rank",
        headerName: 'Rank',
        width: 50
    },
    // {
    //     field: 'thumbnail',
    //     headerName: '',
    //     width: 60,
    //     renderCell: (params) => {
    //         if (!params.row.thumbnail) return null;
    //         return <Avatar src={params.row.thumbnail} alt={params.row.name} style={{ width: '52px', height: '52px' }} />;
    //     }
    // },
    {
        field: 'name',
        headerName: 'Track',
        flex: 1,
        // width: 200,
        renderCell: x => <Link href={x.row.spotifyUrl}><Grid2 sx={{
            display: 'flex',
            flexDirection: 'row',
            // Space between the avatar and the text
            alignItems: 'center',
            gap: '8px',
        }} >
            <Avatar src={x.row.thumbnail || undefined} alt={x.row.name} style={{ width: '52px', height: '52px' }} />
            {x.row.name}
            </Grid2></Link>
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
    // {
    //     field: 'sources',
    //     headerName: 'Source',
    //     width: 200,
    //     valueGetter: (sources: Source[]) => sources.map(source => formatSource[source]).join(', ')
    // },
]

export function InnerGrid(props: { tracks: SimpleTrack[] }) {
    return <TableContainer component={Paper} sx={{ height: '100%' }}>
          <TableHead>
          <TableRow>
            <TableCell>Rank</TableCell>
            <TableCell>Track</TableCell>
            <TableCell>Album</TableCell>
            <TableCell>Artists</TableCell>
            <TableCell>Release Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
            {props.tracks.map((track) => (
                <TableRow key={track.id + track.rank}>
                    <TableCell>{track.rank}</TableCell>
                    <TableCell>
                        <Link href={track.spotifyUrl} target="_blank">
                            <Grid2 sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '8px',
                            }}>
                                <Avatar src={track.thumbnail || undefined} alt={track.name} style={{ width: '52px', height: '52px' }} />
                                {track.name}
                            </Grid2>
                        </Link>
                    </TableCell>
                    <TableCell>{track.album}</TableCell>
                    <TableCell>{track.artists.join(', ')}</TableCell>
                    <TableCell>{track.releaseDate.toLocaleDateString()}</TableCell>
                </TableRow>
            ))}
        </TableBody>
        </TableContainer>
    // return <DataGrid
    //     rows={props.tracks}
    //     columns={columns}
    //     getRowId={track => track.id}
    //     disableRowSelectionOnClick
    //     disableColumnSorting={true}
        // initialState={{
        //     pagination: {
        //         paginationModel: {
        //             pageSize: 10
        //         }
        //     }
        // }}
    // />
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
        content = <InnerGrid tracks={rerankTracks(tracks)} />;
    }
    else {
        content = (
                    <CircularProgress />
        );
    }

    return content;
}