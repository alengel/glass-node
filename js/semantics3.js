'use strict';

var credentials = require('../credentials.json');
var card = require('./card.js');
var sem3 = require('semantics3-node')(credentials.semantics3Key, credentials.semantics3Secret);

// var card = require('./card.js');

//Set up variables needed to access Semantics3
var Semantics3 = {

    // Create a Semantics3 request
    createQuery: function(apiclient, oAuth2Client, query) {
        if(!query) {
            console.log('query can\'t be undefined');
            return;
        }

        sem3.products.products_field('search', query);
        sem3.products.get_products(
            function(err, body) {
                if (err) {
                    console.log('Couldn\'t execute query: get_products');
                    return;
                }   
                
                var features = JSON.parse(body).results[0].features;

                card.buildFeatureCard(apiclient, oAuth2Client, features, query);
            }   
        );
    }
};

module.exports = Semantics3;