import { Controller, FieldValues, UseFormProps, UseFormReturn } from "react-hook-form";
import { byVotingList, byArtistMaxSongs, byYear } from "./filters";
import { SimpleTrack } from "./simpleTrack";
import { VotingList } from "./votingList";
import { ArtistLimit } from './artistLimit';
import { TextField, Stack, Typography, Switch } from "@mui/material";

type SettingsProps<T extends FieldValues> = {
  form: UseFormReturn<T>
}

/**
 * Base class for countdowns
 * Each subclass relates to a specific countdown, e.g. Hottest 100 of 2024
 */
abstract class Countdown<T extends FieldValues> {
  constructor(
    // Human-readable name of the countdown
    public readonly name: string,
    // Form properties, typically default values
    public readonly formProps: UseFormProps<T>,
    public readonly votingListUrl: string
  ) { }
  abstract settings(props: SettingsProps<T>): React.ReactElement;
  filter(tracks: SimpleTrack[], _settings: T, votingList: VotingList | null): SimpleTrack[] {
    return byVotingList(tracks, votingList)
  }

  async getVotingList(): Promise<VotingList> {
    const res = await fetch("2025_australian.json");
    const parsed = await res.json();
    return new VotingList(parsed);
  }
}

type Settings2025Australian = {
  limitPerArtist: number
}

export class Countdown2025Australian extends Countdown<Settings2025Australian> {
  constructor() {
    super("Hottest 100 of Australian Songs", {
      defaultValues: { limitPerArtist: Infinity }
    }, "2025_australian.json");
  }

  settings({ form }: SettingsProps<any>): React.ReactElement {
    return <ArtistLimit control={form.control} />
  }

  filter(tracks: SimpleTrack[], settings: Settings2025Australian, votingList: VotingList | null): SimpleTrack[] {
    return byArtistMaxSongs(super.filter(tracks, settings, votingList), settings.limitPerArtist);
  }
}

type Settings2024 = {
  limitPerArtist: number
  useVotingList: boolean
}

export class Countdown2024 extends Countdown<Settings2024> {
  constructor() {
    super("Hottest 100 of 2024", {
      defaultValues: { limitPerArtist: Infinity, useVotingList: true }
    }, "2024.json");
  }

  settings({ form }: SettingsProps<any>): React.ReactElement {
    return <>
      <ArtistLimit control={form.control} />
      <TextField
        variant="outlined"
        label="Eligibility"
        multiline
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            inputComponent: () => <Stack direction="row" spacing={2} alignItems="center" sx={{ padding: '8px' }}>
              <Typography>Release Year</Typography>
              <Controller
                name="useVotingList"
                control={form.control}
                render={({ field }) => <Switch checked={field.value} onChange={field.onChange} onBlur={field.onBlur} name={field.name} inputRef={field.ref} />}
              />
              <Typography>Voting List</Typography>
            </Stack>
          }
        }}
      />
    </>
  }

  filter(tracks: SimpleTrack[], settings: Settings2024, votingList: VotingList | null): SimpleTrack[] {
    // Toggle between filtering by voting list or by year based on user settings
    if (settings.useVotingList) {
      tracks = byVotingList(tracks, votingList);
    } else {
      tracks = byYear(tracks, 2024);
    }
    return byArtistMaxSongs(tracks, settings.limitPerArtist);
  }
}

export const countdowns: Record<string, Countdown<any>> = {
  "2025-Australian": new Countdown2025Australian(),
  "2024": new Countdown2024()
}
