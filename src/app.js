import React, {useEffect, useMemo, useState} from 'react';
import './app.css';
import {Client, UserHandler} from 'spotify-sdk';
import {useLocation} from 'react-router-dom';
import qs from 'qs';
import CircularProgress from '@material-ui/core/CircularProgress';

import Frame from './frame';
import Login from './login';
import TrackList from './trackList';

const homeUrl = window.location.origin + window.location.pathname;

// Set Spotify API settings
let client = Client.instance;
client.settings = {
    clientId: '9c91bacd3cc149c4ac198f88b2468719',
    scopes: ['user-top-read'],
    redirect_uri: homeUrl,
};

function App() {
    const location = useLocation();
    const hash = useMemo(() => {
        return qs.parse(location.hash.substring(1));
    }, [location.hash]);
    client.token = hash.access_token;
    const [loginUrl, setLoginUrl] = useState(null);
    const [retrievalState, setRetrievalState] = useState('notRequested');
    const [shortTerm, setShortTerm] = useState([]);
    const [mediumTerm, setMediumTerm] = useState([]);
    const [longTerm, setLongTerm] = useState([]);


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
            }).catch(err => {
                // If the request failed, the access token is wrong or out of date, so make the user login again
                window.location.replace(homeUrl);
            });
        }
    }, [retrievalState, hash, hash.access_token]);


    let content;
    if (retrievalState === 'retrieved') {
        content = <TrackList
            homeUrl={homeUrl}
            shortTerm={shortTerm}
            mediumTerm={mediumTerm}
            longTerm={longTerm}
        />
    } else if (!('access_token' in hash)) {
        content = <Login loginUrl={loginUrl} />
    } else {
        content = <CircularProgress/>;
    }

    return <Frame>
        {content}
    </Frame>;
}

export default App;
