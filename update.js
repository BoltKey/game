import { doEffect } from "./doEffect.js";
import { activeMonsters, discardDeck, drawDeck, handCards, monsterQueue, resources, status, summonedCards, supplyDeck, supplyOffer } from "./globals.js";

export function updateGame() {
  updateHand();
  updateSummoned();
  updateOffer();
  updateDeckNumbers();
  updateMonsterQueue();
  updateActiveMonsters();
}
export function updateHand() {
  updateCards(handCards, 350, 250, 120, 530, 0.8);
}
export function updateSummoned() {
  updateCards(summonedCards, 350, 110, 100, 600, 0.4);
}
export function updateOffer() {
  updateCards(supplyOffer, 350, -10, 140, 600, 0.7);
}
function updateActiveMonsters() {
  updateCards(activeMonsters, 380, 380, 140, 500, 0.5)
}
export function updateMonsterQueue() {
  for (let row = 0; row <= 5; ++row) {
    let rowWrap = document.getElementById("monsters");
    if (!rowWrap) {
      return;
    }
    let y = [260, 125, 35, -5, -35, -60]
    if (monsterQueue[row]) {
      updateCards(monsterQueue[row], 800, y[row], 100 - row * 10, 600, 0.7 - row * 0.1);
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

  let zIndex = 20
  for (let card of cards) {
    let currCard = document.getElementById(domId(card.id));
    if (!currCard) {
      currCard = createCard(card);
      wrap.appendChild(currCard);
    }
    currCard.style.left = currX + "px";
    currCard.style.top = y + "px";
    currCard.style.zIndex = zIndex;
    ++zIndex

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
    else {
      currCard.querySelector(".summon-button")?.remove()
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
      case summonedCards:
        location = "summoned"
        break;
      case activeMonsters:
        location = "activeMonsters"
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
    if (evt.offsetY > 50) {
      playCard(evt.target)
    }
  })
  return card;
}


export function domId(id) {
  return "card-" + id;
}


function playCard(card) {
  if (status.eval) {
    return;
  }
  if (card.dataset.type === "monster" && card.dataset.location === "activeMonsters") {
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
  doEffect(card.dataset.effect, card, false, 350)
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
  if (card.name === "The Dark Lord") {
    gameWin();
  }
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
  doEffect(["coin", -costCoins], card, false, 500)
  doEffect(["diamond", -costDiamonds], card, false, 500)
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
    { transform: "scale(1.1, 1.1) translate(0, 0)", opacity: 1, zIndex: 100},
    { transform: "scale(1.3, 1.3) translate(0, -100px)", opacity: 1},
    { transform: "scale(1.3, 1.3) translate(0, -100px)", opacity: 1},
    { transform: "scale(1.3, 1.3) translate(0, -100px)", opacity: 1},
    { transform: "scale(0.7, 0.7) translate(400px, -20px)", opacity: 0},
  ], {duration: 1000, fill: "forwards", easing: "ease-in-out"})
  animation.onfinish = () => {
    console.log("animation complete");
    card.remove()
  }
}

function gainCardAnim(card) {
  let animation = card.animate([
    { transform: "scale(1.1, 1.1) translate(0, 0)", opacity: 1, zIndex: 10},
    { opacity: 1},
    { transform: "scale(1.3, 1.3) translate(100px, 100px)", opacity: 0},
  ], {duration: 2000, fill: "forwards", easing: "ease-in-out"})
  animation.onfinish = () => {
    console.log("animation complete");
    card.remove()
  }
}

function banishCard(card) {
  let animation = card.animate([
    { transform: "scale(1.1, 1.1) translate(0, 0)", opacity: 1, zIndex: 100},
    { transform: "scale(0.7, 0.7) translate(0px, 60px)", opacity: 0},
  ], {duration: 2000, fill: "forwards", easing: "ease-in-out"})
  animation.onfinish = () => {
    console.log("animation complete");
    card.remove()
    updateGame();
  }
}

export function monsterAttack(card) {
  /*let animation = card.animate([
    { transform: "scale(1, 1)", },
    { transform: "scale(1.1, 1.1)", },
    { transform: "scale(1, 1)", },
  ], {duration: 2000, fill: "forwards", easing: "ease-in-out"})
  animation.onfinish = () => {
  }*/
}

export function gameOver() {
  status.gameEnded = true;
  document.getElementById("gameover").classList.remove("hidden")
}

export function gameWin() {
  status.gameEnded = true;
  document.getElementById("gamewin").classList.remove("hidden")
  let score = resources.coin + 3 * resources.diamond;
  document.getElementById("scorenumber").innerText = score;

}