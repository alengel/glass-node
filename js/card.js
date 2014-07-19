'use strict';

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

function getColour(sentiment) {
    var negative = 'red',
        positive = 'green',
        neutral = 'muted';

    //If neutral sentiment is greater than negative or positive, return muted white
    if(!!sentiment.neutral ||
        sentiment.neutral > sentiment.negative || 
        sentiment.neutral > sentiment.positive) {
        return neutral;
    }

    //If negative sentiment is greater than positive or neutral, return red
    if(!!sentiment.negative ||
        sentiment.negative > sentiment.positive || 
        sentiment.negative > sentiment.neutral) {
        return negative;
    }

    //If positive sentiment is greater than negative or neutral, return green
    if(!!sentiment.positive ||
        sentiment.positive > sentiment.negative ||
        sentiment.positive > sentiment.neutral) {
        return positive;
    }
}

function buildTopicsRows(topics) {
    var counter = 0,
        template = '',
        rowBegin = '<tr>',
        rowEnd = '</tr>',
        cellBegin,
        cellEnd = '</td>';

    topics.forEach(function(topic){
        counter++;
        
        //Return after 4 topics because of screen size issues
        if(counter > 4){
            return;
        }

        //If it's the beginning of a row, build the row element
        if(counter === 1 || counter === 3) {
            template += rowBegin;
        }

        //Build a table data cell for each topic
        cellBegin = '<td class="' + getColour(topic.sentiment) + '">';
        template += cellBegin + topic.label + cellEnd;

        //If it's the end of a row, build the closing row element
        if(counter === 2 || counter === 4) {
            template += rowEnd;
        }
    });

    return template;
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
        var template = {
            'html': '<article>' +
                      '<section>' +
                        '<table class="align-justify">' + 
                          '<tbody>' +
                            '<tr>' +
                              '<td>Volume</td>' +
                              '<td>'+ sentiments.volume +'</td>' +
                            '</tr>' +
                            '<tr>' +
                              '<td>Positive</td>' +
                              '<td class="green">'+ sentiments.positive +'</td>' +
                            '</tr>' +
                            '<tr>' +
                              '<td>Negative</td>' +
                              '<td class="red">'+ sentiments.negative +'</td>' +
                           '</tr>' +
                          '</tbody>' +
                        '</table>' +
                    '</section>' +
                    '<footer>' +
                        '<p>' + sentiments.query + '</p>' +
                    '</footer>' +
                    '</article>'
            };

        //Push the card to Glass
        addCardToClient(apiclient, oAuth2Client, template);
    },

    //Build the HTML for the Topics card
    buildTopicsCard: function(apiclient, oAuth2Client, topics) {
        var template = {
            'html': '<article>' +
                      '<section>' +
                        '<table>' + 
                            '<tbody>' + 
                                buildTopicsRows(topics) + 
                            '</tbody>' +
                        '</table>' +
                      '</section>' +
                      '<footer>' +
                        '<p>' + topics[0].queries[0].name + '</p>' +
                    '</footer>' +
                    '</article>'
            };

        //Push the card to Glass
        addCardToClient(apiclient, oAuth2Client, template);
    }
};

module.exports = Card;