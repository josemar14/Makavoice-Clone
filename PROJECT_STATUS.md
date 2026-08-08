# Makavoice-Clone — PROJECT STATUS

> Documento de continuidade do projeto. Consulte este arquivo antes de iniciar uma nova etapa para saber exatamente onde o projeto parou.

## Estado atual

- **Versão:** v0.1 — Fundação / Voice MVP
- **Branch:** main
- **Deploy:** Cloudflare Workers + Assets
- **Status geral:** MVP publicado e funcional no navegador
- **Última etapa concluída:** publicação do site e teste do fluxo de voz

## O que já está funcionando

- [x] Repositório GitHub
- [x] Estrutura inicial do projeto
- [x] README e documentação inicial
- [x] `src/index.html` como entrada do site
- [x] PWA básico (`manifest.json` e `sw.js`)
- [x] Deploy pelo GitHub → Cloudflare
- [x] Site publicado em `makavoice-clone.josemarmartins1714.workers.dev`
- [x] Acesso ao microfone pelo navegador
- [x] Gravação de voz
- [x] Preparação da voz para síntese
- [x] Reprodução de áudio no MVP

## O que ainda é protótipo

- [ ] Clonagem real de voz por IA
- [ ] TTS real usando voz clonada
- [ ] Download de MP3/WAV gerado por IA
- [ ] Backend seguro para provedores de voz
- [ ] Sistema de múltiplos provedores
- [ ] Gerenciamento de `voice_id`
- [ ] Histórico de vozes
- [ ] Sistema de seleção de provedor

## Etapa atual

### v0.1.1 — Voice Engine

Objetivo: transformar o fluxo de voz do protótipo em um motor real e modular de clonagem/TTS.

### Próxima tarefa

1. Criar uma camada `Voice Engine` independente do provedor.
2. Integrar ElevenLabs como primeiro provedor.
3. Manter a API Key somente como Secret no Cloudflare.
4. Criar endpoint seguro para clonagem.
5. Criar endpoint seguro para TTS.
6. Retornar áudio ao frontend.
7. Reproduzir e permitir download do resultado.
8. Testar com uma voz autorizada pelo usuário.

## Arquitetura planejada

```text
                         MAKAVOICE
                             |
                       VOICE ENGINE
                             |
              +--------------+--------------+
              |              |              |
         ElevenLabs      Provider 2      Provider 3
              |              |              |
           Clone            Clone            TTS
              |              |              |
              +--------------+--------------+
                             |
                            TTS
                             |
                         MP3 / WAV
```

## Provedores

### ElevenLabs

- **Função:** primeiro provedor de referência para Voice Cloning/TTS.
- **Status:** planejado para integração real.
- **Secret necessário:** `ELEVENLABS_API_KEY`
- **Regra:** nunca colocar a chave no código ou no GitHub.

### Provider 2

- **Status:** ainda não definido.
- **Objetivo:** alternativa/fallback de preço, disponibilidade ou qualidade.

### Provider 3

- **Status:** reservado para futura expansão.

## Roadmap resumido

```text
v0.1  Fundação              [EM ANDAMENTO/BASE CONCLUÍDA]
  |
v0.1.1 Voice Engine        [PRÓXIMA]
  |
v0.2  Core
  |
v0.3  Skills
  |
v0.4  IA
  |
v0.5  Plugins
  |
v0.6  Voz Avançada
  |
v0.7  PWA
  |
v0.8  Automação
  |
v0.9  Segurança
  |
v1.0  Plataforma
  |
v1.1  Marketplace
  |
v1.2  Multiagentes
  |
v1.3  Automação Avançada
  |
v2.0  Ecossistema Makavoice
```

## Regra de continuidade

Ao retomar o projeto:

1. Ler `PROJECT_STATUS.md`.
2. Ler `docs/ROADMAP.md`.
3. Verificar o estado do Git.
4. Verificar o último commit.
5. Conferir o que está marcado como concluído.
6. Continuar na seção **Próxima tarefa**.
7. Atualizar este arquivo ao concluir uma etapa.
8. Registrar decisões importantes.
9. Fazer commit das alterações.
10. Atualizar o status antes de encerrar uma sessão importante.

## Registro de progresso

### 2026-08-08

- Estrutura do Makavoice-Clone criada.
- Site publicado no Cloudflare.
- `index.html` definido como entrada.
- PWA básico preparado.
- Microfone testado com sucesso.
- Gravação testada com sucesso.
- Fluxo de preparação de voz testado.
- Reprodução testada com sucesso.
- Próximo objetivo definido: Voice Engine real e arquitetura multi-provedor.

## Decisões arquiteturais

- O frontend não deve conter API Keys.
- O Cloudflare Worker será a camada intermediária segura para APIs externas.
- O motor de voz será independente do provedor.
- ElevenLabs será o primeiro provedor, mas não será obrigatório para toda a arquitetura.
- Novos provedores deverão poder ser adicionados sem reescrever o frontend.
- O projeto continuará usando GitHub como fonte principal do código.
- O Cloudflare continuará responsável pelo deploy/publicação.

## Bloqueios atuais

Nenhum bloqueio técnico confirmado.

## Próximo marco

**Concluir v0.1.1 — Voice Engine**, com clonagem e TTS reais através de um provedor externo, mantendo as credenciais protegidas no Cloudflare.
