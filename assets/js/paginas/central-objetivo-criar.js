import { montarFormulario } from "../form-pagina.js";
import { objetivo } from "../cadastros/objetivo.js";

montarFormulario({ ...objetivo, novo: true });
