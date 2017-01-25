// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var request = require('request');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({
        "messages": [{
                "text": "Welcome to our api!"
            },
            {
                "text": "working perfectly"
            }
        ]
    });
});

// on routes that end in /carSearch
// ----------------------------------------------------
router.route('/carSearch/:zip_code/:car_make')

    .get(function(req, res) {
        console.log(req.params);
        request({
                method: 'GET',
                uri: 'http://www.autotrader.com/rest/searchresults/base?zip=' + req.params.zip_code + '&makeCodeList=' + req.params.car_make + '&sortBy=distanceASC',
                json: true
            },
            function(error, response, body) {
                var responseJson = {
                    "messages": [{
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "elements": []
                            }
                        }
                    }]
                };

                for (i = 0; i <= 4; i++) {
                    var message = {
                        "title": body.listings[i].title,
                        "image_url": body.listings[i].imageURL,
                        "subtitle": body.listings[i].description,
                        "buttons": [{
                                "type": "web_url",
                                "url": "http://autotrader.com" + body.listings[i].vdpSeoUrl,
                                "title": "View Item"
                            },
                            {
                                "type": "phone_number",
                                "phone_number": body.listings[i].ownerPhone,
                                "title": "Call"
                            }
                        ]
                    };
                    responseJson.messages[0].attachment.payload.elements.push(message);
                }
                res.json(responseJson);
            })
    });




// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
