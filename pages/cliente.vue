<template>
  <VLayout>
    <v-container align="center">
      <v-row>
        <v-col cols="12">
          <v-card class="pa-4" color="black">
            <iframe
              src="https://pdflink.to/0d172b18/embed/"
              frameborder="0"
              style="border: none; height: 600px; width: 100%; max-width: 100%"
            ></iframe>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-icon
            class="cursor-pointer"
            color="white"
            size="128"
            @click="dialog_call = true"
            >mdi-bell</v-icon
          >
        </v-col>
      </v-row>
    </v-container>
  </VLayout>
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
const dialog_call = ref(false);
const mesa = ref(null);
const mesas = ref([]);

onBeforeMount(() => {
  $fetch("http://18.220.42.255:8000/api/mesas/", {
    method: "GET",
  }).then((res) => {
    mesas.value = res;
  });
});

function callWait() {
  $fetch("http://18.220.42.255:8000/api/notificacao/", {
    method: "POST",
    body: {
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
</style>
