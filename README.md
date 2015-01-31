# glass-node 

This repository is a simple node web server. It accepts incoming Google Glass HTTP requests and sends them on to Brandwatch and Semantics3. Once it has the data, it creates JSON, which is sent to the Google Mirror API. The Mirror API then inserts the HTML cards into the Glass timeline.

This application works only together with it's counterpart on a web server, which can be found here: https://github.com/alengel/glass-http

<b>How to use this repository:</b>
<br/>
Get the repo and install the node server, it should work just as is. It is missing the Brandwatch & Semantics3 credentials, which you will have to replace. Contact me if you have any questions. 
