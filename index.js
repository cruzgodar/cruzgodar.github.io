var express = require("express");
var bodyParser = require("body-parser");
var useragent = require("express-useragent");
var fs = require("fs");
var reactions = require("./reactions");

var config = JSON.parse(fs.readFileSync("config.json")); 

var app = express();
app.use(bodyParser.json());
app.use(useragent.express());

function onMessage(msg) {
	if (!msg.system && msg.sender_type == "user") {
		for (var i in reactions) {
			if (reactions[i].check && reactions[i].check(msg)) {
				reactions[i].reply(msg);
			}
		}
	}
}

// Make sure request is coming from the GroupMeBotNotifier
app.post(config.callbackUrl, function(req, res) {
	if (req.useragent.browser == "GroupMeBotNotifier") {
		if (req.query.bot_id) {
			req.body.bot_id = req.query.bot_id;
			onMessage(req.body);
		}
	}
	else {
		res.status(405).send("go away");
	}
});

app.listen(config.port);
console.log("Bot running on port", config.port);
