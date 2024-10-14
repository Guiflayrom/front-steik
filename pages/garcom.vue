<template>
  <VLayout>
    <LoginDialog></LoginDialog>
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
                    <VBtn
                      color="info"
                      @click="
                        dialog_fazer_pedido = true;
                        form_pedido.mesa = item.numero_mesa;
                      "
                    >
                      Pedir
                    </VBtn>
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
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
      <VRow v-if="nav == 2">
        <v-col cols="12">
          <div
            class="text-5xl mb-2 text-center"
            align="center"
            style="color: white"
          >
            Notificações
          </div>
        </v-col>
        <v-col cols="12">
          <div
            class="text-white"
            v-for="(item, index) in notificacoes"
            :key="index"
          >
            <VRow>
              <VCol cols="8">
                <div>
                  {{ item.texto }}
                </div>
              </VCol>
              <VCol>
                <v-btn color="info" @click="viewNotificacao(item.id)">OK</v-btn>
              </VCol>
            </VRow>
          </div>
        </v-col>
      </VRow>

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
          <div class="text-xl text-red-500">
            {{ notificacoes.length ? notificacoes.length : "" }}
          </div>
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
              :items="
                form_pedido.pratos_obj?.map(
                  (item) => `(${item.quantidade}) - ${item.nome}`
                )
              "
            ></v-list>
          </div>
        </VCard>
        <VCard
          elevation="0"
          color="#14181B"
          class="ma-5 px-3 pt-3"
          align="center"
        >
          <VRow>
            <VCol>
              <v-autocomplete
                v-model="prato"
                :items="all_plates"
                label="Prato"
                variant="underlined"
              />
              <v-number-input
                v-model="pratoQtd"
                control-variant="split"
                :min="1"
              ></v-number-input>
            </VCol>
            <VCol
              cols="4"
              class="cursor-pointer"
              style="background-color: #1d2124"
            >
              <VIcon
                class="mt-10 cursor-pointer justify-center align-middle"
                align="center"
                size="36"
                :disabled="!(prato && pratoQtd)"
                @click="addPrato()"
                >mdi-plus</VIcon
              >
            </VCol>
          </VRow>
        </VCard>
        <VCard elevation="0" color="#14181B" class="ma-5 pa-5" align="center">
          <VRow>
            <VCol>
              <VBtn color="error" @click="fecharDialog()"> Cancelar </VBtn>
            </VCol>
            <VCol
              ><VBtn
                color="primary"
                @click="fazerPedido()"
                :disabled="form_pedido.nome_cliente && form_pedido.numero_mesa"
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
  </VLayout>
</template>

<script setup>
import { VNumberInput } from "vuetify/labs/VNumberInput";

let restauranteId = null;

if (import.meta.client) {
  restauranteId = localStorage.getItem("restauranteId");
}

const notificacoes = ref([]);

function viewNotificacao(item) {
  $fetch(`http://18.220.42.255:8000/api/notificacao/${item}/`, {
    method: "PATCH",
    body: { visualizada: true },
  }).then((res) => {
    $fetch("http://18.220.42.255:8000/api/notificacao/", {
      method: "GET",
    }).then((res) => {
      res = res.filter((item) => item.restaurante == restauranteId);
      notificacoes.value = res.filter((item) => item.visualizada === false);
    });
  });
}

onMounted(() => {
  setInterval(() => {
    $fetch("http://18.220.42.255:8000/api/notificacao/", {
      method: "GET",
    }).then((res) => {
      res = res.filter((item) => item.restaurante == restauranteId);
      notificacoes.value = res.filter((item) => item.visualizada === false);
      if (notificacoes.value.length > 0) {
        beep();
        navigator.vibrate(2000);
      }
    });
  }, 2000);
});

const nav = ref(0);
const pratoQtd = ref(null);
const dialog_status = ref(false);

const search_pedidos = ref("");
const prato = ref("");

const form_pedido = ref({
  nome_cliente: "",
  mesa: "",
  pratos_obj: [],
  restaurante: restauranteId,
});

const dialog_fazer_pedido = ref(false);

const mesas = ref([]);

const pedidos = ref([]);

const selected_pedido = ref({});

const all_plates = ref([]);

function addPrato() {
  form_pedido.value.pratos_obj.push({
    nome: `${prato.value}`,
    quantidade: pratoQtd.value,
  });
  prato.value = "";
  pratoQtd.value = null;
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
    restaurante: restauranteId,
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
    }
  ).then((_) => {
    $fetch("http://18.220.42.255:8000/api/pedidos/", {
      method: "GET",
    }).then((res) => {
      pedidos.value = res.filter((item) => item.restaurante == restauranteId);
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
      pedidos.value = res.filter((item) => item.restaurante == restauranteId);
    });
  });

  fecharDialog();
}

onBeforeMount(() => {
  $fetch("http://18.220.42.255:8000/api/notificacao/", {
    method: "GET",
  }).then((res) => {
    res = res.filter((item) => item.restaurante == restauranteId);
    notificacoes.value = res.filter((item) => item.visualizada === false);
  });

  $fetch("http://18.220.42.255:8000/api/pedidos/", {
    method: "GET",
  }).then((res) => {
    pedidos.value = res.filter((item) => item.restaurante == restauranteId);
  });

  $fetch("http://18.220.42.255:8000/api/mesas/", {
    method: "GET",
  }).then((res) => {
    mesas.value = res.filter((item) => item.restaurante == restauranteId);
  });

  $fetch("http://18.220.42.255:8000/api/pratos/", {
    method: "GET",
  }).then((res) => {
    res = res.filter((item) => item.restaurante == restauranteId);
    all_plates.value = res.map((item) => item.nome);
  });
});

function beep() {
  var snd = new Audio(
    "data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU="
  );
  snd.play();
}
</script>

<style>
body {
  background-color: black;
}
</style>
