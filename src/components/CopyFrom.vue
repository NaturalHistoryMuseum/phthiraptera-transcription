<template>
	<form class="CopyFrom">
		<input type="hidden" name="new" value="1" v-if="isNew" />
		<input type="hidden" name="barcode" v-for="barcode in barcodes" :key="barcode" :value="barcode" />
		<button class="CopyFrom__button">Copy from</button>
		<select class="CopyFrom__select" name="copy_from">
			<option value="">[Clear]</option>
			<option v-for="barcode in copyFrom" :key="barcode">
				{{ barcode }}
			</option>
		</select>
	</form>
</template>

<script>
export default {
	props: ['isNew', 'barcodes', 'copyFrom']
}
</script>

<style>
.CopyFrom {
	margin-bottom: 5px;
	margin-right: 15px;
}

.CopyFrom__button {
	border: 1px solid #AAF;
	border-radius: 5px;
	padding: 5px;
	min-width: 200px;
}

.CopyFrom__select {
	border: 1px solid #AAF;
	border-radius: 5px;
	padding: 5px;
}
</style>
