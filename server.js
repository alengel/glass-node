'use strict';

//Require in node modules 
var http = require('http');
var request = require('request');
var url = require('url');
var fs = require('fs');
var googleapis = require('googleapis');
var qs = require('querystring');
var credentials = require('./credentials.json');

//Set up variables needed to access Brandwatch
var authKey = credentials.authKey;
var baseUrl = 'https://newapi.brandwatch.com/';
var queryUrl = '/projects/935709583/queries';

//Google Oauth Credentials
var clientId = credentials.clientId;
var clientSecret = credentials.clientSecret;
var redirectUrl = 'http://localhost:8080/oauth2callback';

var oAuth2Client = new googleapis.OAuth2Client(clientId, clientSecret, redirectUrl);

var apiclient = null;
var client_tokens = [];

function filterQueries(response){
    response.forEach(function(query){
        console.log(query.name);
    });
}

function addCardToClient(tokens){
    oAuth2Client.credentials = tokens;
    apiclient.mirror.timeline.insert({
        'html': '<article>' +
                '<section>' +
                'Hello Brandwatch' +
                '</section>' +
                '</article>',
        'menuItems': [
            {'action': 'TOGGLE_PINNED'},
            {'action': 'DELETE'}
        ]
    }).withAuthClient(oAuth2Client).execute(function(err, data){
        console.log(err);
        console.log(data);
    });
}

function createQueryForBrandwatch(query) {
    // Create a new query in Brandwatch
    request.post(baseUrl + queryUrl + authKey, 
        { json: {
            type:'search string',
            includedTerms:[query],
            languages:['en'],
            name: query + ' #throughglass',
            industry:'general-(recommended)',
            description:'Query created using Brandwatch Glassware'
        }},
        function (error, response, body) {
            // if (!error && response.statusCode == 200) {
                console.log(body);
            // }
        }
    );
}

googleapis.discover('mirror', 'v1').execute(function(err, client){
    apiclient = client;
});

//Create new node server
http.createServer(function(req, res) {
    
    

    // Get all queries
    // request.get(baseUrl + queryUrl + authKey, 
    //     function(error, response, body){
    //         filterQueries(JSON.parse(body).results);
    //     }
    // );

    // res.writeHead(200, {'Content-Type': 'text/plain'});
    // res.write('Hello World');
    // res.end();

    //Authenticate Glass with Google
    // var u = url.parse(req.url, true);
    // var s = u.pathname.split('/');
    // var page = s[s.length - 1];

    // switch(page){
    //     case 'oauth2callback':
    //         oAuth2Client.getToken(u.query.code, function(err,tokens) {
    //             if (err) {
    //                 res.end('Oops something went wrong');
    //                 return;
    //             }
    //             client_tokens.push(tokens);
    //             addCardToClient(tokens);
    //             res.end('Successfully communicated with Google Glass API!');
    //         });
    //         break;
    //     case 'authorize':
    //         var uri = oAuth2Client.generateAuthUrl({
    //             access_type: 'offline',
    //             scope: 'https://www.googleapis.com/auth/glass.timeline',
    //             approval_prompt: 'force'
    //         });
    //         res.writeHead(302, { 'Location': uri });
    //         res.end();
    //         break;
    //     default:
    //         res.end('Hello! Go to /authorize to connect to Glass.');
    // }

    switch(req.url) {
    case '/':
        if (req.method === 'POST') {
            var body = '';
            
            req.on('data', function (data) {
                body += data;
            });

            req.on('end', function () {
                var result = qs.parse(body);

                createQueryForBrandwatch(result.query);

                res.writeHead(200, 'OK', {'Content-Type': 'text/html'});
                res.end();
            });
        }
        break;
    default:
        res.writeHead(404, 'Not found', {'Content-Type': 'text/html'});
        res.end('<html><head><title>404 - Not found</title></head><body><h1>Not found.</h1></body></html>');
        console.log('[404] ' + req.method + ' to ' + req.url);
    }

}).listen(8080);

// var net = require('net');

// var server = net.createServer(function (socket) {
//   socket.write('Echo server\r\n');
//   socket.pipe(socket);
//   console.log(socket);
// });

// server.listen(8080, '127.0.0.1');
