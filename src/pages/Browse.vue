<template>
	<AppWrapper>
		<div>Browse transcriptions</div>
		<table>
			<thead>
				<tr>
					<th>Image</th>
					<th>Scientific Name</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><img src="../components/nhm.png"></td>
					<td>Rhombus rhombus</td>
					<td><a href="#">Edit</a></td>
				</tr>
			</tbody>
		</table>
	</AppWrapper>
</template>

<script>
import AppWrapper from '../components/AppWrapper.vue';

export default {
	components: {
		AppWrapper
	}
};
</script>
