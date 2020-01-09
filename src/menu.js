import React, {useEffect, useMemo, useState} from 'react';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';

import About from './about';

export default function Menu() {
    const [aboutOpen, setAboutOpen] = useState(false);

    return (
        <>
            <About
                handleClose={() => {
                    setAboutOpen(false);
                }}
                open={aboutOpen}
            />
            <AppBar position="static">
                <Toolbar>
                    <Typography style={{flex: 1}} variant="h6">
                        Spottest 100
                    </Typography>
                    <Button size={'large'} color={'inherit'} onClick={() => {
                        setAboutOpen(true);
                    }}>About</Button>
                    <Button size={'large'} color={'inherit'} target="_blank" href={"https://github.com/TMiguelT/Spottest100"}>Source Code</Button>
                    <Button size={'large'} color={'inherit'} target="_blank" href={"https://github.com/TMiguelT/Spottest100/issues"}>Report an Issue</Button>
                </Toolbar>
            </AppBar>
        </>
    );
}