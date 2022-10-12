<template>
  <router-view />
</template>

<style lang="scss">
@import '@/styles/shared.scss';
@import '@/styles/variables.scss';

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #000000;
  accent-color: $accent-color;
}

:root {
  --phone-width: #{$phone-width};
  --accent-color: #{$accent-color};
}

* {
  margin: 0;
  padding: 0;
  font-family: $font-family;

  &:focus {
    outline: none;
  }
}

button {
  cursor: pointer;
}

button,
input {
  border: none;
  border-radius: 2px;

  &:hover {
    background-color: #f3f3f3
  }

  &:active {
    background-color: #cccccc
  }
}
</style>
