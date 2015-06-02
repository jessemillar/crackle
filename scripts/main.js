var cellar = new Cellar();

var mode = 'browse',
    collection = [], // Just IDs
    database = [], // All information for cards we have saved
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

    populateCollection(); // Populate things even if we can't see it yet

    populateSearch();

    updateModeButtons();
};

var populateSearch = function() {
    var cards = [];

    for (var i = 0; i < collectibles.cards.length; i++) {
        var card = {
            id: collectibles.cards[i].id,
            title: collectibles.cards[i].name
        }

        cards.push(card);
    }

    cards.sort(function(a, b) { // Alphabetically sort
        if (a.title < b.title) {
            return -1;
        } else if (a.title > b.title) {
            return 1;
        } else {
            return 0;
        }
    })

    $('.search').selectize({
        maxItems: '1',
        valueField: 'id',
        labelField: 'title',
        searchField: 'title',
        options: cards,
        create: false,
        onChange: function(cardId, $item) {
            for (var i = 0; i < collectibles.cards.length; i++) {
                if (collectibles.cards[i].id == cardId) {
                    cardSelect(collectibles.cards[i]);
                    this.clear();
                    break;
                }
            }
        }
    });
}

function sortByMana(a, b) {
    var aMana = a.mana;
    var bMana = b.mana;
    return ((aMana < bMana) ? -1 : ((aMana > bMana) ? 1 : 0));
}

var refreshCollection = function() { // Compare the saved IDs to those in the database to get all the card info
    database = []; // Wipe what we had

    for (var i = 0; i < collection.length; i++) {
        for (var j = 0; j < collectibles.cards.length; j++) {
            if (collection[i] == collectibles.cards[j].id) {
                database.push(collectibles.cards[j]);
                break;
            }
        }
    }
};

var populateCollection = function() {
    refreshCollection();

    $('.collection_preview').empty(); // Clear the HTML table

    database.sort(sortByMana);

    var rowCount = 0,
        appendString = '<tr>';

    for (var i = 0; i < database.length; i++) {
        if (rowCount < 5) {
            appendString += '<td><center><div class="delete_card"><span class="glyphicon glyphicon-remove-circle"></span></div><img onclick="removeCard(' + database[i].id + ', \'' + database[i].name + '\')" src="images/cards/' + database[i].id + '.png" /></center></td>';
            rowCount++;
        } else {
            $('.collection_preview').append(appendString + '</tr>');

            appendString = '<tr><td><center><div class="delete_card"><span class="glyphicon glyphicon-remove-circle"></span></div><img onclick="removeCard(' + database[i].id + ', \'' + database[i].name + '\')" src="images/cards/' + database[i].id + '.png" /></center></td>';

            rowCount = 1;
        }
    }

    $('.collection_preview').append(appendString + '</tr>'); // Catch the last few cards that didn't make a full row
};

var changeMode = function(newMode) {
    mode = newMode;

    updateModeButtons();

    cellar.save('mode', mode);
};

var updateModeButtons = function() { // Update the buttons' active states to reflect the current mode
    if (mode == 'browse') {
        $('.collection_preview').hide();
        $('#browse_button').addClass('active');
        $('#decks_button').removeClass('active');
        $('#collection_button').removeClass('active');
    } else if (mode == 'decks') {
        $('.collection_preview').hide();
        $('#browse_button').removeClass('active');
        $('#decks_button').addClass('active');
        $('#collection_button').removeClass('active');
    } else if (mode == 'collection') {
        $('.collection_preview').show();
        $('#browse_button').removeClass('active');
        $('#decks_button').removeClass('active');
        $('#collection_button').addClass('active');
    }
};

var removeCard = function(id, name) {
    swal({
        title: '<img src="images/cards/' + id + '.png" />',
        text: 'Do you want to remove a copy of ' + name + ' from your collection?',
        showCancelButton: true,
        confirmButtonColor: '#FF4136',
        confirmButtonText: 'Remove',
        cancelButtonText: 'Cancel',
        closeOnConfirm: false,
        closeOnCancel: true,
        html: true
    }, function(isConfirm) {
        if (isConfirm) {
            for (var i = 0; i < collection.length; i++) {
                if (collection[i] == id) {
                    collection.splice(i, 1);
                }
            }

            cellar.save('collection', collection);

            populateCollection();

            sweetAlert({
                title: '<h2 style="margin-top: 50px">Removed</h2>',
                type: 'success',
                timer: 1000,
                showConfirmButton: false,
                html: true
            });
        }
    });
};

var capitalizeString = function(string) {
    if (string === undefined) {
        return 'N/A';
    } else if (string == 'gvg') {
        return 'GvG';
    } else {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
};

var parsePotentialNull = function(number) {
    if (number === null) {
        return 'N/A';
    } else {
        return number;
    }
};

var cardSelect = function(card) {
    if (mode == 'browse') {
        swal({
            title: '<img src="images/cards/' + card.id + '.png" />',
            text: '<b>' + card.name + '</b><br><br><i>' + card.description + '</i><br><br><table style="width: 100%"><tr><td><b>Class:</b></td><td>' + capitalizeString(card.hero) + '</td><td><b>Category:</b></td><td>' + capitalizeString(card.category) + '</td></tr><tr><td><b>Rarity:</b></td><td>' + capitalizeString(card.quality) + '</td><td><b>Race:</b></td><td>' + capitalizeString(card.race) + '</td></tr><tr><td><b>Set:</b></td><td>' + capitalizeString(card.set) + '</td><td><b>Mana Cost:</b></td><td>' + card.mana + '</td></tr><tr><td><b>Attack:</b></td><td>' + parsePotentialNull(card.attack) + '</td><td><b>Health:</b></td><td>' + parsePotentialNull(card.health) + '</td></tr></table>',
            html: true
        });
    } else if (mode == 'decks') {
        swal({
            title: '<img src="images/cards/' + card.id + '.png" />',
            text: 'Do you want to add a copy of ' + card.name + ' to your deck?',
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
                        if (deck[i] == card.id) {
                            count++;
                        }
                    }

                    if (count < 2) {
                        deck.push(card.id);

                        cellar.save('deck', deck);

                        sweetAlert({
                            title: '<h2 style="margin-top: 50px">Added</h2>',
                            // text: 'You already have 30 cards in your deck!',
                            type: 'success',
                            timer: 1000,
                            showConfirmButton: false,
                            html: true
                        });
                    } else {
                        sweetAlert({
                            title: '<h2 style="margin-top: 50px">Oops...</h2>',
                            text: 'You already have two copies of ' + card.name + ' in your deck!',
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
            title: '<img src="images/cards/' + card.id + '.png" />',
            text: 'Do you want to add a copy of ' + card.name + ' to your collection?',
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
                    if (collection[i] == card.id) {
                        count++;
                    }
                }

                if (count < 2) {
                    collection.push(card.id);

                    populateCollection();

                    cellar.save('collection', collection);

                    sweetAlert({
                        title: '<h2 style="margin-top: 50px">Added</h2>',
                        type: 'success',
                        timer: 1000,
                        showConfirmButton: false,
                        html: true
                    });
                } else {
                    sweetAlert({
                        title: '<h2 style="margin-top: 50px">Oops...</h2>',
                        text: 'You already have two copies of ' + card.name + ' in your collection!',
                        type: 'error',
                        html: true
                    });
                }
            }
        });
    }
};
