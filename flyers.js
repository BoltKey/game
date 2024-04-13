export function createFlyer(content, from, to) {
  let wrap = document.getElementById("game-wrap");
  let fromRect = from.getBoundingClientRect();
  let fromX = fromRect.left + fromRect.width / 2
  let fromY = fromRect.top + fromRect.height / 2

  let flyer = document.createElement("div")
  flyer.style.left = fromX + "px"
  flyer.style.top = fromY + "px"
  flyer.classList.add("flyer")

  flyer.innerHTML = content;

  wrap.appendChild(flyer)
}