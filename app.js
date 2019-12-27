// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const fs = require('fs');
var request = require('request');

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function(req, res) {
  var firstName = req.body.fName;
  var lastName = req.body.lName;
  var email = req.body.email;
  var checkEmail = true;

  var data = {
    members: [{
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName,
      }
    }]
  };

  var jsonData = JSON.stringify(data);
  var API_Key = fs.readFileSync(__dirname + '/APIKey.txt', {
    encoding: "utf-8"
  });
  var ListID = fs.readFileSync(__dirname + '/listId.txt', {
    encoding: "utf-8"
  });

  var audienceOptions = {
    url: "https://us4.api.mailchimp.com/3.0/lists/" + ListID + "/members",
    method: "GET",
    headers: {
      "Authorization": "waleed1 " + API_Key
    }
  };

  request(audienceOptions, function(error, response, body) {
    if (error) {
      console.log(error);
    } else {
      var results = JSON.parse(body);
      for (i = 0; i < results.members.length; i++) {
        if (results.members[i].email_address === email) {
          checkEmail = false;
          res.sendFile(__dirname + "/failure2.html");
        }
      }

      if (checkEmail) {

        var options = {
          url: "https://us4.api.mailchimp.com/3.0/lists/" + ListID,
          method: "POST",
          headers: {
            "Authorization": "waleed1 " + API_Key
          },
          body: jsonData
        };

        request(options, function(error, response, body) {
          if (error) {
            res.sendFile(__dirname + "/failure.html");
          } else {
            if (response.statusCode === 200) {
              res.sendFile(__dirname + "/success.html");
            } else {
              res.sendFile(__dirname + "/failure.html");
            }
          }

        });
      }

    }

  });


});

app.post("/failure", function(req, res) {
  res.redirect("/");
});


app.listen(process.env.PORT || 3000, function() {
  console.log("The server is running on port 3000");
});
