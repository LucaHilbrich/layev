const canvas = document.getElementById('myCanvas');
const main = document.querySelector('main');

function resizeCanvas() {
    canvas.width = main.offsetWidth;
    canvas.height = main.offsetHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
