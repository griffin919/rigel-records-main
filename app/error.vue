<template>
  <div class="not-found">
    <div class="box">
      <img src="/shell_logo.svg" alt="Shell Logo" />

      <h1>404</h1>
      <p class="msg">Page Not Found</p>

      <NuxtLink to="/" class="home-link">
        Go Home
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #FFC800 0%, #DD1D21 100%);
}

.box {
  text-align: center;
  padding: 32px 28px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);

  border-radius: 16px;
  max-width: 360px;
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 16px;
}

img {
  width: 70px;
  height: 70px;
  object-fit: contain;
}

h1 {
  font-size: 48px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.msg {
  font-size: 18px;
  color: white;
  margin: 0;
  opacity: 0.9;
}

.home-link {
  margin-top: 12px;
  padding: 10px 18px;
  background: white;
  color: #DD1D21;
  font-weight: 600;
  border-radius: 8px;
  display: inline-block;
  text-decoration: none;
  transition: 0.2s;
}

.home-link:hover {
  background: #FFE27A;
}
</style>