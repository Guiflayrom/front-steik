<template>
  <div class="h-screen bg-gray-900 text-gray-100 font-sans overflow-hidden">
    <NavigationDrawer
      :isDrawerOpen="isDrawerOpen"
      :currentModule="currentModule"
      @moduleChange="setModule"
    />
    <DefaultHeader
      :show-pdv-info="true"
      :currentDate="currentDate"
      :isDrawerOpen="isDrawerOpen"
      @toggleDrawer="toggleDrawer"
      @logout="logout"
    />

    <main
      :class="['h-screen pl-64 transition-all duration-1000', { 'pl-0': !isDrawerOpen }]"
    >
      <vContainer fluid class="h-full pa-10">
        <component :is="currentComponent" />
      </vContainer>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import NavigationDrawer from "./NavigationDrawer.vue";
import DefaultHeader from "./DefaultHeader.vue";
import POSModule from "./POSModule.vue";
import CashManagementModule from "./CashManagementModule.vue";
import DeliveryManagementModule from "./DeliveryManagementModule.vue";
import TableManagementModule from "./TableManagementModule.vue";
import api from "~/api";

// Ref para controlar o estado do drawer
const isDrawerOpen = ref(true);

// Ref para controlar o módulo atual
const currentModule = ref("POSModule");

// Função para alterar o módulo atual
const setModule = (moduleName) => {
  currentModule.value = moduleName;
};

// Computed para retornar o componente com base no módulo selecionado
const currentComponent = computed(() => {
  switch (currentModule.value) {
    case "POSModule":
      return POSModule;
    case "CashManagementModule":
      return CashManagementModule;
    case "DeliveryManagementModule":
      return DeliveryManagementModule;
    case "TableManagementModule":
      return TableManagementModule;
    default:
      return POSModule;
  }
});

// Função para alternar o estado do drawer
const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value;
};

// Computed para exibir a data atual
const currentDate = computed(() => {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Função para logout
const logout = () => {
  api("logout/", "POST", { refresh: localStorage.getItem("refresh") });
  localStorage.setItem("refresh", "");
  localStorage.setItem("access", "");
  navigateTo("/login/");
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto+Slab:wght@300;400;500;600;700&display=swap");
@import "https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css";

:root {
  --font-sans: "Poppins", sans-serif;
  --font-display: "Roboto Slab", serif;
}

body {
  font-family: var(--font-sans);
}

.font-display {
  font-family: var(--font-display);
}
</style>
