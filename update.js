import { doEffect } from "./doEffect.js";
import { discardDeck, handCards, summonedCards, supplyOffer } from "./globals.js";

export function updateGame() {
  updateHand();
  updateSummoned();
  updateOffer();
}
export function updateHand() {
  updateCards(handCards, 350, 550, 140, 600);
}
export function updateSummoned() {
  updateCards(summonedCards, 350, 350, 100, 600, 0.7);
}
export function updateOffer() {
  updateCards(supplyOffer, 350, 50, 140, 600);
}

function updateCards(cards, x, y, margin, maxWidth, scale = 1) {

  let finalMargin = Math.min(margin, maxWidth / (cards.length - 1))
  let currX = x - (cards.length - 1) / 2 * finalMargin;

  for (let card of cards) {
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
    if (!cards.find(c => domId(c.id) === card.id)) {
      //removeCard(card);
    }
  }
}

function createCard(data) {
  let card = document.createElement("div");
  let textPrefix = {
    costCoins: "🪙",
    buyCost: "🪙",
    costDiamonds: "💎",
    costSword: "⚔️",
    banishVp: "⭐"
  }
  card.classList.add("card", data.type)

  card.id = domId(data.id);
  for (let name of Object.keys(data)) {
    if (!["effect", "id", "type", "tier"].includes(name)) {
      if (data[name]) {
        let el = document.createElement("div");
        el.classList.add(name)
        el.innerHTML = (textPrefix[name] ?? "") + data[name]
        card.appendChild(el)

      }
    }
    card.setAttribute("data-" + name, data[name])
  }
  card.addEventListener("click", evt => {
    console.log(evt)
    if (evt.offsetY < 100) {
      summonCard(evt.target);
    }
    else {
      playCard(evt.target)
    }
  })
  return card;
}


export function domId(id) {
  return "card-" + id;
}


function playCard(card) {
  console.log("play card", card);
  card.id += "-played"
  let handIndex = handCards.findIndex(c => c.id === card.dataset.id)
  if (handIndex == -1) {
    return;
  }
  discardDeck.push(handCards.splice(handIndex, 1)[0])
  doEffect(card.dataset.effect, card)
  removeCard(card);
  updateHand();
}

function summonCard(card) {
  console.log("summon card", card);
  let handIndex = handCards.findIndex(c => c.id === card.dataset.id)
  if (handIndex == -1) {
    return;
  }
  let type = card.dataset.type;
  let costDiamonds = card.dataset.costdiamonds || 0
  let costCoins = card.dataset.costcoins || 0
  let costSwords = card.dataset.costsword || 0
  doEffect(["coin", -costCoins], card)
  doEffect(["diamond", -costDiamonds], card)
  doEffect(["sword", -costSwords], card)
  let c = handCards.splice(handIndex, 1)[0]
  if (type === "monster") {
    banishCard(card)
  }
  else {
    summonedCards.push(c)
  }
  updateGame();
}

function getHandDiv() {
  return document.getElementById("hand-wrap")
}

function getPlayArea() {
  return document.getElementById("game-wrap")
}



function removeCard(card) {
  let animation = card.animate([
    { transform: "scale(1.1, 1.1) translate(0, 0)", opacity: 1, zIndex: 10},
    { transform: "scale(1.3, 1.3) translate(0, -200px)", opacity: 1},
    { transform: "scale(1.3, 1.3) translate(0, -200px)", opacity: 1},
    { transform: "scale(0.7, 0.7) translate(100px, 30px)", opacity: 0},
  ], {duration: 2000, fill: "forwards", easing: "ease-in-out"})
  animation.onfinish = () => {
    console.log("animation complete");
    card.remove()
  }
}

function banishCard(card) {
  let animation = card.animate([
    { transform: "scale(1.1, 1.1) translate(0, 0)", opacity: 1, zIndex: 10},
    { transform: "scale(0.7, 0.7) translate(0px, 60px)", opacity: 0},
  ], {duration: 2000, fill: "forwards", easing: "ease-in-out"})
  animation.onfinish = () => {
    console.log("animation complete");
    card.remove()
  }
}