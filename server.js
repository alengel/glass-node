'use strict';

//Require in node modules 
var http = require('http');
var url = require('url');
var googleapis = require('googleapis');
var qs = require('querystring');

//Require in project modules
var credentials = require('./credentials.json');
var brandwatch = require('./js/brandwatch.js');
var semantics3 = require('./js/semantics3.js');

//Google Oauth Credentials
var clientId = credentials.clientId;
var clientSecret = credentials.clientSecret;
var redirectUrl = 'http://ec2-54-72-234-120.eu-west-1.compute.amazonaws.com:8080/oauth2callback';
var oAuth2Client = new googleapis.OAuth2Client(clientId, clientSecret, redirectUrl);
var apiclient = null;
var client_tokens = [];

//Get access to the Mirror API
googleapis.discover('mirror', 'v1').execute(function(err, client){
    apiclient = client;
});

//Create new node server
http.createServer(function(req, res) {

    var u = url.parse(req.url, true);
    var s = u.pathname.split('/');
    var page = s[s.length - 1];

    switch(page) {
        //Oauthcallback redirect in the browser
        case 'oauth2callback':
            oAuth2Client.getToken(u.query.code, function(err,tokens) {
                if (err) {
                    res.end('Oops something went wrong');
                    return;
                }
                client_tokens.push(tokens);
                oAuth2Client.credentials = tokens;

                res.end('Successfully communicated with Google Glass API!');
            });
            break;
        //Authenticate Glass with Google
        case 'authorize':
            var uri = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: 'https://www.googleapis.com/auth/glass.timeline',
                approval_prompt: 'force'
            });
            res.writeHead(302, { 'Location': uri });
            res.end();
            break;
        //Route accessed by Glass
        case 'query':
            if (req.method === 'POST') {
                var body = '';
                
                req.on('data', function (data) {
                    body += data;
                });

                req.on('end', function () {
                    var query = qs.parse(body).query;
                    
                    brandwatch.getSearchQuery(apiclient, oAuth2Client, query);
                    semantics3.getQuery(apiclient, oAuth2Client, query);
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