(function (window) {

  'use strict'

  const weakMap = new WeakMap()

  const Plugin = (() => {

    return class {

      DEFAULTS = {
        pointerSize: 20,
      }

      constructor (element, options, name) {

        this.element = element
        this.settings = Object.assign({}, this.DEFAULTS, options)
        this.currentPointer = null
        this.name = name

        this.init()
      }

      init () {

        this.element.addEventListener('pointerdown', this.addPointer)
        this.element.addEventListener('pointerdown', this.preparePointer)
        this.element.addEventListener('pointerup', this.stopMovingPointer)
      }

      addPointer = (event) => {

        if (event.button > 0 || this.isPointer(event)) {
          return
        }

        const { x, y } = this.calculatePointerPosition(event, this.element)

        const template = `<span class="pointer" style="--size:${this.settings.pointerSize}px; --left: ${x}%; --top: ${y}%"></span>`

        this.element.insertAdjacentHTML('beforeend', template)
      }

      preparePointer = (event) => {

        if (event.button > 0) {
          return
        }

        if (this.isPointer(event)) {
          this.element.addEventListener('pointermove', this.movePointer)
        }
      }

      movePointer = (event) => {

        event.preventDefault()

        const { x, y } = this.calculatePointerPosition(event, this.element)

        this.element.classList.add('moving')
        this.currentPointer.style.setProperty('--left', `${x}%`)
        this.currentPointer.style.setProperty('--top', `${y}%`)
      }

      stopMovingPointer = (event) => {
        this.currentPointer = null
        this.element.classList.remove('moving')
        this.element.removeEventListener('pointermove', this.movePointer)
      }

      getSelectedPointer (event) {
        const pointers = this.element.querySelectorAll('.pointer')

        for (const pointer of pointers) {
          if (pointer.contains(event.target)) {
            this.currentPointer = pointer
            return pointer
          }
        }
      }

      calculatePointerPosition (event, element) {

        // @TODO: Don't use event.target as element to calculate during moving, it will blink your pointer during move.

        const {
          left,
          top,
          width,
          height,
        } = element.getBoundingClientRect()

        let x = ((event.x - left - (this.settings.pointerSize / 2)) / width) *
          100
        let y = ((event.y - top - (this.settings.pointerSize / 2)) / height) *
          100

        return { x, y }
      }

      isPointer (event) {
        const pointer = this.getSelectedPointer(event)
        return pointer?.contains(event.target)
      }

      setPointerSize (width) {
        this.settings.pointerSize = width
      }

      getPointerSize () {
        return this.settings.pointerSize
      }

      destroy () {

        this.element.removeEventListener('pointerdown', this.addPointer)
        this.element.removeEventListener('pointerdown', this.preparePointer)
        this.element.removeEventListener('pointermove', this.movePointer)
        this.element.removeEventListener('pointerup', this.stopMovingPointer)

        delete window[this.name]

        weakMap.delete(this.element)
      }
    }

  })()

  const CreateInstance = (() => {

    return (PluginName, ClassName) => {

      window[PluginName] = function (elements, options, ...args) {

        for (const element of document.querySelectorAll(elements)) {

          let data = weakMap.get(element)

          if (!weakMap.has(element)) {
            data = new ClassName(element, Object.assign({}, options),
              PluginName)
            weakMap.set(element, data)
          }

          if (typeof options === 'string') {

            if (typeof data[options] === 'object') {
              return data[options]
            }

            if (typeof data[options] === 'function') {
              return data[options](...args)
            }
          }

        }
      }
    }

  })()

  CreateInstance('ImageMAP', Plugin)

  // Default Init
  // ImageMAP('#image-wrapper')

  // Init then call custom method to get or set
  // ImageMAP('#image-wrapper', 'setPointerSize', 30)

  // Init with custom option
  // ImageMAP('#image-wrapper', { pointerSize: 30 })

  // Get method
  // console.log( ImageMAP('#image-wrapper', 'getPointerSize') )

  // Destroy and remove
  // ImageMAP('#image-wrapper', 'destroy')

})(window);

(() => {
  try {


    document.addEventListener('image_map_init', (event) => {
      ImageMAP('.image-wrapper')
    })

    // Dispatch the event.
    const event = new Event('image_map_init')
    document.dispatchEvent(event)

  } catch (err) {
    // If failed (conflict?) log the error but don't stop other scripts breaking.
    window.console.log(err)
  }
})()