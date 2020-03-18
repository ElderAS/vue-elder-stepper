class StateHandler {
  constructor(instance) {
    this.cp = instance
    this.current = null
    this.initialize()
  }

  get() {
    return this.current || this.cp.value[0].id
  }

  set(id = this.get()) {
    this.cp.active = this.cp.value.find(v => v.id === id)

    if (this.get() !== id) this.current = id
  }

  initialize() {
    this.set()
  }

  destroy() {}
}

export default StateHandler
