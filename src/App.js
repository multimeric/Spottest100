import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Client, UserHandler } from 'spotify-sdk';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useLocation,
} from 'react-router-dom';
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

function App() {
    const [loginUrl, setLoginUrl] = useState(null);
    const [tracks, setTracks] = useState([]);
    const location = useLocation();
    const hash = qs.parse(location.hash.substring(1));
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
            content = <TableContainer component={Paper}>
                <TableHead>
                    <TableRow>
                        <TableCell> Rank </TableCell>
                        <TableCell> Song </TableCell>
                        <TableCell> Artists </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        tracks.map((track, i) => {
                            return (
                                <TableRow>
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell>{track.name}</TableCell>
                                    <TableCell>{
                                        track.artists.map(artist => {
                                            return <span>{artist.name}</span>;
                                        })
                                    }
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    }
                </TableBody>
            </TableContainer>;
        } else {
            new UserHandler().me().then(user => {
                user.top('tracks', {
                    'time_range': 'medium_term',
                    'limit': 50,
                }).then(tracks => {
                    setTracks(tracks);
                });
            });
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
