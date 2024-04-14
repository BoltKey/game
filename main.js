import { doEffect } from "./doEffect.js";
import { activeMonsters, cardData, discardDeck, drawDeck, handCards, monsterQueue, resources, status, summonedCards, supplyDeck, supplyOffer } from "./globals.js";
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

function toggleHelp() {
  status.helpOpen = !status.helpOpen;
  if (status.helpOpen) {
    document.getElementById("rules").classList.add("open")
  }
  else {
    document.getElementById("rules").classList.remove("open")
  }
}

function startGame() {
  for (let card of document.querySelectorAll(".card-wrap")) {
    card.remove();
  }
  status.gameEnded = false
  document.getElementById("gameover").classList.add("hidden")

  resources.coin = 6;
  resources.diamond = 3;
  resources.sword = 0;
  document.getElementById("game-wrap").classList.remove("hidden")
  let deck = cardData.filter(card => card.tier === "s").toShuffled();
  drawDeck.length = 0;
  handCards.length = 0;
  summonedCards.length = 0;
  activeMonsters.length = 0;
  drawDeck.push(...deck)

  let offer = cardData.filter(card => card.tier === "1" && card.type === "action").toShuffled();
  supplyDeck.length = 0;
  supplyOffer.length = 0;
  for (let row of monsterQueue) {
    row.length = 0;
  }

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
  document.getElementById("close-help").onclick = toggleHelp;
  document.getElementById("help").onclick = toggleHelp;
  document.getElementById("tryagain").onclick = startGame;
}

async function endTurn() {
  doEffect(["coin", resources.sword]);
  doEffect(["sword", -resources.sword]);
  status.eval = true;
  document.getElementById("endturn").setAttribute("disabled", true)

  if (summonedCards.length) {
    for (let c of summonedCards) {
    let effect = c.effect;
      doEffect(effect, document.getElementById(domId(c.id)));
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (handCards.length || activeMonsters.length) {
    for (let c of handCards) {
      doEffect(["coin", -1], document.getElementById(domId(c.id)));
    }
    for (let c of activeMonsters) {
      let cost = c.defendCost;
      if (c.name === "The Dark Lord") {
        cost = bossStrength();
        resources.bossTurns += 1;
        document.querySelector("#card-51 .effectText").innerText = "-" + bossStrength() + "🪙";
      }
      doEffect(["coin", -cost], document.getElementById(domId(c.id)));
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  moveMonsters();
  await new Promise(resolve => setTimeout(resolve, 1000));
  document.getElementById("endturn").removeAttribute("disabled")
  status.eval = false;
  updateGame();
  doEffect(["draw", 3])
}

function bossStrength() {
  return 10 + resources.bossTurns * 4;
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