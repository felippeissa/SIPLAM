import { montarFormulario } from "../form-pagina.js";
import { dimensaoMarcador } from "../cadastros/dimensao-marcador.js";

montarFormulario({ ...dimensaoMarcador, novo: false });
