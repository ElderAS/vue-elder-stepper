import StepperComponent from './src/component.vue'

const Options = {
  icons: {
    breadcrumb: ['fas', 'long-arrow-alt-right'],
  },
}

const install = Vue => {
  Vue.component('stepper-component', StepperComponent)
}

const setup = options => {
  for (let key in options) {
    if (!(key in Options)) return
    Options[key] = options[key]
  }
}

export default {
  install,
}

export { StepperComponent, install as StepperComponentInstaller, setup, Options }
