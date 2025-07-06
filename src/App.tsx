import { useEffect, useMemo, useRef, useState } from 'react'
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { Pager, responseValidator, usePager } from './spotify'
import { rerankTracks } from './simpleTrack';
import { AppBar, Box, Button, FormControl, Grid2, InputLabel, MenuItem, Paper, Select, Toolbar, Typography } from '@mui/material';
import About from './about';
import { TrackGrid } from './trackGrid';
import { useForm } from 'react-hook-form';
import { useVotingList } from './votingList';
import { useInfiniteScroll } from './useInfiniteScroll';
import { countdowns } from './countdown';


export default function App() {
  const location = window.location;

  const [countdownId, setCountdownId] = useState("2025-Australian");
  const homeUrl = location.origin + location.pathname;

  const [showAbout, setShowAbout] = useState(false);

  const countdown = countdowns[countdownId];
  const client = useRef(SpotifyApi.withUserAuthorization(
    '9c91bacd3cc149c4ac198f88b2468719',
    homeUrl,
    ['user-top-read'],
    { responseValidator }
  ));
  const pager = useRef<Pager>(
    (offset, pageSize) => client.current.currentUser.topItems('tracks', 'long_term', pageSize, offset),
  );
  const [tracks, loadMore, hasMore] = usePager(pager.current);
  const form = useForm(countdown.formProps);
  const settings = form.watch();
  const votingList = useVotingList(countdown.votingListUrl);
  const filteredTracks = useMemo(() => countdown.filter(tracks, settings, votingList), [countdownId, tracks, settings])

  /**
   * Load tracks until at least one new track matches the countdown filter
   * @param pages Number of pages to load at a time
   * @param until Minimum number of tracks to load before stopping
   */
  async function loadMoreFiltered(pages: number = 4, until: number = 1) {
    if (!hasMore)
      return;
    let found = 0;
    while (true) {
      const results = await loadMore(pages);
      found += countdown.filter(results, settings, votingList).length;
      if (found >= until) break
    }
  }

  // On initialisation, load until we have at least 50 tracks tracks that matches the countdown filter
  useEffect(() => {
    if (votingList === null)
      return;
    loadMoreFiltered(4, 20);
  }, [countdownId, votingList]);
  // if (votingList !== null && filteredTracks.length < 50) {
  //   loadMoreFiltered(4, 50);
  // }


  // On scroll, load at least 1 more track that matches the countdown filter
  useInfiniteScroll(() => loadMoreFiltered(4, 1))

  return (
    <Box sx={{
      flexGrow: 1,
      gap: 2,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <About open={showAbout} handleClose={() => setShowAbout(false)} />
      <AppBar position="static">
        <Toolbar>
          <Typography flexGrow={1} variant="button">spottest 100</Typography>
          <Button onClick={() => { setShowAbout(true) }} color='inherit'>Help</Button>
        </Toolbar>
      </AppBar>
      <Paper sx={{ maxWidth: 1000, margin: 'auto', padding: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Countdown</InputLabel>
          <Select
            value={countdownId}
            label="Time Range"
            variant="filled"
            onChange={(e) => {
              const newCountdownId = e.target.value;
              setCountdownId(newCountdownId);
              form.reset(countdowns[newCountdownId].formProps.defaultValues);
            }}
          >
            {Object.entries(countdowns).map(([id, countdown]) => (
              <MenuItem key={id} value={id}>
                {countdown.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Grid2 container spacing={2}>
          <countdown.settings form={form} />
          <TrackGrid key={1} tracks={rerankTracks(filteredTracks)} />
        </Grid2>
      </Paper>
    </Box>
  );
}
