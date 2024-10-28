<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
    <!-- Header -->
    <DefaultHeader
      :title="'Steik SBsS - Sistema de Gerenciamento'"
      :show-menu-list="false"
      :show-pdv-info="false"
    >
    </DefaultHeader>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 flex-grow">
      <h2 class="text-2xl font-semibold mb-6">Selecione um Módulo</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="module in filteredModules"
          :key="module.name"
          class="bg-gray-800 rounded-xl p-6 shadow-lg transition-all hover:shadow-xl hover:scale-105"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold">{{ module.name }}</h3>
            <i :class="[module.icon, 'text-3xl', module.iconColor]"></i>
          </div>
          <p class="text-gray-400 mb-4">{{ module.description }}</p>
          <a
            :href="module.url"
            class="block w-full bg-opacity-80 hover:bg-opacity-100 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-center"
            :class="module.buttonColor"
          >
            Acessar {{ module.name }}
          </a>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-center p-4 mt-auto">
      <p class="text-gray-400">
        &copy; 2023 Steik SBS. Todos os direitos reservados.
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "~/api";

const access_i = ref("");

const allModules = ref([
  {
    name: "Cozinha",
    description: "Gerencie pedidos, acompanhe o preparo e organize a cozinha.",
    url: "/cozinha",
    icon: "mdi mdi-chef-hat",
    iconColor: "text-yellow-500",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700",
    accessKey: "cooking_access",
  },
  {
    name: "Garçom",
    description:
      "Faça pedidos, gerencie mesas e atenda os clientes eficientemente.",
    url: "/garcom",
    icon: "mdi mdi-room-service",
    iconColor: "text-blue-500",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    accessKey: "waiter_access",
  },
  {
    name: "PDV",
    description: "Processe pagamentos, emita notas fiscais e gerencie o caixa.",
    url: "/pdv",
    icon: "mdi mdi-cash-register",
    iconColor: "text-green-500",
    buttonColor: "bg-green-600 hover:bg-green-700",
    accessKey: "pdv_access",
  },
  {
    name: "Cardápio",
    description: "Atualize itens, preços e gerencie o cardápio do restaurante.",
    url: "/cardapio",
    icon: "mdi mdi-book-open-variant",
    iconColor: "text-purple-500",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
    accessKey: null, // Assuming cardápio access is always allowed
  },
]);

const filteredModules = computed(() => {
  return allModules.value.filter((module) => {
    if (!module.accessKey) return true; // Always show modules without access key (like Cardápio)
    access_i.value = localStorage.getItem(module.accessKey);
    const access = access_i.value;
    return access === "true";
  });
});

onMounted(() => {
  const restaurante_id = localStorage.getItem("restaurante_id");
  if (restaurante_id) {
    const cardapioModule = allModules.value.find(
      (module) => module.name === "Cardápio"
    );
    if (cardapioModule) {
      cardapioModule.url = `/cardapio/${restaurante_id}`;
    }
  } else {
    console.warn("restaurante_id não encontrado no localStorage");
    navigateTo("/login");
  }
});
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
