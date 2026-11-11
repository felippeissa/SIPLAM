import { montarFormulario } from "../form-pagina.js";
import { marcador } from "../cadastros/marcador.js";

montarFormulario({ ...marcador, novo: true });
