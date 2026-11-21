Futebol Studio Pro — PWA

Arquivos (todos na RAIZ do repositório, sem subpastas):
- index.html ................ aplicação
- manifest.webmanifest ...... configuração de instalação (PWA)
- sw.js ..................... service worker (cache/offline + atualização segura)
- icon-180.png .............. ícone iOS (apple-touch-icon)
- icon-192.png, icon-512.png  ícones "any" (Android/desktop)
- icon-maskable-192.png, icon-maskable-512.png
                              ícones "maskable" (arte dentro da zona segura; o Android pode
                              recortar em círculo/quadrado arredondado sem cortar a imagem)

Como publicar (GitHub Pages):
1. Envie TODOS os arquivos acima para a raiz do repositório (substituindo os antigos).
2. Settings > Pages > Source: branch principal, pasta "/ (root)". Aguarde o deploy.
3. No Android (Chrome): abra https://USUARIO.github.io/NOME-DO-REPOSITORIO/ e use
   menu (⋮) > "Instalar app" / "Adicionar à tela inicial".
4. No iPhone: Safari > Compartilhar > Adicionar à Tela de Início.

Conferência rápida antes de instalar (abra cada endereço no navegador; todos devem abrir, não dar 404):
  .../NOME-DO-REPOSITORIO/manifest.webmanifest
  .../NOME-DO-REPOSITORIO/sw.js
  .../NOME-DO-REPOSITORIO/icon-192.png
  .../NOME-DO-REPOSITORIO/icon-512.png
  .../NOME-DO-REPOSITORIO/icon-maskable-512.png

Atualizações do app:
- O HTML é sempre buscado na rede primeiro, então novas versões aparecem na próxima abertura.
- Ao publicar uma nova versão, troque também o número em sw.js (const VERSION = 'v3' -> 'v4' ...).
  Isso renova o cache offline e apaga o antigo (apenas os caches deste app).

Dados: ficam salvos somente no navegador do aparelho (localStorage). Faça backups periódicos.
Se o app já estava instalado de uma tentativa anterior, desinstale e instale de novo.
