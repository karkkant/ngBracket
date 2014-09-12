/**
* Tournament generator as a service. Generates new Single elimination or Double elimination tournament bracket.
*
* params:
* 	type: 'SE' for Single elimination
*		  'DE' for Double elimination
* 	participants: Array of players/participants
* 	playBronzeMatch: True or False if bronze match is wanted
*
* Match types: 1 = Match where one player is promoted from round1 to round2. That is, instead of 2, there is 3 players fighting over one slot.
* 			   2 = A full round 1 match promoted to round 2.
**/
myApp.factory('tournament', function(){
	return {
		newTournament: function(ttype, participants, playBronzeMatch){

			function createMatch(roundNumber, matchNumber){
				return {team1:{id:"", score:""},
						team2:{id:"", score:""},
						meta: {matchId:("match-"+ roundNumber + "-" + matchNumber)},
						details:{}
					};
			}

			function getEvenDistribution(roundLength, participantsLength, promotedRound){
				var dist = [];
				var x = promotedRound ? (2*roundLength) - participantsLength : participantsLength;
				var step = promotedRound ? roundLength/(Math.abs((2*roundLength)-participantsLength)): roundLength / participantsLength;			

				for(var i=0;i<roundLength;i++){
					dist[i] = promotedRound ? 2 : 0;
				}

				for(i=0;i<x;i++){
					var ind = Math.round(i*step);
					dist[ind] = promotedRound ? dist[ind] - 1 : dist[ind] + 1;
				}

				return dist;
			}		

			function generateRound(participants, roundNumber, tournamentData){

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
					tournamentData.properties.unbalanced = true;
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

			function generateLoserRound(round, roundNumber, loserBracket, tournamentData){
				var loserRound = [];
				var matchesNeeded, balancingMatches, i, match;

				if((roundNumber === 1 && tournamentData.matches.length > 1) || (tournamentData.properties.unbalanced && roundNumber === 2)){
					return;
				}

				var unbalancedLb = (roundNumber > 2 && tournamentData.properties.unbalanced && tournamentData.matches[0].length !== tournamentData.matches[1].length) ? 1 : 0;
				var prevFirstOrBalancing = true;

				if(roundNumber > 1){
					var l = loserBracket.length-1;
					for(i=0;i<loserBracket[l].length;i++){
						if(!loserBracket[l][i].meta.matchType){
							prevFirstOrBalancing = false;
							break;
						}
					}
				}

				// special cases
				if(prevFirstOrBalancing && roundNumber === 3 && (tournamentData.matches[0].length < tournamentData.matches[1].length || loserBracket[0].length === loserBracket[1].length)){
					prevFirstOrBalancing = false;
				}

				if((roundNumber + unbalancedLb) % 2 === 0 && !prevFirstOrBalancing){
					matchesNeeded = Math.floor(loserBracket[loserBracket.length - 1].length);
					balancingMatches = true;
				}
				else{
					if(tournamentData.properties.unbalanced && roundNumber <= 2){
						if(round.length === tournamentData.matches[0].length){
							matchesNeeded = round.length;
						}
						else if(round.length > tournamentData.matches[0].length)
						{
							loserBracket[0] = [];
							loserBracket[1] = [];

							for(i=0;i<tournamentData.matches[0].length;i++){
								loserBracket[0].push(createMatch(1, (i+1) + '-L'));
							}

							var d = loserBracket[0].length > (round.length/2);
							dist = getEvenDistribution((round.length/2), loserBracket[0].length, d);

							for(i=0;i<(round.length/2);i++){
								match = createMatch(2, (i+1) + '-L');

								if(d){
									if(dist[i] === 1){
										match.meta.matchType = 1;
									}
								}
								else{
									match.meta.matchType = dist[i] === 1 ? 1 : 2;
								}
								
								loserBracket[1].push(match);
							}

							if(!d && dist.length > loserBracket[0].length){
								var shiftDown = 0;
								var ind = 0;
								for(i=0;i<dist.length;i++){
									if(dist[i] !== 1){
										shiftDown += 1;
									}
									else{
										loserBracket[0][ind].meta.UIShiftDown = shiftDown;
										ind += 1;
									}
								}
							}
							return;
						}
						else if(round.length < tournamentData.matches[0].length){
							loserBracket[0] = [];
							loserBracket[1] = [];
							var sd = 0;

							for(i=0; i<round.length; i++){
								if(round[i].meta.matchType === 1){
									match = createMatch(2, (i+1) + '-L');
									match.meta.matchType = 2;
									loserBracket[1].push(match);
									sd += 1;
								}
								else{
									match = createMatch(1, (loserBracket[0].length + 1) + '-L');
									match.meta.UIShiftDown = sd;
									loserBracket[0].push(match);
									match = createMatch(2, (i+1) + '-L');
									match.meta.matchType = 1;
									loserBracket[1].push(match);
								}
							}
							return;
						}
					}
					else{
						matchesNeeded = roundNumber === 1 ? Math.floor(round.length / 2) : Math.floor(loserBracket[loserBracket.length - 1].length / 2);
					}
				}

				for(i=1; i<=matchesNeeded; i++){
					match = createMatch(loserBracket.length + 1, i + '-L');
					if(balancingMatches){
						match.meta.matchType = 1;
					}
					loserRound.push(match);
				}

				loserBracket.push(loserRound);	
				// Last round in main bracket, fill in the loser bracket if needed.
				if(round.length === 1){
					while(loserBracket[loserBracket.length - 1].length !== 1 || loserBracket[loserBracket.length - 2].length !== 1){
						roundNumber += 1;
						var lr = [];
						matchesNeeded = (roundNumber + unbalancedLb) % 2 === 0 ? Math.floor(loserBracket[loserBracket.length - 1].length) : Math.floor(loserBracket[loserBracket.length - 1].length / 2);
						balancingMatches = (roundNumber + unbalancedLb) % 2 === 0;
						if(matchesNeeded === 0){
							matchesNeeded = 1;
							balancingMatches = true;
						}

						for(i=1;i<=matchesNeeded;i++){
							match = createMatch(loserBracket.length + 1, i + '-L');
							if(balancingMatches){
								match.meta.matchType = 1;
							}
							lr.push(match);
						}
						loserBracket.push(lr);
					}
				}
			}

			var tournamentData = {
				type: ttype,
				matches: [],
				properties: {}
			};

			// Got to have at least 4 participants
			if(participants.length < 3){
				return tournamentData;
			}			

			var previousRound = [];
			var loserBracket = [];
			var roundNumber = 1;

			// Create new rounds untill there is only one match, the finals, left.
			while(roundNumber === 1 ||  Math.floor(previousRound.length) > 1){
				var partic = previousRound;

				if(roundNumber === 1){
					partic = participants.slice();
				}

				previousRound = generateRound(partic, roundNumber, tournamentData); 

				if(tournamentData.type === 'DE'){
					generateLoserRound(previousRound, roundNumber, loserBracket, tournamentData);
				}

				tournamentData.matches.push(previousRound.slice());
				roundNumber = tournamentData.matches.length + 1;
			}

			if(tournamentData.type === 'DE'){
				// Set starting position for loser bracket
				var shift = Math.max(tournamentData.matches[0].length, tournamentData.matches[1].length) + 0.5;
				for(var i=0;i<loserBracket[0].length;i++){
					loserBracket[0][i].meta.UIShiftDown = isNaN(loserBracket[0][i].meta.UIShiftDown) ? shift : loserBracket[0][i].meta.UIShiftDown + shift;
					tournamentData.properties.lbOffset = shift;
				}

				// Fix match ID's and link loser matches to their parents
				shift = loserBracket.length - tournamentData.matches.length;
				var normalizedStart = 0;
				var rLength, fixedId, x;

				if(tournamentData.properties.unbalanced){
					if(tournamentData.matches[0].length === tournamentData.matches[1].length){
						for(i=0;i<2;i++){
							rLength = tournamentData.matches[i].length;

							for(j=0;j<tournamentData.matches[i].length;j++){
								fixedId = 'match-' + (i+1+shift) + '-' + (j+1);
								tournamentData.matches[i][j].meta.matchId = fixedId;

								if(i>0){ // invert order for 2nd round
									loserBracket[0][rLength - 1 - j].meta.team2Parent = fixedId;
									tournamentData.matches[i][j].meta.loserMatchId = loserBracket[0][rLength - 1 - j].meta.matchId;
								}
								else{
									loserBracket[0][j].meta.team1Parent = fixedId;
									tournamentData.matches[i][j].meta.loserMatchId = loserBracket[0][j].meta.matchId;
								}
							}
						}
					}
					else if(tournamentData.matches[0].length > tournamentData.matches[1].length){
						var fr = 0;
						var frInd = 0;
						for(i=0;i<2;i++){
							rLength = tournamentData.matches[i].length;
							for(j=0;j<rLength;j++){
								tournamentData.matches[i][j].meta.matchId = 'match-' + (i+1+shift) + '-' + (j+1);

								if(i>0){
									if(tournamentData.matches[i][j].meta.matchType === 1){
										loserBracket[i][j].meta.matchType = 2;
										loserBracket[i][j].meta.team1Parent = tournamentData.matches[0][fr].meta.matchId; // Match from first round
										loserBracket[i][j].meta.team2Parent = 'match-' + (i+1+shift) + '-' + (rLength - j); // Inverted match from 2nd round
										tournamentData.matches[0][fr].meta.loserMatchId = loserBracket[i][j].meta.matchId;
										tournamentData.matches[i][rLength-j-1].meta.loserMatchId = loserBracket[i][j].meta.matchId;
										fr += 1;
									}
									else{
										loserBracket[i][j].meta.matchType = 1;
										loserBracket[0][frInd].meta.team1Parent = tournamentData.matches[0][fr].meta.matchId;
										loserBracket[0][frInd].meta.team2Parent = tournamentData.matches[0][fr+1].meta.matchId;
										loserBracket[i][j].meta.team1Parent = 'match-' + (i+1+shift) + '-' + (rLength - j);
										tournamentData.matches[0][fr].meta.loserMatchId = loserBracket[0][frInd].meta.matchId;
										tournamentData.matches[0][fr+1].meta.loserMatchId = loserBracket[0][frInd].meta.matchId;
										tournamentData.matches[i][rLength-j-1].meta.loserMatchId = loserBracket[i][j].meta.matchId;
										frInd += 1;
										fr += 2;
									}
								}
							}
						}
					}
					else if(tournamentData.matches[0].length < tournamentData.matches[1].length){
						var firstRoundFull = false;
						for(i=0;i<2;i++){
							rLength = tournamentData.matches[i].length;

							for(j=0;j<rLength;j++){
								fixedId = 'match-' + (i+1+shift) + '-' + (j+1);
								tournamentData.matches[i][j].meta.matchId = fixedId;

								if(i===0){
									loserBracket[i][j].meta.team1Parent = fixedId;
									tournamentData.matches[i][j].meta.loserMatchId = loserBracket[i][j].meta.matchId;
								}
								else{
									if(tournamentData.matches[i][j].meta.matchType){
										if(firstRoundFull){
											for(x=0;x<loserBracket[1].length;x++){
												if((loserBracket[1][x].meta.matchType === 1 || loserBracket[1][x].meta.matchType === 2) && !loserBracket[1][x].meta.team1Parent){
													loserBracket[1][x].meta.team1Parent = fixedId;
													tournamentData.matches[i][j].meta.loserMatchId = loserBracket[1][x].meta.matchId;
													break;
												}
												else if(loserBracket[1][x].meta.matchType === 2 && !loserBracket[1][x].meta.team2Parent){
													loserBracket[1][x].meta.team2Parent = fixedId;
													tournamentData.matches[i][j].meta.loserMatchId = loserBracket[1][x].meta.matchId;
													break;
												}
											}
										}
										else{
											loserBracket[0][loserBracket[0].length-j-1].meta.team2Parent = fixedId;
											tournamentData.matches[i][j].meta.loserMatchId = loserBracket[0][loserBracket[0].length-j-1].meta.matchId;
											firstRoundFull = j === (loserBracket[0].length-1);
										}
									}
								}
							}
						}
					}

					normalizedStart = 2;
				}
				// Rest of the bracket is balanced
				for(i=normalizedStart;i<tournamentData.matches.length;i++){
					var tr = i < 2 ? i : (i * 2) - 1;
					var shiftInvert = 0;
					if(tournamentData.properties.unbalanced){
						tr -= 1;
						shiftInvert = 1;
					}
					if(i === tournamentData.matches.length-1){
						tr = loserBracket.length - 1;
					}

					rLength = tournamentData.matches[i].length;

					for(j=0;j<rLength;j++){
						var loserMatchId = 'match-' + (tr+1) + '-';
						if(i===0){
							loserMatchId += (Math.floor(j/2) + 1);
						}
						else{
							loserMatchId += ((i+shiftInvert) % 2 === 0) ? (j+1) : (rLength - j);
						}
						loserMatchId += '-L';
						fixedId = ('match-' + (i+1+shift) + '-' + (j+1));

						for(x=(loserBracket[tr].length-1); x>=0; x--){
							if(loserBracket[tr][x].meta.matchId === loserMatchId){
								if(!loserBracket[tr][x].meta.team1Parent){
									loserBracket[tr][x].meta.team1Parent = fixedId;
								}
								else{
									loserBracket[tr][x].meta.team2Parent = fixedId;
								}
								break;
							}
						}
						
						tournamentData.matches[i][j].meta.matchId = fixedId;
						tournamentData.matches[i][j].meta.loserMatchId = loserMatchId;
					}
				}

				// Link loser matches to their parents and merge brackets
				j = tournamentData.matches.length - 1;
				for(i=loserBracket.length-1;i>=0;i--){
					if(j >= 0){
						tournamentData.matches[j] = tournamentData.matches[j].concat(loserBracket[i]);
					}
					else{
						tournamentData.matches.unshift(loserBracket[i]);
					}
					j -= 1;
				}

				// Push new finals
				tournamentData.matches.push(new Array(createMatch(tournamentData.matches.length + 1, 1)));
				var doubleFinals = createMatch(tournamentData.matches.length, tournamentData.matches[tournamentData.matches.length-1].length + 1);
				doubleFinals.meta.matchType = 'finals2';
				tournamentData.matches[tournamentData.matches.length-1].push(doubleFinals);				
			}

			tournamentData.matches[tournamentData.matches.length - 1][0].meta.matchType = 'finals';

			if(playBronzeMatch){
				var bronzeMatch = createMatch(tournamentData.matches.length, tournamentData.matches[tournamentData.matches.length-1].length + 1);
				bronzeMatch.meta.matchType = 'bronze';
				tournamentData.matches[tournamentData.matches.length - 1].push(bronzeMatch);
			}

			return tournamentData;
		}
	};
});