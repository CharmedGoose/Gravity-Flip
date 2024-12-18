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
setBackground(Color.fromHex('#2c3bae'));
layers(['background', 'game', 'ui'], 'game');

loadRoot('./');
loadSprite('player', 'sprites/player.png');
loadSprite('backgroundEffect', 'sprites/backgroundEffect.png', {
  sliceX: 2,
  sliceY: 3,
  anims: {
    sparkle: { from: 0, to: 5, speed: 14, loop: true },
  },
});

let score = 0;
let highScore = 0;

scene('game', () => {
  let speed = 1;
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
    'floor'
  ]);
  add([
    rect(width(), 48),
    pos(0, 0 - 48),
    outline(),
    area(),
    body({ isStatic: true }),
    color(Color.BLACK),
    layer('game'),
    'ceiling'
  ]);

  const scoreText = add([
    text(score.toString()),
    pos(width() - 100, 10),
    color(Color.WHITE),
    layer('ui'),
    'score'
  ]);

  const player = add([
    pos(120, 80),
    sprite('player', { width: 50, height: 50 }),
    area(),
    body({ stickToPlatform: false }),
    layer('game'),
    'player',
  ]);

  spawnBackgroundEffects();
  //spawnBlocks();

  onKeyPress('space', () => {
    setGravityDirection(new Vec2(0, -getGravityDirection().y));
    player.jump(200);
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
      | ColorComp
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
        rect(wdithOfBlock, rand(24, 64)),
        area(),
        body({ isStatic: false, gravityScale: 0.1 }),
        outline(4),
        pos(width(), height() - 48),
        anchor('bot'),
        color(Color.RED),
        move(LEFT, 1000 * speed),
        offscreen({ destroy: true }),
        layer('game'),
        'obstacle',
      ]);
    } else {
      block = add([
        rect(wdithOfBlock, rand(24, 64)),
        area(),
        body({ isStatic: false, gravityScale: 0.1 }),
        outline(4),
        pos(width(), 48),
        anchor('top'),
        color(Color.RED),
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

    wait(rand(0.5, 1.5), () => {
      spawnBlocks();
    });
  }

  function spawnBackgroundEffects() {
    const effect = add([
      sprite('backgroundEffect'),
      pos(rand(0, width()), rand(0, height())),
      anchor('center'),
      //move(LEFT, 500),
      //offscreen({ destroy: true }),
      layer('background'),
      'baclgroundEffect',
    ]);

    effect.play('sparkle');

    wait(rand(0.1, 0.3), () => {
      spawnBackgroundEffects();
    });
  }
});

scene('lose', () => {
  if (score > highScore) {
    highScore = score;
  }
  add([
    text(`Game Over \nScore: ${score} \nHigh Score: ${highScore}`, {
      align: 'center',
    }),
    pos(center()),
    anchor('center'),
    color(Color.BLACK),
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

function spawnPillars() {
  add([
    rect(48, rand(24, 64)),
    area(),
    body({ isStatic: false, gravityScale: 0.1 }),
    outline(4),
    pos(width(), height() - 48),
    anchor('botleft'),
    color(Color.BLACK),
    move(LEFT, 1000),
    offscreen({ destroy: true }),
    'pillar',
  ]);

  wait(rand(0.15, 0.5), () => {
    spawnPillars();
  });
}
