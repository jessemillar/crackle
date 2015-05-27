var init = function() {
    document.getElementById('search').focus();
};

var clearResults = function() {
    while (document.getElementById('results').firstChild) {
        document.getElementById('results').removeChild(document.getElementById('results').firstChild);
    }
};

var sortUnorderedList = function(ul, sortDescending) {
    if (typeof ul == 'string')
        ul = document.getElementById(ul);

    // Idiot-proof, remove if you want
    if (!ul) {
        alert('The UL object is null!');
        return;
    }

    // Get the list items and setup an array for sorting
    var lis = ul.getElementsByTagName('LI');
    var vals = [];

    // Populate the array
    for (var i = 0, l = lis.length; i < l; i++)
        vals.push(lis[i].innerHTML);

    // Sort it
    vals.sort();

    // Sometimes you gotta DESC
    if (sortDescending)
        vals.reverse();

    // Change the list on the page
    for (var i = 0, l = lis.length; i < l; i++)
        lis[i].innerHTML = vals[i];
};

var search = function() {
    if (document.getElementById('search').value.length > 0) {
        clearResults();

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

        for (var i = 0; i < results.length; i++) {
            var ul = document.getElementById('results');
            var li = document.createElement('li');
            li.appendChild(document.createTextNode(results[i].name));
            ul.appendChild(li);
        }

        sortUnorderedList('results');
    }
};
