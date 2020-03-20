<template>
  <form ref="form" class="Form" method="POST" @submit="transcribe">
    <h2 v-if="scientificName">{{ scientificName }}</h2>
    <div class="Form__warning" v-else>Could not get scientific name - is data portal down?</div>
    <div class="Form__wrapper">
      <Dialog></Dialog>
      <input type="hidden" name="token" :value="token">
      <fieldset class="Form__fieldset">
        <legend>Host</legend>
        <label class="Form__label">
          Host <Tooltip>To search, type <em>species, Genus</em> and select from the list - e.g. <em>bufo, Bufo</em>.</Tooltip>
          <input name="host" list="hosts" type="text" class="Form__input" @blur="checkHost">
          <datalist id="hosts">
            <option v-for="host in hosts" :key="host">{{ host }}</option>
          </datalist>
        </label>
        <label class="Form__label">
          Host (if not in list)
          <input name="host_other" class="Form__input">
        </label>
        <label class="Form__label">
          Host type
          <select name="host_type" class="Form__input">
            <option value="No host">No host</option>
            <optgroup label="Host present">
              <option value="" selected>Host present</option>
              <option v-for="hostType in hostTypes.slice(1)" :key="hostType" :value="hostType">{{ hostType }}</option>
            </optgroup>
          </select>
        </label>
      </fieldset>
      <fieldset class="Form__fieldset">
        <legend>Locality</legend>
        <div class="Form__radioset">
          <label v-for="(label, l) in localities" :key="l" class="Form__checkbutton">
            <input type="radio" name="locality" :value="l" :checked="l==='Real'" v-once>
            {{ label }}
          </label>
          <Tooltip>Examples of artificial localities include museum, zoo, bred, lab, etc.</Tooltip>
        </div>
        <label class="Form__label">
          Country
          <select name="country" class="Form__input">
            <option selected></option>
            <option v-for="country in countries" :key="country">{{ country }}</option>
          </select>
        </label>
        <label class="Form__label">
          Precise locality
          <input class="Form__input" name="precise_locality">
        </label>
      </fieldset>
      <fieldset class="Form__fieldset">
        <legend>Collector(s)</legend>
        <div v-for="n in collectorCount" :key="n" class="Form__row">
          <label class="Form__label Form__initials-col">
            Collector initials
            <input name="collector_initials[]" class="Form__input">
          </label>
          <label class="Form__label Form__surname-col">
            Collector surname
            <input name="collector_surnames[]" class="Form__input">
          </label>
        </div>
        <button @click="addCollector" type="button">+</button>
      </fieldset>
      <fieldset class="Form__fieldset">
        <legend>Collection Date</legend>
        <label class="Form__label" for="collection_day">
          Date <Tooltip>Formatted as dd-mm-yyyy</Tooltip>
        </label>
        <div class="Form__input">
          <input type="number" placeholder="dd" min="1" max="31" name="collection_day" id="collection_day">
          <input type="number" placeholder="mm" min="1" max="12" name="collection_month">
          <input type="number" placeholder="yyyy" name="collection_year">
        </div>
        <div class="Form__radioset">
          <label class="Form__checkbutton">
            <input type="checkbox" name="collection_range" value="1">
            Date range
          </label>
        </div>
      </fieldset>
      <fieldset class="Form__fieldset">
        <legend>Registration Number</legend>
        <label class="Form__label">
          BM number <Tooltip>e.g. <em>BM 1980-1</em></Tooltip>
          <input name="registration_number" class="Form__input">
        </label>
      </fieldset>
      <fieldset class="Form__fieldset">
        <legend>Type Status</legend>
        <div class="Form__radioset">
          <label v-for="status in typeStatuses" :key="status" class="Form__checkbutton">
            <input type="checkbox" name="type_statuses[]" :value="status">{{ status }}
          </label>
        </div>
      </fieldset>
      <fieldset class="Form__fieldset">
        <legend>Sex/Stage</legend>
        <label class="Form__label">
          Total number of specimens
          <input name="total_count" type="number" class="Form__input">
        </label>
        <div class="Form__radioset">
          <label v-for="stage in ['adult female(s)', 'adult male(s)', 'nymph(s)']" :key="stage" class="Form__checkbutton">
            <input name="stage[]" type="checkbox" :value="stage">
            {{ stage }}
          </label>
        </div>
      </fieldset>

      <fieldset class="Form__fieldset">
        <legend>Other</legend>
        <label class="Form__checkbutton">
          <input type="checkbox" name="requires_verification">
          Requires Verification
        </label>
        <label class="Form__label">
          Explanation (if needed)
          <textarea name="notes" maxlength="255" class="Form__input"></textarea>
        </label>
      </fieldset>

      <div class="Form__error" v-if="error" id="errors">
        There were some errors in the form:
        <ul>
          <li v-for="e in error" :key="e">{{ e }}</li>
        </ul>
      </div>
    </div>

    <div class="Form__footer">
      <div class="Form__controls">
        <label class="Form__label Form__control">Your email (required)
          <input type="email" name="user_email" v-model="userEmail" class="Form__input" required>
        </label>
        <button class="Form__submit Form__control Form__input">Submit</button>
      </div>
      <details class="Form__data-protection">
        <summary>Data Protection</summary>
        The Natural History Museum will use your personal data in accordance with data protection legislation to process your requests. For more information please read our <a href="http://www.nhm.ac.uk/about-us/privacy-notice.html">privacy notice</a>.
      </details>
    </div>
  </form>
</template>

<script>
// TODO: Import these from form-fields.js and figure out why parcel doesn't want to build them
const getJson = file => fetch(file).then(async res => [...new Set(await res.json())]);

const getCountries = () => getJson('./countries.json');
const getHosts = () => getJson('./hosts.json');

const localities = {
  Real: 'Real',
  Unreadable: 'Unreadable',
  'Artificial (e.g. museum, zoo, bred, lab etc)': 'Artificial'
};

const typeStatuses = [
  'Allotype',
  'Holotype',
  'Lectotype',
  'Neotype',
  'Paralectotype',
  'Paratype',
  'Syntype',
  '*Other'
]

const hostTypes = [
  'No host',
  'Skin',
  'Straggler / questionable host',
  'Other (nest, clothing etc)'
]

import { Dialog, Tooltip } from './tooltips';

export default {
  components: {
    Tooltip,
    Dialog
  },
  props: ['token', 'error', 'scientificName'],
  inject: ['eventBus'],
  data: () => ({
    collectorCount: 1,
    countries: [],
    localities,
    hosts: [],
    typeStatuses,
    hostTypes,
    userEmail: ''
  }),
  mounted() {
    getCountries().then(countries => this.countries = countries);
    getHosts().then(hosts => this.hosts = hosts);
    window.addEventListener('unload', this.release);

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
    transcribe(event){
      const payload = {};
      const target = event.target;
      for (const el of target.elements) {
        if(!el.name || ((el.type === "checkbox" || el.type === "radio") && !el.checked)) {
          continue;
        }

        for (const value of [...(el.selectedOptions || [el])].map(o => o.value)) {
          const match = el.name.match(/^(.+)\[\]$/);

          if(match) {
            payload[match[1]] = (payload[match[1]] || []).concat(value);
          } else {
            payload[el.name] = value;
          }
        }
      }

      // Fire the transcribe event up the event bus so we can post to the API
      this.eventBus.$emit('transcribe', { payload, target })
      event.preventDefault();
      this.collectorCount = 1;
    },
    /**
     * Add another set of collector fields and focus the last one
     */
    addCollector(){
      this.collectorCount++;
      this.$nextTick(() => {
        const ciCol = this.$refs.form.elements.namedItem('collector_initials[]');
        ciCol[ciCol.length-1].focus();
      });
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
  color: #99F;
  margin: 0 0 0.5em;
  padding: 0;
}

.Form legend + * {
  clear: left;
}

.Form__footer {
  padding: 10px;
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #EEE;
}

.Form__controls {
  display: flex;
  justify-content: space-between;
}

.Form__data-protection {
  font-size: 0.8em;
}

.Form__control {
  display: block;
  line-height: 2;
  flex: 0 1 49%;
}

.Form__submit {
  min-width: 25%;
}

.Form__wrapper {
  /* Make max height ridiculously large
     so columns never overflow horizontally */
  columns: 2 250px;
  max-height: 1000vh;
  flex: 1;
  padding-bottom: 100px;
}

.Form__warning {
  padding: 1em 0.5em;
  color: #999;
  font-weight: bold;
  font-style: italic;
}

.Form__label {
  display: block;
  font-weight: bold;
  font-size: 0.9em;
}

.Form__fieldset {
  -webkit-column-break-inside: avoid; /* Chrome, Safari, Opera */
  page-break-inside: avoid; /* Firefox */
  break-inside: avoid;
  margin-bottom: 5px;
}

.Form__radioset {
  font-size: 0.9em;
  display: flex;
  flex-wrap: wrap;
  margin: -0.25em;
  margin-bottom: 0.5em;
  align-items: center;
}

.Form__checkbutton {
  border: 1px solid #CCC;
  border-radius: 1em;
  padding: 0.25em;
  margin: 0.25em;
  display: inline-flex;
}

.Form__checkbutton:hover {
  box-shadow: #333 1px 1px;
  transform: translate(0, -1px);
}

.Form__checkbutton:active {
  box-shadow: #333 1px 1px inset;
  transform: translate(0, 1px);
}

.Form__input {
  margin: 3px 0 10px;
  padding: 5px;
  width: 100%;
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
