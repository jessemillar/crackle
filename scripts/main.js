// console.log(database);

var cellar = new Cellar();

swal.setDefaults({
    animation: false
});

var sets = ['Basic', 'Classic', 'Blackrock Mountain', 'Curse of Naxxramas', 'Goblins vs Gnomes'],
    mode = 'browse',
    collection = [],
    decks = [],
    cardWidth = 240, // Helps get the size of the Sweetalert correct
    cardHeight = Math.round(cardWidth * 1.51), // Helps get the size of the Sweetalert correct by calculating based on the correct ratio
    cardsPerRow = 4; // Only certain numbers work since we have a total width of 12 columns

var init = function() {
    swal({
        title: 'Welcome to Crackle',
        text: 'Crackle is an in-development, desktop web application for managing Hearthstone card collections and decks with the intent of versioning those decks and collections on GitHub. Some things may currently be broken but fixes come fast.'
    });

    if (cellar.get('mode')) {
        mode = cellar.get('mode');
    }

    if (cellar.get('collection')) {
        collection = cellar.get('collection');
    }

    if (cellar.get('deck')) {
        deck = cellar.get('deck');
    }

    checkUrl();

    if (collection.length > 0) {
        populateCollection(); // Populate things even if we can't see it yet
    }

    populateDecks(); // Load the decks we have saved
    populateSearch();

    updateModeButtons();
};

var getUrlParameter = function(param) {
    var url = window.location.search.substring(1),
        variables = url.split('&');

    for (var i = 0; i < variables.length; i++) {
        var params = variables[i].split('=');

        if (params[0] == param) {
            return params[1];
        }
    }
};

var checkUrl = function() {
    if (getUrlParameter('type')) {
        if (getUrlParameter('type').toLowerCase() == 'collection') {
            swal({
                title: '',
                text: 'Do you want to load this collection?',
                showCancelButton: true,
                confirmButtonText: 'Load',
                cancelButtonText: 'Cancel',
                closeOnConfirm: false,
                closeOnCancel: true
            }, function(isConfirm) {
                if (isConfirm) {
                    var array = JSON.parse(decodeURI(getUrlParameter('cards'))),
                        collection = []; // Clear our current collection (maybe backup later on)

                    for (var i = 0; i < array.length; i++) {
                        for (var j = 0; j < sets.length; j++) {
                            for (var k = 0; k < database[sets[j]].length; k++) {
                                if (database[sets[j]][k].id == array[i].id) {
                                    var card = database[sets[j]][k];
                                    card.count = array[i].count;

                                    collection.push(card);

                                    break;
                                }
                            }
                        }
                    }

                    cellar.save('collection', collection);
                    populateCollection();
                    changeMode('collection');

                    location.assign(window.location.href.split('?')[0]);
                }
            });
        } else if (getUrlParameter('type').toLowerCase() == 'deck') {
            swal({
                title: '',
                text: 'Do you want to load the deck "' + getUrlParameter('name') + '"?',
                showCancelButton: true,
                confirmButtonText: 'Load',
                cancelButtonText: 'Cancel',
                closeOnConfirm: false,
                closeOnCancel: true
            }, function(isConfirm) {
                if (isConfirm) {
                    // for (var i = 0; i < collection.length; i++) {
                    //     if (collection[i].id == cardId) {
                    //         if (collection[i].count && collection[i].count == 2) {
                    //             collection[i].count--;
                    //         } else {
                    //             collection.splice(i, 1);
                    //         }
                    //     }
                    // }

                    // cellar.save('collection', collection);

                    // populateCollection();
                }
            });
        }
    }
};

var exportData = function() {
    if (mode == 'collection') {
        var string = 'http://www.jessemillar.com/crackle?type=collection&cards=',
            array = [];

        for (var i = 0; i < collection.length; i++) {
            var card = {};

            if (collection[i].count) {
                card.id = collection[i].id;
                card.count = collection[i].count;
            } else {
                card.id = collection[i].id;
            }

            array.push(card);
        }

        string += JSON.stringify(array);
        console.log(encodeURI(string));

        swal({
            title: '',
            text: 'Do you want to copy the collection link?',
            showCancelButton: true,
            confirmButtonText: 'Copy',
            cancelButtonText: 'Cancel',
            closeOnConfirm: false,
            closeOnCancel: true
        }, function(isConfirm) {
            if (isConfirm) {
                // Copy the string
            }
        });
    }
};

var populateDecks = function() {
    $('.decks_list').empty(); // Clear the <ul> initially
    $('.decks_list').append('<li><a href="#" onclick="addDeck()">Make New Deck</a></li>');

    for (var i = 0; i < decks.length; i++) {
        $('.decks_list').append('<li><a href="#" onclick="loadDeck()">' + decks[i].name + '</a></li>');
    }
};

var populateSearch = function() {
    var cards = [];

    for (var i = 0; i < sets.length; i++) {
        for (var j = 0; j < database[sets[i]].length; j++) {
            if (database[sets[i]][j].collectible === true) {
                var card = {
                    id: database[sets[i]][j].id,
                    title: database[sets[i]][j].name
                };

                cards.push(card);
            }
        }
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
            for (var i = 0; i < sets.length; i++) {
                for (var j = 0; j < database[sets[i]].length; j++) {
                    if (database[sets[i]][j].id == cardId) {
                        cardSelect(database[sets[i]][j]);
                        this.clear();
                        return;
                    }
                }
            }
        }
    });
};

var sortByCost = function(a, b) {
    if (a.cost < b.cost) {
        return -1;
    } else if (a.cost > b.cost) {
        return 1;
    } else {
        return 0;
    }
};

var populateCollection = function() {
    collection.sort(sortByCost);

    $('.collection_preview').empty(); // Clear the HTML table

    var columnCount = 0,
        appendString = '<div class="row">'; // The string we'll build and then append to the DOM

    for (var i = 0; i < collection.length; i++) {
        if (columnCount < cardsPerRow) {
            if (collection[i].count == 2) {
                appendString += '<div class="col-xs-' + (12 / cardsPerRow) + '"><div class="card_preview"><img onclick="removeCard(\'' + collection[i].id + '\')" src="images/cards/' + collection[i].id + '.png" /></div><div class="card_count_banner"><img src="images/x2.png" width="' + cardWidth + '" /></div></div>';
            } else {
                appendString += '<div class="col-xs-' + (12 / cardsPerRow) + '"><div class="card_preview"><img onclick="removeCard(\'' + collection[i].id + '\')" src="images/cards/' + collection[i].id + '.png" /></div></div>';
            }

            columnCount++;
        } else { // New row
            $('.collection_preview').append(appendString + '</div>');

            if (collection[i].count == 2) {
                appendString = '<div class="row"><div class="col-xs-' + (12 / cardsPerRow) + '"><div class="card_preview"><img onclick="removeCard(\'' + collection[i].id + '\')" src="images/cards/' + collection[i].id + '.png" /></div><div class="card_count_banner"><img src="images/x2.png" width="' + cardWidth + '" /></div></div>';
            } else {
                appendString = '<div class="row"><div class="col-xs-' + (12 / cardsPerRow) + '"><div class="card_preview"><img onclick="removeCard(\'' + collection[i].id + '\')" src="images/cards/' + collection[i].id + '.png" /></div></div>';
            }

            columnCount = 1;
        }
    }

    $('.collection_preview').append(appendString + '</div>'); // Catch the last few cards that didn't make a full row and append everything
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
        $('#deck_button').removeClass('active');
        $('#collection_button').removeClass('active');
    } else if (mode == 'deck') {
        $('.collection_preview').hide();
        $('#browse_button').removeClass('active');
        $('#deck_button').addClass('active');
        $('#collection_button').removeClass('active');
    } else if (mode == 'collection') {
        $('.collection_preview').show();
        $('#browse_button').removeClass('active');
        $('#deck_button').removeClass('active');
        $('#collection_button').addClass('active');
    }
};

var addDeck = function() {
    swal({
        title: "An input!",
        text: "Write something interesting:",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        inputPlaceholder: "Write something"
    }, function(inputValue) {
        if (inputValue === false) return false;
        if (inputValue === '') {
            swal.showInputError("You need to write something!");
            return false;
        }
        swal("Nice!", "You wrote: " + inputValue, "success");
    });
};

var addCard = function(card) {
    swal({
        imageUrl: 'images/cards/' + card.id + '.png',
        imageSize: cardWidth + 'x' + cardHeight,
        title: '',
        text: 'Do you want to add a copy of ' + card.name + ' to your collection?',
        showCancelButton: true,
        confirmButtonColor: '#2ECC40',
        confirmButtonText: 'Add',
        cancelButtonText: 'Cancel',
        closeOnConfirm: false,
        closeOnCancel: true,
    }, function(isConfirm) {
        if (isConfirm) {
            for (var i = 0; i < collection.length; i++) {
                if (collection[i].id == card.id) { // If we already have the card in our collection
                    if (collection[i].count == 2) {
                        sweetAlert({
                            title: 'Oops...',
                            text: 'You already have two copies of ' + card.name + ' in your collection!'
                        });

                        return;
                    } else if (!collection[i].count) {
                        collection[i].count = 2;
                        populateCollection();
                        cellar.save('collection', collection);

                        return;
                    }
                }
            }

            collection.push(card);
            populateCollection();
            cellar.save('collection', collection);
        }
    });
};

var removeCard = function(cardId) {
    var card;

    for (var i = 0; i < sets.length; i++) {
        for (var j = 0; j < database[sets[i]].length; j++) {
            if (database[sets[i]][j].id == cardId) {
                card = database[sets[i]][j];
            }
        }
    }

    swal({
        imageUrl: 'images/cards/' + card.id + '.png',
        imageSize: cardWidth + 'x' + cardHeight,
        title: '',
        text: 'Do you want to remove a copy of ' + card.name + ' from your collection?',
        showCancelButton: true,
        confirmButtonColor: '#FF4136',
        confirmButtonText: 'Remove',
        cancelButtonText: 'Cancel',
        closeOnConfirm: false,
        closeOnCancel: true
    }, function(isConfirm) {
        if (isConfirm) {
            for (var i = 0; i < collection.length; i++) {
                if (collection[i].id == cardId) {
                    if (collection[i].count && collection[i].count == 2) {
                        collection[i].count--;
                    } else {
                        collection.splice(i, 1);
                    }
                }
            }

            cellar.save('collection', collection);

            populateCollection();
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
            imageUrl: 'images/cards/' + card.id + '.png',
            imageSize: cardWidth + 'x' + cardHeight,
            title: ''
        });
    } else if (mode == 'deck') {
        swal({
            imageUrl: 'images/cards/' + card.id + '.png',
            imageSize: cardWidth + 'x' + cardHeight,
            title: '',
            text: 'Do you want to add a copy of ' + card.name + ' to your deck?',
            showCancelButton: true,
            confirmButtonColor: '#2ECC40',
            confirmButtonText: 'Add',
            cancelButtonText: 'Cancel',
            closeOnConfirm: false,
            closeOnCancel: true,
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
                    } else {
                        sweetAlert({
                            title: 'Oops...',
                            text: 'You already have two copies of ' + card.name + ' in your deck!'
                        });
                    }
                } else {
                    sweetAlert({
                        title: 'Oops...',
                        text: 'You already have 30 cards in your deck!'
                    });
                }
            }
        });
    } else if (mode == 'collection') {
        addCard(card);
    }
};
