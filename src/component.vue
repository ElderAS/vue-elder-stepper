<template>
  <div class="elder-stepper">
    <div class="elder-stepper__breadcrumbs">
      <template v-for="(item, index) in value">
        <FontAwesomeIcon
          v-if="index > 0"
          class="elder-stepper__breadcrumb-arrow"
          :icon="icon"
          :key="'arrow-' + index"
        />
        <div
          :key="index"
          class="elder-stepper__breadcrumb"
          :class="{ 'elder-stepper__breadcrumb--active': item.id === active.id }"
          @click="state.set(item.id)"
        >
          <slot
            name="breadcrumb"
            :item="item"
            :is-active="item.id === active.id"
            :index="index"
          >
            <button type="button" class="elder-stepper__breadcrumb-button">
              <span class="elder-stepper__breadcrumb-icon">
                <FontAwesomeIcon v-if="item.icon" :icon="item.icon" size="sm" />
                <template v-else>{{ index + 1 }}</template>
              </span>
              <span>{{ item.label }}</span>
            </button>
          </slot>
        </div>
      </template>
    </div>

    <div class="elder-stepper__component">
      <component
        v-for="item in value"
        v-show="active.id === item.id"
        :is="item.component"
        :key="item.id"
        v-bind="{
          ...(item.props || {}),
          step: item,
        }"
        v-on="{
          ...(item.listeners || {}),
          next,
          prev,
        }"
      >
        <template #default>
          <slot :meta="meta" :item="item" :isActive="active.id === item.id" />
        </template>
        <template #navigation>
          <slot
            name="navigation"
            :meta="meta"
            :item="item"
            :isActive="active.id === item.id"
          />
        </template>
      </component>
    </div>
  </div>
</template>

<script>
/*
  Value item spec:
  {
    component,
    props {
      isValid.sync
    },
    listeners,
    label,
    id,
    icon,
  }
*/
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { iconBinding } from './utils'
import { Options } from '../index'
import States from './states'
import './icons'

export default {
  props: {
    value: {
      type: Array,
      required: true,
      default: () => [],
    },
    stateHandler: {
      type: String,
      enums: Object.keys(States),
      default: 'none',
    },
    stateKey: {
      type: String,
      default: 'step',
    },
    breadcrumbIcon: [String, Array],
  },
  data() {
    return {
      state: null,
      active: null,
    }
  },
  watch: {
    stateHandler: {
      handler(value) {
        if (this.state) this.state.destroy()
        this.state = new States[value](this)
      },
      immediate: true,
    },
  },
  computed: {
    meta() {
      let index = this.value.indexOf(this.active)
      return {
        prev: index ? this.value[index - 1] : null,
        active: this.active,
        next: index < this.value.length - 1 ? this.value[index + 1] : null,
      }
    },
    icon() {
      return this.breadcrumbIcon || Options.icons.breadcrumb
    },
  },
  methods: {
    getIcon: iconBinding,
    next() {
      if (!this.meta.next) return
      this.state.set(this.meta.next.id)
    },
    prev() {
      if (!this.meta.prev) return
      this.state.set(this.meta.prev.id)
    },
  },
  components: {
    FontAwesomeIcon,
  },
}
</script>

<style lang="scss">
.elder-stepper {
  @import './variables.scss';

  &__breadcrumbs {
    $spacing: 0.5rem;
    border-radius: $border-radius;
    display: flex;
    align-items: center;
    background-color: white;
    padding: $spacing * 2;

    .elder-stepper__breadcrumb {
      $size: 24px;
      position: relative;

      &-button {
        display: flex;
        align-items: center;
        cursor: pointer;
        line-height: 1;
        transition: color 150ms ease-out;

        span:last-child {
          position: relative;
          top: -1px;
        }
      }

      &-icon {
        width: $size;
        height: $size;
        background-color: rgba($border-color, 0.6);
        border-radius: 50%;
        font-size: 0.8em;
        font-weight: bold;
        margin-right: $spacing;
        display: block;
        text-align: center;
        font-family: monospace;
        line-height: $size;

        transition: background-color 150ms ease-out;
      }

      &-arrow {
        margin: 0 $spacing * 2;
        opacity: 0.3;
      }

      &--active {
        .elder-stepper__breadcrumb-icon {
          background-color: $primary !important;
          color: white;
        }
        .elder-stepper__breadcrumb-button {
          color: $primary;
        }
      }

      &:hover {
        .elder-stepper__breadcrumb-icon {
          background-color: rgba($primary, 0.2);
        }
      }
    }
  }

  &__component {
    margin-top: 1rem;
  }
}
</style>
