'use strict';

var request = require('request');
var _ =  require('underscore');

var credentials = require('../credentials.json');
var card = require('./card.js');

//Set up variables needed to access Brandwatch
var authKey = credentials.authKey;
var baseUrl = 'https://newapi.brandwatch.com/projects/' + credentials.projectId;
var filters = '?endDate=2014-07-18&startDate=2014-07-11&pageType=review&queryId=';

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
        var url = '/queries/?';

        if(!query) {
            console.log('query can\'t be undefined');
            return;
        }

        request.post(baseUrl + url + authKey, 
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
        var url = '/queries/?',
            matchedQuery;

        request.get(baseUrl + url + authKey, 
            function (error, response, body) {
                matchedQuery = filterQueries(query, JSON.parse(body).results);

                console.log(matchedQuery.name);
                
                Brandwatch.getSentiment(apiclient, oAuth2Client, matchedQuery);
                // card.addCardToClient(apiclient, oAuth2Client, matchedQuery.name);
            }
        );
    },

    getSentiment: function(apiclient, oAuth2Client, matchedQuery) {
        var url = '/data/volume/months/sentiment' + filters + matchedQuery.id + '&';
        
        //TODO remove later
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
    },

    getTopics: function(apiclient, oAuth2Client, matchedQuery) {
        var url = '/data/volume/topics/queries' + filters + matchedQuery.id + '&';

        //TODO remove later
        console.log('made it to a specific query ' + matchedQuery.id);
        console.log(baseUrl + url + authKey);

        request.get(baseUrl + url + authKey,
            function (error, response, body) {
                var results = JSON.parse(body).topics,
                    sortedResults = _.sortBy(results, function(topic){
                        return topic.volume;
                    });

                console.log('results ' + sortedResults);

                card.buildTopicsCard(apiclient, oAuth2Client, sortedResults);
            }
        );
    }
};

module.exports = Brandwatch;