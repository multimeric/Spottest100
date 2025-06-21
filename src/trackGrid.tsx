import CircularProgress from '@mui/material/CircularProgress';
import { rerankTracks, SimpleTrack, Source } from './simpleTrack';
import { Avatar, Grid2, Link, Paper, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const formatSource: Record<Source, string> = {
    [Source.ShortTerm]: 'Short Term Favourite',
    [Source.MediumTerm]: 'Medium Term Favourite',
    [Source.LongTerm]: 'Long Term Favourite',
    [Source.Library]: 'Saved Track'
};

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
}

/**
 * Wrapper component for the TrackGrid that shows a loading spinner if no tracks are available.
 */
export function TrackGrid({ tracks }: {
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