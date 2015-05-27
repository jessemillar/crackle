var init = function() {
    document.getElementById('search').focus();
};

$(document).mousemove(function(event) {
    $('#card_preview').css({ // The integers are for offset so the image doesn't "cover" the cursor and cause flickering issues
        'position': 'absolute',
        'left': event.clientX + 12,
        'top': event.clientY - 10
    });
});

$('#results').on('mouseenter', 'li', function(event) {
    var card_id = $(this).attr('card_id');

    $('#card_preview').attr('src','images/cards/' + card_id + '.png');

    $('#card_preview').show();
});

$('#results').on('mouseleave', 'li', function(event) {
    $('#card_preview').hide();
});

$('#search_form').on('submit', function(event) {
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

    if (results.length > 0) { // If we have results to show
        for (var i = 0; i < results.length; i++) {
            $('#results').append('<li card_id="' + results[i].id + '">' + results[i].name + '</li>');
        }
    } else {
        $('#results').append('<li>No results found</li>');
    }

    $('#results').html( // Alphabetically sort the <ul>
        $('#results').children('li').sort(function(a, b) {
            return $(a).text().toUpperCase().localeCompare(
                $(b).text().toUpperCase());
        })
    );
});
