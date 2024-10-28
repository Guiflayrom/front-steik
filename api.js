export default function api(path, method = "GET", data = {}) {
  const url = `http://localhost:8000/api/v1/${path}`;

  // Configuração inicial da requisição
  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Se o método não for GET, adiciona o body à requisição
  if (method !== "GET") {
    options.body = JSON.stringify(data);
  }

  // Faz a requisição usando fetch e retorna a Promise
  return fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        // Lança um erro se a resposta não estiver ok (status code fora da faixa 2xx)
        return Promise.reject(`Erro: ${response.status}`);
      }
      return response.json(); // Retorna a resposta como JSON
    })
    .catch((error) => {
      console.error("Erro na requisição:", error);
      throw error; // Repassa o erro para ser tratado pela função que chama
    });
}
