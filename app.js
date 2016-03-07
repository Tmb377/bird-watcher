var express = require('express');
var session = require('express-session');
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
var app = express();
var path = require('path');

var allBirds = {allBirds : [{bird:'Bald Eagle', numSeen: 3}, {bird:'Yellow Billed Duck', numSeen:7}, {bird:'Great Comorant', numSeen:4}]};

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', 3000);
app.use(require('body-parser').urlencoded({extended: false}));
 
var minSet = false;


var sessionOptions = {
	secret: 'secret',
	saveUninitialized: false,
	resave: false
};

app.use(session(sessionOptions));


var publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));

app.use(function(req, res, next){
	console.log(req.method, " ", req.path);
	console.log("=======");
	console.log(req.body);
	console.log();
	next();
});


app.get('/', function(req, res){
	res.render('index');
});

app.get('/birds', function(req, res){
	if(req.session.minValue === undefined){
		res.render('birds', allBirds);
	}
	else{
		res.render('birds', filterList(req));
	}
});

app.get('/settings', function(req, res){
	if(req.session.minValue === undefined){
		var minimumValue = {minimumValue: [{val:""}]};
		res.render('settings', minimumValue);
	}
	else{
		var minimumValue = {minimumValue: [{val:req.session.minValue}]};
		res.render('settings', minimumValue)
	}
});

app.post('/birds', function(req, res){
	if(containsBird(req.body.birdName) == false){
		addBird(req.body.birdName, 1);
	}
	res.redirect(303, '/birds');
});

app.post('/settings', function(req, res){
	req.session.minValue = req.body.minimumNumber;
	minSet = true;
	res.redirect(303, 'birds');
});

app.listen(app.get('port'));

function addBird(b, num){
	allBirds.allBirds.push({bird:b, numSeen:num});
}

function containsBird(birdName){
	var inArray = false;
	allBirds.allBirds.forEach(function(b){
		if(b.bird == birdName){
			b.numSeen = b.numSeen + 1;
			inArray = true;
		}
	});
	return inArray;
}

function filterList(req){
	var newList = {allBirds : []};
	newList.allBirds = allBirds.allBirds.filter(function(b){
		return b.numSeen >= req.session.minValue;
	});
	return newList;
}

function meetsNum(value){
	return value >= req.session.minValue;
}


