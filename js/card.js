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
    //Build the HTML for the card when a product could not be identified
    buildProductNotFoundCard: function(apiclient, oAuth2Client) {
        var template = {
            'html': '<article>' +
                '<section>' +
                'Item could not be identified. Please try again later.' +
                '</section>' +
                '<footer>' +
                    '<p>Brandwatch Glassware</p>' +
                '</footer>' +
                '</article>',
            'menuItems': [
                {'action': 'TOGGLE_PINNED'},
                {'action': 'DELETE'}
            ]
        };

        addCardToClient(apiclient, oAuth2Client, template);
    },

    buildCoverCard: function(apiclient, oAuth2Client, query) {
        // var queryForUrl = query.split(' ').join('_');
        // console.log('http://'+ queryForUrl +'.jpg.to');

        var template = {
            'bundleId': 'brandwatch_' + query,
            'isBundleCover': true,
            'html': '<article>' +
                //temporary image
                '<img src="http://placekitten.com/600/400" width="100%" height="100%">' +
                '<div class="photo-overlay"/>' +
                '<section>' +
                '<p class="text-auto-size">'+ query +'</p>' +
                '</section>' +
                '<footer>' +
                    '<p>Brandwatch Glassware</p>' +
                '</footer>' +
                '</article>'
        };
          
        addCardToClient(apiclient, oAuth2Client, template);
    },

    //Build the HTML for the Sentiment card
    buildSentimentCard: function(apiclient, oAuth2Client, sentiments) {
        var template = sentimentCard.buildTemplate(sentiments);

        //Build cover card of the bundle sent to Glass
        Card.buildCoverCard(apiclient, oAuth2Client, sentiments.query);

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