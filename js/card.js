'use strict';

var sentimentCard = require('./cards/sentimentCard.js');
var topicsCard = require('./cards/topicsCard.js');
var featureCard = require('./cards/featureCard.js');

function addCardToClient(apiclient, oAuth2Client, template) {
        //Insert the card into the timeline
        apiclient.mirror.timeline
        .insert(template)
        .withAuthClient(oAuth2Client)
        .execute(function(err, data){
            console.log(err);
            console.log(data);
        });
}

var Card = {
    
    //temporary public, move to private when auth is removed
    //in server.js
    buildTemplate: function(apiclient, oAuth2Client, cardContent) {
        var template = {
            'html': '<article>' +
                    '<section>' +
                    cardContent +
                    '</section>' +
                    '</article>',
            'menuItems': [
                {'action': 'TOGGLE_PINNED'},
                {'action': 'DELETE'}
            ]
        };

        addCardToClient(apiclient, oAuth2Client, template);
    },

    //Build the HTML for the Sentiment card
    buildSentimentCard: function(apiclient, oAuth2Client, sentiments) {
        var template = sentimentCard.buildTemplate(sentiments);

        //Push the card to Glass
        addCardToClient(apiclient, oAuth2Client, template);
    },

    //Build the HTML for the Topics card
    buildTopicsCard: function(apiclient, oAuth2Client, topics) {
        var template = topicsCard.buildTemplate(topics);

        //Push the card to Glass
        addCardToClient(apiclient, oAuth2Client, template);
    },

    buildFeatureCard: function(apiclient, oAuth2Client, features, query) {
        var template = featureCard.buildTemplate(features, query);

        addCardToClient(apiclient, oAuth2Client, template);
    }
};

module.exports = Card;