import { HandleRequest } from "./config"

export const PrimeiroAcessoApi = async (data: {cpf: string, dataNasc: string, celular: string, email: string}) => {
    return HandleRequest('/cadastro/primeiro_acesso', data, "Erro ao realizar o primeiro acesso", "POST");
};

export const EnvioDeCodigo = async (data: { OPtoken: string | null }) => {
    return HandleRequest('/cadastro/send_token', data, "Erro ao realizar o envio de chave para recebimento de token", "POST");
};

export const ValidarCodigo = async (data: { codToken: string | null }) => {
    return HandleRequest('/cadastro/validar_token', data, "Erro ao validar o token", "POST");
};

export const CadastrarSenhaPrimeiroAcesso = async (data: { codToken: string | null, senha: string | null, confirmaSenha: string | null}) => {
    return HandleRequest('/cadastro/cadastrar_senha', data, "Erro ao cadastrar senha", "POST");
};

