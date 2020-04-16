<template>
	<Field :value="value" :reset="reset">
		<template v-slot:label>
			<label class="Form__label" :for="name">
				{{ label }}
			</label>
		</template>
		<template v-slot:default="{ vModel, disabled }">
			<select :name="name" :id="name" class="Form__input" v-model="vModel.value" :disabled="disabled">
				<slot></slot>
			</select>
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
