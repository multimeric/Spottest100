import assert from 'assert';
import {eligibilityPeriod, isEligible, upcomingYear} from '../src/util';

describe('eligibilityPeriod', function () {
    // An eligible song must have had its initial release (online or on-air) between 1 December 2018 and 30 November 2019.
    const [earliest, latest] = eligibilityPeriod(2019);
    it('should allow a song from December 2018 for the year 2019', function () {
        const allowed = new Date(2018, 11, 1);
        assert(allowed < latest);
        assert(allowed >= earliest);
    });
    
    it('should allow a song from January 2019 for the year 2019', function () {
        const allowed = new Date(2019, 0, 1);
        assert(allowed < latest);
        assert(allowed >= earliest);
    });
    
    it('should allow a song from November 2019 for the year 2019', function () {
        const allowed = new Date(2019, 10, 1);
        assert(allowed < latest);
        assert(allowed >= earliest);
    });

    it('should not allow a song from November 2018 for the year 2019', function () {
        const tooEarly = new Date(2018, 10, 30);
        assert(tooEarly < earliest);
    });

    it('should not allow a song from December 2019 for the year 2019', function () {
        const tooLate = new Date(2019, 11, 1);
        assert(tooLate >= latest);
    });
});

describe('upcomingYear', function () {
    it('should return 2019 even in January 2020', function () {
        const now = new Date(2020, 0, 1);
        assert(upcomingYear(now) === 2019);
    });
    
    it('should return 2020 in February 2020', function () {
        const now = new Date(2020, 1, 1);
        assert(upcomingYear(now) === 2020);
    });
});

describe('isEligible', function () {
    it('12 Views of Beatenberg (released 14 December 2018) should be eligible for 2019\s Hottest 100', function () {
        const track = {album: {release_date: new Date(2018, 11, 14)}}
        assert(isEligible(track, 2019));
    });
    it('Walking Like We Do (released 10 January 2020) should not be eligible for 2019\s Hottest 100', function () {
        const track = {album: {release_date: new Date(2020, 0, 10)}}
        assert(!isEligible(track, 2019));
    });
});
