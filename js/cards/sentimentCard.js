'use strict';

var SentimentCard = {
    //Build the HTML for the Sentiment card
    buildTemplate: function(sentiments) {
        return {
            'bundleId': 'brandwatch_' + sentiments.query,
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
                    '</article>',
            'menuItems': [
                {'action': 'TOGGLE_PINNED'},
                {'action': 'DELETE'}
            ]    
        };
    }
};

module.exports = SentimentCard;