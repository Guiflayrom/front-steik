<template>
  <VLayout>
    <v-container>
      <!-- Seção do Cabeçalho -->
      <v-row class="justify-center mt-4">
        <v-col cols="12" class="text-center">
          <!-- Logo do restaurante -->
          <v-img
            src="https://i.imgur.com/4PpSNEs_d.webp?maxwidth=1520&fidelity=grand"
            alt="Steakhouse Logo"
            max-width="400"
          ></v-img>
        </v-col>
      </v-row>

      <!-- Seção da Tabela de Pedidos -->
      <v-row v-if="nav == 0">
        <v-col cols="12">
          <div
            class="text-5xl mb-2 text-center"
            align="center"
            style="color: white"
          >
            Mesas
          </div>
          <v-card class="pa-4" color="black">
            <v-table height="600px" class="bg-black">
              <thead>
                <tr>
                  <th
                    class="bg-black-darken-2 text-center"
                    v-for="(column, index) in ['Mesa', 'Lugares', 'Pedir']"
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
                  <td>
                    <VBtn color="info" @click="dialog_fazer_pedido = true"
                      >Pedir</VBtn
                    >
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="nav == 1">
        <v-col cols="12">
          <div
            class="text-5xl mb-2 text-center"
            align="center"
            style="color: white"
          >
            Pedidos
          </div>
        </v-col>
        <v-col cols="12">
          <v-card class="pa-4" color="black">
            <v-table height="260px" class="bg-black">
              <thead>
                <tr>
                  <th
                    class="bg-blue-black-2 text-center"
                    v-for="(column, index) in [
                      'Mesa',
                      'Cliente',
                      'Horário',
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
                      :color="item.status == 'Em Aberto' ? 'warning' : 'green'"
                      @click="changeStatus(item)"
                    >
                      {{ item.status }}
                    </VChip>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
      <!-- Menu de Navegação Inferior -->
      <v-bottom-navigation
        v-model="nav"
        class="bg-black"
        color="white"
        grow
        dark
      >
        <v-btn>
          <v-icon>mdi-chair-school</v-icon>
        </v-btn>
        <v-btn>
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn>
          <v-icon>mdi-bell</v-icon>
        </v-btn>
        <v-btn>
          <v-icon>mdi-camera</v-icon>
        </v-btn>
      </v-bottom-navigation>
    </v-container>

    <VDialog
      v-model="dialog_fazer_pedido"
      scrollable
      persistent
      :overlay="false"
      max-width="600px"
      transition="dialog-transition"
    >
      <VCard elevation="10" color="#14161b">
        <VCard elevation="0" color="#14181B" class="ma-5">
          <div class="d-flex my-5">
            <div class="text-4xl ml-10">Novo pedido</div>
            <div class="text-4xl ml-auto mr-10">
              <VIcon class="cursor-pointer" @click="fecharDialog()"
                >mdi-close</VIcon
              >
            </div>
          </div>
        </VCard>
        <VCard
          elevation="0"
          color="#14181B"
          height="300"
          class="ma-5 pa-5 overflow-y-auto"
        >
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
        <VCard
          elevation="0"
          color="#14181B"
          class="ma-5 px-3 pt-3"
          align="center"
        >
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
        <VCard elevation="0" color="#14181B" class="ma-5 pa-5" align="center">
          <VRow>
            <VCol
              ><VBtn color="error" @click="fecharDialog()">Cancelar</VBtn></VCol
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
  </VLayout>
</template>

<script lang="ts" setup>
const nav = ref(0);

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
</script>

<style>
body {
  background-color: black;
}
</style>
