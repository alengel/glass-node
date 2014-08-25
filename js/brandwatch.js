'use strict';

var request = require('request');
var _ =  require('underscore');
var moment = require('moment');

var credentials = require('../credentials.json');
var card = require('./card.js');

//Set up variables needed to access Brandwatch
var authKey = credentials.authKey;
var baseUrl = 'https://newapi.brandwatch.com/projects/' + credentials.projectId;
var today = moment().format('YYYY-MM-DD');
var week = moment().subtract('7', 'days').format('YYYY-MM-DD');
var filters = '?endDate='+ today +'&startDate='+ week +'&pageType=review&queryId=';

var TAG = 'brandwatch';

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

        console.log(moment().format('HH-mm-ss-SSS') + ' ' + TAG, 'Measurement ' + 'Requesting queryId for query' + query);

        request.get(baseUrl + url + authKey + '&nameContains=' + query.split(' ').join('+'), 
            function (error, response, body) {
                
                console.log(moment().format('HH-mm-ss-SSS') + ' ' + TAG, 'Measurement ' + 'Received queryId');
                
                matchedQuery = filterQueries(query, JSON.parse(body).results);
                
                Brandwatch.getSentiment(apiclient, oAuth2Client, matchedQuery);
                Brandwatch.getTopics(apiclient, oAuth2Client, matchedQuery);
            }
        );
    },

    //get sentiment data from Brandwatch
    getSentiment: function(apiclient, oAuth2Client, matchedQuery) {
        var url = '/data/volume/months/sentiment' + filters + matchedQuery.id + '&';
        
        console.log(moment().format('HH-mm-ss-SSS') + ' ' + TAG + ' Measurement ' +
                    'Requesting sentiment data for queryId ' + matchedQuery.id);
        
        request.get(baseUrl + url + authKey,
            function (error, response, body) {
                
                console.log(moment().format('HH-mm-ss-SSS') + ' ' + TAG + ' Measurement ' + 'Receiving sentiment');

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

        console.log(moment().format('HH-mm-ss-SSS') + ' ' + TAG + ' Measurement ' + 
                    'Requesting topics data for queryId ' + matchedQuery.id);

        request.get(baseUrl + url + authKey,
            function (error, response, body) {

                console.log(moment().format('HH-mm-ss-SSS') + ' ' + TAG + ' Measurement ' + 'Receiving topics');

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