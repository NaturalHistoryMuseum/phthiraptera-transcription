<template>
  <div id="app" class="App">
    <nav class="App__nav">
      <img src="nhm.png" height="24">
      <div>Anoplura Data Cleaning Tool</div>
    </nav>

    <Transcription />
  </div>
</template>

<script>
import Transcription from './Transcription.vue';

export default {
  components: {
    Transcription
  },
  name: 'app'
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
  font-size: 18px;
}

.App {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.App__nav {
  background: rgb(34, 34, 34);
  color: white;
  display: flex;
  padding: 7px;
  align-items: end;
}

.App__nav > * {
  margin: 7px;
}
</style>