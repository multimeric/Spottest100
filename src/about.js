import React, { useEffect, useMemo, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Alert from '@material-ui/lab/Alert';

export default function about({ handleClose, open }) {
    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>About Spottest 100</DialogTitle>
            <DialogContent>
                <Typography variant={'body1'} gutterBottom>
                    Spottest 100 is
                    a <Link href="https://en.wikipedia.org/wiki/Free_and_open-source_software">free
                    and
                    open source</Link> web application designed to simplify the process of choosing
                    your top 10 songs for
                    the year for triple j's
                    annual <Link href="https://www.abc.net.au/triplej/hottest100">Hottest 100
                </Link> music poll.
                </Typography>
                <Typography variant={'body1'} gutterBottom>
                    This application works by using the Spotify <Link
                    href="https://developer.spotify.com/documentation/web-api/">Web API</Link> to
                    request your
                    most listened songs, and then by filtering them down to only songs eligible for
                    this year's Hottest
                    100.
                </Typography>
                <Typography variant={'body1'} gutterBottom>
                    Unfortunately, the only information Spotify is willing to provide about your
                    library is three lists
                    of 50 songs:
                    <ul>
                        <li>Long term: your favourite songs of all time</li>
                        <li>Medium term: your favourite songs from the past 6 months</li>
                        <li>Short term: your favourite songs from the past 4 weeks</li>
                    </ul>
                    Spottest 100 provides these three lists (filtered down to eligible songs), along
                    with one&nbsp;<em>
                    combined</em>&nbsp;list, which combines the three lists, putting long-term
                    favourites before
                    medium-term favourites,
                    before short-term favourites, because songs you have listened to for a longer
                    period of time are
                    more likely to be your favourite songs of the year.
                </Typography>
                <Alert severity="info">
                    <span>
                        Note: Spottest 100 can make a mistake if you have
                    listened to an album version of a song, which was released earlier as
                    a single. For example, <Link style={{ display: 'inline' }}
                        href="https://open.spotify.com/track/6PZB6knLs42luWiiE6pCD9?si=jU_KY10rQcWNTBVB6ay97g">Dinosaurs
                    by Ruby Fields</Link>, off the album <em>Permanent Hermit</em> is not legal in
                        2019, because the single was released in 2018. Keep this in mind before
                        submitting your Hottest 100.
                    </span>
                </Alert>
            </DialogContent>
        </Dialog>
    );
}
