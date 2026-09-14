import { HandleRequest } from "./config"

export const ConsultarDadosRecuperacao = async (data: {cpfBen: string, dataNascBen: string}) => {
    return HandleRequest('/recuperar-senha/consulta_dados_recuperacao', data, "Erro ao realizar a consulta de recuperação de senha", "POST");
};

export const EnviarTokenRecuperacaoDeSenha = async (data: {OPtoken: string}) => {
    return HandleRequest('/recuperar-senha/send_token', data, "Erro ao realizar o envio do token", "POST");
};

export const ValidarTokenRecuperacaoDeSenha = async (data: {codToken: string}) => {
    return HandleRequest('/recuperar-senha/validar_token', data, "Erro ao realizar a validação do token", "POST");
};

export const ResetarSenha = async (data: {codToken: string, senhaBen: string, confSenhaBen: string}) => {
    return HandleRequest('/recuperar-senha/reset_pass', data, "Erro ao realizar a alteração de senha", "POST");
};

