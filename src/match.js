var myApp = angular.module('ngBracket');

/**
 * Attribute directive to set focus on element.
 */
myApp.directive('doFocus', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            if (element) {
                element[0].focus();
                element[0].select();
            }
        }
    };
});

/**
 * Score control
 */
myApp.directive('score', ['data',
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
                scope.editScore = function() {
                    if (scope.match.team1.id && scope.match.team2.id) {
                        scope.status = 'editable';
                    }
                };
                scope.calculateResults = function(oldValue) {
                    if (typeof(scope.match.team1.score) === 'undefined' || scope.match.team1.score === "" || typeof(scope.match.team2.score) === 'undefined' ||
                        scope.match.team2.score === "" || scope.match.team1.score === scope.match.team2.score) {
                        scope.results.winner = "";
                        scope.results.loser = "";
                        return;
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
                scope.$watch('match.team1.id', function(newValue, oldValue) {
                    if (newValue) {
                        scope.calculateResults(oldValue);
                    }
                }, true);
                scope.$watch('match.team2.id', function(newValue, oldValue) {
                    if (newValue) {
                        scope.calculateResults(oldValue);
                    }
                }, true);
            },
            replace: true
        };
    }
]);

/**
 * Provides team selection menu on right-click on team name.
 */
myApp.directive('teamSelectMenu', ['teamSelectService', 'data', '$document',
    function(teamSelectService, data, $document) {
        return {
            restrict: "A",
            scope: false,
            link: function($scope, $element, $attrs) {
                function show(event) {
                    teamSelectService.show(event, targetData, true);
                }

                if (data.getProperties().status === 'Not started') { // No need to bind if we have loaded on-going tournament
                    $element.bind('contextmenu', function(event) {
                        if (data.getProperties().status === 'Not started') { // Let the event flow if this is new on-going tournament
                            event.preventDefault();
                            event.stopPropagation();
                            teamSelectService.show($element[0], $scope.team, true);
                        }
                    });
                }
            }
        };
    }
]);

/**
* Team element
*/
myApp.directive('team', ['data', 'highlight', 'teamSelectService',
    function(data, highlight, teamSelectService) {
        return {
            restrict: 'E',
            templateUrl: 'partials/team.html',
            replace: false,
            scope: {
                team: '=',
                teamdetails: '=',
                description: '='
            },
            link: function(scope, el, attrs) {
                scope.highlight = scope.$parent.highlight;
                scope.results = scope.$parent.results;
                scope.match = scope.$parent.match;

                scope.highlightTrack = function(teamId) {
                    highlight.setHighlight(teamId);
                };

                scope.editTeam = function(team, val) {
                    if (data.getProperties().status === 'Not started') {
                        scope.status = val;
                    }
                };
                scope.endEditTeam = function() {
                    scope.status = 'uneditable';
                };
                scope.selectTeam = function($event, teamslot) {
                    if (data.getProperties().status !== 'Not started') {
                        return;
                    }
                    teamSelectService.show($event.target, team, false);
                };
            }
        };
    }
]);

/**
 * Creates match element and calculates it's position dynamically, based on the parent matches.
 */
myApp.directive('match', ['connectorService', 'positioningService', 'data', '$filter', 'matchDetailService', 'highlight',
    function(connectorService, positioningService, data, $filter, matchDetailService, highlight) {
        return {
            restrict: "E",
            scope: false,
            templateUrl: 'partials/match.html',
            replace: true,
            link: {
                pre: function(scope, el, attrs) {
                    scope.getTeamDetails = function(teamId) {
                        return $filter('getById')(data.getTeams(), teamId);
                    };

                    scope.showDetails = function($event) {
                        if (scope.team1Details === null || scope.team2Details === null || !$event.target || angular.element($event.target).hasClass('score')) {
                            return;
                        }
                        matchDetailService.show($event.target, {
                            matchId: scope.match.meta.matchId,
                            team1Details: scope.team1Details,
                            team2Details: scope.team2Details,
                            results: scope.match
                        }, true);
                    };
                    scope.highlight = highlight.mapHighlight();

                    scope.team1Details = scope.getTeamDetails(scope.match.team1.id);
                    scope.team2Details = scope.getTeamDetails(scope.match.team2.id);

                    scope.$watch('match.team1', function(newValue, oldValue) {
                        if (newValue) {
                            scope.team1Details = scope.getTeamDetails(scope.match.team1.id);
                        }
                    }, true);
                    scope.$watch('match.team2', function(newValue, oldValue) {
                        if (newValue) {
                            scope.team2Details = scope.getTeamDetails(scope.match.team2.id);
                        }
                    }, true);

                    var rNumber = parseInt(scope.match.meta.matchId.split('-')[1]);
                    var mNumber = parseInt(scope.match.meta.matchId.split('-')[2]);
                    var properties = positioningService.getBracketProperties();

                    if (scope.match.meta.team1Parent) {
                        scope.team1Description = 'Loser of Round ' + (parseInt(scope.match.meta.team1Parent.split('-')[1]) - properties.startingRound + 1) + ' match ' + scope.match.meta.team1Parent.split('-')[2];
                    }
                    if (scope.match.meta.team2Parent) {
                        scope.team2Description = 'Loser of Round ' + (parseInt(scope.match.meta.team2Parent.split('-')[1]) - properties.startingRound + 1) + ' match ' + scope.match.meta.team2Parent.split('-')[2];
                    }
                    if (scope.match.meta.matchType === 'finals2' && scope.match.team1.id.length === 0 && scope.match.team2.id.length === 0) {
                        scope.team1Description = 'Finals round 2 if necessary';
                        scope.prop = data.getProperties();
                    }

                    el.prop('id', 'match-' + rNumber + '-' + mNumber);

                    if (scope.match.meta.matchType == 'finals') {
                        scope.finals = true;
                    }

                    // center horizontally
                    el.css('left', properties.matchMarginH / 2 + 'px');

                    var finals2 = scope.match.meta.matchType === 'finals2' && data.getTournamentType() === 'DE';
                    if (finals2) {
                        el.css('left', ((properties.matchMarginH / 2) + properties.matchMarginH + properties.matchWidth) + 'px');
                    }

                    var top = 0;
                    var deFinals = (scope.match.meta.matchType === 'finals' && data.getTournamentType() === 'DE');
                    var suffix = (scope.match.meta.matchId.slice(-1) === 'L' || deFinals) ? '-L' : '';

                    // Calculate vertical position for the match element
                    if (rNumber === 1 || (rNumber === properties.startingRound && suffix.length === 0)) {
                        var x = (scope.match.meta.UIShiftDown) ? scope.match.meta.UIShiftDown : 0;
                        top = (properties.matchHeight + properties.matchMarginV) * (mNumber - 1 + x) + properties.roundMarginTop;
                    } else if (scope.match.meta.matchType === 2) {
                        top = (properties.matchHeight + properties.matchMarginV) * (mNumber - 1) + properties.roundMarginTop;

                        if (suffix.length > 0 && properties.lbOffset > 0 && top < properties.lbOffset) {
                            top += properties.lbOffset - properties.roundMarginTop;
                        }
                    } else if (scope.match.meta.matchType === 'bronze') {
                        scope.bronzeMatch = true;
                        var goldMatch = angular.element(document.getElementById('match-' + rNumber + '-1'));
                        top = goldMatch.prop('offsetTop') + properties.matchHeight + 40;
                    } else if (finals2) {
                        var finals1El = angular.element(document.getElementById('match-' + rNumber + '-1'));
                        top = finals1El.prop('offsetTop');
                    } else {
                        var cEl1 = connectorService.findConnectingMatch(scope.match);
                        top = angular.element(cEl1[0].firstElementChild).prop('offsetTop');

                        if (scope.match.meta.matchType != 1) {
                            // Normal matches will align centered between their 2 parents.
                            var c2Id = parseInt(cEl1.scope().match.meta.matchId.split('-')[2]);
                            var id2 = ('match-' + (rNumber - 1) + '-' + (deFinals ? '1-L' : ((c2Id + 1) + suffix)));
                            var cEl2 = angular.element(document.getElementById(id2));
                            var bottom = angular.element(cEl2[0].firstElementChild).prop('offsetTop') + properties.matchHeight;

                            if (deFinals) {
                                top = top + ((bottom - top) / 4);
                            } else {
                                top = top + ((bottom - top) / 2) - (properties.matchHeight / 2);
                            }
                        }
                    }
                    el.css('top', top + 'px');
                }
            }
        };
    }
]);

/**
 * Creates connector divs from current match-element to parent (previous round) matches.
 **/
myApp.directive('connectors', ['connectorService', 'positioningService', '$compile', 'data',
    function(connectorService, positioningService, $compile, data) {
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
                    var hidden = scope.match.meta.matchType === 'finals2' ? ',hidden:(prop.finals2 === false)' : '';
                    var c = 'ng-class="{' + sc + (sc.length > 0 ? ', ' : '') + hlc + hidden + '}"';
                    return angular.element($compile('<div class="connector" style="left:' + posX + 'px;top:' + posY + 'px;width:' + width + 'px;height:' + height + 'px" ' + c + '></div>')(scope));
                }

                // Promoted match means a 1st round match with 2 teams, which was moved to round 2. They have no "parent" matches.
                if (scope.match.meta.matchType == 2 || scope.match.meta.matchType == 'bronze') {
                    return;
                }

                var properties = positioningService.getBracketProperties();
                var round = parseInt(scope.match.meta.matchId.split('-')[1]);
                var lm = scope.match.meta.matchId.slice(-1) === 'L';

                if (round > 1 && (lm || (!lm && round > properties.startingRound))) {
                    var thisMatch = connectorService.findChildMatch(el.parent());
                    var connectingMatch = angular.element(connectorService.findConnectingMatch(scope.match)[0].firstElementChild);
                    scope.cMatch1 = connectingMatch.scope().match;

                    // Connector endpoint
                    var horizontalBase = thisMatch.prop('offsetLeft');
                    var verticalBase = thisMatch.prop('offsetTop') + (properties.matchHeight / 2);

                    // Connector #1
                    if (scope.match.meta.matchType === 1 || scope.match.meta.matchType === 'finals2') {
                        var loserMatch = scope.match.meta.matchId.slice(-1) === 'L' || scope.match.meta.matchType === 'finals2';
                        el.append(createConnector(properties.matchMarginH - properties.borderThickness, 1, horizontalBase - properties.matchMarginH + properties.borderThickness, verticalBase, null, loserMatch).addClass('connectorBottom'));
                        return;
                    }

                    var noHighlightRule = data.getTournamentType() === 'DE' && scope.match.meta.matchType === 'finals';
                    var width = properties.matchMarginH / 2;
                    var height = verticalBase - connectingMatch.prop('offsetTop') - (properties.matchHeight / 2);
                    var posX = horizontalBase - width - properties.borderThickness;
                    var posY = verticalBase - height;

                    var e = createConnector(width, height, posX, posY, 1, null, noHighlightRule).addClass("connectorBottom connectorLeft");
                    el.append(e);

                    width = properties.matchMarginH / 2 - properties.borderThickness;
                    posX = posX - width + properties.borderThickness;
                    el.append(createConnector(width, 1, posX, posY, 1, null, noHighlightRule).addClass("connectorTop"));

                    // Connector #2
                    var prevId = connectingMatch.scope().match.meta.matchId.split('-');
                    var deFinals = (scope.match.meta.matchType === 'finals' && data.getTournamentType() === 'DE');
                    var suffix = prevId.length > 3 || deFinals ? '-L' : '';
                    var newId = prevId[0] + '-' + prevId[1] + '-' + (deFinals ? 1 : (parseInt(prevId[2]) + 1)) + suffix;
                    var connectingMatch2 = angular.element(connectorService.findChildMatch(document.getElementById(newId)));
                    scope.cMatch2 = connectingMatch2.scope().match;

                    width = properties.matchMarginH / 2;
                    height = (connectingMatch2.prop('offsetTop') + (properties.matchHeight / 2)) - verticalBase;
                    posX = horizontalBase - width - properties.borderThickness;
                    posY = verticalBase;

                    el.append(createConnector(width, height, posX, posY, 2).addClass("connectorTop connectorLeft"));

                    width = properties.matchMarginH / 2 - properties.borderThickness;
                    posX = posX - width + properties.borderThickness;
                    posY = verticalBase + height;

                    el.append(createConnector(width, 1, posX, posY, 2).addClass("connectorTop"));
                }
            }
        };
    }
]);
