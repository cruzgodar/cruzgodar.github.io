var groupme = require("groupme");
var fs = require("fs");

var config = JSON.parse(fs.readFileSync("config.json")); 

var reactions = {};

Object.defineProperty(reactions, "globals", {
	enumerable: false,
	writable: true
});

function load_globals() {
	var data = fs.readFileSync("data.json", {flag: "a+"});

	// Load data.json, using empty object if it's empty
	try {
		reactions.globals = JSON.parse(data);
	}
	catch (e) {
		reactions.globals = {};
		console.log("Error parsing data.json");
	}
}

function add_global(group, key, value) {
	if (!reactions.globals.hasOwnProperty(group)) {
		reactions.globals[group] = {};
	}
	reactions.globals[group][key] = value;

	fs.writeFile("data.json", JSON.stringify(reactions.globals));
}

reactions.dadjoke = {
	// Check for any occurrence of "I'm ____"
	re1: /(?:^|\s)(?:i[‘’`']?m|i am)\s+(\w+)(?:\W)?/i, // Match a single word
	re: /(?:^|\s)(?:i[‘’`']?m|i am) +([^.,?!:;\n]+?)\s*(?:\.|,|\?|!|:|;|\n|$)/i, // Match an entire phrase
	match: null,
	check: function(msg) {
		var prob = reactions.globals[msg.group_id] && reactions.globals[msg.group_id].dadness;
		prob = prob || 1;
		this.match = this.re.exec(msg.text);
		return this.match && Math.random() < prob;
	},
	reply: function(msg) {
		var name = this.match[1];
		// Specific message for a specific user
		if (msg.user_id == "23766274") {
			var joke = "Hi " + name + ", I'm da\uD83C\uDD71\uFE0F!";
		}
		else {
			var joke = "Hi " + name + ", I'm dad!";
		}
		groupme.Stateless.Bots.post("", msg.bot_id, joke, {}, function(err, res) {
			if (err) {
				console.log(err.statusCode, err.statusMessage);
			}
		});
	}
}

reactions.dadness = {
	re: /!dadness\s*(.*)?/i,
	match: null,
	check: function(msg) {
		this.match = this.re.exec(msg.text);
		return this.match;
	},
	reply: function(msg) {
		var response;
		var val = this.match[1] && parseFloat(this.match[1]);
		if (val < 0 || val > 1) {
			val = undefined;
		}
		if (val) {
			add_global(msg.group_id, "dadness", val);
			response = "Dadness level set to " + 100 * val + "%.";
		}
		else {
			if (this.match[1]) {
				response = "Error: dadness level must be between 0 and 1.";
			}
			else {
				val = reactions.globals[msg.group_id] && reactions.globals[msg.group_id].dadness;
				val = val || 1;
				response = "Dadness level: " + 100 * val + "%.";
			}
		}
		
		groupme.Stateless.Bots.post("", msg.bot_id, response, {}, function(err, res) {
			if (err) {
				console.log(err.statusCode, err.statusMessage);
			}
		});
	}
}

load_globals();
module.exports = reactions;
