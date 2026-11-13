// A Central não cria nem edita Iniciativa — só aprova ou reprova. Quem cria e ajusta é o setorial.
const id = new URLSearchParams(location.search).get("id");
location.replace(id ? `../central-iniciativa.html?id=${encodeURIComponent(id)}` : "../central-iniciativas.html");
