import { doEffect } from "./doEffect.js";
import { cardData, discardDeck, handCards } from "./globals.js";

let loaded = false;

function getHandDiv() {
  return document.getElementById("hand-wrap")
}

function getPlayArea() {
  return document.getElementById("game-wrap")
}

function updateHand() {
  let maxWidth = 600;
  let margin = 120;
  let x = 350;
  let y = 300;

  let finalMargin = Math.min(margin, maxWidth / (handCards.length - 1))
  let currX = x - (handCards.length - 1) / 2 * finalMargin;

  for (let card of handCards) {
    let currCard = document.getElementById(domId(card.id));
    if (!currCard) {
      currCard = createCard(card);
      getHandDiv().appendChild(currCard)
    }
    currCard.style.left = currX + "px";
    currCard.style.top = y + "px";
    currX += finalMargin;
  }

  for (let card of getHandDiv().querySelectorAll(".card")) {
    if (!handCards.find(c => domId(c.id) === card.id)) {
      //removeCard(card);
    }
  }
}

function removeCard(card) {
  let animation = card.animate([
    { transform: "scale(1, 1) translate(0, 0)", opacity: 1, zIndex: 10},
    { transform: "scale(1.3, 1.3) translate(0, -200px)", opacity: 1},
    { transform: "scale(1.3, 1.3) translate(0, -200px)", opacity: 1},
    { transform: "scale(0.7, 0.7) translate(100px, 30px)", opacity: 0},
  ], {duration: 2000, fill: "forwards", easing: "ease-in-out"})
  animation.onfinish = () => {
    console.log("animation complete");
    card.remove()
  }
}

function domId(id) {
  return "card-" + id;
}

function main() {
  loadCards();
}

function finishLoad() {
  startGame();
}

Array.prototype.toShuffled = function() {
  for (let i = 0; i < this.length; ++i) {
    let target = Math.floor(Math.random() * i);
    let swap = this[target];
    this[target] = this[i];
    this[i] = swap;
  }
  return this;
}

function startGame() {
  let deck = cardData.filter(card => card.tier === "s").toShuffled();
  for (let i = 0; i < 9; ++i) {
    handCards.push(deck.shift())
  }
  updateHand();
  /*for (let card of cardData) {
    document.getElementById("game-wrap").appendChild(createCard(card));
  }*/
}

function updateGame() {
  updateHand();
}



function playCard(card) {
  console.log("play card", card);
  let handIndex = handCards.findIndex(c => c.id === card.dataset.id)
  if (handIndex == -1) {
    return;
  }
  discardDeck.push(handCards.splice(handIndex, 1))
  doEffect(card.dataset.effect)
  removeCard(card);
  updateHand();
}

function createCard(data) {
  let card = document.createElement("div");
  let textPrefix = {
    costCoins: "🪙",
    buyCost: "🪙",
    costDiamonds: "💎"
  }
  card.classList.add("card")
  card.id = domId(data.id);
  for (let name of ["costCoins", "costDiamonds", "effectText", "buyCost", "effect", "id"]) {
    if (!["effect", "id"].includes(name)) {
      let el = document.createElement("div");
      el.classList.add(name)
      el.innerHTML = (textPrefix[name] ?? "") + data[name]
      card.appendChild(el)
    }
    card.setAttribute("data-" + name, data[name])
  }
  card.addEventListener("click", evt => {
    playCard(evt.target)
  })
  return card;
}

function loadCards() {
  fetch('cards.csv')
  .then(response => response.text())
  .then(csvText => {
    Papa.parse(csvText, {
      header: true,
      complete: function(results) {
        console.log(results.data); // JSON object
        cardData.push(...results.data);
        loaded = true;
        finishLoad();
      }
    });
  });
}

onload = main;