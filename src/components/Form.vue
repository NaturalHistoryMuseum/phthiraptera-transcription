<template>
  <form class="Form" method="POST">
    <input type="hidden" name="barcode" :value="barcode">
    <label class="Form__label">
      Locality
      <input class="Form__input">
    </label>
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
export default {
  props: ['barcode']
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

.Form__input {
  display: block;
  margin: 3px 0 10px;
  padding: 5px;
  width: 100%;
}
</style>
