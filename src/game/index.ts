import Phaser from 'phaser'
import bgImg from '/images/background.png'
import explosion from '/images/spritesheets/explosion.png'
import powerupImg from '/images/spritesheets/power-up.png'
import ship0Img from '/images/spritesheets/ship0.png'
import ship1Img from '/images/spritesheets/ship1.png'
import ship2Img from '/images/spritesheets/ship2.png'
import playerImg from '/images/spritesheets/player.png'
import beamImg from '/images/spritesheets/beam.png'

import DragonBones from '~/external/dragonBones'

enum Constant {
  Background = 'background',

}

enum Explosion {
  Normal = 'explosion_normal',
  Normal_Anims = 'explosion_normal_anims'
}

enum PowerUp {
  Name = 'power-up',
  Red_Anims = 'power-up_red_anims',
  Gray_Anims = 'power-up_gray_anims'
}

enum ShipConstant {
  Zero = 'ship0',
  One = 'ship1',
  Two = 'ship2',
}

enum Player {
  Normal = 'player_normal',
  Normal_Anims = 'player_normal_anims'
}

const playerConfig = {
  speed: 50,
}

enum Beam {
  Normal = 'beam_normal',
  Normal_Anims = 'beam_normal_anims'
}

const shipsConfig = [
  {
    key: ShipConstant.Zero,
    sprite: {
      img: ship0Img,
      config: {
        frameWidth: 16,
        frameHeight: 16,
      },
    },
    animsKey: `${ShipConstant.Zero}_anims`,
    speed: 1,
  },
  {
    key: ShipConstant.One,
    sprite: {
      img: ship1Img,
      config: {
        frameWidth: 32,
        frameHeight: 16,
      },
    },
    animsKey: `${ShipConstant.One}_anims`,
    speed: 2,
  },
  {
    key: ShipConstant.Two,
    sprite: {
      img: ship2Img,
      config: {
        frameWidth: 32,
        frameHeight: 32,
      },
    },
    animsKey: `${ShipConstant.Two}_anims`,
    speed: 3,
  },
]

type Ship = {
  config: {
    key: string
    sprite: {
      img: string
      config: {
        frameWidth: number
        frameHeight: number
      }
    }
    animsKey: string
    speed: number
  }
  sprite: Phaser.GameObjects.Sprite
}

class BeamSprite extends Phaser.GameObjects.Sprite {
  constructor(scene: MainScene) {
    const x = scene.player?.x || 0
    const y = scene.player?.y || 0
    super(scene, x, y, Beam.Normal)
    scene.add.existing(this)
    this.play(Beam.Normal_Anims)
    scene.projectileGroup?.add(this)
    scene.physics.world.enableBody(this)

    this.body.velocity.y = -250
  }

  update() {
    if (this.y < 32) this.destroy()
  }
}

class ExplosionSprite extends Phaser.GameObjects.Sprite {
  constructor(scene: MainScene, x: number, y: number) {
    super(scene, x, y, Explosion.Normal)
    scene.add.existing(this)
    this.play(Explosion.Normal_Anims)
  }
}

export class MainScene extends Phaser.Scene {
  gopher: dragonBones.phaser.display.ArmatureDisplay | null = null
  background: Phaser.GameObjects.TileSprite | null = null
  shipArr: Ship[] = []
  enemies: Phaser.Physics.Arcade.Group | null = null
  powerupGroup: Phaser.Physics.Arcade.Group | null = null
  player: Phaser.Physics.Arcade.Sprite | null = null
  projectileGroup: Phaser.GameObjects.Group | null = null
  score = 0
  scoreLabel: Phaser.GameObjects.BitmapText | null = null
  adjustScale = 2

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config)
  }

  preload() {
    this.load.image(Constant.Background, bgImg)
    this.load.bitmapFont('pixelFont', '/font/font.png', '/font/font.xml')

    this.load.spritesheet(Explosion.Normal, explosion, {
      frameWidth: 16,
      frameHeight: 16,
    })

    this.load.spritesheet(Explosion.Normal, explosion, {
      frameWidth: 16,
      frameHeight: 16,
    })

    this.load.spritesheet(PowerUp.Name, powerupImg, {
      frameWidth: 16,
      frameHeight: 16,
    })
    this.load.spritesheet(Player.Normal, playerImg, {
      frameWidth: 16,
      frameHeight: 24,
    })
    this.load.spritesheet(Beam.Normal, beamImg, {
      frameWidth: 16,
      frameHeight: 16,
    })

    shipsConfig.forEach((config) => {
      this.load.spritesheet(config.key, config.sprite.img, config.sprite.config)
    })

    // drangonBones Gopher
    // this.load.dragonbone(
    //   'Armaturegopher-stand',
    //   'gopher_stand_tex.png',
    //   'gopher_stand_tex.json',
    //   'gopher_stand_ske.json',
    // )
  }

  create() {
    const config = this.game.config
    const width = Number(config.width)
    const height = Number(config.height)
    // const bg = this.add.image(0, 0, Constant.Background)
    this.background = this.add.tileSprite(0, 0, width, height, Constant.Background)
    this.background.setOrigin(0, 0)

    this.drawScoreText()

    // setup player
    this.anims.create({
      frames: this.anims.generateFrameNumbers(Player.Normal, {}),
      key: Player.Normal_Anims,
      frameRate: 20,
      repeat: -1,
    })

    this.player = this.physics.add.sprite(width / 2, height / 2 + 50, Player.Normal)
    this.player.setScale(this.adjustScale)
    this.player.play(Player.Normal_Anims)
    this.player.setCollideWorldBounds(true)

    // setup beam
    this.anims.create({
      frames: this.anims.generateFrameNumbers(Beam.Normal, {}),
      key: Beam.Normal_Anims,
      frameRate: 20,
      repeat: -1,
    })

    // setup explosion
    this.anims.create({
      frames: this.anims.generateFrameNumbers(Explosion.Normal, {}),
      key: Explosion.Normal_Anims,
      frameRate: 20,
      repeat: 0,
      hideOnComplete: true,
    })

    // setup power-up
    this.anims.create({
      frames: this.anims.generateFrameNames(PowerUp.Name, { start: 0, end: 1 }),
      key: PowerUp.Red_Anims,
      frameRate: 20,
      repeat: -1,
    })
    this.anims.create({
      frames: this.anims.generateFrameNames(PowerUp.Name, { start: 2, end: 3 }),
      key: PowerUp.Gray_Anims,
      frameRate: 20,
      repeat: -1,
    })

    this.powerupGroup = this.physics.add.group()
    const maxPUCount = 4
    for (let i = 0; i < maxPUCount; i++) {
      const powerUp = this.physics.add.sprite(16, 16, PowerUp.Name)
      powerUp.setScale(this.adjustScale)
      this.powerupGroup.add(powerUp)
      powerUp.setRandomPosition(0, 0, width, height)
      if (Math.random() > 0.5) powerUp.play(PowerUp.Red_Anims)
      else powerUp.play(PowerUp.Gray_Anims)

      powerUp.setVelocity(100 * this.adjustScale, 100 * this.adjustScale)
      powerUp.setCollideWorldBounds(true)
      powerUp.setBounce(1)
    }

    // setup ship animation
    this.enemies = this.physics.add.group()
    shipsConfig.forEach((config, index) => {
      const sprite = this.add.sprite(width / 2 + index * 30, height / 2, config.key)
      sprite.setScale(this.adjustScale)
      const ship: Ship = {
        config,
        sprite,
      }
      this.shipArr.push(ship)
      const frames = this.anims.generateFrameNumbers(config.key, {})
      this.anims.create({
        frames,
        key: config.animsKey,
        frameRate: 20,
        repeat: -1,
      })
      sprite.play(config.animsKey)
      sprite.setInteractive()
      this.resetShip(ship.sprite)

      this.enemies?.add(sprite)
    })

    this.input.on('gameobjectdown', this.destoryShip, this)

    this.projectileGroup = this.add.group()
    this.physics.add.collider(this.projectileGroup, this.powerupGroup, (projectile, powerup) => {
      projectile.destroy()
    })

    this.physics.add.overlap(this.player, this.powerupGroup, this.pickPowerup, null, this)
    this.physics.add.overlap(this.player, this.enemies, this.hurtPlayer, null, this)

    this.physics.add.overlap(this.projectileGroup, this.enemies, this.hitEnemy, null, this)

    // this.ship0 = this.add.sprite()

    // drangonBones Gopher
    // this.gopher = this.add.armature('Armaturegopher-stand', 'Armaturegopher-stand')
    // this.gopher.addDBEventListener(DragonBones.EventObject.LOOP_COMPLETE, e => this._animationEventHandler(e), this)
    // this.gopher.x = 200
    // this.gopher.y = 500
    // this.gopher.setScale(0.5)
    // this.gopher.animation.play('walk')
  }

  update() {
    if (this.background) this.background.tilePositionY -= 0.5
    this.shipArr.forEach(ship => this.moveShip(ship))

    this.handlePlayerMove()
    if (this.player?.active) this.handlePlayerShoot()

    const beams = this.projectileGroup?.getChildren()
    beams?.forEach(beam => beam.update())
  }

  pickPowerup(player: Phaser.GameObjects.GameObject, powerup: Phaser.GameObjects.GameObject) {
    powerup.disableBody(true, true)
  }

  hurtPlayer(player: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
    if (player.alpha < 1) return

    player.disableBody(true, true)

    this.resetShip(enemy)
    const explosion = new ExplosionSprite(this, player.x, player.y)
    this.resetPlayer()
  }

  resetPlayer() {
    const config = this.game.config
    const width = Number(config.width)
    const height = Number(config.height)
    const x = width / 2 - 8
    const y = height + 64

    this.player?.enableBody(true, x, y, true, true)
    // @ts-ignore
    this.player.alpha = 0.5
    const tween = this.tweens.add({
      targets: this.player,
      y: height - 64,
      ease: 'Power1',
      duration: 1500,
      repeat: 0,
      onComplete: () => this.player.alpha = 1,
    })
  }

  hitEnemy(projectile: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
    projectile.destroy()
    const x = parseInt(enemy.x)
    const y = parseInt(enemy.y)
    this.resetShip(enemy)

    const explosion = new ExplosionSprite(this, x, y)
  }

  drawScoreText() {
    const lengthFormat = (value: number, length: number) => {
      return '0'.repeat(length - value.toString().length) + value
    }
    const formatedScore = lengthFormat(this.score, 6)
    const text = `SCORE ${formatedScore}`
    if (!this.scoreLabel) this.scoreLabel = this.add.bitmapText(10, 5, 'pixelFont', text, 16)
    else this.scoreLabel.text = text
  }

  handlePlayerShoot() {
    // FIXME: Space is not work
    const space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    const j = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J)
    const shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
    const keys = [space, j, shift]
    keys.forEach((key) => {
      if (Phaser.Input.Keyboard.JustDown(key)) this.shootBeam()
    })
  }

  shootBeam() {
    const beam = new BeamSprite(this)
    beam.setScale(this.adjustScale)
  }

  handlePlayerMove() {
    const left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    const right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    const up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    const down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)

    if (left.isDown) this.player?.setVelocityX(-playerConfig.speed * this.adjustScale)
    else if (right.isDown) this.player?.setVelocityX(playerConfig.speed * this.adjustScale)

    if (up.isDown) this.player?.setVelocityY(-playerConfig.speed * this.adjustScale)
    else if (down.isDown) this.player?.setVelocityY(playerConfig.speed * this.adjustScale)
  }

  moveShip(ship: Ship) {
    const { sprite, config } = ship
    sprite.y += config.speed * this.adjustScale
    const height = this.game.config.height
    if (sprite.y > height)
      this.resetShip(ship.sprite)
  }

  resetShip(shipSprite: Phaser.GameObjects.Sprite) {
    const width = Number(this.game.config.width)
    shipSprite.y = 0
    shipSprite.x = Phaser.Math.Between(0, width)
  }

  destoryShip(pointer: any, gameObject: Phaser.GameObjects.Sprite) {
    gameObject.setTexture(Explosion.Normal)
    gameObject.play(Explosion.Normal_Anims)
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
  width: 800,
  height: 850,
  plugins: {
    scene: [
      { key: 'DragonBones', plugin: DragonBones.phaser.plugin.DragonBonesScenePlugin, mapping: 'dragonbone' }, // setup DB plugin
    ],
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
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
