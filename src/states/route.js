class StateHandler {
  constructor(instance) {
    this.cp = instance
    this.initialize()
  }

  get() {
    return this.cp.$route.params[this.cp.stateKey] || this.cp.value[0].id
  }

  set(id = this.get()) {
    if (this.cp.active && this.cp.active.id === id) return

    this.cp.active = this.cp.value.find((v) => v.id === id)

    if (this.cp.$route.params[this.cp.stateKey] !== id)
      this.cp.$router[!this.cp.$route.params[this.cp.stateKey] ? 'replace' : 'replace']({
        name: this.cp.$route.name,
        params: {
          ...this.cp.$route.params,
          [this.cp.stateKey]: id,
        },
        query: this.cp.$route.query,
      })
  }

  initialize() {
    this.unwatchState = this.cp.$watch(
      `$route.params.${this.cp.stateKey}`,
      (value) => this.set(value),
      { immediate: true },
    )
  }

  destroy() {
    this.unwatchState()
  }
}

export default StateHandler
