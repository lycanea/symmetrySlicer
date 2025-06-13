const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const tileSize = 32;
const tileColor1 = '#e0e7ff';
const tileColor2 = '#b6c6f5';
const scrollSpeed = 0.3;
let offsetY = 0;

let isDragging = false;
let dragStart = null;
let dragEnd = null;

let confirmedLine = null;

let lastDebugImages = null;

let score = 0;
let totalScore = 0;
let currentShape = "square";
const shapes = [
    "square",
    "triangle",
    "rightTriangle",
    "star",
    "pentagon",
    "hexagon",
    "heart",
    "diamond"
];

function drawTiles(offsetY) {
    for (let y = -tileSize; y < canvas.height + tileSize; y += tileSize) {
        for (let x = 0; x < canvas.width; x += tileSize) {
            const isEven = ((Math.floor((y + offsetY) / tileSize) + Math.floor(x / tileSize)) % 2) === 0;
            ctx.fillStyle = isEven ? tileColor1 : tileColor2;
            ctx.fillRect(x, y + (offsetY % tileSize), tileSize, tileSize);
        }
    }
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    dragStart = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    dragEnd = null;
    isDragging = true;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    dragEnd = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
});

canvas.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    dragEnd = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    isDragging = false;
});

function drawUserLine() {
    if (dragStart && dragEnd) {
        ctx.save();
        ctx.strokeStyle = '#ff3b3b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragEnd.x, dragEnd.y);
        ctx.stroke();
        ctx.restore();
    }
}

const confirmButton = document.getElementById('confirmButton');
confirmButton.addEventListener('click', () => {
    if (dragStart && dragEnd && !confirmedLine) {
        confirmedLine = { start: { ...dragStart }, end: { ...dragEnd } };
        dragStart = null;
        dragEnd = null;
        cutShapeWithLine(confirmedLine);
    }
});

function drawShapeToContext(ctx, shapeType, size, imageSrc = null, onReady = null, x = 0, y = 0) {
    ctx.save();
    if (imageSrc) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, x, y, size, size);
            ctx.restore();
            if (onReady) onReady();
        };
        img.src = imageSrc;
    } else {
        ctx.fillStyle = '#2563c9';
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 4;
        if (shapeType === "square") {
            ctx.fillRect(x, y, size, size);
            ctx.strokeRect(x, y, size, size);
        } else if (shapeType === "triangle") {
            const baseWidth = size * 0.9;
            const height = size * 0.95;
            const xCenter = x + size / 2;
            const yTop = y + (size - height) / 2;
            ctx.beginPath();
            ctx.moveTo(xCenter, yTop);
            ctx.lineTo(xCenter - baseWidth / 2, yTop + height);
            ctx.lineTo(xCenter + baseWidth / 2, yTop + height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (shapeType === "rightTriangle") {
            const base = size * 0.9;
            const height = size * 0.9;
            const xLeft = x + (size - base) / 2;
            const yTop = y + (size - height) / 2;
            ctx.beginPath();
            ctx.moveTo(xLeft, yTop + height);
            ctx.lineTo(xLeft, yTop);
            ctx.lineTo(xLeft + base, yTop + height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (shapeType === "star") {
            const cx = x + size / 2;
            const cy = y + size / 2;
            const spikes = 5;
            const outerRadius = size * 0.45;
            const innerRadius = size * 0.20;
            let rot = Math.PI / 2 * 3;
            let step = Math.PI / spikes;
            ctx.beginPath();
            for (let i = 0; i < spikes; i++) {
                let xOuter = cx + Math.cos(rot) * outerRadius;
                let yOuter = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(xOuter, yOuter);
                rot += step;

                let xInner = cx + Math.cos(rot) * innerRadius;
                let yInner = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(xInner, yInner);
                rot += step;
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (shapeType === "pentagon") {
            const cx = x + size / 2;
            const cy = y + size / 2;
            const r = size * 0.45;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = Math.PI / 2 + i * (2 * Math.PI / 5);
                ctx.lineTo(cx + r * Math.cos(angle), cy - r * Math.sin(angle));
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (shapeType === "hexagon") {
            const cx = x + size / 2;
            const cy = y + size / 2;
            const r = size * 0.45;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = Math.PI / 6 + i * (2 * Math.PI / 6);
                ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (shapeType === "heart") {
            const cx = x + size / 2;
            const cy = y + size * 0.6;
            const r = size * 0.22;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.bezierCurveTo(cx + r, cy - r * 1.5, cx + r * 2, cy + r * 0.5, cx, cy + r * 2);
            ctx.bezierCurveTo(cx - r * 2, cy + r * 0.5, cx - r, cy - r * 1.5, cx, cy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (shapeType === "diamond") {
            const cx = x + size / 2;
            const cy = y + size / 2;
            const w = size * 0.6;
            const h = size * 0.9;
            ctx.beginPath();
            ctx.moveTo(cx, cy - h / 2);
            ctx.lineTo(cx + w / 2, cy);
            ctx.lineTo(cx, cy + h / 2);
            ctx.lineTo(cx - w / 2, cy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
        if (onReady) onReady();
    }
}

function debugDrawSymmetry(maskA, maskB, reflectedData, size) {
    const overlap = ctx.createImageData(size, size);
    for (let i = 0; i < maskA.data.length; i += 4) {
        if (maskA.data[i + 3] > 0 && reflectedData.data[i + 3] > 0) {
            overlap.data[i] = 0;
            overlap.data[i + 1] = 255;
            overlap.data[i + 2] = 0;
            overlap.data[i + 3] = 180;
        } else if (maskA.data[i + 3] > 0) {
            overlap.data[i] = 0;
            overlap.data[i + 1] = 0;
            overlap.data[i + 2] = 255;
            overlap.data[i + 3] = 120;
        } else if (reflectedData.data[i + 3] > 0) {
            overlap.data[i] = 255;
            overlap.data[i + 1] = 0;
            overlap.data[i + 2] = 0;
            overlap.data[i + 3] = 120;
        }
    }
    return { maskA, maskB, reflectedData, overlap, size };
}

function pointLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = len_sq !== 0 ? dot / len_sq : -1;
    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

function checkShapeSymmetry(line, shapeType = "square", debug = false) {
    const size = 160;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const left = centerX - size / 2;
    const top = centerY - size / 2;

    const shapeCanvas = document.createElement('canvas');
    shapeCanvas.width = size;
    shapeCanvas.height = size;
    const shapeCtx = shapeCanvas.getContext('2d');
    drawShapeToContext(shapeCtx, shapeType, size);

    const maskA = shapeCtx.getImageData(0, 0, size, size);
    const maskB = shapeCtx.getImageData(0, 0, size, size);

    const localLine = {
        start: { x: line.start.x - left, y: line.start.y - top },
        end: { x: line.end.x - left, y: line.end.y - top }
    };

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const d = (localLine.end.x - localLine.start.x) * (y - localLine.start.y) -
                      (localLine.end.y - localLine.start.y) * (x - localLine.start.x);
            const idx = (y * size + x) * 4;
            if (d > 0) {
                maskB.data[idx + 3] = 0;
            } else {
                maskA.data[idx + 3] = 0;
            }
        }
    }

    const reflectedCanvas = document.createElement('canvas');
    reflectedCanvas.width = size;
    reflectedCanvas.height = size;
    const reflectedCtx = reflectedCanvas.getContext('2d');

    const maskBCanvas = document.createElement('canvas');
    maskBCanvas.width = size;
    maskBCanvas.height = size;
    maskBCanvas.getContext('2d').putImageData(maskB, 0, 0);

    const dx = localLine.end.x - localLine.start.x;
    const dy = localLine.end.y - localLine.start.y;
    const angle = Math.atan2(dy, dx);

    // god this is such a mess
    // uhh this just does absurd rotation and transformation to do reflection ig
    reflectedCtx.save();
    reflectedCtx.translate(localLine.start.x, localLine.start.y);
    reflectedCtx.rotate(angle);
    reflectedCtx.scale(1, -1);
    reflectedCtx.rotate(-angle);
    reflectedCtx.translate(-localLine.start.x, -localLine.start.y);
    reflectedCtx.drawImage(maskBCanvas, 0, 0);
    reflectedCtx.restore();

    const reflectedData = reflectedCtx.getImageData(0, 0, size, size);

    if (debug) {
        lastDebugImages = debugDrawSymmetry(maskA, maskB, reflectedData, size);
    }

    let total = 0, match = 0;
    for (let i = 0; i < maskA.data.length; i += 4) {
        if (maskA.data[i + 3] > 0 || reflectedData.data[i + 3] > 0) {
            total++;
            if (maskA.data[i + 3] > 0 && reflectedData.data[i + 3] > 0) {
                match++;
            }
        }
    }

    const center = { x: size / 2, y: size / 2 };
    const distToCenter = pointLineDistance(
        center.x, center.y,
        localLine.start.x, localLine.start.y,
        localLine.end.x, localLine.end.y
    );
    const penalty = Math.max(0, 1 - distToCenter / 40);
    return total > 0 ? (match / total) * penalty : 0;
}

function cutShapeWithLine(line) {
    const symmetryScore = checkShapeSymmetry(line, currentShape, false);
    const percent = Math.round(symmetryScore * 100);
    score = percent;
    totalScore += percent;
    updateScoreDisplay();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTiles(offsetY);

    const shapeSize = 160;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    drawShapeToContext(
        ctx,
        currentShape,
        shapeSize,
        null,
        null,
        centerX - shapeSize / 2,
        centerY - shapeSize / 2
    );

    drawUserLine();

    if (confirmedLine) {
        ctx.save();
        ctx.strokeStyle = '#00e6e6';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(confirmedLine.start.x, confirmedLine.start.y);
        ctx.lineTo(confirmedLine.end.x, confirmedLine.end.y);
        ctx.stroke();
        ctx.restore();
    }

    // debug stuff
    if (lastDebugImages) {
        const { maskA, maskB, reflectedData, overlap, size } = lastDebugImages;
        ctx.putImageData(maskA, 10, 10);
        ctx.putImageData(maskB, 20 + size, 10);
        ctx.putImageData(reflectedData, 30 + size * 2, 10);
        ctx.putImageData(overlap, 40 + size * 3, 10);

        ctx.save();
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "#222";
        ctx.fillText("Side A", 10, 10 + size + 16);
        ctx.fillText("Side B", 20 + size, 10 + size + 16);
        ctx.fillText("Reflected B", 30 + size * 2, 10 + size + 16);
        ctx.fillText("Overlap", 40 + size * 3, 10 + size + 16);
        ctx.restore();
    }

    offsetY += scrollSpeed;
    if (offsetY >= tileSize * 2) offsetY = 0;
    requestAnimationFrame(animate);
}

function getRandomShape() {
    return shapes[Math.floor(Math.random() * shapes.length)];
}

function updateScoreDisplay() {
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('totalScore').textContent = `Total Score: ${totalScore}`;
}

function resetShape() {
    currentShape = getRandomShape();
    confirmedLine = null;
    dragStart = null;
    dragEnd = null;
    lastDebugImages = null;
    score = 0;
    updateScoreDisplay();
}

document.getElementById('startButton').addEventListener('click', () => {
    score = 0;
    totalScore = 0;
    updateScoreDisplay();
    resetShape();
});

const continueBtn = document.getElementById('continueButton');

continueBtn.addEventListener('click', () => {
    resetShape();
});

window.addEventListener('DOMContentLoaded', () => {
    resetShape();
    updateScoreDisplay();
    animate();
});