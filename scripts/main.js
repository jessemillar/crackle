var cellar = new Cellar();

var mode = 'browse',
    collection = [], // Just IDs
    database = [], // All information for cards we have saved
    deck = [],
    cardHeight = 303,
    cardWidth = 200,
    cardCountWidth = 45,
    cardCountHeight = 30;

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
        };

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
    });

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
};

var sortByMana = function(a, b) {
    if (a.mana < b.mana) {
        return -1;
    } else if (a.mana > b.mana) {
        return 1;
    } else {
        return 0;
    }
};

var refreshCollection = function() { // Compare the saved IDs to those in the database to get all the card info
    database = []; // Wipe what we had

    cellar.save('collection', collection);

    for (var i = 0; i < collection.length; i++) {
        for (var j = 0; j < collectibles.cards.length; j++) {
            if (collection[i] == collectibles.cards[j].id) {
                database.push(collectibles.cards[j]);
                break;
            }
        }
    }

    database.sort(sortByMana);
};

var populateCollection = function() {
    refreshCollection();

    $('.collection_preview').empty(); // Clear the HTML table

    var rowCount = 0,
        appendString = '<div class="row">';

    for (var i = 0; i < database.length; i++) {
        if (rowCount < 4) {
            if (typeof database[i + 1] !== 'undefined' && database[i].id == database[i + 1].id) {
                appendString += '<div class="col-sm-3"><div class="card_preview"><img onclick="removeCard(' + database[i].id + ', \'' + database[i].name.replace(/'/g, '&rsquo;') + '\')" src="images/cards/' + database[i].id + '.png" /></div><div class="card_count_banner"><img src="images/x2.png" width="' + cardCountWidth + '" height="' + cardCountHeight + '" /></div></div>';
                i++;
            } else {
                appendString += '<div class="col-sm-3"><div class="card_preview"><img onclick="removeCard(' + database[i].id + ', \'' + database[i].name.replace(/'/g, '&rsquo;') + '\')" src="images/cards/' + database[i].id + '.png" /></div></div>';
            }

            rowCount++;
        } else {
            $('.collection_preview').append(appendString + '</div>');

            if (typeof database[i + 1] !== 'undefined' && database[i].id == database[i + 1].id) {
                appendString = '<div class="row"><div class="col-sm-3"><div class="card_preview"><img onclick="removeCard(' + database[i].id + ', \'' + database[i].name.replace(/'/g, '&rsquo;') + '\')" src="images/cards/' + database[i].id + '.png" /></div></div>';
                i++
            } else {
                appendString = '<div class="row"><div class="col-sm-3"><div class="card_preview"><img onclick="removeCard(' + database[i].id + ', \'' + database[i].name.replace(/'/g, '&rsquo;') + '\')" src="images/cards/' + database[i].id + '.png" /><div class="card_count_banner"><img src="images/x2.png" width="' + cardCountWidth + '" height="' + cardCountHeight + '" /></div></div></div>';
            }
            rowCount = 1;
        }
    }

    $('.collection_preview').append(appendString + '</div>'); // Catch the last few cards that didn't make a full row
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
        title: '<img src="images/cards/' + id + '.png" width="' + cardWidth + '" height="' + cardHeight + '" />',
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
            title: '<img src="images/cards/' + card.id + '.png" width="' + cardWidth + '" height="' + cardHeight + '" />',
            html: true
        });
    } else if (mode == 'decks') {
        swal({
            title: '<img src="images/cards/' + card.id + '.png" width="' + cardWidth + '" height="' + cardHeight + '" />',
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
            title: '<img src="images/cards/' + card.id + '.png" width="' + cardWidth + '" height="' + cardHeight + '" />',
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
