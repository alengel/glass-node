'use strict';

var request = require('request');
var credentials = require('../credentials.json');

//Set up variables needed to access Brandwatch
var authKey = credentials.authKey;
var baseUrl = 'https://newapi.brandwatch.com/';
var queryUrl = '/projects/1998153770/queries';

function filterQueries(response){
    response.forEach(function(query){
        console.log(query.name);
    });
}

var Brandwatch = {

    // Create a new query in Brandwatch
    createQuery: function(query) {
        console.log('url ', baseUrl + queryUrl + authKey);
        if(!query) {
            console.log('query can\'t be undefined');
            return;
        }

        request.post(baseUrl + queryUrl + authKey, 
            { json: {
                type:'search string',
                includedTerms:['("' + query + '" NEAR/10 review*)'],
                languages:['en'],
                name: query + ' #throughglass',
                industry:'general-(recommended)',
                description:'Query created using Brandwatch Glassware'
            }},
            function (error, response, body) {
                // if (!error && response.statusCode == 200) {
                    console.log(body);
                    // addCardToClient(body.name);
                // }
            }
        );
    },

    //get all available queries for this account
    getAllQueries: function() {
        request.get(baseUrl + queryUrl + authKey, 
            function(error, response, body){
                filterQueries(JSON.parse(body).results);
            }
        );
    }
};

module.exports = Brandwatch;