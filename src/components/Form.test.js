import Form from './Form.vue';
import { shallowMount, mount } from '@vue/test-utils'

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

const mountOptions = { propsData, provide: { eventBus: {} } };

test('Form renders', () => {
	expect(shallowMount(Form, mountOptions).html()).toMatchSnapshot();
});

test('Host field auto-focuses', () => {
	expect(mount(Form, mountOptions).find('input[name=host]').attributes('autofocus')).toBe('autofocus');
});
