<template>
  <div id="app" class="AppWrapper">
    <nav class="AppWrapper__nav">
      <a href="/" class="AppWrapper__home"><img :src="$options.logo" height="24"></a>
      <div>Phthiraptera Transcription</div>
      <a class="AppWrapper__link" href="/browse">Browse Completed</a>
    </nav>

    <slot class="AppWrapper__content"></slot>
  </div>
</template>

<script>
import logo from './nhm.png';

export default {
  logo,
  name: 'appwrapper'
}
</script>

<style>
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
  font-size: 18px;
}

.AppWrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.AppWrapper__nav {
  background: rgb(34, 34, 34);
  color: white;
  display: flex;
  padding: 7px;
  align-items: end;
}

.AppWrapper__nav > * {
  margin: 7px;
}

.AppWrapper__nav > .AppWrapper__home {
  margin: 0;
}

.AppWrapper__link {
  color: #FDD;
  margin-left: auto;
}
</style>
