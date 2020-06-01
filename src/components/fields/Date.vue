<template>
	<div class="Date">
		<input :class="$vnode.data.staticClass" @input="input" @blur="blur" ref="text">
		<input type="hidden" :name="name + '.day'" :value="day" />
		<input type="hidden" :name="name + '.month'" :value="month" />
		<input type="hidden" :name="name + '.year'" :value="year" />
		<input type="hidden" :name="name" :value="isoDate" />
	</div>
</template>

<script>
const DATE_MATCH = /^(?:([0-9]{4})|--)(?:(?:(?:\b-)?([0-9]{2})|-)([0-9]{2})?)?$/;

const months = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december'
];
const numerals = Object.assign(Object.create(null), {
	i: 1,
	ii: 2,
	iii: 3,
	iiii: 4,
	iv: 4,
	v: 5,
	vi: 6,
	vii: 7,
	viii: 8,
	viiii: 9,
	ix: 9,
	x: 10,
	xi: 11,
	xii: 12
});

export default {
	data(){
		return {
			day: null,
			month: null,
			year: null
		}
	},
	computed: {
		isoDate(){
			const day = this.day ? String(this.day).padStart(2, '0') : '';
			const month = this.month ? String(this.month).padStart(2, '0') : day ? '-' : '';
			const year = this.year ? ((!day && month) ? this.year + '-' : String(this.year)) : month ? '--' : '';
			if(day && year && !month) {
				// Invalid date combo
				return '';
			}
			return year+month+day;
		}
	},
	props: ['name', 'value'],
	mounted() {
		if(typeof this.value === 'object') {
			const { day, month, year } = this.value;

			this.$refs.text.value = [day, months[month-1], year].join(' ');
		} else {
			const match = this.value && this.value.match(DATE_MATCH);
			if(match) {
				const [, year, month, day] = match;

				this.$refs.text.value = [day||'', month ? months[month-1] : '', year || ''].join(' ');
			} else {
				this.$refs.text.value = this.value || '';
			}
		}
		this.format(this.$refs.text, true);
	},
	methods: {
		blur($event) {
			this.format($event.target, true);
		},
		input($event){
			if($event.inputType !== 'insertText') {
				return;
			}

			this.format($event.target);
		},
		format(target, sort = false){
			const format = formatDate(target.value, target.selectionStart, sort);

			target.value = format.string;
			target.setSelectionRange(...format.selection);
			this.day = format.values.day;
			this.month = format.values.month;
			this.year = format.values.year;
			this.$emit('input', {
				day: this.day,
				month: this.month,
				year: this.year,
				iso: this.isoDate
			});
		}
	}
}

function formatDate(value, c, sort) {

	const values = {
		day: null,
		month: null,
		year: null
	}

	const parts = [];

	for(const m of value.matchAll(/[a-z]+|[0-9]{1,4}|[^a-z0-9]+/ig)) {
		const input = m[0];
		let field = null;
		let value = null;
		let suggest = null;
		let text = null;

		if(input.match(/[0-9]/)) {
			if(!values.day && input <= 31 && (!values.year || values.month || input > 12)) {
				field = 'day';
				if(input >= 1) {
					text = value = parseInt(input, 10);
				}
			} else if(!values.month && input <= 12) {
				field = 'month';
				value = parseInt(input, 10);
			} else
			if(!values.year) {
				field = 'year';
				if(input.length === 4) {
					text = value = parseInt(input, 10);
				}
			}
		} else if(input.match(/[a-z]/)) {
			if(!values.month) {
				field = 'month';

				const month = input.toLowerCase();
				if(month in numerals) {
					value = numerals[month];
				} else {
					const mIx = months.findIndex(m => m.indexOf(month) === 0);
					if(mIx >= 0) {
						value = mIx + 1;
						suggest = true;
					}
				}
			}
		} else {
			field = 'space';
		}

		if(field === 'month' && value) {
			text = months[value - 1].replace(/^./, c => c[0].toUpperCase());
		}

		if(field) {
			if(value) {
				values[field] = value;
			}

			const part = {
				field,
				input,
				value,
				text
			}

			if(c > m.index && c <= m.index + input.length) {
				part.editing = true;
				part.offset = c - m.index;
				part.suggest = suggest;
			}

			if(part.value || part.editing) {
				parts.push(part);
			}
		}
	}

	let string = '';
	let cursor = [c, 0];

	if(sort) {
		const order = {
			day: 1,
			month: 2,
			year: 3
		};

		parts.sort((a, b) => order[a.field] - order[b.field]);
	}

	for(let i = 0; i < parts.length; i++) {
		const part = parts[i];

		if(i > 0) {
			string += ' ';
		}

		if(!part.editing) {
			string += part.text;
		} else {
			cursor[0] = string.length + part.offset;
			if(part.suggest) {
				string += part.text;
				cursor[1] = part.text.length - part.offset;
			} else {
				string += part.input;
			}
		}
	}

	return { string, values, selection: [cursor[0], cursor[0] + cursor[1]] };
}
</script>

<style>
.Date {
	display: contents;
}
</style>
