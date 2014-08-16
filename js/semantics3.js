'use strict';

var credentials = require('../credentials.json');
var card = require('./card.js');
var sem3 = require('semantics3-node')(credentials.semantics3Key, credentials.semantics3Secret);
var moment = require('moment');

//Set up variables needed to access Semantics3
var Semantics3 = {

    // Create a Semantics3 request
    getQuery: function(apiclient, oAuth2Client, query) {
        if(!query) {
            console.log('query can\'t be undefined');
            return;
        }

        console.log('requesting features data' + moment().format('HH-mm-ss-SSS'));

        sem3.products.products_field('search', query);
        sem3.products.get_products(
            function(err, body) {
                if (err) {
                    console.log('Couldn\'t execute query: get_products');
                    card.buildProductNotFoundCard(apiclient, oAuth2Client);
                    return;
                }   
                
                var features = JSON.parse(body).results[0].features;

                console.log('received features data' + moment().format('HH-mm-ss-SSS'));

                card.buildFeatureCard(apiclient, oAuth2Client, features, query);
            }   
        );
    }
};

module.exports = Semantics3;