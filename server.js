var exp = require("express")
var app = exp();
var server = require('http').Server(app);
var bodyParser = require("body-parser")
var spotify = require('spotify-web-api-node');
var mongo = require("mongoose");
var io = require('socket.io')(server)


var router = exp.Router();


app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

mongo.connect("mongodb://ryan:cheese1337@ds231723.mlab.com:31723/homeq", {useNewUrlParser: true});



var PORT = process.env.PORT || 8000
//app.listen(PORT)
server.listen(PORT)

var name = '';//user name when logged in


// Spotify Credential
var client_id = '8f45885ac9314883a34ba50f736762e8'
var clientSecret = '11023c34f43e4fce8b1544e136476910'
var redirect_uri = 'http://localhost:8000'
var auth_code = null

var spot = new spotify({
    clientId: client_id,
    clientSecret: clientSecret,
    redirectUri: redirect_uri //redirect to the endpoint if fail
  });

// When our access token will expire
var tokenExpirationEpoch;



app.get('/', function(req, res){
    if(req.query.code !== null) auth_code = req.query.code //update auth code

    if(auth_code == undefined) res.redirect('login')
    else if(auth_code !== null){
        // First retrieve an access token
        console.log('TRYING TO GET AUTHORIZATION CODE GRANT')
        spot.authorizationCodeGrant(auth_code).then(
            function(data) {
            // Set the access token and refresh token
            spot.setAccessToken(data.body['access_token']);
            spot.setRefreshToken(data.body['refresh_token']);
        
            // Save the amount of seconds until the access token expired
            tokenExpirationEpoch =
                new Date().getTime() / 1000 + data.body['expires_in'];
            console.log(
                'Retrieved token. It expires in ' +
                Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
                ' seconds!'
            );

            spot.getMyCurrentPlaybackState({
            })
            .then(function(data) {
              // Output items
              console.log("Now Playing: ",data.body);
            }, function(err) {
              console.log('Something went wrong!', err);
            });


            },
            function(err) {
            console.log(
                auth_code + 
                'Something went wrong when retrieving the access token!',
                err.message
            );
            }
        );

        console.log("API LAUNCHED")
        res.sendFile('C:/Users/RyanJ/Desktop/HomeQ/index.html');   
    }

})

app.get('/api', function(req, res){
    console.log("API LAUNCHED ACCESS")
    res.json({message: "API Base ENDPOINT"})
})

app.get('/login', function(req, res) { //authorize
    var scopes = 'user-read-private user-read-currently-playing user-read-playback-state user-read-email';
    res.redirect('https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + client_id +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' + encodeURIComponent(redirect_uri));
});

//Functions
var requestFunc = require('./Func/request')

//WEB SOCKET
var Requests = require('./Models/Request')
io.on('connection', function (socket){

    console.log("CONNECTED");
    Requests.find({})
    .then(function(docs){
       // console.log(docs)
        io.emit('Request', docs)
    })

    socket.emit('enter', { test: "test"});

    socket.on('Request', function(data){ //request websocket
        
        console.log(data)

        var Request = new Requests() //Create new request

        Request.requester = 'Ryan Jeon';
        Request.title = data.title;
        
        Request.save(function(err){  //add document to the collection 
            Requests.find({})
            .then(function(docs){
               // console.log(docs)
                io.emit('Request', docs)
            })
        })
    })
})


///// Song Request Endpoints
router.route('/request')
    .get(function(req, res){ //Get The List of Requests
        requestFunc.Get(req, res)
    })
    .put(function(req, res){ //put a new song
        requestFunc.Put(req, res)
    })



//USE /api AS ENDPOINT
app.use('/api', router)
