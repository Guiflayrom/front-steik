<template>
  <div>
    <h2 class="text-3xl font-bold font-display mb-6">Gestão de Caixa</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 class="text-xl font-semibold mb-4">Resumo de Vendas</h3>
        <div class="text-3xl font-bold text-green-400">{{ dailySales }}</div>
        <p class="text-gray-400">Total de hoje</p>
      </div>

      <div class="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 class="text-xl font-semibold mb-4">Métodos de Pagamento</h3>
        <div class="space-y-2">
          <div
            v-for="method in paymentBreakdown"
            :key="method.type"
            class="flex justify-between"
          >
            <span>{{ method.type }}:</span>
            <span>{{ method.amount }}</span>
          </div>
        </div>
      </div>
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 class="text-xl font-semibold mb-4">Ações</h3>
        <div class="space-y-2">
          <button
            @click="closeCashRegister"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
          >
            Fechar Caixa
          </button>
          <button
            @click="exportTransactions"
            class="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
          >
            Exportar Transações
          </button>
        </div>
      </div>
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 class="text-xl font-semibold mb-4">Sangrias</h3>
        <div class="text-3xl font-bold text-red-400">{{ sangria }}</div>
        <p class="text-gray-400">Total de hoje</p>
      </div>
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 class="text-xl font-semibold mb-4">Ranking Despesas</h3>
        <div class="space-y-2">
          <div
            v-for="method in rankingDespesas"
            :key="method.type"
            class="flex justify-between"
          >
            <span>{{ method.type }}:</span>
            <span>{{ method.amount }}</span>
          </div>
        </div>
      </div>
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 class="text-xl font-semibold mb-4">Dinheiro em caixa</h3>
        <div class="text-3xl font-bold text-green-400">{{ emCaixa }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import api from "~/api";

const dailySales = ref();
const emCaixa = ref();
const sangria = ref();
const paymentBreakdown = ref([]);
const rankingDespesas = ref([]);

function exportTransactions(restaurante_id, caixaId) {
  // Define a rota usando a função `api`
  const rota = `restaurantes/${localStorage.getItem(
    "restaurante_id"
  )}/caixa/${localStorage.getItem("caixa_aberto_id")}/detalhes/excel/`;

  // Faz a requisição diretamente usando fetch para garantir que a resposta seja tratada como blob
  fetch(`http://localhost:8000/api/v1/${rota}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${localStorage.getItem("access")}`, // caso use autenticação JWT
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }
      return response.blob(); // Converte a resposta para Blob
    })
    .then((blob) => {
      // Cria uma URL para o Blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Define o nome do arquivo para download
      link.download = `transacoes_restaurante_${restaurante_id}_caixa_${caixaId}.xlsx`;

      // Inicia o download chamando o `click()` diretamente
      link.click();

      // Libera a URL do Blob após o download
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("Erro ao baixar o arquivo:", error);
      alert("Não foi possível baixar o arquivo. Tente novamente mais tarde.");
    });
}

onMounted(() => {
  api(
    `restaurantes/${localStorage.getItem("restaurante_id")}/caixa/${localStorage.getItem(
      "caixa_aberto_id"
    )}/detalhes/`
  ).then((res) => {
    rankingDespesas.value = [
      { type: "Suprimentos", amount: res.ranking_despesas["Suprimentos"] },
      { type: "Manutenção", amount: res.ranking_despesas["Manutencao"] },
      { type: "Outros", amount: res.ranking_despesas["Outros"] },
    ];

    dailySales.value = res.total_faturado;
    sangria.value = res.total_despesas;
    emCaixa.value = res.total_em_caixa;

    paymentBreakdown.value = [
      { type: "Dinheiro", amount: res.pagamentos_por_metodo["Dinheiro"] },
      {
        type: "Cartão de Crédito",
        amount: res.pagamentos_por_metodo["Cartao Credito"],
      },
      {
        type: "Cartão de Débito",
        amount: res.pagamentos_por_metodo["Cartao Debito"],
      },
      {
        type: "Vale Refeição",
        amount: res.pagamentos_por_metodo["Vale Refeicao"],
      },
    ];
  });
});

const closeCashRegister = () => {
  const dataHoraAtual = new Date().toISOString();
  api(`caixas/${localStorage.getItem("caixa_aberto_id")}/`, "PATCH", {
    fechado_em: dataHoraAtual,
  }).then((_) => {
    console.log("Caixa fechado");
    navigateTo("/");
  });
};
</script>
