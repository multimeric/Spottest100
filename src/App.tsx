import { useEffect, useMemo, useState } from 'react'
import { SpotifyApi, Track } from '@spotify/web-api-ts-sdk';
import CircularProgress from '@mui/material/CircularProgress';
import { getAllPages, processPage } from './utils'
import { SimpleTrack, Source } from './simpleTrack';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TrackGrid } from './trackGrid';
import { Box, Paper } from '@mui/material';
import { VotingList, VotingListName, VOTING_LISTS } from './votingList';
import pLimit from 'p-limit';


export default function App(props: { year: number | null, votingListName: VotingListName }) {
  const location = window.location;

  // All favourite tracks
  const [tracks, setTracks] = useState<SimpleTrack[]>([]);
  // const [shortTerm, setShortTerm] = useState<SimpleTrack[] | null>(null);
  // const [mediumTerm, setMediumTerm] = useState<SimpleTrack[] | null>(null);
  // const [longTerm, setLongTerm] = useState<SimpleTrack[] | null>(null);
  // const [libraryTracks, setLibraryTracks] = useState<SimpleTrack[] | null>(null);
  // const [year, setYear] = useState(null);
  const [finishedLoading, setFinishedLoading] = useState(false);

  const [votingList, setVotingList] = useState<VotingList | null>(null);

  // Filtered tracks based on the voting list
  const filteredTracks = useMemo(() => {
    if (!votingList) return [];
    return tracks.filter(track => votingList.hasId(track.id));
  }, [votingList, tracks, finishedLoading]);

  async function loadVotingList() {
      const res = await fetch(`${VOTING_LISTS[props.votingListName]}`);
      const parsed = await res.json();
      setVotingList(new VotingList(parsed));
  }

  useEffect(() => {
    loadVotingList();
  }, [props.votingListName])

  const homeUrl = location.origin + location.pathname;

  const client = useMemo(() => SpotifyApi.withUserAuthorization(
    '9c91bacd3cc149c4ac198f88b2468719',
    homeUrl,
    ['user-top-read'],
  ), []);
  // const client = useMemo(() => SpotifyApi.withImplicitGrant(
  //   '9c91bacd3cc149c4ac198f88b2468719',
  //   homeUrl,
  //   ['user-top-read'],
  // ), []);

  async function loadTracks() {
    // Get an array of promises, each running concurrently
    const pagePromises = await getAllPages((offset, pageSize) => client.currentUser.topItems('tracks', "long_term", pageSize, offset), Source.LongTerm);
    // Whenever any page is loaded, process it and add it to the tracks
    await Promise.all(pagePromises.map(promise => promise.then(newTracks => setTracks(tracks => [...tracks, ...newTracks]))));
  }

  useEffect(() => { loadTracks() }, [props.year]);

  let content = null;
  if (tracks.length > 0) {
    content = <TrackGrid tracks={filteredTracks} />;
  }
  else {
    content = <CircularProgress />;
  }

  return (
    <Box sx={{ maxWidth: 1000, margin: 'auto' }}>
        <Paper>
          {content}
        </Paper>
    </Box>
  )
}
