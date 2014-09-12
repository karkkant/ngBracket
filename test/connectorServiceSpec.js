'use strict';

describe('ConnectorService', function() {
	var connectorService, result, data, scope;

	var mockData = {
		tData: [],
		getMatches: function() {
			return this.tData;
		}
	}

	beforeEach(module('ngBracket'));

	beforeEach(function() {
		module(function($provide) {
			$provide.value('data', mockData);
		});

		inject(function(_connectorService_, _data_) {
			connectorService = _connectorService_;
			data = _data_;
			scope = {};
		});
	});

	it('should find parent match in balanced bracket', function() {
		data = JSON.parse('[[{"team1":{"id":"1","score":""},"team2":{"id":"2","score":""},"meta":{"matchId":"match-1-1"}},{"team1":{"id":"3","score":""},"team2":{"id":"4","score":""},"meta":{"matchId":"match-1-2"}},{"team1":{"id":"5","score":""},"team2":{"id":"6","score":""},"meta":{"matchId":"match-1-3"}},{"team1":{"id":"7","score":""},"team2":{"id":"8","score":""},"meta":{"matchId":"match-1-4"}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-1"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-2"}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-1","matchType":"finals"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-2","matchType":"bronze"}}]]');
		scope.match = data[1][1];
		mockData.tData = data;

		result = connectorService.findConnectingMatchId(scope.match);

		expect(result).toBe('match-1-3');
	});

	it("should find parent match in unbalanced bracket", function() {
		data = JSON.parse('[[{"team1":{"id":"1","score":""},"team2":{"id":"2","score":""},"meta":{"matchId":"match-1-1"}},{"team1":{"id":"3","score":""},"team2":{"id":"4","score":""},"meta":{"matchId":"match-1-2","UIShiftDown":1}},{"team1":{"id":"5","score":""},"team2":{"id":"6","score":""},"meta":{"matchId":"match-1-3","UIShiftDown":2}},{"team1":{"id":"7","score":""},"team2":{"id":"8","score":""},"meta":{"matchId":"match-1-4","UIShiftDown":3}}],[{"team1":{"id":"9","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-1","matchType":1}},{"team1":{"id":"10","score":""},"team2":{"id":"11","score":""},"meta":{"matchId":"match-2-2","matchType":2}},{"team1":{"id":"12","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-3","matchType":1}},{"team1":{"id":"13","score":""},"team2":{"id":"14","score":""},"meta":{"matchId":"match-2-4","matchType":2}},{"team1":{"id":"15","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-5","matchType":1}},{"team1":{"id":"16","score":""},"team2":{"id":"17","score":""},"meta":{"matchId":"match-2-6","matchType":2}},{"team1":{"id":"18","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-7","matchType":1}},{"team1":{"id":"19","score":""},"team2":{"id":"20","score":""},"meta":{"matchId":"match-2-8","matchType":2}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-1"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-2"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-3"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-4"}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-1"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-2"}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-1","matchType":"finals"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-2","matchType":"bronze"}}]]');
		scope.match = data[1][4];
		mockData.tData = data;

		result = connectorService.findConnectingMatchId(scope.match);

		expect(result).toBe('match-1-3');
	});

	it("should find parent match in unbalanced bracket #2", function() {
		data = JSON.parse('[[{"team1":{"id":"1","score":""},"team2":{"id":"2","score":""},"meta":{"matchId":"match-1-1"}},{"team1":{"id":"3","score":""},"team2":{"id":"4","score":""},"meta":{"matchId":"match-1-2"}},{"team1":{"id":"5","score":""},"team2":{"id":"6","score":""},"meta":{"matchId":"match-1-3"}},{"team1":{"id":"7","score":""},"team2":{"id":"8","score":""},"meta":{"matchId":"match-1-4"}},{"team1":{"id":"9","score":""},"team2":{"id":"10","score":""},"meta":{"matchId":"match-1-5"}},{"team1":{"id":"11","score":""},"team2":{"id":"12","score":""},"meta":{"matchId":"match-1-6"}},{"team1":{"id":"13","score":""},"team2":{"id":"14","score":""},"meta":{"matchId":"match-1-7"}},{"team1":{"id":"15","score":""},"team2":{"id":"16","score":""},"meta":{"matchId":"match-1-8"}},{"team1":{"id":"17","score":""},"team2":{"id":"18","score":""},"meta":{"matchId":"match-1-9"}},{"team1":{"id":"19","score":""},"team2":{"id":"20","score":""},"meta":{"matchId":"match-1-10"}},{"team1":{"id":"21","score":""},"team2":{"id":"22","score":""},"meta":{"matchId":"match-1-11"}},{"team1":{"id":"23","score":""},"team2":{"id":"24","score":""},"meta":{"matchId":"match-1-12"}}],[{"team1":{"id":"25","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-1","matchType":1}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-2"}},{"team1":{"id":"26","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-3","matchType":1}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-4"}},{"team1":{"id":"27","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-5","matchType":1}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-6"}},{"team1":{"id":"28","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-7","matchType":1}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-8"}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-1"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-2"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-3"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-4"}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-1"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-2"}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-1","matchType":"finals"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-2","matchType":"bronze"}}]]');
		scope.match = data[1][4];
		mockData.tData = data;

		result = connectorService.findConnectingMatchId(scope.match);

		expect(result).toBe('match-1-7');
	});

	it("should find parent match in loser bracket", function() {
		data = JSON.parse('[[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-1-1-L","UIShiftDown":7.5,"team1Parent":"match-2-2","team2Parent":"match-2-3"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-1-2-L","UIShiftDown":8.5,"team1Parent":"match-2-5","team2Parent":"match-2-6"}}],[{"team1":{"id":"1","score":""},"team2":{"id":"2","score":""},"meta":{"matchId":"match-2-1","loserMatchId":"match-2-1-L"}},{"team1":{"id":"3","score":""},"team2":{"id":"4","score":""},"meta":{"matchId":"match-2-2","loserMatchId":"match-1-1-L"}},{"team1":{"id":"5","score":""},"team2":{"id":"6","score":""},"meta":{"matchId":"match-2-3","loserMatchId":"match-1-1-L"}},{"team1":{"id":"7","score":""},"team2":{"id":"8","score":""},"meta":{"matchId":"match-2-4","loserMatchId":"match-2-3-L"}},{"team1":{"id":"9","score":""},"team2":{"id":"10","score":""},"meta":{"matchId":"match-2-5","loserMatchId":"match-1-2-L"}},{"team1":{"id":"11","score":""},"team2":{"id":"12","score":""},"meta":{"matchId":"match-2-6","loserMatchId":"match-1-2-L"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-1-L","matchType":2,"team1Parent":"match-2-1","team2Parent":"match-3-4"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-2-L","matchType":1,"team1Parent":"match-3-3"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-3-L","matchType":2,"team1Parent":"match-2-4","team2Parent":"match-3-2"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-4-L","matchType":1,"team1Parent":"match-3-1"}}],[{"team1":{"id":"13","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-1","matchType":1,"loserMatchId":"match-2-4-L"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-2","loserMatchId":"match-2-3-L"}},{"team1":{"id":"14","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-3","matchType":1,"loserMatchId":"match-2-2-L"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-4","loserMatchId":"match-2-1-L"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-1-L","team1Parent":"match-4-2"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-2-L","team1Parent":"match-4-1"}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-1","loserMatchId":"match-3-2-L"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-2","loserMatchId":"match-3-1-L"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-1-L"}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-1","loserMatchId":"match-5-1-L"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-1-L","matchType":1,"team1Parent":"match-5-1"}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-6-1","matchType":"finals"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-6-2","matchType":"finals2"}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-6-3","matchType":"bronze"}}]]');
		scope.match = data[1][7];
		mockData.tData = data;

		result = connectorService.findConnectingMatchId(scope.match);

		expect(result).toBe('match-1-1-L');

		scope.match = data[3][2];
		result = connectorService.findConnectingMatchId(scope.match);

		expect(result).toBe('match-3-1-L');
	});
});
