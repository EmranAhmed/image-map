// To maintain responsive spot you can only customize wide of image-wrapper
// and image wrapper width and image width should be same
// Don't apply padding or margin on image

(function () {
  const imageWrapper = document.querySelector('#image-wrapper')

  function calculatePointerPosition (event) {

    const pointerWidth = 10

    const { left, top, width, height } = imageWrapper.getBoundingClientRect()

    let x = ((event.x - left - pointerWidth) / width) * 100
    let y = ((event.y - top - pointerWidth) / height) * 100

    return { x, y }
  }

  function setPointer (event) {

    if (event.button > 0) {
      return
    }

    if (isPointer(event)) {

      //imageWrapper.setPointerCapture(event.pointerId)
      imageWrapper.classList.add('movestart')
      imageWrapper.addEventListener('pointermove', movePointer)
      return
    }

    const { x, y } = calculatePointerPosition(event)

    imageWrapper.insertAdjacentHTML(
      'beforeend',
      `<span class="pointer" style="--left: ${x}%; --top: ${y}%"></span>`
    )

  }

  function getSelectedPointer (event) {
    const pointers = imageWrapper.querySelectorAll('.pointer')
    let currentPointer

    pointers.forEach((pointer) => {
      currentPointer = pointer
      if (pointer.contains(event.target)) {
        // currentPointer = pointer
        return pointer
      }
    })

    return currentPointer
  }

  function isPointer (event) {
    const pointer = getSelectedPointer(event)
    return pointer?.contains(event.target)
  }

  function movePointer (event) {
    const pointers = imageWrapper.querySelectorAll('.pointer')

    if (isPointer(event)) {

      // imageWrapper.setPointerCapture(event.pointerId)

      const currentPointer = getSelectedPointer(event)
      const { x, y } = calculatePointerPosition(event)
      imageWrapper.classList.add('moving')
      currentPointer.style.setProperty('--left', `${x}%`)
      currentPointer.style.setProperty('--top', `${y}%`)
    }

  }

  imageWrapper.addEventListener('pointerdown', setPointer)

  imageWrapper.addEventListener('pointerup', (event) => {

    imageWrapper.classList.remove('moving', 'movestart')
    //imageWrapper.releasePointerCapture(event.pointerId)
    imageWrapper.removeEventListener('pointermove', movePointer)
  })

  imageWrapper.addEventListener('pointercancel', (event) => {

    console.log('cancel')
  })

})()