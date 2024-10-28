<template>
  <div class="">
    <h2 class="text-3xl font-bold mb-4">Caixa Registradora</h2>

    <!-- Cash Register Opening Modal -->
    <div
      v-if="showOpeningModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">Abertura de Caixa</h2>
        <div class="space-y-4">
          <div>
            <label for="initialBalance" class="block text-sm font-medium text-gray-400"
              >Saldo Inicial</label
            >
            <div class="mt-1 relative rounded-md shadow-sm">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm">R$</span>
              </div>
              <input
                type="number"
                id="initialBalance"
                v-model="initialBalance"
                class="bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-600 rounded-md"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-400">Operador: {{ operatorName }}</p>
            <p class="text-sm text-gray-400">Função: {{ operatorRole }}</p>
            <p class="text-sm text-gray-400">Início do turno: {{ shiftStartTime }}</p>
          </div>
          <button
            @click="confirmOpeningBalance"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Confirmar Saldo Inicial
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="flex flex-col lg:flex-row gap-4">
      <!-- Left Column: Product Search, Order List, and Tabs -->
      <div class="w-full lg:w-2/3 bg-gray-800 rounded-lg p-4 shadow-lg">
        <!-- Tabs -->
        <div class="mb-4 flex items-center justify-between">
          <div>
            <button
              @click="activeTab = 'vendas'"
              :class="{
                'bg-indigo-600': activeTab === 'vendas',
                'bg-gray-700': activeTab !== 'vendas',
              }"
              class="px-4 py-2 rounded-tl-lg rounded-tr-lg text-white font-semibold"
            >
              Vendas
            </button>
            <button
              @click="activeTab = 'despesas'"
              :class="{
                'bg-indigo-600': activeTab === 'despesas',
                'bg-gray-700': activeTab !== 'despesas',
              }"
              class="px-4 py-2 mx-2 rounded-tl-lg rounded-tr-lg text-white font-semibold"
            >
              Despesas
            </button>
            <button
              @click="activeTab = 'acrescimos'"
              :class="{
                'bg-indigo-600': activeTab === 'acrescimos',
                'bg-gray-700': activeTab !== 'acrescimos',
              }"
              class="px-4 py-2 rounded-tl-lg rounded-tr-lg text-white font-semibold"
            >
              Acrescimos
            </button>
          </div>
          <div class="flex items-center">
            <input
              type="text"
              v-model="orderSearch"
              placeholder="Buscar pedido..."
              class="bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-l-md px-3 py-2"
            />
            <button
              @click="searchOrder"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-r-md transition duration-300"
            >
              <i class="mdi mdi-magnify"></i>
            </button>
          </div>
        </div>

        <!-- Vendas Tab -->
        <div v-if="activeTab === 'vendas'">
          <!-- ... (previous code for item search remains unchanged) ... -->
          <div class="overflow-x-auto h-64 overflow-y-auto">
            <table class="min-w-full divide-y divide-gray-700">
              <thead class="bg-gray-700 sticky top-0">
                <tr>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Item
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Preço
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Qtd
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody class="bg-gray-800 divide-y divide-gray-700">
                <tr v-for="item in currentOrder" :key="item.id">
                  <td class="px-4 py-2 whitespace-nowrap">{{ item.nome }}</td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    R$ {{ item.valor.toFixed(2) }}
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    <div class="flex items-center space-x-2">
                      <button
                        @click="adjustQuantity(item.id, -1)"
                        class="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full transition duration-300"
                      >
                        -
                      </button>
                      <span>{{ item.quantity }}</span>
                      <button
                        @click="adjustQuantity(item.id, 1)"
                        class="bg-green-500 hover:bg-green-600 text-white w-6 h-6 rounded-full transition duration-300"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    R$ {{ (item.valor * item.quantity).toFixed(2) }}
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    <button
                      @click="removeItem(item.id)"
                      class="text-red-500 hover:text-red-600"
                    >
                      <i class="mdi mdi-delete"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Despesas Tab -->
        <div v-if="activeTab === 'despesas'">
          <h2 class="text-xl font-bold mb-4">Registrar Despesa</h2>
          <div class="space-y-4">
            <div>
              <label for="expenseAmount" class="block text-sm font-medium text-gray-400"
                >Valor da Despesa</label
              >
              <div class="mt-1 relative rounded-md shadow-sm">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <span class="text-gray-500 sm:text-sm">R$</span>
                </div>
                <input
                  type="number"
                  id="expenseAmount"
                  v-model="expenseAmount"
                  class="bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-600 rounded-md"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label
                for="expenseDescription"
                class="block text-sm font-medium text-gray-400"
                >Descrição</label
              >
              <input
                type="text"
                id="expenseDescription"
                v-model="expenseDescription"
                class="mt-1 bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md"
              />
            </div>
            <div>
              <label for="expenseCategory" class="block text-sm font-medium text-gray-400"
                >Categoria</label
              >
              <select
                id="expenseCategory"
                v-model="expenseCategory"
                class="mt-1 bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md"
              >
                <option value="suprimentos">Suprimentos</option>
                <option value="manutencao">Manutenção</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            <button
              @click="logExpense"
              class="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Registrar Despesa
            </button>
          </div>
          <div class="mt-4 h-48 overflow-y-auto">
            <h3 class="text-lg font-semibold mb-2">Despesas Registradas</h3>
            <table class="min-w-full divide-y divide-gray-700">
              <thead class="bg-gray-700 sticky top-0">
                <tr>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Descrição
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Categoria
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody class="bg-gray-800 divide-y divide-gray-700">
                <tr v-for="(expense, index) in expenses" :key="index">
                  <td class="px-4 py-2 whitespace-nowrap">
                    {{ expense.descricao }}
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    {{ expense.categoria }}
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    R$ {{ expense.valor.toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="activeTab === 'acrescimos'">
          <h2 class="text-xl font-bold mb-4">Registrar Acréscimo</h2>
          <div class="space-y-4">
            <div>
              <label for="addtionAmount" class="block text-sm font-medium text-gray-400"
                >Valor do Acréscimo</label
              >
              <div class="mt-1 relative rounded-md shadow-sm">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <span class="text-gray-500 sm:text-sm">R$</span>
                </div>
                <input
                  type="number"
                  id="addtionAmount"
                  v-model="addtionAmount"
                  class="bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-600 rounded-md"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label
                for="addtionDescription"
                class="block text-sm font-medium text-gray-400"
                >Descrição</label
              >
              <input
                type="text"
                id="addtionDescription"
                v-model="addtionDescription"
                class="mt-1 bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md"
              />
            </div>
            <div>
              <label for="addtionCategory" class="block text-sm font-medium text-gray-400"
                >Categoria</label
              >
              <select
                id="addtionCategory"
                v-model="addtionCategory"
                class="mt-1 bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md"
              >
                <option value="suprimentos">Suprimentos</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            <button
              @click="logAddition"
              class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Registrar Acréscimo
            </button>
          </div>
          <div class="mt-4 h-48 overflow-y-auto">
            <h3 class="text-lg font-semibold mb-2">Acréscimos Registrados</h3>
            <table class="min-w-full divide-y divide-gray-700">
              <thead class="bg-gray-700 sticky top-0">
                <tr>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Descrição
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Categoria
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody class="bg-gray-800 divide-y divide-gray-700">
                <tr v-for="(addition, index) in additions" :key="index">
                  <td class="px-4 py-2 whitespace-nowrap">
                    {{ addition.descricao }}
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    {{ addition.categoria }}
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    R$ {{ addition.valor.toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column: Order Summary and Payment -->
      <div class="w-full lg:w-1/3 bg-gray-800 rounded-lg p-4 shadow-lg">
        <h2 class="text-xl font-bold mb-4">Resumo do Pedido</h2>
        <div class="space-y-2 mb-4">
          <div class="flex justify-between items-center text-sm">
            <span>Subtotal:</span>
            <span>R$ {{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm text-green-500">
            <span>Desconto:</span>
            <span>R$ {{ totalDiscount.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-center font-bold text-lg">
            <span>Total a Pagar:</span>
            <span>R$ {{ orderTotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm text-blue-500">
            <span>Total Pago:</span>
            <span>R$ {{ totalPaid.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm text-yellow-500">
            <span>Troco:</span>
            <span>R$ {{ change.toFixed(2) }}</span>
          </div>
        </div>

        <div class="mb-4">
          <label for="discountType" class="block text-sm font-medium text-gray-400"
            >Tipo de Desconto</label
          >
          <select
            id="discountType"
            v-model="discountType"
            class="mt-1 bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md"
          >
            <option value="none">Sem Desconto</option>
            <option value="percentage">Porcentagem</option>
            <option value="fixed">Valor Fixo</option>
          </select>
        </div>
        <div v-if="discountType !== 'none'" class="mb-4">
          <label for="discountValue" class="block text-sm font-medium text-gray-400">
            {{
              discountType === "percentage"
                ? "Porcentagem de Desconto"
                : "Valor do Desconto"
            }}
          </label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div
              v-if="discountType === 'fixed'"
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <span class="text-gray-500 sm:text-sm">R$</span>
            </div>
            <input
              type="number"
              id="discountValue"
              v-model="discountValue"
              :placeholder="discountType === 'percentage' ? '0-100' : '0.00'"
              :step="discountType === 'percentage' ? '1' : '0.01'"
              :min="0"
              :max="discountType === 'percentage' ? 100 : undefined"
              class="bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-600 rounded-md"
            />
            <div
              v-if="discountType === 'percentage'"
              class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
            >
              <span class="text-gray-500 sm:text-sm">%</span>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2">Métodos de Pagamento</h3>
          <div class="h-32 overflow-y-auto">
            <div
              v-for="(payment, index) in payments"
              :key="index"
              class="flex items-center space-x-2 mb-2"
            >
              <select
                v-model="payment.metodo"
                class="bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md"
              >
                <option v-for="metodo in paymentMethods" :key="metodo" :value="metodo">
                  {{ metodo }}
                </option>
              </select>
              <input
                type="number"
                v-model="payment.valor"
                class="bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md"
                placeholder="Valor"
                step="0.01"
                min="0"
              />
              <button
                @click="removePayment(index)"
                class="text-red-500 hover:text-red-600"
              >
                <i class="mdi mdi-delete"></i>
              </button>
            </div>
          </div>
          <button
            @click="addPayment"
            class="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 w-full"
          >
            Adicionar Método de Pagamento
          </button>
        </div>

        <button
          @click="finalizeSale"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          Finalizar Venda (F7)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import api from "~/api";

// Cash Register Opening
const showOpeningModal = ref(true);
const orderSearch = ref("");
const isSearching = ref(false);
const initialBalance = ref(0);
const operatorName = ref("...");
const operatorRole = ref("Caixa");
const isDropdownVisible = ref(false);
const shiftStartTime = ref(new Date().toLocaleTimeString());
const allOrders = ref([]);

const confirmOpeningBalance = () => {
  showOpeningModal.value = false;
  // Here you would typically send the initial balance to your backend

  api("caixas/", "POST", {
    saldo_inicial: initialBalance.value,
    operador: localStorage.getItem("user_id"),
    restaurante: localStorage.getItem("restaurante_id"),
  });
  console.log(`Caixa aberto com saldo inicial de R$ ${initialBalance.value}`);
};

const lastFounded = ref(null);

const searchOrder = async () => {
  if (isSearching.value) {
    // If already searching, clear the search
    orderSearch.value = "";
    currentOrder.value = [];
    isSearching.value = false;
  } else {
    // Perform the search
    try {
      if (allOrders.value.length === 0) {
        // Fetch all orders if not already fetched
        const response = await api("pedidos/");
        if (Array.isArray(response)) {
          allOrders.value = response;
        } else {
          throw new Error("Resposta da API inválida");
        }
      }

      // Filter orders based on the search term (codigo)
      const foundOrder = allOrders.value.find(
        (order) => order.codigo === orderSearch.value
      );

      if (foundOrder.valor_pago) {
        alert("Pedido já está pago");
        return;
      }

      if (foundOrder) {
        lastFounded.value = foundOrder;
        currentOrder.value = foundOrder.items.map((item) => ({
          ...item.prato,
          quantity: item.qtd,
        }));
        isSearching.value = true;
      } else {
        console.log(allOrders.value, "aaa");
        alert("Pedido não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar pedido:", error);
      alert("Ocorreu um erro ao buscar o pedido. Por favor, tente novamente.");
    }
  }
};

// Tab Management
const activeTab = ref("vendas");

// Sales Interface
const itemSearch = ref("");
const searchResults = ref([]);
const menuItems = [];
const currentOrder = ref([]);

const showAllProducts = () => {
  searchResults.value = menuItems.value;
};

const searchItems = () => {
  if (itemSearch.value.length > 0) {
    searchResults.value = menuItems.value.filter((item) =>
      item.nome.toLowerCase().includes(itemSearch.value.toLowerCase())
    );
  } else {
    searchResults.value = [];
  }
};
const clickOutside = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = (event) => {
      // Check if the click is outside the element and if the dropdown is visible
      if (!el.contains(event.target) && binding.instance.isDropdownVisible) {
        binding.value(event);
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};

const showDropdown = () => {
  isDropdownVisible.value = true;
};

const handleClickOutside = (event) => {
  const dropdown = document.getElementById("itemSearch");
  if (dropdown && !dropdown.contains(event.target)) {
    isDropdownVisible.value = false;
  }
};

onMounted(() => {
  api("pedidos/").then((res) => {
    allOrders.value = res;
  });

  window.addEventListener("keydown", handleKeyPress);
  operatorName.value = localStorage.getItem("nome_funcionario");
  document.addEventListener("click", handleClickOutside);

  api(
    "restaurantes/caixas/aberto/?restaurante_id=" + localStorage.getItem("restaurante_id")
  )
    .then((res) => {
      localStorage.setItem("caixa_aberto_id", res.caixa_aberto_id);
      showOpeningModal.value = false;
    })
    .catch(() => {});

  api(`restaurantes/${localStorage.getItem("restaurante_id")}/pratos/`).then((res) => {
    menuItems.value = res;
    showAllProducts();
  });

  api("acrescimos/").then((res) => {
    additions.value = res.filter(
      (item) => item.caixa == localStorage.getItem("caixa_aberto_id")
    );
  });

  api("despesas/").then((res) => {
    expenses.value = res.filter(
      (item) => item.caixa == localStorage.getItem("caixa_aberto_id")
    );
  });
});

const addItemToOrder = (item) => {
  const existingItem = currentOrder.value.find((orderItem) => orderItem.id === item.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    currentOrder.value.push({ ...item, quantity: 1 });
  }
  itemSearch.value = "";
};

const adjustQuantity = (id, change) => {
  const item = currentOrder.value.find((item) => item.id === id);
  if (item) {
    item.quantity = Math.max(0, item.quantity + change);
    if (item.quantity === 0) {
      removeItem(id);
    }
  }
};

const removeItem = (id) => {
  currentOrder.value = currentOrder.value.filter((item) => item.id !== id);
};

const subtotal = computed(() => {
  return currentOrder.value.reduce(
    (total, item) => total + item.valor * item.quantity,
    0
  );
});

const discountType = ref("none");
const discountValue = ref(0);

const totalDiscount = computed(() => {
  if (discountType.value === "none") return 0;
  if (discountType.value === "percentage") {
    return subtotal.value * (discountValue.value / 100);
  }
  return Math.min(discountValue.value, subtotal.value);
});

const orderTotal = computed(() => {
  return subtotal.value - totalDiscount.value;
});

const paymentMethods = [
  "Dinheiro",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Pix",
  "Vale-Refeição",
];
const payments = ref([{ metodo: "", valor: 0 }]);

const addPayment = () => {
  payments.value.push({ metodo: "", valor: 0 });
};

const removePayment = (index) => {
  payments.value.splice(index, 1);
};

const totalPaid = computed(() => {
  return payments.value.reduce((total, payment) => total + Number(payment.valor), 0);
});

const change = computed(() => {
  return Math.max(0, totalPaid.value - orderTotal.value);
});

const paymentMethodsMapping = {
  Dinheiro: "dinheiro",
  "Cartão de Crédito": "cartao_credito",
  "Cartão de Débito": "cartao_debito",
  "Vale-Refeição": "vale_refeicao",
  Pix: "pix",
  Boleto: "boleto",
};

const mapPaymentMethods = (payments) => {
  return payments.map((payment) => {
    return {
      ...payment,
      metodo: paymentMethodsMapping[payment.metodo] || payment.metodo, // Map the method or keep it as is
    };
  });
};

const finalizeSale = () => {
  if (currentOrder.value.length === 0) {
    alert("Adicione itens ao pedido antes de finalizar a venda.");
    return;
  }
  if (totalPaid.value < orderTotal.value) {
    alert("O valor pago é menor que o total do pedido.");
    return;
  }

  // Here you would typically send the order to your backend and print a receipt
  console.log("Venda finalizada");
  console.log("Itens:", currentOrder.value);
  console.log("Subtotal:", subtotal.value);
  console.log("Desconto:", totalDiscount.value);
  console.log("Total:", orderTotal.value);
  console.log("Pagamentos:", payments.value);
  console.log("Troco:", change.value);

  if (orderSearch.value != "" && lastFounded.value != null) {
    api("pedidos/" + lastFounded.value.id + "/", "PATCH", {
      caixa: localStorage.getItem("caixa_aberto_id"),
      pagamentos: mapPaymentMethods(payments.value),
      valor_pago: parseFloat(totalPaid.value).toFixed(2),
      troco: change.value.toFixed(2),
      desconto: totalDiscount.value.toFixed(2),
      subtotal: subtotal.value.toFixed(2),
      status: "Fechado",
      items: currentOrder.value.map((item) => {
        return { id: item.id, qtd: item.quantity };
      }),
    });
    orderSearch.value = "";
    lastFounded.value = null;
  } else {
    api("pedidos/", "POST", {
      caixa: localStorage.getItem("caixa_aberto_id"),
      pagamentos: mapPaymentMethods(payments.value),
      valor_pago: parseFloat(totalPaid.value),
      troco: change.value.toFixed(2),
      desconto: totalDiscount.value.toFixed(2),
      subtotal: subtotal.value.toFixed(2),
      items: currentOrder.value.map((item) => {
        return { id: item.id, qtd: item.quantity };
      }),
    });
  }

  // Reset the order
  currentOrder.value = [];
  payments.value = [{ metodo: "", valor: 0 }];
  discountType.value = "none";
  discountValue.value = 0;
};

// Expense Logging
const expenseAmount = ref(0);
const expenseDescription = ref("");
const expenseCategory = ref("suprimentos");

const addtionAmount = ref(0);
const addtionDescription = ref("");
const addtionCategory = ref("suprimentos");

const expenses = ref([]);
const additions = ref([]);

const logAddition = () => {
  if (addtionAmount.value <= 0) {
    alert("Insira um valor válido para o acréscimo.");
    return;
  }
  if (!addtionDescription.value) {
    alert("Forneça uma descrição para a acréscimo.");
    return;
  }
  // Here you would typically send the expense to your backend

  const payload = {
    valor: addtionAmount.value,
    descricao: addtionDescription.value,
    categoria: addtionCategory.value,
    caixa: localStorage.getItem("caixa_aberto_id"),
  };
  console.log("Acréscimo registrado:", payload);

  api("acrescimos/", "POST", payload).then(() => {
    api("acrescimos/").then((res) => {
      additions.value = res.filter(
        (item) => item.caixa == localStorage.getItem("caixa_aberto_id")
      );
    });
  });

  // Reset the form
  addtionAmount.value = 0;
  addtionDescription.value = "";
  addtionCategory.value = "suprimentos";
};

const logExpense = () => {
  if (expenseAmount.value <= 0) {
    alert("Insira um valor válido para a despesa.");
    return;
  }
  if (!expenseDescription.value) {
    alert("Forneça uma descrição para a despesa.");
    return;
  }
  // Here you would typically send the expense to your backend
  const payload = {
    valor: expenseAmount.value,
    descricao: expenseDescription.value,
    categoria: expenseCategory.value,
    caixa: localStorage.getItem("caixa_aberto_id"),
  };
  console.log("Despesa registrada:", payload);

  api("despesas/", "POST", payload).then(() => {
    api("despesas/").then((res) => {
      expenses.value = res.filter(
        (item) => item.caixa == localStorage.getItem("caixa_aberto_id")
      );
    });
  });

  // Reset the form
  expenseAmount.value = 0;
  expenseDescription.value = "";
  expenseCategory.value = "suprimentos";
};

// F7 key functionality
const handleKeyPress = (event) => {
  if (event.key === "F7") {
    event.preventDefault();
    finalizeSale();
  }
};

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("keydown", handleKeyPress);
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
@import url("https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css");

body {
  font-family: "Inter", sans-serif;
}
</style>
