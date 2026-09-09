Futebol Studio Master Suite — PWA

Conteúdo:
- index.html: aplicação atual
- manifest.webmanifest: configuração PWA
- sw.js: cache/offline
- icons/: ícones para instalação

Como publicar:
1. Envie o conteúdo desta pasta para Netlify, Vercel, GitHub Pages ou outro host HTTPS.
2. Abra o endereço no Safari/Chrome.
3. No iPhone: Compartilhar > Adicionar à Tela de Início.

Observação: o PWA preserva os dados locais da aplicação via localStorage. Recursos externos (fontes/CDNs) são armazenados pelo service worker após serem carregados, quando o navegador permitir.
