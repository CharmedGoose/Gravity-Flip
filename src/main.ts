import kaplay, { AnchorComp, AreaComp, BodyComp, ColorComp, EmptyComp, GameObj, OffScreenComp, OutlineComp, PosComp, RectComp } from 'kaplay';
import 'kaplay/global';

kaplay();
setGravity(7500);
setBackground(Color.WHITE);

loadRoot('./');
loadSprite('player', 'sprites/player.png');

let score = 0;

scene('game', () => {
  score = 0;
  setGravityDirection(new Vec2(0, 1));

  add([
    rect(width(), 48),
    pos(0, height() - 48),
    outline(),
    area(),
    body({ isStatic: true }),
    color(Color.BLACK),
  ]);
  add([
    rect(width(), 48),
    pos(0, 0),
    outline(),
    area(),
    body({ isStatic: true }),
    color(Color.BLACK),
  ]);

  const scoreText = add([
    text(score.toString()),
    pos(width() - 100, 10),
    color(Color.WHITE),
  ]);

  const player = add([
    pos(120, 80),
    sprite('player', { width: 50, height: 50 }),
    area(),
    body({ stickToPlatform: false }),
  ]);

  spawnBlocks();

  onKeyPress('space', () => {
    setGravityDirection(new Vec2(0, -getGravityDirection().y));
    player.jump(200);
  });

  player.onCollide('obstacle', () => {
    addKaboom(player.pos);
    shake();
    go('lose');
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

    const random = rand() < 0.5;
    if (random) {
      block = add([
        rect(rand(200, 400), rand(24, 64)),
        area(),
        body({ isStatic: false, gravityScale: 0.1 }),
        outline(4),
        pos(width(), height() - 48),
        anchor('bot'),
        color(Color.RED),
        move(LEFT, 1000),
        offscreen({ destroy: true }),
        'obstacle',
      ]);
    } else {
      block = add([
        rect(rand(200, 400), rand(24, 64)),
        area(),
        body({ isStatic: false, gravityScale: 0.1 }),
        outline(4),
        pos(width(), 48),
        anchor('top'),
        color(Color.RED),
        move(LEFT, 1000),
        offscreen({ destroy: true }),
        'obstacle',
      ]);
    }

    block.onDestroy(() => {
      score++;
      scoreText.text = score.toString();
    });

    wait(rand(0.5, 1.5), () => {
      spawnBlocks();
    });
  }
});

scene('lose', () => {
  add([
    text(`Game Over \nScore: ${score}`),
    pos(center()),
    anchor('center'),
    color(Color.BLACK),
  ]);
  add([
    rect(200, 50),
    //text('Try Again'),
    pos(center().add(0, 100)),
    outline(),
    area(),
    anchor('center'),
    body({ isStatic: true }),
    color(Color.GREEN),
  ]).onClick(() => go('game'));
  add([
    text('Try Again'),
    pos(center().add(0, 100)),
    outline(),
    area(),
    anchor('center'),
    body({ isStatic: true }),
    color(Color.BLACK),
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
