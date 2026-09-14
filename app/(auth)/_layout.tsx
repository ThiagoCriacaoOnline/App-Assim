import { StatusBar } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <>
        <StatusBar barStyle="default" backgroundColor="#2E75B6"/>
        <Stack>
            <Stack.Screen name='index' options={{ headerShown: false }}/>

            <Stack.Screen name='login/index' options={{ headerShown: false }}/>
            <Stack.Screen name='register/index' options={{ headerShown: false }}/>
            <Stack.Screen name='register/verificacaoCadastro' options={{ headerShown: false }}/>
            <Stack.Screen name='register/verificacaoCodigo' options={{ headerShown: false }}/>
            <Stack.Screen name='register/cadastrarSenha' options={{ headerShown: false }}/>

            <Stack.Screen name='password/index' options={{ headerShown: false }}/>
            <Stack.Screen name='password/enviarToken' options={{ headerShown: false }}/>
            <Stack.Screen name='password/validarCodigo' options={{ headerShown: false }}/>
            <Stack.Screen name='password/cadastrarSenha' options={{ headerShown: false }}/>

            <Stack.Screen name='rede-emergencial/index' options={{ headerShown: false }}/>
            <Stack.Screen name='(app)/index' options={{ headerShown: false }}/>
        </Stack>
    </>
  )
}