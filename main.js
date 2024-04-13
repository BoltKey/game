function main() {
  let card = {
    costCoins: 5,
    costDiamonds: 1,
    buyCost: 3,
    effect: [["coins", 3]],
    effectText: "🪙🪙💖"
  }
  document.getElementById("game-wrap").appendChild(createCard(card));
}

function createCard(data) {
  let card = document.createElement("div");
  let textPrefix = {
    costCoins: "🪙",
    buyCost: "🪙",
    costDiamonds: "💎"
  }
  card.classList.add("card")
  for (let name of ["costCoins", "costDiamonds", "effectText", "buyCost"]) {
    let el = document.createElement("div");
    el.classList.add(name)
    el.innerHTML = (textPrefix[name] ?? "") + data[name]
    card.appendChild(el)
  }
  return card;
}

onload = main;