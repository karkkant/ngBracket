/*
 * The bracket is drawn inside this template.
 */
app.directive('ngbracket', ['data', 'layoutService',
    function(data, layoutService) {
        return {
            restrict: 'E',
            templateUrl: 'partials/bracket.html',
            replace: false,
            scope: {
                bracketData: '=',
            },
            controller: ['$scope',
                function($scope) {

                    if ($scope.bracketData) {
                        $scope.bracketData.reload = function() {
                            data.loadTournament($scope.bracketData);

                            if (!$scope.layoutProperties) {
                                $scope.layoutProperties = layoutService.getProperties();
                            }

                            layoutService.refresh();
                        };

                    }
                }
            ]
        };
    }
])

/**
 * Sets focus on element.
 */
.directive('doFocus', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            if (element) {
                scope.$parent.tmpOldScoreValue = scope.$eval(attr.ngModel);
                element[0].focus();
                element[0].select();
            }
        }
    };
})

/**
 * Provides team selection menu on right-click on team name.
 */
.directive('teamContextMenu', ['data',
    function(data) {
        return {
            restrict: "A",
            scope: false,
            link: function(scope, element, attrs) {
                function rightClickCallback(event) {
                    options.onTeamRightClick(event, scope.team);
                }

                var options = data.getOptions();

                if (options.onTeamRightClick) {
                    element.bind('contextmenu', rightClickCallback);
                }

                scope.$on('$destroy', function() {
                    element.unbind('contextmenu', rightClickCallback);
                });
            }
        };
    }
])


.directive("onBeginRender", ['data', 'connectorService', 'layoutService', function(data, connectorService, layoutService) {
    return function(scope, element, attrs) {
    	if(data.isDoubleConference()){
    		var properties = layoutService.getProperties();
    		var shift = properties.matchWidth + properties.matchMarginH;
    		var i;

	        // Reverse right side bracket
	        if (scope.$parent.$last && scope.$last) {
	            var target = element.parent()[0];
	            i = target.childNodes.length;
	            while (i--) {
	                target.appendChild(target.childNodes[i]);
	            }
	        }

	        if(data.getTournamentType() === 'DE') {
		        // Handle finals part 2 on/off toggles
		        if(scope.$last && scope.$parent.$first){
		         	scope.prop = data.getProperties();
		        }
		        else if(scope.$last && scope.$parent.$last) {
		        	// Right side bracket needs to shift final match along when shrinked/expanded
		        	scope.prop = data.getProperties();
		        	var c2finalEl = null;
		        	var c2finalElConnectors = null;

		        	var w2 = scope.$watch('prop.finals2C2', function(newValue, oldValue) {
	                	if (c2finalEl === null){
	                		c2finalEl = angular.element(connectorService.findConferenceFinals().C2_1.parentElement);
	                	}
	                	if (c2finalElConnectors === null) {
	                		for(i=0; i<c2finalEl[0].parentElement.children.length; i++) {
	                			if (c2finalEl[0].parentElement.children[i].classList.contains('connectors')) {
	                				c2finalElConnectors = c2finalEl[0].parentElement.children[i];
	                				break;
	                			}
	                		}
	                	}

	                    if (newValue && oldValue === false) {
	                    	c2finalEl.css('left', (c2finalEl.prop('offsetLeft') + shift) + 'px');
	                    	for(i=0; i<c2finalElConnectors.children.length; i++) {
	                    		angular.element(c2finalElConnectors.children[i]).css('left', (c2finalElConnectors.children[i].offsetLeft + shift) + 'px');
	                    	}
	                    }
	                    else if(newValue === false) {
	                    	c2finalEl.css('left', (c2finalEl.prop('offsetLeft') - shift) + 'px');
	                    	for(i=0; i<c2finalElConnectors.children.length; i++) {
	                    		angular.element(c2finalElConnectors.children[i]).css('left', (c2finalElConnectors.children[i].offsetLeft - shift) + 'px');
	                    	}
	                    }
	                }, true);

					scope.$on('$destroy', function() {
	                    w2();
	                });
		        }
	        }
    	}
    };
}])

/**
 * Creates match element and calculates it's position dynamically, based on the parent matches.
 */
.directive('match', ['connectorService', 'layoutService', 'data', '$filter', 'highlight',
    function(connectorService, layoutService, data, $filter, highlight) {
        return {
            restrict: "E",
            scope: false,
            templateUrl: 'partials/match.html',
            replace: true,
            link: {
                pre: function(scope, el, attrs) {
                    scope.getTeamDetails = function(teamId, conference) {
                        function findTeam(t, id) {
                            return $filter('getById')(t, id);
                        }
                        var t = findTeam(data.getTeams(conference ? conference : 1), teamId);
                        if (!conference && t === null && data.isDoubleConference()) {
                            t = findTeam(data.getTeams(2), teamId);
                        }
                        return t;
                    };

                    var parts = scope.match.meta.matchId.split('-');
                    var conf;
                    if (parts[1] === 'C1') {
                        conf = 1;
                    }
                    if (parts[1] === 'C2') {
                        conf = 2;
                    }

                    scope.highlight = highlight.mapHighlight();
                    scope.team1Details = scope.getTeamDetails(scope.match.team1.id, conf);
                    scope.team2Details = scope.getTeamDetails(scope.match.team2.id, conf);

                    var w1 = scope.$watch('match.team1', function(newValue, oldValue) {
                        if (newValue) {
                            scope.team1Details = scope.getTeamDetails(scope.match.team1.id, conf);
                        }
                    }, true);
                    var w2 = scope.$watch('match.team2', function(newValue, oldValue) {
                        if (newValue) {
                            scope.team2Details = scope.getTeamDetails(scope.match.team2.id, conf);
                        }
                    }, true);

                    var rNumber = parseInt(parts[2]);
                    var mNumber = parseInt(parts[3]);
                    var properties = layoutService.getProperties();
                    var startingRound = parts[1] === 'C1' ? properties.startingRound1 : (parts[1] === 'C2' ? properties.startingRound2 : null);

                    if (scope.match.meta.team1Parent) {
                        scope.team1Description = 'Loser of Round ' + (parseInt(scope.match.meta.team1Parent.split('-')[2]) - startingRound + 1) + ' match ' + scope.match.meta.team1Parent.split('-')[3];
                    }
                    if (scope.match.meta.team2Parent) {
                        scope.team2Description = 'Loser of Round ' + (parseInt(scope.match.meta.team2Parent.split('-')[2]) - startingRound + 1) + ' match ' + scope.match.meta.team2Parent.split('-')[3];
                    }
                    if (scope.match.meta.matchType === 'finals2' && scope.match.team1.id.length === 0 && scope.match.team2.id.length === 0) {
                        scope.team1Description = 'Finals round 2 if necessary';
                        scope.prop = data.getProperties();

                        if(parts[1] === 'C1'){
                        	scope.conference = 1;
                        }
                        else if(parts[1] === 'C2') {
                        	scope.conference = 2;
                        }
                    }

                    el.prop('id', scope.match.meta.matchId);

                    // center horizontally
                    el.css('left', properties.matchMarginH / 2 + 'px');

                    if (scope.match.meta.matchType == 'finals') {
                        scope.finals = true;

                        if(data.isDoubleConference() && conf === 2 && data.getTournamentType() == 'DE') {
                        	el.css('left', ((properties.matchMarginH * 1.5) + properties.matchWidth) + 'px');
                        }
                    }

                    var finals2 = scope.match.meta.matchType === 'finals2' && data.getTournamentType() === 'DE';

                    if (finals2 && conf === 1) {
                    	el.css('left', ((properties.matchMarginH * 1.5) + properties.matchWidth) + 'px');                       
                    }

                    var top = 0;
                    var deFinals = (scope.match.meta.matchType === 'finals' && data.getTournamentType() === 'DE');
                    var suffix = (scope.match.meta.matchId.slice(-1) === 'L' || deFinals) ? '-L' : '';

                    // Calculate vertical position for the match element
                    if (rNumber === 1 || (suffix.length === 0 && rNumber === startingRound)) {
                        var x = (scope.match.meta.UIShiftDown) ? scope.match.meta.UIShiftDown : 0;
                        // padding property is used to align left and right side brackets in double conference tournaments.
                        x += (parts[1] === 'C1' && properties.paddingTopC1) ? properties.paddingTopC1 : (parts[1] === 'C2' && properties.paddingTopC2 ? properties.paddingTopC2 : 0);
                        top = (properties.matchHeight + properties.matchMarginV) * (mNumber - 1 + x) + properties.roundMarginTop;
                    } else if (scope.match.meta.matchType === 2) {
                        var padding = parts[1] === 'C1' ? properties.paddingTopC1 : (parts[1] === 'C2' ? properties.paddingTopC2 : 0);
                        top = (properties.matchHeight + properties.matchMarginV) * (mNumber - 1 + padding) + properties.roundMarginTop;
                        var offset = parts[1] === 'C1' ? properties.lbOffset1 : (parts[1] === 'C2' ? properties.lbOffset2 : 0);

                        if (suffix.length > 0 && offset > 0 && top < offset) {
                            top += offset - properties.roundMarginTop;
                        }
                    } else if (scope.match.meta.matchType === 'bronze' || finals2) {
                        var goldMatch = angular.element(document.getElementById('match-' + parts[1] + '-' + parts[2] + '-1'));
                        top = goldMatch.prop('offsetTop');

                        if (scope.match.meta.matchType === 'bronze') {
                            top += properties.matchHeight + 40;
                            scope.bronzeMatch = true;
                        }
                    } else {
                        var cEl1 = connectorService.findConnectingMatch(scope.match);
                        top = angular.element(cEl1[0].firstElementChild).prop('offsetTop');
                        // Left side bracket
                        if (parts[1] !== 'F' && scope.match.meta.matchType != 1) {
                            // Normal matches will align centered between their 2 parents.

                            if (data.isDoubleConference() && deFinals && parts[1] === 'C2'){
                            	// Align right side finals with left side finals.
                            	var finals = connectorService.findConferenceFinals();
                            	top = finals.C1.offsetTop;
                            }
                            else {
                                var tparts = cEl1.scope().match.meta.matchId.split('-');
                                var c2Id = parseInt(tparts[3]);
                                var id2 = ('match-' + tparts[1] + '-' + (rNumber - 1) + '-' + (deFinals ? '1-L' : ((c2Id + 1) + suffix)));
                                var cEl2 = angular.element(document.getElementById(id2));
                                var bottom = angular.element(cEl2[0].firstElementChild).prop('offsetTop') + properties.matchHeight;


                                if (deFinals) {
                                    top = top + ((bottom - top) / 4);
                                }
                                else{
                                	top = top + ((bottom - top) / 2) - (properties.matchHeight / 2);
                                }                                
                            }
                        }

                        if (parts[1] === 'F' && parts[3] === '1') {
                            top -= properties.matchHeight;
                        }
                    }
                    el.css('top', top + 'px');

                    scope.$on('$destroy', function() {
                        w1();
                        w2();
                    });
                },
                post: function(scope, el, attrs) {
                    function createMatchObj() {
                        return {
                            matchId: scope.match.meta.matchId,
                            team1: scope.team1Details,
                            team2: scope.team2Details,
                            results: scope.match
                        };
                    }

                    function clickCallback(event) {
                        options.onMatchClick(event, createMatchObj());
                    }

                    function rClickCallback(event) {
                        options.onMatchRightClick(event, createMatchObj());
                    }

                    var options = data.getOptions();
                    if (options.onMatchRightClick) {
                        el.bind('contextmenu', rClickCallback);
                    }
                    if (options.onMatchClick) {
                        el.bind('click', clickCallback);
                    }

                    if(scope.match.meta.matchType === 'conference-finals' && scope.match.meta.matchId.split('-')[1] === 'C2') {
                    	connectorService.findConferenceFinals(); // register this conference 2 final
                    }

                    scope.$on('$destroy', function() {
                        el.unbind('contextmenu', rClickCallback);
                        el.unbind('click', clickCallback);
                    });
                }
            }
        };
    }
])


/**
 * Score control which will call update to bracket data.
 */
.directive('score', ['data',
    function(data) {
        return {
            restrict: "E",
            scope: {
                team: "=",
                match: "=",
                results: "="
            },
            templateUrl: 'partials/score.html',
            link: function(scope, el, attrs) {
                scope.editScore = function(event) {
                    if (scope.match.team1.id && scope.match.team2.id) {
                        scope.status = 'editable';
                    }
                };
                scope.calculateResults = function(oldValue) {
                    if (isNaN(parseFloat(scope.match.team1.score)) || isNaN(parseFloat(scope.match.team2.score)) ||
                        scope.match.team1.score === scope.match.team2.score) {
                        scope.results.winner = "";
                        scope.results.loser = "";

                        if(oldValue === null && !isNaN(parseFloat(scope.tmpOldScoreValue))) {
                            data.resetTrack(scope.match);
                        }

                        return;
                    }

                    var options = data.getOptions();

                    // app spesific match rules
                    if(options.onScoreChanged) {
                    	if(!options.onScoreChanged(scope.match)) {
                    		return;
                    	}
                    }

                    var winnerId;
                    if (scope.match.team1.score > scope.match.team2.score) {
                        winnerId = scope.match.team1.id;
                        scope.results.loser = scope.match.team2.id;
                    } else {
                        winnerId = scope.match.team2.id;
                        scope.results.loser = scope.match.team1.id;
                    }

                    scope.results.winner = winnerId;
                    var promoteLoser = data.getTournamentType() === 'DE' && scope.match.meta.matchId.slice(-1) !== 'L';
                    data.updateTournament(scope.match, winnerId, scope.results.loser, oldValue, promoteLoser);
                };
                scope.endEditScore = function() {
                    scope.status = 'uneditable';
                    scope.calculateResults(null);
                };
                var onTeamChanged = function(newValue, oldValue) {
                    if (newValue) {
                        scope.calculateResults(oldValue);
                    }
                    else if(oldValue && scope.team.id) {
                        data.updateTournament(scope.match, null, null, scope.team.id, false);
                    }
                };
                var w1 = scope.$watch('match.team1.id', function(newValue, oldValue) {
                    if (newValue) {
                        scope.calculateResults(oldValue);
                    }
                    else if(oldValue && scope.match.team1.id) {
                        data.resetTrack(scope.match);
                    }
                    else {
                        scope.results.winner = undefined;
                        scope.results.loser = undefined;
                    }
                }, true);
                var w2 = scope.$watch('match.team2.id', function(newValue, oldValue) {
                    if (newValue) {
                        scope.calculateResults(oldValue);
                    }
                    else if(oldValue && scope.match.team2.id) {
                        data.resetTrack(scope.match);
                    }
                    else {
                        scope.results.winner = undefined;
                        scope.results.loser = undefined;
                    }
                }, true);

                scope.$on('$destroy', function() {
                    w1();
                    w2();
                });
            },
            replace: true
        };
    }
])

/**
 * Creates connector divs from current match-element to parent (previous round) matches.
 **/
.directive('connectors', ['connectorService', 'layoutService', '$compile', 'data',
    function(connectorService, layoutService, $compile, data) {
        return {
            restrict: "E",
            template: '<div class="connectors"></div>',
            replace: true,
            scope: false,
            link: function(scope, el, attrs) {
                // Creates connector div. Classes (borders) must be assigned separately.
                function createConnector(width, height, posX, posY, team, loserBracket, noHighlightRule) {
                    var cmatch = team === null ? 'cMatch1' : 'cMatch' + team.toString();
                    var sc = team === null ? (loserBracket ? 'tbdB:match.team1.id.length === 0 && match.team2.id.length === 0' : '') : (team == 1 ? 'tbdB:match.team1.id.length === 0' : 'tbdB:match.team2.id.length === 0');
                    var rule1 = noHighlightRule ? cmatch + '.team1.score > ' + cmatch + '.team2.score && ' : '';
                    var rule2 = noHighlightRule ? cmatch + '.team2.score > ' + cmatch + '.team1.score && ' : '';
                    var hlc = 'highlight: highlight.teamId !== null && ((match.team1.id === highlight.teamId || match.team2.id === highlight.teamId) && ((' + rule1 + cmatch + '.team1.id === highlight.teamId) || (' + rule2 + cmatch + '.team2.id === highlight.teamId)))';
                    var medalHighlightRules = ',gold: highlight.goldId !== null && ((highlight.goldId === match.team1.id || match.team2.id === highlight.goldId) && ((' + cmatch + '.team1.id === highlight.goldId) || (' + cmatch + '.team2.id === highlight.goldId)))';
                    var hidden = scope.match.meta.matchType === 'finals2' ? ',hidden:(prop.finals2' + parts[1] +' === false)' : '';
                    var c = 'ng-class="{' + sc + (sc.length > 0 ? ', ' : '') + hlc + hidden + medalHighlightRules +'}"';
                    return angular.element($compile('<div class="connector" style="left:' + posX + 'px;top:' + posY + 'px;width:' + width + 'px;height:' + height + 'px" ' + c + '></div>')(scope));
                }

                function createConnectors(properties, round, isLoserMatch, rightSide) {
                    if (round > 1 && (isLoserMatch || (!isLoserMatch && ((round > properties.startingRound1 && parts[1] === 'C1') ||
                            (round > properties.startingRound2 && parts[1] === 'C2'))))) {

                        var thisMatch = connectorService.findChildMatch(el.parent());
                        var connectingMatch = angular.element(connectorService.findConnectingMatch(scope.match)[0].firstElementChild);
                        scope.cMatch1 = connectingMatch.scope().match;

                        // Connector endpoint
                        var horizontalBase = thisMatch.prop('offsetLeft') + properties.borderThickness + (rightSide ? properties.matchWidth : 0);
                        var verticalBase = thisMatch.prop('offsetTop') + (properties.matchHeight / 2);
                        var posX;

                        // Connector #1
                        if (scope.match.meta.matchType === 1 || scope.match.meta.matchType === 'finals2') {
                            var loserMatch = scope.match.meta.matchId.slice(-1) === 'L' || scope.match.meta.matchType === 'finals2';
                            posX = rightSide ? horizontalBase : horizontalBase - properties.matchMarginH;
                            el.append(createConnector(properties.matchMarginH - properties.borderThickness, 1, posX, verticalBase, null, loserMatch).addClass('connectorBottom'));
                            return;
                        }

                        var noHighlightRule = data.getTournamentType() === 'DE' && scope.match.meta.matchType === 'finals';
                        var width = properties.matchMarginH / 2 - properties.borderThickness;
                        var height = verticalBase - connectingMatch.prop('offsetTop') - (properties.matchHeight / 2);
                        posX = rightSide ? horizontalBase : horizontalBase - width - properties.borderThickness;
                        var posY = verticalBase - height;

                        var borders = rightSide ? "connectorBottom connectorRight" : "connectorBottom connectorLeft";
                        var e = createConnector(width, height, posX, posY, 1, null, noHighlightRule).addClass(borders);
                        el.append(e);

                        // width = properties.matchMarginH / 2 - properties.borderThickness;
                        posX = rightSide ? posX + width + properties.borderThickness : posX - width;
                        el.append(createConnector(width, 1, posX, posY, 1, null, noHighlightRule).addClass("connectorTop"));

                        // Connector #2
                        var prevId = connectingMatch.scope().match.meta.matchId.split('-');
                        var deFinals = (scope.match.meta.matchType === 'finals' && data.getTournamentType() === 'DE');
                        var suffix = prevId.slice(-1) == 'L' || deFinals ? '-L' : '';
                        var newId = prevId[0] + '-' + prevId[1] + '-' + prevId[2] + '-' + (deFinals ? 1 : (parseInt(prevId[3]) + 1)) + suffix;
                        var connectingMatch2 = angular.element(connectorService.findChildMatch(document.getElementById(newId)));
                        scope.cMatch2 = connectingMatch2.scope().match;

                        // width = properties.matchMarginH / 2;
                        height = (connectingMatch2.prop('offsetTop') + (properties.matchHeight / 2)) - verticalBase;
                        posX = rightSide ? horizontalBase : horizontalBase - width - properties.borderThickness;
                        posY = verticalBase;

                        borders = rightSide ? "connectorTop connectorRight" : "connectorTop connectorLeft";
                        el.append(createConnector(width, height, posX, posY, 2).addClass(borders));

                        // width = properties.matchMarginH / 2 - properties.borderThickness;
                        posX = rightSide ? posX + width + properties.borderThickness : posX - width;
                        posY = verticalBase + height;

                        el.append(createConnector(width, 1, posX, posY, 2).addClass("connectorTop"));
                    }
                }

                // Promoted match means a 1st round match with 2 teams, which was moved to round 2. They have no "parent" matches.
                if (scope.match.meta.matchType == 2 || scope.match.meta.matchType == 'bronze') {
                    return;
                }

                var properties = layoutService.getProperties();
                var parts = scope.match.meta.matchId.split('-');
                var round = parseInt(parts[2]);
                var lm = scope.match.meta.matchId.slice(-1) === 'L';

                if (parts[1] == 'F') {
                    scope.confFinals = connectorService.findConferenceFinals();
                    var thisMatch = connectorService.findChildMatch(el.parent());
                    var verticalBase = thisMatch.prop('offsetTop') + (properties.matchHeight / 2);
                    var horizontalBase = thisMatch.prop('offsetLeft');
                    // Left side connector
                    var width = properties.matchMarginH / 2;
                    var height = scope.confFinals.C1.offsetTop - verticalBase + (properties.matchHeight / 2);
                    var connector = el.append(createConnector(width, height, horizontalBase - width, verticalBase, 1).addClass('connectorTop connectorLeft'));
                    el.append(createConnector(width, 1, horizontalBase - properties.matchMarginH + properties.borderThickness, verticalBase + height, 1).addClass('connectorBottom'));
                    scope.cMatch1 = angular.element(scope.confFinals.C1).scope().match;
                    // Right side connector
                    horizontalBase += properties.matchWidth + properties.borderThickness;
                    el.append(createConnector(width, height, horizontalBase, verticalBase, 2).addClass('connectorTop connectorRight'));
                    el.append(createConnector(width, 1, horizontalBase + width, verticalBase + height, 2).addClass('connectorBottom'));

                	var w2 = scope.$watch('confFinals.C2', function(newValue, oldValue) {
                		if(newValue) {
                			scope.cMatch2 = angular.element(scope.confFinals.C2).scope().match;
                			w2();
                		}
                	});
                    
                } else {
                    createConnectors(properties, round, lm, parts[1] == 'C2');
                }
            }
        };
    }
])

/**
 * Team element
 */
.directive('team', ['data', 'highlight',
    function(data, highlight) {
        return {
            restrict: 'E',
            templateUrl: 'partials/team.html',
            replace: true,
            scope: {
                team: '=',
                teamdetails: '=',
                description: '='
            },
            link: function(scope, el, attrs) {
            	function clickCallback(event) {
                    options.onTeamClick(event, scope.team);
                }

                scope.highlight = scope.$parent.highlight;
                scope.results = scope.$parent.results;
                scope.match = scope.$parent.match;

                scope.highlightTrack = function(teamId) {
                    highlight.setHighlight(teamId);
                };

                scope.editTeam = function() {
                    if (data.getProperties().status === 'Not started' && scope.team.id) {
                        scope.status = 'editable';
                    }
                };
                scope.endEditTeam = function() {
                    scope.status = 'uneditable';
                };

                var options = data.getOptions();

                if((scope.match.meta.matchType === 'finals' || scope.match.meta.matchType === 'finals2') && data.getTournamentType() === 'DE') {
                	scope.prop = data.getProperties();
                }

                if (options.onTeamClick) {
                    el.bind('click', clickCallback);
                }

                scope.$on('$destroy', function() {
                    el.unbind('click', clickCallback);
                });
            }
        };
    }
]);
