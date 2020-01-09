import React from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

export default function Login({ loginUrl }) {
    return (
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
}