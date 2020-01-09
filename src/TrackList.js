import React, { useMemo, useState } from 'react';
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
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import uniqBy from 'lodash.uniqby'

import { isEligible, upcomingYear } from './util';

export default function TrackList({ homeUrl, longTerm, mediumTerm, shortTerm }) {
    const [tablePage, setTablePage] = useState(0);
    const [uniqueArtists, setUniqueArtists] = useState(false);
    const [currentTab, setCurrentTab] = useState(0);
    const currentYear = upcomingYear(new Date());
    const [year, setYear] = useState(currentYear);

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
    return (
        <>
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
                        setTablePage(0);
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
                                                            </Link>,
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
        </>
    );
}