import { doEffect } from "./doEffect.js";
import { activeMonsters, cardData, discardDeck, drawDeck, handCards, monsterQueue, resources, summonedCards, supplyDeck, supplyOffer } from "./globals.js";
import { domId, monsterAttack, updateGame } from "./update.js";

let loaded = false;



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
  document.getElementById("game-wrap").classList.remove("hidden")
  let deck = cardData.filter(card => card.tier === "s").toShuffled();
  drawDeck.push(...deck)

  let offer = cardData.filter(card => card.tier === "1" && card.type === "action").toShuffled();
  supplyDeck.push(...offer);
  for (let i = 0; i < 4; ++i) {
    supplyOffer.push(supplyDeck.shift())
  }

  for (let row = 0; row < monsterQueue.length; ++row) {
    let monsters = cardData.filter(c => c.tier == row && c.tier !== "" && c.type === "monster");
    monsterQueue[row].push(...monsters);
  }

  doEffect(["draw", 3]);
  for (let resName of ["heart", "coin", "diamond", "vp"]) {
    document.getElementById(resName + "-number").innerText = resources[resName]
  }
  updateGame();
  /*for (let card of cardData) {
    document.getElementById("game-wrap").appendChild(createCard(card));
  }*/
  document.getElementById("endturn").onclick = endTurn;
}

function endTurn() {
  doEffect(["coin", resources.sword]);
  doEffect(["sword", -resources.sword]);
  for (let c of summonedCards) {
    let effect = c.effect;
    doEffect(effect, document.getElementById(domId(c.id)));
  }
  for (let c of handCards) {
    doEffect(["coin", -1], document.getElementById(domId(c.id)));
  }
  for (let c of activeMonsters) {
    let cost = c.defendCost;
    doEffect(["coin", -cost], document.getElementById(domId(c.id)));
  }
  moveMonsters();
  updateGame();
  doEffect(["draw", 3])
}

function moveMonsters() {
  let firstRow = monsterQueue.shift();;
  for (let m of firstRow) {
    activeMonsters.push(m);
    monsterAttack(document.getElementById(domId(m.id)));
  }
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