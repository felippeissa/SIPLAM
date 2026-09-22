import { montarFormulario } from "../form-pagina.js";
import { diagnostico } from "../cadastros/diagnostico.js";

montarFormulario({ ...diagnostico, novo: false });
