import { useEffect, useMemo, useState } from 'react'
import { SpotifyApi, Track } from '@spotify/web-api-ts-sdk';
import CircularProgress from '@mui/material/CircularProgress';
import { getAllPages, processPage } from './utils'
import { SimpleTrack, Source } from './simpleTrack';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TrackGrid } from './trackGrid';
import { Box, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';


export default function App(props: { year: number }) {
  const location = window.location;
  const [tracks, setTracks] = useState<SimpleTrack[]>([]);
  // const [shortTerm, setShortTerm] = useState<SimpleTrack[] | null>(null);
  // const [mediumTerm, setMediumTerm] = useState<SimpleTrack[] | null>(null);
  // const [longTerm, setLongTerm] = useState<SimpleTrack[] | null>(null);
  // const [libraryTracks, setLibraryTracks] = useState<SimpleTrack[] | null>(null);
  // const [year, setYear] = useState(null);

  const homeUrl = location.origin + location.pathname;

  const client = useMemo(() => SpotifyApi.withImplicitGrant(
    '9c91bacd3cc149c4ac198f88b2468719',
    homeUrl,
    ['user-top-read'],
  ), []);

  async function loadTracks() {
    for await (let newTracks of getAllPages((offset, pageSize) => client.currentUser.topItems('tracks', "short_term", pageSize, offset), props.year, Source.ShortTerm)) {
      setTracks(tracks => [...newTracks, ...tracks])
    };
    for await (let newTracks of getAllPages((offset, pageSize) => client.currentUser.topItems('tracks', "medium_term", pageSize, offset), props.year, Source.MediumTerm)) {
      setTracks(tracks => [...newTracks, ...tracks])
    };
    for await (let newTracks of getAllPages((offset, pageSize) => client.currentUser.topItems('tracks', "long_term", pageSize, offset), props.year, Source.LongTerm)) {
      setTracks(tracks => [...newTracks, ...tracks])
    };
  }

  useEffect(() => { loadTracks() }, [props.year]);

  let content = null;
  if (tracks.length > 0) {
    content = <TrackGrid tracks={tracks} />;
  }
  else {
    content = <CircularProgress />;
  }

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto' }}>
        <Paper>
          {content}
        </Paper>
    </Box>
  )
}
