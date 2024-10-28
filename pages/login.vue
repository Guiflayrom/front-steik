<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6"
  >
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <img
          src="https://i.imgur.com/4PpSNEs_d.webp?maxwidth=400&fidelity=grand"
          alt="Logo do Restaurante"
          class="mx-auto w-32 h-32 object-contain"
        />
        <h1 class="mt-6 text-3xl font-bold text-white">Bem-vindo de volta</h1>
        <p class="mt-2 text-sm text-gray-400">
          Por favor, faça login na sua conta
        </p>
      </div>

      <form
        @submit.prevent="submit"
        class="bg-gray-800 rounded-xl shadow-xl p-8"
      >
        <div class="mb-6">
          <label
            for="email"
            class="block text-sm font-medium text-gray-300 mb-2"
            >E-mail</label
          >
          <div class="relative">
            <input
              v-model="login.email"
              id="email"
              type="email"
              required
              class="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
              placeholder="Digite seu e-mail"
            />
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <i class="mdi mdi-email text-gray-400"></i>
            </span>
          </div>
        </div>

        <div class="mb-6">
          <label
            for="password"
            class="block text-sm font-medium text-gray-300 mb-2"
            >Senha</label
          >
          <div class="relative">
            <input
              v-model="login.password"
              id="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
              placeholder="Digite sua senha"
            />
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <i class="mdi mdi-lock text-gray-400"></i>
            </span>
            <button
              type="button"
              @click="togglePassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
            >
              <i :class="showPassword ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
        >
          <i class="mdi mdi-login mr-2"></i>
          Entrar
        </button>
      </form>

      <p class="mt-8 text-center text-sm text-gray-400">
        Não seu restaurante não tem uma conta?
        <br />
        <a
          href="mailto:projetos@vitalisdigital.online?subject=Precisamos%20de%20uma%20conta%20no%20PDV!&body=Olá%2C%0D%0A%0D%0AEstou entrando em contato para solicitar a criação de uma conta relacionada ao nosso projeto. Poderíamos agendar uma reunião ou uma breve conversa para discutir os detalhes e os próximos passos?%0D%0A%0D%0AFico no aguardo de um retorno.%0D%0A%0D%0AAtenciosamente,%0D%0A[Seu Nome]"
          class="font-medium text-blue-500 hover:text-blue-400"
          >Entre em contato com o administrador</a
        >
      </p>
    </div>
  </div>
  <VSnackbar color="red" v-model="showSnackbar" timeout="2000">
    E-mail ou senha incorretos!
  </VSnackbar>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "~/api";

const router = useRouter();
const showPassword = ref(false);
const showSnackbar = ref(false);
const login = ref({
  email: "",
  password: "",
});

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const submit = async () => {
  api("login/", "POST", login.value)
    .then((res) => {
      localStorage.setItem("access", res.access);
      localStorage.setItem("refresh", res.refresh);
      localStorage.setItem("restaurante_id", res.restaurante_id);
      localStorage.setItem("user_id", res.user_id);
      localStorage.setItem("cooking_access", res.roles.pode_acessar_cozinha);
      localStorage.setItem("waiter_access", res.roles.pode_acessar_garcom);
      localStorage.setItem("pdv_access", res.roles.pode_acessar_pdv);
      api("usuarios/detalhes/?id=" + res.user_id).then((res) => {
        localStorage.setItem("nome_funcionario", res.pessoa.nome);
        router.push("/");
      });
    })
    .catch((error) => {
      console.error("Falha no login:", error);
      showSnackbar.value = true;
    });
};
</script>

<style>
@import "https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css";
</style>
