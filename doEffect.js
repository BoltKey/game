import { createFlyer } from "./flyers.js";
import { discardDeck, drawDeck, emojiDictionary, handCards, resources } from "./globals.js";
import { updateGame } from "./update.js";


const coinValues = {
  "sword": 5,
  "diamond": 10
}
export function doEffect(effect, sourceComponent) {
  console.log(effect)

  if (typeof effect === "string") {
    if (effect.startsWith("[")) {
      effect = JSON.parse(effect)

    }
    else {
      effect = [effect, 1]
    }
  }
  let effectName = effect[0];
  if (emojiDictionary[effectName]) {
    effectName = emojiDictionary[effectName]
  }

  switch(effectName) {
    case "coin": case "diamond": case "heart": case "vp": case "sword":
      let amt = effect[1]
      if (amt < -resources[effectName]) {
        amt = -resources[effectName]
        let missing = effect[1] - amt;
        let coinCost = missing * coinValues[effectName];
        if (!coinCost) {
          throw new Error("Not enough resources")

        }
        doEffect(["coin", coinCost], sourceComponent);
      }
      if (amt < -resources[effectName]) {
        throw new Error("Not enough resources")
      }
      resources[effectName] += amt
      setTimeout(() => {
        let neg = amt < 0;
        for (let i = 0; i < Math.abs(amt); ++i) {
          setTimeout(() => {
            createFlyer(effect[0], sourceComponent, neg)
          }, i * 100)
          setTimeout(() => {
            let currNum = document.getElementById(effectName + "-number").innerText
            document.getElementById(effectName + "-number").innerText = +currNum + (neg ? -1 : 1)
          }, i * 100 + (neg ? 10 : 1000))
        }
      }, 1000)
      break;
    case "draw":
      for (let i = 0; i < effect[1]; ++i) {
        if (drawDeck.length === 0) {
          shuffleCards();
        }
        if (drawDeck.length === 0) {
          updateGame()
          break;
        }
        handCards.push(drawDeck.shift())
      }
      updateGame()
      break;
  }
}

function shuffleCards() {
  while (discardDeck.length) {
    drawDeck.push(discardDeck.splice(
      Math.floor(discardDeck.length * Math.random()
    ), 1)[0]);
  }
}