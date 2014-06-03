/**
* Main controller for the bracket.
* 
* Tournament types: SE = Single elimination
*					DE = Double elimination (TODO)
*
* Match types: 1 = Match where one player is promoted from round1 to round2. That is, instead of 2, there is 3 players fighting over one slot.
* 			   2 = A full round 1 match promoted to round 2.
*/
angular.module('ngBracket').controller('bracketController', ['$scope', '$window', 'positioningService', 'data', 'highlight', 'matchDetailService', function($scope, $window, positioningService, data, highlight, matchDetailService){

	$scope.participants = [];

	$scope.tournamentData = {
	type: "SE",
	matches: []
	};

	$scope.highlight = highlight.mapHighlight();
	$scope.matchToShow = matchDetailService.mapMatchDetails();

	$scope.calculateRoundHeight = function(){
		var height = 0;

		if($scope.tournamentData.matches.length > 0){
			var properties = positioningService.getBracketProperties();
			var longestRound = $scope.tournamentData.matches[0].length > $scope.tournamentData.matches[1].length ? $scope.tournamentData.matches[0].length : $scope.tournamentData.matches[1].length;
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
			$scope.tournamentData = {type: "SE", matches: []};
			var n = parseInt($scope.playersToGenerate);
			if(n > 3){
				for(var i=1;i<=n;i++){
					$scope.participants.push({name:'Player'+i, id: i.toString(), flag:'', members:[]});	
				}
				$scope.newTournament();
			}
		}
	};

	// For demo page, can be removed
	$scope.loadTournament = function(){
		$scope.tournamentData = data.loadTournament();
		$scope.participants = data.getParticipants();
	};

	// For demo page, can be removed
	$scope.showDetails = function(){
		matchDetailService.hideDetails();
		matchDetailService.setEnabled($scope.enableDetails);
	};

	$scope.newTournament = function(){

		function generateRound(participants, roundNumber, tournamentData){

			function createMatch(roundNumber, matchNumber){
				return {team1:{id:"", score:""},
						team2:{id:"", score:""},
						meta: {matchId:("match-"+ roundNumber + "-" + matchNumber)},
						details:{}
					};
			}

			function getEvenDistribution(roundLength, participantsLength, promotedRound){
				var dist = [];
				var i, overflow, searchStart;
				var x = promotedRound ? Math.floor((2*roundLength)-participantsLength) : participantsLength;

				for(i=0;i<roundLength;i++){
					dist[i] = promotedRound ? 2 : 0;
				}

				var spread = roundLength % x === 0 ? roundLength / x : 2;
				for(i=0; i<x; i++){
					overflow = false;
					searchStart = 0;
					var ind = i === 0 ? 0 : (i % 2 === 0) ? Math.max((i/2 - 1)*spread, 0) : (roundLength / 2) + Math.max((Math.floor(i/2) - 1)*spread, 0);
					if(i > 1){ ind += spread; }

					if(ind > roundLength - 1){
						overflow = true;
						searchStart = (roundLength / 2) - 1;
					}

					if(dist[ind] === 1 || overflow){
						for(var n=searchStart;n<roundLength;n++){
							if(dist[n] !== 1) { 
								ind = n;
								break;
							}
						}
					}

					dist[ind] = promotedRound ? dist[ind] - 1 : dist[ind] + 1;
				}

				return dist;
			}

			function shiftPreviousRound(currentRound, previousRound){
				var x = 0;
				var i;
				for(i=0;i<currentRound.length;i++){
					if(currentRound[i].meta.matchType != 2){
						x += (currentRound[i].meta.matchType == 1) ? 1 : 2;
					}
				}
				for(i=x;i<previousRound.length;i++){
					previousRound[i].meta.UIShiftDown = (previousRound[i].meta.UIShiftDown) ? (previousRound[i].meta.UIShiftDown) + 1 : 1;
				}
			}

			var round = [];
			var closestBalancedTree = 1;
			var balancingRound = null;
			var shiftedMatches = 0;
			var i, match;

			if(roundNumber === 1){
				// find the closest balanced tree
				while(closestBalancedTree*2 < participants.length){
					closestBalancedTree *= 2;
				}
				// closestBalancedTree / 2 is the target for round 2
				var excessParticipants = participants.length - closestBalancedTree;

				if(excessParticipants > 0){
					shiftedMatches = excessParticipants - (closestBalancedTree / 2);
					var startIndex = shiftedMatches === 0 ? closestBalancedTree : ((shiftedMatches > 0) ? closestBalancedTree + (shiftedMatches*2) : closestBalancedTree - (Math.abs(shiftedMatches)*2));
					balancingRound = participants.slice(startIndex, participants.length);
					participants.splice(startIndex, participants.length);
				}
			}
			
			// Loop through participants / previous round matches and create following match
			for(i=0; i < participants.length; i++){
				match = createMatch(roundNumber, round.length + 1);

				if(roundNumber === 1){
					// normal brackets untill reaching biggest possible balanced tree...
					if(i % 2 !== 0){
						continue;
					}
					match.team1.id = participants[i].id;
					match.team2.id = participants[i+1].id;
				}
				else if(i % 2 !== 0){ 
					continue; 
				}
				
				round.push(match);
			}

			var dist;
			if(roundNumber === 1 && balancingRound !== null && balancingRound.length > 0){
				tournamentData.matches.push(round.slice());
				var roundB = [];
				// Round 1 and Round 2 are equally long --> have to balance every match.	
				if(shiftedMatches === 0){
					for(i=0; i < balancingRound.length; i++){
						match = createMatch(roundNumber + 1, roundB.length + 1);
						match.team1.id = balancingRound[i].id;
						match.meta.matchType = 1;
						roundB.push(match);
					}
				}
				// Shifted more rounds to the left (1st round)	
				else if(shiftedMatches > 0){
					dist = getEvenDistribution(closestBalancedTree / 2, balancingRound.length, false);
					var p = 0;
					for(i=0; i<dist.length;i++){
						match = createMatch(roundNumber + 1, roundB.length + 1);
						if(dist[i] === 1){
							match.team1.id = balancingRound[p].id;
							match.meta.matchType = 1;
							p += 1;
						}
						roundB.push(match);					
					}
				}
				// Shifted more rounds to the right (2nd round)
				else if(shiftedMatches < 0){
					dist = getEvenDistribution(closestBalancedTree / 2, balancingRound.length, true);
					var j = 0;
					for(i=0;i<closestBalancedTree/2;i++){
						match = createMatch(roundNumber + 1, roundB.length + 1);
						match.team1.id = balancingRound[j].id;
						match.meta.matchType = 1;

						if(dist[i] === 2){
							match.team2.id = balancingRound[j+1].id;
							match.meta.matchType = 2;
							shiftPreviousRound(roundB, round);
							j += 1;
						}
						j += 1;
						roundB.push(match);
					}
				}

				participants = null;
				return roundB;
			}
			participants = null;

			return round;
		}

		if($scope.participants.length < 3){
			return;
		}

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