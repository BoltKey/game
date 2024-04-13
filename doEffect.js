import { createFlyer } from "./flyers.js";
import { resources } from "./globals.js";

export function doEffect(effect, sourceComponent) {
  console.log(effect)
  let emojiDictionary = {
    "💎": "diamond",
    "🪙": "coin",
    "💖": "heart",
    "⭐": "vp"
  }
  if (effect.startsWith("[")) {
    effect = JSON.parse(effect)
  }
  else {
    effect = [effect, 1]
  }
  let effectName = effect[0];
  if (emojiDictionary[effectName]) {
    effectName = emojiDictionary[effectName]
  }

  switch(effectName) {
    case "coin": case "diamond": case "heart": case "vp":
      resources[effectName] += effect[1]
      for (let i in effect[1]) {
        setTimeout(() => {
          createFlyer("FLY", sourceComponent)
        })
      }
      break;
  }
}