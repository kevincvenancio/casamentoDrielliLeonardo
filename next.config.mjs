/** @type {import('next').NextConfig} */
const nextConfig = {
  // Nao declaramos `images.remotePatterns` de proposito.
  //
  // Toda imagem que passa pelo next/image neste site e local (/images/...),
  // entao nao ha host remoto para liberar. Abrir a lista aqui -- e ainda mais
  // com o curinga `hostname: "**"`, que estava aqui antes -- transforma a rota
  // /_next/image num proxy aberto: qualquer pessoa pode pedir
  // /_next/image?url=https://site-qualquer/arquivo.jpg e fazer o nosso servidor
  // baixar e servir aquilo, no nosso dominio e na nossa conta.
  //
  // As fotos de presente que vem do banco (gifts.image_url) sao renderizadas
  // com <img> puro em src/components/GiftGrid.tsx, que nao passa pelo
  // otimizador e nao depende desta lista.
};

export default nextConfig;
