'use strict';

describe('Bracket generator', function() {
	var tournamentGenerator, result, players;

	function generatePlayers(amount) {
		var p = [];
		for (var i = 1; i <= parseInt(amount); i++) {
			p.push(i.toString());
		}
		return p;
	}

	describe('Single Elimination tests', function() {

		var ttype = 'SE';

		beforeEach(module('ngBracket'));

		beforeEach(function() {
			inject(function(_tournamentGenerator_) {
				tournamentGenerator = _tournamentGenerator_;
			});
		});

		it('Should generate balanced bracket with bronze match', function() {
			players = generatePlayers(8);
			result = tournamentGenerator.newTournament(ttype, players, true);
			expect(result.matches.length).toBe(3);
			expect(result.matches[0].length).toBe(4);
			expect(result.matches[2].length).toBe(2);
		});

		it('Should generate balanced bracket without bronze match', function() {
			players = generatePlayers(8);
			result = tournamentGenerator.newTournament(ttype, players, false);
			expect(result.matches.length).toBe(3);
			expect(result.matches[0].length).toBe(4);
			expect(result.matches[2].length).toBe(1);
		});

		// Halfway ie 12, 24, 48... (= balanced brackets are 4, 8, 16, 32..., so 12 is halfway between 8 and 16)
		it("Should generate unbalanced bracket with player amount halfway between balanced brackets", function() {
			players = generatePlayers(12);
			result = tournamentGenerator.newTournament(ttype, players, true);
			expect(result.matches.length).toBe(4);
			expect(result.matches[0].length).toBe(result.matches[1].length);
		});

		it("Should generate unbalanced bracket with player amount below the halfway between balanced brackets", function() {
			players = generatePlayers(20);
			result = tournamentGenerator.newTournament(ttype, players, true);
			expect(result.matches.length).toBe(5);
			expect(result.matches[0].length).toBeLessThan(result.matches[1].length);
		});

		it("Should generate unbalanced bracket with player amount above halfway between balanced brackets", function() {
			players = generatePlayers(28);
			result = tournamentGenerator.newTournament(ttype, players, true);
			expect(result.matches.length).toBe(5);
			expect(result.matches[0].length).toBeGreaterThan(result.matches[1].length);
		});

		it("Should generate metadata", function() {
			players = generatePlayers(14);
			result = tournamentGenerator.newTournament(ttype, players, true);
			expect(result.matches[0][0].meta.team1Parent).not.toBeUndefined;
			expect(result.matches[0][0].meta.team2Parent).not.toBeUndefined;
			expect(result.matches[3][0].meta.matchType).toEqual('finals');
			expect(result.matches[3][1].meta.matchType).toEqual('bronze');
			expect(result.type).toEqual(ttype);
			expect(result.properties.unbalanced).toBeTruthy;
		});
	});

	describe('Double Elimination tests', function() {

		var ttype = 'DE';

		beforeEach(module('ngBracket'));

		beforeEach(function() {
			inject(function(_tournamentGenerator_) {
				tournamentGenerator = _tournamentGenerator_;
			});
		});

		it('Should generate balanced bracket with bronze match', function() {
			players = generatePlayers(8);
			result = tournamentGenerator.newTournament(ttype, players, true);
			expect(result.matches.length).toBe(5);
			expect(result.matches[0].length).toBe(2);
			expect(result.matches[0][0].meta.matchId).toContain('-L');
			expect(result.matches[3].length).toBe(2);
			expect(result.matches[4].length).toBe(3);
		});

		it('Should generate balanced bracket without bronze match', function() {
			players = generatePlayers(8);
			result = tournamentGenerator.newTournament(ttype, players, false);
			expect(result.matches.length).toBe(5);
			expect(result.matches[0].length).toBe(2);
			expect(result.matches[0][0].meta.matchId).toContain('-L');
			expect(result.matches[3].length).toBe(2);
			expect(result.matches[4].length).toBe(2);
		});

		// Halfway ie 12, 24, 48... (= balanced brackets are 4, 8, 16, 32..., so 12 is halfway between 8 and 16)
		it("Should generate unbalanced bracket with player amount halfway between balanced brackets", function() {
			players = generatePlayers(12);
			result = tournamentGenerator.newTournament(ttype, players, true);
			expect(result.matches.length).toBe(6);
			expect(result.matches[0][0].meta.matchId).toContain('-L');
			expect(result.matches[0].length).toBe(4);
			expect(result.matches[1].length).toBe(result.matches[2].length);

			players = generatePlayers(48);
			result = tournamentGenerator.newTournament(ttype, players, true);
			expect(result.matches.length).toBe(10);
			expect(result.matches[0][0].meta.matchId).toContain('-L');
			expect(result.matches[0].length).toBe(16);
			expect(result.matches[3].length).toBe(result.matches[4].length);
		});

		it("Should generate unbalanced bracket with player amount below the halfway between balanced brackets", function() {
			players = generatePlayers(20);
			result = tournamentGenerator.newTournament(ttype, players, true);
			expect(result.matches.length).toBe(8);
			expect(result.matches[0][0].meta.matchId).toContain('-L');
			expect(result.matches[2].length).toBeLessThan(result.matches[3].length);
		});

		it("Should generate unbalanced bracket with player amount above halfway between balanced brackets", function() {
			players = generatePlayers(28);
			result = tournamentGenerator.newTournament(ttype, players, true);
			expect(result.matches.length).toBe(8);
			expect(result.matches[0][0].meta.matchId).toContain('-L');
			expect(result.matches[0].length).toBeLessThan(result.matches[1].length);
		});

		it("Should generate metadata", function() {
			players = generatePlayers(14);
			result = tournamentGenerator.newTournament(ttype, players, true);
			expect(result.matches[0][0].meta.team1Parent).not.toBeUndefined;
			expect(result.matches[0][0].meta.team2Parent).not.toBeUndefined;
			expect(result.matches[5][0].meta.matchType).toEqual('finals');
			expect(result.matches[5][1].meta.matchType).toEqual('finals2');
			expect(result.matches[5][2].meta.matchType).toEqual('bronze');
			expect(result.type).toEqual(ttype);
			expect(result.properties.unbalanced).toBeTruthy;
			expect(result.properties.lbOffset).not.toBeUndefined;
			expect(result.properties.unbalanced).not.toBeNull;
		});
	});
});
