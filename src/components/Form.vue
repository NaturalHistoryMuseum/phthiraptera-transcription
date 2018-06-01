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
          <option selected disabled>...</option>
          <option v-for="country in countries" :key="country">{{ country }}</option>
        </select>
      </label>
      <label class="Form__label">
        Precise locality
        <input class="Form__input" name="precise_locality">
      </label>
    </fieldset>
    <label class="Form__label">
      Host
      <input class="Form__input">
    </label>
    <label class="Form__label">
      Collection Date
      <input class="Form__input">
    </label>
    <label class="Form__label">
      Collector
      <input class="Form__input">
    </label>
    <label class="Form__label">
      Type Status
      <input class="Form__input">
    </label>
    <label class="Form__label">
      Registration Number
      <input class="Form__input">
    </label>
    <label class="Form__label">
      Sex/Stage
      <input class="Form__input">
    </label>

    <button>Submit</button>

  </form>
</template>

<script>
import { countries, localities } from './form-fields.js';

export default {
  props: ['barcode'],
  inject: ['eventBus'],
  data: () => ({
    countries,
    localities
  }),
  methods: {
    transcribe(event){
      const payload = {};
      for (const el of event.target.elements) {
        if(el.name) {
          payload[el.name] = el.value;
        }
      }
      this.eventBus.$emit('transcribe', payload)
      event.preventDefault();
      event.target.reset();
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
  display: block;
  margin: 3px 0 10px;
  padding: 5px;
  width: 100%;
}
</style>
