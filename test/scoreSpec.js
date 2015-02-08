'use strict'

describe('Score control', function() {
	var $scope, element, scope;

	var mockData = {
		getTournamentType: function() {
			return 'SE';
		},
		updateTournament: function(match, winnerId, loserId, oldValue, promoteLoser) {},
		getOptions: function() { return {}; }
	}

	beforeEach(module('ngBracket'));
	beforeEach(module('templates'));

	beforeEach(function() {

		module(function($provide) {
			$provide.value('data', mockData);
		});

		inject(function($rootScope, $compile) {
			$scope = $rootScope.$new();
			$scope.match = {
				team1: {
					id: '',
					score: ''
				},
				team2: {
					id: '',
					score: ''
				}
			};
			$scope.results = {};

			element = angular.element('<score team="match.team2" match="match" results="results"></score>');
			$compile(element)($scope);
			scope = element.scope();
			scope.$digest();
		})

	});

	it("should be uneditable if either team is not set", function() {
		scope.match.team1.id = '1';
		scope.match.team2.id = undefined;

		element.triggerHandler('click');
		expect(element.isolateScope().status).toBe('uneditable');

		scope.match.team1.id = undefined;
		scope.match.team2.id = '4';

		element.triggerHandler('click');
		expect(element.isolateScope().status).toBe('uneditable');
	});

	it("should be editable when both teams are set", function() {
		expect(element.isolateScope().status).toBe('uneditable');

		scope.match.team1.id = '1';
		scope.match.team2.id = '2';

		element.triggerHandler('click');
		expect(element.isolateScope().status).toBe('editable');
	});

	it("should calculate results", function() {
		scope.match.team1.id = '1';
		scope.match.team2.id = '2';

		expect(scope.results.winner).toBe(undefined);
		expect(scope.results.loser).toBe(undefined);

		element.triggerHandler('click');
		scope.match.team1.score = 3;
		scope.match.team2.score = 0;
		
		angular.element(element[0].getElementsByTagName('input')[0]).triggerHandler('blur');

		expect(scope.results.winner).toBe(scope.match.team1.id);
		expect(scope.results.loser).toBe(scope.match.team2.id);

		element.triggerHandler('click');
		scope.match.team2.score = 4;
		angular.element(element[0].getElementsByTagName('input')[0]).triggerHandler('blur');

		expect(scope.results.winner).toBe(scope.match.team2.id);
		expect(scope.results.loser).toBe(scope.match.team1.id);
	});
});