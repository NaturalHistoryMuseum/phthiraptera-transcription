<template>
  <form ref="form" class="Form" method="POST" @submit="transcribe">
    <div class="Form__wrapper">
      <input type="hidden" name="barcode" :value="barcode">
      <fieldset class="Form__fieldset">
        <legend>Locality</legend>
        <div class="Form__radioset">
          <label v-for="l in localities" :key="l" class="Form__checkbutton">
            <input type="radio" name="locality" :value="l" :checked="l==='Location'" v-once>
            {{ l }}
          </label>
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
        <legend>Host</legend>
        <label class="Form__label">
          Host
          <input name="host" list="host_list" class="Form__input">
          <datalist id="host_list">
            <option v-for="host in hosts" :key="host">{{ host }}</option>
          </datalist>
        </label>
        <div class="Form__radioset">
          <label v-for="hostType in hostTypes" :key="hostType" class="Form__checkbutton">
            <input type="radio" name="host_type" :value="hostType" :checked="hostType==='No host'" v-once>
            {{ hostType }}
          </label>
        </div>
      </fieldset>
      <fieldset class="Form__fieldset">
        <legend>Collection Date</legend>
        <label class="Form__label" for="collection_day">
          Date (dd-mm-yyy)
        </label>
        <div class="Form__input">
          <input type="number" min="1" max="31" name="collection_day" id="collection_day">
          <input type="number" min="1" max="12" name="collection_month">
          <input type="number" name="collection_year">
        </div>
        <div class="Form__radioset">
          <label class="Form__checkbutton">
            <input type="checkbox" name="collection_range" value="1">
            Date range
          </label>
        </div>
      </fieldset>
      <fieldset class="Form__fieldset">
        <legend>Collector</legend>
        <label class="Form__label">
          Collector name
          <input name="collectors[]" class="Form__input" v-for="n in collectorCount" :key="n">
          <button @click="collectorCount++" type="button">+</button>
        </label>
      </fieldset>
      <fieldset class="Form__fieldset">
        <legend>Type Status</legend>
        <label class="Form__label">
          Type status
          <sub>Ctrl-click to select multiple</sub>
          <select name="type_statuses[]" class="Form__input" multiple>
            <option v-for="status in typeStatuses" :key="status">{{ status }}</option>
          </select>
        </label>
      </fieldset>
      <fieldset class="Form__fieldset">
        <legend>Registration Number</legend>
        <label class="Form__label">
          BM#
          <input name="registration_number" class="Form__input">
        </label>
      </fieldset>
      <fieldset class="Form__fieldset">
        <legend>Sex/Stage</legend>
        <label class="Form__label">
          Total count
          <input name="total_count" type="number" class="Form__input">
        </label>
        <div class="Form__radioset">
          <label v-for="stage in ['adult female', 'adult male', 'nymph']" :key="stage" class="Form__checkbutton">
            <input name="stage[]" type="checkbox" :value="stage">
            {{ stage }}
          </label>
        </div>
      </fieldset>

      <fieldset class="Form__fieldset">
        <legend>Meta</legend>
        <label class="Form__checkbutton">
          <input type="checkbox" name="requires_verification">
          Requires Verification
        </label>
      </fieldset>

      <div class="Form__error" v-if="error" id="errors">
        There were some errors in the form:
        <ul>
          <li v-for="e in error" :key="e">{{ e }}</li>
        </ul>
      </div>
    </div>

    <div class="Form__controls">
      <label class="Form__label Form__control">User email
        <input type="email" name="user_email" v-model="userEmail" class="Form__input">
      </label>
      <button class="Form__submit Form__control Form__input">Submit</button>
    </div>
  </form>
</template>

<script>
// TODO: Import these from form-fields.js and figure out why parcel doesn't want to build them
const getJson = file => fetch(file).then(res => res.json());

const getCountries = () => getJson('./countries.json');
const getHosts = () => getJson('./hosts.json');

const localities = ['Location', 'Unreadable', 'Zoo', 'Museum', 'Unlikely host range (bred, lab, introduced)'];
const typeStatuses = [
  'non-type',
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

export default {
  props: ['barcode', 'error'],
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
  },
  watch: {
    barcode() {
      this.$refs.form.reset();
      this.collectorCount = 1;
    }
  },
  methods: {
    transcribe(event){
      const payload = {};
      for (const el of event.target.elements) {
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
      this.eventBus.$emit('transcribe', payload)
      event.preventDefault();
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

.Form__controls {
  padding: 10px;
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  background: white;
  display: flex;
  justify-content: space-between;
  background: #EEE;
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

.Form__label {
  display: block;
  font-weight: bold;
  font-size: 0.9em;
}

.Form__fieldset {
  -webkit-column-break-inside: avoid; /* Chrome, Safari, Opera */
  page-break-inside: avoid; /* Firefox */
  break-inside: avoid;
}

.Form__radioset {
  font-size: 0.9em;
  display: flex;
  flex-wrap: wrap;
  margin: -0.25em;
  margin-bottom: 0.5em;
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

[name="collection_day"], [name="collection_month"] {
  width: 25%;
}

[name="collection_year"] {
  width: 45%;
}
</style>
