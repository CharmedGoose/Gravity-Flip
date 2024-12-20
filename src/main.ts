import kaplay, {
  AnchorComp,
  AreaComp,
  BodyComp,
  EmptyComp,
  GameObj,
  OffScreenComp,
  OutlineComp,
  PosComp,
  RectComp,
} from 'kaplay';
import 'kaplay/global';

const SPEED = 1;
const SPPEDINCREMENT = 0.0001;

const JUMPHEIGHT = 200;

const PLAYERMENUROTATESPEED = 0.5;
const PLAYERMENUSPEED = 100;

const EFFECTGAMESPEED = 500;
const EFFECTMENUSPEED = 100;
const MINEFFECTDELAY = 0.6;
const MAXEFFECTDELAY = 0.9;
const MAXSPARKLES = 2;

const ASTEROIDSPEED = 1000;
const ASTEROIDWIDTH = 133;
const ASTEROIDHEIGHT = 112;
const MINASTEROIDDELAY = 0.5;
const MAXASTEROIDDELAY = 1.25;
const ASTEROIDGRAVITY = 0.1;

kaplay();
setGravity(7500);
setBackground(Color.BLACK);
layers(['background', 'game', 'ui'], 'game');

loadRoot('./');
loadSprite('asteroid', 'sprites/asteroid.png');
loadSprite('player', 'sprites/player.png', {
  sliceX: 2,
  sliceY: 1,
  anims: {
    normal: { from: 0, to: 0, speed: 1, loop: true },
    upsideDown: { from: 1, to: 1, speed: 1, loop: true },
  },
});
loadSprite('sparkle', 'sprites/sparkle.png', {
  sliceX: 2,
  sliceY: 3,
  anims: {
    sparkle: { from: 0, to: 5, speed: 10, loop: true },
  },
});

let score = 0;
let highScore = 0;
let speed = SPEED;

scene('game', () => {
  score = 0;
  setGravityDirection(new Vec2(0, 1));

  add([
    rect(width(), 48),
    pos(0, height()),
    outline(),
    area(),
    body({ isStatic: true }),
    color(Color.BLACK),
    layer('game'),
    'floor',
  ]);
  add([
    rect(width(), 48),
    pos(0, 0 - 48),
    outline(),
    area(),
    body({ isStatic: true }),
    color(Color.BLACK),
    layer('game'),
    'ceiling',
  ]);

  const scoreText = add([
    text(score.toString()),
    pos(width() - 100, 10),
    color(Color.WHITE),
    layer('ui'),
    'score',
  ]);

  const player = add([
    pos(120, 80),
    sprite('player', { width: 51, height: 66 }),
    area(),
    body({ stickToPlatform: false }),
    layer('game'),
    'player',
  ]);

  spawnBackgroundEffects(EFFECTGAMESPEED);
  spawnAsteroid();

  onKeyPress('space', () => {
    setGravityDirection(new Vec2(0, -getGravityDirection().y));
    player.jump(JUMPHEIGHT);

    player.play(getGravityDirection().y < 0 ? 'upsideDown' : 'normal');
  });
  onMousePress(() => {
    setGravityDirection(new Vec2(0, -getGravityDirection().y));
    player.jump(JUMPHEIGHT);

    player.play(getGravityDirection().y < 0 ? 'upsideDown' : 'normal');
  });

  player.onCollide('obstacle', () => {
    shake();
    go('lose');
  });

  onUpdate(() => {
    speed += SPPEDINCREMENT;
  });

  function spawnAsteroid() {
    let block: GameObj<
      | BodyComp
      | RectComp
      | PosComp
      | OutlineComp
      | AreaComp
      | AnchorComp
      | EmptyComp
      | OffScreenComp
    >;

    let hasScoreIncreased = false;

    const random = rand() < 0.5;

    if (random) {
      block = add([
        sprite('asteroid', { width: ASTEROIDWIDTH, height: ASTEROIDHEIGHT }),
        area(),
        body({ isStatic: false, gravityScale: ASTEROIDGRAVITY }),
        outline(4, Color.fromHex('#2F2F2F')),
        pos(width(), height() - 48),
        anchor('bot'),
        move(LEFT, ASTEROIDSPEED * speed),
        offscreen({ destroy: true }),
        layer('game'),
        'obstacle',
      ]);
    } else {
      block = add([
        sprite('asteroid', { width: ASTEROIDWIDTH, height: ASTEROIDHEIGHT }),
        area(),
        body({ isStatic: false, gravityScale: ASTEROIDGRAVITY }),
        outline(4, Color.fromHex('#2F2F2F')),
        pos(width(), 48),
        anchor('top'),
        move(LEFT, ASTEROIDSPEED * speed),
        offscreen({ destroy: true }),
        layer('game'),
        'obstacle',
      ]);
    }

    block.onUpdate(() => {
      if (block.pos.x + ASTEROIDWIDTH / 2 < player.pos.x && !hasScoreIncreased) {
        hasScoreIncreased = true;
        score++;
        scoreText.text = score.toString();
      }
    });

    wait(rand(MINASTEROIDDELAY / speed, MAXASTEROIDDELAY / speed), () => {
      spawnAsteroid();
    });
  }
});

scene('lose', () => {
  speed = SPEED;

  menuPlayerMovement();
  spawnBackgroundEffects(EFFECTMENUSPEED);

  if (score > highScore) {
    highScore = score;
  }

  add([
    text(`Game Over \nScore: ${score} \nHigh Score: ${highScore}`, {
      align: 'center',
    }),
    pos(center()),
    anchor('center'),
    color(Color.WHITE),
    layer('ui'),
  ]);

  add([
    rect(200, 50),
    pos(center().add(0, 100)),
    anchor('center'),
    color(Color.GREEN),
    layer('ui'),
  ]);
  add([
    text('Try Again'),
    pos(center().add(0, 100)),
    outline(),
    anchor('center'),
    color(Color.BLACK),
    layer('ui'),
  ]);

  onMouseDown(() => go('game'));
  onKeyPress('space', () => go('game'));
});

scene('start', () => {
  speed = SPEED;
  
  menuPlayerMovement();
  spawnBackgroundEffects(EFFECTMENUSPEED);

  add([
    text('Press Space to Start'),
    pos(center()),
    anchor('center'),
    color(Color.WHITE),
    layer('ui'),
  ]);

  onKeyPress('space', () => go('game'));
  onMousePress(() => go('game'));
});

go('start');

function menuPlayerMovement() {
  let invert = false;

  const player = add([
    pos(0, height() / 2),
    sprite('player', { width: 68, height: 88 }),
    anchor('center'),
    rotate(),
    layer('game'),
  ]);

  onUpdate(() => {
    if (player.pos.x >= width()) {
      invert = true;
    } else if (player.pos.x <= 0) {
      invert = false;
    }

    player.moveTo(invert ? 0 : width(), height() / 2, PLAYERMENUSPEED);
    player.rotateBy(PLAYERMENUROTATESPEED);
  });
}

function spawnBackgroundEffects(moveSpeed: number) {
  for (let i = 0; i < rand(1, MAXSPARKLES); i++) {
    const effect = add([
      sprite('sparkle'),
      pos(rand(width() - 200, width()), rand(0, height())),
      anchor('center'),
      move(LEFT, moveSpeed * speed),
      offscreen({ destroy: true }),
      layer('background'),
    ]);

    effect.play('sparkle');
  }

  wait(rand(MINEFFECTDELAY / speed, MAXEFFECTDELAY / speed), () => {
    spawnBackgroundEffects(moveSpeed);
  });
}
