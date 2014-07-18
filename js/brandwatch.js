'use strict';

var request = require('request');
var credentials = require('../credentials.json');
var card = require('./card.js');

//Set up variables needed to access Brandwatch
var authKey = credentials.authKey;
var baseUrl = 'https://newapi.brandwatch.com/';
var queryUrl = '/projects/' + credentials.projectId + '/queries/?';
var filters = '?endDate=2014-07-18&startDate=2014-07-11&queryId=';

var GLASS_STRING = ' #throughglass';

function filterQueries(requestedQuery, response){
    var returnedQuery;

    response.forEach(function(query){
        var queryNameArray = query.name.split(GLASS_STRING),
            requestedQueryArray = requestedQuery.split(GLASS_STRING);

        if(queryNameArray[0] === requestedQueryArray[0]){
            returnedQuery = query;  
        }
    });

    return returnedQuery;
}

var Brandwatch = {

    // Create a new query in Brandwatch
    createQuery: function(apiclient, oAuth2Client, query) {
        if(!query) {
            console.log('query can\'t be undefined');
            return;
        }

        request.post(baseUrl + queryUrl + authKey, 
            { json: {
                type:'search string',
                includedTerms:['("' + query + '" NEAR/10 review*)'],
                languages:['en'],
                name: query,
                industry:'general-(recommended)',
                description:'Query created using Brandwatch Glassware'
            }},
            function (error, response, body) {
                // if (!error && response.statusCode == 200) {
                    console.log(body);
                    card.addCardToClient(apiclient, oAuth2Client, body.name);
                // }
            }
        );
    },

    //get all available queries for this account
    getAllQueries: function(apiclient, oAuth2Client, query) {
        var matchedQuery;
        request.get(baseUrl + queryUrl + authKey, 
            function (error, response, body) {
                matchedQuery = filterQueries(query, JSON.parse(body).results);

                console.log(matchedQuery.name);
                
                Brandwatch.getSentiment(apiclient, oAuth2Client, matchedQuery);
                // card.addCardToClient(apiclient, oAuth2Client, matchedQuery.name);
            }
        );
    },

    getSentiment: function(apiclient, oAuth2Client, matchedQuery) {
        var url = 'projects/'+ credentials.projectId +'/data/volume/months/sentiment' + filters + matchedQuery.id + '&';
        
        console.log('made it to a specific query ' + matchedQuery.id);
        console.log(baseUrl + url + authKey);

        request.get(baseUrl + url + authKey,
            function (error, response, body) {
                var results = JSON.parse(body).results[0].values,
                    sentiments = {},
                    volume = 0;

                results.forEach(function(result) {
                    if(result.id === 'positive') {
                        sentiments.positive = result.value;
                        volume += result.value;
                    }
                    if(result.id === 'negative') {
                        sentiments.negative = result.value;
                        volume += result.value;
                    }
                });

                sentiments.query = matchedQuery.name;
                sentiments.volume = volume;

                card.buildSentimentCard(apiclient, oAuth2Client, sentiments);
            }
        );
    }
};

module.exports = Brandwatch;