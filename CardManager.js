import {Card} from './Card.js';

export class CardManager {

    constructor() {
        this.deck = [];
        this.deckSlot = [];
        this.fieldSlots = [[],[],[],[],[],[],[]];
        this.mainSlots = [[],[],[],[]];
        this.selectedCard = null;
        this.yOffset = -175;
        this.testMode = false;
        this.victory = false;
        this.askAutoWin = true;
    }

    createDeck(SUITS, WIDTH_PER_CARD) {

        this.deck = [];

        let xOffset = WIDTH_PER_CARD;

        for (let suitIndex = 0; suitIndex < SUITS.length; suitIndex++) {
            let suit = SUITS[suitIndex];
    
            for (let value = 1; value <= 13; value++) {
    
                let card = new Card(value, suit, xOffset);
    
                let cardNode = document.createElement("div");
                cardNode.classList.add("card");
                cardNode.style.borderWidth = "0px";
                cardNode.style.borderColor = "black";
                cardNode.style.backgroundPositionX = "0px";
                cardNode.style.visibility = "visible";
                cardNode.card = card;
    
                this.deck.push(cardNode);
    
                xOffset += WIDTH_PER_CARD;
            }
    
        }

    }

    shuffleDeck() {

        for (let i = 0; i < this.deck.length; i++) {
            let min = 0;
            let max = this.deck.length;
            let randomIndex = parseInt(Math.random() * (max - min) + min);

            let card1 = this.deck[i];
            let card2 = this.deck[randomIndex];

            this.deck[i] = card2;
            this.deck[randomIndex] = card1;
        }

    }

    drawFieldCards() {

        let count = 0;

        for (let fieldSlotIndex = 0; fieldSlotIndex < this.fieldSlots.length; fieldSlotIndex++) {

            let numberOfCards = fieldSlotIndex+1;
            if (this.testMode) {
                if (numberOfCards > 3) {
                    numberOfCards--;
                    numberOfCards--;
                    numberOfCards--;
                }
            }

            for (let i = 1; i <= numberOfCards; i++) {

                //TEST
                if (this.testMode) {
                    if (count < 6) {
                        count++;
                        continue;
                    }
                }

                let cardNode = this.deck.pop();
                this.fieldSlots[fieldSlotIndex].push(cardNode);
                
                cardNode.style.transform = "translateY(" + this.yOffset*(i-1) + "px)";

                let newParent = document.getElementById("column" + parseInt(fieldSlotIndex+1));
                newParent.appendChild(cardNode);

                //Reveal last card of all columns
                if (i == numberOfCards) {
                    this.revealCard(cardNode);
                }

            }
        }

    }

    revealCard(cardNode) {
        cardNode.style.backgroundPositionX = cardNode.card.xOffset + "px";
    }

    hideCard(cardNode) {
        cardNode.style.backgroundPositionX = "0px";
    }

    drawCard(event) {

        let slotParent = document.getElementById("deck-slot-container");
        let deckNode = document.getElementById("deck");

        //Reuse deck
        if (this.deck.length <= 0) {
            //Move cards from deck slot to deck
            this.deck = this.deckSlot;
            this.deck = this.deck.reverse();
            this.deckSlot = [];
            let deckSlot = document.createElement("div");
            deckSlot.classList.add("slot");
            slotParent.innerHTML = "";
            slotParent.appendChild(deckSlot);

            deckNode.classList.remove("slot");
            deckNode.classList.add("card");
            return;
        }
        
        //Move card node from deck-array to deck slot-array
        let newCardNode = this.deck.pop();
        this.deckSlot.push(newCardNode);

        //Replace deck-slot with card
        slotParent.innerHTML = "";
        slotParent.appendChild(newCardNode);
        newCardNode.style.backgroundPositionX = newCardNode.card.xOffset + "px";

        if (this.deck.length <= 0) {
            deckNode.classList.remove("card");
            deckNode.classList.add("slot");
        }

    }

    moveCardWithinField(selectedCard, targetCard) {
        console.log("MOVING CARD!");

        let newParent = targetCard.parentElement;
        let oldParent = selectedCard.parentElement;

        //Find all cards to move
        let cardsToMove = [];
        let breakFound = false;

        for (let i = 0; i < oldParent.children.length; i++) {
            let currentCard = oldParent.children[i];
            if (currentCard == selectedCard) {
                breakFound = true;
            }
            if (breakFound) {
                cardsToMove.push(currentCard);
            }
        }

        for (let i = 0; i < cardsToMove.length; i++) {
            let currentCard = cardsToMove[i];
            currentCard.parentElement.removeChild(currentCard);
            targetCard.parentElement.appendChild(currentCard);
        }

        //Reveal next card
        this.revealNextCard(oldParent);
    }

    moveCardFromFieldToMain(selectedCard, targetCard) {

        let oldParent = selectedCard.parentElement;
        let newParent = targetCard.parentElement;

        if (newParent.children[0].id.includes("placeholder")) {
            newParent.innerHTML = "";
        }

        console.log(selectedCard);
        console.log(oldParent);

        oldParent.removeChild(selectedCard);
        newParent.appendChild(selectedCard);
        selectedCard.style.transform = "translateY(0px)";

        //Reveal next card
        this.revealNextCard(oldParent);

        //Hide all but last card in main slot
        for (let i = 0; i < newParent.children.length; i++) {
            let currentCard = newParent.children[i];
            if (currentCard != selectedCard) {
                console.log(currentCard);
                currentCard.style.visibilty = "hidden";
                currentCard.style.display = "none";
            }
        }
        
    }

    moveCardFromDeckToField(selectedCard, targetCard) {

        console.log("DANNE");

        let oldParent = selectedCard.parentElement;
        let newParent = targetCard.parentElement;

        oldParent.removeChild(selectedCard);
        newParent.appendChild(selectedCard);

        console.log(selectedCard.parentElement);
        this.deckSlot.pop();

        if (this.deckSlot.length > 0) {
            let prevCard = this.deckSlot[this.deckSlot.length-1];
            prevCard.style.backgroundPositionX = prevCard.card.xOffset;
            oldParent.appendChild(prevCard);
        }
        else {
            let placeholder = document.createElement("div");
            placeholder.classList.add("slot");
            oldParent.appendChild(placeholder);
        }
        
    }

    moveCardFromDeckToMain(selectedCard, targetCard) {

        let oldParent = selectedCard.parentElement;
        let newParent = targetCard.parentElement;

        if (newParent.children[0].id.includes("placeholder")) {
            newParent.innerHTML = "";
        }

        oldParent.removeChild(selectedCard);
        newParent.appendChild(selectedCard);

        this.deckSlot.pop();

        if (this.deckSlot.length > 0) {
            let prevCard = this.deckSlot[this.deckSlot.length-1];
            prevCard.style.backgroundPositionX = prevCard.card.xOffset;
            oldParent.appendChild(prevCard);
        }
        else {
            let placeholder = document.createElement("div");
            placeholder.classList.add("slot");
            oldParent.appendChild(placeholder);
        }

        //Hide all but last card in main slot
        for (let i = 0; i < newParent.children.length; i++) {
            let currentCard = newParent.children[i];
            if (currentCard != selectedCard) {
                console.log(currentCard);
                currentCard.style.visibilty = "hidden";
                currentCard.style.display = "none";
            }
        }

    }

    moveCardFromMainToField(selectedCard, targetCard) {

        console.log("MOVING CARD BACK TO FIELD");

        let oldParent = selectedCard.parentElement;
        let newParent = targetCard.parentElement;

        oldParent.removeChild(selectedCard);
        newParent.appendChild(selectedCard);

        


    }

    revealNextCard(oldParent) {
        if (oldParent.children.length > 0) {
            let lastChild = oldParent.children[oldParent.children.length-1];
            lastChild.style.backgroundPositionX = lastChild.card.xOffset + "px";
        }

        let allCardsRevealed = true;
        let columnContainer = document.getElementById("main-area");
        for (let columnNode of columnContainer.children) {
            for (let cardNode of columnNode.children) {
                if (cardNode.style.backgroundPositionX == "0px") {
                    allCardsRevealed = false;
                }
            }
        }

        console.log("All cards reveald = " + allCardsRevealed);
        if (allCardsRevealed && this.askAutoWin) {
            console.log("ASK AUTOWIN = " + this.askAutoWin);
            this.askIfPlayerWantsAutowin();
        }

    }

    askIfPlayerWantsAutowin() {
        this.askAutoWin = false;
        let delay = setTimeout(function(){ 
            let answer = confirm("Autowin?");
            if (answer) {
                this.performVictory();
            }
         }, 500)
    }

    performVictory() {

        this.victory = true;
    
        let delay = setTimeout(function(){ alert("VICTORY!"); }, 500)
    
    }

}