const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/battleBackground.png'

const battleBackground = new Sprite({
  position: { x: 0, y: 0 },
  image: battleBackgroundImage
})

let draggle, emby, renderedSprites, battleAnimationId, queue

const initBattle = () => {
  draggle = new Monster(monsters.Draggle)
  emby = new Monster(monsters.Emby)
  renderedSprites = [draggle, emby]
  queue = []

  document.querySelector('#userInterface').style.display = 'block'
  document.querySelector('#dialogueBox').style.display = 'none'
  document.querySelector('#playerHealthBar').style.width = '100%'
  document.querySelector('#enemyHealthBar').style.width = '100%'
  document.querySelector('#attacksBox').replaceChildren()

  emby.attacks.forEach(attack => {
    const button = document.createElement('button')
    button.innerHTML = attack.name
    document.querySelector('#attacksBox').append(button)
  })

  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', e => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]

      emby.attack({
        attack: selectedAttack,
        recipient: draggle,
        renderedSprites
      })

      if (draggle.health <= 0)
        return queue.push(draggle.faint, () => {
          gsap.to('#overlappingDiv', {
            opacity: 1,
            onComplete: () => {
              window.cancelAnimationFrame(battleAnimationId)
              animate()
              document.querySelector('#userInterface').style.display = 'none'
              gsap.to('#overlappingDiv', { opacity: 0 })
              battle.initiated = false
              audio.map.play()
            }
          })
        })

      // enemy attacks
      const randomAttack =
        draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]

      queue.push(() => {
        draggle.attack({
          attack: randomAttack,
          recipient: emby,
          renderedSprites
        })

        if (emby.health <= 0)
          return queue.push(emby.faint, () => {
            gsap.to('#overlappingDiv', {
              opacity: 1,
              onComplete: () => {
                window.cancelAnimationFrame(battleAnimationId)
                animate()
                document.querySelector('#userInterface').style.display = 'none'
                gsap.to('#overlappingDiv', { opacity: 0 })
                battle.initiated = false
                audio.map.play()
              }
            })
          })
      })
    })

    button.addEventListener('mouseenter', e => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]
      document.querySelector('#attackType').innerHTML = selectedAttack.type
      document.querySelector('#attackType').style.color = selectedAttack.color
    })
  })
}

const animateBattle = () => {
  battleAnimationId = window.requestAnimationFrame(animateBattle)
  battleBackground.draw()

  renderedSprites.forEach(s => s.draw())
}

animate()

document.querySelector('#dialogueBox').addEventListener('click', e => {
  queue.length ? queue.shift()() : (e.currentTarget.style.display = 'none')
})
