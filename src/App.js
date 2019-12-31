import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import { Client, UserHandler } from 'spotify-sdk';
import { useLocation } from 'react-router-dom';
import qs from 'qs';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';

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
    const currentYear = new Date().getFullYear();
    const [loginUrl, setLoginUrl] = useState(null);
    const [hasRetrieved, setHasRetrieved] = useState(false);
    const [shortTerm, setShortTerm] = useState([]);
    const [mediumTerm, setMediumTerm] = useState([]);
    const [longTerm, setLongTerm] = useState([]);
    const [year, setYear] = useState(currentYear);

    // If we don't yet have the user data, request it
    useEffect(() => {
        if (!hasRetrieved) {
            // Only request once
            setHasRetrieved(true);
            new UserHandler().me().then(user => {
                return Promise.all(['short_term', 'medium_term', 'long_term'].map(term => {
                    return user.top('tracks', {
                        'time_range': term,
                        'limit': 50,
                    });
                }));
            }).then(([shortTerm, mediumTerm, longTerm]) => {
                setShortTerm(shortTerm);
                setMediumTerm(mediumTerm);
                setLongTerm(longTerm);
            });
        }
    }, [hasRetrieved]);

    // Filter the tracks to the top 10
    const tracks = useMemo(() => {
        return longTerm
            .concat(mediumTerm, shortTerm)
            .filter(track => isEligible(track, year))
            .slice(0, 10);
    }, [shortTerm, mediumTerm, longTerm, year]);

    let content;
    let client = Client.instance;

    client.settings = {
        clientId: '9c91bacd3cc149c4ac198f88b2468719',
        scopes: ['user-top-read'],
        redirect_uri: 'http://localhost:8888',
    };

    if (!('access_token' in hash)) {
        client.login().then((url) => {
            setLoginUrl(url);
        });
        content = <Button variant={'contained'} size={'large'} color={'primary'}
            href={loginUrl}>Login</Button>;
    } else {
        client.token = hash.access_token;
        if (tracks.length > 0) {
            content = <Paper>
                <Grid container justify={'center'}>
                    <Grid item>
                        <TextField
                            label="Year"
                            type="number"
                            value={year}
                            onChange={e => {
                                setYear(e.target.value);
                            }}
                        />
                    </Grid>
                </Grid>
                <TableContainer component={Paper}>
                    <Table style={{
                        width: '100%',
                    }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Rank</TableCell>
                                <TableCell>Song</TableCell>
                                <TableCell>Artists</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                tracks
                                    .map((track, i) => {
                                        return (
                                            <TableRow>
                                                <TableCell>{i + 1}</TableCell>
                                                <TableCell>{track.name}</TableCell>
                                                <TableCell>{
                                                    track.artists.map(artist => artist.name).join(', ')
                                                }
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>;
        } else {
            content = (<CircularProgress/>);
        }
    }

    return <Grid container justify={'center'} style={{
        // maxWidth: 800
    }}>
        <Grid item style={{
            maxWidth: '800px',
        }}>
            <Typography variant={'h1'}>
                Spotify Hottest 100 Calculator
            </Typography>
            {content}
        </Grid>
    </Grid>;
}

export default App;
