import { montarFormulario } from "../form-pagina.js";
import { problema } from "../cadastros/problema.js";

montarFormulario({ ...problema, novo: true });
