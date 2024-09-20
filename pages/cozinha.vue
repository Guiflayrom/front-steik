<template>
  <VLayout>
    <v-container align="center">
      <!-- Seção do Cabeçalho -->
      <v-row class="justify-center mt-4">
        <!-- Logo do restaurante -->
        <v-img
          aling="center"
          src="https://i.imgur.com/4PpSNEs_d.webp?maxwidth=1520&fidelity=grand"
          alt="Steakhouse Logo"
          max-width="400"
        ></v-img>
      </v-row>

      <v-row>
        <v-col cols="12">
          <div
            class="text-5xl mb-2 text-center"
            align="center"
            style="color: white"
          >
            Pedidos - Cozinha
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
                  v-for="item in pedidos"
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
                        item.status == 'Em Aberto'
                          ? 'warning'
                          : item.status == 'Preparando'
                            ? 'info'
                            : item.status == 'Pedido Pronto'
                              ? 'error'
                              : 'green'
                      "
                      @click="
                        dialog_status = true;
                        selected_pedido.value = { ...item };
                      "
                    >
                      {{ item.status }}
                    </VChip>
                  </td>
                  <td>
                    <VChip variant="elevated" @click="showPlate(item)">
                      Visualizar pratos
                    </VChip>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
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
            <v-autocomplete
              v-model="prato"
              :items="all_plates"
              label="Prato"
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
    <VDialog
      v-model="dialog_status"
      scrollable
      persistent
      :overlay="false"
      max-width="700px"
      transition="dialog-transition"
    >
      <VCard elevation="10" color="#14161b">
        <VCard elevation="0" color="#14181B" class="ma-5">
          <div class="d-flex my-5">
            <div class="text-4xl ml-10">Mudar de status</div>
            <div class="text-4xl ml-auto mr-10">
              <VIcon
                class="cursor-pointer"
                @click="dialog_status = !dialog_status"
                >mdi-close</VIcon
              >
            </div>
          </div>
        </VCard>
        <VCard elevation="0" color="#14181B" class="ma-5 pa-5 overflow-y-auto">
          <VRow>
            <VCol>
              <VBtn color="warning" @click="changeStatus('Em Aberto')"
                >Em Aberto</VBtn
              >
            </VCol>
            <VCol>
              <VBtn color="info" @click="changeStatus('Preparando')"
                >Preparando</VBtn
              >
            </VCol>
            <VCol>
              <VBtn color="error" @click="changeStatus('Pedido Pronto')"
                >Pedido Pronto</VBtn
              >
            </VCol>
            <VCol>
              <VBtn color="success" @click="changeStatus('Fechado')"
                >Fechado</VBtn
              >
            </VCol>
          </VRow>
        </VCard>
      </VCard>
    </VDialog>
    <VDialog
      v-model="dialog_plate"
      scrollable
      persistent
      :overlay="false"
      max-width="600px"
      transition="dialog-transition"
    >
      <VCard elevation="10" color="#14161b">
        <VCard elevation="0" color="#14181B" class="ma-5">
          <div class="d-flex my-5">
            <div class="text-4xl ml-10">Pratos</div>
            <div class="text-4xl ml-auto mr-10">
              <VIcon class="cursor-pointer" @click="dialog_plate = false"
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
          <div
            class="font-semibold text-4xl"
            v-for="(item, index) in plates_selected"
            :key="index"
          >
            - {{ item.prato.nome }} - Qtd: {{ item.quantidade }}
            <div class="mt-10"></div>
          </div>
        </VCard>
      </VCard>
    </VDialog>
  </VLayout>
</template>

<script setup>
onMounted(() => {
  setInterval(() => {
    $fetch("http://18.220.42.255:8000/api/pedidos/", {
      method: "GET",
    }).then((res) => {
      pedidos.value = res.filter(
        (item) => item.status == "Em Aberto" || item.status == "Preparando",
      );
    });
  }, 5000);
});
const dialog_status = ref(false);
const dialog_plate = ref(false);
const plates_selected = ref([]);

const prato = ref("");

const form_pedido = ref({
  nome_cliente: "",
  mesa: "",
  pratos_obj: [],
});

const dialog_fazer_pedido = ref(false);

const mesas = ref([]);

const pedidos = ref([]);

const selected_pedido = ref({});

const all_plates = ref([]);

function addPrato() {
  form_pedido.value.pratos_obj.push({
    nome: `Prato ${prato.value}`,
  });
  prato.value = "";
}

function showPlate(item) {
  plates_selected.value = item.pratos;
  dialog_plate.value = true;
}

function fecharDialog() {
  form_pedido.value = {
    nome_cliente: "",
    mesa: "",
    pratos_obj: [],
  };
  prato.value = "";
  dialog_fazer_pedido.value = false;
}

function changeStatus(status) {
  $fetch(
    `http://18.220.42.255:8000/api/pedidos/${selected_pedido.value.value.id}/`,
    {
      method: "PATCH",
      body: { status: status },
    },
  ).then(() => {
    $fetch("http://18.220.42.255:8000/api/pedidos/", {
      method: "GET",
    })
      .then((res) => {
        pedidos.value = res.filter(
          (item) => item.status == "Em Aberto" || item.status == "Preparando",
        );
      })
      .then(() => {
        $fetch("http://18.220.42.255:8000/api/notificacao/", {
          method: "POST",
          body: {
            texto: `Status pedido MESA ${selected_pedido.value.value.mesa} alterado para ${status.toUpperCase()}`,
          },
        });
      });
  });

  dialog_status.value = false;
}

function fazerPedido() {
  $fetch("http://18.220.42.255:8000/api/pedidos/", {
    method: "POST",
    body: form_pedido.value,
  }).then((res) => {
    $fetch("http://18.220.42.255:8000/api/pedidos/", {
      method: "GET",
    }).then((res) => {
      pedidos.value = res;
    });
  });

  fecharDialog();
}

onBeforeMount(() => {
  $fetch("http://18.220.42.255:8000/api/pedidos/", {
    method: "GET",
  }).then((res) => {
    pedidos.value = res.filter(
      (item) => item.status == "Em Aberto" || item.status == "Preparando",
    );
  });

  $fetch("http://18.220.42.255:8000/api/mesas/", {
    method: "GET",
  }).then((res) => {
    mesas.value = res;
  });

  $fetch("http://18.220.42.255:8000/api/pratos/", {
    method: "GET",
  }).then((res) => {
    all_plates.value = res.map((item) => item.nome);
  });
});
</script>

<style>
body {
  background-color: black;
}
</style>
