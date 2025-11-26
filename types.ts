
export interface PlayerStats {
  speed: number;
  jump: number;
  agility: number;
  power: number;
}

export interface PlayerKeys {
  up?: boolean;
  down?: boolean;
  left?: boolean;
  right?: boolean;
  w?: boolean;
  a?: boolean;
  s?: boolean;
  d?: boolean;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;
  maxSpeed: number;
  jumpPower: number;
  color: string;
  onGround: boolean;
  keys: PlayerKeys;
  frame: number;
  facingRight: boolean;
  name: string;
  title: string;
  stats: PlayerStats;
  description: string;
  health: number;
  maxHealth: number;
  isDead: boolean;
  reviveProgress: number; // 0 to 300 (5 seconds at 60fps)
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'wall' | 'normal';
}

export interface Shield {
  x: number;
  y: number;
  size: number;
  collected: boolean;
  pulse: number;
}

export interface GameState {
  score: number;
  level: number;
  totalShields: number;
  shields: Shield[];
  particles: Particle[];
  platforms: Platform[];
  enemies: Enemy[];
  spells: Spell[];
  gravity: number;
  gameOver: boolean;
  state: 'story' | 'menu' | 'playing' | 'paused' | 'won' | 'double_death';
  menuAnimation: number;
  selectedMenuItem: number;
  menuPage: 'main' | 'characters' | 'howtoplay' | 'credits';
  pausedFromGame: boolean;
  doubleDeathTimer?: number;
}

export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;
    this.life = 1;
    this.color = color;
    this.size = Math.random() * 5 + 3;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 0.02;
    this.vy += 0.2;
  }
}

export class Spell {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number = 12;
  speed: number = 4;
  active: boolean = true;
  trail: { x: number; y: number; life: number }[] = [];

  constructor(x: number, y: number, targetX: number, targetY: number, canvasWidth: number, canvasHeight: number) {
    this.x = x;
    this.y = y;
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.vx = (dx / distance) * this.speed;
    this.vy = (dy / distance) * this.speed;
  }

  update(canvasWidth: number, canvasHeight: number) {
    this.x += this.vx;
    this.y += this.vy;
    this.trail.push({ x: this.x, y: this.y, life: 1 });
    if (this.trail.length > 10) this.trail.shift();
    if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
      this.active = false;
    }
  }
}

export class Enemy {
  x: number;
  y: number;
  width: number = 50;
  height: number = 60;
  health: number = 3;
  maxHealth: number = 3;
  attackCooldown: number = 0;
  attackDelay: number = 40; 
  frame: number = 0;
  attacking: boolean = false;
  attackFrame: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
