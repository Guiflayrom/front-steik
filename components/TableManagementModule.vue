<template>
  <div class="space-y-6">
    <h2 class="text-3xl font-bold font-display mb-6">Gestão de Mesas</h2>
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="table in tables"
        :key="table.id"
        :class="[
          'bg-gray-800 rounded-xl p-6 shadow-lg transition-all',
          getStatusRingClass(table.status),
        ]"
      >
        <h3 class="text-xl font-semibold mb-2">Mesa {{ table.id }}</h3>
        <p :class="getStatusClass(table.status)">{{ table.status }}</p>
        <button
          v-if="table.status === 'Disponível'"
          @click="reserveTable(table.id)"
          class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Reservar
        </button>
        <button
          v-if="table.status === 'Disponível'"
          @click="occupyTable(table.id)"
          class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Ocupar
        </button>
        <button
          v-if="table.status === 'Reservada'"
          @click="cancelReservation(table.id)"
          class="mt-4 w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Cancelar Reserva
        </button>
        <button
          v-if="table.status === 'Reservada'"
          @click="occupyTable(table.id)"
          class="mt-4 w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Ocupar
        </button>
        <div v-if="table.status === 'Ocupada'">
          <button
            @click="viewTableOrder(table.id)"
            class="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Ver Pedido
          </button>
          <button
            @click="transferTable(table.id)"
            class="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Transferir
          </button>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <div
      v-if="showTransferModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
        <h3 class="text-2xl font-bold mb-4">
          Transferência de pedido - Mesa {{ tableFromTransfer }}
        </h3>
        <div class="space-y-4">
          <div class="bg-gray-700 rounded-lg p-4">
            <h4 class="text-lg font-semibold mb-2">
              Transferir pedido para mesa:
            </h4>
            <div class="max-h-48 overflow-y-auto pr-2">
              <div class="flex items-center space-x-2 mb-2">
                <select
                  v-model="toTransfer"
                  class="bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md"
                >
                  <option
                    v-for="table in tables"
                    :key="table.id"
                    :value="table.id"
                  >
                    Mesa {{ table.numero_mesa }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="d-flex">
          <button
            @click="showTransferModal = false"
            class="mr-5 mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Fechar
          </button>
          <button
            @click="confirmTransfer"
            class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div
      v-if="showOrderModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
        <h3 class="text-2xl font-bold mb-4">
          Detalhes do Pedido - Mesa {{ selectedTable }}
        </h3>
        <div v-if="selectedOrder" class="space-y-4">
          <div class="bg-gray-700 rounded-lg p-4">
            <h4 class="text-lg font-semibold mb-2">Itens do Pedido</h4>
            <div class="max-h-48 overflow-y-auto pr-2">
              <ul class="space-y-2">
                <li
                  v-for="item in selectedOrder.itens"
                  :key="item.nome"
                  class="flex justify-between"
                >
                  <span>{{ item.nome }} </span>
                  <span>{{ item.valor }}</span>
                </li>
              </ul>
            </div>
          </div>
          <div class="bg-gray-700 rounded-lg p-4">
            <h4 class="text-lg font-semibold mb-2">Resumo</h4>
            <p class="flex justify-between">
              <span>Subtotal:</span>
              <span>{{ selectedOrder.subtotal }}</span>
            </p>
            <p class="flex justify-between font-bold mt-2">
              <span>Total:</span>
              <span>{{ selectedOrder.total }}</span>
            </p>
          </div>
          <div class="bg-gray-700 rounded-lg p-4">
            <h4 class="text-lg font-semibold mb-2">Status do Pedido</h4>
            <p>
              <VChip color="white">
                {{ selectedOrder.status_pedido }}
              </VChip>
            </p>
          </div>
        </div>
        <button
          @click="closeOrderModal"
          class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "~/api";

const tables = ref([]);
const showTransferModal = ref(false);
const tableFromTransfer = ref(null);
const toTransfer = ref(null);

// Função para reservar a mesa
const reserveTable = (id) => {
  const table = tables.value.find((t) => t.id === id);
  if (table && table.status === "Disponível") {
    // Atualizar o estado no frontend
    table.status = "Reservada";

    // Enviar atualização para o backend
    api(`mesas/${id}/`, "PATCH", { status: "Reservada" })
      .then(() => {
        console.log(`Mesa ${id} reservada com sucesso.`);
      })
      .catch((error) => {
        console.error("Erro ao reservar a mesa:", error);
        // Reverter a mudança no frontend em caso de erro
        table.status = "Disponível";
      });
  }
};

// Função para cancelar a reserva da mesa
const cancelReservation = (id) => {
  const table = tables.value.find((t) => t.id === id);
  if (table && table.status === "Reservada") {
    table.status = "Disponível";
    api(`mesas/${id}/`, "PATCH", { status: "Disponível" })
      .then(() => {
        console.log(`Reserva da mesa ${id} cancelada com sucesso.`);
      })
      .catch((error) => {
        console.error("Erro ao cancelar a reserva:", error);
        table.status = "Reservada";
      });
  }
};

function transferTable(mesa_id) {
  showTransferModal.value = true;
  tableFromTransfer.value = mesa_id;
}

// Função para ocupar a mesa
const occupyTable = (id) => {
  const table = tables.value.find((t) => t.id === id);
  // Atualizar o estado no frontend
  table.status = "Ocupada";

  // Enviar atualização para o backend
  api(`mesas/${id}/`, "PATCH", { status: "Ocupada" })
    .then(() => {
      console.log(`Mesa ${id} ocupada com sucesso.`);
    })
    .catch((error) => {
      console.error("Erro ao ocupar a mesa:", error);
      // Reverter a mudança no frontend em caso de erro
      table.status = "Reservada";
    });
};

const showOrderModal = ref(false);
const selectedTable = ref(null);
const selectedOrder = ref({});

const mockOrders = ref([
  {
    items: [
      { id: 1, name: "Hambúrguer", price: 25.9, quantity: 2 },
      { id: 2, name: "Batata Frita", price: 12.5, quantity: 1 },
      { id: 3, name: "Refrigerante", price: 6.0, quantity: 2 },
      { id: 4, name: "Sobremesa", price: 15.0, quantity: 1 },
      { id: 5, name: "Café", price: 5.0, quantity: 2 },
    ],
    subtotal: 101.3,
    serviceCharge: 10.13,
    total: 111.43,
    status: "Em Preparo",
  },
]);

onMounted(() => {
  api("mesas/").then((res) => {
    tables.value = res;
  });
});

const viewTableOrder = (id) => {
  api(
    `restaurantes/${localStorage.getItem("restaurante_id")}/mesas/${id}/pedido-atual/`
  ).then((res) => {
    selectedTable.value = id;
    selectedOrder.value = res;
    showOrderModal.value = true;
  });
};

const closeOrderModal = () => {
  showOrderModal.value = false;
  selectedTable.value = null;
  selectedOrder.value = null;
};

function confirmTransfer() {
  api(
    `restaurantes/${localStorage.getItem("restaurante_id")}/mesas/${
      tableFromTransfer.value
    }/pedido-atual/`
  ).then((res) => {
    api(`pedidos/${res.pedido_id}/`, "PATCH", { mesa: toTransfer.value }).then(
      () => {
        showTransferModal.value = false;

        api(`mesas/${tableFromTransfer.value}/`, "PATCH", {
          status: "Disponível",
        }).then((res) => {
          api("mesas/").then((res) => {
            tables.value = res;
          });
        });
      }
    );
  });
}

// Utility functions for styling
const getStatusClass = (status) => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-semibold";
  switch (status) {
    case "Disponível":
      return `${baseClasses} bg-green-500 text-green-900`;
    case "Ocupada":
      return `${baseClasses} bg-red-500 text-red-900`;
    case "Reservada":
      return `${baseClasses} bg-yellow-500 text-yellow-900`;
    case "Em Preparo":
      return `${baseClasses} bg-blue-500 text-blue-900`;
    case "Servido":
      return `${baseClasses} bg-purple-500 text-purple-900`;
    default:
      return `${baseClasses} bg-gray-500 text-gray-900`;
  }
};

const getStatusRingClass = (status) => {
  switch (status) {
    case "Disponível":
      return "ring-2 ring-green-500";
    case "Ocupada":
      return "ring-2 ring-red-500";
    case "Reservada":
      return "ring-2 ring-yellow-500";
    default:
      return "";
  }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto+Slab:wght@300;400;500;600;700&display=swap");

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
