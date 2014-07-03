/**
* Main controller for the bracket.
*/
angular.module('ngBracket').controller('bracketController', ['$scope', '$window', 'positioningService', 'data', 'highlight', 'matchDetailService', 'tournament', function($scope, $window, positioningService, data, highlight, matchDetailService, tournament){

	// Dummy data for page load
	$scope.participants = [];
	$scope.tournamentData = {
	type: "SE",
	matches: []
	};

	// Dummy data untill there's a service to fetch data from db.
	var SEsampleParticipantsData = JSON.parse('[{"name":"Austria","id":"1","flag":"countries/aut","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"Czech","id":"2","flag":"countries/cze","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"France","id":"3","flag":"countries/fra","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"Switzerland","id":"4","flag":"countries/sui","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"United States","id":"5","flag":"countries/usa","members":["Player1", "Player21", "Player3", "Player4", "Player5"]},{"name":"Sweden","id":"6","flag":"countries/swe","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"Finland","id":"7","flag":"countries/fin","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"Germany","id":"8","flag":"countries/ger","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"Russia","id":"9","flag":"countries/rus","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"Canada","id":"10","flag":"countries/can","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"United Kingdom","id":"11","flag":"countries/uk","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"China","id":"12","flag":"countries/chi","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"Denmark","id":"13","flag":"countries/den","members":["Player1", "Player2", "Player3", "Player4", "Player5"]}]');
	var SEsampleTournamentData = JSON.parse('{"type":"SE","matches":[[{"team1":{"id":"1","score":""},"team2":{"id":"2","score":""},"meta":{"matchId":"match-1-1"},"details":{}},{"team1":{"id":"3","score":4},"team2":{"id":"4","score":2},"meta":{"matchId":"match-1-2"},"details":{}},{"team1":{"id":"5","score":""},"team2":{"id":"6","score":""},"meta":{"matchId":"match-1-3"},"details":{}},{"team1":{"id":"7","score":""},"team2":{"id":"8","score":""},"meta":{"matchId":"match-1-4"},"details":{}},{"team1":{"id":"9","score":3},"team2":{"id":"10","score":4},"meta":{"matchId":"match-1-5"},"details":{}}],[{"team1":{"id":"11","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-1","matchType":1},"details":{}},{"team1":{"id":"12","score":""},"team2":{"id":"3","score":""},"meta":{"matchId":"match-2-2","matchType":1},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-3"},"details":{}},{"team1":{"id":"13","score":0},"team2":{"id":"10","score":2},"meta":{"matchId":"match-2-4","matchType":1},"details":{}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-1"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"10","score":""},"meta":{"matchId":"match-3-2"},"details":{}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-1"},"details":{}}]]}');
	
	var DEsampleParticipantsData = JSON.parse('[{"name":"Player 1","id":"1","flag":"countries/aut","members":[]},{"name":"Player 2","id":"2","flag":"countries/den","members":[]},{"name":"Player 3","id":"3","flag":"countries/ger","members":[]},{"name":"Player 4","id":"4","flag":"countries/usa","members":[]},{"name":"Player 5","id":"5","flag":"countries/swe","members":[]},{"name":"Player 6","id":"6","flag":"countries/fra","members":[]},{"name":"Player 7","id":"7","flag":"countries/fin","members":[]},{"name":"Player 8","id":"8","flag":"countries/est","members":[]},{"name":"Player 9","id":"9","flag":"countries/aut","members":[]},{"name":"Player 10","id":"10","flag":"countries/uk","members":[]},{"name":"Player 11","id":"11","flag":"countries/chi","members":[]},{"name":"Player 12","id":"12","flag":"countries/usa","members":[]},{"name":"Player 13","id":"13","flag":"countries/can","members":[]},{"name":"Player 14","id":"14","flag":"countries/usa","members":[]},{"name":"Player 15","id":"15","flag":"countries/swe","members":[]},{"name":"Player 16","id":"16","flag":"countries/cze","members":[]},{"name":"Player 17","id":"17","flag":"countries/rus","members":[]},{"name":"Player 18","id":"18","flag":"countries/ger","members":[]},{"name":"Player 19","id":"19","flag":"countries/fin","members":[]},{"name":"Player 20","id":"20","flag":"countries/den","members":[]},{"name":"Player 21","id":"21","flag":"countries/ger","members":[]},{"name":"Player 22","id":"22","flag":"countries/sui","members":[]}]');
	var DEsampleTournamentData = JSON.parse('{"type":"DE","matches":[[{"team1":{"id":"1","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-1-1-L","UIShiftDown":8.5,"team1Parent":"match-3-1","team2Parent":"match-4-6"},"details":{}},{"team1":{"id":"3","score":4},"team2":{"id":"8","score":2},"meta":{"matchId":"match-1-2-L","UIShiftDown":8.5,"team1Parent":"match-3-2","team2Parent":"match-4-5"},"details":{}},{"team1":{"id":"6","score":5},"team2":{"id":"5","score":3},"meta":{"matchId":"match-1-3-L","UIShiftDown":8.5,"team1Parent":"match-3-3","team2Parent":"match-4-4"},"details":{}},{"team1":{"id":"7","score":1},"team2":{"id":"16","score":2},"meta":{"matchId":"match-1-4-L","UIShiftDown":8.5,"team1Parent":"match-3-4","team2Parent":"match-4-3"},"details":{}},{"team1":{"id":"10","score":2},"team2":{"id":"4","score":3},"meta":{"matchId":"match-1-5-L","UIShiftDown":8.5,"team1Parent":"match-3-5","team2Parent":"match-4-2"},"details":{}},{"team1":{"id":"11","score":4},"team2":{"id":"2","score":1},"meta":{"matchId":"match-1-6-L","UIShiftDown":8.5,"team1Parent":"match-3-6","team2Parent":"match-4-1"},"details":{}}],[{"team1":{"id":"20","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-1-L","matchType":1,"team1Parent":"match-4-7"},"details":{}},{"team1":{"id":"3","score":1},"team2":{"id":"6","score":2},"meta":{"matchId":"match-2-2-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"16","score":""},"meta":{"matchId":"match-2-3-L","matchType":1,"team1Parent":"match-4-8"},"details":{}},{"team1":{"id":"4","score":3},"team2":{"id":"11","score":2},"meta":{"matchId":"match-2-4-L"},"details":{}}],[{"team1":{"id":"1","score":1},"team2":{"id":"2","score":3},"meta":{"matchId":"match-3-1","loserMatchId":"match-1-1-L"},"details":{}},{"team1":{"id":"3","score":2},"team2":{"id":"4","score":3},"meta":{"matchId":"match-3-2","loserMatchId":"match-1-2-L"},"details":{}},{"team1":{"id":"5","score":2},"team2":{"id":"6","score":1},"meta":{"matchId":"match-3-3","UIShiftDown":1,"loserMatchId":"match-1-3-L"},"details":{}},{"team1":{"id":"7","score":1},"team2":{"id":"8","score":5},"meta":{"matchId":"match-3-4","UIShiftDown":1,"loserMatchId":"match-1-4-L"},"details":{}},{"team1":{"id":"9","score":4},"team2":{"id":"10","score":2},"meta":{"matchId":"match-3-5","UIShiftDown":1,"loserMatchId":"match-1-5-L"},"details":{}},{"team1":{"id":"11","score":1},"team2":{"id":"12","score":3},"meta":{"matchId":"match-3-6","UIShiftDown":2,"loserMatchId":"match-1-6-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-1-L","matchType":1,"team1Parent":"match-5-4"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"6","score":""},"meta":{"matchId":"match-3-2-L","matchType":1,"team1Parent":"match-5-3"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-3-L","matchType":1,"team1Parent":"match-5-2"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"4","score":""},"meta":{"matchId":"match-3-4-L","matchType":1,"team1Parent":"match-5-1"},"details":{}}],[{"team1":{"id":"13","score":5},"team2":{"id":"2","score":2},"meta":{"matchId":"match-4-1","matchType":1,"loserMatchId":"match-1-6-L"},"details":{}},{"team1":{"id":"14","score":4},"team2":{"id":"4","score":0},"meta":{"matchId":"match-4-2","matchType":1,"loserMatchId":"match-1-5-L"},"details":{}},{"team1":{"id":"15","score":3},"team2":{"id":"16","score":2},"meta":{"matchId":"match-4-3","matchType":2,"loserMatchId":"match-1-4-L"},"details":{}},{"team1":{"id":"17","score":2},"team2":{"id":"5","score":1},"meta":{"matchId":"match-4-4","matchType":1,"loserMatchId":"match-1-3-L"},"details":{}},{"team1":{"id":"18","score":3},"team2":{"id":"8","score":2},"meta":{"matchId":"match-4-5","matchType":1,"loserMatchId":"match-1-2-L"},"details":{}},{"team1":{"id":"19","score":""},"team2":{"id":"9","score":""},"meta":{"matchId":"match-4-6","matchType":1,"loserMatchId":"match-1-1-L"},"details":{}},{"team1":{"id":"20","score":1},"team2":{"id":"21","score":2},"meta":{"matchId":"match-4-7","matchType":2,"loserMatchId":"match-2-1-L"},"details":{}},{"team1":{"id":"22","score":""},"team2":{"id":"12","score":""},"meta":{"matchId":"match-4-8","matchType":1,"loserMatchId":"match-2-3-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-1-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-2-L"},"details":{}}],[{"team1":{"id":"13","score":""},"team2":{"id":"14","score":""},"meta":{"matchId":"match-5-1","loserMatchId":"match-3-4-L"},"details":{}},{"team1":{"id":"15","score":""},"team2":{"id":"17","score":""},"meta":{"matchId":"match-5-2","loserMatchId":"match-3-3-L"},"details":{}},{"team1":{"id":"18","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-3","loserMatchId":"match-3-2-L"},"details":{}},{"team1":{"id":"21","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-4","loserMatchId":"match-3-1-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-1-L","matchType":1,"team1Parent":"match-6-1"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-2-L","matchType":1,"team1Parent":"match-6-2"},"details":{}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-6-1","loserMatchId":"match-5-1-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-6-2","loserMatchId":"match-5-2-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-6-1-L"},"details":{}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-7-1","loserMatchId":"match-7-1-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-7-1-L","matchType":1,"team1Parent":"match-7-1"},"details":{}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-8-1","matchType":"finals"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-8-2","matchType":"finals2"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-8-3","matchType":"bronze"},"details":{}}]],"properties":{"unbalanced":true,"lbOffset":8.5}}');

	$scope.highlight = highlight.mapHighlight();
	$scope.matchToShow = matchDetailService.mapMatchDetails();

	$scope.calculateRoundHeight = function(){
		var height = 0;

		if($scope.tournamentData.matches.length > 0){
			var properties = positioningService.getBracketProperties();
			$scope.startingRound = properties.startingRound;
			var longestRound = properties.roundHeight !== null ? properties.roundHeight : $scope.tournamentData.matches[0].length > $scope.tournamentData.matches[1].length ? $scope.tournamentData.matches[0].length : $scope.tournamentData.matches[1].length;
			longestRound += $scope.tournamentData.type === 'DE' ? 0.5 : 0;
			height = longestRound * (properties.matchHeight + properties.matchMarginV) + properties.roundMarginTop;		
		}
		return height;
	};

	$scope.calculateRoundWidth = function(){
		var width = 0;

		if($scope.tournamentData.matches.length > 0){
			var properties = positioningService.getBracketProperties();
			width = $scope.tournamentData.matches.length * (properties.matchWidth + properties.matchMarginH) + 40;
		}
		return width;
	};

	// For demo page, can be removed
	$scope.addPlayer = function(){
		if($scope.newPlayerName){
			$scope.participants.push({name:$scope.newPlayerName, id: ($scope.participants.length + 1).toString(), flag:'countries/' + $scope.newPlayerFlag, members:[]});
		}
	};

	// For demo page, can be removed
	$scope.generateWithRandomPlayers = function(){
		if($scope.playersToGenerate){
			$scope.participants = [];
			$scope.tournamentData = {type: $scope.tType, matches: [], properties:{}};
			var n = parseInt($scope.playersToGenerate);
			if(n > 3){
				for(var i=1;i<=n;i++){
					$scope.participants.push({name:'Player'+i, id: i.toString(), flag:'', members:[]});	
				}
				$scope.tournamentData = tournament.newTournament($scope.tType, $scope.participants, $scope.playBronzeMatch);
			}
		}
	};

	// For demo page, can be removed
	$scope.newTournament = function(){
		$scope.tournamentData = tournament.newTournament($scope.tType, $scope.participants, $scope.playBronzeMatch);
	};

	// For demo page, can be removed
	$scope.loadTournament = function(sample){
		if(sample === 'SE'){
			$scope.tournamentData = SEsampleTournamentData;
			$scope.participants = SEsampleParticipantsData;
			data.loadTournament(SEsampleTournamentData, SEsampleParticipantsData);	
		}
		else if(sample === 'DE'){
			$scope.tournamentData = DEsampleTournamentData;
			$scope.participants = DEsampleParticipantsData;
			data.loadTournament(DEsampleTournamentData, DEsampleParticipantsData);	
		}
	};

	// For demo page, can be removed
	$scope.showDetails = function(){
		matchDetailService.hideDetails();
		matchDetailService.setEnabled($scope.enableDetails);
	};
	
}]);