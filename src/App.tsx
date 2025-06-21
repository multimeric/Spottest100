import React, { useEffect, useMemo, useState } from 'react'
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { getAllPages } from './utils'
import { SimpleTrack, Source } from './simpleTrack';
import { AppBar, Box, FormControl, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material';
import { Australian2025Countdown } from './countdowns/2025Australian';
import { Countdown2024 } from './countdowns/2024';
import { useThrottle } from "@uidotdev/usehooks";


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
  const cachedTracks = useThrottle(tracks, 500);
  const [countdownId, setCountdownId] = useState<CountDownId>("2025-Australian");
  const homeUrl = location.origin + location.pathname;

  const CountdownComponent = countdowns[countdownId].component;
  const client = useMemo(() => SpotifyApi.withUserAuthorization(
    '9c91bacd3cc149c4ac198f88b2468719',
    homeUrl,
    ['user-top-read'],
  ), []);

  async function loadTracks() {
    // Get an array of promises, each running concurrently
    const pagePromises = await getAllPages((offset, pageSize) => client.currentUser.topItems('tracks', "long_term", pageSize, offset), Source.LongTerm);
    // Whenever any page is loaded, process it and add it to the tracks
    pagePromises.map(promise => promise.then(
      newTracks => setTracks(tracks => [...tracks, ...newTracks])
    ));
  }

  useEffect(() => { loadTracks() }, []);

  return (
    <Box sx={{
      flexGrow: 1,
      gap: 2,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <AppBar position="static">
        <Typography variant="button" align="center">spottest 100</Typography>
      </AppBar>
      <Paper sx={{ maxWidth: 1000, margin: 'auto', padding: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Countdown</InputLabel>
            <Select
              value={countdownId}
              label="Time Range"
              variant='filled'
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
