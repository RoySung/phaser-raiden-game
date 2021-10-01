<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { createGame, MainScene } from '~/game'

const game = ref()
const getMainScene = () => game.value.scene.getScene('Game') as MainScene
const getGopher = () => {
  const mainScene = getMainScene()
  return mainScene.gopher
}
const watch = async() => {
  const gopher = getGopher()
  if (!gopher) return

  const state = gopher.animation.play('watch', 1)
  const checkIsComplete = (state: dragonBones.AnimationState, callback: Function) => {
    requestAnimationFrame(() => {
      if (state.isCompleted) callback()
      else checkIsComplete(state, callback)
    })
  }

  if (!state) return
  checkIsComplete(state, () => gopher.animation.play('walk'))
}

onMounted(() => {
  game.value = createGame()

  onKeyStroke('ArrowRight', (e) => {
    e.preventDefault()
    const gopher = getGopher()

    gopher?.setX(gopher.x + 10)
  })
  onKeyStroke('ArrowLeft', (e) => {
    e.preventDefault()
    const gopher = getGopher()

    gopher?.setX(gopher.x - 10)
  })
  onKeyStroke(e => e.code === 'Space', (e) => {
    e.preventDefault()

    watch()
  })
})

</script>

<template>
  <div id="app">
  </div>
</template>

<route lang="yaml">
meta:
  layout: default
</route>
