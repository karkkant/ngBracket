var app = angular.module('ngBracket', []);

/*
 * Finds nearest parent with given attribute and value
 */
app.findParentByAttribute = function(el, attr, value) {
	if (el === null || attr === null || value === null) {
		return null;
	}

	var root = null;
	var current = angular.element(el);
	//find root of all matches
	while (current.parent() !== null && current.parent().length > 0) {
		current = current.parent();
		if (current.attr(attr) === value) {
			root = current;
			break;
		}
	}
	return root;
};

/**
 * Usage: <expression> | iif : trueValue : falseValue
 * Example: {{ team1.score > team2.score | iif : team1.name : team2.name }}
 */
app.filter('iif', function() {
	return function(input, trueValue, falseValue) {
		return input ? trueValue : falseValue;
	};
});

/**
 * Filter to find player by Id.
 */
app.filter('getById', function() {
	return function(input, id) {
		for (var i = 0; i < input.length; i++) {
			if (input[i].id == id) {
				return input[i];
			}
		}
		return null;
	};
});

/**
 * Conference repeater filter, returns inverted list of 2nd conference.
 */
app.filter('reverse', function() {
	return function(items, index) {
		if (index === 2) {
			return items.slice().reverse();
		} else {
			return items;
		}
	};
});

/**
 * Returns the first round number that has 'normal' matches (= not just loser bracket matches)
 */
app.findFirstRound = function(data) {
	for (var r = 0; r < data.length; r++) {
		// Normal matches are on top, so we only need to check first match
		if (data[r][0].meta.matchId.slice(-1) !== 'L') {
			return r;
		}
	}
	return null;
};

/**
 * Contains the tournament data.
 */
app.factory('data', function() {
	var tData = null;
	var firstRound = null;
	return {
		getTeams: function(conference) {
			var c = conference ? conference - 1 : null;
			return conference ? tData.teams[c] : (tData.teams.length === 1 ? tData.teams[0] : tData.teams);
		},
		getMatches: function(conference) {
			return  (conference === 'C1') ? tData.tournament.conferences[0].matches :
					(conference === 'C2') ? tData.tournament.conferences[2].matches :
					(conference === 'F') ? tData.tournament.conferences[1].matches : tData.tournament.conferences;
		},
		getTournamentType: function() {
			return tData.tournament.type;
		},
		isDoubleConference: function() {
			return tData.tournament.doubleConference;
		},
		getProperties: function() {
			return tData.tournament.properties;
		},
		getOptions: function() {
			return tData.options;
		},
		updateTournament: function(match, winnerId, loserId, oldValue, promoteLoser) {
			function promoteToMatch(nextMatch, teamId, oldValues, first) {
				if (nextMatch === null) {
					return;
				}

				if (oldValues.indexOf(nextMatch.team1.id) !== -1) {
					nextMatch.team1.id = teamId;
				} else if (oldValues.indexOf(nextMatch.team2.id) !== -1) {
					nextMatch.team2.id = teamId;
				} else {
					// normal case
					if ((first || connectingMatchIndex > matchIndex) && (!nextMatch.team1.id || 0 === nextMatch.team1.id.length)) {
						nextMatch.team1.id = teamId;
					} else {
						nextMatch.team2.id = teamId;
					}
				}
			}

			function findMatchByType(matchType, rNumber) {
				for (var x = 0; x < matches[rNumber].length; x++) {
					if (matches[rNumber][x].meta.matchType == matchType) {
						return matches[rNumber][x];
					}
				}
				return null;
			}

			function findTargetRound(parentRound) {
				for (var x = 0; x < matches.length; x++) {
					var l = matches[x].length;
					if (matches[x][l - 1].meta.team1Parent && matches[x][l - 1].meta.team1Parent.split('-')[2] == parentRound) {
						return x;
					}
					if (matches[x][l - 1].meta.team2Parent && matches[x][l - 1].meta.team2Parent.split('-')[2] == parentRound) {
						return x;
					}
				}
			}

			function clearMatch(match, teamsToClear) {
				if(teamsToClear !== undefined) {
					if(teamsToClear.indexOf(match.team1.id) > -1) {
						m.team1.id = '';
						m.team1.score = '';
					}
					if(teamsToClear.indexOf(match.team2.id) > -1) {
						m.team2.id = '';
						m.team2.score = '';						
					}
				}
				else {
					m.team1.id = '';
					m.team2.id = '';
					m.team1.score = '';
					m.team2.score = '';
				}
			}

			if (tData.tournament.properties.status === 'Not started') {
				tData.tournament.properties.status = 'In progress';
			}

			var b = match.meta.matchId.split('-');
			var matches = b[1] == 'C2' ? tData.tournament.conferences[2].matches : tData.tournament.conferences[0].matches;
			var round = parseInt(b[2]);
			var matchIndex = parseInt(b[3]);
			var isLoserMatch = b[b.length - 1] === 'L';
			var isSemiFinal = round === (matches.length - 1);
			var i, promotedLoser, rLength, finals2;
			var t = [match.team1.id, match.team2.id];

			if(b[1] === 'F') {
				return;
			}

			if (oldValue !== null && oldValue.length > 0) {
				t.push(oldValue);
			}

			// Double elimination finals: If loser bracket finalist loses, there is no need for 2nd part. Otherwise there will be rematch.
			if (tData.tournament.type === 'DE' && match.meta.matchType === 'finals') {
				var tRound = matches.length - 2;
				rLength = matches[tRound].length - 1;
				promotedLoser = matches[tRound][rLength].team1.score > matches[tRound][rLength].team2.score ? matches[tRound][rLength].team1.id : matches[tRound][rLength].team2.id;

				if(b[1] === 'C1') {
					tData.tournament.properties.finals2C1 = finals2 = loserId != promotedLoser;
				}
				else if(b[1] === 'C2'){
					tData.tournament.properties.finals2C2 = finals2 = loserId != promotedLoser;
				}

				var m = findMatchByType('finals2', matches.length - 1);

				if (loserId != promotedLoser) {
					// Should never be null or it's an error...
					if (m !== null) {
						m.team1.id = match.team1.id;
						m.team2.id = match.team2.id;
					}

					if(tData.tournament.doubleConference) {
						// Clear old values from finals and bronze match
						m = tData.tournament.conferences[1].matches[0][0];
						clearMatch(m, t);

						if(tData.tournament.conferences[1].matches[0].length > 1) {
							m = tData.tournament.conferences[1].matches[0][1];
							clearMatch(m, t);
						}
					}
				} else if (m !== null) {
					clearMatch(m);
				}

				if(finals2) {
					return;
				}
			}



			if ((tData.tournament.type === 'SE' && round === matches.length) ||
				(tData.tournament.type === 'DE' && (match.meta.matchType === 'bronze' || match.meta.matchType === 'finals2' || finals2 === false))) {

				// Promote conference finalists to finals
				if(tData.tournament.doubleConference && round === matches.length) {
					var finalRound = tData.tournament.conferences[1].matches[0];
					promoteToMatch(finalRound[0], winnerId, t, b[1] === 'C1');
					if(finalRound.length > 1){
						promoteToMatch(finalRound[1], loserId, t, b[1] === 'C1');
					}
				}

				return;
			}

			// Push losers to bronze match if there is one
			if ((tData.tournament.type === 'SE' && isSemiFinal && matches[matches.length - 1].length > 1) ||
				(tData.tournament.type === 'DE' && isLoserMatch && (isSemiFinal || round === (matches.length - 2))) ||
				(tData.tournament.doubleConference && tData.tournament.type === 'DE') ) {
				rLength = matches[matches.length - 1].length;
				var bronzeMatch = findMatchByType('bronze', matches.length - 1);
				promoteToMatch(bronzeMatch, loserId, t, matchIndex === 1);
			}

			var connectingMatchIndex = 0;
			var nextRound = matches[round];
			var loserBracketFinals = isLoserMatch && isSemiFinal;

			for (i = 0; i < nextRound.length; i++) {
				if (nextRound[i].meta.matchType != 2) {
					if (isLoserMatch && nextRound[i].meta.matchId.slice(-1) !== 'L' && !isSemiFinal) {
						continue;
					}

					connectingMatchIndex += (nextRound[i].meta.matchType == 1) ? 1 : 2;

					if (connectingMatchIndex >= matchIndex) {
						promoteToMatch(nextRound[i], winnerId, t, loserBracketFinals);
						break;
					}
				}
			}

			// Double elimination loser bracket
			if (promoteLoser) {
				var targetRoundInd = parseInt(match.meta.loserMatchId.split('-')[2]) - 1;
				var targetRound = matches[targetRoundInd];
				for (i = (targetRound.length - 1); i >= 0; i--) {
					if (targetRound[i].meta.team1Parent === match.meta.matchId) {
						targetRound[i].team1.id = loserId;
						break;
					} else if (targetRound[i].meta.team2Parent === match.meta.matchId) {
						targetRound[i].team2.id = loserId;
						break;
					}
				}
			}
		},
		loadTournament: function(tournamentData) {
			tData = tournamentData;
		}
	};
})

/**
 * Service for finding connecting matches.
 */
.factory('connectorService', ['data',
	function(data) {
		return {
			findConnectingMatchId: function(match) {
				var idParts = match.meta.matchId.split('-');
				var rNumber = parseInt(idParts[2]);
				var mNumber = parseInt(idParts[3]);
				var suffix = match.meta.matchId.slice(-1) === 'L' ? '-L' : '';
				var connectingMatchIndex = 0;
				var matches = (idParts[1] === 'F' && match.meta.matchType === 'finals') ? data.getMatches('C1') : data.getMatches(idParts[1]);
				// matches = idParts[1] == 'C2' ? matches[2].matches : matches[0].matches;
				var startInd = 0;
				var i, mId;
				var ttype = data.getTournamentType();
				// index where loser matches begin that round
				if (suffix.length > 0) {
					for (i = 0; i < matches[rNumber - 1].length; i++) {
						if (matches[rNumber - 1][i].meta.matchId.slice(-1) === 'L') {
							startInd = i;
							break;
						}
					}
				}

				if (match.meta.matchType === 'finals2') {
					mId = 'match-' + idParts[1] + '-' + rNumber + '-1';
				} else if (idParts[1] === 'F') {
					var m = matches[matches.length - 1];
					mId = ttype === 'DE' ? m[1].meta.matchId : m[0].meta.matchId;
				} else {
					for (i = 0; i < mNumber; i++) {
						if (matches[rNumber - 1][i + startInd].meta.matchType != 2) {
							connectingMatchIndex += (matches[rNumber - 1][i + startInd].meta.matchType == 1 || (i + 1 == mNumber)) ? 1 : 2;
						}
					}

					mId = "match-" + idParts[1] + '-' + (rNumber - 1) + "-" + connectingMatchIndex + suffix;
				}

				return mId;
			},
			findConnectingMatch: function(match) {
				return angular.element(document.getElementById(this.findConnectingMatchId(match)));
			},
			findChildMatch: function(element) {
				var els = angular.element(element).children();
				for (var i = 0; i < els.length; i++) {
					if (angular.element(els[i]).hasClass("match")) {
						return angular.element(els[i]);
					}
				}
			},
			findConferenceFinals: function() {
				function getFinalMatchId(conference, firstFinal){
					var conf = data.getMatches(conference);
					var round = conf.length;
					var roundLength = conf[round-1].length;
					var match = data.getTournamentType() === 'DE' && !firstFinal ? roundLength : 1;
					return 'match-' + conference + '-' + round + '-' + match;
				}

				var result = {
					C1: null,
					C2: null,
					C2_1: null
				};
				var targetId = getFinalMatchId('C1');
				result.C1 = angular.element(document.getElementById(targetId)).children()[0];

				if(data.isDoubleConference()){
					targetId = getFinalMatchId('C2');
					result.C2 = angular.element(document.getElementById(targetId)).children()[0];

					if(data.getTournamentType() === 'DE') {
						targetId = getFinalMatchId('C2', true);
						result.C2_1 = angular.element(document.getElementById(targetId)).children()[0];
					}
				}

				return result;
			}
		};
	}
])

/*
 * Service that keeps track of a team to highlight through bracket.
 */
.factory('highlight', function() {
	var highlight = {
		teamId: null
	};
	return {
		mapHighlight: function() {
			return highlight;
		},
		setHighlight: function(teamId) {
			highlight.teamId = (teamId && teamId.length > 0) ? teamId : null;
		}
	};
})

/**
 * Provides bracket size properties. It creates temporary match element to get measurements from CSS, so that we don't need hard coded values.
 * Note: This could be re-written and simplified with jQuery.
 **/
.factory('layoutService', ['data',
	function(data) {
		function normalMatches(val) {
			return val.meta.matchId.slice(-1) !== 'L';
		}

		function loserMatches(val) {
			return val.meta.matchId.slice(-1) === 'L';
		}

		function init(properties) {
			var headerEl = document.getElementsByClassName('roundHeader')[0];
			var roundRoot = document.getElementsByClassName('round')[0];
			matchEl = document.createElement('div');
			matchEl.style.visibility = 'hidden';
			matchEl.className = 'match';

			if (!headerEl || !roundRoot) {
				return;
			}

			roundRoot.appendChild(matchEl);

			if (document.all) { // IE
				properties.matchHeight = matchEl.currentStyle.height;
				properties.matchWidth = matchEl.currentStyle.width;
				properties.matchMarginH = parseInt(matchEl.currentStyle.marginRight);
				properties.matchMarginV = parseInt(matchEl.currentStyle.marginTop) + parseInt(matchEl.currentStyle.marginBottom);
				properties.borderThickness = parseInt(matchEl.currentStyle.borderWidth);
				properties.roundMarginTop = headerEl.currentStyle.height + parseInt(headerEl.currentStyle.marginTop) + parseInt(headerEl.currentStyle.marginBottom);
			} else { // Mozilla
				properties.matchHeight = parseInt(document.defaultView.getComputedStyle(matchEl, '').getPropertyValue('height').replace('px', ''));
				properties.matchWidth = parseInt(document.defaultView.getComputedStyle(matchEl, '').getPropertyValue('width').replace('px', ''));
				properties.matchMarginH = parseInt(document.defaultView.getComputedStyle(matchEl, '').getPropertyValue('margin-right').replace('px', ''));
				properties.matchMarginV = parseInt(document.defaultView.getComputedStyle(matchEl, '').getPropertyValue('margin-top')) +
					parseInt(document.defaultView.getComputedStyle(matchEl, '').getPropertyValue('margin-bottom'));
				properties.borderThickness = parseInt(document.defaultView.getComputedStyle(matchEl, '').getPropertyValue('border-right-width'));
				properties.roundMarginTop = parseInt(document.defaultView.getComputedStyle(headerEl, '').getPropertyValue('height').replace('px', '')) +
					parseInt(document.defaultView.getComputedStyle(headerEl, '').getPropertyValue('margin-top')) +
					parseInt(document.defaultView.getComputedStyle(headerEl, '').getPropertyValue('margin-bottom'));
			}

			roundRoot.removeChild(matchEl);
			initialized = true;
		}

		function calculateSize(properties) {
			var m = data.getMatches('C1');

			if (!m) {
				properties.bracket.width = '0 px';
				properties.bracket.height = '0 px';
				return;
			}

			var longestRound = 0;
			var fr;
			var isDE = data.getTournamentType() === 'DE';

			if (isDE) {
				fr = angular.module('ngBracket').findFirstRound(m);

				if (fr !== null) {
					properties.startingRound1 = fr + 1;
					longestRound = Math.max(m[fr].filter(normalMatches).length, m[fr + 1].filter(normalMatches).length);
					longestRound += Math.max(m[0].filter(loserMatches).length, m[1].filter(loserMatches).length);
				}

				properties.lbOffset1 = data.getProperties().lbOffset1 * (properties.matchHeight + properties.matchMarginV) + properties.roundMarginTop;
				longestRound += 0.5;
			}

			var totalRounds = m.length;
			longestRound = longestRound !== 0 ? longestRound : Math.max(m[0].length, m[1].length);
			
			if (data.isDoubleConference()) {
				m = data.getMatches();
				fr = angular.module('ngBracket').findFirstRound(m[2].matches);
				totalRounds = m[0].matches.length + 1 + m[2].matches.length + (isDE ? 2 : 0);
				var longestRound2 = Math.max(m[2].matches[fr].filter(normalMatches).length, m[2].matches[fr + 1].filter(normalMatches).length);
				longestRound2 += Math.max(m[2].matches[0].filter(loserMatches).length, m[2].matches[1].filter(loserMatches).length);

				if(isDE){
					properties.startingRound2 = fr + 1;
					longestRound2 += 0.5;
					properties.lbOffset2 = data.getProperties().lbOffset2 * (properties.matchHeight + properties.matchMarginV) + properties.roundMarginTop;
				}

				if(longestRound > longestRound2){
					properties.paddingTopC2 = (longestRound - longestRound2) / 2;
				}
				else{
					properties.paddingTopC1 = (longestRound2 - longestRound) / 2;
					longestRound = longestRound2;
				}

				m = m[0].matches.length > m[2].matches.length ? m[0].matches : m[2].matches;
			}
			
			properties.bracket.height = String(longestRound * (properties.matchHeight + properties.matchMarginV) + properties.roundMarginTop) + 'px';
			properties.bracket.width = String(totalRounds * (properties.matchWidth + properties.matchMarginH)) + 'px';
		}

		var bracketProperties = {
			matchHeight: null, // Match element height
			matchWidth: null, // Match element width
			matchMarginH: null, // Horizontal margin between matches
			matchMarginV: null, // Vertical margin between match elements
			borderThickness: null, // Match element's border thickness
			roundMarginTop: null, // Round top margin (= margin from round header to topmost match element)
			startingRound1: null, // Round number which contains first playable matches (only in DE, where loser bracket may be longer)
			startingRound2: null, // Same as above but for right side bracket (=C2)
			lbOffset1: null, // Vertical offset where loser bracket begins
			lbOffset2: null, // Same as above but for right side bracket
			paddingTopC1: null, // Vertical padding for left side bracket (doubleConference) if brackets are not same size
			paddingTopC2: null, // Vertical padding for right side bracket (doubleConference) if brackets are not same size
			bracket: {
				"width": null, // Total width of the bracket
				"height": null // Total height of the bracket
			}
		};
		var initialized = false;

		return {
			getProperties: function() {
				if (!initialized) {
					init(bracketProperties);
					calculateSize(bracketProperties);
				}
				return bracketProperties;
			},
			refresh: function() {
				calculateSize(bracketProperties);
			}
		};
	}
]);