var myApp = angular.module('ngBracket', []);

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
	}
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
		updateTournament: function(matchId, winnerId, scopeToUpdate){
			var b = matchId.split('-');
			var round = parseInt(b[1]);
			var match = parseInt(b[2]);

			if(round === tournamentData.matches.length){
				return;
			}

			var connectingMatchIndex = 0;
			var nextRound = tournamentData.matches[round];

			for(var i=0; i<nextRound.length;i++){
				if(nextRound[i].meta.matchType != 2){
					connectingMatchIndex += (nextRound[i].meta.matchType == 1) ? 1 : 2;
					if(connectingMatchIndex >= match){
						if(connectingMatchIndex > match && (!nextRound[i].team1.id || 0 === nextRound[i].id.length)){
							nextRound[i].team1.id = winnerId;
						}
						else{
							nextRound[i].team2.id = winnerId;
						}
						break;
					}
				}
			}
			
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
			var root = null;
			var current = element;
			//find root of all matches
			while(current.parent() != null && current.parent().length > 0){
				current = current.parent();
				if(current.attr('id') === "bracketRoot"){
					root = current;
					break;
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