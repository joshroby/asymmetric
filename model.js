var game;
function Game() {

	this.clock = new Clock(new Date('Jan 1, 2500'));
	gamen.clocks = [this.clock];
	this.clock.timeStep = 8.64e+7;
	this.clock.logEventIn(8.64e+7,'eachDay');
	this.clock.logEventIn(8.64e+7*10*Math.random(),'randomEvent');
	view.updateClock();
	
	this.p1 = undefined;
	
	this.commodities = defaultCommodities;
	this.solarMarket = {};
	for (var commodityKey in this.commodities) {
		this.solarMarket[commodityKey] = 0;
	};
	
	this.factions = {};
	var humanFactions = [];
	for (var id in defaultFactions) {
		var newFaction = new Faction(id,this.commodities);
		this.factions[id] = newFaction;
		if (newFaction.human) {
			humanFactions.push(id);
		};
	};
	this.p1 = humanFactions[humanFactions.length * Math.random() << 0];
	this.p1 = 'unitedNations';

	this.planets = {};
	
	this.territories = {};
	for (var id in defaultTerritories) {
		newTerritory = new Territory(id,this.factions);
		newTerritory.updateControl();
		this.territories[id] = newTerritory;
		if (this.planets[newTerritory.planet] == undefined) {
			this.planets[newTerritory.planet] = new Planet(newTerritory.planet);
		};
		this.planets[newTerritory.planet].territories.push(newTerritory);
	};
	
	this.eachDay = function() {
		
		this.clock.logEventIn(8.64e+7,'eachDay');
		
		view.updateClock();
		
		// Solar Market
		for (var commodityKey in this.commodities) {
			this.solarMarket[commodityKey] = 0;
		};
// 		this.solarPopulation = {human:0,ai:0,alien:0};
		for (var factionKey in game.factions) {
// 			game.factions[factionKey].updateBoosts();
			game.factions[factionKey].economicActivity();
			factionPopulation = game.factions[factionKey].population();
// 			for (var type in factionPopulation) {
// 				this.solarPopulation[type] += factionPopulation[type];
// 			};
		};
// 		this.solarPopulation.consumers = this.solarPopulation.human + this.solarPopulation.ai + this.solarPopulation.alien;
		
		var solarEnergySupply = this.solarMarket.energy;
		for (var commodity in this.solarMarket) {
			if (this.solarMarket[commodity] == 0) {
				this.solarMarket[commodity] = Infinity;
			} else {
// 				this.solarMarket[commodity] = this.solarPopulation.consumers / this.solarMarket[commodity];
				this.solarMarket[commodity] = solarEnergySupply / this.solarMarket[commodity];
			};
		};
		this.solarMarket.energy = 1;
		for (var factionKey in game.factions) {
			game.factions[factionKey].GDP();
		};
	};
	
};

function Faction(id,commoditiesList) {
	this.id = id;
	var template = defaultFactions[id];
	
	this.name = template.name;
	this.human = template.human;
	this.color = template.color;
	
	this.characteristics = {};
	if (template.characteristics !== undefined) {
		for (var characteristic in template.characteristics) {
			this.characteristics[characteristic] = template.characteristics[characteristic];
		};
	} else {
		var total = 0;
		for (characteristic of ['authority','care','fairness','liberty','loyalty','purity']) {
			var num = Math.random();
			this.characteristics[characteristic] = num;
			total += num;
		};
		for (characteristic in this.characteristics) {
			this.characteristics[characteristic] /= total/3;
		};
	};
	
	this.classes = {};
	var totalSize = 0, totalWealth = 0;
	for (var classKey in template.classes) {
		totalSize += template.classes[classKey].size;
		totalWealth += template.classes[classKey].wealth;
	};
	for (var classKey in template.classes) {
		this.classes[classKey] = {};
		this.classes[classKey].size = template.classes[classKey].size / totalSize;
		this.classes[classKey].wealth = template.classes[classKey].wealth / totalWealth;
	};
	for (var classKey in this.classes) {
		this.classes[classKey].name = defaultClasses[classKey].name;
		this.classes[classKey].organization = defaultClasses[classKey].organization;
		this.classes[classKey].production = defaultClasses[classKey].production;
		this.classes[classKey].interest = defaultClasses[classKey].interest;
	};
	
	this.treasury = template.treasury;
	this.industries = {};
	for (var commodityKey in commoditiesList) {
		this.industries[commodityKey] = {
			boosts: 0,
			localPrice: 0,
			taxRate: template.defaultTaxRate,
			regulation: template.defaultRegulation,
		};
	};
	
	this.tradeAgreements = [];
	
	var factionList = Object.keys(defaultFactions);;
	if (template.human) {
		this.contacts = [];
		for (var factionKey of factionList) {
			this.contacts.push(factionKey);
		};
	} else {
		this.contacts = [];
	};
	
	// functions
	
	this.displayCharacteristics = function() {
		var string = this.name, total = 0;
		for (var characteristic in this.characteristics) {
			total += this.characteristics[characteristic];
		};
		string += ": " + total;
		console.log(string);
	};
	
	this.administrating = function() {
		var adminArray = [];
		for (var territory in game.territories) {
			if (game.territories[territory].inControl == this.id) {
				adminArray.push(territory);
			};
		};
		return adminArray.sort();
	};
	
	this.influencing = function() {
		var influenceArray = [];
		for (var territory in game.territories) {
			for (var classKey in game.territories[territory].classes) {
				if (influenceArray.indexOf(territory) == -1 && game.territories[territory].classes[classKey].support[this.id] > 0 && game.territories[territory].inControl !== this.id) {
					influenceArray.push(territory);
				};
			};
		};
		return influenceArray.sort();
	};
	
	this.population = function() {
		var adminArray = this.administrating();
		var factionPopulation = {human:0,ai:0,alien:0};
		for (var territoryKey of adminArray) {
			for (var group in game.territories[territoryKey].population) {
				factionPopulation[group] += game.territories[territoryKey].population[group];
			};
		};
		return factionPopulation;
	};
	
	this.classSummary = function(singleClassKey) {
		var summary = {};
		var adminArray = this.administrating();
		for (var territoryKey of adminArray) {
			for (var classKey in game.territories[territoryKey].classes) {
				if (summary[classKey] == undefined && game.territories[territoryKey].classes[classKey].size > 0) {
					summary[classKey] = {};
					summary[classKey].count = 1;
					summary[classKey].size = game.territories[territoryKey].classes[classKey].size;
					summary[classKey].wealth = game.territories[territoryKey].classes[classKey].wealth;
				} else if (summary[classKey] !== undefined) {
					summary[classKey].count++;
					summary[classKey].size += game.territories[territoryKey].classes[classKey].size;
					summary[classKey].wealth += game.territories[territoryKey].classes[classKey].wealth;
				};
				if (summary[classKey] !== undefined) {
					summary[classKey].support = {};
					for (factionKey in game.territories[territoryKey].classes[classKey].support) {
						if (summary[classKey].support[factionKey] == undefined) {
							summary[classKey].support[factionKey] = game.territories[territoryKey].classes[classKey].support[factionKey];
						} else {
							summary[classKey].support[factionKey] += game.territories[territoryKey].classes[classKey].support[factionKey];
						};
					};
				};
			};
		};
		var thresholds = this.livingStandardThresholds();
		for (classKey in summary) {
			summary[classKey].wealth /= summary[classKey].count;
			summary[classKey].popPercentage = summary[classKey].size / this.population().human;
			summary[classKey].typicalIncome = Math.floor(this.GDP() * 365 * summary[classKey].wealth / summary[classKey].size);
			summary[classKey].livingStandard = {name:'starving',threshold:-Infinity};
			for (var i=0;i<thresholds.length;i++) {
				if (summary[classKey].typicalIncome > thresholds[i].num) {
					summary[classKey].livingStandard = thresholds[i];
				};
			};
		};
		if (singleClassKey !== undefined) {
			summary = summary[singleClassKey];
		};
		return summary;
	};
	
	this.production = function() {
		var adminArray = this.administrating();
		var productionList = {};
		for (var territoryKey of adminArray) {
			for (var commodityKey in game.territories[territoryKey].industries) {
				if (productionList[commodityKey] == undefined) {
					productionList[commodityKey] = game.territories[territoryKey].production(commodityKey);
				} else {
					productionList[commodityKey] += game.territories[territoryKey].production(commodityKey);
				};
			};
		};
		// Boosts
// 		for (commodityKey in productionList) {
// 			if (productionList[commodityKey] > 0) {
// 				productionList[commodityKey] *= Math.min(2,1 + this.industries[commodityKey].boosts / productionList[commodityKey]);
// 			};
// 		};

		return productionList;
	};
	
	this.updateBoosts = function() {
// 		for (var commodityKey in this.industries) {
// 			this.industries[commodityKey].boosts = 0;
// 		};
// 		for (var commodityKey in this.industries) {
// 			if (game.commodities[commodityKey].boosts !== undefined) {
// 				for (var suppliedIndustry of game.commodities[commodityKey].boosts) {
// 					this.industries[suppliedIndustry].boosts += this.industries[commodityKey].lastProduction;
// 				};
// 			};
// 		};
// 		for (var commodityKey in this.industries) {
// 			this.industries[commodityKey].lastProduction = this.production()[commodityKey];
// 		};
	};
	
	this.economicActivity = function() {
		var productionList = this.production();
		var factionPopulation = this.population();
		var energySupply = productionList.energy;
		
		// Trades out of Faction
		// TK
		
		for (var commodityKey in productionList) {
			if (productionList[commodityKey] > 0) {
				game.solarMarket[commodityKey] += productionList[commodityKey];
			};
			this.industries[commodityKey].localPrice = energySupply / productionList[commodityKey];
		};
	};
	
	this.price = function(commodityKey) {
		return Math.min(this.industries[commodityKey].localPrice,game.solarMarket[commodityKey]);
	};
	
	this.GDP = function() {
		var total = 0, lowestPrice;
		var productionList = this.production();
		for (var commodityKey in productionList) {
			if (productionList[commodityKey] > 0) {
				lowestPrice = Math.min(game.solarMarket[commodityKey],this.industries[commodityKey].localPrice);
				total += lowestPrice * productionList[commodityKey] / 365;
			};
		};
		return total;
	};
	
	this.grossRevenue = function(commodityKey) {
		var price = Math.min(game.solarMarket[commodityKey],this.industries[commodityKey].localPrice);
		return this.production()[commodityKey] * price / 365;
	};
	
	this.taxRevenue = function(commodityKey) {
		var commodityList = [], total = 0;
		if (commodityKey == undefined) {
			commodityList = Object.keys(this.production());
		} else {
			commodityList = [commodityKey];
		};
		for (var commodityKey of commodityList) {
			total += this.grossRevenue(commodityKey) * this.industries[commodityKey].taxRate;
		};
		return total;
	};
	
	this.livingStandardThresholds = function() {
		var thresholds = [];
		thresholds[0] = {name:'subsistence',num:this.price('water') + this.price('food'),commodities:['water','food']};
		thresholds[1] = {name:'healthy',num:thresholds[0].num + this.price('pharmaceuticals'),commodities:['water','food','pharmaceuticals']};
		var luxuriesPrices = {},luxuriesArray = [];
		var luxuryNames = ['comfortable','pleasant','extravagant','lavish','pampered','opulent','sybaritic'];
		for (var commodityKey in game.commodities) {
			if (game.commodities[commodityKey].luxury) {
				luxuriesArray.push(commodityKey);
				luxuriesPrices[commodityKey] = Math.min(game.solarMarket[commodityKey],this.industries[commodityKey].localPrice);
			};
		};
		luxuriesArray.sort(function(a,b) {return luxuriesPrices[a] - luxuriesPrices[b];});
		for (var i=0;i<luxuriesArray.length;i++) {
			thresholds[2+i] = {};
			thresholds[2+i].name = luxuryNames[i] + " ["+(i+1)+"]";
			thresholds[2+i].num = thresholds[1+i].num+luxuriesPrices[luxuriesArray[i]];
			thresholds[2+i].commodities = [];
			for (commodity of thresholds[1+i].commodities) {
				thresholds[2+i].commodities.push(commodity);
			};
			thresholds[2+i].commodities.push(luxuriesArray[i]);
		};
		return thresholds;
	};
	
	this.createTradeAgreement = function(partner,giveList,receiveList,endDate) {
		var agreement = {
			a: this.id,
			aGets: giveList,
			b: partner.id,
			bGets: receiveList,
			endDate: endDate,
		};
		this.tradeAgreements.push(agreement);
		partner.tradeAgreements.push(agreement);
	};
	
	this.tick = function() {
		this.treasury += this.production().energy;
		
		// update views
		if (this.id == view.focus.faction) {
			view.updateIndustryDisplay(view.focus.faction);
			view.updateTreasury();
		};
	};
};

function Territory(id,factions) {
	this.id = id;
	var template = defaultTerritories[id];
	
	this.planet = template.planet;
	this.x = template.longitude - 180;
	this.y = template.latitude;
	
	this.name = template.name;
	
	this.population = {};
	for (var group in template.population) {
		this.population[group] = Math.floor(template.population[group] * (Math.random() + 0.5));
	};
	
	var generalSupport = {};
	var factionTemplates = defaultFactions;
	for (var factionKey in factionTemplates) {
		generalSupport[factionKey] = 0;
		if (factionTemplates[factionKey].support !== undefined && factionTemplates[factionKey].support[template.planet] !== undefined) {
			generalSupport[factionKey] += factionTemplates[factionKey].support[template.planet];
		};
		if (factionTemplates[factionKey].support !== undefined && factionTemplates[factionKey].support[id] !== undefined) {
			generalSupport[factionKey] += factionTemplates[factionKey].support[id];
		};
		if (template.support !== undefined && template.support[factionKey] !== undefined) {
			generalSupport[factionKey] += template.support[factionKey];
		};
	};
	this.inControl = undefined;
	var highestSupport = 0;
	for (factionKey in generalSupport) {
		if (generalSupport[factionKey] > highestSupport) {
			highestSupport = generalSupport[factionKey];
			this.inControl = factionKey;
		};
	};
	this.classes = {};
	for (var classKey in factions[this.inControl].classes) {
		this.classes[classKey] = new SocialClass(classKey,this);
		this.classes[classKey].size = Math.floor(factions[this.inControl].classes[classKey].size * this.population.human * (Math.random() * 0.4 + 0.8) );
		this.classes[classKey].wealth = factions[this.inControl].classes[classKey].wealth;
		this.classes[classKey].organization = factions[this.inControl].classes[classKey].organization;
		this.classes[classKey].production = factions[this.inControl].classes[classKey].production;
		this.classes[classKey].interest = factions[this.inControl].classes[classKey].interest;
		this.classes[classKey].support = {};
		for (factionKey in generalSupport) {
			this.classes[classKey].support[factionKey] = generalSupport[factionKey];
			if (defaultFactions[factionKey].support[classKey] !== undefined && factionTemplates[factionKey].support[template.planet] !== undefined) {
				this.classes[classKey].support[factionKey] += defaultFactions[factionKey].support[classKey];
			};
			this.classes[classKey].support[factionKey] *= Math.random() + 0.5;
		};
	};
	this.classes.enslaved.size = this.population.ai;
	
	this.industries = {};
	var commodityTemplates = defaultCommodities
	for (var commodityKey in commodityTemplates) {
		if (template.industries !== undefined && template.industries[commodityKey] !== undefined) {
			this.industries[commodityKey] = template.industries[commodityKey];
		} else {
			this.industries[commodityKey] = 0;
		};
		this.industries[commodityKey] *= 1 + Math.random() - 0.5;
	};
	this.forces = {};
	for (var factionKey in this.support) {
		this.forces[factionKey] = Math.floor(this.support[factionKey] * 0.5);
	};
	
	// functions
	
	this.getSupport = function() {
		var support = {}, supportValue;
		for (var classKey in this.classes) {
			for (var factionKey in this.classes[classKey].support) {
				supportValue = this.classes[classKey].support[factionKey] * this.classes[classKey].organization;
				if (this.classes[classKey].support[factionKey] > 0 && support[factionKey] == undefined) {
					support[factionKey] = supportValue;
				} else if (this.classes[classKey].support[factionKey] > 0) {
					support[factionKey] += supportValue;
				};
			};
		};
		return support;
	};
	
	this.getSupportPercentage = function(factionKey) {
		var total = 0, result = 0;
		var support = this.getSupport();
		for (var key in support) {
			if (support[key] > 0) {
				total += support[key];
			};
		};
		result = support[factionKey] / total;
		return result;
	};
	
	this.updateControl = function() {
		var highestSupport = 0;
		for (factionKey in this.support) {
			if (this.support[factionKey] > highestSupport) {
				highestSupport = this.support[factionKey];
				this.inControl = factionKey;
			};
		};
	};
	
	this.production = function(commodityKey) {
		var workerBonus = 0;
		for (var classKey in this.classes) {
// 			console.log(this.classes[classKey].size,this.classes[classKey].production);
			workerBonus += this.classes[classKey].size * this.classes[classKey].production;
		};
		var productionList = {};
		for (var key in this.industries) {
			productionList[key] = this.industries[key] * workerBonus;
		};
		if (commodityKey !== undefined) {
			productionList = productionList[commodityKey];
		};
		return productionList;
	};
};

function Planet(id) {
	this.id = id;
	this.territories = [];
};

function SocialClass(classKey,territory) {
	this.classKey = classKey;
	this.territory = territory;
	
	// functions
	
	this.income = function() {
		var GDP = game.factions[this.territory.inControl].GDP();
		return GDP * this.wealth / this.size;
	};
};

gamenEventPointers = {

	eachDay: function() {
		game.eachDay();
	},
	
	randomEvent: function() {
		console.log('random event?');
	},
	
};

