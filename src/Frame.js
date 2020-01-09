import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

export default function Frame({ children }) {
    return (
        <Container maxWidth={'md'}>
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
                    {children}
                </Grid>
            </Grid>
        </Container>
    );
}