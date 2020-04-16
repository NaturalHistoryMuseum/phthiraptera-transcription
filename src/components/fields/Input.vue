<template>
	<Field :value="value" :reset="reset">
		<template v-slot:label>
			<slot>
				<label class="Form__label" :for="name">
					{{ label }}
				</label>
			</slot>
		</template>
		<template v-slot:default="{ vModel, disabled }">
			<input v-bind="$attrs" v-on="$listeners" :name="name" :id="name" class="Form__input" v-model="vModel.value" :disabled="disabled" />
		</template>
	</Field>
</template>

<script>
import Field from '../Field';

export default {
	components: {
		Field
	},
	props: ['name', 'label', 'value', 'reset']
};
</script>
