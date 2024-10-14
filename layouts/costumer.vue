<template>
  <div style="background-color: black" class="pa-3">
    <v-layout>
      <v-navigation-drawer
        class="pa-3 mt-3 ml-3"
        style="border-radius: 20px; height: 705px"
        color="#95A1AD"
      >
        <VCard elevation="0" color="black" height="180px" class="rounded mt-5">
          <div align="center">
            <v-img
              src="https://i.imgur.com/4PpSNEs_d.webp?maxwidth=1520&fidelity=grand"
            ></v-img>
          </div>
          <v-list density="compact" nav class="px-4">
            <v-list-item
              prepend-icon="mdi-home"
              title="Painel Pedidos"
              value="home"
              class="bg-white"
            ></v-list-item>
          </v-list>
        </VCard>
        <VCard elevation="0" color="black" height="310px" class="mt-5"></VCard>
        <VCard
          elevation="0"
          color="black"
          height="100"
          class="mt-5"
          align="center"
        >
          <VRow class="d-flex align-center justify-center mt-1 h-full">
            <VCol>
              <VIcon size="40" class="cursor-pointer" @click="logout()"
                >mdi-logout</VIcon
              >
            </VCol>
            <VCol>
              <VIcon size="40" class="cursor-pointer">mdi-cog</VIcon>
            </VCol>
          </VRow>
        </VCard>
      </v-navigation-drawer>

      <v-main style="background-color: black; min-height: 700px">
        <div
          class="ml-5"
          style="
            background-color: #95a1ad;
            color: white;
            height: 100%;
            border-radius: 20px;
          "
        >
          <slot></slot>
        </div>
      </v-main>
    </v-layout>
  </div>
</template>

<script setup>
function logout() {
  localStorage.setItem("restauranteId", false);
  window.location.reload();
}
</script>

<style>
body {
  background-color: black;
}
</style>
