/**
 * Home provisória para perfis cuja tela ainda não existe.
 *
 * O acesso funciona e o menu aparece; o que falta é a tela própria daquele
 * perfil. Dizer isso é melhor do que levar a pessoa a uma tela de outro perfil.
 */
import { montarShell, emConstrucao } from "../shell.js";
import { esc } from "../ui.js";

const { estado, visao } = montarShell();
const construcao = emConstrucao();

const PERFIL = {
    setorial: "Setorial",
    "admin-central": "Administrador central",
    "gestao-setorial": "Alta gestão setorial",
    "gestao-central": "Alta gestão central",
    controle: "Órgãos de controle",
};

let perfilId = null;
let usuario = null;
try {
    perfilId = localStorage.getItem("siplam.perfilSessao");
    usuario = localStorage.getItem("siplam.usuario");
} catch (e) {
    /* navegador sem armazenamento */
}

const perfil = PERFIL[perfilId];
document.getElementById("conteudo").innerHTML = `
<div class="row justify-content-center my-4">
    <div class="col-xxl-6 col-lg-8">
        <div class="card">
            <div class="card-body text-center p-5">
                <span class="avatar-lg bg-warning-subtle text-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                    <i class="ti ti-tools fs-24"></i>
                </span>

                <h4 class="fw-bold mb-2">Em construção</h4>
                <p class="text-muted mb-4">
                    ${
                        perfil
                            ? `A tela inicial do perfil <strong>${esc(perfil)}</strong> ainda não foi construída.`
                            : "A tela inicial deste perfil ainda não foi construída."
                    }
                    ${usuario ? `Você entrou como <strong>${esc(usuario)}</strong>.` : ""}
                </p>

                <div class="d-flex flex-wrap justify-content-center gap-2 mb-4">
                    <a href="perfil.html" class="btn btn-outline-primary">
                        <i class="ti ti-switch-horizontal me-1"></i>Trocar de perfil
                    </a>
                </div>

                <p class="fs-12 text-muted mb-0">
                    Por enquanto os perfis <strong>Setorial</strong> e
                    <strong>Administrador central</strong> têm telas construídas.
                </p>
            </div>
        </div>
    </div>
</div>`;
