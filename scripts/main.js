var search = function() {
    // console.log(collectibles.cards.length);

    var query = document.getElementById('search').value;

    var results = [];

    for (var i = 0; i < collectibles.cards.length; i++) {
        for (var key in collectibles.cards[i]) {
            // console.log(key);

            if (typeof collectibles.cards[i][key] == 'string') {
                if (collectibles.cards[i][key].toLowerCase().indexOf(query.toLowerCase()) > -1) {
                    results.push(collectibles.cards[i]);
                }
            }
        }
    }

    console.log(results);
};
