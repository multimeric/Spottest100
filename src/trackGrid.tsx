import CircularProgress from '@mui/material/CircularProgress';
import { rerankTracks, SimpleTrack } from './simpleTrack';
import { Avatar, Grid2, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroller';
import { useState } from 'react';

export function InnerGrid(props: { tracks: SimpleTrack[] }) {
    const [limit, setLimit] = useState(50);

    // <InfiniteScroll
    //     pageStart={0}
    //     loadMore={() => { setLimit(limit => limit + 50) }}
    //     hasMore={limit < props.tracks.length}
    // >
    return <TableContainer component={Paper} sx={{ height: '100%' }}>
            <Table>
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
            </Table>
        </TableContainer>
}

/**
 * Wrapper component for the TrackGrid that shows a loading spinner if no tracks are available.
 */
export function TrackGrid({ tracks }: {
    tracks: SimpleTrack[],
}) {
    return <InnerGrid tracks={rerankTracks(tracks)} />;
}