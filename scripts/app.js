/**
* Main controller for the bracket.
* 
* Tournament types: SE = Single elimination
*					DE = Double elimination (TODO)
*
* Match types: 1 = Match where one player is promoted from round1 to round2. That is, instead of 2, there is 3 players fighting over one slot.
* 			   2 = A full round 1 match promoted to round 2.
*/
angular.module('ngBracket').controller('bracketController', ['$scope', '$window', 'positioningService', 'data', function($scope, $window, positioningService, data){

	$scope.participants = [];

	$scope.tournamentData = {
	type: "SE",
	matches: []
	};

	$scope.calculateRoundHeight = function(){
		var height = 0;

		if($scope.tournamentData.matches.length > 0){
			var properties = positioningService.getBracketProperties();
			var longestRound = $scope.tournamentData.matches[0].length > $scope.tournamentData.matches[1].length ? $scope.tournamentData.matches[0].length : $scope.tournamentData.matches[1].length;
			height = longestRound * (properties.matchHeight + properties.matchMarginV) + properties.roundMarginTop;			
		}
		return height;
	}

	$scope.calculateRoundWidth = function(){
		var width = 0;

		if($scope.tournamentData.matches.length > 0){
			var properties = positioningService.getBracketProperties();
			width = $scope.tournamentData.matches.length * (properties.matchWidth + properties.matchMarginH) + 40;
		}
		return width;
	}

	$scope.addPlayer = function(){
		if($scope.newPlayerName){
			$scope.participants.push({name:$scope.newPlayerName, id: ($scope.participants.length + 1).toString(), flag:'/countries/' + $scope.newPlayerFlag, members:[]});
		}
	}

	$scope.loadTournament = function(tData){
		data.setTournament(tData);
		$scope.tournamentData = tData;
	}

	$scope.newTournament = function(){

		function generateRound(participants, roundNumber, tournamentData){

			function fillMatch(teamslot, team){
				if(teamslot != null && team != null){
					teamslot.id = team.id;
				}
			}

			function createMatch(roundNumber, matchNumber){
				return {team1:{id:"", score:""},
						team2:{id:"", score:""},
						meta: {matchId:("match-"+ roundNumber + "-" + matchNumber)},
						details:{}
					};
			};

			function getEvenDistribution(roundLength, participantsLength, promotedRound){
				var dist = [];
				var pairsAdded = 0;
				var firstHalfEven = 0;
				var firstHalfOdd = 0;
				var secondHalfEven = 0;
				var secondHalfOdd = 0;

				for(var i=0;i<roundLength;i++){
					dist[i] = promotedRound ? 1 : 0;
				}

				for(var i=(promotedRound ? roundLength : 0);i<participantsLength;i++){
					var indeksi = 0;
					if(pairsAdded % 2 === 0){
						if(firstHalfEven < (roundLength / 4)){
							indeksi = 2*firstHalfEven + 1;
							firstHalfEven += 1;
						}
						else{
							indeksi = 2*firstHalfOdd;
							firstHalfOdd += 1;
						}
					}
					else{
						if(secondHalfEven < (roundLength / 4)){
							indeksi = roundLength/2 + 2*secondHalfEven + 1;
							secondHalfEven += 1;
						}
						else{
							indeksi = roundLength/2 + 2*secondHalfOdd;
							secondHalfOdd += 1;
						}
					}
					dist[indeksi] += 1;
					pairsAdded += 1;
				}

				return dist;
			}

			function shiftPreviousRound(currentRound, previousRound){
				var x = 0;
				for(var i=0;i<currentRound.length;i++){
					if(currentRound[i].meta.matchType != 2){
						x += (currentRound[i].meta.matchType == 1) ? 1 : 2;
					}
				}
				for(var i=x;i<previousRound.length;i++){
					previousRound[i].meta.UIShiftDown = (previousRound[i].meta.UIShiftDown) ? (previousRound[i].meta.UIShiftDown) + 1 : 1;
				}
			}

			var round = [];
			var closestBalancedTree = 1;
			var balancingRound = null;
			var shiftedMatches = 0;

			if(roundNumber === 1){
				// find the closest balanced tree
				while(closestBalancedTree*2 < participants.length){
					closestBalancedTree *= 2;
				}
				// closestBalancedTree / 2 is the target for round 2
				var excessParticipants = participants.length - closestBalancedTree;

				if(excessParticipants > 0){
					shiftedMatches = excessParticipants - (closestBalancedTree / 2);
					var startIndex = shiftedMatches == 0 ? closestBalancedTree : ((shiftedMatches > 0) ? closestBalancedTree + (shiftedMatches*2) : closestBalancedTree - (Math.abs(shiftedMatches)*2));
					balancingRound = participants.slice(startIndex, participants.length);
					participants.splice(startIndex, participants.length);
				}
			}
			
			// Loop through participants / previous round games, and create new match for every two entries
			for(var i=0; i < participants.length; i++){
				var match = createMatch(roundNumber, round.length + 1);

				if(roundNumber === 1){
					// normal brackets untill reaching biggest possible balanced tree...
					if(i % 2 !== 0){
						continue;
					}
					fillMatch(match.team1, participants[i]);
					fillMatch(match.team2, participants[i+1]);
				}
				else if(i % 2 !== 0){ 
					continue; 
				}
				
				round.push(match);
			}

			if(roundNumber === 1 && balancingRound !== null && balancingRound.length > 0){
				tournamentData.matches.push(round.slice());
				var roundB = [];
				// Round 1 and Round 2 are equally long --> have to balance every match.	
				if(shiftedMatches === 0){
					for(var i=0; i < balancingRound.length; i++){
						var m = createMatch(roundNumber + 1, roundB.length + 1);
						fillMatch(m.team1, balancingRound[i]);
						m.meta.matchType = 1;
						roundB.push(m);
					}
				}
				// Shifted more rounds to the left (1st round)	
				else if(shiftedMatches > 0){
					var dist = getEvenDistribution(closestBalancedTree / 2, balancingRound.length, false);
					var p = 0;
					for(var i=0; i<dist.length;i++){
						var match = createMatch(roundNumber + 1, roundB.length + 1);
						if(dist[i] === 1){
							fillMatch(match.team1, balancingRound[p]);
							match.meta.matchType = 1;
							p += 1;
						}
						roundB.push(match);					
					}
				}
				// Shifted more rounds to the right (2nd round)
				else if(shiftedMatches < 0){
					// Create required amount of matches, at start with one participant in each
					var dist = getEvenDistribution(closestBalancedTree / 2, balancingRound.length, true);
					var j = 0;
					for(var i=0;i<closestBalancedTree/2;i++){
						var m = createMatch(roundNumber + 1, roundB.length + 1);
						fillMatch(m.team1, balancingRound[j]);
						m.meta.matchType = 1;

						if(dist[i] === 2){
							fillMatch(m.team2, balancingRound[j+1]);
							m.meta.matchType = 2;
							shiftPreviousRound(roundB, round);
							j += 1;
						}
						j += 1;
						roundB.push(m);
					}
				}

				participants = null;
				return roundB;
			}
			participants = null;

			return round;
		};

		if($scope.participants.length < 3){
			return;
			//Todo prompt
		}

		// Clear the table
		data.setParticipants($scope.participants.slice());

		var previousRound = [];
		var roundNumber = 1;

		// Create new rounds untill there is only one match, the finals, left.
		while(roundNumber == 1 || Math.floor(previousRound.length) > 1){
			var partic = previousRound;

			if(roundNumber == 1){
				partic = $scope.participants.slice();
			}

			previousRound = generateRound(partic, roundNumber, $scope.tournamentData); 
			$scope.tournamentData.matches.push(previousRound.slice());
			roundNumber = $scope.tournamentData.matches.length + 1;
		}

		data.setTournament($scope.tournamentData);
	};
}]);