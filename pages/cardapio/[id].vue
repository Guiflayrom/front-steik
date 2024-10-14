<template>
  <VLayout>
    <v-app-bar :elevation="2">
      <v-app-bar-title align="center">
        Restaurante Steik Tatuapé
      </v-app-bar-title>
      <template v-slot:prepend>
        <v-icon
          class="cursor-pointer ml-5"
          style="position: absolute"
          color="black"
          size="32"
          @click="dialog_call = true"
          >mdi-bell</v-icon
        >
      </template>
    </v-app-bar>
    <v-main>
      <v-row>
        <v-col cols="12">
          <v-card
            class="pa-4 py-16 cursor-pointer"
            v-for="(item, index) in categorias"
            :key="index"
            :image="item.image"
          >
            <div class="overlay"></div>
            <div
              @click="expandItem(item)"
              align="start"
              class="content ml-10 font-medium tracking-widest uppercase text-white truncate text-[min(10vw,4rem)] select-none"
            >
              {{ `${index + 1}`.padStart(2, "0") }}. {{ item.nome }}
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </VLayout>

  <VDialog
    v-model="dialogItems"
    scrollable
    :overlay="false"
    width="800"
    height="600"
    transition="dialog-transition"
  >
    <VCard elevation="10" class="pa-10">
      <div
        style="margin-bottom: 50px"
        class="font-bold text-6xl"
        align="center"
      >
        {{ categoria }}
      </div>

      <div v-for="(item, index) in itemsToShow" class="mb-10">
        <VCard
          class="cursor-pointer"
          @click="dialog_call = true"
          elevation="15"
          :key="index"
        >
          <VRow class="py-5">
            <VCol
              class="d-flex align-center justify-center"
              cols="12"
              sm="12"
              xs="12"
              md="3"
              lg="3"
            >
              <v-img :src="item?.imagem" min-width="100"></v-img>
            </VCol>
            <VCol class="mx-2">
              <VRow>
                <VCol cols="12" class="mt-5">
                  <div class="font-bold text-3xl">
                    {{ item.nome }}
                  </div>
                </VCol>
                <VCol cols="12" class="d-flex align-top justify-top">
                  <div class="font-light">
                    {{ item.descricao }}
                  </div>
                </VCol>
              </VRow>
            </VCol>
            <VCol class="d-flex align-center justify-center">
              <div class="font-bold text-4xl text-nowrap underline">
                R${{ item.valor }}
              </div>
            </VCol>
          </VRow>
        </VCard>
      </div>
    </VCard>
  </VDialog>

  <VDialog
    v-model="dialog_call"
    scrollable
    persistent
    :overlay="false"
    max-width="600px"
    transition="dialog-transition"
  >
    <VCard elevation="10" color="#14161b">
      <VCard elevation="0" color="#14181B" class="ma-5">
        <div class="d-flex my-5">
          <div class="text-4xl ml-10">Escolha sua mesa</div>
          <div class="text-4xl ml-auto mr-10">
            <VIcon class="cursor-pointer" @click="dialog_call = !dialog_call"
              >mdi-close</VIcon
            >
          </div>
        </div>
      </VCard>
      <VCard
        elevation="0"
        color="#14181B"
        height="200"
        class="ma-5 pa-5 overflow-y-auto"
        align="center"
      >
        <VSelect
          :items="mesas.map((item) => item.numero_mesa)"
          v-model="mesa"
          variant="outlined"
          label="Mesa"
        ></VSelect>
        <br />
        <VBtn
          align="center"
          color="success"
          @click="callWait()"
          :disabled="!mesa"
          >CHAMAR!</VBtn
        >
      </VCard>
    </VCard>
  </VDialog>
</template>

<script setup>
const route = useRoute();

const dialog_call = ref(false);
const mesa = ref(null);
const mesas = ref([]);
const pratos = ref([]);
const categorias = ref([]);
const itemsToShow = ref([]);
const dialogItems = ref(false);
const categoria = ref("");

function expandItem(i) {
  itemsToShow.value = pratos.value.filter(
    (item) => item.categoria_nome == i.nome
  );
  dialogItems.value = true;
  categoria.value = i.nome;
}

onBeforeMount(() => {
  $fetch("http://localhost:8000/api/mesas/", {
    method: "GET",
  }).then((res) => {
    mesas.value = res.filter((item) => item.restaurante == route.params.id);
  });

  $fetch("http://localhost:8000/api/categorias/", {
    method: "GET",
  }).then((res) => {
    categorias.value = res.filter(
      (item) => item.restaurante == route.params.id
    );
  });

  $fetch("http://localhost:8000/api/pratos/", {
    method: "GET",
  }).then((res) => {
    pratos.value = res.filter((item) => item.restaurante == route.params.id);
  });
});

function callWait() {
  $fetch("http://localhost:8000/api/notificacao/", {
    method: "POST",
    body: {
      restaurante: route.params.id,
      texto: `Cliente chamando na MESA ${mesa.value}`,
    },
  }).then(() => {
    alert("Aguarde, nossos garçons foram notificados!");
    dialog_call = false;
  });
}
</script>

<style>
body {
  background-color: black;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
}

.content {
  position: relative;
  z-index: 2; /* Conteúdo deve ficar acima do overlay */
  white-space: nowrap; /* Impede que o texto quebre de linha */
  overflow: auto; /* Esconde o texto que ultrapassar os limites do elemento */
}
</style>
