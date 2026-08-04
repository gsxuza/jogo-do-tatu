# 🦔 Jogo do Tatu — Desafio dos Valores

Jogo de plataforma endless runner feito em **HTML + Canvas + JavaScript puro**, sem dependências e sem arquivos externos.

## 🎮 Como jogar

- **Pular:** clique, toque na tela ou pressione `Espaço`
- **Pular mais alto:** segure o clique/toque
- **Pausar:** `Esc` ou o botão ⏸ (também no mobile)
- Colete as **peças do quebra-cabeça** 🧩
- Pegue a **lupa 🔍** para ganhar um **escudo de foco** (bloqueia 1 obstáculo)
- Desvie das **distrações** 📱💤

## ✨ Personalização

- Tela inicial com **campo de nome** e escolha de **setor** (8 setores da empresa)
- O nome aparece no HUD e na tela final (*"Parabéns, [nome]!"*)
- A **cor do setor** tinge a borda da carapaça do tatu

> Os nomes dos setores em `SECTORS` são **provisórios** — ajuste-os no `index.html`.

## 💚 Sistema de jogo

- **3 vidas** (corações no HUD) — bater num obstáculo tira 1 vida
- **Invencibilidade temporária** (tatu pisca por ~2s) após levar dano
- **Escudo de foco** 🔍 que bloqueia 1 obstáculo
- **Contador histórico** de peças coletadas pela empresa inteira (salvo em `localStorage`)
- **Top 5** das melhores pontuações locais
- **Compartilhar resultado** com texto pronto para o WhatsApp

## 🎨 Polimento

- Contagem regressiva **3… 2… 1… VAI!** antes de cada partida
- Fundo com **paralaxe em 3 camadas** (céu, morros, chão)
- **Partículas de celebração** ao coletar cada peça
- **Sons** de pulo, coleta e colisão via **Web Audio API** (sem arquivos)
- Mensagem motivacional por faixa de pontuação (0–10, 11–25, 26–50, 51+)

## 🏆 Faixas de pontuação

| Peças  | Resultado |
|--------|-----------|
| 51+    | Foco de mestre! 🏆 |
| 26–50  | Muito bem! 🔥 |
| 11–25  | Pegando o ritmo! 🎯 |
| 0–10   | Bora aquecer! 💪 |

## 🚀 Como rodar

Basta abrir o `index.html` no navegador — sem instalação ou servidor necessário.

## 🌐 Deploy

Publicado em: [jogodotatu.vercel.app](https://jogodotatu.vercel.app)

---

Feito por [@gsxuza](https://github.com/gsxuza)
