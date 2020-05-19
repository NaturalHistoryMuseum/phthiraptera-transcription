import Form from './Form.vue';
import { shallowMount } from '@vue/test-utils'

const propsData = {
	token: 'abc',
	scientificName: 'Sci name',
	suggestions: {},
	values: {},
	barcodes: [],
	thumbnails: [],
	action: ''
}

globalThis.fetch = () => new Promise(()=>{});

test('Form renders', () => {
	expect(shallowMount(Form, { propsData, provide: { eventBus: {} } }).html()).toMatchSnapshot();
});
