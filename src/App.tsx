import React, { useEffect, useMemo, useState } from 'react'
import { SpotifyApi, Track } from '@spotify/web-api-ts-sdk';
import CircularProgress from '@mui/material/CircularProgress';
import { getAllPages, processPage } from './utils'
import { SimpleTrack, Source } from './simpleTrack';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TrackGrid } from './trackGrid';
import { Box, Container, FormControl, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material';
import { VotingList, VotingListName, VOTING_LISTS } from './votingList';
import pLimit from 'p-limit';
import { Australian2025Countdown, use2025Countdown } from './2025Australian';
import { useThrottle } from "@uidotdev/usehooks";


type Countdown = {
  name: string;
  // year: number;
  // hook: (tracks: SimpleTrack[]) => ([JSX.Element,SimpleTrack[]]),
  component: React.FC<{ favourites: SimpleTrack[] }>;
}

const countdowns: Record<string, Countdown> = {
  "2025-Australian": {
    name: "Hottest 100 of Australian Songs",
    // hook: use2025Countdown,
    // year: 2025,
    // form: function(){},
    component: Australian2025Countdown
  }
}

type CountDownId = keyof typeof countdowns;

export default function App(props: { year: number | null, votingListName: VotingListName }) {
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

  useEffect(() => { loadTracks() }, [props.year]);

  return (
    <Box sx={{
      width: '100%',
    }}>
      <Typography variant="h3" align="center">Spottest 100</Typography>
      <Box sx={{ maxWidth: 1000, margin: 'auto' }}>
        <Paper>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Countdown</InputLabel>
            <Select
              value={countdownId}
              label="Time Range"
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
    </Box>
  );
}
