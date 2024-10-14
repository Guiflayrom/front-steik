<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-img
      src="https://i.imgur.com/4PpSNEs_d.webp?maxwidth=1520&fidelity=grand"
      class="background"
      cover
    ></v-img>
    <v-card class="pa-8" elevation="4" width="500">
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
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      valid: false,
      showPassword: false,
      login: {
        email: "",
        password: "",
      },
      emailRules: [
        (v) => !!v || "O e-mail é obrigatório",
        (v) => /.+@.+\..+/.test(v) || "E-mail inválido",
      ],
      passwordRules: [(v) => !!v || "A senha é obrigatória"],
    };
  },
  methods: {
    async submit() {
      if (this.$refs.loginForm.validate()) {
        try {
          // Fazer o request para o backend
          const response = await $fetch(
            "http://18.220.42.255:8000/api/login/",
            {
              method: "POST",
              body: {
                email: this.login.email,
                senha: this.login.password,
              },
            }
          );
          // Verificar se o login foi bem-sucedido
          if (response.id) {
            // Armazenar o ID do restaurante no localStorage
            localStorage.setItem("restauranteId", response.id);
            // Redirecionar para o dashboard ou outra página
            this.$router.push("/");
          } else {
            alert(response.error || "Erro ao fazer login");
          }
        } catch (error) {
          alert("Erro ao fazer login: " + error.message);
        }
      }
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
  },
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; /* Coloca a imagem atrás do conteúdo */
  opacity: 0.7; /* Adiciona um leve efeito de opacidade */
}

.v-card {
  max-width: 550px;
  width: 100%;
  background-color: rgba(
    255,
    255,
    255,
    0.95
  ); /* Torna o card semi-transparente */
}
</style>
