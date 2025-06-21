import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

export default function About({handleClose, open}: { handleClose: () => void, open: boolean }) {
    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>About Spottest 100</DialogTitle>
            <DialogContent>
                <Typography variant={'body1'} gutterBottom>
                    Spottest 100 is
                    a web application designed to simplify the process of choosing
                    your top 10 songs for triple j's various <Link href="https://www.abc.net.au/triplej/hottest100">Hottest 100
                </Link> music polls.
                </Typography>
                <Typography variant={'body1'} gutterBottom>
                    This application works by using the Spotify <Link
                    href="https://developer.spotify.com/documentation/web-api/">Web API</Link> to
                    request your
                    most listened songs, and then by filtering them down to only songs eligible for
                    this year's Hottest 100.
                    Specifically, Spottest 100 exclusively uses your <Link href="https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks">"long term favourites"</Link>, in ranked order, to suggest
                    your votes.
                </Typography>
                <Typography variant={'body1'} gutterBottom>
                </Typography>

                <Typography variant={'body1'} gutterBottom></Typography>
                <Alert title="Known Issues" severity="info">
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
