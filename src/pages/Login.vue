<template>
  <AppWrapper>
    <div class="Login">
      <div class="Login__body">
        <h1>Log in</h1>
        <p>Please log in with your ORCID id to continue.</p>
        <h4>Data Protection</h4>
        <p>The Natural History Museum will use your personal data in accordance with data protection legislation to process your requests. For more information please read our <a href="http://www.nhm.ac.uk/about-us/privacy-notice.html">privacy notice</a>.</p>
      </div>
      <iframe class="Login__iframe" src="//example.com"></iframe>
    </div>
  </AppWrapper>
</template>

<script>
import AppWrapper from '../components/AppWrapper.vue';

export default {
  name: 'Login',
  components: {
    AppWrapper
  }
}
</script>

<style>
.Login {
  display: flex;
  flex-wrap: wrap;
  height: 100%;
}

.Login > * {
  flex: 40% 1 1;
}

.Login__iframe {
  flex-basis: 60%;
  min-height: 500px;
  min-width: 500px;
}

.Login__body {
  padding: 0.5em;
}
</style>
