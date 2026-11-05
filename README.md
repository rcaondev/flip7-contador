# Placar Flip 7

App Android simples e leve para marcar a pontuação de partidas de **Flip 7**.

## Funcionalidades

- Nova partida com meta configurável (100, 200, 300 ou personalizada)
- Placar ao vivo com ranking animado, coroa no líder e barra de progresso até a meta
- Lançamento de rodada com atalhos **💥 Estourou** (0 pontos) e **⭐ Flip 7** (+15)
- Tabela de rodadas com edição, e desfazer última rodada
- Tela de vitória com confete, revanche e detecção de empate no topo
- Histórico de partidas e ranking por jogador (vitórias, média, Flip 7s, estouros)
- Funciona offline; dados salvos no aparelho

## Stack

Vue 3 · Vite · Tailwind CSS 4 · Capacitor 8 (Android)

## Desenvolvimento

```bash
npm install
npm run dev        # abre no navegador
```

## Gerar o APK

Requer JDK 21 e Android SDK (ex.: via Android Studio), com `JAVA_HOME` apontando para o JDK.

```bash
npm run apk        # gera ../placar-flip7.apk
```

Ícones e splash ficam em `assets/` (`fg.svg`, `bg.svg`) e são gerados com `npx @capacitor/assets generate --android`.

## Autor

**Rodrigo Caon** — [rodrigocaon.com.br](https://rodrigocaon.com.br)
