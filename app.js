// Reference the packages we require so that we can use them in creating the bot
var restify = require('restify');
var builder = require('botbuilder');
var rp = require('request-promise');

// Static variables that we can use anywhere in app.js
var BINGNEWSKEY = 'cbfe538a5a9a44b0ae989bdaa13507df';
var BINGCVKEY = 'a5ac77a11c4d4143be4b902dfd0724e8';
var lat;
var lon;
var _eQuatorialEarthRadius = 6378.1370;
var _d2r = (Math.PI / 180.0);
var fact1 = "Do you know that mixing food with recyclables would contaminate the lot? 39% of recyclables were discarded because of contamination.";
var fact2 = "Here’s how paper recycling works: At recycling facilities, waste paper is shredded, soaked in vats, and made into pulp. The pulp is fed into a machine to be made into new sheets of paper!";
var fact3 = "Recycled glass is first sorted at the facility based on colour, then cleaned and crushed into cullets, which are melted to form new products.";
var fact4 = "Do you know that NEA requires recyclables and waste to be collected separately and in separate trucks?";
var fact5 = "The domestic recycling rate fell to 19 per cent in 2014 from 22 per cent in 2010 :( So keep recycling!";
var fact6 = "Do remember to thoroughly rinse or empty all recyclables before you send them for recycling.";
var fact7 = "Waste that has been contaminated with food such as waxed paper, used styrofoam or disposable plastic containers cannot be recycled. Cassette tapes, light bulbs, window glass, ceramics & tissue paper are also not recyclable.";
var facts = [fact1, fact2, fact3, fact4, fact5, fact6, fact7];
var want = false;


//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
// Listen for any activity on port 3978 of our local server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: 'd8e5c6ce-401d-4443-bf63-75cc48748c23',
    appPassword: 'reicQbSadPVMHV9TtC3ZdQt'
});
var bot = new builder.UniversalBot(connector);
// If a Post request is made to /api/messages on port 3978 of our local server, then we pass it to the bot connector to handle
server.post('/api/messages', connector.listen());

const LuisModelUrl = 'https://api.projectoxford.ai/luis/v2.0/apps/f1fe89c1-2004-4300-bd08-fb0d423a9699?subscription-key=96cc3ebe00a74c6e8c88f9bca41c51fb&verbose=true';
var recogniser = new builder.LuisRecognizer(LuisModelUrl);

var intents = new builder.IntentDialog({recognizers:[recogniser]});
intents.matches(/\b(hi|hello|hey|sup)\b/i,'/sayHi');
intents.matches(/\b(yes|yup|okay)\b/i,'/sayYes');
intents.matches(/\b(no)\b/i,'/sayNo');
intents.matches('getNews', '/giveNews');
intents.matches('analyseImage', '/giveImageAnalysis');
intents.matches('getFunFact','/funFact');
intents.matches('getloc','/getLoc');
intents.onDefault(builder.DialogAction.send("Sorry, I didn't understand what you said."))



//=========================================================
// Bots Dialogs
//=========================================================

// This is called the root dialog. It is the first point of entry for any message the bot receives



bot.dialog('/', intents);

bot.dialog('/sayYes',[
    function (session) {
        if(want){
        session.beginDialog('/getLoc');
        want = false;
    }
    }
]);

bot.dialog('/sayNo',[
    function (session) {
        if(want){
        session.send("Awwww. Do tell me if you change your mind.")
        session.send("Anyway, here are some cool things you could do with your used stuff.")
        var cards = [];
        cards.push(new builder.HeroCard(session)
            .title("Here are 25 things you can make with water bottles!")
            .subtitle("Creative upcycling projects")
            .images([
                    //handle if thumbnail is empty
                    builder.CardImage.create(session, "http://d2droglu4qf8st.cloudfront.net/2015/02/207529/soda-chande-1sm_Medium_ID-863641.jpg?v=863641")
                ])
            .buttons([
                    // Pressing this button opens a url to google maps
                    builder.CardAction.openUrl(session, "http://www.favecrafts.com/Green-Crafting/14-Easy-to-Make-Water-Bottle-Crafts", "Open article")
            ])); 
        cards.push(new builder.HeroCard(session)
            .title("Turn your soup cans into a fun bowling game!")
            .subtitle("Creative upcycling projects")
            .images([
                    //handle if thumbnail is empty
                    builder.CardImage.create(session, "http://static.primecp.com/master_images/Papercraft/shredded%20paper%20frame%20art.jpg")
                ])
            .buttons([
                    // Pressing this button opens a url to google maps
                    builder.CardAction.openUrl(session, "http://www.favecrafts.com/Papercrafts/Shredded-Paper-Framed-Art", "Open article")
            ]));  
        cards.push(new builder.HeroCard(session)
            .title("Make a Denim Pocket Pillow from your old pair of jeans!")
            .subtitle("Creative upcycling projects")
            .images([
                    //handle if thumbnail is empty
                    builder.CardImage.create(session, "http://irepo.primecp.com/2016/03/275117/Denim-Pocket-Pillow_Large500_ID-1589179.jpg?v=1")
                ])
            .buttons([
                    // Pressing this button opens a url to google maps
                    builder.CardAction.openUrl(session, "http://www.favecrafts.com/Decorating-Ideas/Denim-Pocket-Pillow", "Open article")
            ]));   
        cards.push(new builder.HeroCard(session)
            .title("Turn your used cans into beverage coasters!")
            .subtitle("Creative upcycling projects")
            .images([
                    //handle if thumbnail is empty
                    builder.CardImage.create(session, "http://cf.theidearoom.net/wp-content/uploads/2011/06/soda-can-coasters-2_thumb.jpg")
                ])
            .buttons([
                    // Pressing this button opens a url to google maps
                    builder.CardAction.openUrl(session, "http://www.theidearoom.net/diy-soda-can-coasters", "Open article")
            ]));  
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(cards);
        session.endDialog(msg);}
        want = false;
    }
]);

bot.dialog('/sayHi', [
    function (session){
        session.endDialog("Hello there! I'm a smart recycling bot. You can ask me if an item can be recycled, find out about nearest recycling points, and I can also give useful information :D");
    }
]);

bot.dialog('/getLoc', [
    function (session){
        builder.Prompts.text(session, "Could you send me your location?");
    },
    function (session) {
        session.send("Getting your coordinates...");
        if(session.message.entities.length != 0){
            session.sendTyping();
            lat = session.message.entities[0].geo.latitude;
            lon = session.message.entities[0].geo.longitude;
            var results = 0;
            var upplat = lat+0.014;
            var lowlat = lat-0.014;
            var upplon = lon+0.014;
            var lowlon = lon-0.014;
            var url = "https://developers.onemap.sg/privateapi/themesvc/retrieveTheme?queryName=recyclingbins&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI4MSwidXNlcl9pZCI6MjgxLCJlbWFpbCI6Im9uZ2ppYXJ1aUBob3RtYWlsLmNvbSIsImZvcmV2ZXIiOmZhbHNlLCJpc3MiOiJodHRwOlwvXC8xMC4wLjMuMTE6ODA4MFwvYXBpXC92MlwvdXNlclwvc2Vzc2lvbiIsImlhdCI6MTQ4NDI4Mzk1NCwiZXhwIjoxNDg0NzE1OTU0LCJuYmYiOjE0ODQyODM5NTQsImp0aSI6IjIxYjhlODgxODQ1MmVlODVkZmU2NjRlOTU1YjI5M2I4In0.E7DM-ism_4Vt6JE4zElfsC6-QhAsldmPSGuMZH9AvgQ&extents="+lowlat+",%20"+lowlon+","+upplat+",%20"+upplon;
            // Build options for the request
            var options = {
                uri: url,
                json: true // Returns the response in json
            }
            rp(options).then(function (body){
                console.log(body);
                results = body.SrchResults.length;
                if(results > 4) {
                    showLocationCards(session, body);
                }
            }).catch(function (err){
                // An error occurred and the request failed
                console.log(err.message);
                session.send("Argh, no recycle bins nearby. :( Try again?");
            }).finally(function () {
                // This is executed at the end, regardless of whether the request is successful or not
                session.endDialog();
            });
        }
        else{
            session.endDialog("Sorry, I didn't get your location.");
        }
    }
]);

function showLocationCards(session, body) {
    session.sendTyping();
    var cards = [];
    var list = 5;
    if (body.SrchResults.length < 5) list = body.SrchResults.length;
    if (body.SrchResults.length > 0) session.send("These are some nearby recycling bin locations.");
    for (i = 1; i <= list; i++) {
        var str = body.SrchResults[i].LatLng;
        var res = str.split(",");
        var distance = HaversineInKM(lat, lon, res[0], res[1]).toFixed(2);
        
        cards.push(new builder.HeroCard(session)
            .title(body.SrchResults[i].ADDRESSBLOCKHOUSENUMBER+" "+body.SrchResults[i].ADDRESSSTREETNAME)
            .subtitle("Distance from here: "+distance+" km")
            .images([
                    //handle if thumbnail is empty
                    builder.CardImage.create(session, "https://maps.googleapis.com/maps/api/streetview?size=600x300&location="+res[0]+","+res[1]+"&heading=151.78&pitch=-0.76&key=AIzaSyCJkSMIsK3ZPQHrBByW_nJTlamB3Bqe5JY")
                ])
            .buttons([
                    // Pressing this button opens a url to google maps
                    builder.CardAction.openUrl(session, "https://www.google.com/maps?saddr=My+Location&daddr="+res[0]+","+res[1], "Go there")
            ]));    
    }
    var msg = new builder.Message(session)
        .textFormat(builder.TextFormat.xml)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(cards);
    session.send(msg);

};

bot.dialog('/giveImageAnalysis', [
    function (session){
        // Ask the user which category they would like
        // Choices are separated by |
        builder.Prompts.text(session, "Ok! Let me take a look at the object. :)");
    }, function (session, results, next){
        // The user chose a category
        if (session.message.attachments[0].contentUrl != false) {
           //Show user that we're processing their request by sending the typing indicator
            session.sendTyping();
            // Build the url we'll be calling to get top news
            var url = "https://api.projectoxford.ai/vision/v1.0/tag";
            // Build options for the request
            var options = {
                method: 'POST', // thie API call is a post request
                uri: url,
                headers: {
                    'Ocp-Apim-Subscription-Key': '8f8a8f6cc5904b67ae4ac8e0f8d5dbcc',
                    'Content-Type': 'application/json'
                },
                body: {
                    url: session.message.attachments[0].contentUrl
                },
                json: true
            }
            
            //Make the call
                rp(options).then(function (body){
                    // The request is successful
                    console.log(body);
                    imageresults(session, results, body);
                }).catch(function (err){
                    // An error occurred and the request failed
                    console.log(err.message);
                    session.send("Argh, something went wrong. :( Try again?");
                }).finally(function () {
                    // This is executed at the end, regardless of whether the request is successful or not
                    session.endDialog();
                });
        } else {
            // The user choses to quit
            session.endDialog("Hmmm. I can't see anything.");
        }
    }
]);

function imageresults(session, results, body){
    //session.send("Top news in " + results.response.entity + ": ");
    //Show user that we're processing by sending the typing indicator
    session.sendTyping();
    // The value property in body contains an array of all the returned articles
    var allArticles = body.tags;
    var finalresults = false;
    var leng = allArticles.length;
    console.log(leng);
    // Iterate through all 10 articles returned by the API
    for (var i = 0; i < leng; i++){
        var article = allArticles[i].name;
        var confid = allArticles[i].confidence;
        if (confid > 0){
            if(article == "drink" || article == "beverage" || article == "soft drink"){
                finalresults = true;
            }
        }
    }
    if(finalresults){
        session.send("You can recycle it! There are recycling bins nearby. ");
        session.endDialog("Do you want to find the nearest recycling collection point?");
        want = true;
    }
    else{
        session.endDialog("Hmmm. I don't think you can recycle this.");
    }  
}

bot.dialog('/funFact', [
    function (session){
        var index = Math.floor(Math.random()*7);
        session.endDialog(facts[index]);
    }
]);

function HaversineInKM(lat1, long1, lat2, long2)
{
    var dlong = (long2 - long1) * _d2r;
    var dlat = (lat2 - lat1) * _d2r;
    var a = Math.pow(Math.sin(dlat / 2.0), 2.0) + Math.cos(lat1 * _d2r) * Math.cos(lat2 * _d2r) * Math.pow(Math.sin(dlong / 2.0), 2.0);
    var c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
    var d = _eQuatorialEarthRadius * c;

    return d;
}