<template>
  <div class="elder-stepper">
    <div class="elder-stepper__breadcrumbs">
      <template v-for="(item, index) in value">
        <Icon
          v-if="index > 0"
          class="elder-stepper__breadcrumb-arrow"
          :icon="icon"
          :key="'arrow-' + index"
        />
        <div
          :key="index"
          class="elder-stepper__breadcrumb"
          :class="{ 'elder-stepper__breadcrumb--active': isActive(item) }"
        >
          <slot
            name="breadcrumb"
            :item="item"
            :is-active="isActive(item)"
            :index="index"
            :navigate="() => state.set(item.id)"
          >
            <button
              type="button"
              class="elder-stepper__breadcrumb-button"
              :disabled="item.disabled"
              @click="state.set(item.id)"
            >
              <span class="elder-stepper__breadcrumb-icon">
                <Icon v-if="item.icon" :icon="item.icon" size="sm" />

                <template v-else>{{ index + 1 }}</template>
              </span>
              <span>{{ item.label }}</span>
            </button>
          </slot>
        </div>
      </template>
    </div>

    <slot
      name="before"
      v-bind="{
        meta,
        next,
        prev,
      }"
    />

    <component
      :is="transition ? 'transition-group' : 'div'"
      :name="transition"
      tag="div"
      class="elder-stepper__component"
    >
      <component
        v-for="item in value"
        v-show="isActive(item)"
        :is="item.component"
        :key="item.id"
        v-bind="{
          ...(item.props || {}),
          step: item,
          isActive: isActive(item),
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
              isActive: isActive(item),
            }"
          />
        </template>
        <template #navigation="scopedProps">
          <slot
            name="navigation"
            v-bind="{
              meta,
              item,
              next,
              prev,
              isActive: isActive(item),
              ...scopedProps,
            }"
          />
        </template>
      </component>
    </component>

    <slot
      name="after"
      v-bind="{
        meta,
        next,
        prev,
      }"
    />
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
import Icon from '@kvass/vue2-icon'
import { iconBinding } from './utils'
import { Options } from '../index'
import States from './states'

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
    transition: String,
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
      handler: 'setState',
      immediate: true,
    },
  },
  computed: {
    meta() {
      let index = this.value.findIndex((v) => this.isActive(v))
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
    isActive(item) {
      return this.active && this.active.id === item.id
    },
    next() {
      if (!this.meta.next) return
      this.state.set(this.meta.next.id)
    },
    prev() {
      if (!this.meta.prev) return
      this.state.set(this.meta.prev.id)
    },
    setState() {
      if (this.state) this.state.destroy()
      this.state = new States[this.stateHandler](this)
    },
  },
  created() {
    this.setState()
  },
  components: {
    Icon,
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

@function css-darken($key, $delta) {
  @return hsl(var(--#{$key}-h), var(--#{$key}-s), calc(var(--#{$key}-l) - #{$delta}));
}

.elder-stepper {
  &__breadcrumbs {
    $spacing: 0.5rem;

    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.65rem;

    border-radius: GetVariable('border-radius');

    .elder-stepper__breadcrumb {
      $size: 23px;

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

        border-radius: GetVariable('border-radius');

        span:last-child {
          position: relative;
          top: -1px;
        }

        &:focus-visible {
          outline: 2px solid black;
          outline-offset: 4px;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      &-icon {
        font-family: monospace;
        font-size: 0.7em;

        line-height: $size;

        position: relative;
        z-index: 1;

        display: block;

        width: $size;
        height: $size;
        margin-right: 0.5rem;

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
          background-color: rgba(black, 0.2);
          border: 1px solid rgba(black, 0.22);
        }
      }

      &-arrow {
        margin: 0 $spacing * 2;

        opacity: 0.25;
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
