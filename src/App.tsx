import React, { useEffect, useMemo, useState } from 'react'
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { getAllPages, responseValidator } from './spotify'
import { SimpleTrack, Source } from './simpleTrack';
import { AppBar, Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Toolbar, Typography } from '@mui/material';
import { Australian2025Countdown } from './countdowns/2025Australian';
import { Countdown2024 } from './countdowns/2024';
import { useThrottle } from "@uidotdev/usehooks";
import About from './about';


type Countdown = {
  name: string;
  component: React.FC<{ favourites: SimpleTrack[] }>;
}

const countdowns: Record<string, Countdown> = {
  "2025-Australian": {
    name: "Hottest 100 of Australian Songs",
    component: Australian2025Countdown
  },
  "2024": {
    name: "Hottest 100 of 2024",
    component: Countdown2024
  }
}

type CountDownId = keyof typeof countdowns;

export default function App() {
  const location = window.location;

  // All favourite tracks
  const [tracks, setTracks] = useState<SimpleTrack[]>([]);
  // Throttle the tracks to avoid re-rendering too often
  const cachedTracks = useThrottle(tracks, 500);
  const [countdownId, setCountdownId] = useState<CountDownId>("2025-Australian");
  const homeUrl = location.origin + location.pathname;

  const [showAbout, setShowAbout] = useState(false);

  const CountdownComponent = countdowns[countdownId].component;
  const client = useMemo(() => SpotifyApi.withUserAuthorization(
    '9c91bacd3cc149c4ac198f88b2468719',
    homeUrl,
    ['user-top-read'],
    { responseValidator }
  ), []);

  async function loadTracks() {
    await getAllPages(
      (offset, pageSize) => client.currentUser.topItems('tracks', 'long_term', pageSize, offset),
      newTracks => setTracks(tracks => [...tracks, ...newTracks]),
      Source.LongTerm
    );
  }

  useEffect(() => { loadTracks() }, []);

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
        <CountdownComponent favourites={cachedTracks} />
      </Paper>
    </Box>
  );
}
