var fs = require('fs'),
    request = require('request'),
    database = require('../../database/AllSets.json');

var totalCards = 0,
    downloadedCards = 0;

fs.mkdir('cards');

var download = function(uri, filename, callback) {
    request.head(uri, function(err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

var loopThrough = function(setName) {
    for (var i = 0; i < database[setName].length; i++) { // Basic cards
        if (database[setName][i].collectible == true) {
            totalCards++;

            download('http://wow.zamimg.com/images/hearthstone/cards/enus/original/' + database[setName][i].id + '.png', 'cards/' + database[setName][i].id + '.png', function() {
                downloadedCards++;
                console.log(downloadedCards + '/' + totalCards);
            });
        }
    }
}

loopThrough('Basic');
loopThrough('Classic');
loopThrough('Goblins vs Gnomes');
loopThrough('Curse of Naxxramas');
