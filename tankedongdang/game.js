// 坦克动荡游戏 - Tank Trouble
// 基于Canvas实现的双人坦克对战游戏

// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏常量
const WALL_THICKNESS = 3;
const TANK_SIZE = 30;
const BULLET_SIZE = 4;
const BULLET_SPEED = 4;
const TANK_SPEED = 1.5;
const TANK_ROTATION_SPEED = 0.04;

// 游戏状态
let gameState = {
    player1Score: 0,
    player2Score: 0,
    isPlaying: true
};

// 地图定义 (0 = 空地, 1 = 墙壁)
const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;
const CELL_SIZE = 40;
const COLS = MAP_WIDTH / CELL_SIZE;
const ROWS = MAP_HEIGHT / CELL_SIZE;

// 迷宫地图数据 (简单迷宫)
const mazeMap = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,0,0,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// 坦克类
class Tank {
    constructor(x, y, color, playerId) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.color = color;
        this.playerId = playerId;
        this.speed = TANK_SPEED;
        this.bullets = [];
        this.lastShotTime = 0;
        this.shotCooldown = 800; // 射击冷却时间(ms)
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // 绘制坦克底座
        ctx.fillStyle = this.color;
        ctx.fillRect(-TANK_SIZE/2, -TANK_SIZE/2, TANK_SIZE, TANK_SIZE);

        // 绘制坦克炮塔
        ctx.fillStyle = '#34495e';
        ctx.beginPath();
        ctx.arc(0, 0, TANK_SIZE/3, 0, Math.PI * 2);
        ctx.fill();

        // 绘制炮管
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, -4, TANK_SIZE/2, 8);

        ctx.restore();
    }

    move(keys, leftKey, rightKey, upKey, downKey) {
        // 旋转
        if (keys[leftKey]) {
            this.angle -= TANK_ROTATION_SPEED;
        }
        if (keys[rightKey]) {
            this.angle += TANK_ROTATION_SPEED;
        }

        // 移动
        let dx = 0;
        let dy = 0;

        if (keys[upKey]) {
            dx = Math.cos(this.angle) * this.speed;
            dy = Math.sin(this.angle) * this.speed;
        }
        if (keys[downKey]) {
            dx = -Math.cos(this.angle) * this.speed;
            dy = -Math.sin(this.angle) * this.speed;
        }

        // 碰撞检测
        let newX = this.x + dx;
        let newY = this.y + dy;

        if (!this.checkCollision(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }

        // 边界检测
        this.x = Math.max(TANK_SIZE, Math.min(MAP_WIDTH - TANK_SIZE, this.x));
        this.y = Math.max(TANK_SIZE, Math.min(MAP_HEIGHT - TANK_SIZE, this.y));
    }

    checkCollision(x, y) {
        // 检查坦克四个角
        const corners = [
            {x: x - TANK_SIZE/2, y: y - TANK_SIZE/2},
            {x: x + TANK_SIZE/2, y: y - TANK_SIZE/2},
            {x: x - TANK_SIZE/2, y: y + TANK_SIZE/2},
            {x: x + TANK_SIZE/2, y: y + TANK_SIZE/2}
        ];

        for (let corner of corners) {
            const col = Math.floor(corner.x / CELL_SIZE);
            const row = Math.floor(corner.y / CELL_SIZE);

            if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
                if (mazeMap[row][col] === 1) {
                    return true;
                }
            }
        }
        return false;
    }

    shoot(shootKey, keys) {
        const now = Date.now();
        if (keys[shootKey] && now - this.lastShotTime > this.shotCooldown) {
            this.lastShotTime = now;

            const bullet = new Bullet(
                this.x + Math.cos(this.angle) * TANK_SIZE,
                this.y + Math.sin(this.angle) * TANK_SIZE,
                this.angle,
                this.playerId
            );
            this.bullets.push(bullet);
        }
    }

    updateBullets() {
        // 更新所有子弹
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update();

            // 移除超出时间或子弹
            if (bullet.shouldRemove()) {
                this.bullets.splice(i, 1);
            }
        }
    }

    drawBullets() {
        for (let bullet of this.bullets) {
            bullet.draw();
        }
    }
}

// 子弹类
class Bullet {
    constructor(x, y, angle, ownerId) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.ownerId = ownerId;
        this.vx = Math.cos(angle) * BULLET_SPEED;
        this.vy = Math.sin(angle) * BULLET_SPEED;
        this.bounceCount = 0;
        this.maxBounces = 3;
        this.birthTime = Date.now();
        this.lifetime = 5000; // 5秒后移除
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // 检测墙壁碰撞和反弹
        this.checkWallCollision();
    }

    checkWallCollision() {
        const col = Math.floor(this.x / CELL_SIZE);
        const row = Math.floor(this.y / CELL_SIZE);

        // 边界检测
        if (this.x < 0 || this.x > MAP_WIDTH || this.y < 0 || this.y > MAP_HEIGHT) {
            this.bounceCount = this.maxBounces;
            return;
        }

        // 墙壁检测
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
            if (mazeMap[row][col] === 1) {
                // 反弹
                const nextCol = Math.floor((this.x + this.vx) / CELL_SIZE);
                const nextRow = Math.floor((this.y + this.vy) / CELL_SIZE);

                // 水平反弹
                if (mazeMap[row][nextCol] === 1) {
                    this.vx = -this.vx;
                }

                // 垂直反弹
                if (mazeMap[nextRow][col] === 1) {
                    this.vy = -this.vy;
                }

                this.bounceCount++;
            }
        }
    }

    shouldRemove() {
        return this.bounceCount >= this.maxBounces || Date.now() - this.birthTime > this.lifetime;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, BULLET_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = '#f39c12';
        ctx.fill();
    }

    // 检测子弹是否击中坦克
    hitsTank(tank) {
        const dx = this.x - tank.x;
        const dy = this.y - tank.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < TANK_SIZE / 2 + BULLET_SIZE && this.ownerId !== tank.playerId;
    }
}

// 创建玩家
let player1 = new Tank(60, 60, '#e74c3c', 1);
let player2 = new Tank(MAP_WIDTH - 60, MAP_HEIGHT - 60, '#3498db', 2);

// 键盘状态
const keys = {};

// 键盘事件监听
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// 绘制迷宫
function drawMaze() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (mazeMap[row][col] === 1) {
                ctx.fillStyle = '#34495e';
                ctx.fillRect(
                    col * CELL_SIZE,
                    row * CELL_SIZE,
                    CELL_SIZE,
                    CELL_SIZE
                );

                // 绘制墙壁边框
                ctx.strokeStyle = '#2c3e50';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    col * CELL_SIZE,
                    row * CELL_SIZE,
                    CELL_SIZE,
                    CELL_SIZE
                );
            }
        }
    }
}

// 检测子弹击中
function checkHits() {
    // 检查玩家1的子弹
    for (let bullet of player1.bullets) {
        if (bullet.hitsTank(player2)) {
            resetRound(1);
            return;
        }
    }

    // 检查玩家2的子弹
    for (let bullet of player2.bullets) {
        if (bullet.hitsTank(player1)) {
            resetRound(2);
            return;
        }
    }
}

// 重置回合
function resetRound(winner) {
    // 更新得分
    if (winner === 1) {
        gameState.player1Score++;
        document.getElementById('score1').textContent = gameState.player1Score;
    } else {
        gameState.player2Score++;
        document.getElementById('score2').textContent = gameState.player2Score;
    }

    // 重置坦克位置
    player1.x = 60;
    player1.y = 60;
    player1.angle = 0;
    player1.bullets = [];

    player2.x = MAP_WIDTH - 60;
    player2.y = MAP_HEIGHT - 60;
    player2.angle = Math.PI;
    player2.bullets = [];

    // 显示获胜信息
    showWinner(winner);
}

// 显示获胜信息
function showWinner(winner) {
    const winnerText = winner === 1 ? '玩家1' : '玩家2';
    
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    
    ctx.fillStyle = winner === 1 ? '#e74c3c' : '#3498db';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${winnerText} 获胜!`, MAP_WIDTH / 2, MAP_HEIGHT / 2);
    
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('3秒后重新开始...', MAP_WIDTH / 2, MAP_HEIGHT / 2 + 50);
    
    ctx.restore();

    // 暂停游戏3秒
    gameState.isPlaying = false;
    setTimeout(() => {
        gameState.isPlaying = true;
    }, 3000);
}

// 游戏主循环
function gameLoop() {
    // 清空画布
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // 绘制迷宫
    drawMaze();

    if (gameState.isPlaying) {
        // 更新玩家1
        player1.move(keys, 'a', 'd', 'w', 's');
        player1.shoot('q', keys);
        player1.updateBullets();

        // 更新玩家2
        player2.move(keys, 'arrowleft', 'arrowright', 'arrowup', 'arrowdown');
        player2.shoot('m', keys);
        player2.updateBullets();

        // 检测击中
        checkHits();
    }

    // 绘制玩家
    player1.drawBullets();
    player2.drawBullets();
    player1.draw();
    player2.draw();

    // 继续循环
    requestAnimationFrame(gameLoop);
}

// 启动游戏
gameLoop();
