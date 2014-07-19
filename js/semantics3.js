'use strict';

var credentials = require('../credentials.json');
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

        sem3.products.products_field('search', query );
        sem3.products.get_products(
           function(err, products) {
              if (err) {
                 console.log('Couldn\'t execute query: get_products');
                 return;
              }   
            console.log('Results of query:\n' + JSON.stringify( products )); 
           }   
        );
    }
};

module.exports = Semantics3;