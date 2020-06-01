<template>
	<AppWrapper :user="user">
		<div>Browse transcriptions</div><form ref="form" action="/">
		<select multiple v-model="fields">
		<option v-for="col in Object.keys(records[0] || {})" :key="col" :value="col">{{ col }}</option>
		</select>
		<table>
			<thead>
				<tr>
					<th id="select" :class="hideMounted">Select</th>
					<th>Image</th>
					<th>Scientific Name</th>
					<th v-for="field in fields" :key="field">
					{{ field }}
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(record, ix) in records" :key="record.barcode" :class="rowClass(record.barcode)" @click="toggleSelect(record.barcode)">
					<td :class="hideMounted"><input type="checkbox" name="barcode" :value="record.barcode" :aria-labelledby="'select sciName-' + ix" v-model="selected"></td>
					<td><img class="Browse__thumb" :src="thumbnail(record)" alt="" /></td>
					<td :id="'sciName-' + ix">{{ record.scientificName }}</td>
					<td v-for="field in fields" :key="field">{{ record[field] }}</td>
				</tr>
			</tbody>
		</table>
		<span v-if="prev">
			<a :href="prev">Previous {{ limit }}</a> |
		</span>
		<a :href="next">Next {{ limit }}</a><br>
		<button :disabled="mounted && selected.length == 0">Edit</button>
		</form>
	</AppWrapper>
</template>

<script>
import AppWrapper from '../components/AppWrapper.vue';

const search = keys => '?' + Object.entries(keys).map(e => e.join('=')).join('&');

export default {
	name: 'app',
	components: {
		AppWrapper
	},
	directives: {
		value(el, binding) {
			el.setAttribute('value', binding.value);
		}
	},
	data(){
		return {
			fields: ['barcode'],
			selected: [],
			mounted: false
		}
	},
	props: ['records', 'offset', 'limit', 'user'],
	methods: {
		imgUrl(assetId) {
			return `/asset/${assetId}`;
		},
		rowClass(barcode){
			const cls = 'Browse__row';

			return {
				[cls]: true,
				[cls + '--selected']: this.selected.includes(barcode)
			}
		},
		toggleSelect(barcode) {
			const ix = this.selected.indexOf(barcode);
			if(ix >= 0) {
				this.selected.splice(ix, 1);
			} else {
				this.selected.push(barcode);
			}
		},
		thumbnail(record){
			const thumb = record.thumbnails && record.thumbnails[0];
			return thumb || this.imgUrl(record.assets[0]);
		}
	},
	computed: {
		hideMounted() {
			return {
				//Browse__hidden: this.mounted
			}
		},
		next() {
			return search({ limit: this.limit, offset: this.offset + this.limit })
		},
		prev(){
			if(this.offset > 0) {
				return search({ limit: this.limit, offset: Math.max(this.offset - this.limit, 0) })
			}
			return false;
		}
	},
	mounted(){
		this.mounted = true;
	},
	/**
   * Load data from the API endpoint
   */
  async loadData(api, req){
		const limit = parseInt(req.query.get('limit'), 10) || 10;
		const offset = parseInt(req.query.get('offset'), 10) || 0;
    return {
      records: await api.getTranscriptions({
				limit,
				offset
			}),
			limit,
			offset,
			user: req.user
    }
  }
};
</script>

<style>
.Browse__thumb {
	max-width: 100px;
	max-height: 100px;
}

.Browse__row--selected {
	background: blue;
}

.Browse__hidden {
	max-width: 0;
	overflow: hidden;
}
</style>
