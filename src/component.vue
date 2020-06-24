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

    <slot name="before" />

    <div class="elder-stepper__component">
      <component
        v-for="item in value"
        v-show="active.id === item.id"
        :is="item.component"
        :key="item.id"
        v-bind="{
          ...(item.props || {}),
          step: item,
          isActive: active.id === item.id,
        }"
        v-on="{
          ...(item.listeners || {}),
          next,
          prev,
        }"
      >
        <template #default>
          <slot
            v-bind="{
              meta,
              item,
              next,
              prev,
              isActive: active.id === item.id,
            }"
          />
        </template>
        <template #navigation>
          <slot
            name="navigation"
            v-bind="{
              meta,
              item,
              next,
              prev,
              isActive: active.id === item.id,
            }"
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
      let index = this.value.findIndex((v) => v.id === this.active.id)
      return {
        prev: index > 0 ? this.value[index - 1] : null,
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
$variables: (
  'primary': #3a9acd,
  'border-radius': 3px,
);

@function GetVariable($key) {
  @return var(--vue-elder-#{$key}, map-get($variables, $key));
}

.elder-stepper {
  &__breadcrumbs {
    $spacing: 0.5rem;

    display: flex;
    align-items: center;

    padding: $spacing * 2;

    border-radius: GetVariable('border-radius');
    background-color: white;

    .elder-stepper__breadcrumb {
      $size: 24px;

      position: relative;

      &-button {
        line-height: 1;

        display: flex;
        align-items: center;

        cursor: pointer;
        transition: color 150ms ease-out;

        border: none;
        outline: none;
        background-color: transparent;

        span:last-child {
          position: relative;
          top: -1px;
        }
      }

      &-icon {
        font-family: monospace;
        font-size: 0.8em;
        font-weight: bold;
        line-height: $size;

        position: relative;
        z-index: 1;

        display: block;

        width: $size;
        height: $size;
        margin-right: $spacing;

        text-align: center;

        &:before {
          position: absolute;
          z-index: -1;
          top: 0;
          left: 0;

          width: 100%;
          height: 100%;

          content: '';
          transition: background-color 150ms ease-out;

          opacity: 0.2;
          border-radius: 50%;
          background-color: #bbb;
        }
      }

      &-arrow {
        margin: 0 $spacing * 2;

        opacity: 0.3;
      }

      &--active {
        .elder-stepper__breadcrumb-icon {
          color: white;
          &:before {
            opacity: 1;
            background-color: GetVariable('primary');
          }
        }
        .elder-stepper__breadcrumb-button {
          color: GetVariable('primary');
        }
      }

      &:hover {
        .elder-stepper__breadcrumb-icon {
          position: relative;

          &:before {
            background-color: GetVariable('primary');
          }
        }
      }
    }
  }

  &__component {
    margin-top: 1rem;
  }
}
</style>
