<template>
  <v-dialog v-model="dialog" persistent max-width="500">
    <v-card class="pa-8" elevation="4">
      <v-card-title class="text-h5 text-center"
        >Entre na sua conta</v-card-title
      >

      <v-card-text>
        <v-form ref="loginForm" v-model="valid" lazy-validation>
          <v-text-field
            v-model="login.email"
            label="E-mail"
            :rules="emailRules"
            required
            prepend-icon="mdi-email"
          ></v-text-field>

          <v-text-field
            v-model="login.password"
            label="Senha"
            :type="showPassword ? 'text' : 'password'"
            :rules="passwordRules"
            required
            prepend-icon="mdi-lock"
            append-icon="mdi-eye"
            @click:append="togglePassword"
          ></v-text-field>

          <v-btn
            color="black"
            class="mt-4"
            block
            @click="submit"
            :disabled="!valid"
          >
            Login
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";

const dialog = ref(false); // Controla o estado de exibição do diálogo de login
const valid = ref(false);
const showPassword = ref(false);

const login = ref({
  email: "",
  password: "",
});

// Regras de validação
const emailRules = [
  (v) => !!v || "O e-mail é obrigatório",
  (v) => /.+@.+\..+/.test(v) || "E-mail inválido",
];

const passwordRules = [(v) => !!v || "A senha é obrigatória"];

// Verifica se o restauranteId está no localStorage
onMounted(() => {
  const restauranteId = localStorage.getItem("restauranteId");
  if (!restauranteId) {
    dialog.value = true; // Se não houver restauranteId, exibe o diálogo de login
  }
});

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// Função para realizar o login
const submit = async () => {
  if (valid.value) {
    try {
      const response = await $fetch("http://18.220.42.255:8000/api/login/", {
        method: "POST",
        body: {
          email: login.value.email,
          senha: login.value.password,
        },
      });

      if (response.id) {
        // Armazena o restauranteId no localStorage
        localStorage.setItem("restauranteId", response.id);
        dialog.value = false; // Fecha o diálogo de login
        window.location.reload();
      } else {
        alert(response.error || "Erro ao fazer login");
      }
    } catch (error) {
      alert("Erro ao fazer login: " + error.message);
    }
  }
};
</script>

<style scoped>
.v-card {
  max-width: 550px;
  background-color: rgba(255, 255, 255, 0.95);
}
</style>
