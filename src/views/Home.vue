<template>
  <div class="home">
    <ul>
      <li>
        <router-link to="/spbstu">Политех</router-link>
      </li>
      <li>
        <router-link to="/test">Тест</router-link>
      </li>
    </ul>
  </div>
</template>


<script setup>
</script>


<style scoped lang="scss">
li {
  font-size: 2rem;
  font-weight: bold;
  margin-left: 20px;

  a {
    color: #2c3e50;
    text-decoration: underline;

    &:hover {
      color: #4b77a2;
    }
  }
}
</style>
