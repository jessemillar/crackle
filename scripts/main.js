var cellar = new Cellar();

var mode = 'browse',
    collection = [],
    deck = [];

var init = function() {
    if (cellar.get('mode')) {
        mode = cellar.get('mode');
    }

    if (cellar.get('collection')) {
        collection = cellar.get('collection');
    }

    if (cellar.get('deck')) {
        deck = cellar.get('deck');
    }

    displayMode();

    document.getElementById('search').focus();
};

var changeMode = function(newMode) {
    mode = newMode;

    displayMode();

    cellar.save('mode', mode);
};

var displayMode = function() { // Update the buttons' active states to reflect the current mode
    if (mode == 'browse') {
        $('#browse_button').addClass('active');
        $('#decks_button').removeClass('active');
        $('#collection_button').removeClass('active');
    } else if (mode == 'decks') {
        $('#browse_button').removeClass('active');
        $('#decks_button').addClass('active');
        $('#collection_button').removeClass('active');
    } else if (mode == 'collection') {
        $('#browse_button').removeClass('active');
        $('#decks_button').removeClass('active');
        $('#collection_button').addClass('active');
    }
};

var addToTable = function() {
    console.log($('.card_previews').children('tbody').children('tr').length);
    console.log($('.card_previews').children('tbody').children('tr').children('td').length);
};

var liClick = function(id, name, description, hero, category, rarity, race, set, cost, attack, health) {
    $('#search_results').show();

    if (mode == 'browse') {
        detailAlert(id, name, description, hero, category, rarity, race, set, cost, attack, health);
    } else if (mode == 'decks') {
        swal({
            title: '<img src="images/cards/' + id + '.png" />',
            text: 'Do you want to add a copy of ' + name + ' to your deck?',
            showCancelButton: true,
            confirmButtonColor: '#2ECC40',
            confirmButtonText: 'Add',
            cancelButtonText: 'Cancel',
            closeOnConfirm: false,
            closeOnCancel: true,
            html: true
        }, function(isConfirm) {
            if (isConfirm) {
                if (deck.length < 30) {
                    var count = 0;

                    for (var i = 0; i < deck.length; i++) {
                        if (deck[i] == id) {
                            count++;
                        }
                    }

                    if (count < 2) {
                        deck.push(id);

                        cellar.save('deck', deck);

                        sweetAlert({
                            title: '<h2 style="margin-top: 50px">Added</h2>',
                            // text: 'You already have 30 cards in your deck!',
                            type: 'success',
                            html: true
                        });
                    } else {
                        sweetAlert({
                            title: '<h2 style="margin-top: 50px">Oops...</h2>',
                            text: 'You already have two copies of ' + name + ' in your deck!',
                            type: 'error',
                            html: true
                        });
                    }
                } else {
                    sweetAlert({
                        title: '<h2 style="margin-top: 50px">Oops...</h2>',
                        text: 'You already have 30 cards in your deck!',
                        type: 'error',
                        html: true
                    });
                }
            }
        });
    } else if (mode == 'collection') {
        swal({
            title: '<img src="images/cards/' + id + '.png" />',
            text: 'Do you want to add a copy of ' + name + ' to your collection?',
            showCancelButton: true,
            confirmButtonColor: '#2ECC40',
            confirmButtonText: 'Add',
            cancelButtonText: 'Cancel',
            closeOnConfirm: false,
            closeOnCancel: true,
            html: true
        }, function(isConfirm) {
            if (isConfirm) {
                var count = 0;

                for (var i = 0; i < collection.length; i++) {
                    if (collection[i] == id) {
                        count++;
                    }
                }

                if (count < 2) {
                    collection.push(id);

                    cellar.save('collection', collection);

                    sweetAlert({
                        title: '<h2 style="margin-top: 50px">Added</h2>',
                        type: 'success',
                        html: true
                    });
                } else {
                    sweetAlert({
                        title: '<h2 style="margin-top: 50px">Oops...</h2>',
                        text: 'You already have two copies of ' + name + ' in your collection!',
                        type: 'error',
                        html: true
                    });
                }
            }
        });
    }
};

var detailAlert = function(id, name, description, hero, category, rarity, race, set, cost, attack, health) {
    swal({
        title: '<img src="images/cards/' + id + '.png" />',
        text: '<b>' + name + '</b><br><br><i>' + description + '</i><br><br><table style="width: 100%"><tr><td><b>Class:</b></td><td>' + hero + '</td><td><b>Category:</b></td><td>' + category + '</td></tr><tr><td><b>Rarity:</b></td><td>' + rarity + '</td><td><b>Race:</b></td><td>' + race + '</td></tr><tr><td><b>Set:</b></td><td>' + set + '</td><td><b>Mana Cost:</b></td><td>' + cost + '</td></tr><tr><td><b>Attack:</b></td><td>' + attack + '</td><td><b>Health:</b></td><td>' + health + '</td></tr></table>',
        html: true
    });
};

$('.search_clear').click(function() {
    $('#search').val('');
    $('#search_results').hide();
    $('.card_preview').hide();
});

$(document).click(function(event) { // Close the search results if we click anywhere else
    if (!$('#search_elements').is($(event.target).parent())) {
        $('#search_results').hide();
        $('.card_preview').hide();
    }
});

$(document).mousemove(function(event) {
    $('.card_preview').css({ // The integers are for offset so the image doesn't "cover" the cursor and cause flickering issues
        'left': event.clientX + 12,
        'top': event.clientY - 10
    });
});

$('#search_results').on('mouseenter', 'li', function(event) {
    var card_id = $(this).attr('card_id');

    if (card_id) {
        $('.card_preview').attr('src', 'images/cards/' + card_id + '.png');

        $('.card_preview').show();
    }
});

$('#search_results').on('mouseleave', 'li', function(event) {
    $('.card_preview').hide();
});

$('#search_results li').click(function(event) {
    event.preventDefault();

    console.log('Clicked');
});

$('#search').on('focus keyup submit', function(event) {
    event.preventDefault();

    if (document.getElementById('search').value.length > 0) {
        $('#search_results').empty().show(); // Clear the <ul>

        var query = document.getElementById('search').value;

        var results = [];

        // for (var i = 0; i < collectibles.cards.length; i++) {
        //     for (var key in collectibles.cards[i]) {
        //         if (typeof collectibles.cards[i][key] == 'string') {
        //             if (collectibles.cards[i][key].toLowerCase().indexOf(query.toLowerCase()) > -1) {
        //                 results.push(collectibles.cards[i]);
        //             }
        //         }
        //     }
        // }

        for (var i = 0; i < collectibles.cards.length; i++) {
            if (collectibles.cards[i].name.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                results.push(collectibles.cards[i]);
            }
        }

        $.unique(results); // Remove duplicates

        if (results.length > 0) { // If we have results to show
            for (var i = 0; i < results.length; i++) {
                var id, name, description, hero, category, rarity, race, set, cost, attack, health;

                id = parseInt(results[i].id);
                name = results[i].name.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
                description = results[i].description.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
                hero = results[i].hero;
                hero = hero.charAt(0).toUpperCase() + hero.slice(1);
                category = results[i].category;
                if (category) {
                    category = category.charAt(0).toUpperCase() + category.slice(1);
                } else {
                    category = 'None';
                }
                rarity = results[i].quality;
                rarity = rarity.charAt(0).toUpperCase() + rarity.slice(1);
                race = results[i].race;
                race = race.charAt(0).toUpperCase() + race.slice(1);
                set = results[i].set;
                set = set.charAt(0).toUpperCase() + set.slice(1);
                cost = parseInt(results[i].mana);

                if (results[i].attack === null) {
                    attack = 0;
                } else {
                    attack = parseInt(results[i].attack);
                }

                if (results[i].health === null) {
                    health = 0;
                } else {
                    health = parseInt(results[i].health);
                }

                $('#search_results').append('<li card_id="' + id + '"><a href="#" onclick="liClick(\'' + id + '\', \'' + name + '\', \'' + description + '\', \'' + hero + '\', \'' + category + '\', \'' + rarity + '\', \'' + race + '\', \'' + set + '\', \'' + cost + '\', \'' + attack + '\', \'' + health + '\')"><b>' + results[i].name + '</b> - ' + attack + ' attack and ' + health + ' health for ' + cost + ' mana</a></li>');
            }
        } else {
            $('#search_results').append('<li><a href="#">No results found</a></li>');
        }

        $('#search_results').html( // Alphabetically sort the <ul>
            $('#search_results').children('li').sort(function(a, b) {
                return $(a).text().toUpperCase().localeCompare(
                    $(b).text().toUpperCase());
            })
        );
    }
});
