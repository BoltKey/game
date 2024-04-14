import { doEffect } from "./doEffect.js";
import { activeMonsters, discardDeck, drawDeck, handCards, monsterQueue, summonedCards, supplyDeck, supplyOffer } from "./globals.js";

export function updateGame() {
  updateHand();
  updateSummoned();
  updateOffer();
  updateDeckNumbers();
  updateMonsterQueue();
  updateActiveMonsters();
}
export function updateHand() {
  updateCards(handCards, 350, 550, 140, 600);
}
export function updateSummoned() {
  updateCards(summonedCards, 350, 350, 100, 600);
}
export function updateOffer() {
  updateCards(supplyOffer, 350, 50, 140, 600);
}
function updateActiveMonsters() {
  updateCards(activeMonsters, 930, 780, 140, 600)
}
export function updateMonsterQueue() {
  for (let row = 0; row <= 5; ++row) {
    let rowWrap = document.getElementById("monsters");
    if (!rowWrap) {
      return;
    }
    let y = [570, 420, 320, 230, 150, 100]
    if (monsterQueue[row]) {
      updateCards(monsterQueue[row], 930, y[row], 140, 600, 0.7 - row * 0.1);
    }
  }
}
export function updateDeckNumbers() {
  document.getElementById("deck-number").innerText = drawDeck.length;
  document.getElementById("discard-number").innerText = discardDeck.length;
}

const offerSize = 4
export function refillOffer() {
  while (supplyOffer.length < offerSize) {
    if (supplyDeck.length == 0) {
      break;
    }
    supplyOffer.push(supplyDeck.shift())

  }
}

function updateCards(cards, x, y, margin, maxWidth, scale = 1) {
  let wrap = getHandDiv();
  let finalMargin = Math.min(margin, maxWidth / (cards.length - 1))
  let currX = x - (cards.length - 1) / 2 * finalMargin;

  for (let card of cards) {
    let currCard = document.getElementById(domId(card.id));
    if (!currCard) {
      currCard = createCard(card);
      wrap.appendChild(currCard);
    }
    currCard.style.left = currX + "px";
    currCard.style.top = y + "px";
    currCard.children[0].style.transform = "scale(" + scale + ", " + scale + ")";
    if (cards === handCards) {
      if (!currCard.querySelector(".summon-button") && currCard.dataset.type !== "monster") {
        let button = document.createElement("button")
        button.classList.add("summon-button");
        button.innerText = "🪄"
        button.onclick = (evt) => {
          summonCard(evt.target.parentNode)
        }
        currCard.appendChild(button)
      }
    }
    let location = "";
    switch(cards) {
      case discardDeck:
        location = "discard"
        break;
      case supplyOffer:
        location = "supplyOffer"
        break;
      case handCards:
        location = "hand"
        break;
    }
    currCard.setAttribute("data-location", location)
    currX += finalMargin;
  }

  for (let card of wrap.querySelectorAll(".card")) {
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
    defendCost: "🪙",
    costDiamonds: "💎",
    costSword: "⚔️",
    banishVp: "⭐"
  }
  card.classList.add("card-wrap", data.type)

  let scaleWrap = document.createElement("div")
  scaleWrap.classList.add("scale-wrap", "card")
  card.appendChild(scaleWrap)
  card.id = domId(data.id);
  for (let name of Object.keys(data)) {
    if (!["effect", "id", "type", "tier", "startRow", "defendCost"].includes(name)) {
      if (data[name]) {
        let el = document.createElement("div");
        el.classList.add(name)
        el.innerHTML = (textPrefix[name] ?? "") + data[name]
        scaleWrap.appendChild(el)

      }
    }
    card.setAttribute("data-" + name, data[name])
  }
  card.addEventListener("click", evt => {
    console.log(evt)
    if (evt.target.dataset.location === "supplyOffer") {
      gainCard(evt.target)
    }
    if (evt.offsetY > 100) {
      playCard(evt.target)
    }
  })
  return card;
}


export function domId(id) {
  return "card-" + id;
}


function playCard(card) {
  if (card.dataset.type === "monster") {
    killCard(card);
    return;
  }
  console.log("play card", card);
  card.id += "-played"
  let handIndex = handCards.findIndex(c => c.id === card.dataset.id)
  if (handIndex == -1) {
    return;
  }
  let playCard = handCards.splice(handIndex, 1)[0]
  doEffect(card.dataset.effect, card)
  discardDeck.push(playCard)
  removeCard(card);
  updateGame();
}

function gainCard(card) {
  console.log("gain card", card);
  let handIndex = supplyOffer.findIndex(c => c.id === card.dataset.id)
  if (handIndex == -1) {
    return;
  }
  let gainCost = card.dataset.buycost;
  doEffect(["coin", -gainCost], card)
  discardDeck.push(supplyOffer.splice(handIndex, 1)[0])
  refillOffer();
  gainCardAnim(card);
  updateGame();
}

function killCard(card) {
  let costSwords = card.dataset.costsword || 0
  doEffect(["sword", -costSwords], card)
  doEffect(["vp", card.dataset.banishvp], card)
  let handIndex = activeMonsters.findIndex(c => c.id === card.dataset.id)
  activeMonsters.splice(handIndex, 1)[0]
  banishCard(card)
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
  doEffect(["coin", -costCoins], card)
  doEffect(["diamond", -costDiamonds], card)
  let c = handCards.splice(handIndex, 1)[0]
  summonedCards.push(c)
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

function gainCardAnim(card) {
  let animation = card.animate([
    { transform: "scale(1.1, 1.1) translate(0, 0)", opacity: 1, zIndex: 10},
    { opacity: 1},
    { transform: "scale(1.3, 1.3) translate(300px, 200px)", opacity: 0},
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

export function monsterAttack(card) {
  let animation = card.animate([
    { transform: "scale(1, 1)", },
    { transform: "scale(1.1, 1.1)", },
    { transform: "scale(1, 1)", },
  ], {duration: 2000, fill: "forwards", easing: "ease-in-out"})
  animation.onfinish = () => {
  }
}