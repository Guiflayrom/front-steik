<template>
  <header class="bg-gray-800 shadow-lg p-4 flex justify-between items-center">
    <h1 class="text-3xl font-bold font-display" v-if="title">
      {{ title }}
    </h1>
    <div
      v-if="showMenuList"
      :style="`margin-left: ${
        isDrawerOpen ? '260' : '5'
      }px; transition: margin-left 1.1s ease;`"
    >
      <button @click="$emit('toggleDrawer')" class="text-white">
        <i class="mdi mdi-menu text-2xl"></i>
      </button>
    </div>

    <div class="flex items-center space-x-4">
      <span class="font-medium mr-10" v-if="showPdvInfo">
        OPERADOR: {{ nomeFuncionario }}
      </span>
      <span class="font-medium mr-10" v-if="showPdvInfo">
        CAIXA:
        <VChip color="green">ABERTO</VChip>
      </span>
      <span class="font-medium">{{ currentDate }}</span>
      <button
        @click="$emit('logout')"
        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
      >
        <i class="mdi mdi-logout mr-2"></i>Sair
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  currentDate: String,
  title: {
    type: String,
    default: "",
  },
  showMenuList: {
    type: Boolean,
    default: true,
  },
  showPdvInfo: {
    type: Boolean,
    default: false,
  },
  isDrawerOpen: {
    type: Boolean,
    default: true,
  },
});

const nomeFuncionario = ref("");

onMounted(() => {
  // Pega o valor do localStorage
  const storedName = localStorage.getItem("nome_funcionario");
  if (storedName) {
    nomeFuncionario.value = storedName;
  } else {
    // Define um valor padrão se não houver nada no localStorage
    nomeFuncionario.value = "Usuário";
  }
});
</script>
