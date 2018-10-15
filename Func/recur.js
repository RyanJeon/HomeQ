
var mongo = require("mongoose");
var Requests = require('../Models/Request')

function playNext(spot){
    Requests.find({})
        .then(function(docs){
            
            if(docs.length != 0){ //If queue Not EMPTY
                var top = docs[0];
                var uri = top.context_uri;
                console.log(uri)
                spot.play({
                    "uris": [uri],
                    "offset": {
                      "position": 0
                    },
                    "position_ms": 0 //Start 1 mili first
                  })

                //If the top stack is a valid stack
                spot.getMyCurrentPlaybackState({
                })
                .then(function(data){
                    console.log(data.body.item.uri)
                    if(data.body.item.uri == uri){
                        Requests.findByIdAndRemove(top._id, function(err){
                        } )
                    }
                })
            }

        })
}

function checkValid(spot){
    Requests.find({})
    .then(function(docs){
        if(docs.length != 0){ //If queue Not EMPTY
            var top = docs[0];
            var uri = top.context_uri;
            //console.log(uri)

            //If the top stack is a valid stack
            spot.getMyCurrentPlaybackState({
            })
            .then(function(data){
                //onsole.log(data.body.item.uri)
                if(data.body.item.uri == uri){
                    Requests.findByIdAndRemove(top._id, function(err){
                    } )
                }
            })
        }

    })
}

var recur = {
    


    //Recurring update function to keep track of current playback
    update : function(spot, data){
        checkValid(spot)
        spot.getMyCurrentPlaybackState({
        })
        .then(function(data) {
            // Output items
            // console.log("Now Playing: ",data.body.item.name );
             //console.log(data.body.context.uri);
            // console.log("TIME LEFT: ", (data.body.item.duration_ms - data.body.progress_ms) / 1000);
            // console.log("TIME PROGRESSED: ",data.body.progress_ms / 1000);

            //If current playback ended, move to next song.
            if((data.body.item.duration_ms - data.body.progress_ms) / 1000 <= 1){
                console.log("NEXT")
                playNext(spot)
            }

        }, function(err) {
            console.log('Something went wrong!', err);
        });
    },

    //Will only work when authed.. BUMMER
    search : function(spot, query, req, res){
        spot.searchTracks(query)
            .then(function(data) {
                res.json(data)
            }, function(err) {
                console.error(err);
                res.send(err)
            });
    }

}

module.exports = recur;