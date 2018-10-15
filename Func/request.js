var Requests = require('../Models/Request')


var request = {

    Get : function(req, res){
        
        Requests.find({})
            .then(function(docs){
                console.log(docs)
                res.send(docs)
            })

    },

    GetSocket : function(){
        Requests.find({})
        .then(function(docs){
            //console.log(docs)
            return docs
        })
    },

    Put : function(req, res){
        
        var requester = req.body.requester
        var title = req.body.title
        var cu = context_uri
        
        var Request = new Requests();

        if(requester === null || title === null || cu === null){ //If invalid request
            res.send("NEED BOTH NAME AND TITLE FOR A REQUEST")
        }
        else{ //If valid request
            console.log("Adding Request.." + requester + " " + title)
            Request.requester = requester;
            Request.title = title;
            Request.context_uri = cu;
            
            Request.save(function(err){
            })
            
            res.send(
                Request
            )
        }

    }

}

module.exports = request;