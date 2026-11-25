import { montarFormulario } from "../form-pagina.js";
import { grupoMarcador } from "../cadastros/grupo-marcador.js";

montarFormulario({ ...grupoMarcador, novo: true });
