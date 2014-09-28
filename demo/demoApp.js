/**
 * Demo app controller
 */
var demo = angular.module('demoApp', ['ngBracket']);

demo.controller('bracketController', ['$scope', '$document', 'tournamentGenerator',
    function($scope, $document, tournamentGenerator) {

        // For demo page, can be removed
        $scope.addPlayer = function() {
            if ($scope.newPlayerName) {
                $scope.bracketData.teams.push({
                    name: $scope.newPlayerName,
                    id: ($scope.bracketData.teams.length + 1).toString(),
                    flag: $scope.newPlayerFlag.length > 0 ? $scope.newPlayerFlag + '.png' : '',
                    members: []
                });
            }
        };

        $scope.setEnableDetails = function() {
            $scope.bracketData.options.detailsEnabled = $scope.enableDetails;
        };

        $scope.shuffleTeams = function() {
            tournamentGenerator.shuffle($scope.bracketData);
        };

        $scope.loadTeams = function() {
            $scope.bracketData.teams = JSON.parse($scope.teamsJson);
        };

        // For demo page, can be removed
        $scope.generateWithRandomPlayers = function() {
            if ($scope.playersToGenerate) {
                $scope.bracketData.teams = [];
                var n = parseInt($scope.playersToGenerate);
                if (n > 3) {
                    for (var i = 1; i <= n; i++) {
                        $scope.bracketData.teams.push({
                            name: '',
                            id: i.toString(),
                            flag: '',
                            members: []
                        });
                    }
                    startTournament(tournamentGenerator.newTournament($scope.tType, $scope.bracketData.teams, $scope.playBronzeMatch), $scope.bracketData.teams);
                }
            }
        };

        function startTournament(tournamentData, teams) {
            $scope.bracketData.teams = teams;
            $scope.bracketData.tournament = tournamentData;
            $scope.bracketData.reload();
        }

        // For demo page, can be removed
        $scope.newTournament = function() {
            startTournament(tournamentGenerator.newTournament($scope.tType, $scope.bracketData.teams, $scope.playBronzeMatch), $scope.bracketData.teams);
        };

        // For demo page, can be removed
        $scope.loadTournament = function(sample) {
            if (sample === 'SE') {
                startTournament(SEsampleTournamentData, SEsampleTeamsData);
            } else if (sample === 'DE') {
                startTournament(DEsampleTournamentData, DEsampleTeamsData);
            }
        };

        $scope.onTeamClick = function(event) {
            console.log("Team clicked.");
        };

        $scope.onMatchRightClick = function(event, match) {
            console.log("Match right clicked.");
        };

        function showDialog(dialog, targetEl, offsetX, offsetY) {
            if (dialog !== null) {
                if (targetEl !== null && targetEl.getBoundingClientRect()) {
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
        }

        function hideDialog(dialog) {
            if (dialog !== null) {
                dialog.css('visibility', 'hidden');
            }
        }

        function showDetails(event, match) {
            function hide() {
                $scope.detailContainer.unbind('keyup', $scope.detailsHandleKeyUpEvent);
                hideDialog($scope.detailContainer);
                $scope.detailsHandleKeyUpEvent = null;
            }
            $scope.detailsHandleKeyUpEvent = createCloseOnEscEventHandler(this, hide);
            var matchElement = event.currentTarget;

            // Toggle closed
            if ($scope.detailContainer && $scope.detailContainer.css('visibility') == 'visible' && match.matchId == $scope.matchToShow.matchId) {
                hide();
                return;
            }

             if (!$scope.enableDetails || !match.team1 || !match.team2) {
                return;
            }           

            $scope.matchToShow = match;
            $scope.$apply();

            if (!$scope.detailContainer) {
                $scope.detailContainer = angular.element(document.getElementById('detailOverlay'));
            }
            if ($scope.detailContainer.length > 0 && matchElement !== null) {
                $document.unbind('keyup', $scope.detailsHandleKeyUpEvent).bind('keyup', $scope.detailsHandleKeyUpEvent);
                showDialog($scope.detailContainer, matchElement, 0, 0);
            }
        }

        $scope.selectTeam = function(team) {
            if ($scope.targetTeamslot) {
                $scope.targetTeamslot.id = team.id;
            }
            hideDialog($scope.teamSelectDialog);
        };

        function hideSelectTeam() {
            $scope.targetTeamslot = null;
            if ($scope.teamSelectDialog !== null) {
                $document.unbind('keyup', $scope.teamselectHandleKeyUpEvent);
                $document.unbind('click', $scope.teamselectHandleClickEvent);
                $scope.teamselectHandleKeyUpEvent = null;
                $scope.teamselectHandleClickEvent = null;
                hideDialog($scope.teamSelectDialog);
            }
        }

        function createCloseOnEscEventHandler(callbackObj, callback) {
            return function(event) {
                if (event.keyCode === 27) {
                    callback.call(callbackObj);
                }
            };
        }

        function showSelectTeam(event, team) {

            event.preventDefault();
            event.stopPropagation();
            $scope.teamselectHandleKeyUpEvent = createCloseOnEscEventHandler(this, hideSelectTeam);

            $scope.teamselectHandleClickEvent = function(event) {
                if (event.button !== 2 && !angular.module('ngBracket').findParentByAttribute(event.target, 'id', 'selectTeamOverlay')) {
                    hideSelectTeam();
                }
            };

            if ($scope.bracketData.tournament.properties.status !== 'Not started' || !team || !team.id) {
                return;
            }
            if (!$scope.teamSelectDialog) {
                $scope.teamSelectDialog = angular.element(document.getElementById('selectTeamOverlay'));
            }
            if ($scope.teamSelectDialog && $scope.teamSelectDialog.length > 0) {
                $document.unbind('keyup', $scope.teamselectHandleKeyUpEvent).bind('keyup', $scope.teamselectHandleKeyUpEvent);
                $document.unbind('click', $scope.teamselectHandleClickEvent).bind('click', $scope.teamselectHandleClickEvent);

                $scope.targetTeamslot = team;
                showDialog($scope.teamSelectDialog, findParentTeam(event.target), 0, 0);
            }
        }

        function findParentTeam(el) {
            var current = el;
            while (current.parentNode !== null) {
                current = current.parentNode;
                if (current.classList.contains('team')) {
                    return current;
                }
            }
        }

        // data object for bracket controller
        $scope.bracketData = {
            teams: [],
            tournament: {
                type: "SE",
                matches: []
            },
            options: {
                onTeamRightClick: showSelectTeam,
                onTeamClick: $scope.onTeamClick,
                onMatchClick: showDetails,
                onMatchRightClick: $scope.onMatchRightClick
            }
        };

        // Dummy data untill there's a service to fetch data from db.
        var SEsampleTeamsData = JSON.parse('[{"name":"Player 1","id":"1","flag":"aut.png","members":[]},{"name":"Player 2","id":"2","flag":"chi.png","members":[]},{"name":"Player 3","id":"3","flag":"fra.png","members":[]},{"name":"Player 4","id":"4","flag":"swe.png","members":[]},{"name":"Player 5","id":"5","flag":"usa.png","members":[]},{"name":"Player 6","id":"6","flag":"can.png","members":[]},{"name":"Player 7","id":"7","flag":"ger.png","members":[]},{"name":"Player 8","id":"8","flag":"rus.png","members":[]},{"name":"Player 9","id":"9","flag":"fin.png","members":[]},{"name":"Player 10","id":"10","flag":"sui.png","members":[]},{"name":"Player 11","id":"11","flag":"uk.png","members":[]},{"name":"Player 12","id":"12","flag":"ger.png","members":[]},{"name":"Player 13","id":"13","flag":"can.png","members":[]},{"name":"Player 14","id":"14","flag":"uk.png","members":[]},{"name":"Player 15","id":"15","flag":"cze.png","members":[]},{"name":"Player 16","id":"16","flag":"est.png","members":[]},{"name":"Player 17","id":"17","flag":"den.png","members":[]},{"name":"Player 18","id":"18","flag":"usa.png","members":[]},{"name":"Player 19","id":"19","flag":"rus.png","members":[]}]');
        var SEsampleTournamentData = JSON.parse('{"type":"SE","matches":[[{"team1":{"id":"6","score":4},"team2":{"id":"15","score":1},"meta":{"matchId":"match-1-1"},"details":{}},{"team1":{"id":"2","score":0},"team2":{"id":"18","score":1},"meta":{"matchId":"match-1-2","UIShiftDown":2},"details":{}},{"team1":{"id":"7","score":3},"team2":{"id":"13","score":2},"meta":{"matchId":"match-1-3","UIShiftDown":3},"details":{}}],[{"team1":{"id":"17","score":0},"team2":{"id":"6","score":3},"meta":{"matchId":"match-2-1","matchType":1},"details":{}},{"team1":{"id":"1","score":3},"team2":{"id":"11","score":1},"meta":{"matchId":"match-2-2","matchType":2},"details":{}},{"team1":{"id":"4","score":""},"team2":{"id":"10","score":""},"meta":{"matchId":"match-2-3","matchType":2},"details":{}},{"team1":{"id":"3","score":1},"team2":{"id":"18","score":2},"meta":{"matchId":"match-2-4","matchType":1},"details":{}},{"team1":{"id":"16","score":""},"team2":{"id":"14","score":""},"meta":{"matchId":"match-2-5","matchType":2},"details":{}},{"team1":{"id":"9","score":""},"team2":{"id":"7","score":""},"meta":{"matchId":"match-2-6","matchType":1},"details":{}},{"team1":{"id":"12","score":""},"team2":{"id":"8","score":""},"meta":{"matchId":"match-2-7","matchType":2},"details":{}},{"team1":{"id":"19","score":""},"team2":{"id":"5","score":""},"meta":{"matchId":"match-2-8","matchType":2},"details":{}}],[{"team1":{"id":"6","score":""},"team2":{"id":"1","score":""},"meta":{"matchId":"match-3-1"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"18","score":""},"meta":{"matchId":"match-3-2"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-3"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-4"},"details":{}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-1"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-2"},"details":{}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-1","matchType":"finals"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-2","matchType":"bronze"},"details":{}}]],"properties":{"status":"In progress","unbalanced":true}} ');
        var DEsampleTeamsData = JSON.parse('[{"name":"Player 1","id":"1","flag":"aut.png","members":[]},{"name":"Player 2","id":"2","flag":"den.png","members":[]},{"name":"Player 3","id":"3","flag":"ger.png","members":[]},{"name":"Player 4","id":"4","flag":"usa.png","members":[]},{"name":"Player 5","id":"5","flag":"swe.png","members":[]},{"name":"Player 6","id":"6","flag":"fra.png","members":[]},{"name":"Player 7","id":"7","flag":"fin.png","members":[]},{"name":"Player 8","id":"8","flag":"est.png","members":[]},{"name":"Player 9","id":"9","flag":"aut.png","members":[]},{"name":"Player 10","id":"10","flag":"uk.png","members":[]},{"name":"Player 11","id":"11","flag":"chi.png","members":[]},{"name":"Player 12","id":"12","flag":"usa.png","members":[]},{"name":"Player 13","id":"13","flag":"can.png","members":[]},{"name":"Player 14","id":"14","flag":"usa.png","members":[]},{"name":"Player 15","id":"15","flag":"swe.png","members":[]},{"name":"Player 16","id":"16","flag":"cze.png","members":[]},{"name":"Player 17","id":"17","flag":"rus.png","members":[]},{"name":"Player 18","id":"18","flag":"ger.png","members":[]},{"name":"Player 19","id":"19","flag":"fin.png","members":[]},{"name":"Player 20","id":"20","flag":"den.png","members":[]},{"name":"Player 21","id":"21","flag":"ger.png","members":[]},{"name":"Player 22","id":"22","flag":"sui.png","members":[]}]');
        var DEsampleTournamentData = JSON.parse('{"type":"DE","matches":[[{"team1":{"id":"1","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-1-1-L","UIShiftDown":8.5,"team1Parent":"match-3-1","team2Parent":"match-4-6"},"details":{}},{"team1":{"id":"3","score":4},"team2":{"id":"8","score":2},"meta":{"matchId":"match-1-2-L","UIShiftDown":8.5,"team1Parent":"match-3-2","team2Parent":"match-4-5"},"details":{}},{"team1":{"id":"6","score":5},"team2":{"id":"5","score":3},"meta":{"matchId":"match-1-3-L","UIShiftDown":8.5,"team1Parent":"match-3-3","team2Parent":"match-4-4"},"details":{}},{"team1":{"id":"7","score":1},"team2":{"id":"16","score":2},"meta":{"matchId":"match-1-4-L","UIShiftDown":8.5,"team1Parent":"match-3-4","team2Parent":"match-4-3"},"details":{}},{"team1":{"id":"10","score":2},"team2":{"id":"4","score":3},"meta":{"matchId":"match-1-5-L","UIShiftDown":8.5,"team1Parent":"match-3-5","team2Parent":"match-4-2"},"details":{}},{"team1":{"id":"11","score":4},"team2":{"id":"2","score":1},"meta":{"matchId":"match-1-6-L","UIShiftDown":8.5,"team1Parent":"match-3-6","team2Parent":"match-4-1"},"details":{}}],[{"team1":{"id":"20","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-2-1-L","matchType":1,"team1Parent":"match-4-7"},"details":{}},{"team1":{"id":"3","score":1},"team2":{"id":"6","score":2},"meta":{"matchId":"match-2-2-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"16","score":""},"meta":{"matchId":"match-2-3-L","matchType":1,"team1Parent":"match-4-8"},"details":{}},{"team1":{"id":"4","score":3},"team2":{"id":"11","score":2},"meta":{"matchId":"match-2-4-L"},"details":{}}],[{"team1":{"id":"1","score":1},"team2":{"id":"2","score":3},"meta":{"matchId":"match-3-1","loserMatchId":"match-1-1-L"},"details":{}},{"team1":{"id":"3","score":2},"team2":{"id":"4","score":3},"meta":{"matchId":"match-3-2","loserMatchId":"match-1-2-L"},"details":{}},{"team1":{"id":"5","score":2},"team2":{"id":"6","score":1},"meta":{"matchId":"match-3-3","UIShiftDown":1,"loserMatchId":"match-1-3-L"},"details":{}},{"team1":{"id":"7","score":1},"team2":{"id":"8","score":5},"meta":{"matchId":"match-3-4","UIShiftDown":1,"loserMatchId":"match-1-4-L"},"details":{}},{"team1":{"id":"9","score":4},"team2":{"id":"10","score":2},"meta":{"matchId":"match-3-5","UIShiftDown":1,"loserMatchId":"match-1-5-L"},"details":{}},{"team1":{"id":"11","score":1},"team2":{"id":"12","score":3},"meta":{"matchId":"match-3-6","UIShiftDown":2,"loserMatchId":"match-1-6-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-1-L","matchType":1,"team1Parent":"match-5-4"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"6","score":""},"meta":{"matchId":"match-3-2-L","matchType":1,"team1Parent":"match-5-3"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-3-3-L","matchType":1,"team1Parent":"match-5-2"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"4","score":""},"meta":{"matchId":"match-3-4-L","matchType":1,"team1Parent":"match-5-1"},"details":{}}],[{"team1":{"id":"13","score":5},"team2":{"id":"2","score":2},"meta":{"matchId":"match-4-1","matchType":1,"loserMatchId":"match-1-6-L"},"details":{}},{"team1":{"id":"14","score":4},"team2":{"id":"4","score":0},"meta":{"matchId":"match-4-2","matchType":1,"loserMatchId":"match-1-5-L"},"details":{}},{"team1":{"id":"15","score":3},"team2":{"id":"16","score":2},"meta":{"matchId":"match-4-3","matchType":2,"loserMatchId":"match-1-4-L"},"details":{}},{"team1":{"id":"17","score":2},"team2":{"id":"5","score":1},"meta":{"matchId":"match-4-4","matchType":1,"loserMatchId":"match-1-3-L"},"details":{}},{"team1":{"id":"18","score":3},"team2":{"id":"8","score":2},"meta":{"matchId":"match-4-5","matchType":1,"loserMatchId":"match-1-2-L"},"details":{}},{"team1":{"id":"19","score":""},"team2":{"id":"9","score":""},"meta":{"matchId":"match-4-6","matchType":1,"loserMatchId":"match-1-1-L"},"details":{}},{"team1":{"id":"20","score":1},"team2":{"id":"21","score":2},"meta":{"matchId":"match-4-7","matchType":2,"loserMatchId":"match-2-1-L"},"details":{}},{"team1":{"id":"22","score":""},"team2":{"id":"12","score":""},"meta":{"matchId":"match-4-8","matchType":1,"loserMatchId":"match-2-3-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-1-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-4-2-L"},"details":{}}],[{"team1":{"id":"13","score":""},"team2":{"id":"14","score":""},"meta":{"matchId":"match-5-1","loserMatchId":"match-3-4-L"},"details":{}},{"team1":{"id":"15","score":""},"team2":{"id":"17","score":""},"meta":{"matchId":"match-5-2","loserMatchId":"match-3-3-L"},"details":{}},{"team1":{"id":"18","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-3","loserMatchId":"match-3-2-L"},"details":{}},{"team1":{"id":"21","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-4","loserMatchId":"match-3-1-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-1-L","matchType":1,"team1Parent":"match-6-1"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-5-2-L","matchType":1,"team1Parent":"match-6-2"},"details":{}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-6-1","loserMatchId":"match-5-1-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-6-2","loserMatchId":"match-5-2-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-6-1-L"},"details":{}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-7-1","loserMatchId":"match-7-1-L"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-7-1-L","matchType":1,"team1Parent":"match-7-1"},"details":{}}],[{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-8-1","matchType":"finals"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-8-2","matchType":"finals2"},"details":{}},{"team1":{"id":"","score":""},"team2":{"id":"","score":""},"meta":{"matchId":"match-8-3","matchType":"bronze"},"details":{}}]],"properties":{"unbalanced":true,"lbOffset":8.5}}');

        $scope.teamsJson = '[{"name":"Player 1","id":"1","flag":"aut.png","members":[]},{"name":"Player 2","id":"2","flag":"den.png","members":[]},{"name":"Player 3","id":"3","flag":"ger.png","members":[]},{"name":"Player 4","id":"4","flag":"usa.png","members":[]},{"name":"Player 5","id":"5","flag":"swe.png","members":[]},{"name":"Player 6","id":"6","flag":"fra.png","members":[]},{"name":"Player 7","id":"7","flag":"fin.png","members":[]},{"name":"Player 8","id":"8","flag":"est.png","members":[]},{"name":"Player 9","id":"9","flag":"aut.png","members":[]},{"name":"Player 10","id":"10","flag":"uk.png","members":[]},{"name":"Player 11","id":"11","flag":"chi.png","members":[]},{"name":"Player 12","id":"12","flag":"usa.png","members":[]},{"name":"Player 13","id":"13","flag":"can.png","members":[]},{"name":"Player 14","id":"14","flag":"usa.png","members":[]},{"name":"Player 15","id":"15","flag":"swe.png","members":[]},{"name":"Player 16","id":"16","flag":"cze.png","members":[]},{"name":"Player 17","id":"17","flag":"rus.png","members":[]},{"name":"Player 18","id":"18","flag":"ger.png","members":[]},{"name":"Player 19","id":"19","flag":"fin.png","members":[]},{"name":"Player 20","id":"20","flag":"den.png","members":[]},{"name":"Player 21","id":"21","flag":"ger.png","members":[]},{"name":"Player 22","id":"22","flag":"sui.png","members":[]}]';
    }
]);
