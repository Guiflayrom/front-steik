<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 font-sans">
    <div class="container mx-auto px-4 py-8">
      <h1
        class="text-4xl font-bold mb-8 text-center font-display mt-15 sm:mt-0"
      >
        Cardápio
      </h1>

      <!-- Filtering and Sorting Options -->
      <div class="mb-8 flex flex-wrap justify-between items-center">
        <div class="flex space-x-4 mb-4 sm:mb-0">
          <button
            @click="toggleView"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
            v-if="!mobile"
          >
            <i
              :class="isGridView ? 'mdi mdi-view-list' : 'mdi mdi-view-grid'"
            ></i>
            {{ isGridView ? "Visualização em Lista" : "Visualização em Grade" }}
          </button>
          <select
            v-model="selectedCategory"
            class="bg-gray-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Todas as Categorias</option>
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>
        <div class="flex space-x-4">
          <select
            v-model="sortOption"
            class="bg-gray-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="nome">Ordenar por Nome</option>
            <option value="valor">Ordenar por Preço</option>
            <option value="rating">Ordenar por Avaliação</option>
          </select>
          <button
            @click="toggleFavorites"
            class="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
          >
            <i class="mdi mdi-heart"></i>
            {{ showFavorites ? "Todos" : "Favoritos" }}
          </button>
        </div>
      </div>

      <!-- No Favorites Message -->
      <div
        v-if="showFavorites && !hasFavoritesInView"
        class="text-center text-gray-400 my-8"
      >
        <i class="mdi mdi-heart-broken text-6xl mb-4"></i>
        <p class="text-xl">
          Nenhum item favorito encontrado
          {{ selectedCategory ? "nesta categoria" : "" }}.
        </p>
        <p class="mt-2">
          Adicione itens aos favoritos ou selecione outra categoria.
        </p>
      </div>

      <!-- Menu Items -->
      <div
        v-else
        :class="{
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8': isGridView,
          'space-y-8': !isGridView,
        }"
      >
        <div
          v-for="item in filteredAndSortedItems"
          :key="item.id"
          class="flip-card"
          :class="{ 'h-[400px]': isGridView, 'h-[200px]': !isGridView }"
          @mouseenter="playHoverSound"
        >
          <div
            class="flip-card-inner"
            :class="{ 'is-flipped': item.isFlipped }"
          >
            <!-- Front of the card -->
            <div
              class="flip-card-front bg-gray-800 rounded-lg shadow-lg overflow-hidden relative"
            >
              <button
                @click.stop="flipCard(item)"
                class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 transition duration-300 ease-in-out z-10"
              >
                <i class="mdi mdi-flip-to-back"></i>
              </button>
              <button
                @click.stop="toggleFavorite(item)"
                class="absolute top-2 left-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 transition duration-300 ease-in-out z-10"
              >
                <i
                  :class="
                    item.isFavorite
                      ? 'mdi mdi-heart text-pink-500'
                      : 'mdi mdi-heart-outline'
                  "
                ></i>
              </button>
              <img
                :src="item.imagem"
                :alt="item.nome"
                class="w-full h-48 object-cover"
              />
              <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="text-xl font-semibold">{{ item.nome }}</h3>
                  <div class="flex items-center">
                    <span class="text-yellow-400 mr-1">{{
                      item.rating.toFixed(1)
                    }}</span>
                    <i class="mdi mdi-star text-yellow-400"></i>
                  </div>
                </div>
                <p class="text-gray-400 mb-4">{{ item.descricao }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-2xl font-bold text-green-500"
                    >R$ {{ item.valor.toFixed(2) }}</span
                  >
                  <button
                    @click.stop="addToCartWithAnimation(item, $event)"
                    class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
                  >
                    <i class="mdi mdi-cart-plus mr-2"></i>Adicionar
                  </button>
                </div>
              </div>
            </div>

            <!-- Back of the card -->
            <div
              class="flip-card-back bg-gray-800 rounded-lg shadow-lg overflow-hidden p-4 relative flex flex-col"
            >
              <button
                @click.stop="flipCard(item)"
                class="absolute top-2 left-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 transition duration-300 ease-in-out"
              >
                <i class="mdi mdi-flip-to-front"></i>
              </button>
              <button
                @click.stop="toggleFavorite(item)"
                class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 transition duration-300 ease-in-out z-10"
              >
                <i
                  :class="
                    item.isFavorite
                      ? 'mdi mdi-heart text-pink-500'
                      : 'mdi mdi-heart-outline'
                  "
                ></i>
              </button>

              <h3 class="text-xl font-semibold mb-4">{{ item.nome }}</h3>

              <div class="flex-grow overflow-y-auto">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <h4 class="font-semibold mb-2 flex items-center">
                      <i class="mdi mdi-food-variant mr-2 text-blue-400"></i
                      >Ingredientes
                    </h4>
                    <ul class="text-sm">
                      <li
                        v-for="ingredient in item.ingredientes"
                        :key="ingredient"
                        class="mb-1"
                      >
                        {{ ingredient }}
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 class="font-semibold mb-2 flex items-center">
                      <i class="mdi mdi-scale-bathroom mr-2 text-green-400"></i
                      >Info Nutricional
                    </h4>
                    <ul class="text-sm">
                      <li class="flex justify-between mb-1">
                        <span>Calorias:</span>
                        <span>{{ item.calorias || "N/A" }}</span>
                      </li>
                      <li class="flex justify-between mb-1">
                        <span>Proteínas:</span>
                        <span>{{ item.proteinas || "N/A" }}g</span>
                      </li>
                      <li class="flex justify-between mb-1">
                        <span>Carboidratos:</span>
                        <span>{{ item.carboidratos || "N/A" }}g</span>
                      </li>
                      <li class="flex justify-between mb-1">
                        <span>Gorduras:</span>
                        <span>{{ item.gorduras || "N/A" }}g</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="mt-4">
                  <h4 class="font-semibold mb-2 flex items-center">
                    <i class="mdi mdi-alert-circle mr-2 text-yellow-400"></i
                    >Alergênicos
                  </h4>
                  <p class="text-sm">
                    {{ item.alergenicos || "Nenhum alergênico conhecido" }}
                  </p>
                </div>
              </div>

              <div class="mt-4 pt-2 border-t border-gray-700">
                <button
                  @click.stop="addToCartWithAnimation(item, $event)"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
                >
                  <i class="mdi mdi-cart-plus mr-2"></i>Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Cart and Orders Buttons -->
      <div class="fixed top-4 right-4 flex space-x-4">
        <button
          @click="toggleOrders"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out relative"
        >
          <i class="mdi mdi-clipboard-text mr-2"></i>
          Pedidos
          <span
            class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center"
          >
            {{ orders.length }}
          </span>
        </button>
        <button
          @click="toggleCart"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out relative"
        >
          <i class="mdi mdi-cart mr-2"></i>
          Carrinho
          <span
            class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center cart-count"
          >
            {{ cartItemCount }}
          </span>
        </button>
      </div>

      <!-- Cart Modal -->
      <div
        v-if="showCart"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
          <h2 class="text-2xl font-bold mb-4">Seu Carrinho</h2>
          <div v-if="cart.length === 0" class="text-center text-gray-400 my-4">
            Seu carrinho está vazio.
          </div>
          <ul v-else class="space-y-4 mb-4">
            <li
              v-for="item in cart"
              :key="item.id"
              class="flex justify-between items-center border-b border-gray-700 pb-2"
            >
              <div>
                <h3 class="font-semibold">{{ item.nome }}</h3>
                <p class="text-sm text-gray-400">Quantidade: {{ item.qtd }}</p>
                <div class="flex items-center mt-2">
                  <button
                    @click="decreaseQuantity(item)"
                    class="text-gray-400 hover:text-white"
                  >
                    <i class="mdi mdi-minus-circle"></i>
                  </button>
                  <span class="mx-2">{{ item.qtd }}</span>
                  <button
                    @click="increaseQuantity(item)"
                    class="text-gray-400 hover:text-white"
                  >
                    <i class="mdi mdi-plus-circle"></i>
                  </button>
                </div>
              </div>
              <div class="flex items-center">
                <span class="mr-4"
                  >R$ {{ (item.valor * item.qtd).toFixed(2) }}</span
                >
                <button
                  @click="removeFromCart(item)"
                  class="text-red-500 hover:text-red-600"
                >
                  <i class="mdi mdi-delete"></i>
                </button>
              </div>
            </li>
          </ul>
          <div
            v-if="cart.length > 0"
            class="border-t border-gray-700 pt-4 mb-4"
          >
            <div class="flex justify-between items-center font-bold">
              <span>Total:</span>
              <span>R$ {{ cartTotal.toFixed(2) }}</span>
            </div>
          </div>
          <div class="flex justify-end space-x-4">
            <button
              @click="toggleCart"
              class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Continuar Comprando
            </button>
            <button
              v-if="cart.length > 0"
              @click="startOrderProcess"
              class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Finalizar Pedido
            </button>
          </div>
        </div>
      </div>

      <!-- Table Selection Modal -->

      <div
        v-if="showTableSelection"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <h2 class="text-2xl font-bold mb-4">Selecione uma Mesa</h2>
          <div v-if="isLoadingTables" class="text-center py-4">
            <i class="mdi mdi-loading mdi-spin text-4xl"></i>
            <p class="mt-2">Carregando mesas disponíveis...</p>
          </div>
          <div
            v-else-if="availableTables.length === 0"
            class="text-center py-4"
          >
            <p>
              Não há mesas disponíveis no momento. Por favor, tente novamente
              mais tarde.
            </p>
          </div>
          <div v-else class="grid grid-cols-3 gap-4 mb-4">
            <button
              v-for="table in availableTables"
              :key="table.id"
              @click="selectTable(table)"
              class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
              :class="{ 'ring-2 ring-blue-500': selectedTable === table }"
            >
              {{ table.numero_mesa }}
            </button>
          </div>
          <div class="flex justify-end space-x-4">
            <button
              @click="cancelTableSelection"
              class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Cancelar
            </button>
            <button
              @click="confirmTableSelection"
              class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
              :disabled="!selectedTable"
            >
              Confirmar Mesa
            </button>
          </div>
        </div>
      </div>

      <!-- Order Confirmation Modal -->
      <div
        v-if="showOrderConfirm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md text-center">
          <h2 class="text-2xl font-bold mb-4">Pedido Confirmado</h2>
          <p class="text-xl mb-4">Seu código de pedido é:</p>
          <p class="text-3xl font-bold text-green-500 mb-6">
            {{ currentOrderCode }}
          </p>
          <p class="mb-2">Mesa selecionada: {{ selectedTable?.numero_mesa }}</p>
          <p class="mb-6">Um garçom virá atendê-lo em breve.</p>
          <button
            @click="closeOrderConfirmation"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Fechar
          </button>
        </div>
      </div>

      <!-- Orders Modal -->
      <div
        v-if="showOrders"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div
          class="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
        >
          <h2 class="text-2xl font-bold mb-4">Seus Pedidos</h2>
          <div
            v-if="orders.length === 0"
            class="text-center text-gray-400 my-4"
          >
            Você ainda não fez nenhum pedido.
          </div>
          <div v-else class="space-y-6">
            <div
              v-for="order in orders"
              :key="order.code"
              class="bg-gray-700 rounded-lg p-4"
            >
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-xl font-semibold">
                  Pedido #{{ order.codigo }}
                </h3>
                <span
                  :class="{
                    'text-yellow-500': order.status === 'Pendente',
                    'text-blue-500': order.status === 'Em preparo',
                    'text-green-500': order.status === 'Pronto',
                    'text-gray-500': order.status === 'Entregue',
                  }"
                  >{{ order.status }}</span
                >
              </div>
              <p class="text-sm text-gray-400 mb-2">Mesa: {{ order.table }}</p>
              <ul class="mb-2">
                <li
                  v-for="item in order.items"
                  :key="item.id"
                  class="flex justify-between"
                >
                  <span>{{ item.nome }} x{{ item.qtd }}</span>
                  <span>R$ {{ (item.valor * item.qtd).toFixed(2) }}</span>
                </li>
              </ul>
              <div class="flex justify-between font-bold">
                <span>Total:</span>
                <span>R$ {{ order.total }}</span>
              </div>
            </div>
          </div>
          <div class="mt-6 text-center">
            <button
              @click="toggleOrders"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      <!-- Fly to Cart Animation Element -->
      <div
        v-if="showFlyAnimation"
        class="fly-to-cart-item"
        :style="flyAnimationStyles"
      >
        <i class="mdi mdi-cart-plus text-2xl text-white"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "~/api";
import { useDisplay } from "vuetify";

const { mobile } = useDisplay();

// Menu items data
const menuItems = ref([]);

// State variables
const isGridView = ref(true);
const selectedCategory = ref("");
const sortOption = ref("nome");
const showFavorites = ref(false);
const cart = ref([]);
const showCart = ref(false);
const showFlyAnimation = ref(false);
const flyAnimationStyles = ref({});
const orders = ref([]);
const showOrders = ref(false);
const showOrderConfirm = ref(false);
const currentOrderCode = ref("");

// New state variables for table selection
const showTableSelection = ref(false);
const availableTables = ref([]);
const selectedTable = ref(null);
const isLoadingTables = ref(false);

// Audio elements
let hoverSound;
let addToCartSound;

// Computed properties
const categories = computed(() => {
  return [...new Set(menuItems.value.map((item) => item.categoria_nome))];
});

const filteredAndSortedItems = computed(() => {
  let items = menuItems.value;

  if (showFavorites.value) {
    items = items.filter((item) => item.isFavorite);
  }

  if (selectedCategory.value) {
    items = items.filter(
      (item) => item.categoria_nome === selectedCategory.value
    );
  }

  items = items.sort((a, b) => {
    if (sortOption.value === "nome") {
      return a.nome.localeCompare(b.nome);
    } else if (sortOption.value === "valor") {
      return a.valor - b.valor;
    } else if (sortOption.value === "rating") {
      return b.rating - a.rating;
    }
  });

  return items;
});

const cartItemCount = computed(() => {
  return cart.value.reduce((total, item) => total + item.qtd, 0);
});

const cartTotal = computed(() => {
  return cart.value.reduce((total, item) => total + item.valor * item.qtd, 0);
});

const hasFavoritesInView = computed(() => {
  return filteredAndSortedItems.value.length > 0;
});

// Methods
const toggleView = () => {
  isGridView.value = !isGridView.value;
};

const toggleFavorites = () => {
  showFavorites.value = !showFavorites.value;
};

const toggleFavorite = (item) => {
  item.isFavorite = !item.isFavorite;
};

const flipCard = (item) => {
  item.isFlipped = !item.isFlipped;
};

const route = useRoute();
const restauranteId = route.params.id;

const addToCartWithAnimation = (item, event) => {
  // Get the position of the clicked button
  const rect = event.target.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  // Get the position of the cart button
  const cartButton = document.querySelector(
    ".fixed.top-4.right-4 button:last-child"
  );
  const cartRect = cartButton.getBoundingClientRect();
  const endX = cartRect.left + cartRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2;

  // Set up the animation
  flyAnimationStyles.value = {
    left: `${startX}px`,
    top: `${startY}px`,
    transform: `translate(-50%, -50%) scale(1)`,
  };
  showFlyAnimation.value = true;

  // Start the animation
  setTimeout(() => {
    flyAnimationStyles.value = {
      left: `${endX}px`,
      top: `${endY}px`,
      transform: `translate(-50%, -50%) scale(0.5)`,
    };
  }, 50);

  // End the animation and add item to cart
  setTimeout(() => {
    showFlyAnimation.value = false;
    addToCart(item);
  }, 500);
};

const addToCart = (item) => {
  const existingItem = cart.value.find((cartItem) => cartItem.id === item.id);
  if (existingItem) {
    existingItem.qtd++;
  } else {
    cart.value.push({ ...item, qtd: 1 });
  }
  addToCartSound.play();

  // Animate cart count
  const cartCount = document.querySelector(".cart-count");
  cartCount.classList.add("scale-up");
  setTimeout(() => {
    cartCount.classList.remove("scale-up");
  }, 300);
};

const removeFromCart = (item) => {
  const index = cart.value.findIndex((cartItem) => cartItem.id === item.id);
  if (index !== -1) {
    cart.value.splice(index, 1);
  }
};

const toggleCart = () => {
  showCart.value = !showCart.value;
};

const toggleOrders = () => {
  showOrders.value = !showOrders.value;
};

const playHoverSound = () => {
  hoverSound.play();
};

const increaseQuantity = (item) => {
  item.qtd++;
};

const decreaseQuantity = (item) => {
  if (item.qtd > 1) {
    item.qtd--;
  } else {
    removeFromCart(item);
  }
};

const startOrderProcess = async () => {
  showCart.value = false;
  isLoadingTables.value = true;
  showTableSelection.value = true;

  try {
    const response = await api(`mesas/`);
    availableTables.value = response.filter(
      (table) =>
        table.status == "Disponível" && table.restaurante == restauranteId
    );
  } catch (error) {
    console.error("Erro ao buscar mesas disponíveis:", error);
    availableTables.value = [];
  } finally {
    isLoadingTables.value = false;
  }
};

const selectTable = (table) => {
  selectedTable.value = table;
};

const cancelTableSelection = () => {
  showTableSelection.value = false;
  selectedTable.value = null;
};

const confirmTableSelection = () => {
  if (selectedTable.value) {
    showTableSelection.value = false;
    showOrderConfirmation();
  }
};

const showOrderConfirmation = () => {
  currentOrderCode.value = generateOrderCode();
  const newOrder = {
    codigo: currentOrderCode.value,
    items: [...cart.value],
    total: cartTotal.value,
    status: "Em Confirmacao",
    mesa: selectedTable.value.numero_mesa,
    restaurante: restauranteId,
  };
  api("pedidos/", "POST", newOrder).then((res) => {
    api(`restaurantes/${restauranteId}/notificacoes/`, "POST", {
      restaurante: restauranteId,
      titulo: "Novo pedido",
      texto: `Um cliente fez um pedido na mesa ${selectedTable.value.numero_mesa}, código: ${currentOrderCode.value}`,
      status: "aviso",
    });
  });

  orders.value.push(newOrder);
  showOrderConfirm.value = true;
};

const closeOrderConfirmation = () => {
  showOrderConfirm.value = false;
  cart.value = []; // Clear the cart
  selectedTable.value = null;
};

const generateOrderCode = () => {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
};

onMounted(async () => {
  try {
    const response = await api(`restaurantes/${restauranteId}/pratos/`);
    menuItems.value = response.map((item) => ({
      ...item,
      isFavorite: false,
      isFlipped: false,
      ingredientes: item.ingredientes ? item.ingredientes.split(",") : [],
      rating: 4.5, // Default rating since it's not provided by the API
    }));
  } catch (error) {
    console.error("Erro ao buscar itens do menu:", error);
  }

  hoverSound = new Audio("/path/to/hover-sound.mp3");
  addToCartSound = new Audio("/path/to/add-to-cart-sound.mp3");

  // Load favorites from localStorage
  const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  menuItems.value.forEach((item) => {
    item.isFavorite = savedFavorites.includes(item.id);
  });

  // Load orders from localStorage
  const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
  orders.value = savedOrders;

  // Simulating order status changes (you can replace this with real-time updates from a backend)
  setInterval(() => {
    orders.value = orders.value.map((order) => {
      if (order.status === "Pendente") {
        order.status = "Em preparo";
      } else if (order.status === "Em preparo") {
        order.status = "Pronto";
      } else if (order.status === "Pronto") {
        order.status = "Entregue";
      }
      return order;
    });
  }, 30000); // Update every 30 seconds

  if (mobile) {
    isGridView.value = true;
  }
});

// Watch for changes in favorites and save to localStorage
watch(
  menuItems,
  (newMenuItems) => {
    const favoritesToSave = newMenuItems
      .filter((item) => item.isFavorite)
      .map((item) => item.id);
    localStorage.setItem("favorites", JSON.stringify(favoritesToSave));
  },
  { deep: true }
);

// Watch for changes in orders and save to localStorage
watch(
  orders,
  (newOrders) => {
    localStorage.setItem("orders", JSON.stringify(newOrders));
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

.flip-card {
  perspective: 1000px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.flip-card-inner.is-flipped {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateY(180deg);
}

.flip-card-back {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.flip-card-back::-webkit-scrollbar {
  width: 6px;
}

.flip-card-back::-webkit-scrollbar-track {
  background: transparent;
}

.flip-card-back::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.fly-to-cart-item {
  position: fixed;
  z-index: 9999;
  transition: all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.cart-count {
  transition: transform 0.3s ease-in-out;
}

.cart-count.scale-up {
  transform: scale(1.5);
}

@media (prefers-reduced-motion: reduce) {
  .fly-to-cart-item {
    display: none;
  }

  .cart-count {
    transition: none;
  }
}
</style>
