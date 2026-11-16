# Diretrizes do Agente Desenvolvedor - Projeto MinhaGrade PWA

## Stack Obrigatória
- HTML5 Semântico, CSS3 (Mobile-First, variáveis CSS) e JavaScript Vanilla (ES6+).
- Zero dependências externas pesadas para garantir carregamento instantâneo offline.

## Regras de Arquitetura
1. Persistência: Todos os dados (matérias, horários, provas e notas) devem ser salvos no `localStorage` sob a chave `minhaGrade_v1`.
2. PWA: Manter `manifest.json` e `sw.js` (Service Worker) sincronizados com todos os arquivos estáticos para funcionamento 100% offline.
3. UX/UI: Interface limpa, botões grandes para toque em smartphones e feedback visual imediato ao salvar ou excluir registros.