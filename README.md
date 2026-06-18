# BoaConsulta

Aplicativo Expo para gestao de agenda, pacientes e profissionais de uma clinica.

## Scripts

```bash
npm install
npm run start
```

Comandos uteis:

- `npm run android`: abre no Android.
- `npm run ios`: abre no iOS.
- `npm run web`: abre no navegador.
- `npm run lint`: executa o lint do Expo.

## Estrutura

- `app/`: rotas do Expo Router.
- `src/telas/`: telas principais.
- `src/componentes/`: componentes reutilizaveis.
- `src/servicos/`: servicos de dados e integracoes.
- `src/constantes/`: tema e configuracoes visuais.

## Ambiente

O arquivo `.env` local e preservado e ignorado pelo Git. As chaves publicas do Expo/Supabase devem usar o prefixo `EXPO_PUBLIC_`.
