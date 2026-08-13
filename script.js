/* ========== MAIN SLIDER ========== */
const slidesWrapper = document.getElementById("slidesWrapper");
let currentSlide = 0;

function goToSlide(index) {
currentSlide = index;
slidesWrapper.style.transform = translateX(-${index * 50}%); /* 100% / 2 = 50% */

/* When NEW CARD opens, start from Type 1 */
if (index === 1) {
resetNewCard();
}
}

/* ========== SLIDE 1 ========== */
function c1MoveNo() {
const btn = document.getElementById("c1-noBtn");
const x = (Math.random() - 0.5) * 180;
const y = (Math.random() - 0.5) * 100;
btn.style.transform = translate(${x}px, ${y}px);
}

function c1HandleYes() {
document.getElementById("c1-actionArea").style.display = "none";
document.getElementById("c1-successMsg").style.display = "block";
}

/* ========== NEW CARD — TYPE 1 ========== */
let photoClicks = 0;

function cyclePhotos() {
const stack = document.getElementById("photoStack");
const cards = stack.querySelectorAll(".memory-card");
if (!cards.length) return;

const firstCard = cards[0];
firstCard.style.transform = "translateY(-180px) rotate(25deg)";
firstCard.style.opacity = "0";

setTimeout(() => {
stack.appendChild(firstCard);
firstCard.style.transition = "none";
firstCard.style.transform = "";
firstCard.style.opacity = "1";
setTimeout(() => {
firstCard.style.transition = "transform.45s ease, opacity.35s ease";
}, 50);
}, 350);

photoClicks++;

/* After 4 memories → bow game */
if (photoClicks >= 4) {
setTimeout(() => {
openBowGame();
}, 700);
}
}

/* ========== TYPE 2 → BOW GAME ========== */
function openBowGame() {
document.getElementById("newStage1").style.display = "none";
document.getElementById("newStage2").style.display = "flex";
initBowGame();
}

/* ========== BOW GAME ========== */
let bowStarted = false;

function initBowGame() {
if (bowStarted) return;
bowStarted = true;

const canvas = document.getElementById("loveCanvas");
const ctx = canvas.getContext("2d");
const parent = canvas.parentElement;

canvas.width = parent.clientWidth;
canvas.height = parent.clientHeight;

let bow = { x: canvas.width / 2, y: canvas.height - 100 };
let drag = { x: bow.x, y: bow.y };
let arrow = { x: bow.x, y: bow.y, vx: 0, vy: 0 };
let dragging = false;
let released = false;
let target = { x: canvas.width / 2, y: 150, size: 42, hit: false };
let particles = [];

function drawHeart(x, y, size) {
ctx.save();
ctx.translate(x, y);
ctx.fillStyle = "#ff3366";
ctx.beginPath();
ctx.moveTo(0, size *.8);
ctx.bezierCurveTo(-size, size *.2, -size, -size *.6, 0, -size *.15);
ctx.bezierCurveTo(size, -size *.6, size, size *.2, 0, size *.8);
ctx.fill();
ctx.restore();
}

function drawBow() {
ctx.strokeStyle = "#693f50";
ctx.lineWidth = 4;
ctx.beginPath();
ctx.arc(bow.x, bow.y, 42, Math.PI *.15, Math.PI *.85);
ctx.stroke();

ctx.strokeStyle = "#c9879e";  
ctx.lineWidth = 2;  
ctx.beginPath();  
ctx.moveTo(bow.x - 40, bow.y - 8);  
ctx.lineTo(drag.x, drag.y);  
ctx.lineTo(bow.x + 40, bow.y - 8);  
ctx.stroke();

}

function drawArrow(x, y) {
ctx.strokeStyle = "#573745";
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(x, y + 25);
ctx.lineTo(x, y - 25);
ctx.stroke();
drawHeart(x, y - 32, 9);
}

function explode(x, y) {
for (let i = 0; i < 25; i++) {
particles.push({
x: x, y: y,
vx: (Math.random() -.5) * 7,
vy: (Math.random() -.5) * 7,
size: Math.random() * 10 + 7,
life: 1
});
}
}

function getPosition(e) {
const rect = canvas.getBoundingClientRect();
const point = e.touches? e.touches[0] : e;
return { x: point.clientX - rect.left, y: point.clientY - rect.top };
}

function startDrag(e) {
if (released) return;
dragging = true;
e.preventDefault();
}

function moveDrag(e) {
if (!dragging) return;
const pos = getPosition(e);
drag.x = bow.x + (pos.x - bow.x) *.25;
drag.y = Math.min(bow.y + 70, Math.max(bow.y, pos.y));
e.preventDefault();
}

function releaseArrow() {
if (!dragging) return;
dragging = false;
released = true;
const pull = drag.y - bow.y;
arrow.x = bow.x;
arrow.y = bow.y;
arrow.vy = -Math.max(pull *.45, 8);
arrow.vx = (bow.x - drag.x) *.25;
}

canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mousemove", moveDrag);
window.addEventListener("mouseup", releaseArrow);
canvas.addEventListener("touchstart", startDrag, { passive: false });
canvas.addEventListener("touchmove", moveDrag, { passive: false });
window.addEventListener("touchend", releaseArrow);

function animate() {
ctx.clearRect(0, 0, canvas.width, canvas.height);

if (!target.hit) drawHeart(target.x, target.y, target.size);  
drawBow();  

if (!released) {  
  drawArrow(drag.x, drag.y);  
} else {  
  arrow.x += arrow.vx;  
  arrow.y += arrow.vy;  
  drawArrow(arrow.x, arrow.y);  

  const distance = Math.hypot(arrow.x - target.x, arrow.y - target.y);  
  if (distance < target.size &&!target.hit) {  
    target.hit = true;  
    explode(target.x, target.y);  
    setTimeout(openFinalScreen, 1000);  
  }  
  if (arrow.y < -50 || arrow.y > canvas.height + 50) {  
    released = false;  
    drag.x = bow.x;  
    drag.y = bow.y;  
    arrow.x = bow.x;  
    arrow.y = bow.y;  
  }  
}  

particles.forEach((p, index) => {  
  p.x += p.vx;  
  p.y += p.vy;  
  p.life -=.02;  
  ctx.globalAlpha = Math.max(0, p.life);  
  drawHeart(p.x, p.y, p.size);  
  ctx.globalAlpha = 1;  
  if (p.life <= 0) particles.splice(index, 1);  
});  

requestAnimationFrame(animate);

}
animate();
}

/* ========== TYPE 3 — FINAL ========== */
function openFinalScreen() {
document.getElementById("newStage2").style.display = "none";
document.getElementById("newStage3").style.display = "flex";
}

/* ========== RESET NEW CARD ========== */
function resetNewCard() {
document.getElementById("newStage1").style.display = "flex";
document.getElementById("newStage2").style.display = "none";
document.getElementById("newStage3").style.display = "none";
photoClicks = 0;
bowStarted = false;
}
