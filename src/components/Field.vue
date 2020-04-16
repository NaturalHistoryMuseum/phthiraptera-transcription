<template>
	<div class="Field">
		<div class="Field__label">
			<slot name="label" :label="label">{{ label }}</slot>
		</div>

		<div class="Field__component">
			<div class="Field__content"><slot :vModel="vModel" :disabled="disabled"></slot></div>
			<div class="Field__multi" v-if="disabled">
				Multi values. <button @click="edit">Edit</button>
			</div>
			<button class="Field__reset" v-if="changed" type="button" @click="resetValue">Reset</button>
		</div>
	</div>
</template>

<script>
function copy(value){
	return (
		(value == null || typeof value !== 'object') ? value :
		Array.isArray(value) ? value.map(copy):
		{ ...value }
	);
}

function isDifferent(a, b){
	// If it's a simple value, just compare
	if(
		!(typeof a == 'object') || !(typeof b == 'object') ||
		(a == null) || (b == null)
	) {
		return a != b;
	}

	// If values are arrays, check elements are in correct order
	if(Array.isArray(a) && Array.isArray(b))  {
		if(a.length !== b.length) {
			return true;
		}

		const source = [...b];

		for(const val of a) {
			const ix = source.findIndex(v => !isDifferent(v, val));
			if(ix < 0) {
				return true;
			}

			source.splice(ix, 1);
		}

		return false;
	}

	// Otherwise objects, check all keys match
	const keys = Object.keys(a);
	if(keys.length !== Object.keys(b).length) {
		return true;
	}

	return keys.some(
		key => isDifferent(a[key], b[key])
	);
}

const multiple = Symbol('multiple');

const multiValues = ([v0, ...values]) => values.some(v => isDifferent(v, v0)) ? multiple : v0;

export default {
	multiple,
	multiValues,
	props: ['value', 'label', 'empty', 'reset'],
	data(){
		return {
			vModel: {
				value: copy(this.getValueOrEmpty())
			},
			editing: false
		};
	},
	methods: {
		resetValue(){
			this.vModel.value = copy(this.getValueOrEmpty())
			this.editing = false;
		},
		edit(){
			this.vModel.value = copy(this.empty) || null;
			this.editing = true;
		},
		getValueOrEmpty(){
			if(this.value !== undefined) {
				return this.value;
			}

			return this.empty;
		},
	},
	computed: {
		multiple(){
			return this.value === this.$options.multiple;
		},
		disabled(){
			return this.multiple && !this.editing;
		},
		changed(){
			return (this.reset !== false) && isDifferent(this.vModel.value, this.value);
		}
	},
	watch: {
		value() {
			this.resetValue();
		}
	}
}
</script>

<style>
.Field {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
}

.Field__label {

}

.Field__reset {
	flex-basis: 0;
	align-self: start;
}

.Field__component {
	width: 100%;
	position: relative;
	display: flex;
}

.Field__content, .Field__content > * {
	width: 100%;
}

.Field__multi {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	line-height: 100%;
	color: white;
	background: rgba(20,20,20,0.7);
}
</style>
