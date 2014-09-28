'use strict';

describe('DataService', function() {
	var dataService, result, match, dummyData;
	var sampleData = '{"tournament":{"type":"DE","matches":['+
	'[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-1-1-L","UIShiftDown":7.5,"team1Parent":"match-2-2","team2Parent":"match-2-3"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-1-2-L","UIShiftDown":8.5,"team1Parent":"match-2-5","team2Parent":"match-2-6"},"details":{}}],'+
	'[{"team1":{"id":"1","score":""},"team2":{"id":"2","score":""},"meta":{"matchId":"match-2-1","loserMatchId":"match-2-1-L"},"details":{}},{"team1":{"id":"3","score":""},"team2":{"id":"4","score":""},"meta":{"matchId":"match-2-2","loserMatchId":"match-1-1-L"},"details":{}},{"team1":{"id":"5","score":""},"team2":{"id":"6","score":""},"meta":{"matchId":"match-2-3","loserMatchId":"match-1-1-L"},"details":{}},{"team1":{"id":"7","score":""},"team2":{"id":"8","score":""},"meta":{"matchId":"match-2-4","loserMatchId":"match-2-3-L"},"details":{}},{"team1":{"id":"9","score":""},"team2":{"id":"10","score":""},"meta":{"matchId":"match-2-5","loserMatchId":"match-1-2-L"},"details":{}},{"team1":{"id":"11","score":""},"team2":{"id":"12","score":""},"meta":{"matchId":"match-2-6","loserMatchId":"match-1-2-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-1-L","matchType":2,"team1Parent":"match-2-1","team2Parent":"match-3-4"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-2-L","matchType":1,"team1Parent":"match-3-3"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-3-L","matchType":2,"team1Parent":"match-2-4","team2Parent":"match-3-2"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-4-L","matchType":1,"team1Parent":"match-3-1"},"details":{}}],'+
	'[{"team1":{"id":"13","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-1","matchType":1,"loserMatchId":"match-2-4-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-2","loserMatchId":"match-2-3-L"},"details":{}},{"team1":{"id":"14","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-3","matchType":1,"loserMatchId":"match-2-2-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-4","loserMatchId":"match-2-1-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-1-L","team1Parent":"match-4-2"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-2-L","team1Parent":"match-4-1"},"details":{}}],'+
	'[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-1","loserMatchId":"match-3-2-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-2","loserMatchId":"match-3-1-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-1-L"},"details":{}}],'+
	'[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-1","loserMatchId":"match-5-1-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-1-L","matchType":1,"team1Parent":"match-5-1"},"details":{}}],'+
	'[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-6-1","matchType":"finals"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-6-2","matchType":"finals2"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-6-3","matchType":"bronze"},"details":{}}]],'+
	'"properties":{"unbalanced":true,"lbOffset":6.5}}, "teams":{}}';

	beforeEach(module('ngBracket'));

	beforeEach(function() {

		inject(function(_data_) {
			dataService = _data_;
		});

		dummyData = JSON.parse(sampleData);
	});

	it('should update normal match and promote loser', function() {
		dataService.loadTournament(dummyData);

		expect(dummyData.tournament.matches[2][1].team1.id).toBe('');
		expect(dummyData.tournament.matches[0][0].team1.id).toBe('');

		match = dummyData.tournament.matches[1][1];
		match.team1.id = '4';
		match.team2.id = '3';

		dataService.updateTournament(match, '4', '3', null, true);

		expect(dummyData.tournament.matches[2][1].team1.id).toBe('4');
		expect(dummyData.tournament.matches[0][0].team1.id).toBe('3');
	});

	it("should update loser match without promoting loser", function() {
		dataService.loadTournament(dummyData);

		expect(dummyData.tournament.matches[1][7].team2.id).toBe('');

		match = dummyData.tournament.matches[0][0];
		match.team1.id = '1';
		match.team2.id = '2';

		dataService.updateTournament(match, '1', '2', null, false);

		expect(dummyData.tournament.matches[1][7].team2.id).toBe('1');
	});

	it("should promote losers to finals and bronze match", function() {
		dataService.loadTournament(dummyData);
		
		// loser bracket finals ; winner goes to finals and loser to bronze match
		expect(dummyData.tournament.matches[5][0].team1.id).toBe('');
		expect(dummyData.tournament.matches[5][2].team1.id).toBe('');

		match = dummyData.tournament.matches[4][1];
		match.team1.id = '1';
		match.team2.id = '2';

		dataService.updateTournament(match, '1', '2', null, false);

		expect(dummyData.tournament.matches[5][0].team1.id).toBe('1');
		expect(dummyData.tournament.matches[5][2].team1.id).toBe('2');

		// loser bracket semi-finals ; loser goes to bronze match
		dummyData = JSON.parse(sampleData);
		dataService.loadTournament(dummyData);

 		expect(dummyData.tournament.matches[5][2].team1.id).toBe('');

 		match = dummyData.tournament.matches[3][2];
 		match.team1.id = '3';
 		match.team2.id = '4';

 		dataService.updateTournament(match, '3', '4', null, false);
 	
 		expect(dummyData.tournament.matches[5][2].team1.id).toBe('4');
	});

	it("should promote finals round 2 if loser bracket finalist won", function() {
		dataService.loadTournament(dummyData);

		expect(dummyData.tournament.matches[5][1].team1.id).toBe('');
		expect(dummyData.tournament.matches[5][1].team2.id).toBe('');
		expect(dummyData.tournament.properties.finals2).toBe(undefined);

		dummyData.tournament.matches[4][1].team1.id = '2'; // loser bracket finalist
		dummyData.tournament.matches[4][1].team2.id = '3';
		dummyData.tournament.matches[4][1].team1.score = 2;
		dummyData.tournament.matches[4][1].team2.score = 0;

		match = dummyData.tournament.matches[5][0];
		match.team1.id = '1';
		match.team2.id = '2';

		dataService.updateTournament(match, '2', '1', null, false);

		expect(dummyData.tournament.matches[5][1].team1.id).toBe('1');
		expect(dummyData.tournament.matches[5][1].team2.id).toBe('2');
		expect(dummyData.tournament.properties.finals2).toBeTruthy();
	});

	it("should not promote finals round 2 if loser bracket finalist lost", function() {
		dataService.loadTournament(dummyData);

		expect(dummyData.tournament.matches[5][1].team1.id).toBe('');
		expect(dummyData.tournament.matches[5][1].team2.id).toBe('');
		expect(dummyData.tournament.properties.finals2).toBe(undefined);

		dummyData.tournament.matches[4][1].team1.id = '2'; // loser bracket finalist
		dummyData.tournament.matches[4][1].team2.id = '3';
		dummyData.tournament.matches[4][1].team1.score = 2;
		dummyData.tournament.matches[4][1].team2.score = 0;

		match = dummyData.tournament.matches[5][0];
		match.team1.id = '1';
		match.team2.id = '2';

		dataService.updateTournament(match, '1', '2', null, false);

		expect(dummyData.tournament.matches[5][1].team1.id).toBe('');
		expect(dummyData.tournament.matches[5][1].team2.id).toBe('');
		expect(dummyData.tournament.properties.finals2).toBeFalsy();
	});
});
