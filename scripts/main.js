var init = function() {
    document.getElementById('search').focus();
};

var detailAlert = function(id, name, description, card_class, category, rarity, race, set, cost, attack, health) {
    swal({
        title: '<img src="images/cards/' + id + '.png" />',
        text: '<table style="width:100%"><tr><td><b>Name:</b></td><td>' + name + '</td><td>Description:</td><td>' + description + '</td></tr><tr><td>Class:</td><td>' + card_class + '</td><td>Category:</td><td>' + category + '</td></tr><tr><td>Rarity:</td><td>' + rarity + '</td><td>Race:</td><td>' + race + '</td></tr><tr><td>Set:</td><td>' + set + '</td><td>Mana Cost:</td><td>' + cost + '</td></tr><tr><td>Attack:</td><td>' + attack + '</td><td>Health:</td><td>' + health + '</td></tr></table>',
        html: true
    });
};

$(document).mousemove(function(event) {
    $('.card_preview').css({ // The integers are for offset so the image doesn't "cover" the cursor and cause flickering issues
        'position': 'absolute',
        'left': event.clientX + 12,
        'top': event.clientY - 10
    });
});

$('.search_results').on('mouseenter', 'li', function(event) {
    var card_id = $(this).attr('card_id');

    if (card_id) {
        $('.card_preview').attr('src', 'images/cards/' + card_id + '.png');

        $('.card_preview').show();
    }
});

$('.search_results').on('mouseleave', 'li', function(event) {
    $('.card_preview').hide();
});

$('.search_form').on('submit', function(event) {
    event.preventDefault();

    $('.search_results').empty(); // Clear the <ul>

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
            var attack;
            var health;

            if (results[i].attack === null) {
                attack = 0;
            } else {
                attack = results[i].attack;
            }

            if (results[i].health === null) {
                health = 0;
            } else {
                health = results[i].health;
            }

            $('.search_results').append('<li card_id="' + results[i].id + '"onclick="detailAlert(\'' + results[i].id + '\', \'' + results[i].name + '\', \'' + results[i].description + '\', \'' + results[i].hero + '\', \'' + results[i].category + '\', \'' + results[i].quality + '\', \'' + results[i].race + '\', \'' + results[i].set + '\', \'' + results[i].mana + '\', \'' + results[i].attack + '\', \'' + results[i].health + '\')"><b>' + results[i].name + '</b> - ' + attack + ' attack and ' + health + ' health for ' + results[i].mana + ' mana</li>');
        }
    } else {
        $('.search_results').append('<li>No results found</li>');
    }

    $('.search_results').html( // Alphabetically sort the <ul>
        $('.search_results').children('li').sort(function(a, b) {
            return $(a).text().toUpperCase().localeCompare(
                $(b).text().toUpperCase());
        })
    );
});
