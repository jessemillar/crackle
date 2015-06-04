// console.log(collectibles);

var cellar = new Cellar();

var sets = ['Basic', 'Classic', 'Blackrock Mountain', 'Curse of Naxxramas', 'Goblins vs Gnomes'],
    mode = 'browse',
    collection = [],
    decks = [],
    cardWidth = 240, // Helps get the size of the Sweetalert correct
    cardHeight = Math.round(cardWidth * 1.51), // Helps get the size of the Sweetalert correct by calculating based on the correct ratio
    cardsPerRow = 4; // Only certain numbers work since we have a total width of 12 columns

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

    for (var i = 0; i < sets.length; i++) {
        for (var j = 0; j < collectibles[sets[i]].length; j++) {
            if (collectibles[sets[i]][j].collectible === true) {
                var card = {
                    id: collectibles[sets[i]][j].id,
                    title: collectibles[sets[i]][j].name
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
                for (var j = 0; j < collectibles[sets[i]].length; j++) {
                    if (collectibles[sets[i]][j].id == cardId) {
                        cardSelect(collectibles[sets[i]][j]);
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
        $('#decks_button').removeClass('active');
        $('#collection_button').removeClass('active');
        $('.wrap').css('background-image', "url('images/backgrounds/browse.png')");
    } else if (mode == 'decks') {
        $('.collection_preview').hide();
        $('#browse_button').removeClass('active');
        $('#decks_button').addClass('active');
        $('#collection_button').removeClass('active');
        $('.wrap').css('background-image', "url('images/backgrounds/decks.png')");
    } else if (mode == 'collection') {
        $('.collection_preview').show();
        $('#browse_button').removeClass('active');
        $('#decks_button').removeClass('active');
        $('#collection_button').addClass('active');
        $('.wrap').css('background-image', "url('images/backgrounds/collection.png')");
    }
};

var alertSuccess = function() {
    sweetAlert({
        title: 'Added',
        type: 'success',
        timer: 1000,
        showConfirmButton: false,
        html: true
    });
};

var addDeck = function() {
    swal({
        title: "An input!",
        text: "Write something interesting:",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: "Write something"
    }, function(inputValue) {
        if (inputValue === false) return false;
        if (inputValue === "") {
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
        html: true
    }, function(isConfirm) {
        if (isConfirm) {
            for (var i = 0; i < collection.length; i++) {
                if (collection[i].id == card.id) { // If we already have the card in our collection
                    if (collection[i].count == 2) {
                        sweetAlert({
                            title: 'Oops...',
                            text: 'You already have two copies of ' + card.name + ' in your collection!',
                            type: 'error',
                            html: true
                        });

                        return;
                    } else if (!collection[i].count) {
                        collection[i].count = 2;
                        populateCollection();
                        cellar.save('collection', collection);
                        alertSuccess();

                        return;
                    }
                }
            }

            collection.push(card);
            populateCollection();
            cellar.save('collection', collection);
            alertSuccess();
        }
    });
};

var removeCard = function(cardId) {
    var card;

    for (var i = 0; i < sets.length; i++) {
        for (var j = 0; j < collectibles[sets[i]].length; j++) {
            if (collectibles[sets[i]][j].id == cardId) {
                card = collectibles[sets[i]][j];
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
        closeOnCancel: true,
        html: true
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

            sweetAlert({
                title: 'Removed',
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
            imageUrl: 'images/cards/' + card.id + '.png',
            imageSize: cardWidth + 'x' + cardHeight,
            title: '',
            animation: false
        });
    } else if (mode == 'decks') {
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
                            title: 'Added',
                            // text: 'You already have 30 cards in your deck!',
                            type: 'success',
                            timer: 1000,
                            showConfirmButton: false,
                            html: true
                        });
                    } else {
                        sweetAlert({
                            title: 'Oops...',
                            text: 'You already have two copies of ' + card.name + ' in your deck!',
                            type: 'error',
                            html: true
                        });
                    }
                } else {
                    sweetAlert({
                        title: 'Oops...',
                        text: 'You already have 30 cards in your deck!',
                        type: 'error',
                        html: true
                    });
                }
            }
        });
    } else if (mode == 'collection') {
        addCard(card);
    }
};
