var init = function() {
    document.getElementById('search').focus();
};

$('#form').on('submit', function(event) {
    event.preventDefault();

    $('#results').empty(); // Clear the <ul>

    var query = document.getElementById('search').value;

    var results = [];

    for (var i = 0; i < collectibles.cards.length; i++) {
        for (var key in collectibles.cards[i]) {
            if (typeof collectibles.cards[i][key] == 'string') {
                if (collectibles.cards[i][key].toLowerCase().indexOf(query.toLowerCase()) > -1) {
                    results.push(collectibles.cards[i]);
                }
            }
        }
    }

    $.unique(results); // Remove duplicates

    if (results.length > 0) {
        for (var i = 0; i < results.length; i++) {
            $("#results").append('<li>' + results[i].name + '</li>');
        }
    } else {
        $("#results").append('<li>No results found</li>');
    }

    $('#results').html(
        $('#results').children('li').sort(function(a, b) {
            return $(a).text().toUpperCase().localeCompare(
                $(b).text().toUpperCase());
        })
    );
});
