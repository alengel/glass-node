'use strict';

var request = require('request');
var _ =  require('underscore');
var moment = require('moment');

var credentials = require('../credentials.json');
var card = require('./card.js');
var semantics3 = require('./semantics3.js');

//Set up variables needed to access Brandwatch
var authKey = credentials.authKey;
var baseUrl = 'https://newapi.brandwatch.com/projects/' + credentials.projectId;
var today = moment().format('YYYY-MM-DD');
var week = moment().subtract('7', 'days').format('YYYY-MM-DD');
var filters = '?endDate='+ today +'&startDate='+ week +'&pageType=review&queryId=';


function filterQueries(requestedQuery, response){
    var returnedQuery;

    response.forEach(function(query){        
        if(query.name.trim().toLowerCase() === requestedQuery.trim().toLowerCase()){
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
            { 
                json: {
                    type:'search string',
                    includedTerms:['("' + query + '" NEAR/10 review*)'],
                    languages:['en'],
                    name: query,
                    industry:'general-(recommended)',
                    description:'Query created using Brandwatch Glassware'
                }
            },
            function (error, response, body) {
                card.addCardToClient(apiclient, oAuth2Client, body.name);
            }
        );
    },

    //get the matching query
    getSearchQuery: function(apiclient, oAuth2Client, query) {
        var url = '/queries/?',
            matchedQuery;

        request.get(baseUrl + url + authKey + '&nameContains=' + query.split(' ').join('+'), 
            function (error, response, body) {
                matchedQuery = filterQueries(query, JSON.parse(body).results);
                
                Brandwatch.getSentiment(apiclient, oAuth2Client, matchedQuery);
                semantics3.getQuery(apiclient, oAuth2Client, matchedQuery.name);
                Brandwatch.getTopics(apiclient, oAuth2Client, matchedQuery);
            }
        );
    },

    //get sentiment data from Brandwatch
    getSentiment: function(apiclient, oAuth2Client, matchedQuery) {
        var url = '/data/volume/months/sentiment' + filters + matchedQuery.id + '&';
        
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

        request.get(baseUrl + url + authKey,
            function (error, response, body) {
                var results = JSON.parse(body).topics,
                    sortedResults = _.sortBy(results, function(topic){
                        return topic.volume;
                    });

                card.buildTopicsCard(apiclient, oAuth2Client, sortedResults);
            }
        );
    }
};

module.exports = Brandwatch;