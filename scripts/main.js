var cellar = new Cellar();

swal.setDefaults({
    animation: false
});

var sets = ['Basic', 'Classic', 'Blackrock Mountain', 'Curse of Naxxramas', 'Goblins vs Gnomes'],
    mode = 'browse',
    collection = [],
    deck = {
        hero: null,
        cards: []
    },
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

    // checkUrl();

    if (collection.length > 0) {
        populateCollection(); // Populate things even if we can't see it yet
    }

    populateSearch();

    updateModeButtons();

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        swal({
            title: 'Welcome to Crackle',
            text: 'Crackle is optimized for desktop. It may work on mobile, but it probably won\'t be pleasant',
            html: true
        });
    } else {
        if (!cellar.get('welcomed')) {
            swal({
                title: 'Welcome to Crackle',
                text: 'Crackle is an in-development, desktop web application for managing Hearthstone card collections and decks with the intent of versioning those decks and collections on GitHub.<br><br>Some things (deck building) may currently be broken but fixes come fast.',
                html: true
            });

            cellar.save('welcomed', true);
        }
    }
};

var download = function(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    pom.style.display = 'none';
    document.body.appendChild(pom);

    pom.click();

    document.body.removeChild(pom);
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

// var checkUrl = function() {
//     if (getUrlParameter('type')) {
//         if (getUrlParameter('type').toLowerCase() == 'collection') {
//             swal({
//                 title: '',
//                 text: 'Do you want to load this collection?',
//                 showCancelButton: true,
//                 confirmButtonText: 'Load',
//                 cancelButtonText: 'Cancel'
//             }, function(isConfirm) {
//                 if (isConfirm) {
//                     var array = JSON.parse(decodeURI(getUrlParameter('c'))),
//                         collection = []; // Clear our current collection (maybe backup later on)

//                     for (var i = 0; i < array.length; i++) {
//                         for (var j = 0; j < sets.length; j++) {
//                             for (var k = 0; k < database[sets[j]].length; k++) {
//                                 if (database[sets[j]][k].id == array[i].id) {
//                                     var card = database[sets[j]][k];
//                                     card.count = array[i].count;

//                                     collection.push(card);

//                                     break;
//                                 }
//                             }
//                         }
//                     }

//                     cellar.save('collection', collection);
//                     populateCollection();
//                     changeMode('collection');

//                     location.assign(window.location.href.split('?')[0]);
//                 }
//             });
//         } else if (getUrlParameter('type').toLowerCase() == 'deck') {
//             swal({
//                 title: '',
//                 text: 'Do you want to load the deck "' + getUrlParameter('name') + '"?',
//                 showCancelButton: true,
//                 confirmButtonText: 'Load',
//                 cancelButtonText: 'Cancel'
//             }, function(isConfirm) {
//                 if (isConfirm) {
//                     // for (var i = 0; i < collection.length; i++) {
//                     //     if (collection[i].id == cardId) {
//                     //         if (collection[i].count && collection[i].count == 2) {
//                     //             collection[i].count--;
//                     //         } else {
//                     //             collection.splice(i, 1);
//                     //         }
//                     //     }
//                     // }

//                     // cellar.save('collection', collection);

//                     // populateCollection();
//                 }
//             });
//         }
//     }
// };

var loadData = function() {
    swal({
        title: '',
        text: 'Enter a URL to a Crackle .json file:<br><br>', // I'm too lazy to figure out proper padding, hence the linebreaks
        type: 'input',
        showCancelButton: true,
        inputPlaceholder: 'http://username.github.io/collection.json',
        html: true
    }, function(inputValue) {
        if (inputValue === false) {
            return false;
        } else if (inputValue === "") {
            swal.showInputError("You need to write something!");
            return false
        }

        // swal("Nice!", "You wrote: " + inputValue, "success");
    });
};

var exportData = function() {
    if (mode == 'collection') {
        swal({
            title: '',
            text: 'Would you like to download your collection data?',
            showCancelButton: true,
            confirmButtonText: 'Download',
            cancelButtonText: 'Cancel'
        }, function(isConfirm) {
            if (isConfirm) {
                var content = {
                    collection: []
                }

                for (var i = 0; i < collection.length; i++) {
                    var card = {};

                    if (collection[i].count) {
                        card.id = collection[i].id;
                        card.count = collection[i].count;
                    } else {
                        card.id = collection[i].id;
                    }

                    content.collection.push(card);

                    // for (var i = 0; i < sets.length; i++) { // Export all possible cards for debugging purposes
                    //     for (var j = 0; j < database[sets[i]].length; j++) {
                    //         if (database[sets[i]][j].collectible == true) {
                    //             var card = {};

                    //             if (collection[i].count) {
                    //                 card.i = database[sets[i]][j].id;
                    //                 card.c = 2; // Give two copies of all cards for maximum url length
                    //             } else {
                    //                 card.i = database[sets[i]][j].id;
                    //             }

                    //             array.push(card);
                    //         }
                    //     }
                    // }
                }

                download('collection.json', JSON.stringify(content, null, 4));
            }
        });
    }
};

var populateSearch = function() {
    var cards = [];

    for (var i = 0; i < sets.length; i++) {
        for (var j = 0; j < database[sets[i]].length; j++) {
            if (database[sets[i]][j].collectible === true) {
                var collected = '';

                for (var k = 0; k < collection.length; k++) {
                    if (collection[k].id == database[sets[i]][j].id) {
                        if (collection[k].count == 2) {
                            collected = ' (collected x2)';
                        } else {
                            collected = ' (collected)';
                        }
                    }
                }

                var card = {
                    id: database[sets[i]][j].id,
                    title: database[sets[i]][j].name + collected
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

    $('.search')[0].selectize.refreshItems();
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
    populateSearch();

    collection.sort(sortByCost);

    $('.card_grid').empty(); // Clear the HTML table

    var columnCount = 0,
        appendString = '<div class="row">'; // The string we'll build and then append to the DOM

    for (var i = 0; i < collection.length; i++) {
        if (columnCount < cardsPerRow) {
            if (collection[i].count == 2) {
                appendString += '<div class="col-xs-' + (12 / cardsPerRow) + '"><div class="card_flip_container"><div class="card_flipper"><div class="card_front"><img onclick="removeCard(\'' + collection[i].id + '\')" src="images/cards/' + collection[i].id + '.png" /><div class="card_count_banner"><img src="images/x2.png" width="' + cardWidth + '" /></div></div><div class="card_back"><img onclick="removeCard(\'' + collection[i].id + '\')" src="images/back.png" /><div class="card_count_banner"><img src="images/x2.png" width="' + cardWidth + '" /></div></div></div></div></div>';
            } else {
                appendString += '<div class="col-xs-' + (12 / cardsPerRow) + '"><div class="card_flip_container"><div class="card_flipper"><div class="card_front"><img onclick="removeCard(\'' + collection[i].id + '\')" src="images/cards/' + collection[i].id + '.png" /></div><div class="card_back"><img onclick="removeCard(\'' + collection[i].id + '\')" src="images/back.png" /></div></div></div></div>';
            }

            columnCount++;
        } else { // New row
            $('.card_grid').append(appendString + '</div>');

            if (collection[i].count == 2) {
                appendString = '<div class="row"><div class="col-xs-' + (12 / cardsPerRow) + '"><div class="card_flip_container"><div class="card_flipper"><div class="card_front"><img onclick="removeCard(\'' + collection[i].id + '\')" src="images/cards/' + collection[i].id + '.png" /><div class="card_count_banner"><img src="images/x2.png" width="' + cardWidth + '" /></div></div><div class="card_back"><img onclick="removeCard(\'' + collection[i].id + '\')" src="images/back.png" /><div class="card_count_banner"><img src="images/x2.png" width="' + cardWidth + '" /></div></div></div></div></div>';
            } else {
                appendString = '<div class="row"><div class="col-xs-' + (12 / cardsPerRow) + '"><div class="card_flip_container"><div class="card_flipper"><div class="card_front"><img onclick="removeCard(\'' + collection[i].id + '\')" src="images/cards/' + collection[i].id + '.png" /></div><div class="card_back"><img onclick="removeCard(\'' + collection[i].id + '\')" src="images/back.png" /></div></div></div></div>';
            }

            columnCount = 1;
        }
    }

    $('.card_grid').append(appendString + '</div>'); // Catch the last few cards that didn't make a full row and append everything
};

var changeMode = function(newMode) {
    mode = newMode;

    updateModeButtons();

    cellar.save('mode', mode);
};

var updateModeButtons = function() { // Update the buttons' active states to reflect the current mode
    if (mode == 'browse') {
        $('.card_grid').hide();
        $('.hero_picker').hide();
        $('#browse_button').addClass('active');
        $('#deck_button').removeClass('active');
        $('#collection_button').removeClass('active');
    } else if (mode == 'deck') {
        if (deck.cards.length == 0) {
            addDeck();
        }

        $('.card_grid').hide();
        $('#browse_button').removeClass('active');
        $('#deck_button').addClass('active');
        $('#collection_button').removeClass('active');
    } else if (mode == 'collection') {
        $('.card_grid').show();
        $('.hero_picker').hide();
        $('#browse_button').removeClass('active');
        $('#deck_button').removeClass('active');
        $('#collection_button').addClass('active');
    }
};

var addDeck = function() {
    if (!deck.hero) {
        $('.hero_picker').show();

        swal({
            title: 'Select a hero',
            text: ''
        });
    }
};

var selectHero = function(hero) {
    swal({
        title: '',
        text: 'Are you sure you want the ' + capitalizeString(hero) + ' as your deck hero?',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel'
    }, function(isConfirm) {
        if (isConfirm) {
            deck.hero = hero;

            $('.hero_picker').hide();
            $('.deck_hero').show();
            $('.deck_hero').empty();
            $('.deck_hero').append('<div class="col-sm-12"><img src="images/heroes/' + hero + '.png /></div>');
            $('.card_grid').show();
        }
    });
};

var addCard = function(card) {
    swal({
        imageUrl: 'images/cards/' + card.id + '.png',
        imageSize: cardWidth + 'x' + cardHeight,
        title: '',
        text: 'Do you want to add ' + card.name + ' to your collection?',
        showCancelButton: true,
        confirmButtonText: 'Add',
        cancelButtonText: 'Cancel',
        closeOnConfirm: false,
        closeOnCancel: true
    }, function(isConfirm) {
        if (isConfirm) {
            swal({
                title: '',
                text: 'Do you want to add one or two copies of ' + card.name + '?',
                showCancelButton: true,
                confirmButtonText: 'Two',
                cancelButtonText: 'One',
                closeOnConfirm: false,
                closeOnCancel: false
            }, function(isConfirm) {
                if (isConfirm) { // Add two
                    for (var i = 0; i < collection.length; i++) {
                        if (collection[i].id == card.id) { // If we already have the card in our collection
                            if (collection[i].count == 2) {
                                sweetAlert({
                                    title: 'Oops...',
                                    text: 'You already have two copies of ' + card.name + ' in your collection!'
                                });

                                swal.close();
                                return;
                            } else {
                                collection[i].count = 2;
                                populateCollection();
                                cellar.save('collection', collection);

                                populateCollection();
                                cellar.save('collection', collection);

                                swal.close();
                                return;
                            }
                        }
                    }

                    card.count = 2;
                    collection.push(card);
                    populateCollection();
                    cellar.save('collection', collection);
                    swal.close();
                    return;
                } else { // Add one
                    for (var i = 0; i < collection.length; i++) {
                        if (collection[i].id == card.id) { // If we already have the card in our collection
                            if (collection[i].count == 2) {
                                sweetAlert({
                                    title: 'Oops...',
                                    text: 'You already have two copies of ' + card.name + ' in your collection!'
                                });

                                swal.close();
                                return;
                            } else if (collection[i].count == 1) {
                                collection[i].count = 2;
                                populateCollection();
                                cellar.save('collection', collection);

                                swal.close();
                                return;
                            } else if (!collection[i].count) {
                                collection[i].count = 1;
                                populateCollection();
                                cellar.save('collection', collection);

                                swal.close();
                                return;
                            }
                        }
                    }

                    collection.push(card);
                    populateCollection();
                    cellar.save('collection', collection);
                    swal.close();
                    return;
                }
            });
        }
    });
};

var removeCard = function(card) {
    if (!card.name) { // If we just passed an ID for the card_grid onClick event
        for (var i = 0; i < sets.length; i++) {
            for (var j = 0; j < database[sets[i]].length; j++) {
                if (database[sets[i]][j].id == card) {
                    card = database[sets[i]][j];
                    break;
                }
            }
        }
    }

    swal({
        imageUrl: 'images/cards/' + card.id + '.png',
        imageSize: cardWidth + 'x' + cardHeight,
        title: '',
        text: 'Do you want to remove a copy of ' + card.name + ' from your collection?',
        showCancelButton: true,
        confirmButtonText: 'Remove',
        cancelButtonText: 'Cancel',
        closeOnConfirm: false,
        closeOnCancel: true
    }, function(isConfirm) {
        if (isConfirm) {
            for (var i = 0; i < collection.length; i++) {
                if (collection[i].id == card.id) {
                    if (collection[i].count == 2) {
                        swal({
                            title: '',
                            text: 'Do you want to remove one or two copies of ' + card.name + '?',
                            showCancelButton: true,
                            confirmButtonText: 'Two',
                            cancelButtonText: 'One'
                        }, function(isConfirm) {
                            if (isConfirm) { // Remove two
                                for (var i = 0; i < collection.length; i++) {
                                    if (collection[i].id == card.id) { // If we already have the card in our collection
                                        collection.splice(i, 1);
                                        populateCollection();
                                        cellar.save('collection', collection);

                                        swal.close();
                                        return;
                                    }
                                }
                            } else { // Remove one
                                for (var i = 0; i < collection.length; i++) {
                                    if (collection[i].id == card.id) { // If we already have the card in our collection
                                        if (collection[i].count == 2) {
                                            collection[i].count = 1;
                                            populateCollection();
                                            cellar.save('collection', collection);

                                            swal.close();
                                            return;
                                        } else {
                                            collection.splice(i, 1);
                                            populateCollection();
                                            cellar.save('collection', collection);

                                            swal.close();
                                            return;
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        collection.splice(i, 1);
                        populateCollection();
                        cellar.save('collection', collection);

                        swal.close();
                        return;
                    }
                }
            }
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
            confirmButtonText: 'Add',
            cancelButtonText: 'Cancel'
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
        if (collection.length > 0) {
            for (var i = 0; i < collection.length; i++) {
                if (collection[i].id == card.id) {
                    if (collection[i].count == 2) { // If we have two copies in our collection
                        removeCard(card);
                        return;
                    } else if (collection[i].count == 1) { // If we have one card in the collection
                        swal({
                            imageUrl: 'images/cards/' + card.id + '.png',
                            imageSize: cardWidth + 'x' + cardHeight,
                            title: '',
                            text: 'Do you want to add a copy of ' + card.name + ' to your collection?',
                            showCancelButton: true,
                            confirmButtonText: 'Add',
                            cancelButtonText: 'Cancel',
                            closeOnConfirm: false,
                            closeOnCancel: false
                        }, function(isConfirm) {
                            if (isConfirm) {
                                addCard(card);

                                swal.close();
                                return;
                            } else {
                                removeCard(card);

                                return;
                            }
                        });

                        break;
                    }
                } else if (i == collection.length - 1) { // We don't have a copy in our collection if we've made it this far
                    addCard(card);
                }
            }
        } else { // If we have nothing in our collection
            addCard(card);
        }
    }
};
