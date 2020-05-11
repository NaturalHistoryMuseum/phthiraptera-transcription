<template>
  <form ref="form" class="Form" method="POST" :action="action" @submit="doSubmit">
    <input type="hidden" name="barcode[]" v-for="barcode in barcodes" :key="barcode" :value="barcode" />
    <input type="hidden" name="thumbnail[]" v-for="thumbnail in thumbnails" :key="thumbnail" :value="thumbnail" />
    <input type="hidden" name="sciName" :value="scientificName" />
    <Dialog></Dialog>
    <div class="Form__wrapper">
      <input type="hidden" name="token" :value="token">
      <div class="Form__columns">
        <fieldset class="Form__fieldset">
          <legend>Host</legend>
          <Field :reset="showReset" v-slot="{ vModel, disabled }" :value="fields.host" class="Form__float-reset">
            <fieldset :disabled="disabled" class="Form__group">
              <div class="Form__label">
                <label for="host">Host</label><Tooltip>To search, type <em>species, Genus</em> and select from the list - e.g. <em>bufo, Bufo</em>.</Tooltip>
              </div>
              <input class="Form__input" name="host" id="host" list="hosts" @change="vModel.value = $event.target.value" :value="hosts.includes(vModel.value) ? vModel.value : ''">
              <datalist id="hosts">
                <option v-for="host in hosts" :key="host">{{ host }}</option>
              </datalist>
              <label class="Form__label">
                Host (if not in list)
                <Suggest
                  name="precise_locality"
                  :suggestions="suggestions.host"
                  v-slot="{ listId }">
                  <input
                    class="Form__input"
                    name="host_other"
                    id="host_other"
                    @change="vModel.value = $event.target.value"
                    :value="!hosts.includes(vModel.value) ? vModel.value : ''"
                    :list="listId">
                </Suggest>
              </label>
            </fieldset>
          </Field>
          <Select :reset="showReset" name="host_type" value="" label="Host type" :value="fields.host_type">
            <option value="No host">No host</option>
            <optgroup label="Host present">
              <option value="">Host present</option>
              <option v-for="hostType in hostTypes.slice(1)" :key="hostType" :value="hostType">{{ hostType }}</option>
            </optgroup>
          </Select>
        </fieldset>
        <fieldset class="Form__fieldset">
          <legend>Locality</legend>
          <Field :reset="showReset" empty="Real" v-slot="{ vModel, disabled }" :value="fields.locality">
            <fieldset class="Form__radioset" :disabled="disabled">
              <label v-for="(label, l) in localities" :key="l" class="Form__checkbutton">
                <input type="radio" name="locality" :value="l" v-model="vModel.value">
                {{ label }}
              </label>
              <Tooltip>Examples of artificial localities include museum, zoo, bred, lab, etc.</Tooltip>
            </fieldset>
          </Field>
          <Select :reset="showReset" name="country" label="Country" :value="fields.country">
            <option selected></option>
            <option v-for="country in countries" :key="country">{{ country }}</option>
          </Select>
          <Suggest
            :reset="showReset"
            label="Precise locality"
            name="precise_locality"
            :value="fields.precise_locality"
            :suggestions="suggestions.preciseLocality"></Suggest>
        </fieldset>
        <fieldset class="Form__fieldset">
          <legend>Collector(s)</legend>
          <Field :reset="showReset" :value="collectorNames" v-slot="{ vModel, disabled }" class="Form__float-reset">
            <fieldset  class="Form__group" :disabled="disabled">
              <div v-for="(collector, ix) in vModel.value" :key="ix" class="Form__row">
                <label class="Form__label Form__initials-col">
                  Collector initials
                  <input name="collector_initials[]" class="Form__input" v-model="collector.initials">
                </label>
                <label class="Form__label Form__surname-col">
                  Collector surname
                  <input name="collector_surnames[]" class="Form__input" v-model="collector.surname">
                </label>
              </div>
              <button @click="addCollector(vModel)" type="button" class="Form__button">+</button>
            </fieldset>
          </Field>
          <Suggest
            :reset="showReset"
            label="Institution or collection"
            name="collection"
            :value="fields.collection"
            :suggestions="suggestions.collection"></Suggest>
        </fieldset>
        <fieldset class="Form__fieldset">
          <legend>Collection Date</legend>
          <Field :reset="showReset" :value="defaultDate">
            <template v-slot:label>
              <label class="Form__label" for="collection_day">
                Date <Tooltip>Formatted as dd-mm-yyyy</Tooltip>
              </label>
            </template>
            <template v-slot:default="{ vModel, disabled }">
              <fieldset class="Form__input-group" :disabled="disabled">
                <input v-model="vModel.value && vModel.value.day" type="number" placeholder="dd" min="1" max="31" name="collection_day" id="collection_day">
                <input v-model="vModel.value && vModel.value.month" type="number" placeholder="mm" min="1" max="12" name="collection_month">
                <input v-model="vModel.value && vModel.value.year" type="number" placeholder="yyyy" name="collection_year">
              </fieldset>
              <div class="Form__radioset">
                <label class="Form__checkbutton">
                  <input type="checkbox" name="collection_range" value="1" v-model="vModel.value && vModel.value.range">
                  <input type="hidden" name="collection_range" value="" v-if="!disabled && !(vModel.value && vModel.value.range)">
                  Date range
                </label>
              </div>
            </template>
          </Field>
        </fieldset>
        <fieldset class="Form__fieldset">
          <legend>Registration Number</legend>
          <Input :reset="showReset" name="registration_number" :value="fields.registration_number">
            <div class="Form__label">
              <label for="registration_number">
                BM number
              </label>
              <Tooltip>e.g. <em>BM 1980-1</em></Tooltip>
            </div>
          </Input>
        </fieldset>
        <fieldset class="Form__fieldset">
          <legend>Type Status</legend>
          <Field :reset="showReset" :value="fields.type_statuses" :empty="[]" v-slot="{ vModel, disabled }">
            <fieldset class="Form__radioset" :disabled="disabled">
              <label v-for="status in typeStatuses" :key="status" class="Form__checkbutton">
                <input type="checkbox" name="type_statuses[]" :value="status" v-model="vModel.value">{{ status }}
              </label>
              <input type="hidden" name="type_statuses[]" value="" v-if="!disabled && vModel.value && (vModel.value.length === 0)">
            </fieldset>
          </Field>
        </fieldset>
        <fieldset class="Form__fieldset">
          <legend>Sex/Stage</legend>
          <Input :reset="showReset" name="total_count" type="number" label="Total number of specimens" :value="fields.total_count"></Input>
          <Field :reset="showReset" :value="stages" :empty="[]" v-slot="{ vModel, disabled }">
            <fieldset class="Form__radioset" :disabled="disabled">
              <label v-for="stage in stageNames" :key="stage" class="Form__checkbutton">
                <input name="stage[]" type="checkbox" :value="stage" v-model="vModel.value">
                {{ stage }}
              </label>
            </fieldset>
          </Field>
        </fieldset>

        <fieldset class="Form__fieldset">
          <legend>Other</legend>
          <Field :reset="showReset" v-slot="{ vModel, disabled }" :value="fields.requires_verification">
            <label class="Form__checkbutton">
              <input type="checkbox" name="requires_verification" v-model="vModel.value" :disabled="disabled">
              <input type="hidden" name="requires_verification" value="" v-if="!disabled && !vModel.value">
              Requires Verification
            </label>
          </Field>
          <Field :reset="showReset" v-slot="{ vModel, disabled }" :value="fields.notes">
            <label class="Form__label">
              Explanation (if needed)
              <textarea name="notes" maxlength="255" class="Form__input" v-model="vModel.value" :disabled="disabled"></textarea>
            </label>
          </Field>
        </fieldset>

        <div class="Form__error" v-if="error" id="errors">
          There were some errors in the form:
          <ul>
            <li v-for="e in error" :key="e">{{ e }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="Form__footer">
      <div class="Form__controls">
        <label class="Form__label Form__control">Email:
          <input type="email" name="user_email" :value="email" class="Form__email" required>
        </label>
        <Tooltip>
          <b>Data Protection</b><br>
          The Natural History Museum will use your personal data in accordance with data protection legislation to process your requests. For more information please read our <a href="http://www.nhm.ac.uk/about-us/privacy-notice.html">privacy notice</a>.
        </Tooltip>
        <button class="Form__submit Form__button">Submit</button>
      </div>
    </div>
  </form>
</template>

<script>
import { Dialog, Tooltip } from './tooltips';
import { getCountries, localities, getHosts, typeStatuses, hostTypes } from './form-fields.js';
import Field from './Field';
import Select from './fields/Select';
import Input from './fields/Input';
import Suggest from './fields/Suggest';

const lifeStages = {
  adult_female: 'adult female(s)',
  adult_male: 'adult male(s)',
  nymph: 'nymph(s)'
}

export default {
  components: {
    Tooltip,
    Dialog,
    Field,
    Select,
    Input,
    Suggest
  },
  props: ['token', 'scientificName', 'suggestions', 'values', 'barcodes', 'thumbnails', 'action', 'email'],
  inject: ['eventBus'],
  data: () => ({
    countries: [],
    localities,
    hosts: [],
    typeStatuses,
    hostTypes,
    error: null,
    multiple: Field.multiple,
    stageNames: Object.values(lifeStages)
  }),
  async mounted() {
    getCountries().then(countries => this.countries = countries);
    getHosts().then(hosts => this.hosts = hosts);
    window.addEventListener('unload', this.release);

    // Ensure the root component has mounted and added its own
    // pop state listener first
    await this.$nextTick();

    // Check for back/forward navigation and restore the form
    window.addEventListener('popstate', event => {
      if(!event.state || !event.state.formData) {
        this.collectorCount = 1;
        return;
      }

      // FormData can't be constructed from entries array,
      // so use URLSearchParams as it has roughly the same interface.
      const formData = new URLSearchParams(event.state.formData);

      // Make sure we have enough collector fields
      this.collectorCount = Math.max(
        formData.getAll('collector_initials[]').length,
        formData.getAll('collector_surnames[]').length
      );

      // Wait until Vue has rendered stuff
      this.$nextTick(() => {
        // Dedupe field keys
        const formKeys = new Set(formData.keys());

        for(const key of formKeys) {
          // Get element or nodeList for this key and associated values
          const item = this.$refs.form.elements.namedItem(key);
          const elements = item instanceof RadioNodeList ? item : [item];
          const values = formData.getAll(key);

          // Add a label so we can break the `for` from within `switch`
          nodeList:
          for(const ix of elements.keys()) {
            const element = elements[ix];

            if(!element) {
              continue;
            }

            switch(element.type) {
              case 'radio':
                // Only one radio should be checked, if we find it we can skip the others
                if(element.value === values[0]) {
                  element.checked = true;
                  break nodeList;
                }
                break
              case 'checkbox':
                // Checkboxes have to set checked to true or false
                element.checked = values.includes(element.value);
                break;
              default:
                // Other fiels accept value setting directly
                element.value = values[ix];
                break;
            }
          }
        }
      });
    });
  },
  beforeDestroy() {
    window.removeEventListener('unload', this.release);
  },
  watch: {
    token() {
      this.$refs.form.reset();
      this.$refs.form.host.focus();
    }
  },
  methods: {
    release() {
      navigator.sendBeacon('/api/release/', this.token);
    },
    checkHost(event) {
      if (this.hosts.indexOf(event.target.value) === -1) {
        event.target.form.host_other.value = event.target.value;
        event.target.value = '';
      }
    },
    doSubmit(event){
      const form = event.target;
      const payload = new URLSearchParams(new FormData(form));

      fetch(form.action, {
        method: form.method,
        body: payload,
        headers: {
          Accept: 'application/json'
        },
        redirect: 'manual'
      }).then(async res => {
        const body = res.headers.get('Content-Type').indexOf('json') > -1 ? await res.json() : await res.text();

        if(res.status >= 400) {
          this.error = Array.isArray(body) ? body : [body];
          this.$nextTick(() => {
            document.querySelector('errors').scrollIntoView();
          });
        } else {
          const url = new URL(window.location);
          const sp = new URLSearchParams(url.search);
          sp.delete('new');
          url.search = sp;
          window.history.replaceState(body, null, url.toString());
          const location = res.headers.get('location') || (body && body.location) || res.url;
          window.location = location;
        }
      })
      event.preventDefault();
    },
    /**
     * Add another set of collector fields and focus the last one
     */
    addCollector(vModel){
      if(vModel.value) {
        vModel.value.push({});
      } else {
         vModel.value = [{}];
      }

      this.$nextTick(() => {
        const ciCol = this.$refs.form.elements.namedItem('collector_initials[]');
        ciCol[ciCol.length-1].focus();
      });
    }
  },
  computed: {
    showReset(){
      return Boolean(this.values && this.values.length > 1);
    },
    fields() {
      const records = this.values;

      return (records && records.length) ? Object.fromEntries(Object.entries(records[0]).map(
        ([key, val]) => [key, Field.multiValues(records.map(r => r[key]))]
      )) : {};
    },
    defaultDate(){
      const date = {
        day: this.fields.collection_day,
        month: this.fields.collection_month,
        year: this.fields.collection_year,
        range: this.fields.collection_range
      };

      return Object.values(date).includes(Field.multiple) ? Field.multiple : date;
    },
    stages(){
      const stages = Object.keys(lifeStages);
      const values = stages.map(s => this.fields[s]);
      const multiple = values.includes(Field.multiple);
      return multiple ? Field.multiple : stages.filter(s => this.fields[s]).map(s => lifeStages[s]);
    },
    collectorNames(){
      const collectors = this.fields.collectors;
      if(collectors === Field.multiple) {
        return Field.multiple;
      }
      return collectors && collectors.length ? collectors : [{}];
    }
  }
}
</script>

<style>
.Form {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.Form legend {
  float: left;
  width: 100%;
  color: #78F;
  margin: 0 0 0.5em;
  padding: 0;
}

.Form legend + * {
  clear: left;
}

.Form__footer {
  padding: 10px;
  background: #EEE;
}

.Form__controls {
  display: flex;
  align-items: center;
}

.Form__control {
  display: flex;
  align-items: center;
  margin-right: 0.7em;
}

.Form__columns {
  /* Make max height ridiculously large
     so columns never overflow horizontally */
  columns: 2 250px;
  column-gap: 2px;
  max-height: 1000vh;
}

.Form__wrapper {
  overflow-y: auto;
  flex: 1;
}

.Form__label {
  display: block;
  font-weight: bold;
  font-size: 0.9em;
}

.Form__group {
  border: none;
  padding: 0;
  margin: 0;
}

.Form__fieldset {
  -webkit-column-break-inside: avoid; /* Chrome, Safari, Opera */
  page-break-inside: avoid; /* Firefox */
  break-inside: avoid;
  margin-bottom: 5px;
  padding-bottom: 5px;
  background: #EEF;
  border-color: #CCF;
}

.Form__radioset {
  font-size: 0.9em;
  display: flex;
  flex-wrap: wrap;
  margin: -0.25em;
  margin-bottom: 0.5em;
  align-items: center;
  padding: 0;
  border: none;
}

.Form__checkbutton {
  border: 1px solid #CCC;
  border-radius: 1em;
  padding: 0.25em;
  margin: 0.25em;
  display: inline-flex;
}

.Form__button:hover,
.Form__checkbutton:hover {
  box-shadow: #333 1px 1px;
  transform: translate(0, -1px);
}

.Form__button:active,
.Form__checkbutton:active {
  box-shadow: #333 1px 1px inset;
  transform: translate(0, 1px);
}

.Form__input,
.Form__input-group {
  margin: 3px 0 10px;
  width: 100%;
  border: none;
  padding: 0;
}

.Form__input,
.Form__input-group input {
  background: white;
}

.Form__input,
.Form__input-group input,
.Form__button {
  border: 1px solid #AAF;
  border-radius: 5px;
  padding: 5px;
}

.Form__button {
  min-width: 3em;
  background: #DDD;
  margin-bottom: 10px;
}

.Form__submit {
  min-width: 50%;
  margin-left: auto;
  margin-bottom: 0;
}

.Form__error {
  background: #FFCCCC;
  border: 1px solid red;
  color: #633000;
  margin: 0.5em;
  padding: 0.5em;
}

.Form__row {
  display: flex;
  align-items: flex-end;
}

.Form__initials-col {
  flex: 1;
}

.Form__surname-col {
  flex: 2;
}

.Form__float-reset .Field__reset {
  position: absolute;
  width: auto;
  right: 0;
  top: -15px;
}

.Form__info {
  display: block;
  font-weight: normal;
}

[name="collection_day"], [name="collection_month"] {
  width: 25%;
}

[name="collection_year"] {
  width: 45%;
}
</style>
