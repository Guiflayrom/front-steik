export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) return;

  const token = localStorage.getItem("restauranteId");
  if (!token || token == "false") {
    return window.location.replace("/login");
  }
});
