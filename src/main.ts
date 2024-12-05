import kaplay from 'kaplay';
import 'kaplay/global';

let score = 0;

kaplay();
setGravity(7500);
setBackground(Color.WHITE);

loadRoot('./');
loadSprite('bean', 'sprites/bean.png');

scene('game', () => {
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

  const player = add([
    pos(120, 80),
    sprite('bean'),
    area(),
    body({ stickToPlatform: false }),
  ]);

  const scoreText = add([
    text(score.toString()),
    pos(width() - 100, 10),
    color(Color.WHITE),
  ]);

  //spawnPillars();
  spawnBlocks();

  onUpdate(() => {
    score++;
    scoreText.text = score.toString();
  });

  onKeyPress('space', () => {
    setGravityDirection(new Vec2(0, -getGravityDirection().y));
    player.jump(200);
  });

  player.onCollide('obstacle', () => {
    addKaboom(player.pos);
    shake();
    go('lose');
  });
});

scene('lose', () => {
  add([text(`Game Over \nScore: ${score}`), pos(center()), anchor('center'), color(Color.BLACK)]);
});

go('game');

/**function spawnPillars() {
  add([
    rect(48, rand(24, 64)),
    area(),
    outline(4),
    pos(width(), height() - 48),
    anchor('botleft'),
    color(Color.BLACK),
    move(LEFT, 1000),
    offscreen({ destroy: true}),
    'pillar',
  ]);

  wait(rand(0.15, 0.5), () => {
    spawnPillars();
  });
}
*/

function spawnBlocks() {
  const random = rand() < 0.5;
  if (random) {
    add([
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
    add([
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

  wait(rand(0.5, 1.5), () => {
    spawnBlocks();
  });
}
