<template>
	<div>
		<slot v-bind:listId="listId">
			<Input
				:list="listId"
				:name="name"
				v-bind="$attrs"
				v-on="$listeners">
			</Input>
		</slot>
		<datalist :id="listId">
			<option v-for="s in suggestions" :key="s">{{ s }}</option>
		</datalist>
	</div>
</template>

<script>
import Input from './Input';

export default {
	components: {
		Input
	},
	props: ['suggestions', 'name'],
	computed: {
		listId() {
			return this.name + '-list';
		}
	}
};
</script>
