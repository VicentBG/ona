// Metadatos y URLs compartidos; solo se importan desde el frontmatter de Astro.
// orden es presentación editorial: no representa una fecha de los recuerdos.
const archivos = import.meta.glob('../pages/diario/*.md', { eager: true });

export const entradasDiario = Object.values(archivos)
  .sort((a, b) => a.frontmatter.orden - b.frontmatter.orden);
