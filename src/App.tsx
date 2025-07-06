import React, { useEffect, useMemo, useRef, useState } from 'react'
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { getAllPages, Pager, responseValidator, usePager } from './spotify'
import { SimpleTrack, Source } from './simpleTrack';
import { AppBar, Box, Button, CircularProgress, FormControl, Grid2, InputLabel, MenuItem, Paper, Select, Toolbar, Typography } from '@mui/material';
import { Australian2025Countdown } from './countdowns/2025Australian';
import { Countdown2024 } from './countdowns/2024';
import { usePrevious, useThrottle, useVisibilityChange, useWindowScroll } from "@uidotdev/usehooks";
import About from './about';
// import InfiniteScroll from 'react-infinite-scroller';
import InfiniteScroll from 'react-infinite-scroll-component';
import { TrackGrid } from './trackGrid';
import { ArtistLimit } from './artistLimit';
import { FieldValues, useForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { byArtistMaxSongs, byVotingList } from './filters';
import { useVotingList, VotingList } from './votingList';
import { useInfiniteScroll } from './useInfiniteScroll';

type SettingsProps<T extends FieldValues> = {
  form: UseFormReturn<T>
}

type Countdown<T extends FieldValues> = {
  name: string;
  // component: React.FC<{ favourites: SimpleTrack[] }>;
  // Component for requesting settinsg
  settings: React.FC<SettingsProps<T>>
  // Function to filter tracks based on settings
  filter: (tracks: SimpleTrack[], settings: T, votingList: VotingList | null) => SimpleTrack[]
  // 
  votingListUrl: string,
  // Props passed into useForm(), such as default values
  formProps: UseFormProps
}

const countdowns: Record<string, Countdown<any>> = {
  "2025-Australian": {
    name: "Hottest 100 of Australian Songs",
    votingListUrl: "2025_australian.json",
    settings: ({ form }) => {
      return <ArtistLimit control={form.control} />
    },
    filter: (tracks: SimpleTrack[], settings: any, votingList: VotingList | null) => {
      // Apply the voting list filter first, since it is the most restrictive
      tracks = byVotingList(tracks, votingList);
      return byArtistMaxSongs(tracks, settings.limitPerArtist)
    },
    formProps: {
      defaultValues: { limitPerArtist: Infinity }
    }
  },
  // "2024": {
  //   name: "Hottest 100 of 2024",
  //   component: Countdown2024
  // }
}

type CountDownId = keyof typeof countdowns;


export default function App() {
  const location = window.location;

  const [countdownId, setCountdownId] = useState<CountDownId>("2025-Australian");
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
  const [tracks, loadMore, hasMore] = usePager(pager.current, 500);
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
              setCountdownId(e.target.value as CountDownId);
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
          <TrackGrid key={1} tracks={filteredTracks} />
        </Grid2>
      </Paper>
    </Box>
  );
}
