// Điểm khởi động: điền chữ, gắn giao diện, tạo scene Phaser.
import { W, H } from './config.js';
import { applyStatic } from './lang/index.js';
import { G, newRun, setRun, setScene, setMouseIn } from './core/state.js';
import { useSpecial } from './game/combat.js';
import { step } from './game/step.js';
import { render, drawBackground } from './render/draw.js';
import { hud } from './ui/hud.js';
import { bindUi, refreshMenu } from './ui/flow.js';

class Main extends Phaser.Scene {
  constructor() { super('main'); }
  create() {
    setScene(this);
    drawBackground(this.add.graphics());
    this.g = this.add.graphics();
    this.input.mouse && this.input.mouse.disableContextMenu();
    this.input.on('pointermove', () => setMouseIn(true));
    this.input.on('gameover', () => setMouseIn(true));
    this.input.on('gameout', () => setMouseIn(false));
    this.input.on('pointerdown', p => { setMouseIn(true); if (p.rightButtonDown()) useSpecial(); });
  }
  update(time, delta) {
    const dt = Math.min(delta / 1000, .05);
    if (G && G.state === 'play') step(dt);
    else if (G && G.state === 'menu') G.time += dt;
    render(this.g); hud();
  }
}

applyStatic();
bindUi();
setRun(newRun('menu'));
refreshMenu();
new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', backgroundColor: '#0a1022',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: W, height: H },
  scene: Main, banner: false,
});
