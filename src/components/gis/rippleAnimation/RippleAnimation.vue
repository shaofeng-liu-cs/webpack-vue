<template>
  <div class="ripple-container">
    <div class="water1"></div>
    <div class="water2"></div>
    <div class="water3"></div>
    <div class="water4"></div>
  </div>
</template>
<script>
export default {
  name: 'RippleAnimation',
  data() {
    return {};
  },
};
</script>
<style scoped lang="scss">
@keyframes wateranimate {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
.ripple-container {
  position: relative;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.water1 {
  animation: wateranimate 4s 3s ease-out infinite;
}
.water2 {
  animation: wateranimate 4s 2s ease-out infinite;
}
.water3 {
  animation: wateranimate 4s 1s ease-out infinite;
}
.water4 {
  animation: wateranimate 4s 0s ease-out infinite;
}
.water1,
.water2,
.water3,
.water4 {
  width: 30px;
  height: 30px;
  position: absolute;
  border: 1px solid pink;
  box-shadow: 0 0 120px 30px rgba(235, 31, 137, 1) inset;
  border-radius: 100%;
  z-index: 1;
  opacity: 0;
}
</style>