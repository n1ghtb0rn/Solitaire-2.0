import {Card} from './Card.js';
import {CardManager} from './CardManager.js';

const WIDTH_PER_CARD = -150;
const HEARTS = "Hearts";
const DIAMONDS = "Diamonds";
const CLUBS = "Clubs";
const SPADES = "SPADES";
const SUITS = [HEARTS, DIAMONDS, CLUBS, SPADES];

window.addEventListener('load', setup);

let cardManager = new CardManager();

function setup() {

    //TESTMODE
    cardManager.testMode = false;

    cardManager.createDeck(SUITS, WIDTH_PER_CARD);

    createCardClickListeners();
    
    cardManager.shuffleDeck();

    //TEST
    if (cardManager.testMode) {
        let placeholder1 = document.createElement("div");
        placeholder1.classList.add("slot");
        placeholder1.addEventListener("click", columnSlotClick);
        document.getElementById("column1").appendChild(placeholder1);
        let placeholder2 = document.createElement("div");
        placeholder2.classList.add("slot");
        placeholder2.addEventListener("click", columnSlotClick);
        document.getElementById("column2").appendChild(placeholder2);
        let placeholder3 = document.createElement("div");
        placeholder3.classList.add("slot");
        placeholder3.addEventListener("click", columnSlotClick);
        document.getElementById("column3").appendChild(placeholder3);
    }

    cardManager.drawFieldCards();

    document.getElementById("deck").addEventListener("click", deckClick);

    createMainSlotClickListeners();
}

function createCardClickListeners() {

    let deck = cardManager.deck;

    for (let card of deck) {
        card.addEventListener("click", selectCard);
    }

}

function createMainSlotClickListeners() {

    let numberOfPlaceholders = 4;

    for (let i = 1; i <= numberOfPlaceholders; i++) {
        let placeHolderName = "slot" + i + "-placeholder";
        let placeHolder = document.getElementById(placeHolderName);
        placeHolder.addEventListener("click", placeHolderClick);
    }
}

//Only used to place Aces on main slots
function placeHolderClick(event) {

    if (cardManager.victory) {
        return;
    }

    let selectedCard = cardManager.selectedCard;

    if (selectedCard == null) {
        return;
    }
    if (selectedCard.card.value != 1) {
        return;
    }

    let placeHolder = event.currentTarget;
    let newParent = placeHolder.parentElement;
    let oldParent = selectedCard.parentElement;

    if (selectedCard.parentElement.id == "deck-slot-container") {
        cardManager.moveCardFromDeckToMain(selectedCard, placeHolder);
    }
    if (selectedCard.parentElement.id.includes("column")) {
        cardManager.moveCardFromFieldToMain(selectedCard, placeHolder);

        if (oldParent.children.length <= 0) {
            let columnSlot = document.createElement("div");
            columnSlot.classList.add("slot");
            columnSlot.id = "column-slot";
            columnSlot.addEventListener("click", columnSlotClick);
            oldParent.appendChild(columnSlot);
        }
    }

    deselectCard();
}

//Only used to place Kings on empty field columns
function columnSlotClick(event) {

    if (cardManager.victory) {
        return;
    }

    let selectedCard = cardManager.selectedCard;

    if (selectedCard == null) {
        return;
    }
    if (selectedCard.card.value != 13) {
        return;
    }

    let newParent = event.currentTarget.parentElement;
    let oldParent = selectedCard.parentElement;

    if (oldParent.id.includes("deck-slot")) {
        let cardToMove = cardManager.deckSlot.pop();
        newParent.innerHTML = "";
        newParent.appendChild(cardToMove);

        if (cardManager.deckSlot.length > 0) {
            let prevCard = cardManager.deckSlot[cardManager.deckSlot.length-1];
            prevCard.style.backgroundPositionX = prevCard.card.xOffset;
            oldParent.appendChild(prevCard);
        }
        else {
            let placeholder = document.createElement("div");
            placeholder.classList.add("slot");
            placeholder.id = "deck-slot";
            oldParent.appendChild(placeholder);
        }
    }
    if (oldParent.id.includes("column")) {
        
        newParent.innerHTML = "";

        let breakFound = false;
        let cardsFound = [];

        for (let i = 0; i < oldParent.children.length; i++) {
            let currentCard = oldParent.children[i];
            console.log("current card = " + currentCard);
            if (currentCard == selectedCard) {
                breakFound = true;
            }
            if (breakFound) {
                cardsFound.push(currentCard);
            }
        }

        for (let i = 0; i < cardsFound.length; i++) {
            let currentCard = cardsFound[i];
            oldParent.removeChild(currentCard);
            newParent.appendChild(currentCard);
            console.log("Moving card: " + currentCard);
        }

        if (oldParent.children.length > 0) {
            let lastChild = oldParent.children[oldParent.children.length-1];
            cardManager.revealCard(lastChild);
        }
        else {
            let columnSlot = document.createElement("div");
            columnSlot.classList.add("slot");
            columnSlot.addEventListener("click", columnSlotClick);
            oldParent.appendChild(columnSlot);
        }

    }
    if (oldParent.id.includes("slot") && !oldParent.id.includes("deck-slot")) {

        oldParent.removeChild(selectedCard);
        newParent.innerHTML = "";
        newParent.appendChild(selectedCard);

        let lastChild = oldParent.children[oldParent.children.length-1];
        lastChild.style.visibility = "visible";
        lastChild.style.display = "inline-block";

    }

    deselectCard();
    updateTranslateY();

}

function deckClick(event) {

    if (cardManager.victory) {
        return;
    }

    if (cardManager.deck.length <= 0 && cardManager.deckSlot.length <= 0) {
        let deckNode = document.getElementById("deck");
        let deckParent = deckNode.parentElement;
        deckParent.removeChild(deckNode);
        let emptyDeck = document.createElement("div");
        emptyDeck.classList.add("slot");
        deckParent.appendChild(emptyDeck);
        return;
    }

    deselectCard();
    cardManager.drawCard(event);
}

function selectCard(event) {

    if (cardManager.victory) {
        return;
    }

    let cardNode = event.currentTarget;

    if (cardNode.style.backgroundPositionX == "0px") { 
        return;
    }

    //Play card
    if (cardManager.selectedCard != null && cardManager.selectedCard != cardNode) {
        playCard(cardNode);
        return;
    }

    deselectCard();

    cardNode.style.borderWidth = "5px";
    cardNode.style.borderColor = "blue";
    cardManager.selectedCard = cardNode;

}

function playCard(targetCard) {

    let selectedCard = cardManager.selectedCard;
    let oldParent = selectedCard.parentElement;
    let newParent = targetCard.parentElement;
    deselectCard();
    
    //Within field
    if (selectedCard.parentElement.id.includes("column") && targetCard.parentElement.id.includes("column")) {
        if ((selectedCard.card.suit == HEARTS || selectedCard.card.suit == DIAMONDS) && (targetCard.card.suit == HEARTS || targetCard.card.suit == DIAMONDS)) {
            return;
        }
        if ((selectedCard.card.suit == CLUBS || selectedCard.card.suit == SPADES) && (targetCard.card.suit == CLUBS || targetCard.card.suit == SPADES)) {
            return;
        }
        let diff = parseInt(targetCard.card.value - selectedCard.card.value);
        if (diff != 1) {
            return;
        }
        if (targetCard.parentElement.children[targetCard.parentElement.children.length-1] != targetCard) {
            console.log("not last child");
            return;
        }

        cardManager.moveCardWithinField(selectedCard, targetCard);
        if (oldParent.children.length <= 0) {
            let columnSlot = document.createElement("div");
            columnSlot.classList.add("slot");
            columnSlot.id = "column-slot";
            columnSlot.addEventListener("click", columnSlotClick);
            oldParent.appendChild(columnSlot);
        }
        updateTranslateY();
    }

    //From deck slot to field
    if (selectedCard.parentElement.id.includes("deck-slot") && targetCard.parentElement.id.includes("column")) {
        if ((selectedCard.card.suit == HEARTS || selectedCard.card.suit == DIAMONDS) && (targetCard.card.suit == HEARTS || targetCard.card.suit == DIAMONDS)) {
            return;
        }
        if ((selectedCard.card.suit == CLUBS || selectedCard.card.suit == SPADES) && (targetCard.card.suit == CLUBS || targetCard.card.suit == SPADES)) {
            return;
        }
        let diff = parseInt(targetCard.card.value - selectedCard.card.value);
        if (diff != 1) {
            return;
        }

        cardManager.moveCardFromDeckToField(selectedCard, targetCard);
        updateTranslateY();
    }

    //From field to main slots
    if (selectedCard.parentElement.id.includes("column") && targetCard.parentElement.id.includes("slot") && !targetCard.parentElement.id.includes("deck-slot")) {
        if (selectedCard != oldParent.children[oldParent.children.length-1]) {
            return;
        }
        if (selectedCard.card.suit != targetCard.card.suit) {
            return;
        }
        let diff = parseInt(selectedCard.card.value - targetCard.card.value);
        if (diff != 1) {
            return;
        }
        cardManager.moveCardFromFieldToMain(selectedCard, targetCard);

        if (oldParent.children.length <= 0) {
            let columnSlot = document.createElement("div");
            columnSlot.classList.add("slot");
            columnSlot.id = "column-slot";
            columnSlot.addEventListener("click", columnSlotClick);
            oldParent.appendChild(columnSlot);
        }

        let check = checkVictory();
        if (check) {
            cardManager.performVictory();
        }

    }

    //From deck slot to main slot
    if (selectedCard.parentElement.id == "deck-slot-container" && targetCard.parentElement.id.includes("slot") && targetCard.parentElement.id != selectedCard.parentElement.id) {
        cardManager.moveCardFromDeckToMain(selectedCard, targetCard);

        let check = checkVictory();
        if (check) {
            cardManager.performVictory();
        }

    }

    //From main slot to field
    if (selectedCard.parentElement.id.includes("slot") && targetCard.parentElement.id.includes("column")) {

        console.log("DANNE 1");

        if (selectedCard.card.value != 13 && targetCard.classList[0] == "slot") {
            console.log("DANNE 2");
            return;
        }
        if ((selectedCard.card.suit == HEARTS || selectedCard.card.suit == DIAMONDS) && (targetCard.card.suit == HEARTS || targetCard.card.suit == DIAMONDS)) {
            console.log("DANNE 3");
            return;
        }
        if ((selectedCard.card.suit == CLUBS || selectedCard.card.suit == SPADES) && (targetCard.card.suit == CLUBS || targetCard.card.suit == SPADES)) {
            console.log("DANNE 4");
            return;
        }
        let diff = parseInt(targetCard.card.value - selectedCard.card.value);
        if (diff != 1) {
            console.log("DANNE 5 " + diff);
            return;
        }

        let oldParent = selectedCard.parentElement;
        
        cardManager.moveCardFromMainToField(selectedCard, targetCard);

        if (oldParent.children.length <= 0) {
            let index = oldParent.id.replace("slot", "");
            let id = "slot" + index + "-placeholder";
            let placeholder = document.createElement("div");
            placeholder.classList.add("slot");
            placeholder.id = id;
            placeholder.addEventListener("click", placeHolderClick);
            oldParent.appendChild(placeholder);
        }
        else {
            let lastChild = oldParent.children[oldParent.children.length-1];
            lastChild.style.display = "inline-block";
            lastChild.style.visibility = "visible";
        }

        updateTranslateY();
    }

}

function deselectCard(cardNode = cardManager.selectedCard) {

    if (cardNode == null) {
        return;
    }

    cardNode.style.borderWidth = "0px";
    cardNode.style.borderColor = "black";
    cardManager.selectedCard = null;
}

function updateTranslateY() {

    for (let column = 1; column <= cardManager.fieldSlots.length; column++) {
        let columnNode = document.getElementById("column"+column);
        for (let i = 0; i < columnNode.children.length; i++) {
            columnNode.children[i].style.transform = "translateY(" + parseInt(cardManager.yOffset*i) + "px)";
        }

    }

}

function checkVictory() {

    console.log("CHECK VICTORY");

    let slotName = "slot";

    for (let i = 1; i <= 4; i++) {
        let parent = document.getElementById(slotName+i);
        let lastChild = parent.children[parent.children.length-1];
        if (lastChild.id.includes("placeholder")) {
            return false;
        }
        if (parseInt(lastChild.card.value) != 13) {
            return false;
        }
    }

    return true;
}