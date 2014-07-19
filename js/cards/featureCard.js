'use strict';

var _ =  require('underscore');

function buildRows(features) {
    var template = '',
        featureList = _.pairs(features);

    featureList.forEach(function(feature){
        template += '<li>'+ feature[0] + ': ' + feature[1] +'</li>';
    });

    return template;
}

var FeatureCard = {
    //Build the HTML for the Features card
    buildTemplate: function(features, query) {
        return {
            'html': '<article>' +
                        '<section>' +
                        '<ul class="text-x-small">' +
                            buildRows(features) + 
                        '</ul>' +
                        '</section>' +
                        '<footer>' +
                            '<p>' + query + ' Features</p>' +
                        '</footer>' +
                    '</article>'
            };
    }
};

module.exports = FeatureCard;