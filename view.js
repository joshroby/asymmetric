var view = {

	gameTitle: 'asymmetric',
	colors: {
		mainMenu: 'indigo',
	},
	
	focus: {
		faction: undefined,
		territory: undefined,
	},

	init: function() {
		var body = document.body;
		body.innerHTML = '';
		
		var gameDiv = document.createElement('div');
		gameDiv.id = 'gameDiv';
		body.appendChild(gameDiv);
		var gameDivContents = view.gameDivContents();
		gameDiv.innerHTML = '';
		for (var i of gameDivContents) {
			gameDiv.appendChild(i);
		};
		
		view.windowResize();
	},
	
	windowResize: function() {
		var gameDiv = document.getElementById('gameDiv');
		if (gameDiv) {
			var viewport = view.viewport();
			viewport.height -= viewport.width * 0.03; // Taking #mainMenuDiv into account
			var gameDivDimensions = {};
			gameDivDimensions.height = 0.95 * Math.min(viewport.height,viewport.width*0.618);
			gameDivDimensions.width = 0.95 * Math.min(viewport.width,viewport.height/0.618);
			gameDiv.style.width = gameDivDimensions.width;
			gameDiv.style.height = gameDivDimensions.height;
			gameDiv.style.marginLeft = (viewport.width-gameDivDimensions.width)/2;
		};
	},

	viewport: function() {
		var e = window, a = 'inner';
		if ( !( 'innerWidth' in window ) ) {
			a = 'client';
			e = document.documentElement || document.body;
		};
		return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
	},
	
	setHref: function(element,href,external) {
		var string = '#'+href;
		if (external) {
			string = href;
		};
		element.setAttribute('href',string);
		element.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',string);
	},
	
	capitalize: function(string) {
    	return string.charAt(0).toUpperCase() + string.slice(1);
	},
	
	prettyList: function(list,andor) {
		if (andor == undefined) {andor = 'and'};
		var prettyList = '';
		for (var item=0;item<list.length;item++) {
			prettyList += ' ' + list[item];
			if (item == list.length-1) {
			} else if (list.length == 2) {
				prettyList += ' ' + andor;
			} else if (item == list.length-2) {
				prettyList += ', ' + andor;
			} else {
				prettyList += ',';
			};
		};
		return prettyList;
	},
	
	prettyNumber: function(integer) {
		var result = integer;
		if (integer < 0) {
			var sign = 'negative ';
			integer = Math.abs(integer);
		};
		if (integer < 20) {
			result = ["zero","one","two","three",'four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'][integer];
		} else {
			result = result.toString();
		};
		if (sign !== undefined) {
			result = sign + result;
		};
		return result;
	},
	
	compressNumber: function(number) {
		var significantDigits = number;
		var initial = '';
		var rounding = 1;
		if (number > 1000000000) {
			significantDigits = number/1000000000;
			initial = "b";
		} else if (number > 1000000) {
			significantDigits = number/1000000;
			initial = "m";
		} else if (number > 1000) {
			significantDigits = number/1000;
			initial = "k";
		};
		if (number < 1) {
			rounding = 1000;
		} else if (number < 10) {
			rounding = 100;
		} else if (number < 100) {
			rounding = 10
		};
		significantDigits = Math.floor(significantDigits*rounding)/rounding;
		return significantDigits + initial;
	},
	
	pj: function() {
		return "<span class='currencySpan petajouleSpan'>PJ</span>";
	},
	
	mj: function() {
		return "<span class='currencySpan megajouleSpan'>MJ</span>";
	},

	gameDivContents: function() {
	
		var rightDiv = document.createElement('div');
		rightDiv.id = 'rightDiv';
	
		var clockDiv = document.createElement('div');
		clockDiv.id = 'clockDiv';
		clockDiv.className = 'topDiv';
		rightDiv.appendChild(clockDiv);
	
		var detailsDiv = document.createElement('div');
		detailsDiv.id = 'detailsDiv';
		rightDiv.appendChild(detailsDiv);
		
		var leftDiv = document.createElement('div');
		leftDiv.id = 'leftDiv';
	
		var navDiv = document.createElement('div');
		navDiv.id = 'navDiv';
		navDiv.className = 'topDiv';
		leftDiv.appendChild(navDiv);
	
		var hqDiv = document.createElement('div');
		hqDiv.id = 'hqDiv';
		leftDiv.appendChild(hqDiv);
	
		var planetMapDiv = document.createElement('div');
		planetMapDiv.id = 'planetMapDiv';
		leftDiv.appendChild(planetMapDiv);
						
		return [rightDiv,leftDiv];
	},
	
	updateClock: function() {
		var clockDiv = document.getElementById('clockDiv');
		clockDiv.innerHTML = '';
		if (game !== undefined) {
			var clockSpan = document.createElement('span');
			clockSpan.id = 'clockSpan';
			clockSpan.innerHTML =
				['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][game.clock.time.getMonth()] + ' ' +
				game.clock.time.getDate() + ', ' + 
				game.clock.time.getFullYear()
				;
			clockDiv.appendChild(clockSpan);

			var clockSpeedSlider = document.createElement('input');
			clockSpeedSlider.id = 'clockSpeedSlider';
			clockSpeedSlider.setAttribute('type','range');
			clockSpeedSlider.setAttribute('min',1);
			clockSpeedSlider.setAttribute('max',100);
			clockSpeedSlider.setAttribute('value',10000/game.clock.tick);
			clockSpeedSlider.setAttribute('onchange','handlers.setClockSpeed()');
			clockDiv.appendChild(clockSpeedSlider);

		};
		var clockPauseBtn = document.createElement('span');
		clockPauseBtn.id = 'clockPauseBtn';
		if (game !== undefined && game.clock.running) {
			clockPauseBtn.className = 'fa fa-pause';
		} else {
			clockPauseBtn.className = 'fa fa-play';
		};
		clockPauseBtn.setAttribute('onclick','handlers.clockPause()');
		clockDiv.appendChild(clockPauseBtn);
	},
	
	initPlanetMaps: function() {
	
		// Navigation Div
		var navDiv = document.getElementById('navDiv');
		navDiv.innerHTML = '';
		
		var hqSpan = document.createElement('span');
		hqSpan.innerHTML = " HQ ";
		navDiv.appendChild(hqSpan);
		hqSpan.addEventListener('click',view.displayFaction.bind(this,game.p1));

		for (var planetKey in game.planets) {
			var planetSpan = document.createElement('span');
			planetSpan.innerHTML = " " + view.capitalize(planetKey) + " ";
			navDiv.appendChild(planetSpan);
			planetSpan.addEventListener('click',view.displayPlanetMap.bind(this,planetKey));
		};
		
		// Planet Maps
		var planetMapDiv = document.getElementById('planetMapDiv');
		for (var planetKey in game.planets) {
			var div = document.createElement('div');
			div.id = planetKey + "MapDiv";
			planetMapDiv.appendChild(div);
			div.style.display = 'none';
			
// 			var img = document.createElement('img');
// 			img.className = 'planetMap';
// 			div.appendChild(img);
// 			img.src = "img/" + planetKey + ".jpg";
			
			var mapSVG = document.createElementNS('http://www.w3.org/2000/svg','svg');
			mapSVG.id = planetKey+"MapSVG";
			mapSVG.className = 'mapSVG';
			div.appendChild(mapSVG);
			mapSVG.setAttribute('viewBox','-180,-90,360,210');

			var rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
			mapSVG.appendChild(rect);
			rect.setAttribute('x',-180);
			rect.setAttribute('y',-90);
			rect.setAttribute('width',360);
			rect.setAttribute('height',180);
			rect.setAttribute('fill','green');

			var orbitRect = document.createElementNS('http://www.w3.org/2000/svg','rect');
			mapSVG.appendChild(orbitRect);
			orbitRect.setAttribute('x',-180);
			orbitRect.setAttribute('y',90);
			orbitRect.setAttribute('width',360);
			orbitRect.setAttribute('height',30);
			orbitRect.setAttribute('fill','black');
			orbitRect.setAttribute('stroke','white');
			
			var mapImage = document.createElementNS('http://www.w3.org/2000/svg','image');
			mapSVG.appendChild(mapImage);
			view.setHref(mapImage,'img/'+planetKey+".jpg",true);
			mapImage.setAttribute('x',-180);
			mapImage.setAttribute('y',-90);
			mapImage.setAttribute('width',360);
			mapImage.setAttribute('height',180);
			
			var planetLabel = document.createElementNS('http://www.w3.org/2000/svg','text');
			mapSVG.appendChild(planetLabel);
			planetLabel.setAttribute('x',-175);
			planetLabel.setAttribute('y',-72);
			planetLabel.setAttribute('fill','white');
			planetLabel.setAttribute('stroke','black');
			planetLabel.setAttribute('stroke-width',5);
			planetLabel.setAttribute('paint-order','stroke');
			planetLabel.setAttribute('class','scifiHead');
			planetLabel.innerHTML = view.capitalize(game.planets[planetKey].id);
			
			var orbitLabel = document.createElementNS('http://www.w3.org/2000/svg','text');
			mapSVG.appendChild(orbitLabel);
			orbitLabel.setAttribute('x',-175);
			orbitLabel.setAttribute('y',100);
			orbitLabel.setAttribute('fill','white');
			orbitLabel.setAttribute('stroke','black');
			orbitLabel.setAttribute('stroke-width',5);
			orbitLabel.setAttribute('paint-order','stroke');
			orbitLabel.setAttribute('font-size','8');
			orbitLabel.setAttribute('class','scifiHead');
			orbitLabel.innerHTML = "Orbit:";
			
			for (var territory of game.planets[planetKey].territories) {
				var territoryGroup = document.createElementNS('http://www.w3.org/2000/svg','g');
				territoryGroup.id = 'territory'+territory.name+'Group';
				mapSVG.appendChild(territoryGroup);
// 				territoryGroup.addEventListener('click',view.displayTerritory.bind(this,territory));
				territoryGroup.addEventListener('mouseenter',view.displayTerritory.bind(this,territory));
				territoryGroup.addEventListener('mouseleave',view.clearDetails);
				territoryGroup.setAttribute('fill',game.factions[territory.inControl].color);
				
				var totalBarWidth = 20;
				var factionControlRect = document.createElementNS('http://www.w3.org/2000/svg','rect');
				factionControlRect.setAttribute('x',territory.x - totalBarWidth / 2);
				factionControlRect.setAttribute('y',territory.y + 2);
				factionControlRect.setAttribute('width',totalBarWidth);
				factionControlRect.setAttribute('height',2);
				factionControlRect.setAttribute('fill','black');
				factionControlRect.setAttribute('stroke','black');
				factionControlRect.setAttribute('stroke-width',1);
				territoryGroup.appendChild(factionControlRect);
				var totalOffset = 0;
				var territorySupport = territory.getSupport();
				for (var factionKey in territorySupport) {
					if (territorySupport[factionKey] > 0) {
						var barWidth = totalBarWidth * territory.getSupportPercentage(factionKey);
						var factionControlRect = document.createElementNS('http://www.w3.org/2000/svg','rect');
						factionControlRect.setAttribute('x',totalOffset + territory.x - totalBarWidth / 2);
						factionControlRect.setAttribute('y',territory.y + 2);
						factionControlRect.setAttribute('width',barWidth);
						factionControlRect.setAttribute('height',2);
						factionControlRect.setAttribute('fill',game.factions[factionKey].color);
						factionControlRect.setAttribute('stroke-width',0);
						territoryGroup.appendChild(factionControlRect);
						totalOffset += barWidth;
					};
				};
				
				var label = document.createElementNS('http://www.w3.org/2000/svg','text');
				territoryGroup.appendChild(label);
				label.setAttribute('x',territory.x);
				label.setAttribute('y',territory.y+2);
				label.setAttribute('font-size',5);
				label.setAttribute('text-anchor','middle');
				label.setAttribute('stroke','black');
				label.setAttribute('stroke-width',2);
				label.setAttribute('paint-order','stroke');
				label.innerHTML = territory.name;
			};
		};
		
	},
	
	hidePlanetMaps: function() {
		for (var key in game.planets) {
			var div = document.getElementById(key+"MapDiv");
			div.style.display = 'none';
		};
		document.getElementById('hqDiv').innerHTML = '';
		document.getElementById('hqDiv').style.display = 'none';
	},
	
	displayPlanetMap: function(planetKey) {
		view.hidePlanetMaps();
		var div = document.getElementById(planetKey+"MapDiv");
		div.style.display = 'block';
		document.getElementById('detailsDiv').innerHTML = '';
	},
	
	clearDetails: function() {
		document.getElementById('detailsDiv').innerHTML = '';
	},
	
	displayTerritory: function(territory) {
		console.log(territory);
		
		view.clearDetails();
		var detailsDiv = document.getElementById('detailsDiv');
		
		var h1 = document.createElement('h1');
		h1.innerHTML = territory.name;
		detailsDiv.appendChild(h1);
		
		var populationDiv = view.displayPopulation(territory.population,territory.inControl);
		detailsDiv.appendChild(populationDiv);
		
		var approvalDiv = document.createElement('div');
		detailsDiv.appendChild(approvalDiv);
		approvalDiv.innerHTML = "Approval Rating: " + 69 + "%";
		
		var supportHead = document.createElement('h2');
		supportHead.innerHTML = 'Support';
		detailsDiv.appendChild(supportHead);
		var ul = document.createElement('ul');
		detailsDiv.appendChild(ul);
		var supportArray = [];
		var territorySupport = territory.getSupport();
		supportArray = Object.keys(territorySupport);
		supportArray.sort(function(a,b) {
			return territorySupport[b] - territorySupport[a];
		});
		for (factionKey of supportArray) {
			var li = document.createElement('li');
			ul.appendChild(li);
			var controlSpan = document.createElement('span');
			controlSpan.innerHTML = game.factions[factionKey].name;
			controlSpan.setAttribute('style','color: '+game.factions[factionKey].color);
			li.appendChild(controlSpan);
			li.innerHTML += " " + Math.floor(territorySupport[factionKey]) + " ";
			li.addEventListener('click',view.displayFaction.bind(this,factionKey));
		};

		var productionHead = document.createElement('h2');
		productionHead.innerHTML = 'Industries';
		detailsDiv.appendChild(productionHead);
		var ul = document.createElement('ul');
		detailsDiv.appendChild(ul);
		for (var commodityKey in territory.industries) {
			if (territory.production(commodityKey) > 0) {
				var li = document.createElement('li');
				li.innerHTML = defaultCommodities[commodityKey].name + " " + view.compressNumber(territory.production(commodityKey));
				ul.appendChild(li);
			};
		};
		if (territory.inControl == game.p1) {
			var newLi = document.createElement('li');
			ul.appendChild(newLi);
			var newIndustryBtn = document.createElement('button');
			newIndustryBtn.innerHTML = "New Industry";
			newLi.appendChild(newIndustryBtn);
		};

		var militaryHead = document.createElement('h2');
		militaryHead.innerHTML = 'Military';
		detailsDiv.appendChild(militaryHead);
	},
	
	displayPlanetAndTerritory: function(territory) {
		view.displayPlanetMap(territory.planet);
		view.displayTerritory(territory);
	},
	
	displayFaction: function(factionKey) {
		view.focus.faction = factionKey;
		
		view.hidePlanetMaps();
		view.clearDetails();
		
		var hqDiv = document.getElementById('hqDiv');
		hqDiv.innerHTML = '';
		hqDiv.style.display = 'block';
		
		var hqHead = document.createElement('h1');
		hqHead.innerHTML = game.factions[factionKey].name;
		hqDiv.appendChild(hqHead);
	
		var territoriesHead = document.createElement('h2');
		hqDiv.appendChild(territoriesHead);
		territoriesHead.innerHTML = 'Territories';

		var adminArray = game.factions[factionKey].administrating();
		var adminHead = document.createElement('h3');
		hqDiv.appendChild(adminHead);
		adminHead.innerHTML = 'Administrating';
		if (adminArray.length == 0) {
			var adminP = document.createElement('p');
			hqDiv.appendChild(adminP);
			if (factionKey == game.p1) {
				adminP.innerHTML = 'We';
			} else {
				adminP.innerHTML = 'They';
			};
			adminP.innerHTML += ' do not have administrative control of any territories.';
			adminP.className = 'indented';
		} else {
			var adminDiv = document.createElement('div');
			hqDiv.appendChild(adminDiv);
			adminDiv.className = 'territoriesDiv';
			for (var territory of adminArray) {
				var territoryDiv = document.createElement('div');
				territoryDiv.className = 'territoryDiv';
				adminDiv.appendChild(territoryDiv);
				territoryDiv.innerHTML = game.territories[territory].name;
				territoryDiv.innerHTML += " 69%";
				territoryDiv.addEventListener('mouseenter',view.displayTerritory.bind(this,game.territories[territory]));
				territoryDiv.addEventListener('mouseleave',view.clearDetails);
				territoryDiv.addEventListener('click',view.displayPlanetAndTerritory.bind(this,game.territories[territory]));
			};

			var populationDiv = view.displayPopulation(game.factions[factionKey].population(),factionKey);
			hqDiv.appendChild(populationDiv);
			populationDiv.className = 'indented';

		};
		
		var influenceArray = game.factions[factionKey].influencing();
		if (influenceArray.length > 0) {
			var influenceHead = document.createElement('h3');
			hqDiv.appendChild(influenceHead);
			influenceHead.innerHTML = 'Influence In';
			var influenceDiv = document.createElement('div');
			hqDiv.appendChild(influenceDiv);
			influenceDiv.className = 'territoriesDiv';
			for (var territory of influenceArray) {
				var territoryDiv = document.createElement('div');
				territoryDiv.className = 'territoryDiv';
				influenceDiv.appendChild(territoryDiv);
				territoryDiv.innerHTML = game.territories[territory].name;
				territoryDiv.addEventListener('mouseenter',view.displayTerritory.bind(this,game.territories[territory]));
				territoryDiv.addEventListener('mouseleave',view.clearDetails);
				territoryDiv.addEventListener('click',view.displayPlanetAndTerritory.bind(this,game.territories[territory]));
			};
		};

		var treasuryP = document.createElement('p');
		hqDiv.appendChild(treasuryP);
		treasuryP.id = 'treasuryP';
		view.updateTreasury();
		
		var industriesHead = document.createElement('h2');
		hqDiv.appendChild(industriesHead);
		industriesHead.innerHTML = 'Industries';
		var industriesTable = document.createElement('table');
		hqDiv.appendChild(industriesTable);
		industriesTable.id = 'industriesTable';
		view.updateIndustryDisplay(factionKey);
				
		var tradeHead = document.createElement('h2');
		hqDiv.appendChild(tradeHead);
		tradeHead.innerHTML = "Trade Agreements";
		
		var classSummary = game.factions[view.focus.faction].classSummary();
		if (Object.keys(classSummary).length > 0) {
			var classHead = document.createElement('h2');
			hqDiv.appendChild(classHead);
			classHead.innerHTML = 'Society Status';
			var classTable = document.createElement('table');
			hqDiv.appendChild(classTable);
			for (classKey in classSummary) {
				var tr = document.createElement('tr');
				classTable.appendChild(tr);
				tr.addEventListener('mouseenter',view.displayClass.bind(this,classKey));
				tr.addEventListener('mouseleave',view.clearDetails);
				var td = document.createElement('td');
				tr.appendChild(td);
				td.innerHTML = defaultClasses[classKey].name;
				var td = document.createElement('td');
				tr.appendChild(td);
				td.innerHTML = view.compressNumber(classSummary[classKey].size);
				var livingtd = document.createElement('td');
				tr.appendChild(livingtd);
				if (classKey !== 'enslaved') {
					livingtd.innerHTML = classSummary[classKey].livingStandard.name;
				};
				var effectstd = document.createElement('td');
				tr.appendChild(effectstd);
				effectstd.innerHTML = "";
				if (defaultClasses[classKey].production > 0) {
					effectstd.innerHTML += "x" + view.compressNumber(classSummary[classKey].size * defaultClasses[classKey].production) + " Labor ";
				};
				if (defaultClasses[classKey].interest > 0) {
					effectstd.innerHTML += Math.floor(100*Math.pow((1 + classSummary[classKey].size * defaultClasses[classKey].interest / 100000000000),365))/100 + "% APR ";
				};
			};
		
		};
		
	},
	
	displayPopulation: function(population,factionKey) {
		var div = document.createElement('div');
		div.innerHTML = "Population: ";
		div.innerHTML += view.compressNumber(population.human) + " humans";
		if (population.alien > 0) {
			div.innerHTML += " and " + view.compressNumber(population.alien) + " aliens";
		};
		div.innerHTML += " supported by " + view.compressNumber(population.ai) + " AI";
		return div;
	},
	
	updateTreasury: function() {
		var treasuryP = document.getElementById('treasuryP');
		if (treasuryP) {
			treasuryP.innerHTML = "Treasury: " + Math.floor(game.factions[view.focus.faction].treasury) + view.pj();
		};
	},
	
	updateIndustryDisplay: function(factionKey) {
		var industriesTable = document.getElementById('industriesTable'), effect;
		if (industriesTable) {
			industriesTable.innerHTML = '';
			var tr = document.createElement('tr');
			industriesTable.appendChild(tr);
			for (var head of ['','annual production','current price','tax revenue','']) {
				var td = document.createElement('td');
				tr.appendChild(td);
				td.innerHTML = head;
			};
			var productionList = game.factions[factionKey].production();
			for (var commodityKey in productionList) {
				if (productionList[commodityKey] !== 0) {
					var tr = document.createElement('tr');
					industriesTable.appendChild(tr);
					tr.addEventListener('mouseenter',view.displayIndustry.bind(this,commodityKey));
					tr.addEventListener('mouseleave',view.clearDetails);
					var td = document.createElement('td');
					tr.appendChild(td);
					td.innerHTML = game.commodities[commodityKey].name + ": ";
					var td = document.createElement('td');
					tr.appendChild(td);
					td.innerHTML += view.compressNumber(productionList[commodityKey]);
					var td = document.createElement('td');
					tr.appendChild(td);
					td.innerHTML += view.compressNumber(game.factions[factionKey].price(commodityKey)) + view.pj();
					
					var td = document.createElement('td');
					tr.appendChild(td);
					td.innerHTML = view.compressNumber( game.factions[factionKey].taxRevenue(commodityKey) ) + view.pj();

					var td = document.createElement('td');
					tr.appendChild(td);
					td.className = 'industryEffects';
					effect = "";
					if (game.commodities[commodityKey].luxury) {
						effect = "luxury good";
					} else if (game.commodities[commodityKey].boosts !== undefined) {
						var boostArray = [];
						for (var boost of game.commodities[commodityKey].boosts) {
							boostArray.push(game.commodities[boost].name);
						};
						effect = "boosts " + gamen.prettyList(boostArray);
					};
					td.innerHTML += effect;
				};
			};
		} else {
			var noIndustriesP = document.createElement('p');
			noIndustriesP.innerHTML = "This faction does not control any industries.";
		};

	},
	
	displayIndustry: function(commodityKey) {
		
		view.clearDetails();
		var detailsDiv = document.getElementById('detailsDiv');
		
		var head = document.createElement('h1');
		detailsDiv.appendChild(head);
		head.innerHTML = game.commodities[commodityKey].name + " Industry";
		
		var productionP = document.createElement('p');
		detailsDiv.appendChild(productionP);
		productionP.innerHTML = "Production: " + view.compressNumber(game.factions[view.focus.faction].production()[commodityKey]) + " units annually";
		
		var grossRevP = document.createElement('p');
		detailsDiv.appendChild(grossRevP);
		grossRevP.innerHTML = "Gross Revenue: " + view.compressNumber(game.factions[view.focus.faction].grossRevenue(commodityKey)) + view.pj() + " daily";
		var taxRevP = document.createElement('p');
		detailsDiv.appendChild(taxRevP);
		taxRevP.innerHTML = "Tax Revenue: " + view.compressNumber(game.factions[view.focus.faction].taxRevenue(commodityKey)) + view.pj() + " daily";
	
		var legalitiesP = document.createElement('p');
		detailsDiv.appendChild(legalitiesP);
		var regulation = game.factions[view.focus.faction].industries[commodityKey].regulation;
		legalitiesP.innerHTML = "This industry is "+regulation;
		if (regulation !== 'illegal' && regulation !== 'centrally managed') {
			legalitiesP.innerHTML += " and taxed at "+game.factions[view.focus.faction].industries[commodityKey].taxRate*100+"%";
		};
		legalitiesP.innerHTML += ".";
		
		var producingHead = document.createElement('h2');
		detailsDiv.appendChild(producingHead);
		producingHead.innerHTML = "Producing In:";
		var ul = document.createElement('ul');
		detailsDiv.appendChild(ul);
		var territory;
		for (var territoryKey in game.territories) {
			territory = game.territories[territoryKey];
			if (territory.inControl == view.focus.faction && territory.industries[commodityKey] > 0) {
				var li = document.createElement('li');
				ul.appendChild(li);
				li.innerHTML = territory.name + " (" + view.compressNumber(territory.production(commodityKey)) + ")";
			};
		};
		
		if (game.factions[view.focus.faction].industries[commodityKey].boosts > 0) {
			var p = document.createElement('p');
			detailsDiv.appendChild(p);
			var boostLevel = Math.floor(100*game.factions[view.focus.faction].industries[commodityKey].boosts / game.factions[view.focus.faction].industries[commodityKey].lastProduction);
			if (boostLevel > 1) {boostLevel = "to the maximum of 100"};
			p.innerHTML = "Production boosted " + boostLevel + "% by domestic synergies.";
		};
		
		if (game.commodities[commodityKey].luxury) {
			var p = document.createElement('p');
			detailsDiv.appendChild(p);
			p.innerHTML = "As "+game.commodities[commodityKey].name+" is a luxury, access to this commodity increases support for your administration in all territories you control.";
		} else if (game.commodities[commodityKey].boosts !== undefined) {
			var p = document.createElement('p');
			detailsDiv.appendChild(p);
			var boostsArray = [];
			for (var boostCommodity of game.commodities[commodityKey].boosts) {
				boostsArray.push(game.commodities[boostCommodity].name);
			};
			p.innerHTML = game.commodities[commodityKey].name + " is industrially useful to the "+gamen.prettyList(boostsArray)+" industries, and boosts their production.";
		};
	},
	
	displayClass: function(classKey) {
	
		var classSummary = game.factions[view.focus.faction].classSummary(classKey);
		
		view.clearDetails();
		var detailsDiv = document.getElementById('detailsDiv');
		
		var head = document.createElement('h1');
		detailsDiv.appendChild(head);
		head.innerHTML = defaultClasses[classKey].name;
		
		var description = document.createElement('p');
		detailsDiv.appendChild(description);
		description.innerHTML = defaultClasses[classKey].description;
		
		if (classKey == 'enslaved') {
		
			var popP = document.createElement('p');
			detailsDiv.appendChild(popP);
			popP.innerHTML = "AI in Operation: " + view.compressNumber(classSummary.size);
		
		} else {
			var popP = document.createElement('p');
			detailsDiv.appendChild(popP);
			popP.innerHTML = "Population: " + view.compressNumber(classSummary.size);
		
			var percentagesP = document.createElement('p');
			detailsDiv.appendChild(percentagesP);
			percentagesP.innerHTML = "The " + defaultClasses[classKey].name + " comprises " + Math.floor(classSummary.popPercentage*100) + "% of the population and control " + Math.floor(100*classSummary.wealth) + "% of their society's wealth.";
			
			var typicalIncomeP = document.createElement('p');
			detailsDiv.appendChild(typicalIncomeP);
			var commoditiesList = [];
			for (var commodityKey of classSummary.livingStandard.commodities) {
				commoditiesList.push(game.commodities[commodityKey].name);
			};
			typicalIncomeP.innerHTML = "The typical income in this population is " + classSummary.typicalIncome.toLocaleString() + view.pj() + ". This affords a "+classSummary.livingStandard.name+" living standard, including access to "+view.prettyList(commoditiesList)+".";
		
			var supportArray = [];
			supportArray = Object.keys(classSummary.support);
			supportArray.sort(function(a,b) {
				return classSummary.support[b] - classSummary.support[a];
			});
			var supportHead = document.createElement('h2');
			detailsDiv.appendChild(supportHead);
			supportHead.innerHTML = 'Support';
			var ul = document.createElement('ul');
			detailsDiv.appendChild(ul);
			for (var factionKey of supportArray) {
				if (classSummary.support[factionKey] > 0) {
					var li = document.createElement('li');
					ul.appendChild(li);
					var factionSpan = document.createElement('span');
					factionSpan.innerHTML = game.factions[factionKey].name;
					factionSpan.setAttribute('style','color: '+game.factions[factionKey].color);
					li.appendChild(factionSpan);
					li.innerHTML += " " + Math.floor(classSummary.support[factionKey] * defaultClasses[classKey].organization);
				};
			};
		};
	},
	
};

window.onresize = function(event) {view.windowResize();};
