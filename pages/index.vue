<template>
  <NuxtLayout>
    <vContainer>
      <VRow>
        <VCol cols="12">
          <VCard color="black">
            <div class="pa-3">
              <div>Bem vindo ao seu restaurante!</div>
              <div class="font-bold text-1xl">Steik Tatuapé</div>
            </div>
          </VCard></VCol
        >
        <VCol cols="12">
          <div class="d-flex">
            <PainelCardInfo
              title="Pedidos"
              :value="pedidos.length.toString()"
              icon="mdi-list-status"
              color=""
            ></PainelCardInfo>
            <PainelCardInfo
              title="Concluídos"
              color=""
              :value="
                pedidos
                  .filter((item) => item.status == 'Fechado')
                  .length.toString()
              "
              icon="mdi-book-check"
            ></PainelCardInfo>
            <PainelCardInfo
              title="Em aberto"
              color=""
              :value="
                pedidos
                  .filter((item) => item.status == 'Em Aberto')
                  .length.toString()
              "
              icon="mdi-silverware-fork-knife"
            ></PainelCardInfo>
            <PainelCardInfo
              title="Em aberto"
              :value="
                'R$' +
                pedidos
                  .filter((item) => item.status == 'Em Aberto')
                  .map((item) => item.total_pratos)
                  .reduce(
                    (acumulador, valorAtual) => acumulador + valorAtual,
                    0,
                  )
                  .toString()
              "
              icon="mdi-cash-lock"
              color="orange"
            ></PainelCardInfo>
            <PainelCardInfo
              title="Fechado"
              :value="
                'R$' +
                pedidos
                  .filter((item) => item.status == 'Fechado')
                  .map((item) => item.total_pratos)
                  .reduce(
                    (acumulador, valorAtual) => acumulador + valorAtual,
                    0,
                  )
                  .toString()
              "
              icon="mdi-cash-check"
              color="lightgreen"
            ></PainelCardInfo>
            <VCard
              height="150px"
              width="150px"
              align="end"
              color="black"
              class="ml-auto d-flex align-center justify-center cursor-pointer"
            >
              <VIcon @click="dialog_fazer_pedido = true" size="128"
                >mdi-plus</VIcon
              >
            </VCard>
          </div>
        </VCol>
        <VCol cols="12">
          <VCard height="400px" color="black" class="pa-4">
            <VRow class="h-full">
              <VCol>
                <div align="center" class="font-semibold text-2xl mb-5">
                  Mesas disponiveis
                </div>
                <v-table height="260px" class="bg-black">
                  <thead>
                    <tr>
                      <th
                        class="bg-blue-darken-2 text-center"
                        v-for="(column, index) in ['Número da Mesa', 'Lugares']"
                        :key="index"
                      >
                        {{ column }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in mesas"
                      :key="item.numero_mesa"
                      class="bg-black text-center"
                    >
                      <td>{{ item.numero_mesa }}</td>
                      <td>{{ item.lugares }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </VCol>
              <VCol class="flex flex-col justify-between">
                <div align="center" class="font-semibold text-2xl mb-5">
                  Pedidos do dia
                </div>
                <v-table height="260px" class="bg-black">
                  <thead>
                    <tr>
                      <th
                        class="bg-blue-darken-2 text-center"
                        v-for="(column, index) in [
                          'Número da Mesa',
                          'Cliente',
                          'Horário do pedido',
                          'Status',
                        ]"
                        :key="index"
                      >
                        {{ column }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in filteredItems"
                      :key="item.id"
                      class="bg-black text-center"
                    >
                      <td>{{ item.mesa }}</td>
                      <td>{{ item.nome_cliente }}</td>
                      <td>{{ item.horario_pedido }}</td>
                      <td>
                        <VChip
                          variant="elevated"
                          :color="
                            item.status == 'Em Aberto' ? 'warning' : 'green'
                          "
                          @click="changeStatus(item)"
                        >
                          {{ item.status }}
                        </VChip>
                      </td>
                    </tr>
                  </tbody>
                </v-table>

                <div>
                  <VTextField
                    v-model="search_pedidos"
                    placeholder="Pesquise por mesa, clientes, pedidos, horário, status..."
                  />
                </div>
              </VCol>
            </VRow>
          </VCard>
        </VCol>
      </VRow>
      <VDialog
        v-model="dialog_fazer_pedido"
        scrollable
        persistent
        :overlay="false"
        max-width="600px"
        transition="dialog-transition"
      >
        <VCard color="#96A1AD">
          <VCard color="#14181B" class="ma-5">
            <div class="d-flex my-5">
              <div class="text-4xl ml-10">Novo pedido</div>
              <div class="text-4xl ml-auto mr-10">
                <VIcon class="cursor-pointer" @click="fecharDialog()"
                  >mdi-close</VIcon
                >
              </div>
            </div>
          </VCard>
          <VCard color="#14181B" height="300" class="ma-5 pa-5 overflow-y-auto">
            <VTextField
              v-model="form_pedido.nome_cliente"
              label="Nome do cliente"
              variant="outlined"
            />
            <VSelect
              :items="mesas.map((item) => item.numero_mesa)"
              v-model="form_pedido.mesa"
              variant="outlined"
              label="Mesa"
            ></VSelect>
            <div>Pratos</div>
            <div class="mb-5">
              <v-list
                style="background-color: #14181b; color: white"
                class="rounded-xl"
                :items="form_pedido.pratos_obj?.map((item) => item.nome)"
              ></v-list>
            </div>
          </VCard>
          <VCard color="#14181B" class="ma-5 px-3 pt-3" align="center">
            <div class="d-flex">
              <VTextField
                v-model="prato"
                label="Número do prato"
                variant="underlined"
              />
              <VIcon
                class="mt-4 cursor-pointer ml-10"
                size="36"
                @click="addPrato()"
                >mdi-plus</VIcon
              >
            </div>
          </VCard>
          <VCard color="#14181B" class="ma-5 pa-5" align="center">
            <VRow>
              <VCol
                ><VBtn color="error" @click="fecharDialog()"
                  >Cancelar</VBtn
                ></VCol
              >
              <VCol
                ><VBtn color="primary" @click="fazerPedido()"
                  >Fazer pedido</VBtn
                ></VCol
              >
            </VRow>
          </VCard>
        </VCard>
      </VDialog>
    </vContainer>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";

const search_pedidos = ref("");
const prato = ref("");

const form_pedido = ref({
  nome_cliente: "",
  mesa: "",
  pratos_obj: [],
});

const dialog_fazer_pedido = ref(false);

const mesas = ref([]);

const pedidos = ref([]);

function addPrato() {
  form_pedido.value.pratos_obj.push({
    nome: `Prato ${prato.value}`,
  });
  prato.value = "";
}

const filteredItems = computed(() => {
  return pedidos.value.filter((item) => {
    return (
      item.id
        .toString()
        .toLowerCase()
        .includes(search_pedidos.value.toLowerCase()) ||
      item.status.toLowerCase().includes(search_pedidos.value.toLowerCase()) ||
      item.cliente.toLowerCase().includes(search_pedidos.value.toLowerCase()) ||
      item.horario_pedido
        .toLowerCase()
        .includes(search_pedidos.value.toLowerCase())
    );
  });
});

function fecharDialog() {
  form_pedido.value = {
    nome_cliente: "",
    mesa: "",
    pratos_obj: [],
  };
  prato.value = "";
  dialog_fazer_pedido.value = false;
}

function changeStatus(obj) {
  pedidos.value.find((item) => item.id == obj.id).status =
    pedidos.value.find((item) => item.id == obj.id).status == "Fechado"
      ? "Em Aberto"
      : "Fechado";
}

function fazerPedido() {
  console.log(form_pedido.value);

  $fetch("https://steik.ngrok.app/api/pedidos/", {
    method: "POST",
    body: form_pedido.value,
  }).then((res) => {
    $fetch("https://steik.ngrok.app/api/pedidos/", {
      method: "GET",
    }).then((res) => {
      pedidos.value = res;
    });
  });

  fecharDialog();
}

onBeforeMount(() => {
  $fetch("https://steik.ngrok.app/api/pedidos/", {
    method: "GET",
  }).then((res) => {
    pedidos.value = res;
    console.log(res);
  });

  $fetch("https://steik.ngrok.app/api/mesas/", {
    method: "GET",
  }).then((res) => {
    mesas.value = res;
  });
});

definePageMeta({
  layout: "costumer",
});
</script>
