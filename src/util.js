/**
 * Gets the start and end dates for eligible songs in that year. e.g. for 2019 this would be
 * 1 December 2018 and 30 November 2019
 */
export function eligibilityPeriod(year) {
    return [
        new Date(year - 1, 11), // December of the previous year
        new Date(year, 10), // November of the current year
    ];
}

/**
 * Calculates the next Hottest 100 year based on the date
 * @param date
 */
export function upcomingYear(date) {
    const votingCloses = new Date(
        date.getFullYear(),
        0,
        28,
        3,
    );

    if (date < votingCloses) {
        // If we're before the Hottest 100 date, the current year is the upcoming year
        return date.getFullYear() - 1;
    } else {
        // If we're after the Hottest 100 date, next year is the upcoming year
        return date.getFullYear();
    }
}


/**
 * Returns true if a track is eligible for the given year of hottest 100
 */
export function isEligible(track, year) {
    const date = new Date(track.album.release_date);
    const [start, end] = eligibilityPeriod(year);
    return date >= start && date <= end;
}
