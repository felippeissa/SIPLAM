import { montarFormulario } from "../form-pagina.js";
import { indicador } from "../cadastros/indicador.js";

montarFormulario({ ...indicador, novo: true });
