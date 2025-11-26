
import React, { useEffect, useRef } from 'react';
import { Player, Platform, GameState, Particle, Spell, Enemy, Shield } from '../types';

interface GameCanvasProps {
  onScoreUpdate: (score: number, level: number, totalShields: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set logical resolution
    canvas.width = 1200;
    canvas.height = 800;

    let animationFrameId: number;

    // --- GAME STATE INITIALIZATION ---
    
    // Player 1 (Blue Knight) - INCREASED SPEED
    const player1: Player = {
      x: 150, y: 650, width: 40, height: 60,
      speedX: 0, speedY: 0, maxSpeed: 8, jumpPower: -12, // Buffed speed from 6 to 8
      color: '#3498db', onGround: false,
      keys: { w: false, a: false, s: false, d: false },
      frame: 0, facingRight: true,
      name: 'BLUE', title: 'Mavi Şövalye',
      stats: { speed: 5, jump: 4, agility: 5, power: 4 }, // Updated stats display
      description: 'Rüzgar kadar hızlı, krallığın en süratli şövalyesi.',
      health: 100, maxHealth: 100,
      isDead: false, reviveProgress: 0
    };

    // Player 2 (Red Knight) - INCREASED JUMP
    const player2: Player = {
      x: 1000, y: 650, width: 40, height: 60,
      speedX: 0, speedY: 0, maxSpeed: 6, jumpPower: -15, // Buffed jump from -12 to -15
      color: '#e74c3c', onGround: false,
      keys: { up: false, left: false, down: false, right: false },
      frame: 0, facingRight: true,
      name: 'RED', title: 'Kırmızı Şövalye',
      stats: { speed: 4, jump: 5, agility: 4, power: 4 }, // Updated stats display
      description: 'Güçlü bacaklarıyla en yüksek surlara zıplayabilir.',
      health: 100, maxHealth: 100,
      isDead: false, reviveProgress: 0
    };

    const game: GameState = {
      score: 0, level: 1, totalShields: 0, shields: [], particles: [], platforms: [], enemies: [], spells: [],
      gravity: 0.6, gameOver: false, state: 'story', // Start with story
      menuAnimation: 0, selectedMenuItem: 0, menuPage: 'main', pausedFromGame: false
    };

    // --- HELPER FUNCTIONS ---

    const createPlatforms = () => {
        game.platforms = [
            // Ground
            { x: 0, y: 760, width: 1200, height: 40, type: 'ground' },
            // Lower levels
            { x: 100, y: 680, width: 150, height: 20, type: 'normal' },
            { x: 350, y: 650, width: 120, height: 20, type: 'normal' },
            { x: 550, y: 680, width: 150, height: 20, type: 'normal' },
            { x: 800, y: 650, width: 120, height: 20, type: 'normal' },
            { x: 1000, y: 680, width: 150, height: 20, type: 'normal' },
            // Mid levels
            { x: 50, y: 560, width: 100, height: 20, type: 'normal' },
            { x: 200, y: 520, width: 180, height: 20, type: 'normal' },
            { x: 450, y: 500, width: 140, height: 20, type: 'normal' },
            { x: 650, y: 540, width: 160, height: 20, type: 'normal' },
            { x: 870, y: 500, width: 140, height: 20, type: 'normal' },
            { x: 1050, y: 560, width: 120, height: 20, type: 'normal' },
            // Upper-Mid
            { x: 100, y: 420, width: 120, height: 20, type: 'normal' },
            { x: 280, y: 380, width: 100, height: 20, type: 'normal' },
            { x: 450, y: 350, width: 200, height: 20, type: 'normal' },
            { x: 720, y: 380, width: 100, height: 20, type: 'normal' },
            { x: 900, y: 420, width: 120, height: 20, type: 'normal' },
            { x: 1050, y: 380, width: 130, height: 20, type: 'normal' },
            // Upper
            { x: 50, y: 280, width: 140, height: 20, type: 'normal' },
            { x: 250, y: 240, width: 120, height: 20, type: 'normal' },
            { x: 450, y: 200, width: 150, height: 20, type: 'normal' },
            { x: 670, y: 240, width: 120, height: 20, type: 'normal' },
            { x: 850, y: 200, width: 150, height: 20, type: 'normal' },
            { x: 1030, y: 260, width: 140, height: 20, type: 'normal' },
            // Top
            { x: 150, y: 120, width: 180, height: 20, type: 'normal' },
            { x: 400, y: 80, width: 200, height: 20, type: 'normal' },
            { x: 670, y: 100, width: 160, height: 20, type: 'normal' },
            { x: 900, y: 80, width: 180, height: 20, type: 'normal' },
            // Walls
            { x: 0, y: 0, width: 20, height: 800, type: 'wall' },
            { x: 1180, y: 0, width: 20, height: 800, type: 'wall' },
            { x: 0, y: 0, width: 1200, height: 20, type: 'wall' },
            { x: 0, y: 780, width: 1200, height: 20, type: 'wall' }
        ];
    };

    const createShield = (): Shield => {
        const platforms = game.platforms.filter(p => p.type === 'normal');
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        return {
            x: platform.x + platform.width / 2,
            y: platform.y - 40,
            size: 20,
            collected: false,
            pulse: 0
        };
    };

    const initShields = () => {
        game.shields = [];
        const count = Math.min(3 + game.level, 8);
        for (let i = 0; i < count; i++) {
            game.shields.push(createShield());
        }
    };

    const createEnemies = () => {
        game.enemies = [];
        game.enemies.push(new Enemy(575, 100));
    };

    const startGame = () => {
        game.state = 'playing';
        game.score = 0;
        game.level = 1;
        game.totalShields = 0;
        onScoreUpdate(game.score, game.level, game.totalShields);
        
        player1.x = 150; player1.y = 650; player1.speedX = 0; player1.speedY = 0; player1.health = 100; player1.isDead = false; player1.reviveProgress = 0;
        player2.x = 1000; player2.y = 650; player2.speedX = 0; player2.speedY = 0; player2.health = 100; player2.isDead = false; player2.reviveProgress = 0;
        
        initShields();
        createEnemies();
    };

    // --- DRAWING FUNCTIONS ---

    const drawPixelText = (text: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center') => {
        ctx.fillStyle = color;
        ctx.font = `${size}px monospace`;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillText(text, x + 2, y + 2);
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    };

    const drawStatBar = (x: number, y: number, value: number, maxValue: number, color: string) => {
        const barWidth = 100;
        const barHeight = 12;
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
        const fillWidth = (value / maxValue) * barWidth;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, fillWidth, barHeight);
    };

    // Draw Wizard (Enemy)
    const drawWizard = (enemy: Enemy) => {
        const x = enemy.x;
        const y = enemy.y;
        
        ctx.save();
        ctx.translate(x + enemy.width / 2, y + enemy.height / 2);
        
        // Attack Animation Shake
        if (enemy.attacking) {
             const shake = Math.sin(enemy.attackFrame * 0.5) * 2;
             ctx.translate(shake, 0);
        }

        // Robe (Purple)
        ctx.fillStyle = '#6c3483';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(20, 30);
        ctx.lineTo(-20, 30);
        ctx.fill();

        // Hat (Dark Blue)
        ctx.fillStyle = '#1a252f';
        ctx.beginPath();
        ctx.moveTo(-25, -20);
        ctx.lineTo(25, -20);
        ctx.lineTo(0, -50);
        ctx.fill();

        // Face (Shadowy)
        ctx.fillStyle = '#000';
        ctx.fillRect(-10, -20, 20, 15);
        
        // Eyes (Glowing Yellow)
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-5, -15, 3, 3);
        ctx.fillRect(2, -15, 3, 3);

        // Staff
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(20, -30, 4, 60);
        // Orb on staff
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(22, -32, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    };

    const drawKnight = (player: Player) => {
        const x = player.x;
        const y = player.y;
        const scale = player.width / 32;

        if (player.isDead) {
            ctx.save();
            ctx.translate(x + player.width / 2, y + player.height);
            ctx.scale(scale, scale);
            
            // Tombstone
            ctx.fillStyle = '#7f8c8d';
            ctx.beginPath();
            ctx.arc(0, -20, 10, Math.PI, 0);
            ctx.lineTo(10, 0);
            ctx.lineTo(-10, 0);
            ctx.fill();
            
            ctx.fillStyle = '#bdc3c7';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('R.I.P', 0, -10);

            // Skull
            ctx.fillStyle = '#ecf0f1';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2); 
            ctx.fill();

            // Revive Circle Progress
            if (player.reviveProgress > 0) {
                 ctx.strokeStyle = '#2ecc71';
                 ctx.lineWidth = 3;
                 ctx.beginPath();
                 ctx.arc(0, -15, 20, 0, (Math.PI * 2) * (player.reviveProgress / 300));
                 ctx.stroke();
            }

            ctx.restore();
            return;
        }
        
        const isMoving = Math.abs(player.speedX) > 0.5;
        const isJumping = !player.onGround;
        const walkCycle = Math.sin(player.frame * 0.2);
        const idleBob = Math.sin(player.frame * 0.05) * 0.5;
        
        ctx.save();
        ctx.translate(x + player.width / 2, y + player.height / 2);

        // Draw Health Bar
        const healthPct = Math.max(0, player.health / player.maxHealth);
        const barW = 40;
        const barH = 5;
        ctx.fillStyle = '#333';
        ctx.fillRect(-barW/2, -40, barW, barH);
        ctx.fillStyle = healthPct > 0.5 ? '#2ecc71' : healthPct > 0.25 ? '#f1c40f' : '#e74c3c';
        ctx.fillRect(-barW/2, -40, barW * healthPct, barH);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-barW/2, -40, barW, barH);

        if (!player.facingRight) ctx.scale(-1, 1);
        ctx.scale(scale, scale);
        
        let bodyTilt = 0;
        let bodyBounce = 0;
        if (isJumping) {
            bodyTilt = player.speedY > 0 ? 0.1 : -0.1;
            bodyBounce = -2;
        } else if (isMoving) {
            bodyTilt = walkCycle * 0.05;
            bodyBounce = Math.abs(walkCycle) * 1.5;
        } else {
            bodyBounce = idleBob;
        }
        
        ctx.rotate(bodyTilt);
        ctx.translate(-16, -20 + bodyBounce);
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        const shadowSize = isJumping ? 10 - Math.min(Math.abs(player.speedY), 5) : 12;
        ctx.ellipse(16, 42, shadowSize, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Boots
        ctx.fillStyle = '#7f8c8d'; 
        if (isMoving && player.onGround) {
            const leftFootY = 35 + walkCycle * 2;
            const rightFootY = 35 - walkCycle * 2;
            ctx.fillRect(8, leftFootY, 6, 6);
            ctx.fillRect(18, rightFootY, 6, 6);
        } else {
            ctx.fillRect(8, 35, 6, 6);
            ctx.fillRect(18, 35, 6, 6);
        }
        
        // Body
        ctx.fillStyle = '#34495e'; 
        let bodyWidth = 20;
        let bodyHeight = 22;
        let bodyY = 14;
        
        if (isJumping && player.speedY < -5) {
            bodyHeight = 24; bodyY = 12; bodyWidth = 18;
        } else if (isJumping && player.speedY > 5) {
            bodyHeight = 20; bodyY = 16; bodyWidth = 22;
        }
        
        ctx.fillRect(6 + (20 - bodyWidth) / 2, bodyY, bodyWidth, bodyHeight);
        ctx.fillStyle = player.color;
        ctx.fillRect(8 + (20 - bodyWidth) / 2, bodyY, bodyWidth - 4, bodyHeight);
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(13 + (20 - bodyWidth) / 2, bodyY + 3, 6, bodyHeight - 6);
        ctx.fillRect(8 + (20 - bodyWidth) / 2, bodyY + 6, bodyWidth - 4, 4); 

        ctx.fillStyle = '#95a5a6';
        if (isJumping) {
            ctx.fillRect(2, 14, 5, 12);
            ctx.fillRect(25, 14, 5, 12);
        } else if (isMoving && player.onGround) {
            const leftArmY = 16 + Math.sin(player.frame * 0.3) * 3;
            const rightArmY = 16 - Math.sin(player.frame * 0.3) * 3;
            ctx.fillRect(2, leftArmY, 5, 12);
            ctx.fillRect(25, rightArmY, 5, 12);
        } else {
            const armBob = Math.sin(player.frame * 0.05) * 0.5;
            ctx.fillRect(2, 16 + armBob, 5, 12);
            ctx.fillRect(25, 16 + armBob, 5, 12);
        }
        
        const headBob = isMoving ? walkCycle * 0.5 : idleBob * 0.5;
        const headY = 0 + headBob;
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(6, headY, 20, 15);
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(8, headY + 6, 16, 3);
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.moveTo(16, headY);
        ctx.lineTo(24, headY - 8);
        ctx.lineTo(16, headY - 2);
        ctx.lineTo(8, headY - 8);
        ctx.fill();

        ctx.restore();
        player.frame++;
    };
    
    // Demo Knight (for menu)
    const drawDemoKnight = (color: string, frame: number) => {
        const bounce = Math.sin(frame * 0.1) * 2;
        ctx.translate(-16, -20 + bounce);
        ctx.fillStyle = '#7f8c8d'; ctx.fillRect(8, 35, 6, 6); ctx.fillRect(18, 35, 6, 6);
        ctx.fillStyle = '#34495e'; ctx.fillRect(6, 15, 20, 20);
        ctx.fillStyle = color; ctx.fillRect(8, 15, 16, 20);
        ctx.fillStyle = '#bdc3c7'; ctx.fillRect(13, 18, 6, 14); ctx.fillRect(8, 22, 16, 4);
        ctx.fillStyle = '#95a5a6';
        const armWave = Math.sin(frame * 0.1) * 2;
        ctx.fillRect(2, 16 + armWave, 5, 12); ctx.fillRect(25, 16 - armWave, 5, 12);
        ctx.fillStyle = '#bdc3c7'; ctx.fillRect(6, 0, 20, 16);
        ctx.fillStyle = '#2c3e50'; ctx.fillRect(8, 6, 16, 3);
        ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(24, -8); ctx.lineTo(16, -2); ctx.lineTo(8, -8); ctx.fill();
    };

    const drawPlatform = (platform: Platform) => {
        if (platform.type === 'ground') {
            // Dark Stone Ground
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Texture
            ctx.strokeStyle = '#34495e';
            ctx.lineWidth = 2;
            for(let i=0; i<platform.width; i+=40) {
                 ctx.strokeRect(platform.x + i, platform.y, 40, platform.height);
            }
            
            // Grass/Moss on top (darker green)
            ctx.fillStyle = '#145a32';
            ctx.fillRect(platform.x, platform.y, platform.width, 5);
        } else if (platform.type === 'wall') {
            // Castle Walls
            const gradient = ctx.createLinearGradient(platform.x, 0, platform.x + platform.width, 0);
            gradient.addColorStop(0, '#2e4053');
            gradient.addColorStop(0.5, '#34495e');
            gradient.addColorStop(1, '#2e4053');
            ctx.fillStyle = gradient;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            ctx.strokeStyle = '#1b2631';
            ctx.lineWidth = 2;
            // Vertical bricks
            for (let i = 0; i < platform.height; i += 60) {
                 ctx.beginPath();
                 ctx.moveTo(platform.x, platform.y + i);
                 ctx.lineTo(platform.x + platform.width, platform.y + i);
                 ctx.stroke();
            }
        } else {
            // Floating Platforms (Stone Slabs)
            ctx.fillStyle = '#566573';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // 3D effect side
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(platform.x, platform.y + platform.height - 5, platform.width, 5);
            
            // Border
            ctx.strokeStyle = '#808b96';
            ctx.lineWidth = 2;
            ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        }
    };

    const drawShield = (shield: Shield) => {
        shield.pulse += 0.1;
        const scale = 1 + Math.sin(shield.pulse) * 0.1;
        ctx.save();
        ctx.translate(shield.x, shield.y);
        ctx.scale(scale, scale);
        
        // Shield Shape
        ctx.fillStyle = '#3498db';
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(0, -shield.size);
        ctx.lineTo(shield.size, -shield.size * 0.5);
        ctx.lineTo(shield.size, 0);
        ctx.quadraticCurveTo(0, shield.size + 5, -shield.size, 0);
        ctx.lineTo(-shield.size, -shield.size * 0.5);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();

        // Cross
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(-5, -10, 10, 20);
        ctx.fillRect(-10, -5, 20, 10);

        ctx.restore();
    };

    const drawConnection = () => {
        if (player1.isDead || player2.isDead) return; // Don't draw link if one is dead

        const dx = player2.x - player1.x;
        const dy = player2.y - player1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 200) {
            const alpha = 1 - (distance / 200);
            const gradient = ctx.createLinearGradient(
                player1.x + player1.width / 2, player1.y + player1.height / 2,
                player2.x + player2.width / 2, player2.y + player2.height / 2
            );
            gradient.addColorStop(0, player1.color);
            gradient.addColorStop(1, player2.color);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(player1.x + player1.width / 2, player1.y + player1.height / 2);
            ctx.lineTo(player2.x + player2.width / 2, player2.y + player2.height / 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    };

    const drawCastleSilhouette = (x: number, y: number, width: number, height: number, color: string) => {
        ctx.fillStyle = color;
        // Main block
        ctx.fillRect(x, y, width, height);
        // Towers
        ctx.fillRect(x - 20, y - 40, 40, height + 40);
        ctx.fillRect(x + width - 20, y - 40, 40, height + 40);
        // Battlements
        ctx.fillStyle = color;
        for(let i=0; i<40; i+=10) {
             ctx.fillRect(x - 20 + i, y - 50, 5, 10);
             ctx.fillRect(x + width - 20 + i, y - 50, 5, 10);
        }
        // Windows
        ctx.fillStyle = '#f1c40f'; // lit windows
        ctx.globalAlpha = 0.3;
        ctx.fillRect(x, y + 20, 10, 15);
        ctx.fillRect(x + width - 10, y + 50, 10, 15);
        ctx.globalAlpha = 1.0;
    };
    
    const drawWinScreen = () => {
         ctx.fillStyle = '#000000';
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         drawPixelText('ZAMANINIZI BOŞA HARCADINIZ TEBRİKLER', canvas.width / 2, canvas.height / 2, 32, '#FFFFFF');
         drawPixelText('Toplam Kalkan: ' + game.totalShields, canvas.width / 2, canvas.height / 2 + 50, 24, '#3498db');
         drawPixelText('[SPACE] Ana Menü', canvas.width / 2, canvas.height - 100, 16, '#808080');
    };

    const drawDoubleDeathScreen = () => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Scary Red Text
        drawPixelText('BECERİKSİZLER', canvas.width / 2, canvas.height / 2 - 20, 48, '#e74c3c');
        drawPixelText('(TEKRAR DENEYİN)', canvas.width / 2, canvas.height / 2 + 30, 32, '#bdc3c7');
        
        drawPixelText('[SPACE] Yeniden Başla', canvas.width / 2, canvas.height - 100, 16, '#808080');
    };

    const drawStory = () => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const lines = [
            "Karanlık çağlar krallığın üzerine çöktü.",
            "Zalim büyücü, krallığın ışığını çaldı ve",
            "ebedi bir geceye mahkum etti.",
            "",
            "Sadece iki cesur şövalye bu laneti bozabilir.",
            "Mavi Şövalye, rüzgar kadar hızlı...",
            "Kırmızı Şövalye, göklere meydan okuyan...",
            "",
            "Kaderiniz birbirinize bağlı.",
            "Biriniz düşerse, diğeriniz onu kaldırmalı.",
            "Omuz omuza durduğunuzda yaralarınız iyileşir.",
            "50 Kalkanı toplayın ve krallığı kurtarın.",
            "",
            "ŞÖVALYELERİN IZDIRABI başlıyor..."
        ];

        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#bdc3c7';
        
        const startY = 200;
        lines.forEach((line, i) => {
             ctx.fillText(line, canvas.width / 2, startY + i * 40);
        });

        const alpha = Math.abs(Math.sin(game.menuAnimation * 0.05));
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillText("[SPACE] DEVAM ET", canvas.width / 2, canvas.height - 100);
    };

    const drawMenu = () => {
        ctx.fillStyle = '#17202a'; // Darker menu background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Stars
        for(let i=0; i<100; i++) {
             ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#ffffff40';
             ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
        }

        if (game.menuPage === 'main') {
            const titleY = 150 + Math.sin(game.menuAnimation * 0.05) * 10;
            drawPixelText('ŞÖVALYELERİN IZDIRABI', canvas.width / 2, titleY, 64, '#e74c3c');
            drawPixelText('KRALLIK İÇİN BİRLİKTE SAVAŞIN', canvas.width / 2, titleY + 60, 24, '#bdc3c7');

            const menuItems = ['OYUNA BAŞLA', 'NASIL OYNANIR', 'KARAKTERLER', 'YAPIMCILAR'];
            menuItems.forEach((item, index) => {
                const isSelected = game.selectedMenuItem === index;
                const color = isSelected ? '#e74c3c' : '#95a5a6';
                const prefix = isSelected ? '> ' : '';
                const suffix = isSelected ? ' <' : '';
                const size = isSelected ? 32 : 28;
                drawPixelText(prefix + item + suffix, canvas.width / 2, 400 + index * 60, size, color);
            });
            
            ctx.save();
            ctx.translate(200, 500);
            ctx.scale(5, 5);
            drawDemoKnight('#3498db', game.menuAnimation);
            ctx.restore();

            ctx.save();
            ctx.translate(canvas.width - 200, 500);
            ctx.scale(-5, 5);
            drawDemoKnight('#e74c3c', game.menuAnimation + 10);
            ctx.restore();

        } else if (game.menuPage === 'characters') {
             drawPixelText('KARAKTERLER', canvas.width / 2, 100, 48, '#fff');
             
             ctx.save();
             ctx.translate(300, 300);
             ctx.scale(4, 4);
             drawDemoKnight('#3498db', game.menuAnimation);
             ctx.restore();
             
             drawPixelText(player1.title, 300, 450, 24, player1.color);
             drawPixelText(player1.description, 300, 480, 16, '#bdc3c7');
             
             drawStatBar(250, 510, player1.stats.speed, 10, '#3498db'); drawPixelText('HIZ', 240, 516, 12, '#fff', 'right');
             drawStatBar(250, 530, player1.stats.jump, 10, '#3498db'); drawPixelText('ZIPLAMA', 240, 536, 12, '#fff', 'right');
             
             ctx.save();
             ctx.translate(900, 300);
             ctx.scale(-4, 4);
             drawDemoKnight('#e74c3c', game.menuAnimation);
             ctx.restore();
             
             drawPixelText(player2.title, 900, 450, 24, player2.color);
             drawPixelText(player2.description, 900, 480, 16, '#bdc3c7');

             drawStatBar(850, 510, player2.stats.speed, 10, '#e74c3c'); drawPixelText('HIZ', 840, 516, 12, '#fff', 'right');
             drawStatBar(850, 530, player2.stats.jump, 10, '#e74c3c'); drawPixelText('ZIPLAMA', 840, 536, 12, '#fff', 'right');
             
             drawPixelText('PASİF: Yan yana durunca saniyede 2 can iyileşir', canvas.width / 2, 600, 20, '#2ecc71');
             drawPixelText('[ESC] Geri Dön', 100, 50, 20, '#fff', 'left');

        } else if (game.menuPage === 'howtoplay') {
            drawPixelText('NASIL OYNANIR', canvas.width / 2, 100, 48, '#fff');
            
            const lines = [
                'Amacınız krallığı korumak için 50 büyülü kalkanı toplamak.',
                'İki şövalye birbirine sihirli bir bağ ile bağlıdır.',
                'Arkadaşınız düşerse veya ölürse, yanına gidip bekleyerek',
                'onu hayata döndürebilirsiniz.',
                'Yan yana savaşırsanız, yaralarınız zamanla iyileşir.',
                '',
                'Kötü büyücünün fırlattığı büyülere dikkat edin!',
                'Seviye arttıkça büyücünün hasarı da artar.',
                'Birlikte hareket edin, birlikte kazanın.'
            ];
            
            lines.forEach((line, i) => {
                drawPixelText(line, canvas.width / 2, 250 + i * 40, 20, '#bdc3c7');
            });
            
            drawPixelText('[ESC] Geri Dön', 100, 50, 20, '#fff', 'left');
        } else if (game.menuPage === 'credits') {
            drawPixelText('YAPIMCILAR', canvas.width / 2, 100, 48, '#fff');
            
            const creators = ['Batoz10', 'Alpherion', 'Kaaexus'];
            const colors = ['#3498db', '#e74c3c', '#9b59b6'];

            creators.forEach((name, i) => {
                drawPixelText(name, canvas.width / 2, 250 + i * 60, 32, colors[i % 3]);
            });
            
            drawPixelText('[ESC] Geri Dön', 100, 50, 20, '#fff', 'left');
        }
    };

    const drawPauseMenu = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawPixelText('OYUN DURAKLATILDI', canvas.width / 2, 250, 48, '#fff');
        
        const menuItems = ['DEVAM ET', 'ANA MENÜ', 'ÇIKIŞ'];
        menuItems.forEach((item, index) => {
            const isSelected = game.selectedMenuItem === index;
            const color = isSelected ? '#f1c40f' : '#bdc3c7';
            const prefix = isSelected ? '> ' : '';
            const suffix = isSelected ? ' <' : '';
            drawPixelText(prefix + item + suffix, canvas.width / 2, 400 + index * 60, 32, color);
        });
    };

    // --- LOGIC FUNCTIONS ---

    const movePlayer = (player: Player) => {
        if (player.isDead) return;

        if (player === player1) {
            if (player.keys.a) {
                player.speedX = -player.maxSpeed;
                player.facingRight = false;
            } else if (player.keys.d) {
                player.speedX = player.maxSpeed;
                player.facingRight = true;
            } else {
                player.speedX *= 0.8;
            }
        } else {
            if (player.keys.left) {
                player.speedX = -player.maxSpeed;
                player.facingRight = false;
            } else if (player.keys.right) {
                player.speedX = player.maxSpeed;
                player.facingRight = true;
            } else {
                player.speedX *= 0.8;
            }
        }

        player.speedY += game.gravity;
        if (player.speedY > 15) player.speedY = 15;

        const newX = player.x + player.speedX;
        let canMoveX = true;
        game.platforms.forEach(platform => {
            if (platform.type === 'wall') {
                if (newX + player.width > platform.x &&
                    newX < platform.x + platform.width &&
                    player.y + player.height > platform.y &&
                    player.y < platform.y + platform.height) {
                    canMoveX = false;
                    player.speedX = 0;
                }
            }
        });
        if (canMoveX) player.x = newX;

        const newY = player.y + player.speedY;
        let canMoveY = true;
        game.platforms.forEach(platform => {
            if (platform.type === 'wall') {
                if (player.x + player.width > platform.x &&
                    player.x < platform.x + platform.width &&
                    newY < platform.y + platform.height &&
                    newY + player.height > platform.y &&
                    player.speedY < 0) {
                    canMoveY = false;
                    player.speedY = 0;
                }
            }
        });
        if (canMoveY) player.y = newY;

        player.onGround = false;
        game.platforms.forEach(platform => {
            if (platform.type !== 'wall') {
                if (player.x + player.width > platform.x &&
                    player.x < platform.x + platform.width &&
                    player.y + player.height > platform.y &&
                    player.y + player.height < platform.y + platform.height + 10 &&
                    player.speedY >= 0) {
                    player.y = platform.y - player.height;
                    player.speedY = 0;
                    player.onGround = true;
                }
            }
        });

        if (player.y > canvas.height) {
            // Die from falling
            player.health = 0;
            player.isDead = true;
            player.reviveProgress = 0;
            // Respawn corpse at a safe spot
            player.x = player === player1 ? 150 : 1000;
            player.y = 650;
            player.speedX = 0;
            player.speedY = 0;
            
            // Penalty for death
            if (game.totalShields > 0) {
                game.totalShields -= 1;
                onScoreUpdate(game.score, game.level, game.totalShields);
            }
        }
    };

    const checkCollision = (obj1: {x: number, y: number, width: number, height: number}, obj2: {x: number, y: number}, size: number) => {
        const dx = (obj1.x + obj1.width / 2) - obj2.x;
        const dy = (obj1.y + obj1.height / 2) - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (obj1.width / 2 + size);
    };

    const handleReviveLogic = () => {
        if (game.state !== 'playing') return;

        const checkRevive = (deadPlayer: Player, livingPlayer: Player) => {
            if (deadPlayer.isDead && !livingPlayer.isDead) {
                const dx = (livingPlayer.x + livingPlayer.width/2) - (deadPlayer.x + deadPlayer.width/2);
                const dy = (livingPlayer.y + livingPlayer.height/2) - (deadPlayer.y + deadPlayer.height/2);
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < 100) { // Close enough to revive
                    deadPlayer.reviveProgress += 1;
                    if (deadPlayer.reviveProgress >= 300) { // 5 seconds at 60fps
                        deadPlayer.isDead = false;
                        deadPlayer.health = deadPlayer.maxHealth;
                        deadPlayer.reviveProgress = 0;
                        // Particle effect for revive
                        for(let i=0; i<30; i++) {
                             game.particles.push(new Particle(deadPlayer.x + deadPlayer.width/2, deadPlayer.y, '#2ecc71'));
                        }
                    }
                } else {
                    deadPlayer.reviveProgress = Math.max(0, deadPlayer.reviveProgress - 0.5); // Decay progress if moved away
                }
            }
        };

        checkRevive(player1, player2);
        checkRevive(player2, player1);
    };

    // --- MAIN LOOP ---

    const gameLoop = () => {
        if (game.state === 'story') {
             drawStory();
             game.menuAnimation++;
             animationFrameId = requestAnimationFrame(gameLoop);
             return;
        }

        if (game.state === 'won') {
             drawWinScreen();
             game.menuAnimation++;
             animationFrameId = requestAnimationFrame(gameLoop);
             return;
        }

        if (game.state === 'double_death') {
            drawDoubleDeathScreen();
            game.menuAnimation++;
            animationFrameId = requestAnimationFrame(gameLoop);
            return;
        }

        // Draw Medieval Background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0b0c10'); // Deep dark night
        gradient.addColorStop(1, '#2c3e50'); // Dark blue horizon
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Moon
        ctx.fillStyle = '#f4f6f7';
        ctx.beginPath(); ctx.arc(100, 100, 40, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0b0c10';
        ctx.beginPath(); ctx.arc(115, 95, 35, 0, Math.PI * 2); ctx.fill(); // Crescent effect

        // Parallax Castles/Mountains
        const time = Date.now() * 0.0001;
        drawCastleSilhouette(50 + Math.sin(time) * 10, 450, 150, 400, 'rgba(20, 20, 30, 0.5)');
        drawCastleSilhouette(350 + Math.sin(time * 0.8) * 15, 400, 200, 400, 'rgba(30, 30, 45, 0.4)');
        drawCastleSilhouette(800 + Math.sin(time * 1.2) * 12, 480, 180, 400, 'rgba(20, 20, 30, 0.6)');

        // Render Platforms
        game.platforms.forEach(platform => drawPlatform(platform));

        if (game.state === 'playing') {
            movePlayer(player1);
            movePlayer(player2);
            handleReviveLogic();

            // Regeneration Logic
            if (!player1.isDead && !player2.isDead) {
                const dx = (player1.x + player1.width/2) - (player2.x + player2.width/2);
                const dy = (player1.y + player1.height/2) - (player2.y + player2.height/2);
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                // Distance < 80 pixels
                if (dist < 80) {
                     const healAmount = 2 / 60; // 2 HP per second
                     if (player1.health < player1.maxHealth) player1.health = Math.min(player1.maxHealth, player1.health + healAmount);
                     if (player2.health < player2.maxHealth) player2.health = Math.min(player2.maxHealth, player2.health + healAmount);
                     
                     // Visuals
                     if (game.menuAnimation % 20 === 0) {
                         game.particles.push(new Particle(player1.x + player1.width/2, player1.y, '#2ecc71'));
                         game.particles.push(new Particle(player2.x + player2.width/2, player2.y, '#2ecc71'));
                     }
                }
            }
            
            // Check for Double Death
            if (player1.isDead && player2.isDead) {
                game.state = 'double_death';
            }
        }

        drawConnection();

        // Shields
        game.shields.forEach((shield) => {
            if (!shield.collected) {
                drawShield(shield);
                // Can only collect if alive
                const p1Near = !player1.isDead && checkCollision(player1, shield, shield.size);
                const p2Near = !player2.isDead && checkCollision(player2, shield, shield.size);
                if (p1Near || p2Near) {
                    shield.collected = true;
                    game.score += 10 * game.level;
                    game.totalShields += 1;
                    onScoreUpdate(game.score, game.level, game.totalShields);
                    
                    if (game.totalShields >= 50) {
                         game.state = 'won';
                    }

                    const collectorColor = p1Near ? player1.color : player2.color;
                    for (let i = 0; i < 20; i++) {
                        game.particles.push(new Particle(shield.x, shield.y, '#ffd700'));
                        game.particles.push(new Particle(shield.x, shield.y, collectorColor));
                    }
                    if (game.shields.every(s => s.collected)) {
                        game.level++;
                        player1.maxSpeed += 0.2;
                        player2.maxSpeed += 0.2;
                        onScoreUpdate(game.score, game.level, game.totalShields);
                        setTimeout(() => initShields(), 500);
                    }
                }
            }
        });

        // Enemies
        if (game.state === 'playing') {
            game.enemies.forEach(enemy => {
                enemy.frame++;
                if (enemy.attackCooldown > 0) {
                    enemy.attackCooldown--;
                } else {
                    enemy.attacking = true;
                    enemy.attackFrame = 0;
                    // Target living players only
                    const targets = [];
                    if (!player1.isDead) targets.push(player1);
                    if (!player2.isDead) targets.push(player2);
                    
                    if (targets.length > 0) {
                        const target = targets[Math.floor(Math.random() * targets.length)];
                        const spell = new Spell(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, target.x + target.width / 2, target.y + target.height / 2, canvas.width, canvas.height);
                        game.spells.push(spell);
                        enemy.attackCooldown = enemy.attackDelay;
                    }
                }
            });
            game.spells = game.spells.filter(spell => spell.active);
            game.spells.forEach(spell => {
                spell.update(canvas.width, canvas.height);
                [player1, player2].forEach(player => {
                    if (!player.isDead && checkCollision(player, spell, spell.size)) {
                        spell.active = false;
                        player.speedY = -5;
                        
                        // DAMAGE LOGIC: Base 10 + (Level-1)*5
                        const damage = 10 + (game.level - 1) * 5;
                        player.health -= damage; 
                        
                        for(let i=0; i<8; i++) {
                            game.particles.push(new Particle(player.x + player.width/2, player.y + player.height/2, '#ff0000'));
                        }

                        if (player.health <= 0) {
                             player.isDead = true;
                             player.health = 0;
                             player.reviveProgress = 0;
                             // Corpse stays where they died
                             
                             // Penalty for death by spell
                             if (game.totalShields > 0) {
                                game.totalShields -= 1;
                                onScoreUpdate(game.score, game.level, game.totalShields);
                             }
                        }
                    }
                });
            });
        }

        // Draw Entities
        game.enemies.forEach(enemy => drawWizard(enemy));
        
        game.spells.forEach(spell => {
             ctx.fillStyle = '#9b59b6';
             ctx.beginPath(); ctx.arc(spell.x, spell.y, spell.size, 0, Math.PI * 2); ctx.fill();
        });

        game.particles = game.particles.filter(p => p.life > 0);
        game.particles.forEach(p => {
            p.update();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
            ctx.globalAlpha = 1;
        });

        if (game.state === 'playing' || game.state === 'paused') {
            drawKnight(player1);
            drawKnight(player2);
        }

        if (game.state === 'menu') drawMenu();
        if (game.state === 'paused') drawPauseMenu();

        game.menuAnimation++;
        animationFrameId = requestAnimationFrame(gameLoop);
    };

    // --- INPUT HANDLING ---

    const handleKeyDown = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();

        // Story Mode Input
        if (game.state === 'story') {
            if (e.key === ' ' || e.key === 'Enter') {
                game.state = 'menu';
            }
            return;
        }
        
        // Win Screen Input
        if (game.state === 'won' || game.state === 'double_death') {
             if (e.key === ' ' || e.key === 'Enter') {
                 // Reset game for menu
                 game.state = 'menu';
                 game.menuPage = 'main';
                 game.totalShields = 0;
                 game.score = 0;
                 game.level = 1;
                 onScoreUpdate(0, 1, 0);
             }
             return;
        }

        if (e.key === 'Escape') {
            if (game.state === 'menu' && game.menuPage !== 'main') {
                e.preventDefault();
                game.menuPage = 'main';
            } else if (game.state === 'playing') {
                e.preventDefault();
                game.state = 'paused';
                game.pausedFromGame = true;
            } else if (game.state === 'paused') {
                e.preventDefault();
                game.state = 'playing';
                game.pausedFromGame = false;
            }
            return;
        }

        if (game.state === 'playing') {
            // Player 1
            if (!player1.isDead) {
                if (key === 'w' && player1.onGround) {
                    player1.speedY = player1.jumpPower;
                    player1.onGround = false;
                }
                if (key === 'a') player1.keys.a = true;
                if (key === 'd') player1.keys.d = true;
            }
            // Player 2
            if (!player2.isDead) {
                if (e.key === 'ArrowUp' && player2.onGround) {
                    player2.speedY = player2.jumpPower;
                    player2.onGround = false;
                }
                if (e.key === 'ArrowLeft') player2.keys.left = true;
                if (e.key === 'ArrowRight') player2.keys.right = true;
            }
        } 
        
        // Menu navigation
        else if (game.state === 'menu' && game.menuPage === 'main') {
            if (e.key === 'ArrowUp') {
                game.selectedMenuItem = (game.selectedMenuItem - 1 + 4) % 4;
            } else if (e.key === 'ArrowDown') {
                game.selectedMenuItem = (game.selectedMenuItem + 1) % 4;
            } else if (e.key === ' ' || e.key === 'Enter') {
                const actions = ['start', 'howtoplay', 'characters', 'credits'];
                const action = actions[game.selectedMenuItem];
                if (action === 'start') startGame();
                else if (action === 'howtoplay') game.menuPage = 'howtoplay';
                else if (action === 'characters') game.menuPage = 'characters';
                else if (action === 'credits') game.menuPage = 'credits';
            }
        } 
        
        // Pause navigation
        else if (game.state === 'paused') {
            if (e.key === 'ArrowUp') {
                game.selectedMenuItem = (game.selectedMenuItem - 1 + 3) % 3;
            } else if (e.key === 'ArrowDown') {
                game.selectedMenuItem = (game.selectedMenuItem + 1) % 3;
            } else if (e.key === ' ' || e.key === 'Enter') {
                 const actions = ['resume', 'mainmenu', 'quit'];
                 const action = actions[game.selectedMenuItem % 3];
                 if (action === 'resume') {
                     game.state = 'playing';
                 } else if (action === 'mainmenu') {
                     game.state = 'menu';
                     game.menuPage = 'main';
                     game.selectedMenuItem = 0;
                 } else if (action === 'quit') {
                     game.state = 'menu';
                     game.menuPage = 'main';
                     game.selectedMenuItem = 0;
                     if (document.fullscreenElement) document.exitFullscreen();
                 }
            }
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        if (key === 'a') player1.keys.a = false;
        if (key === 'd') player1.keys.d = false;
        if (e.key === 'ArrowLeft') player2.keys.left = false;
        if (e.key === 'ArrowRight') player2.keys.right = false;
    };

    // --- SETUP & CLEANUP ---
    
    createPlatforms();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        cancelAnimationFrame(animationFrameId);
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <canvas 
        ref={canvasRef} 
        className="block mx-auto rounded-lg shadow-2xl bg-slate-800 w-full max-w-full h-auto cursor-pointer"
        onClick={() => {
             if (!document.fullscreenElement && canvasRef.current) {
                canvasRef.current.requestFullscreen().catch(err => console.log(err));
             }
        }}
    />
  );
};

export default GameCanvas;
