import kaplay, {
  AnchorComp,
  AreaComp,
  BodyComp,
  ColorComp,
  EmptyComp,
  GameObj,
  OffScreenComp,
  OutlineComp,
  PosComp,
  RectComp,
} from 'kaplay';
import 'kaplay/global';

kaplay();
setGravity(7500);
setBackground(Color.BLACK); //fromHex('#2c3bae'));
layers(['background', 'game', 'ui'], 'game');

loadRoot('./');
loadSprite('asteroid', 'sprites/asteroid.png')
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
let speed = 1;

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
    sprite('player', { width: 34, height: 44 }),
    area(),
    body({ stickToPlatform: false }),
    rotate(),
    layer('game'),
    'player',
  ]);

  spawnBackgroundEffects(500);
  spawnBlocks();

  onKeyPress('space', () => {
    setGravityDirection(new Vec2(0, -getGravityDirection().y));
    player.jump(200);
    if (getGravityDirection().y < 0) {
      player.play('upsideDown');
    } else {
      player.play('normal');
    }
  });

  player.onCollide('obstacle', () => {
    addKaboom(player.pos);
    shake();
    go('lose');
  });

  onUpdate(() => {
    speed += 0.0001;
  });

  function spawnBlocks() {
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
    const wdithOfBlock = rand(200, 400);

    if (random) {
      block = add([
        sprite('asteroid', { width: 133, height: 112 }),
        area(),
        body({ isStatic: false, gravityScale: 0.1 }),
        outline(4, Color.fromHex('#2F2F2F')),
        pos(width(), height() - 48),
        anchor('bot'),
        //color(Color.RED),
        move(LEFT, 1000 * speed),
        offscreen({ destroy: true }),
        layer('game'),
        'obstacle',
      ]);
    } else {
      block = add([
        sprite('asteroid', { width: 133, height: 112 }),
        area(),
        body({ isStatic: false, gravityScale: 0.1 }),
        outline(4, Color.fromHex('#2F2F2F')),
        pos(width(), 48),
        anchor('top'),
        //color(Color.RED),
        move(LEFT, 1000 * speed),
        offscreen({ destroy: true }),
        layer('game'),
        'obstacle',
      ]);
    }

    block.onUpdate(() => {
      if (block.pos.x + wdithOfBlock / 2 < player.pos.x && !hasScoreIncreased) {
        hasScoreIncreased = true;
        score++;
        scoreText.text = score.toString();
      }
    });

    wait(rand(0.5 / speed, 1.25 / speed), () => {
      spawnBlocks();
    });
  }
});

scene('lose', () => {
  speed = 1;
  spawnBackgroundEffects(100);

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
    outline(),
    area(),
    anchor('center'),
    body({ isStatic: true }),
    color(Color.GREEN),
    layer('ui'),
  ]).onClick(() => go('game'));
  add([
    text('Try Again'),
    pos(center().add(0, 100)),
    outline(),
    area(),
    anchor('center'),
    body({ isStatic: true }),
    color(Color.BLACK),
    layer('ui'),
  ]).onClick(() => go('game'));
  onKeyPress('space', () => go('game'));
});

go('game');

function spawnBackgroundEffects(moveSpeed: number) {
  for (let i = 0; i < rand(1, 2); i++) {
    const effect = add([
      sprite('sparkle'),
      pos(rand(width() - 200, width()), rand(0, height())),
      anchor('center'),
      move(LEFT, moveSpeed * speed),
      offscreen({ destroy: true }),
      layer('background'),
      'sparkle',
    ]);

    effect.play('sparkle');
  }

  wait(rand(0.6 / speed, 0.9 / speed), () => {
    spawnBackgroundEffects(moveSpeed);
  });
}
