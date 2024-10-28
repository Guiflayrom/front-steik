<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-1000',
      { '-translate-x-full': !isDrawerOpen },
    ]"
  >
    <div class="p-6">
      <h1 class="text-2xl font-bold font-display mb-6">Steik SBS</h1>
      <nav>
        <ul class="space-y-2">
          <li v-for="module in modules" :key="module.name">
            <button
              @click="$emit('moduleChange', module.name)"
              :class="[
                'w-full text-left py-2 px-4 rounded',
                currentModule === module.name
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700',
              ]"
            >
              <i :class="['mdi', module.icon, 'mr-2']"></i>{{ module.label }}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  isDrawerOpen: Boolean,
  currentModule: String,
});

const modules = [
  { name: "POSModule", label: "Ponto de Venda", icon: "mdi-cash-register" },
  { name: "CashManagementModule", label: "Gestão de Caixa", icon: "mdi-cash" },
  {
    name: "DeliveryManagementModule",
    label: "Gestão de Entregas",
    icon: "mdi-truck-delivery",
  },
  {
    name: "TableManagementModule",
    label: "Gestão de Mesas",
    icon: "mdi-table-furniture",
  },
];
</script>
