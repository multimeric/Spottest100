import { SimpleTrack } from './simpleTrack';
import { Avatar, Grid2, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export function TrackGrid(props: { tracks: SimpleTrack[] }) {
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