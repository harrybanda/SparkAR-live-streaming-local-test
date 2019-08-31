/***--------------  Production code  --------------***/
// const LiveStreaming = require('LiveStreaming');

/***-------------- Development code --------------***/
var LiveStreaming = {};
LiveStreaming.comments = {
  startMatchVote: function(matchStrings, isCaseSensitive) {
    return {
      subscribe: function(delegate) {
        const LiveTime = require("Time");
        const timeInMilliseconds = 1000;

        var elapsedTime = 0;
        var testComments = ["Peas", "Hi", "Carrots"];
        var comments = {};

        if (!isCaseSensitive) {
          testComments = testComments.map(function(x) {
            return x.toLocaleLowerCase();
          });
          matchStrings = matchStrings.map(function(x) {
            return x.toLocaleLowerCase();
          });
        }

        const mockNewCommentFromLive = () => {
          elapsedTime += 1000;
          var rc = testComments[(Math.random() * testComments.length) | 0];
          comments[elapsedTime] = { body: rc };
          var votes = matchStrings.reduce((acc, element) => {
            acc[element] = 0;
            return acc;
          }, {});
          Object.keys(comments).forEach(function(key) {
            var comment = comments[key].body;

            if (comment in votes) {
              votes[comment] += 1;
            }

            Diagnostics.log(comments);
            delegate(votes);
          });
        };
        const intervalTimer = LiveTime.setInterval(
          mockNewCommentFromLive,
          timeInMilliseconds
        );

        return { unsubscribe: () => LiveTime.clearInterval(intervalTimer) };
      }
    };
  }
};

/***-------------- Production or development code --------------***/
const Diagnostics = require("Diagnostics");
const Time = require("Time");
const Scene = require("Scene");

const matchCounterText = Scene.root.find("text1");

var peaVotes = 0;
var carrotVotes = 0;

let voteSubscription = LiveStreaming.comments
  .startMatchVote(["peas", "carrots"], false)
  .subscribe(function(votes) {
    peaVotes = votes.peas;
    carrotVotes = votes.carrots;
  });

Time.setTimeout(function() {
  voteSubscription.unsubscribe();
  if (peaVotes > carrotVotes) {
    matchCounterText.text = "Peas win!";
  } else if (peaVotes < carrotVotes) {
    matchCounterText.text = "Carrots win!";
  } else {
    matchCounterText.text = "Draw";
  }
}, 10000);
