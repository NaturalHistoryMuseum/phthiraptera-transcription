<template>
	<dialog :open="!!value" class='Dialog'>
		<div class="Dialog__content"><VNode :vnodes="value"></VNode></div>
		<div class="Dialog__arrow" data-popper-arrow=''></div>
	</dialog>
</template>

<script>
import { createPopper } from '@popperjs/core';

// Helper for rendering VNodes in templates
const VNode = {
	functional: true,
	render: (h, ctx) => {
		return ctx.props.vnodes
	}
}

export default {
	components: {
		VNode
	},
	data() {
		return {
			value: null
		};
	},
	mounted(){
		// Tooltip buttons will send `activate` events up the shared event bus
		this.$options.tooltipBus.$on('activate', (tooltipVnodes, target) => {
			this.setTarget(target, tooltipVnodes);
		});
	},
	methods: {
		/**
		 * Set the tooltip's anchor - usually the button that activated the tooltip
		 * If already set, hide the tooltip
		 * @param target HTMLElement - The element to anchor on to
		 * @param children VNode[] - Array of vnodes to insert into the modal
		 */
		setTarget(target, children) {
			// Prevent memory leaks
			if(this.popper) {
				this.popper.destroy();
			}

			// If target is already selected, hide
			if(this.target === target) {
				this.target = null;
				this.value = null;
				return;
			}


			this.value = children;

			// `this.target` is not in data(){} as it doesn't need to be reactive
			this.target = target;
			this.popper = createPopper(target, this.$el, {
				placement: 'right',
				modifiers: [
				{
					name: 'offset',
					options: {
						offset: [0, 8],
					},
				}
				]
			});
		}
	}
}
</script>

<style>
.Dialog {
  background: #333;
  color: white;
  font-weight: bold;
  padding: 4px 8px;
  font-size: 13px;
  border-radius: 4px;
  max-width: 300px;
	z-index: 1;
}

.Dialog__arrow,
.Dialog__arrow::before {
  position: absolute;
  width: 8px;
  height: 8px;
  z-index: -1;
}

.Dialog__arrow::before {
  content: '';
  transform: rotate(45deg);
  background: #333;
}

.Dialog[data-popper-placement^='top'] > .Dialog__arrow {
  bottom: -4px;
}

.Dialog[data-popper-placement^='bottom'] > .Dialog__arrow {
  top: -4px;
}

.Dialog[data-popper-placement^='left'] > .Dialog__arrow {
  right: -4px;
}

.Dialog[data-popper-placement^='right'] > .Dialog__arrow {
  left: -4px;
}

.Dialog a:link, a:visited, a:active {
	color: #FFCCFF;
}
</style>
