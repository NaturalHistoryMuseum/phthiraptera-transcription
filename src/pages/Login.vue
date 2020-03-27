<template>
  <AppWrapper>
    <h1>Log in</h1>
    <form method="post">
      <input name="password" type="password" autofocus>
      <button>Submit</button>
    </form>
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
