ngBracket
=========
Bracket tournament generator, built with AngularJS.

This plugin allows you to generate and display single elimination and double elimination tournament brackets.

Download
--------
Get latest version from /dist.

Building
--------
* Install Node
* Install Ruby
* Run `gem install sass` to install SASS
* Run `npm install` to get dependencies
* Run `grunt` to compile
 
Examples
--------
Demo can be found in the repository. Just clone the latest version and run it with http-server.

Basicly the plugin takes in tournament data structure which can be generated using tournamentGenerator service.

You can also provide custom callbacks in options section:
```
options: {
  onTeamClick: function(event) {...},
  onTeamRightClick: function(event, team) {...},
  onMatchClick: function(event, match) {...},
  onMatchRightClick: function(event, match) {...}
  onScoreChanged: function(match) {...}
}
