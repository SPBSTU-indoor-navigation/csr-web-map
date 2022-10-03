<template>
  <router-view />
</template>

<style lang="scss">
@import '@/styles/shared.scss';
@import '@/styles/variables.scss';

#app {
  font-family: $font-family;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #000000;
}

// :root {
//   --phone-width: #{$phone-width};
// }

* {
  margin: 0;
  padding: 0;

  &:focus {
    outline: none;
  }
}
</style>
