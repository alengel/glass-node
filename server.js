'use strict';

//Require in node modules 
var http = require('http');
var url = require('url');
var googleapis = require('googleapis');
var qs = require('querystring');
var credentials = require('./credentials.json');
var brandwatch = require('./js/brandwatch.js');
var semantics3 = require('./js/semantics3.js');

//Google Oauth Credentials
var clientId = credentials.clientId;
var clientSecret = credentials.clientSecret;
var redirectUrl = 'http://localhost:8080/oauth2callback';

var oAuth2Client = new googleapis.OAuth2Client(clientId, clientSecret, redirectUrl);

var apiclient = null;
var client_tokens = [];

//Temporary to check oAuth works
function addCardToClient(){
    apiclient.mirror.timeline.insert({
        'bundleId': 'customBundle',
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
        ],
        'notification': {
            'level': 'DEFAULT'
        }
    }).withAuthClient(oAuth2Client).execute(function(err, data){
        console.log(err);
        console.log(data);
    });
}

function assignTokens(tokens){
    oAuth2Client.credentials = tokens;
    // addCardToClient();
    
    //TODO: temporary - remove later
    // var query = 'iPhone 4';
    // brandwatch.getAllQueries(apiclient, oAuth2Client, query);  
    // semantics3.createQuery(apiclient, oAuth2Client, query);
}

googleapis.discover('mirror', 'v1').execute(function(err, client){
    apiclient = client;
});

//Create new node server
http.createServer(function(req, res) {

    //Authenticate Glass with Google
    var u = url.parse(req.url, true);
    var s = u.pathname.split('/');
    var page = s[s.length - 1];

    switch(page) {
        case 'oauth2callback':
            oAuth2Client.getToken(u.query.code, function(err,tokens) {
                if (err) {
                    res.end('Oops something went wrong');
                    return;
                }
                client_tokens.push(tokens);
                assignTokens(tokens);

                res.end('Successfully communicated with Google Glass API!');
            });
            break;
        case 'authorize':
            var uri = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: 'https://www.googleapis.com/auth/glass.timeline',
                approval_prompt: 'force'
            });
            res.writeHead(302, { 'Location': uri });
            res.end();
            break;
        case 'query':
        console.log('made it here');
            if (req.method === 'POST') {
                var body = '';
                
                req.on('data', function (data) {
                    body += data;
                });

                req.on('end', function () {
                    var result = qs.parse(body);
                    
                    brandwatch.getAllQueries(apiclient, oAuth2Client, result.query);
                    // brandwatch.createQuery(apiclient, oAuth2Client, result.query);

                    res.writeHead(200, 'OK', {'Content-Type': 'text/html'});
                    res.end();
                });
            }
            break;
        default:
            res.end('Hello! Go to /authorize to connect to Glass.');
            console.log('[404] ' + req.method + ' to ' + req.url);
        }
}).listen(8080);