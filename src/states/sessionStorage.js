class StateHandler {
  constructor(instance) {
    this.cp = instance
    this.initialize()
  }

  get() {
    return sessionStorage.getItem(this.cp.stateKey) || this.cp.value[0].id
  }

  set(id = this.get()) {
    this.cp.active = this.cp.value.find((v) => v.id === id)

    if (this.get() !== id) sessionStorage.setItem(this.cp.stateKey, id)
  }

  initialize() {
    this.set()
  }

  destroy() {}
}

export default StateHandler
