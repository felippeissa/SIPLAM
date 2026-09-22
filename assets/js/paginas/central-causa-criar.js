import { montarFormulario } from "../form-pagina.js";
import { causa } from "../cadastros/causa.js";

montarFormulario({ ...causa, novo: true });
