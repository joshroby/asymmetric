var handlers = {

	newGame: function() {
		game = new Game();
		game.eachDay();
		console.log(game);
		view.initPlanetMaps();
		view.displayFaction(game.p1);
	},

	clockPause: function() {
		if (game.clock.running) {
			game.clock.running = false;
			document.getElementById('clockPauseBtn').className = 'fa fa-play';
		} else {
			var eachDay = false;
			for (event in game.clock.events) {
				if (game.clock.events[event].indexOf('eachDay') !== -1) {
					eachDay = true;
				};
			};
			if (!eachDay) {
				game.clock.logEventIn(0,'eachDay');
			};
			game.clock.running = true;
			document.getElementById('clockPauseBtn').className = 'fa fa-pause';
			game.clock.go();
		};
	},
	
	setClockSpeed: function() {
		var clockSpeedSlider = document.getElementById('clockSpeedSlider');
		game.clock.tick = 10000/clockSpeedSlider.value;
	},

};