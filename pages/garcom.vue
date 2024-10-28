<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 font-sans">
    <!-- Caixa Selection Modal -->
    <div
      v-if="showCaixaModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
        <h2 class="text-2xl font-bold mb-4">Selecionar Caixa</h2>
        <select
          v-model="selectedCaixaId"
          class="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base mb-4"
        >
          <option value="">Selecione um Caixa</option>
          <option v-for="caixa in caixas" :key="caixa.id" :value="caixa.id">
            {{ caixa.nome }}
          </option>
        </select>
        <button
          @click="confirmCaixaSelection"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          :disabled="!selectedCaixaId"
        >
          Confirmar
        </button>
      </div>
    </div>

    <!-- Header -->
    <header class="bg-gray-800 shadow-lg p-4">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-xl md:text-2xl font-bold font-display">Garçom Steik SBS</h1>
        <div class="flex items-center space-x-2 md:space-x-4">
          <button
            @click="logout"
            class="bg-red-500 hover:bg-red-600 text-white p-2 md:px-4 md:py-2 rounded-lg transition duration-300 ease-in-out"
          >
            <i class="mdi mdi-logout mr-1 md:mr-2"></i>Sair
          </button>
        </div>
      </div>
    </header>

    <!-- Tab Navigation -->
    <nav class="bg-gray-800 shadow-lg">
      <div class="container mx-auto flex">
        <button
          @click="currentTab = 'main'"
          :class="[
            'flex-1 py-3 text-center transition duration-300 ease-in-out',
            currentTab === 'main'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
        >
          <i class="mdi mdi-table-chair mr-1 md:mr-2"></i>Pedidos
        </button>
        <button
          @click="currentTab = 'notifications'"
          :class="[
            'flex-1 py-3 text-center transition duration-300 ease-in-out',
            currentTab === 'notifications'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
        >
          <i class="mdi mdi-bell mr-1 md:mr-2"></i>Notificações
          <span
            v-if="notifications.length"
            class="ml-1 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
          >
            {{ notifications.length }}
          </span>
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6 md:py-8">
      <!-- Main Interface -->
      <div v-if="currentTab === 'main'">
        <!-- Table Selection -->
        <div class="mb-6 md:mb-8">
          <h2 class="text-xl md:text-2xl font-semibold mb-4">Selecionar Mesa</h2>
          <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
            <button
              :disabled="table.status == 'Ocupada'"
              v-for="table in tables"
              :key="table.numero_mesa"
              @click="selectTable(table)"
              :class="[
                'p-2 md:p-4 rounded-lg font-semibold transition duration-300 ease-in-out text-sm md:text-base',
                table.numero_mesa === selectedTable?.numero_mesa
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
              ]"
            >
              Mesa {{ table.numero_mesa }}
            </button>
          </div>
        </div>

        <!-- Order Management -->
        <div v-if="selectedTable" class="bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg">
          <h3 class="text-lg md:text-xl font-semibold mb-4">
            Pedido - Mesa {{ selectedTable.numero_mesa }}
          </h3>

          <!-- Tab Navigation for Order Management -->
          <div class="mb-4">
            <button
              v-for="tab in ['current', 'history']"
              :key="tab"
              @click="orderTab = tab"
              :class="[
                'px-4 py-2 rounded-t-lg font-semibold transition duration-300 ease-in-out text-sm md:text-base mr-2',
                orderTab === tab
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-700',
              ]"
            >
              {{ tab === "current" ? "Pedido Atual" : "Histórico" }}
            </button>
          </div>

          <!-- Current Order Tab Content -->
          <div v-if="orderTab === 'current'">
            <!-- Product Selection -->
            <div class="mb-6">
              <h4 class="text-base md:text-lg font-semibold mb-2">Adicionar Itens</h4>
              <div
                class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-4"
              >
                <input
                  v-model="productSearch"
                  type="text"
                  placeholder="Buscar produto..."
                  class="flex-grow px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
                <button
                  @click="showAddProductModal = true"
                  class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition duration-300 ease-in-out text-sm md:text-base"
                >
                  <i class="mdi mdi-plus mr-1 md:mr-2"></i>Adicionar
                </button>
              </div>
              <div class="h-64 overflow-y-auto bg-gray-700 rounded-lg">
                <ul class="divide-y divide-gray-600">
                  <li
                    v-for="item in filteredProducts"
                    :key="item.id"
                    class="flex justify-between items-center p-2 md:p-3 hover:bg-gray-600 transition duration-300 ease-in-out"
                  >
                    <span class="text-sm md:text-base"
                      >{{ item.nome }} - R$ {{ item.valor.toFixed(2) }}</span
                    >
                    <button
                      @click="addToOrder(item)"
                      class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 md:px-3 md:py-1 rounded-lg transition duration-300 ease-in-out text-sm md:text-base"
                    >
                      <i class="mdi mdi-plus"></i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Current Order -->
            <div class="mb-6">
              <h4 class="text-base md:text-lg font-semibold mb-2">Itens do Pedido</h4>
              <ul class="space-y-2">
                <li
                  v-for="item in currentOrder"
                  :key="item.id"
                  class="flex justify-between items-center bg-gray-700 p-2 md:p-3 rounded-lg"
                >
                  <span class="text-sm md:text-base"
                    >{{ item.quantity }}x {{ item.nome }} - R$
                    {{ (item.valor * item.quantity).toFixed(2) }}</span
                  >
                  <div class="flex items-center space-x-1 md:space-x-2">
                    <button
                      @click="decreaseQuantity(item)"
                      class="bg-yellow-500 hover:bg-yellow-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition duration-300 ease-in-out"
                    >
                      <i class="mdi mdi-minus"></i>
                    </button>
                    <button
                      @click="increaseQuantity(item)"
                      class="bg-green-500 hover:bg-green-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition duration-300 ease-in-out"
                    >
                      <i class="mdi mdi-plus"></i>
                    </button>
                    <button
                      @click="removeFromOrder(item)"
                      class="bg-red-500 hover:bg-red-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition duration-300 ease-in-out"
                    >
                      <i class="mdi mdi-delete"></i>
                    </button>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Order Total -->
            <div class="mb-6">
              <h4 class="text-base md:text-lg font-semibold mb-2">Total do Pedido</h4>
              <p class="text-xl md:text-2xl font-bold">R$ {{ orderTotal.toFixed(2) }}</p>
            </div>

            <!-- Order Actions -->
            <div
              class="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-4"
            >
              <button
                @click="cancelOrder"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out text-sm md:text-base"
              >
                Cancelar Pedido
              </button>
              <button
                @click="submitOrder"
                :disabled="currentOrder.length === 0"
                :class="[
                  'px-4 py-2 rounded-lg transition duration-300 ease-in-out text-sm md:text-base',
                  currentOrder.length > 0
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed',
                ]"
              >
                Enviar Pedido
              </button>
            </div>
          </div>

          <!-- Order History Tab Content -->
          <div v-else-if="orderTab === 'history'" class="bg-gray-700 rounded-lg p-4">
            <h4 class="text-base md:text-lg font-semibold mb-2">Histórico de Pedidos</h4>
            <div class="h-64 overflow-y-auto">
              <table class="w-full">
                <thead>
                  <tr>
                    <th class="text-left py-2 px-4">Código</th>
                    <th class="text-left py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="order in orderHistory"
                    :key="order.code"
                    class="border-t border-gray-600"
                  >
                    <td class="py-2 px-4">{{ order.code }}</td>
                    <td class="py-2 px-4">
                      <span :class="getStatusClass(order.status)">
                        {{ order.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications Screen -->
      <div v-else-if="currentTab === 'notifications'">
        <h2 class="text-xl md:text-2xl font-semibold mb-4">Notificações</h2>
        <div v-if="notifications.length === 0" class="text-center text-gray-400 py-8">
          <i class="mdi mdi-bell-off text-6xl mb-4"></i>
          <p class="text-xl">Nenhuma notificação no momento</p>
        </div>
        <ul v-else class="space-y-4">
          <li
            v-for="notification in notifications"
            :key="notification.id"
            class="bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-lg md:text-xl font-semibold">{{
                notification.titulo
              }}</span>
              <span :class="getStatusClass(notification.status)">{{
                notification.status
              }}</span>
            </div>
            <p class="text-sm md:text-base mb-2">{{ notification.texto }}</p>
            <div class="flex justify-between items-center text-sm text-gray-400">
              <!-- <span>Mesa: {{ notification.table }}</span> -->
              <span
                >{{ notification.horario.split(":")[0] }}:{{
                  notification.horario.split(":")[1]
                }}</span
              >
            </div>
            <button
              @click="markAsRead(notification.id)"
              class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg transition duration-300 ease-in-out text-sm md:text-base"
            >
              Marcar como lido
            </button>
          </li>
        </ul>
      </div>
    </main>

    <!-- Add Product Modal -->
    <div
      v-if="showAddProductModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-gray-800 rounded-xl p-4 md:p-6 w-full max-w-md">
        <h3 class="text-lg md:text-xl font-semibold mb-4">Adicionar Novo Produto</h3>
        <form @submit.prevent="addNewProduct" class="space-y-4">
          <div>
            <label for="productName" class="block text-sm font-medium text-gray-300 mb-1"
              >Nome do Produto</label
            >
            <input
              v-model="newProduct.nome"
              id="productName"
              type="text"
              required
              class="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
          </div>
          <div>
            <label for="productPrice" class="block text-sm font-medium text-gray-300 mb-1"
              >Preço</label
            >
            <input
              v-model="newProduct.valor"
              id="productPrice"
              type="numero_mesa"
              step="0.01"
              required
              class="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
          </div>
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="showAddProductModal = false"
              class="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg transition duration-300 ease-in-out text-sm md:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition duration-300 ease-in-out text-sm md:text-base"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import api from "~/api";

const showCaixaModal = ref(false);
const selectedCaixaId = ref("");
const caixas = ref([]);

onBeforeMount(() => {
  api("mesas/").then((res) => {
    tables.value = res;
  });

  api("caixas/").then((res) => {
    caixas.value = res.map((item) => {
      return { ...item, nome: "Caixa " + item.operador };
    });
  });
});

onMounted(async () => {
  const storedCaixaId = localStorage.getItem("caixa_id");
  if (storedCaixaId) {
    selectedCaixaId.value = storedCaixaId;
    showCaixaModal.value = false;
  } else {
    showCaixaModal.value = true;
  }

  api(`restaurantes/${localStorage.getItem("restaurante_id")}/pratos/`).then((res) => {
    products.value = res;
  });

  setInterval(() => {
    api(`restaurantes/${localStorage.getItem("restaurante_id")}/notificacoes/`).then(
      (res) => {
        notifications.value = res.filter((res) => res.visualizada == false);
      }
    );
  }, 5000);
});

const currentTab = ref("main");
const orderTab = ref("current");

const tables = ref([]);

const products = ref([]);

const selectedTable = ref(null);
const currentOrder = ref([]);
const productSearch = ref("");
const showAddProductModal = ref(false);
const newProduct = ref({ name: "", price: 0 });

const notifications = ref([]);

const orderHistory = ref([]);

const filteredProducts = computed(() => {
  if (!productSearch.value) return products.value;
  const search = productSearch.value.toLowerCase();
  return products.value.filter((product) => product.nome.toLowerCase().includes(search));
});

const orderTotal = computed(() => {
  return currentOrder.value.reduce(
    (total, item) => total + item.valor * item.quantity,
    0
  );
});

const confirmCaixaSelection = () => {
  if (selectedCaixaId.value) {
    localStorage.setItem("caixa_id", selectedCaixaId.value);
    showCaixaModal.value = false;
  }
};

const selectTable = (table) => {
  selectedTable.value = table;
  currentOrder.value = [];
};

const addToOrder = (product) => {
  const existingItem = currentOrder.value.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    currentOrder.value.push({ ...product, quantity: 1 });
  }
};

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--;
  } else {
    removeFromOrder(item);
  }
};

const increaseQuantity = (item) => {
  item.quantity++;
};

const removeFromOrder = (item) => {
  const index = currentOrder.value.findIndex((orderItem) => orderItem.id === item.id);
  if (index !== -1) {
    currentOrder.value.splice(index, 1);
  }
};

const cancelOrder = () => {
  currentOrder.value = [];
  selectedTable.value = null;
};

const submitOrder = () => {
  // Implement order submission logic here
  api("pedidos/", "POST", {
    mesa: selectedTable.value.id,
    items: currentOrder.value.map((item) => {
      return { id: item.id, qtd: item.quantity };
    }),
    caixa: parseInt(localStorage.getItem("caixa_id")),
  }).then((res) => {
    console.log(res);
  });

  // Add a new notification for the submitted order
  notifications.value.push({
    id: Date.now(),
    title: "Novo Pedido",
    message: `Um novo pedido foi feito na Mesa ${selectedTable.value.numero_mesa}.`,
    status: "Novo",
    table: selectedTable.value.numero_mesa,
    time: new Date(),
  });
  // Add the new order to the history
  orderHistory.value.unshift({
    code: `P${String(orderHistory.value.length + 1).padStart(3, "0")}`,
    status: "pendente",
  });
  currentOrder.value = [];
  selectedTable.value = null;
};

const addNewProduct = () => {
  const newId = Math.max(...products.value.map((p) => p.id)) + 1;
  products.value.push({
    id: newId,
    name: newProduct.value.nome,
    price: parseFloat(newProduct.value.valor),
  });
  newProduct.value = { name: "", price: 0 };
  showAddProductModal.value = false;
};

const formatTime = (date) => {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClass = (status) => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-semibold";
  switch (status) {
    case "aviso":
      return `${baseClasses} bg-yellow-500 text-yellow-900`;
    case "em preparo":
      return `${baseClasses} bg-blue-500 text-blue-900`;
    case "pronto":
      return `${baseClasses} bg-green-500 text-green-900`;
    case "novo":
      return `${baseClasses} bg-purple-500 text-purple-900`;
    default:
      return `${baseClasses} bg-gray-500 text-gray-900`;
  }
};

const markAsRead = (id) => {
  const index = notifications.value.findIndex((notification) => notification.id === id);
  if (index !== -1) {
    notifications.value.splice(index, 1);
  }
  api(
    `restaurantes/${localStorage.getItem("restaurante_id")}/notificacoes/${id}/`,
    "PATCH",
    { visualizada: true }
  );
};

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
