import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import { Client, UserHandler } from 'spotify-sdk';
import { useLocation } from 'react-router-dom';
import qs from 'qs';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import uniqBy from 'lodash.uniqby';

const homeUrl = window.location.origin + window.location.pathname;

// Set Spotify API settings
let client = Client.instance;
client.settings = {
    clientId: '9c91bacd3cc149c4ac198f88b2468719',
    scopes: ['user-top-read'],
    redirect_uri: homeUrl,
};

/**
 * Gets the start and end dates for eligible songs in that year. e.g. for 2019 this would be
 * 1 December 2018 and 30 November 2019
 */
function eligibilityPeriod(year) {
    return [
        new Date(year - 1, 11), // December of the previous year
        new Date(year, 10), // November of the current year
    ];
}

/**
 * Calculates the next Hottest 100 year based on the date
 * @param date
 */
function upcomingYear(date) {
    const votingCloses = new Date(
        date.getFullYear(),
        0,
        28,
        3,
    );

    if (date < votingCloses) {
        // If we're before the Hottest 100 date, the current year is the upcoming year
        return date.getFullYear() - 1;
    } else {
        // If we're after the Hottest 100 date, next year is the upcoming year
        return date.getFullYear();
    }
}


/**
 * Returns true if a track is eligible for the given year of hottest 100
 */
function isEligible(track, year) {
    const date = new Date(track.album.release_date);
    const [start, end] = eligibilityPeriod(year);
    return date >= start && date <= end;
}

function App() {
    const location = useLocation();
    const hash = useMemo(() => {
        return qs.parse(location.hash.substring(1));
    }, [location.hash]);
    client.token = hash.access_token;
    const [uniqueArtists, setUniqueArtists] = useState(false);
    const [loginUrl, setLoginUrl] = useState(null);
    const [retrievalState, setRetrievalState] = useState('notRequested');
    const [shortTerm, setShortTerm] = useState([]);
    const [mediumTerm, setMediumTerm] = useState([]);
    const [longTerm, setLongTerm] = useState([]);
    const [tablePage, setTablePage] = useState(0);
    const [currentTab, setCurrentTab] = useState(0);

    const currentYear = upcomingYear(new Date());
    const [year, setYear] = useState(currentYear);

    // If we don't have a login url, request it
    useEffect(() => {
        if (!('access_token' in hash)) {
            client.login().then((url) => {
                setLoginUrl(url);
            });
        }
    }, [hash]);

    // If we don't yet have the user data, request it
    useEffect(() => {
        if (retrievalState === 'notRequested' && 'access_token' in hash) {
            // Only request once
            setRetrievalState('requested');
            new UserHandler().me().then(user => {
                return Promise.all(['short_term', 'medium_term', 'long_term'].map(term => {
                    return user.top('tracks', {
                        'time_range': term,
                        'limit': 50,
                    });
                }));
            }).then(([shortTerm, mediumTerm, longTerm]) => {
                setRetrievalState('retrieved');
                setShortTerm(shortTerm);
                setMediumTerm(mediumTerm);
                setLongTerm(longTerm);
            });
        }
    }, [retrievalState, hash, hash.access_token]);

    // Filter the tracks to the top 10, choosing longer term favourites where possible
    const tracks = useMemo(() => {
        let ret;
        switch (currentTab) {
            case 0:
                // Combined
                ret = uniqBy(
                    longTerm
                        .concat(mediumTerm, shortTerm)
                        .filter(track => isEligible(track, year)),
                    'id',
                );
                break;
            case 1:
                ret = longTerm.filter(track => isEligible(track, year));
                break;
            case 2:
                ret = mediumTerm.filter(track => isEligible(track, year));
                break;
            case 3:
                ret = shortTerm.filter(track => isEligible(track, year));
                break;
        }

        if (uniqueArtists) {
            // If unique by artist, filter by the first artist who tends to be the main one
            return uniqBy(ret, track => {
                return track.artists[0].name;
            });
        } else {
            return ret;
        }

    }, [shortTerm, mediumTerm, longTerm, year, uniqueArtists, currentTab]);

    let content;
    if (retrievalState === 'retrieved') {
        content = <>
            <Box my={'20px'}>
                <Grid container justify={'center'}>
                    <Grid item md={6}>
                        <Button
                            fullWidth
                            variant={'contained'}
                            size={'large'}
                            color={'primary'}
                            href={homeUrl}
                        >
                            Logout
                        </Button>
                    </Grid>
                </Grid>
            </Box>
            <Paper>
                <Grid container justify={'center'}>
                    <Grid item>
                        <FormGroup row>
                            <TextField
                                label="Year"
                                type="number"
                                value={year}
                                onChange={e => {
                                    setYear(e.target.value);
                                }}
                            />
                            <FormControlLabel control={
                                <Checkbox
                                    checked={uniqueArtists}
                                    onChange={e => {
                                        setUniqueArtists(e.target.checked);
                                    }}
                                />
                            }
                                label={'Unique Artists'}
                            />
                        </FormGroup>
                    </Grid>
                </Grid>
                <Tabs
                    variant={'fullWidth'}
                    value={currentTab}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={(e, value) => {
                        setCurrentTab(value);
                    }}
                >
                    <Tab label="Combined"/>
                    <Tab label="Long Term"/>
                    <Tab label="Medium Term"/>
                    <Tab label="Short Term"/>
                </Tabs>
                <TableContainer component={Paper}>
                    <Table style={{ tableLayout: 'fixed' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ width: '10%' }}>Rank</TableCell>
                                <TableCell style={{ width: '45%' }}>Song</TableCell>
                                <TableCell style={{ width: '45%' }}>Artists</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                tracks
                                    .slice(tablePage * 10, tablePage * 10 + 10)
                                    .map((track, i) => {
                                        return (
                                            <TableRow>
                                                <TableCell>{tablePage * 10 + i + 1}</TableCell>
                                                <TableCell>
                                                    <Link href={track.external_urls.spotify}
                                                        target="_blank">
                                                        {track.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{
                                                    track.artists.map((artist, i, arr) => {
                                                        const children = [
                                                            <Link
                                                                href={artist.external_urls.spotify}
                                                                target="_blank">
                                                                {artist.name}
                                                            </Link>
                                                        ];
                                                        if (i < arr.length - 1) {
                                                            children.push(<span>, </span>);
                                                        }
                                                        return <>{children}</>;
                                                    })
                                                }
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                            }
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    page={tablePage}
                                    count={tracks.length}
                                    onChangePage={(e, newPage) => {
                                        setTablePage(newPage);
                                    }}
                                    rowsPerPage={10}
                                    rowsPerPageOptions={[10]}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </Paper>
        </>;
    } else if (!('access_token' in hash)) {
        content = (
            <Box mt={'20px'}>
                <Grid container justify={'center'}>
                    <Grid item md={6}>
                        <Button
                            fullWidth
                            variant={'contained'}
                            size={'large'}
                            color={'primary'}
                            href={loginUrl}
                        >
                            Login with Spotify
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        );
    } else {
        content = (<CircularProgress/>);
    }

    return <Container maxWidth={'md'}>
        <Grid container justify={'center'}>
            <Grid item style={{
                textAlign: 'center',
            }}>
                <Typography variant={'h2'}>
                    Spottest 100
                </Typography>
                <Typography variant={'subtitle1'}>
                    A calculator for your Triple J Hottest 100 votes, using your music library
                </Typography>
                {content}
            </Grid>
        </Grid>
    </Container>;
}

export default App;
