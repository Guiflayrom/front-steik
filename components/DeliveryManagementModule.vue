<template>
  <div class="space-y-6">
    <!-- Delivery Management Module -->
    <div v-if="currentModule === 'delivery'" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-3xl font-bold font-display">Gestão de Entregas</h2>
        <button
          @click="openNewDeliveryModal"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
        >
          <i class="mdi mdi-plus-circle mr-2"></i>Nova Entrega
        </button>
      </div>

      <!-- Active Deliveries Section -->
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 class="text-xl font-semibold mb-4">Pedidos em Andamento</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left bg-gray-700">
                <th class="p-3">ID</th>
                <th class="p-3">Cliente</th>
                <th class="p-3">Endereço</th>
                <th class="p-3">Status</th>
                <th class="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="pedido in activeDeliveries"
                :key="pedido.id"
                class="border-b border-gray-700"
              >
                <td class="p-3">#{{ pedido.id }}</td>
                <td class="p-3">
                  {{ pedido.pessoa ? pedido.pessoa.nome : "N/A" }}
                </td>
                <td class="p-3">
                  {{
                    pedido.pessoa
                      ? `${pedido.pessoa.endereco}, ${pedido.pessoa.numero}`
                      : "N/A"
                  }}
                </td>
                <td class="p-3">
                  <select
                    v-model="pedido.status"
                    @change="updateOrderStatus(pedido)"
                    :class="getStatusClass(pedido.status)"
                    class="bg-gray-800 border-none cursor-pointer"
                  >
                    <option value="Em Aberto">Em Aberto</option>
                    <option value="Preparando">Preparando</option>
                    <option value="Pedido Pronto">Pedido Pronto</option>
                    <option value="Em Rota">Em Rota</option>
                    <option value="Entregue">Entregue</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </td>
                <td class="p-3">
                  <button
                    @click="viewOrderDetails(pedido.id)"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2 transition duration-300 ease-in-out"
                  >
                    <i class="mdi mdi-eye mr-1"></i>Ver
                  </button>
                  <button
                    @click="cancelOrder(pedido.id)"
                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition duration-300 ease-in-out"
                  >
                    <i class="mdi mdi-cancel mr-1"></i>Cancelar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Platform Integration Section -->
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 class="text-xl font-semibold mb-4">Integração com Plataformas</h3>
        <h4 class="text-sm font-semibold mb-4">
          <i> (Em Desenvolvimento) </i>
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="platform in deliveryPlatforms"
            :key="platform"
            @click="syncOrders(platform)"
            class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
          >
            <i class="mdi mdi-sync mr-2"></i>Sincronizar {{ platform }}
          </button>
        </div>
      </div>
    </div>

    <!-- New Delivery Modal -->
    <div
      v-if="showNewDeliveryModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-gray-800 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div class="p-6 border-b border-gray-700">
          <h3 class="text-2xl font-bold">Nova Entrega</h3>
        </div>
        <div class="p-6 flex-grow overflow-y-auto">
          <!-- Step 1: Customer Information -->
          <div v-if="currentStep === 1">
            <form @submit.prevent="validateStep1" class="space-y-4">
              <div>
                <label
                  for="existingCustomer"
                  class="block text-sm font-medium text-gray-300"
                  >Selecionar Cliente Existente</label
                >
                <select
                  v-model="selectedClientId"
                  @change="loadClientInfo"
                  id="existingCustomer"
                  class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                >
                  <option value="" disabled>Selecione um cliente</option>
                  <option v-for="client in clients" :key="client.id" :value="client.id">
                    {{ client.nome }}
                  </option>
                </select>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label
                    for="customerName"
                    class="block text-sm font-medium text-gray-300"
                    >Nome do Cliente</label
                  >
                  <input
                    v-model="newDelivery.nome"
                    id="customerName"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div class="flex space-x-2">
                  <div class="w-1/4">
                    <label for="ddd" class="block text-sm font-medium text-gray-300"
                      >DDD</label
                    >
                    <input
                      v-model="newDelivery.ddd"
                      id="ddd"
                      type="text"
                      required
                      class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div class="w-3/4">
                    <label for="phone" class="block text-sm font-medium text-gray-300"
                      >Telefone</label
                    >
                    <input
                      v-model="newDelivery.telefone"
                      id="phone"
                      type="text"
                      required
                      class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label for="cpfCnpj" class="block text-sm font-medium text-gray-300"
                    >CPF/CNPJ</label
                  >
                  <input
                    v-model="newDelivery.cpf_cnpj"
                    id="cpfCnpj"
                    type="text"
                    class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label for="rg" class="block text-sm font-medium text-gray-300"
                    >RG</label
                  >
                  <input
                    v-model="newDelivery.rg"
                    id="rg"
                    type="text"
                    class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-300"
                    >Email</label
                  >
                  <input
                    v-model="newDelivery.email"
                    id="email"
                    type="email"
                    class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label for="cep" class="block text-sm font-medium text-gray-300"
                    >CEP</label
                  >
                  <input
                    v-model="newDelivery.cep"
                    id="cep"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div class="md:col-span-2">
                  <label for="address" class="block text-sm font-medium text-gray-300"
                    >Endereço</label
                  >
                  <input
                    v-model="newDelivery.endereco"
                    id="address"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label for="number" class="block text-sm font-medium text-gray-300"
                    >Número</label
                  >
                  <input
                    v-model="newDelivery.numero"
                    id="number"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label for="complement" class="block text-sm font-medium text-gray-300"
                    >Complemento</label
                  >
                  <input
                    v-model="newDelivery.complemento"
                    id="complement"
                    type="text"
                    class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label
                    for="neighborhood"
                    class="block text-sm font-medium text-gray-300"
                    >Bairro</label
                  >
                  <input
                    v-model="newDelivery.bairro"
                    id="neighborhood"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label for="city" class="block text-sm font-medium text-gray-300"
                    >Cidade</label
                  >
                  <input
                    v-model="newDelivery.cidade"
                    id="city"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label for="state" class="block text-sm font-medium text-gray-300"
                    >UF</label
                  >
                  <input
                    v-model="newDelivery.uf"
                    id="state"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div class="md:col-span-2">
                  <label for="reference" class="block text-sm font-medium text-gray-300"
                    >Referência</label
                  >
                  <input
                    v-model="newDelivery.referencia"
                    id="reference"
                    type="text"
                    class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div>
                <label for="observations" class="block text-sm font-medium text-gray-300"
                  >Observações</label
                >
                <textarea
                  v-model="newDelivery.observacoes"
                  id="observations"
                  rows="3"
                  class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                ></textarea>
              </div>
              <div class="flex justify-end space-x-4">
                <button
                  @click="closeNewDeliveryModal"
                  type="button"
                  class="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                >
                  Próximo
                </button>
              </div>
            </form>
          </div>

          <!-- Step 2: Product Selection -->
          <div v-if="currentStep === 2">
            <div class="mb-4">
              <label for="productFilter" class="block text-sm font-medium text-gray-300"
                >Filtrar Produtos</label
              >
              <input
                v-model="productFilter"
                id="productFilter"
                type="text"
                class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                placeholder="Digite para filtrar produtos"
              />
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 class="text-lg font-semibold mb-2">Produtos Disponíveis</h4>
                <div class="overflow-y-auto max-h-64">
                  <table class="w-full">
                    <thead class="bg-gray-700 sticky top-0">
                      <tr class="text-left">
                        <th class="p-2">Cód</th>
                        <th class="p-2">Descrição</th>
                        <th class="p-2">Valor Unitário</th>
                        <th class="p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="product in filteredProducts"
                        :key="product.id"
                        class="border-b border-gray-700"
                      >
                        <td class="p-2">{{ product.numero_prato }}</td>
                        <td class="p-2">{{ product.nome }}</td>
                        <td class="p-2">R$ {{ product.valor.toFixed(2) }}</td>
                        <td class="p-2">
                          <button
                            @click="addItemToOrder(product)"
                            class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                          >
                            <i class="mdi mdi-plus"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h4 class="text-lg font-semibold mb-2">Itens Adicionados</h4>
                <div class="overflow-y-auto max-h-64">
                  <table class="w-full">
                    <thead class="bg-gray-700 sticky top-0">
                      <tr class="text-left">
                        <th class="p-2">Qtd</th>
                        <th class="p-2">Descrição</th>
                        <th class="p-2">Valor Unitário</th>
                        <th class="p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="item in newDelivery.items"
                        :key="item.id"
                        class="border-b border-gray-700"
                      >
                        <td class="p-2">{{ item.quantidade }}</td>
                        <td class="p-2">{{ item.nome }}</td>
                        <td class="p-2">R$ {{ item.valor.toFixed(2) }}</td>
                        <td class="p-2">
                          <button
                            @click="removeItem(item)"
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
            </div>
            <div class="flex justify-between items-center mt-4">
              <button
                @click="prevStep"
                class="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
              >
                Voltar
              </button>
              <button
                @click="validateStep2"
                :disabled="newDelivery.items.length === 0"
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </div>

          <!-- Step 3: Delivery Fee and Payment -->
          <div v-if="currentStep === 3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 class="text-lg font-semibold mb-4">Taxa de Entrega</h4>
                <div class="mb-4">
                  <label for="deliveryFee" class="block text-sm font-medium text-gray-300"
                    >Valor da Taxa de Entrega</label
                  >
                  <input
                    v-model.number="newDelivery.taxa_entrega"
                    id="deliveryFee"
                    type="number"
                    step="0.01"
                    class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div>
                <h4 class="text-lg font-semibold mb-4">Resumo do Pedido</h4>
                <div class="bg-gray-700 p-4 rounded-lg">
                  <p>Subtotal: R$ {{ orderSubtotal.toFixed(2) }}</p>
                  <p>
                    Taxa de Entrega: R$
                    {{ newDelivery.taxa_entrega.toFixed(2) }}
                  </p>
                  <p class="font-bold">Total a Pagar: R$ {{ orderTotal.toFixed(2) }}</p>
                </div>
              </div>
            </div>

            <div class="mb-6">
              <h4 class="text-lg font-semibold mb-4">Métodos de Pagamento</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    for="paymentMethod"
                    class="block text-sm font-medium text-gray-300"
                    >Método de Pagamento</label
                  >
                  <select
                    v-model="currentPayment.metodo"
                    id="paymentMethod"
                    class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="">Selecione um método</option>
                    <option
                      v-for="method in paymentMethods"
                      :key="method"
                      :value="method"
                    >
                      {{ method }}
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    for="paymentAmount"
                    class="block text-sm font-medium text-gray-300"
                    >Valor</label
                  >
                  <input
                    v-model.number="currentPayment.valor"
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              <button
                @click="addPayment"
                class="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
              >
                Adicionar Pagamento
              </button>
            </div>

            <div class="mb-6">
              <h4 class="text-lg font-semibold mb-4">Pagamentos Registrados</h4>
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-gray-300">
                  <thead class="text-xs uppercase bg-gray-700">
                    <tr>
                      <th scope="col" class="px-6 py-3">Método</th>
                      <th scope="col" class="px-6 py-3">Valor</th>
                      <th scope="col" class="px-6 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(payment, index) in newDelivery.pagamento"
                      :key="index"
                      class="border-b bg-gray-800 border-gray-700"
                    >
                      <td class="px-6 py-4">{{ payment.metodo }}</td>
                      <td class="px-6 py-4">R$ {{ payment.valor.toFixed(2) }}</td>
                      <td class="px-6 py-4">
                        <button
                          @click="removePayment(index)"
                          class="text-red-500 hover:text-red-700"
                        >
                          <i class="mdi mdi-delete"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="bg-gray-700 p-4 rounded-lg">
                <p class="text-sm font-medium text-gray-300">Total a Pagar</p>
                <p class="text-lg font-bold">R$ {{ orderTotal.toFixed(2) }}</p>
              </div>
              <div class="bg-gray-700 p-4 rounded-lg">
                <p class="text-sm font-medium text-gray-300">Total Pago</p>
                <p class="text-lg font-bold">R$ {{ totalPaid.toFixed(2) }}</p>
              </div>
              <div class="bg-gray-700 p-4 rounded-lg">
                <p class="text-sm font-medium text-gray-300">Troco</p>
                <p class="text-lg font-bold">R$ {{ change.toFixed(2) }}</p>
              </div>
            </div>
            <div class="flex justify-between mt-4">
              <button
                @click="prevStep"
                class="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
              >
                Voltar
              </button>
              <button
                @click="validateStep3"
                :disabled="!isPaymentComplete"
                class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div
      v-if="showOrderDetailsModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-gray-800 rounded-xl w-full max-w-2xl h-[60vh] flex flex-col">
        <div class="p-6 border-b border-gray-700">
          <h3 class="text-2xl font-bold">Detalhes do Pedido #{{ selectedOrder.id }}</h3>
        </div>
        <div class="p-6 flex-grow overflow-y-auto">
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold">Informações do Cliente</h4>
              <p>
                Nome:
                {{ selectedOrder.pessoa ? selectedOrder.pessoa.nome : "N/A" }}
              </p>
              <p>
                Endereço:
                {{
                  selectedOrder.pessoa
                    ? `${selectedOrder.pessoa.endereco}, ${selectedOrder.pessoa.numero}`
                    : "N/A"
                }}
              </p>
            </div>
            <div>
              <h4 class="font-semibold">Itens do Pedido</h4>
              <ul>
                <li v-for="item in selectedOrder.items" :key="item.id">
                  {{ item.qtd }}x {{ item.prato.nome }} - R$
                  {{ (item.prato.valor * item.qtd).toFixed(2) }}
                </li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold">Status: {{ selectedOrder.status }}</h4>
            </div>
            <div>
              <h4 class="font-semibold">
                Total do Pedido: R$ {{ selectedOrder.total_pratos.toFixed(2) }}
              </h4>
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-700">
          <div class="flex justify-end">
            <button
              @click="closeOrderDetailsModal"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "~/api";

// Navigation and Layout
const currentModule = ref("delivery");

// Delivery Management Data
const activeDeliveries = ref([]);
const deliveryPlatforms = ["iFood", "Uber Eats", "Rappi"];

// New Delivery Modal
const showNewDeliveryModal = ref(false);
const currentStep = ref(1);
const newDelivery = ref({
  nome: "",
  ddd: "",
  telefone: "",
  cpf_cnpj: "",
  rg: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  email: "",
  referencia: "",
  observacoes: "",
  items: [],
  taxa_entrega: 0,
  pagamento: [],
});

// Client data
const clients = ref([]);
const selectedClientId = ref("");

const loadClientInfo = () => {
  const selectedClient = clients.value.find(
    (client) => client.id === parseInt(selectedClientId.value)
  );
  if (selectedClient) {
    Object.keys(selectedClient).forEach((key) => {
      if (key in newDelivery.value) {
        newDelivery.value[key] = selectedClient[key];
      }
    });
  }
};

// Watch for changes in newDelivery and update the corresponding client if necessary
watch(
  newDelivery,
  (newValue) => {
    if (selectedClientId.value) {
      const clientIndex = clients.value.findIndex(
        (client) => client.id === parseInt(selectedClientId.value)
      );
      if (clientIndex !== -1) {
        clients.value[clientIndex] = {
          ...clients.value[clientIndex],
          ...newValue,
        };
      }
    }
  },
  { deep: true }
);

// Product Selection
const productFilter = ref("");
const products = ref([]);

const filteredProducts = computed(() => {
  if (!productFilter.value) return products.value;
  const filter = productFilter.value.toLowerCase();
  return products.value.filter(
    (product) =>
      product.nome.toLowerCase().includes(filter) ||
      product.numero_prato.toLowerCase().includes(filter)
  );
});

// Payment Methods
const paymentMethods = [
  "Cartão de Crédito",
  "Cartão de Débito",
  "PIX",
  "Dinheiro",
  "Vale-Refeição",
];

const currentPayment = ref({
  metodo: "",
  valor: 0,
});

const orderSubtotal = computed(() => {
  return newDelivery.value.items.reduce(
    (sum, item) => sum + item.quantidade * item.valor,
    0
  );
});

const orderTotal = computed(() => {
  return orderSubtotal.value + newDelivery.value.taxa_entrega;
});

const totalPaid = computed(() => {
  return newDelivery.value.pagamento.reduce((sum, payment) => sum + payment.valor, 0);
});

const change = computed(() => {
  return Math.max(0, totalPaid.value - orderTotal.value);
});

const isPaymentComplete = computed(() => {
  return totalPaid.value >= orderTotal.value;
});

// Order Details Modal
const showOrderDetailsModal = ref(false);
const selectedOrder = ref(null);

// Functions
const openNewDeliveryModal = () => {
  showNewDeliveryModal.value = true;
  currentStep.value = 1;
  newDelivery.value = {
    nome: "",
    ddd: "",
    telefone: "",
    cpf_cnpj: "",
    rg: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    email: "",
    referencia: "",
    observacoes: "",
    items: [],
    taxa_entrega: 0,
    pagamento: [],
  };
  selectedClientId.value = "";
};

const closeNewDeliveryModal = () => {
  showNewDeliveryModal.value = false;
};

const validateStep1 = () => {
  if (
    newDelivery.value.nome &&
    newDelivery.value.ddd &&
    newDelivery.value.telefone &&
    newDelivery.value.cep &&
    newDelivery.value.endereco &&
    newDelivery.value.numero &&
    newDelivery.value.cidade &&
    newDelivery.value.uf
  ) {
    nextStep();
  } else {
    alert("Por favor, preencha todos os campos obrigatórios.");
  }
};

const validateStep2 = () => {
  if (newDelivery.value.items.length > 0) {
    nextStep();
  } else {
    alert("Por favor, adicione pelo menos um item ao pedido.");
  }
};

const validateStep3 = () => {
  if (isPaymentComplete.value) {
    confirmOrder();
  } else {
    alert("Por favor, complete o pagamento antes de confirmar o pedido.");
  }
};

const nextStep = () => {
  currentStep.value++;
};

const prevStep = () => {
  currentStep.value--;
};

const addItemToOrder = (product) => {
  const existingItem = newDelivery.value.items.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.quantidade++;
  } else {
    newDelivery.value.items.push({ ...product, quantidade: 1 });
  }
};

const removeItem = (item) => {
  const index = newDelivery.value.items.findIndex((i) => i.id === item.id);
  if (index !== -1) {
    if (newDelivery.value.items[index].quantidade > 1) {
      newDelivery.value.items[index].quantidade--;
    } else {
      newDelivery.value.items.splice(index, 1);
    }
  }
};

const addPayment = () => {
  if (currentPayment.value.metodo && currentPayment.value.valor > 0) {
    newDelivery.value.pagamento.push({
      metodo: currentPayment.value.metodo,
      valor: Math.round(currentPayment.value.valor),
    });
    currentPayment.value = { metodo: "", valor: 0 };
  } else {
    alert("Por favor, selecione um método de pagamento e insira um valor válido.");
  }
};

const removePayment = (index) => {
  newDelivery.value.pagamento.splice(index, 1);
};

const confirmOrder = async () => {
  try {
    const restauranteId = localStorage.getItem("restaurante_id");
    const orderData = {
      restaurante: restauranteId,
      pessoa: {
        restaurante: restauranteId,
        ...newDelivery.value,
      },
      items: newDelivery.value.items.map((item) => ({
        id: item.id,
        qtd: item.quantidade,
      })),
      observacoes: newDelivery.value.observacoes,
      taxa_entrega: newDelivery.value.taxa_entrega,
      pagamento: newDelivery.value.pagamento,
      is_delivery: true,
      caixa: localStorage.getItem("caixa_aberto_id"),
    };

    const response = await api("entregas/", "POST", orderData);
    activeDeliveries.value.unshift(response);
    closeNewDeliveryModal();
    alert("Pedido confirmado com sucesso!");
  } catch (error) {
    console.error("Erro ao confirmar o pedido:", error);
    alert("Ocorreu um erro ao confirmar o pedido. Por favor, tente novamente.");
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case "Em Aberto":
      return "bg-yellow-500 text-white px-2 py-1 rounded";
    case "Preparando":
      return "bg-blue-500 text-white px-2 py-1 rounded";
    case "Pedido Pronto":
      return "bg-green-500 text-white px-2 py-1 rounded";
    case "Em Rota":
      return "bg-purple-500 text-white px-2 py-1 rounded";
    case "Entregue":
      return "bg-green-700 text-white px-2 py-1 rounded";
    case "Cancelado":
      return "bg-red-500 text-white px-2 py-1 rounded";
    default:
      return "bg-gray-500 text-white px-2 py-1 rounded";
  }
};

const viewOrderDetails = async (orderId) => {
  try {
    const response = await api(`entregas/${orderId}/detalhes/`);
    selectedOrder.value = response;
    showOrderDetailsModal.value = true;
  } catch (error) {
    console.error("Erro ao buscar detalhes do pedido:", error);
    alert("Ocorreu um erro ao buscar os detalhes do pedido. Por favor, tente novamente.");
  }
};

const closeOrderDetailsModal = () => {
  showOrderDetailsModal.value = false;
};

const cancelOrder = async (orderId) => {
  try {
    await api(`entregas/${orderId}/cancelar/`, "POST");
    const orderIndex = activeDeliveries.value.findIndex((order) => order.id === orderId);
    if (orderIndex !== -1) {
      activeDeliveries.value[orderIndex].status = "Cancelado";
    }
    alert("Pedido cancelado com sucesso!");
  } catch (error) {
    console.error("Erro ao cancelar o pedido:", error);
    alert("Ocorreu um erro ao cancelar o pedido. Por favor, tente novamente.");
  }
};

const updateOrderStatus = async (pedido) => {
  try {
    await api(`pedidos/${pedido.id}/`, "PATCH", { status: pedido.status });
    alert("Status do pedido atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar o status do pedido:", error);
    alert("Ocorreu um erro ao atualizar o status do pedido. Por favor, tente novamente.");
    // Revert the status change in the UI if the API call fails
    pedido.status = pedido.status;
  }
};

const syncOrders = (platform) => {
  console.log("Sincronizando pedidos de:", platform);
  // Implementação futura para sincronização com plataformas de entrega
};

onMounted(async () => {
  try {
    const restauranteId = localStorage.getItem("restaurante_id");
    const [deliveriesResponse, clientsResponse, productsResponse] = await Promise.all([
      api(`entregas/?restaurante_id=${restauranteId}`),
      api(`entregas/clientes/?restaurante_id=${restauranteId}`),
      api(`entregas/produtos/?restaurante_id=${restauranteId}`),
    ]);

    activeDeliveries.value = deliveriesResponse.filter(
      (item) => item.caixa == localStorage.getItem("caixa_aberto_id")
    );
    clients.value = clientsResponse;
    products.value = productsResponse;
  } catch (error) {
    console.error("Erro ao carregar dados iniciais:", error);
    alert(
      "Ocorreu um erro ao carregar os dados iniciais. Por favor, recarregue a página."
    );
  }
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
