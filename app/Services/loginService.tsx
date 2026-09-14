import { HandleRequest } from "./config"

export const LoginBeneficiario = async (data: {cpf: string, senha: string, token?: string }) => {
    return HandleRequest('/login', data, "Erro ao realizar o login", "POST");
};
