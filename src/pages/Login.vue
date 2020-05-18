<template>
  <AppWrapper :user="user">
    <div class="Login">
      <h1>Log in</h1>
      <p>Please log in with your ORCID id to continue.</p>

      <a :href="url" class="Login__link">
        <img class="Login__icon" src="https://orcid.org/sites/default/files/images/orcid_24x24.png" width="24" height="24" alt=""/>
        Log in using ORCID
      </a>

      <h4>Data Protection</h4>
      <p>The Natural History Museum will use your personal data in accordance with data protection legislation to process your requests. For more information please read our <a href="http://www.nhm.ac.uk/about-us/privacy-notice.html">privacy notice</a>.</p>
    </div>
  </AppWrapper>
</template>

<script>
import AppWrapper from '../components/AppWrapper.vue';

export default {
  name: 'Login',
  components: {
    AppWrapper
  },
  props: ['url', 'user'],
  loadData(api, req, misc) {
    return {
      url: misc.oauthUrl,
      user: req.user
    };
  }
}
</script>

<style>
.Login {
  width: 100%;
  max-width: 500px;
  height: 100%;
  padding: 0.5em;
  margin: auto;
}

.Login__link {
  border-radius: 5px;
  padding: 15px 35px;
  display: inline-flex;
  gap: 5px;
  align-items: center;
  border: 1px solid rgb(166, 206, 57);
  background: #EAFFB0;
}

.Login__link:hover {
  background: #EAFF00;
  box-shadow: #0006 3px 3px;
}
</style>
