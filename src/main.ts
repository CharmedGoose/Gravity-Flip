import 'kaplay/global';

loadRoot('./');
loadSprite('bean', 'sprites/bean.png');

add([pos(120, 80), sprite('bean')]);

onClick(() => addKaboom(mousePos()));
