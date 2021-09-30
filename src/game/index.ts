import Phaser from 'phaser'
import logoImg from '/logo.png'
import DragonBones from '~/external/dragonBones'

export class MainScene extends Phaser.Scene {
  gopher: dragonBones.phaser.display.ArmatureDisplay | null

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config)
    this.gopher = null
  }

  preload() {
    this.load.image('logo', logoImg)

    this.load.dragonbone(
      'Armaturegopher-stand',
      'gopher_stand_tex.png',
      'gopher_stand_tex.json',
      'gopher_stand_ske.json',
    )
  }

  create() {
    this.add.image(800, 300, 'logo')

    this.gopher = this.add.armature('Armaturegopher-stand', 'Armaturegopher-stand')
    this.gopher.addDBEventListener(DragonBones.EventObject.LOOP_COMPLETE, e => this._animationEventHandler(e), this)
    this.gopher.x = 200
    this.gopher.y = 500
    this.gopher.setScale(0.5)
    this.gopher.animation.play('walk')
  }

  _animationEventHandler(event) {
    // console.log('_animationEventHandler')
    // console.log(event.animationState.name, event.type, event.name)
    // if (event.animationState.name === 'normal')
    //   this.gopher.animation.play('watch')

    // else
    //   this.gopher.animation.play('normal')
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 1024,
  height: 800,
  plugins: {
    scene: [
      { key: 'DragonBones', plugin: DragonBones.phaser.plugin.DragonBonesScenePlugin, mapping: 'dragonbone' }, // setup DB plugin
    ],
  },
  // scene: MyGame,
}

export const createGame = () => {
  class Game extends Phaser.Game {
    constructor(GameConfig?: Phaser.Types.Core.GameConfig) {
      super(GameConfig)
      this.scene.add('Game', MainScene)
      this.scene.start('Game')
    }
  }
  const game = new Game(config)
  return game
}
