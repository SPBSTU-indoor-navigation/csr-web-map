<template>
  <div class="search card flex">
    <input type="text" class=".label" placeholder="Поиск" />
  </div>
</template>

<style lang="scss">
@import '@/styles/variables.scss';

.search {
  margin: 10px;
  height: 40px;

  input {
    width: 100%;
    height: 100%;
    border: none;
    background-color: rgba(255, 255, 255, 0);
    font-family: $font-family;
    font-weight: 500;
    font-size: medium;

    margin: 0 10px;

    &::placeholder {
      color: $placeholder;
    }
  }
}
</style>
