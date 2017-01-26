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
        request({
                method: 'GET',
                uri: 'http://www.autotrader.com/rest/searchresults/base?zip=' + req.params.zip_code + '&makeCodeList=' + req.params.car_make + '&sortBy=distanceASC&listingTypes=new',
                json: true
            },
            function(error, response, body) {
                var responseJson = {
                    "messages": []
                };
                var gallery = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": []
                        }
                    }
                };
                if (body.listings === undefined) {
                    console.log('undefined listings');
                    var recommendationListings = body.noSearchResultsViewBean.recommendationListings;
                    var noResults = {
                        "text": "We could not find find and exact result, but we found some similar"
                    };
                    responseJson.messages.push(noResults);

                    for (var i = 0, len = recommendationListings.length; i < len; i++) {
                        var message = {
                            "title": recommendationListings[i].title,
                            "image_url": recommendationListings[i].photo,
                            "buttons": [{
                                "type": "web_url",
                                "url": "http://autotrader.com" + recommendationListings[i].vdpSeoUrl,
                                "title": "Find out more"
                            }]
                        };
                        gallery.attachment.payload.elements.push(message);
                    }
                } else {
                    var listings = body.listings;
                    for (i = 0; i < 4; i++) {
                        var message = {
                            "title": listings[i].title,
                            "image_url": listings[i].imageURL,
                            "subtitle": listings[i].description,
                            "buttons": [{
                                    "type": "web_url",
                                    "url": "http://autotrader.com" + listings[i].vdpSeoUrl,
                                    "title": "Find out more"
                                },
                                {
                                    "type": "phone_number",
                                    "phone_number": listings[i].ownerPhone,
                                    "title": "Call Seller"
                                },
                                {
                                    "type": "element_share"
                                }
                            ]
                        };
                        gallery.attachment.payload.elements.push(message);
                    }
                }
                responseJson.messages.push(gallery);
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
