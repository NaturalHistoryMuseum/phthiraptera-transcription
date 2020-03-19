<template>
	<button class="Tooltip" type="button" :title="title" @click="activate">?</button>
</template>

<script>
// Utility function to get all the text parts of a vnodes tree
const textParts = vnodes => vnodes.flatMap(
	node => node.children ? textParts(node.children) : node.text
);

const Tooltip = {
	computed: {
		// Text for the title string
		title(){
			return textParts(this.$slots.default).join('');
		}
	},
	methods: {
		// Fire the activate event on the event bus
		activate(){
			this.$options.tooltipBus.$emit('activate', this.$slots.default, this.$el)
		}
	}
};

export default Tooltip;
</script>

<style>
.Tooltip {
  background: transparent;
  border: 1px solid #99F;
  font-weight: normal;
  color: black;
  cursor: help;
  margin: 0;
  padding: 0 0.4em;
  border-radius: 1em;
}
</style>
