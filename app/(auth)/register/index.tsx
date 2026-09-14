import { View, Text, Image, StyleSheet, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'
import HeaderAuxiliar from '@/app/Componentes/navigation/HeaderAuxiliar'
import TextPadrao from '@/app/Componentes/TextPadrao'
import InputText from '@/app/Componentes/InputText'
import { Colors } from '@/app/Constants/Constants'
import BotaoPadrao from '@/app/Componentes/Botoes/BotaoPadrao'
import { useRouter } from 'expo-router'
import { PrimeiroAcessoApi } from '@/app/Services/PrimeiroAcessoServices'

export default function PrimeiroAcesso() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [cpf, setCpf] = useState('');
    const [erroCpf, setErroCpf] = useState('');
    
    const [email, setEmail] = useState('');
    const [erroEmail, setErroEmail] = useState('');

    const [dataNascimento, setDataNascimento] = useState('');
    const [erroData, setErroData] = useState('');

    const [telefone, setTelefone] = useState('');
    const [erroTelefone, setErroTelefone] = useState('');

    // Aplica máscara de data (DD/MM/AAAA)
    const aplicarMascaraData = (texto: string) => {
        const cleaned = texto.replace(/\D/g, '').slice(0, 8);
        let masked = '';
  
        if (cleaned.length <= 2) {
            masked = cleaned;
        } else if (cleaned.length <= 4) {
            masked = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        } else {
            masked = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
        }
  
        return masked;
    };

    // Valida se a data é válida
    const validarData = (data: string) => {
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = data.match(regex);
        if (!match) return false;
  
        const dia = parseInt(match[1], 10);
        const mes = parseInt(match[2], 10);
        const ano = parseInt(match[3], 10);
  
        // Verifica se a data é válida
        if (mes < 1 || mes > 12) return false;
        if (dia < 1 || dia > 31) return false;
        
        // Verifica meses com 30 dias
        if ([4, 6, 9, 11].includes(mes) && dia > 30) return false;
        
        // Verifica fevereiro e anos bissextos
        if (mes === 2) {
            const isBissexto = (ano % 400 === 0) || (ano % 100 !== 0 && ano % 4 === 0);
            if (dia > (isBissexto ? 29 : 28)) return false;
        }
        
        // Verifica se não é uma data futura
        const hoje = new Date();
        const dataObj = new Date(ano, mes - 1, dia);
        return dataObj <= hoje;
    };

    // Formata o telefone (XX) XXXXX-XXXX
    const formataTelefone = (texto: string) => {
        const cleaned = texto.replace(/\D/g, '').slice(0, 11);
        
        if (cleaned.length <= 2) {
            return cleaned;
        } else if (cleaned.length <= 7) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
        } else {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
        }
    };

    // Valida CPF (formato básico)
    const validarCPF = (cpf: string) => {
        cpf = cpf.replace(/\D/g, '');
        
        // Verifica se tem 11 dígitos
        if (cpf.length !== 11) return false;
        
        // Verifica se não é uma sequência de números iguais
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        // Validação do primeiro dígito verificador
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;
        
        // Validação do segundo dígito verificador
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(10))) return false;
        
        return true;
    };

    // Valida email
    const validarEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // Valida telefone (mínimo 10 dígitos + DDD)
    const validarTelefone = (telefone: string) => {
        const cleaned = telefone.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 11;
    };

    // Valida todos os campos antes de prosseguir
    const validarCampos = () => {

        if (!cpf) {
            setErroCpf('CPF é obrigatório');
            Alert.alert('Atenção', 'CPF é obrigatório');
            return false;
        } else if (!validarCPF(cpf)) {
            setErroCpf('CPF inválido');
            Alert.alert('Atenção', 'CPF inválido');
            return false;
        }

        if (!dataNascimento) {
            setErroData('Data de nascimento é obrigatória');
            Alert.alert('Atenção', 'Data de nascimento é obrigatória');
            return false;
        } else if (!validarData(dataNascimento)) {
            setErroData('Data inválida ou futura');
            Alert.alert('Atenção', 'Data inválida ou futura');
            return false;
        }

        if (!telefone) {
            setErroTelefone('Celular é obrigatório');
            Alert.alert('Atenção', 'Celular é obrigatório');
            return false;
        } else if (!validarTelefone(telefone)) {
            setErroTelefone('Celular inválido');
            Alert.alert('Atenção', 'Celular inválido');
            return false;
        }

        if (!email) {
            setErroEmail('Email é obrigatório');
            Alert.alert('Atenção', 'Email é obrigatório');
            return false;
        } else if (!validarEmail(email)) {
            setErroEmail('Email inválido');
            Alert.alert('Atenção', 'Email inválido');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if(!validarCampos()){
            return
        }

        setLoading(true);

        try {
            const data = {
                cpf: cpf,
                dataNasc: dataNascimento,
                celular: telefone,
                email: email
            };

            const response = await PrimeiroAcessoApi(data);

            if(response.status == 200) {
                const retorno = response.data.retorno;

                router.push({
                    pathname: "/register/verificacaoCadastro",
                    params: {retorno: JSON.stringify(retorno)}
                });
            }

            if(response.status == 406) {
                const mensagem = response.data.mensagem;

                Alert.alert('Atenção', mensagem);
                return;
            }
        } catch (error: any) {
            console.error("Erro no primeiro acesso:", error);

            if (error.response) {
                const status = error.response.status;
                const mensagem = error.response.data?.mensagem || "Ocorreu um erro no servidor.";

                Alert.alert("Erro", `${mensagem} (código ${status})`);
            } else if (error.request) {
                Alert.alert("Erro", "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.");
            } else {
                Alert.alert("Erro inesperado", error.message || "Erro desconhecido.");
            }
        } finally {
            setLoading(false);
        }
    }
  
    return (
        <View style={{ flex: 1 }}>
            <HeaderAuxiliar rota={"/"}/>
        
            <View style={styles.header}>
                <Image 
                    source={require('@/assets/images/assim/logo.png')}
                    style={styles.imgHeader}
                    resizeMode='contain'
                />
                <TextPadrao text="Informe seus dados." />
            </View>

            <ScrollView style={styles.form}>
                <InputText 
                    label='CPF (Apenas números)'
                    keyboardType='numeric'
                    returnKeyType="next"
                    max={11}
                    onChangeText={(text) => {
                    if (text.length <= 11) {
                        setCpf(text);
                        if (text) setErroCpf('');
                    }
                    }}
                    errorMessage={erroCpf}
                />

                <InputText
                    label="Data de nascimento"
                    labelColor={Colors.azulIntermediario}
                    keyboardType="numeric"
                        value={dataNascimento}
                        onChangeText={(text) => {
                            const dataFormatada = aplicarMascaraData(text);
                            setDataNascimento(dataFormatada);
                            if (dataFormatada.length === 10) {
                                setErroData(validarData(dataFormatada) ? '' : 'Data inválida');
                            } else {
                                setErroData('');
                            }
                        }}
                    errorMessage={erroData}
                    max={10}
                    returnKeyType="next"
                />

                {/* TELEFONE CELULAR*/}
                <InputText 
                    label='Celular' 
                    labelColor={Colors.azulIntermediario}
                    placeholder='(00) 0 0000-0000' 
                    value={telefone}
                    onChangeText={(text) => {
                        const formatado = formataTelefone(text);
                        setTelefone(formatado);
                        if (text) setErroTelefone('');
                    }}
                    errorMessage={erroTelefone}
                    keyboardType='numeric'
                    max={15}
                    returnKeyType="next"
                />

                {/* EMAIL */}
                <InputText 
                    label='Email' 
                    labelColor={Colors.azulIntermediario}
                    placeholder='email@exemplo.com' 
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (text) setErroEmail('');
                    }}
                    errorMessage={erroEmail}
                    keyboardType='email-address'
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                />

                <BotaoPadrao 
                    text='PRÓXIMO' 
                    styleButton={{ marginTop: 30 }}
                    onPress={handleSubmit}
                    Loading={loading}
                />
            </ScrollView>

        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        marginTop: 40,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        gap: 20
    },
    imgHeader: {
        width: "80%",
        height: 60,
        marginHorizontal: 'auto',
    },
    form: {
        marginTop: 20,
        paddingHorizontal: 20
    },
});