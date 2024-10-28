<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 font-sans">
    <!-- Header -->
    <header class="bg-gray-800 shadow-lg p-4">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-bold font-display">Cozinha Steik SBS</h1>
        <div class="flex items-center space-x-4">
          <span class="font-medium">{{ currentDate }}</span>
          <button
            @click="logout"
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out"
          >
            <i class="mdi mdi-logout mr-2"></i>Sair
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Order Filters -->
      <div class="mb-6 space-y-4">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="status in ['Em Aberto', 'Preparando', 'Pedido Pronto']"
            :key="status"
            @click="toggleStatusFilter(status)"
            :class="[
              'px-4 py-2 rounded-lg font-semibold transition duration-300 ease-in-out',
              statusFilters.includes(status)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
            ]"
          >
            {{ status }}
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="type in ['Todos os Pratos', 'Prato Quente', 'Prato Frio']"
            :key="type"
            @click="setTypeFilter(type)"
            :class="[
              'px-4 py-2 rounded-lg font-semibold transition duration-300 ease-in-out',
              typeFilter === type
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
            ]"
          >
            {{ type }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <i class="mdi mdi-loading mdi-spin text-4xl"></i>
        <p class="mt-2">Carregando pedidos...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-500 text-white p-4 rounded-lg">
        <p>{{ error }}</p>
        <button @click="fetchOrders" class="mt-2 underline">Tentar novamente</button>
      </div>

      <!-- Orders Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center space-x-2">
              <h3 class="text-xl font-semibold">Pedido {{ order.codigo }}</h3>
              <i
                :class="[
                  'mdi text-2xl',
                  order.is_delivery
                    ? 'mdi-truck-delivery text-blue-400'
                    : 'mdi-table-chair text-green-400',
                ]"
                :title="order.is_delivery ? 'Entrega' : 'Mesa'"
              ></i>
            </div>
            <span :class="getStatusClass(order.status)">{{ order.status }}</span>
          </div>
          <div class="mb-4">
            <p class="text-sm text-gray-400">
              {{ order.is_delivery ? "Cliente" : "Mesa" }}:
              {{ order.is_delivery ? order.pessoa?.nome || "N/A" : order.mesa }}
            </p>
            <p v-if="order.is_delivery" class="text-sm text-gray-400">
              Endereço:
              {{ `${order.pessoa?.endereco}, ${order.pessoa?.numero}` || "N/A" }}
            </p>
          </div>
          <ul class="space-y-4 mb-4">
            <li
              v-for="item in filteredOrderItems(order)"
              :key="item.id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-2">
                <button
                  @click="updateItemStatus(order, item)"
                  :class="getItemStatusButtonClass(item.status)"
                >
                  <i :class="getItemStatusIcon(item.status)"></i>
                </button>
                <span>{{ item.qtd }}x {{ item.prato.nome }}</span>
              </div>
              <span :class="getStatusClass(item.status)">
                {{ item.status }}
              </span>
            </li>
          </ul>
          <div class="flex justify-between items-center">
            <p class="text-sm text-gray-400">
              Hora do pedido: {{ formatTime(order.horario_pedido) }}
            </p>
            <button
              v-if="order.status !== 'Pedido Pronto'"
              @click="updateOrderStatus(order)"
              class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out"
            >
              Marcar como Pronto
            </button>
          </div>
        </div>
      </div>

      <!-- No Orders State -->
      <div
        v-if="!isLoading && !error && filteredOrders.length === 0"
        class="text-center py-8"
      >
        <i class="mdi mdi-food-off text-4xl"></i>
        <p class="mt-2">Nenhum pedido encontrado</p>
      </div>
    </main>

    <!-- Snackbar -->
    <div
      v-if="showSnackbar"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300"
      :class="{ 'opacity-0': snackbarFading }"
    >
      Pedido #{{ lastCompletedOrderId }} está pronto!
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "~/api";

const orders = ref([]);
const statusFilters = ref([]);
const typeFilter = ref("Todos os Pratos");
const showSnackbar = ref(false);
const snackbarFading = ref(false);
const lastCompletedOrderId = ref(null);
const isLoading = ref(true);
const error = ref(null);

const currentDate = computed(() => {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const toggleStatusFilter = (status) => {
  const index = statusFilters.value.indexOf(status);
  if (index === -1) {
    statusFilters.value.push(status);
  } else {
    statusFilters.value.splice(index, 1);
  }
};

const setTypeFilter = (type) => {
  typeFilter.value = type;
};

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const statusMatch =
      statusFilters.value.length === 0 || statusFilters.value.includes(order.status);
    const typeMatch =
      typeFilter.value === "Todos os Pratos" ||
      order.items.some((item) =>
        typeFilter.value === "Prato Quente"
          ? item.prato.tipo === "quente"
          : item.prato.tipo === "frio"
      );
    return statusMatch && typeMatch;
  });
});

const filteredOrderItems = (order) => {
  if (typeFilter.value === "Todos os Pratos") {
    return order.items;
  }
  return order.items.filter((item) =>
    typeFilter.value === "Prato Quente"
      ? item.prato.tipo === "quente"
      : item.prato.tipo === "frio"
  );
};

const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

const getStatusClass = (status) => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-semibold";
  switch (status) {
    case "Em Aberto":
      return `${baseClasses} bg-yellow-500 text-yellow-900`;
    case "Preparando":
      return `${baseClasses} bg-blue-500 text-blue-900`;
    case "Pedido Pronto":
      return `${baseClasses} bg-green-500 text-green-900`;
    case "Em Rota":
      return `${baseClasses} bg-purple-500 text-purple-900`;
    case "Entregue":
      return `${baseClasses} bg-gray-500 text-gray-900`;
    case "Cancelado":
      return `${baseClasses} bg-red-500 text-red-900`;
    default:
      return `${baseClasses} bg-gray-500 text-gray-900`;
  }
};

const getItemStatusButtonClass = (status) => {
  const baseClasses =
    "w-8 h-8 rounded-full flex items-center justify-center transition duration-300 ease-in-out";
  switch (status) {
    case "Em Aberto":
      return `${baseClasses} bg-yellow-500 hover:bg-yellow-600 text-yellow-900`;
    case "Preparando":
      return `${baseClasses} bg-blue-500 hover:bg-blue-600 text-blue-900`;
    case "Pedido Pronto":
      return `${baseClasses} bg-green-500 hover:bg-green-600 text-green-900`;
    default:
      return `${baseClasses} bg-gray-500 hover:bg-gray-600 text-gray-900`;
  }
};

const getItemStatusIcon = (status) => {
  switch (status) {
    case "Em Aberto":
      return "mdi mdi-clock-outline";
    case "Preparando":
      return "mdi mdi-progress-clock";
    case "Pedido Pronto":
      return "mdi mdi-check-bold";
    default:
      return "mdi mdi-help-circle-outline";
  }
};

const updateOrderStatus = async (order) => {
  try {
    const response = await api(`pedidos/${order.id}/`, "PATCH", {
      status: "Pedido Pronto",
    });
    if (response.status === "Pedido Pronto") {
      api(
        `restaurantes/${localStorage.getItem("restaurante_id")}/notificacoes/`,
        "POST",
        {
          restaurante: localStorage.getItem("restaurante_id"),
          titulo: "Pedido " + newStatus,
          texto: `O pedido ${order.codigo} está ${newStatus}`,
          status: "pronto",
        }
      );
      order.status = "Pedido Pronto";
      order.items.forEach((item) => (item.status = "Pedido Pronto"));
      showSnackbarNotification(order.id);
    } else {
      throw new Error("Falha ao atualizar o status do pedido");
    }
  } catch (error) {
    console.error("Erro ao atualizar o status do pedido:", error);
    alert("Ocorreu um erro ao atualizar o status do pedido. Por favor, tente novamente.");
  }
};

const updateItemStatus = async (order, item) => {
  const statusOrder = ["Em Aberto", "Preparando", "Pedido Pronto"];
  const currentIndex = statusOrder.indexOf(item.status);
  const nextIndex = (currentIndex + 1) % statusOrder.length;
  const newStatus = statusOrder[nextIndex];

  // Update only the clicked item's status locally
  item.status = newStatus;

  // Check if all items have the same status
  const allItemsSameStatus = order.items.every((i) => i.status === newStatus);

  if (allItemsSameStatus) {
    try {
      // Update the entire order status in the backend
      const response = await api(`pedidos/${order.id}/`, "PATCH", {
        status: newStatus,
      });

      if (response.status === newStatus) {
        order.status = newStatus;

        api(
          `restaurantes/${localStorage.getItem("restaurante_id")}/notificacoes/`,
          "POST",
          {
            restaurante: localStorage.getItem("restaurante_id"),
            titulo: "Pedido " + newStatus,
            texto: `O pedido ${order.codigo} está ${newStatus}`,
            status: newStatus.toLowerCase().includes("pronto") ? "pronto" : "novo",
          }
        );

        if (newStatus === "Pedido Pronto") {
          showSnackbarNotification(order.id);
        }
      } else {
        throw new Error("Falha ao atualizar o status do pedido");
      }
    } catch (error) {
      console.error("Erro ao atualizar o status do pedido:", error);
      alert(
        "Ocorreu um erro ao atualizar o status do pedido. Por favor, tente novamente."
      );
      // Revert the local status change if the API call fails
      item.status = statusOrder[currentIndex];
    }
  } else {
    // Update order status locally based on items
    if (order.items.some((i) => i.status === "Preparando")) {
      order.status = "Preparando";
    } else if (order.items.every((i) => i.status === "Pedido Pronto")) {
      order.status = "Pedido Pronto";
    } else {
      order.status = "Em Aberto";
    }
  }
};

const showSnackbarNotification = (orderId) => {
  lastCompletedOrderId.value = orderId;
  showSnackbar.value = true;
  snackbarFading.value = false;

  setTimeout(() => {
    snackbarFading.value = true;
    setTimeout(() => {
      showSnackbar.value = false;
    }, 300);
  }, 3000);
};

const logout = () => {
  // Implement logout logic here
  console.log("Usuário desconectado");
};

const fetchOrders = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const restauranteId = localStorage.getItem("restaurante_id");
    const response = await api(`pedidos/?restaurante_id=${restauranteId}`);
    if (Array.isArray(response)) {
      orders.value = response.filter((order) =>
        ["Em Aberto", "Preparando", "Pedido Pronto"].includes(order.status)
      );
      // Ensure each item has its own status
      orders.value.forEach((order) => {
        order.items.forEach((item) => {
          if (!item.status) {
            item.status = order.status;
          }
        });
      });
    } else {
      throw new Error("Resposta da API inválida");
    }
  } catch (err) {
    console.error("Erro ao carregar pedidos:", err);
    error.value = "Ocorreu um erro ao carregar os pedidos. Por favor, tente novamente.";
  } finally {
    isLoading.value = false;
  }
};

// Polling for new orders
const pollInterval = 30000; // 30 seconds
let pollTimer;

const startPolling = () => {
  pollTimer = setInterval(fetchOrders, pollInterval);
};

const stopPolling = () => {
  clearInterval(pollTimer);
};

onMounted(() => {
  fetchOrders();
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});

// Watch for changes in orders and update localStorage
watch(
  orders,
  () => {
    localStorage.setItem("orders", JSON.stringify(orders.value));
  },
  { deep: true }
);
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
