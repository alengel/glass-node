'use strict';

function addCardToClient(apiclient, oAuth2Client, template) {
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

        addCardToClient(apiclient, oAuth2Client, template);
    }
};

module.exports = Card;