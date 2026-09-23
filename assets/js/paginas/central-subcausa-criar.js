import { montarFormulario } from "../form-pagina.js";
import { subcausa } from "../cadastros/subcausa.js";

montarFormulario({ ...subcausa, novo: true });
