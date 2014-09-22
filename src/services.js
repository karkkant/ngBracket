var myApp = angular.module('ngBracket', []);

myApp.findParentByAttribute = function(el, attr, value) {
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
myApp.filter('iif', function() {
	return function(input, trueValue, falseValue) {
		return input ? trueValue : falseValue;
	};
});

/**
 * Filter to find player by Id.
 */
myApp.filter('getById', function() {
	return function(input, id) {
		for (var i = 0; i < input.length; i++) {
			if (input[i].id == id) {
				return input[i];
			}
		}
		return null;
	};
});

/*
 * Service that keeps track of a team to highlight through bracket.
 */
myApp.factory('highlight', function() {
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
});

/**
 * Returns the first round number that has 'normal' matches (= not just loser bracket matches)
 */
myApp.findFirstRound = function(data) {
	for (var r = 0; r < data.length; r++) {
		// Normal matches are on top, so we only need to check first match
		if (data[r][0].meta.matchId.slice(-1) !== 'L') {
			return r;
		}
	}
	return null;
};

/**
 * Contains all the necessary data that controllers need.
 * Returns copy of data when requested.
 *
 * NOTE: Remember to call PositioningService.resetProperties when loading new tournament.
 *		 (See the demoApp controller for a sample)
 */
myApp.factory('data', function() {
	var teamsData = {};
	var tournamentData = {};
	var firstRound = null;
	return {
		getTeams: function() {
			return teamsData;
		},
		getMatches: function() {
			return tournamentData.matches;
		},
		getTournamentType: function() {
			return tournamentData.type;
		},
		getProperties: function() {
			return tournamentData.properties;
		},
		shuffleTeams: function() {
			if (!teamsData || !tournamentData || tournamentData.properties.status != 'Not started') {
				return;
			}

			var currentIndex = teamsData.length,
				temporaryValue, randomIndex;
			var shuffled = teamsData.slice();

			// While there remain elements to shuffle...
			while (0 !== currentIndex) {
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;
				temporaryValue = shuffled[currentIndex];
				shuffled[currentIndex] = shuffled[randomIndex];
				shuffled[randomIndex] = temporaryValue;
			}

			var i, j = 0;
			if (this.getTournamentType() === 'DE' && firstRound === null) {
				firstRound = angular.module('ngBracket').findFirstRound(tournamentData.matches);
			}

			var round = this.getTournamentType() === 'DE' ? firstRound : 0;
			// Apply shuffled order to matches
			for (i = 0; i < tournamentData.matches[round].length; i++) {
				if (tournamentData.matches[round][i].meta.matchId.slice(-1) === 'L') {
					break;
				}

				tournamentData.matches[round][i].team1.id = shuffled[j].id;
				tournamentData.matches[round][i].team2.id = shuffled[j + 1].id;
				j += 2;
			}

			if (tournamentData.properties.unbalanced) {
				round += 1;
				for (i = 0; i < tournamentData.matches[round].length; i++) {
					if (j >= shuffled.length || tournamentData.matches[round][i].meta.matchId.slice(-1) === 'L') {
						break;
					}

					if (tournamentData.matches[round][i].meta.matchType === 1) {
						tournamentData.matches[round][i].team1.id = shuffled[j].id;
						j += 1;
					} else if (tournamentData.matches[round][i].meta.matchType === 2) {
						tournamentData.matches[round][i].team1.id = shuffled[j].id;
						tournamentData.matches[round][i].team2.id = shuffled[j + 1].id;
						j += 2;
					}
				}
			}
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

			function findMatchByType(roundType, rNumber) {
				for (var x = 0; x < tournamentData.matches[rNumber].length; x++) {
					if (tournamentData.matches[rNumber][x].meta.matchType == roundType) {
						return tournamentData.matches[rNumber][x];
					}
				}
				return null;
			}

			function findTargetRound(parentRound) {
				for (var x = 0; x < tournamentData.matches.length; x++) {
					var l = tournamentData.matches[x].length;
					if (tournamentData.matches[x][l - 1].meta.team1Parent && tournamentData.matches[x][l - 1].meta.team1Parent.split('-')[1] == parentRound) {
						return x;
					}
					if (tournamentData.matches[x][l - 1].meta.team2Parent && tournamentData.matches[x][l - 1].meta.team2Parent.split('-')[1] == parentRound) {
						return x;
					}
				}
			}

			if (tournamentData.properties.status === 'Not started') {
				tournamentData.properties.status = 'In progress';
			}

			var b = match.meta.matchId.split('-');
			var round = parseInt(b[1]);
			var matchIndex = parseInt(b[2]);
			var isLoserMatch = b.length > 3 && b[3] === 'L';
			var isSemiFinal = round === (tournamentData.matches.length - 1);
			var i, promotedLoser, rLength;

			// Double elimination finals: If loser bracket finalist loses, there is no need for 2nd part. Otherwise there will be rematch.
			if (tournamentData.type === 'DE' && match.meta.matchType === 'finals') {
				var tRound = tournamentData.matches.length - 2;
				rLength = tournamentData.matches[tRound].length - 1;
				promotedLoser = tournamentData.matches[tRound][rLength].team1.score > tournamentData.matches[tRound][rLength].team2.score ? tournamentData.matches[tRound][rLength].team1.id : tournamentData.matches[tRound][rLength].team2.id;
				tournamentData.properties.finals2 = loserId != promotedLoser;
				var m = findMatchByType('finals2', tournamentData.matches.length - 1);

				if (loserId != promotedLoser) {
					// Should never be null or it's an error...
					if (m !== null) {
						m.team1.id = match.team1.id;
						m.team2.id = match.team2.id;
					}
				} else if (m !== null) {
					m.team1.id = '';
					m.team2.id = '';
					m.team1.score = '';
					m.team2.score = '';
				}

				return;
			}

			if ((tournamentData.type === 'SE' && round === tournamentData.matches.length) ||
				(tournamentData.type === 'DE' && (match.meta.matchType === 'bronze' || match.meta.matchType === 'finals2'))) {
				return;
			}

			var t = [match.team1.id, match.team2.id];
			if (oldValue !== null && oldValue.length > 0) {
				t.push(oldValue);
			}

			// Push losers to bronze match if there is one
			if ((tournamentData.type === 'SE' && isSemiFinal && tournamentData.matches[tournamentData.matches.length - 1].length > 1) ||
				(tournamentData.type === 'DE' && isLoserMatch && (isSemiFinal || round === (tournamentData.matches.length - 2)))) {
				rLength = tournamentData.matches[tournamentData.matches.length - 1].length;
				var bronzeMatch = findMatchByType('bronze', tournamentData.matches.length - 1);
				promoteToMatch(bronzeMatch, loserId, t, matchIndex === 1);
			}

			var connectingMatchIndex = 0;
			var nextRound = tournamentData.matches[round];
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
				var targetRoundInd = parseInt(match.meta.loserMatchId.split('-')[1]) - 1;
				var targetRound = tournamentData.matches[targetRoundInd];
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
		loadTournament: function(tData, teams) {
			teamsData = teams;
			tournamentData = tData;
			firstRound = tData.type === 'DE' ? angular.module('ngBracket').findFirstRound(tData.matches) : null;
		}
	};
});

/**
 * Service for finding connecting matches.
 */
myApp.factory('connectorService', ['data',
	function(data) {
		return {
			findConnectingMatchId: function(match) {
				var idParts = match.meta.matchId.split('-');
				var rNumber = parseInt(idParts[1]);
				var mNumber = parseInt(idParts[2]);
				var suffix = match.meta.matchId.slice(-1) === 'L' ? '-L' : '';
				var connectingMatchIndex = 0;
				var matches = data.getMatches();
				var startInd = 0;
				var i, mId;

				if (match.meta.matchType === 'finals2') {
					mId = 'match-' + rNumber + '-1';
				} else {
					if (suffix.length > 0) {
						for (i = 0; i < matches[rNumber - 1].length; i++) {
							if (matches[rNumber - 1][i].meta.matchId.slice(-1) === 'L') {
								startInd = i;
								break;
							}
						}
					}

					for (i = 0; i < mNumber; i++) {
						if (matches[rNumber - 1][i + startInd].meta.matchType != 2) {
							connectingMatchIndex += (matches[rNumber - 1][i + startInd].meta.matchType == 1 || (i + 1 == mNumber)) ? 1 : 2;
						}
					}

					mId = "match-" + (rNumber - 1) + "-" + connectingMatchIndex + suffix;
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
			}
		};
	}
]);

/**
 * Provides bracket size properties. It creates temporary match element to get measurements from CSS, so that we don't need hard coded values.
 * Note: This could be re-written and simplified with jQuery.
 **/
myApp.factory('positioningService', ['data',
	function(data) {
		var init = function(properties) {
			function normalMatches(val) {
				return val.meta.matchId.slice(-1) !== 'L';
			}

			function loserMatches(val) {
				return val.meta.matchId.slice(-1) === 'L';
			}

			var headerEl = document.getElementsByClassName('roundHeader')[0];
			var roundRoot = document.getElementsByClassName('round')[0];
			matchEl = document.createElement('div');
			matchEl.style.visibility = 'hidden';
			matchEl.className = 'match';

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

			if (data.getTournamentType() === 'DE') {
				var m = data.getMatches();
				var fr = angular.module('ngBracket').findFirstRound(m);

				if (fr) {
					properties.startingRound = fr + 1;
					properties.roundHeight = Math.max(m[fr].filter(normalMatches).length, m[fr + 1].filter(normalMatches).length);
					properties.roundHeight += Math.max(m[0].filter(loserMatches).length, m[1].filter(loserMatches).length);
				}

				properties.lbOffset = data.getProperties().lbOffset * (properties.matchHeight + properties.matchMarginV) + properties.roundMarginTop;
			}

			roundRoot.removeChild(matchEl);
			initialized = true;
		};

		var matchProperties = {
			matchHeight: null, // Match element height
			matchWidth: null, // Match element width
			matchMarginH: null, // Horizontal margin between rounds
			matchMarginV: null, // Vertical margin between match elements
			borderThickness: null, // Match element's border thickness
			roundMarginTop: null, // Round top margin (= margin from round header to topmost match element)
			startingRound: null, // Round number which contains first playable matches (only in DE, where loser bracket may be longer)
			roundHeight: null,
			lbOffset: null // Vertical offset where loser bracket begins
		};
		var initialized = false;

		return {
			getBracketProperties: function() {
				if (!initialized) {
					init(matchProperties);
				}
				return JSON.parse(JSON.stringify(matchProperties)); // return a copy of properties, just in case
			},
			resetProperties: function() {
				initialized = false;
				matchProperties.startingRound = null;
				matchProperties.roundHeight = null;
			}
		};
	}
]);

/**
 * Common functions for dialog windows.
 *
 * show: Toggles given dialog element visible and positions it next to given target element.
 *	params: dialog 	 - the dialog element to show
 *			targetEl - element to align dialog with
 *			offsetX	 - additional horizontal offset (optional)
 *			offsetY  - additional vertical offset (optional)
 *			align	 - true/false flag to disable default positioning next to target element
 */
myApp.factory('dialogServiceBase', function() {
	return {
		show: function(dialog, targetEl, offsetX, offsetY, align) {
			if (dialog !== null) {
				if (align && targetEl !== null && targetEl.getBoundingClientRect()) {
					var div = targetEl.getBoundingClientRect();
					var offsetLeft = div.right + ((window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft);
					var offsetTop = div.top + ((window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop);
					var targetHeight = div.height;
					var dialogHeight = dialog[0].getBoundingClientRect().height;

					offsetTop += (dialogHeight > targetHeight) ? (dialogHeight / -2) + (targetHeight / 2) : (targetHeight / 2) - (dialogHeight / 2);

					dialog.css('left', (offsetLeft + offsetX) + 'px');
					dialog.css('top', (offsetTop + offsetY) + 'px');
				}

				dialog.css('visibility', 'visible');
			}
		},
		hide: function(dialog) {
			if (dialog !== null) {
				dialog.css('visibility', 'hidden');
			}
		}
	};
});

myApp.createCloseOnEscEventHandler = function(callbackObj, callback) {
	return function(event) {
		if (event.keyCode === 27) {
			callback.call(callbackObj);
		}
	};
};

/**
 * Provides details view into selected match.
 * Can be disabled with 'setEnabled' function, or by not having detail element with 'detailOverlay' Id at all.
 **/
myApp.factory('matchDetailService', ['dialogServiceBase', '$document',
	function(dialogService, $document) {
		var detailContainer = null;
		var matchDetails = {};
		var prevShowedMatchId = '';
		var init = false;
		var isEnabled = false;
		var handleKeyUpEvent = null;
		return {
			setEnabled: function(enabled) {
				isEnabled = enabled;
			},
			mapMatchDetails: function() {
				return matchDetails;
			},
			show: function(matchElement, details, align) {
				handleKeyUpEvent = angular.module('ngBracket').createCloseOnEscEventHandler(this, this.hide);

				if (!isEnabled) {
					return;
				}
				// Toggle closed
				if (detailContainer !== null && detailContainer.css('visibility') == 'visible' && details.matchId == prevShowedMatchId) {
					this.hide();
					return;
				}
				prevShowedMatchId = details.matchId;
				matchDetails.team1Details = details.team1Details;
				matchDetails.team2Details = details.team2Details;
				matchDetails.results = details.results;

				if (!init) {
					detailContainer = angular.element(document.getElementById('detailOverlay'));
					init = true;
				}
				if (detailContainer !== null && matchElement !== null) {
					var targetEl = angular.module('ngBracket').findParentByAttribute(matchElement, 'class', 'match')[0];
					$document.unbind('keyup', handleKeyUpEvent).bind('keyup', handleKeyUpEvent);
					dialogService.show(detailContainer, targetEl, 0, 0, align);
				}
			},
			hide: function() {
				$document.unbind('keyup', handleKeyUpEvent);
				handleKeyUpEvent = null;
				dialogService.hide(detailContainer);
			}
		};
	}
]);

/*
 * Service to show/hide team selection menu
 */
myApp.factory('teamSelectService', ['dialogServiceBase', 'data', '$document',
	function(dialogService, data, $document) {
		var teamSelectDialog = null;
		var targetTeamslot = null;
		var handleKeyUpEvent = null;
		var handleClickEvent = null;
		return {
			show: function(matchElement, teamslot, align) {
				handleKeyUpEvent = angular.module('ngBracket').createCloseOnEscEventHandler(this, this.hide);

				handleClickEvent = function(callbackObj, hide) {
					return function(event) {
						if (event.button !== 2 && angular.module('ngBracket').findParentByAttribute(event.target, 'id', 'selectTeamOverlay') === null) {
							hide.call(callbackObj);
						}
					};
				}(this, this.hide);

				if (data.getProperties().status !== 'Not started') {
					return;
				}
				if (teamSelectDialog === null) {
					teamSelectDialog = angular.element(document.getElementById('selectTeamOverlay'));
				}
				if (teamSelectDialog !== null) {
					$document.unbind('keyup', handleKeyUpEvent).bind('keyup', handleKeyUpEvent);
					$document.unbind('click', handleClickEvent).bind('click', handleClickEvent);

					targetTeamslot = teamslot;
					dialogService.show(teamSelectDialog, matchElement, 0, 0, align);
				}
			},
			hide: function() {
				targetTeamslot = null;
				if (teamSelectDialog !== null) {
					$document.unbind('keyup', handleKeyUpEvent);
					$document.unbind('click', handleClickEvent);
					handleKeyUpEvent = null;
					handleClickEvent = null;
					dialogService.hide(teamSelectDialog);
				}
			},
			select: function(team) {
				if (targetTeamslot !== null) {
					targetTeamslot.id = team.id;
				}
			}
		};
	}
]);
