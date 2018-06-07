<template>
  <form ref="form" class="Form" method="POST" @submit="transcribe">
    <input type="hidden" name="barcode" :value="barcode">
    <fieldset>
      <legend>Locality</legend>
      <div class="Form__radioset">
        <label v-for="l in localities" :key="l">
          <input type="radio" name="locality" :value="l" :checked="l==='Location'">
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
    <fieldset>
      <legend>Host</legend>
      <label class="Form__label">
        Host
        <input name="host" list="host_list" class="Form__input">
        <datalist id="host_list">
          <option v-for="host in hosts" :key="host">{{ host }}</option>
        </datalist>
      </label>
      <div class="Form__radioset">
        <label v-for="hostType in hostTypes" :key="hostType">
          <input type="radio" name="host_type" :value="hostType" :checked="hostType==='No host'">
          {{ hostType }}
        </label>
      </div>
    </fieldset>
    <fieldset>
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
        <label>
          <input type="checkbox" name="collection_range" value="1">
          Date range
        </label>
      </div>
    </fieldset>
    <fieldset>
      <legend>Collector</legend>
      <label class="Form__label">
        Collector name
        <input name="collector" class="Form__input">
      </label>
    </fieldset>
    <fieldset>
      <legend>Type Status</legend>
      <label class="Form__label">
        Type status
        <select name="type_status" class="Form__input">
          <option v-for="status in typeStatuses" :key="status">{{ status }}</option>
        </select>
      </label>
    </fieldset>
    <fieldset>
      <legend>Registration Number</legend>
      <label class="Form__label">
        BM#
        <input name="registration_number" class="Form__input">
      </label>
    </fieldset>
    <fieldset>
      <legend>Sex/Stage</legend>
      <label class="Form__label">
        Total count
        <input name="total_count" type="number" class="Form__input">
      </label>
      <div class="Form__radioset">
        <label v-for="stage in ['adult female', 'adult male', 'nymph']" :key="stage">
          <input name="stage[]" type="checkbox" :value="stage">
          {{ stage }}
        </label>
      </div>
    </fieldset>

    <button>Submit</button>

    <div class="Form__error" v-if="error">
      There were some errors in the form:
      <ul>
        <li v-for="e in error" :key="e">{{ e }}</li>
      </ul>
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
    countries: [],
    localities,
    hosts: [],
    typeStatuses,
    hostTypes
  }),
  mounted() {
    getCountries().then(countries => this.countries = countries);
    getHosts().then(hosts => this.hosts = hosts);
  },
  watch: {
    barcode() {
      this.$refs.form.reset();
    }
  },
  methods: {
    transcribe(event){
      const payload = {};
      for (const el of event.target.elements) {
        if(!el.name || ((el.type === "checkbox" || el.type === "radio") && !el.checked)) {
          continue;
        }

        const match = el.name.match(/^(.+)\[\]$/);

        if(match) {
          payload[match[1]] = (payload[match[1]] || []).concat(el.value);
        } else {
          payload[el.name] = el.value;
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
  columns: 2 250px;
}

.Form__label {
  display: block;
  font-weight: bold;
  font-size: 0.9em;
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

.Form__radioset > * {
  border: 1px solid #CCC;
  border-radius: 1em;
  padding: 0.25em;
  margin: 0.25em;
  display: flex;
}

.Form__radioset > *:hover {
  box-shadow: #333 1px 1px;
  transform: translate(0, -1px);
}

.Form__radioset > *:active {
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
