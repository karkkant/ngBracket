var myApp = angular.module('ngBracket', []);

function findParentByAttribute(el, attr, value){
	if(el === null || attr === null || value === null){
		return null;
	}

	var root = null;
	var current = angular.element(el);
	//find root of all matches
	while(current.parent() !== null && current.parent().length > 0){
		current = current.parent();
		if(current.attr(attr) === value){
			root = current;
			break;
		}
	}
	return root;
}

/**
* Usage: <expression> | iif : trueValue : falseValue
* Example: {{ team1.score > team2.score | iif : team1.name : team2.name }}
*/
myApp.filter('iif', function () {
	return function(input, trueValue, falseValue) {
		return input ? trueValue : falseValue;
	};
});

/**
* Filter to find player by Id.
*/
myApp.filter('getById', function() {
	return function(input, id) {
		for (var i=0; i<input.length;i++) {
			if (input[i].id == id) {
				return input[i];
			}
		}
		return null;
	};
});

myApp.factory('highlight', function(){
	var highlight = { teamId:null };
	return {
		mapHighlight: function(){
			return highlight;
		},
		setHighlight: function(teamId){
			highlight.teamId = (teamId && teamId.length > 0) ? teamId : null;
		}
	};
});

/**
* Contains all the necessary data that controllers need.
* Returns copy of data when requested.
*/
myApp.factory('data', ['$rootScope', function($rootScope){
	var participantData = {};
	var tournamentData = {};
	return{
		getParticipants: function(){
			return participantData;
		},
		getMatches: function(){
			return tournamentData.matches;
		},
		setParticipants: function(participants){
			participantData = participants;
		},
		setTournament: function(tData){
			tournamentData = tData;
		},
		updateTournament: function(match, winnerId, oldValue){
			var b = match.meta.matchId.split('-');
			var round = parseInt(b[1]);
			var matchIndex = parseInt(b[2]);

			if(round === tournamentData.matches.length){
				return;
			}

			var connectingMatchIndex = 0;
			var nextRound = tournamentData.matches[round];

			for(var i=0; i<nextRound.length;i++){
				if(nextRound[i].meta.matchType != 2){
					connectingMatchIndex += (nextRound[i].meta.matchType == 1) ? 1 : 2;
					if(connectingMatchIndex >= matchIndex){
						// Check if winner has already been set from this match.
						var t = [match.team1.id, match.team2.id];
						if(oldValue !== null && oldValue.length > 0){
							t.push(oldValue);
						}

						if(t.indexOf(nextRound[i].team1.id) !== -1){
							nextRound[i].team1.id = winnerId;
						}
						else if(t.indexOf(nextRound[i].team2.id) !== -1){
							nextRound[i].team2.id = winnerId;
						}
						else{
							// normal case
							if(connectingMatchIndex > matchIndex && (!nextRound[i].team1.id || 0 === nextRound[i].team1.id.length)){
								nextRound[i].team1.id = winnerId;
							}
							else{
								nextRound[i].team2.id = winnerId;
							}							
						}
						break;
					}
				}
			}
		},
		loadTournament: function(){
			// Dummy data untill there's a service to fetch data from db.
			var teamsData = JSON.parse('[{"name":"Austria","id":"1","flag":"countries/aut","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"Czech","id":"2","flag":"countries/cze","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"France","id":"3","flag":"countries/fra","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"Switzerland","id":"4","flag":"countries/sui","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"United States","id":"5","flag":"countries/usa","members":["Player1", "Player21", "Player3", "Player4", "Player5"]},{"name":"Sweden","id":"6","flag":"countries/swe","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"Finland","id":"7","flag":"countries/fin","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"Germany","id":"8","flag":"countries/ger","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"Russia","id":"9","flag":"countries/rus","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"Canada","id":"10","flag":"countries/can","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"United Kingdom","id":"11","flag":"countries/uk","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"China","id":"12","flag":"countries/chi","members":["Player1", "Player2", "Player3", "Player4", "Player5"]},{"name":"Denmark","id":"13","flag":"countries/den","members":["Player1", "Player2", "Player3", "Player4", "Player5"]}]');
			var tData = JSON.parse('{"type":"SE","matches":[[{"team1":{"id":"1","score":""},"team2":{"id":"2","score":""},"meta":{"matchId":"match-1-1"},"details":{}},{"team1":{"id":"3","score":4},"team2":{"id":"4","score":2},"meta":{"matchId":"match-1-2"},"details":{}},{"team1":{"id":"5","score":""},"team2":{"id":"6","score":""},"meta":{"matchId":"match-1-3"},"details":{}},{"team1":{"id":"7","score":""},"team2":{"id":"8","score":""},"meta":{"matchId":"match-1-4"},"details":{}},{"team1":{"id":"9","score":3},"team2":{"id":"10","score":4},"meta":{"matchId":"match-1-5"},"details":{}}],[{"team1":{"id":"11","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-1","matchType":1},"details":{}},{"team1":{"id":"12","score":""},"team2":{"id":"3","score":""},"meta":{"matchId":"match-2-2","matchType":1},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-3"},"details":{}},{"team1":{"id":"13","score":0},"team2":{"id":"10","score":2},"meta":{"matchId":"match-2-4","matchType":1},"details":{}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-1"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"10","score":""},"meta":{"matchId":"match-3-2"},"details":{}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-1"},"details":{}}]]}');
			
			this.setParticipants(teamsData);
			this.setTournament(tData);
			return tData;
		}
	};
}]);

/**
* Service for finding connecting matches.
*/
myApp.factory('connectorService', ['data', function(data){
	return {
		findConnectingMatch: function(scope, element){
			var rNumber = parseInt(scope.match.meta.matchId.split('-')[1]);
			var mNumber = parseInt(scope.match.meta.matchId.split('-')[2]);

			var connectingMatchIndex = 0;
			for(var i=0; i<mNumber;i++){
				if(data.getMatches()[rNumber-1][i].meta.matchType != 2){
					connectingMatchIndex += (data.getMatches()[rNumber-1][i].meta.matchType == 1 || (i+1 == mNumber)) ? 1 : 2;
				}
			}

			var mId = "match-" + (rNumber-1) + "-" + connectingMatchIndex;
			return angular.element(document.getElementById(mId));	
		},
		findChildMatch: function(element){
			var els = angular.element(element).children();
			for(var i=0;i<els.length;i++){
				if(angular.element(els[i]).hasClass("match")){
					return angular.element(els[i]);
				}
			}
		}
	};
}]);

/**
* Provides bracket size properties. It creates temporary match element to get measurements from CSS, so that we don't need hard coded values.
* Note: This could be re-written and simplified with jQuery.
**/
myApp.factory('positioningService', function(){
	var init = function(properties){
		// var matchEl = document.getElementsByClassName('match')[0];
		var headerEl = document.getElementsByClassName('roundHeader')[0];
		var roundRoot = document.getElementsByClassName('round')[0];
		matchEl = document.createElement('div');
		matchEl.style.visibility = 'hidden';
		matchEl.className = 'match';

		roundRoot.appendChild(matchEl);

		if(document.all) { // IE
			properties.matchHeight = matchEl.currentStyle.height;
			properties.matchWidth = matchEl.currentStyle.width;
			properties.matchMarginH = parseInt(matchEl.currentStyle.marginRight);
			properties.matchMarginV = parseInt(matchEl.currentStyle.marginTop) + parseInt(matchEl.currentStyle.marginBottom);
			properties.borderThickness = parseInt(matchEl.currentStyle.borderWidth);
			properties.roundMarginTop = headerEl.currentStyle.height + parseInt(headerEl.currentStyle.marginTop) + parseInt(headerEl.currentStyle.marginBottom);
		}
		else { // Mozilla
			properties.matchHeight = parseInt(document.defaultView.getComputedStyle(matchEl, '').getPropertyValue('height').replace('px',''));
			properties.matchWidth = parseInt(document.defaultView.getComputedStyle(matchEl, '').getPropertyValue('width').replace('px',''));
			properties.matchMarginH = parseInt(document.defaultView.getComputedStyle(matchEl, '').getPropertyValue('margin-right').replace('px',''));
			properties.matchMarginV = parseInt(document.defaultView.getComputedStyle(matchEl, '').getPropertyValue('margin-top')) +
											parseInt(document.defaultView.getComputedStyle(matchEl, '').getPropertyValue('margin-bottom'));
			properties.borderThickness = parseInt(document.defaultView.getComputedStyle(matchEl, '').getPropertyValue('border-right-width'));
			properties.roundMarginTop = parseInt(document.defaultView.getComputedStyle(headerEl, '').getPropertyValue('height').replace('px','')) +
									parseInt(document.defaultView.getComputedStyle(headerEl, '').getPropertyValue('margin-top')) +
									parseInt(document.defaultView.getComputedStyle(headerEl, '').getPropertyValue('margin-bottom'));
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
		roundMarginTop: null // Round top margin (= margin from round header to topmost match element)
	};
	var initialized = false;

	return {
		getBracketProperties: function(){
			if(!initialized){
				init(matchProperties);
			}
			return JSON.parse(JSON.stringify(matchProperties));
		}
	};
});

/**
* Provides details view into selected match. 
* Can be disabled with 'setEnabled' function, or by not having detail element with 'detailOverlay' Id at all.
**/
myApp.factory('matchDetailService', function(){
	var detailContainer = null;
	var matchDetails = {};
	var prevShowedMatchId = '';
	var init = false;
	var isEnabled = true;
	return {
		setEnabled: function(enabled){
			isEnabled = enabled;
		},
		mapMatchDetails: function(){
			return matchDetails;
		},
		showDetails: function(matchElement, details){
			if(!isEnabled){
				return;
			}
			// Toggle closed
			if(detailContainer !== null && detailContainer.css('visibility') == 'visible' && details.matchId == prevShowedMatchId){
				this.hideDetails();
				return;
			}
			prevShowedMatchId = details.matchId;
			matchDetails.team1Details = details.team1Details;
			matchDetails.team2Details = details.team2Details;
			matchDetails.results = details.results;

			if(!init){
				detailContainer = angular.element(document.getElementById('detailOverlay'));
				init = true;
			}
			if(detailContainer !== null && matchElement !== null){
				var targetEl = findParentByAttribute(matchElement, 'class', 'match')[0];

				if(targetEl !== null && targetEl.getBoundingClientRect()){
					var div = targetEl.getBoundingClientRect();
					var offsetLeft = div.right + ((window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft);
					var offsetTop = div.top + ((window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop);

					detailContainer.css('left', offsetLeft + 'px');
					detailContainer.css('top', (offsetTop - 20) + 'px');
					detailContainer.css('visibility', 'visible');
				}
			}
		},
		hideDetails: function(){
			if(detailContainer !== null){
				detailContainer.css('visibility', 'hidden');
			}
		}
	};
});