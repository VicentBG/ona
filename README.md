# La web de Ona · Primer paso con Astro

Una pequeña web para aprender Astro construyendo la página de Ona. Una sola página con los datos aportados: Ona, pointerdor, nueve meses en noviembre de 2026. Los textos de presentación son una propuesta de IA; no inventan vivencias, fotos ni rasgos de personalidad.

## Alcance de este paso

Una sola página estática, sin TypeScript en el código que escribimos, sin otras páginas, diario, fotos o servicios externos. La portada usa un estilo de cómic infantil: amarillo, rosa, menta y lila, contornos oscuros, sombras y tipografía local redondeada, sin animaciones.

Código fuente: https://github.com/VicentBG/ona (repositorio público).

El usuario autorizó inicializar Git y publicar este código. Eso no incluye desplegar la web ni configurar GitHub Pages. No se incluyen notas privadas, cachés, dependencias instaladas ni archivos de configuración personal.

Astro está fijado en **7.4.12** y package-lock.json fija la resolución de dependencias. Entorno comprobado: Node **26.13.1**, npm **11.20.0**. La versión de Node es par; los mínimos documentados para Astro son Node >=22.23.4 y npm >=9.6.5.

## Comandos desde esta carpeta

```bash
npm run dev
```

Abre la dirección que indique la terminal, normalmente http://127.0.0.1:4321. Ctrl+C detiene ese servidor. Ejecutar siempre desde la raíz de este proyecto. Los servidores se vinculan solo a loopback, no a todas las interfaces de red.

```bash
npm test
npm run preview
```

npm test genera primero la web y después ejecuta cuatro contratos del HTML/configuración/paleta mediante el runner de Node, sin otra librería de tests. Preview sirve la última generación; si cambias archivos, vuelve a generar. Ctrl+C lo detiene.

Los scripts usan la sintaxis de variables de entorno de una shell POSIX (entorno Linux actual) para desactivar la telemetría de Astro. No publican nada. También incluyen --ignore-lock: en Astro 7.4.12 evita el modo automático en segundo plano cuando detecta un agente. Así el servidor sigue asociado a la terminal y Ctrl+C lo detiene; no queda un servicio oculto. Esto se contrastó con el código instalado de los comandos dev/preview y se añadió al contrato de configuración.

## Qué hace cada archivo

| Archivo | Para qué sirve |
| --- | --- |
| src/pages/index.astro | Primera ruta: la raíz /. Incluye el HTML y CSS de esta única página |
| astro.config.mjs | Configuración JavaScript; salida estática explícita |
| tsconfig.json | Configuración de las herramientas de Astro con preset base, aunque escribamos JavaScript |
| package.json | Versión exacta de Astro, scripts y límites de Node/npm; private evita publicación npm accidental |
| package-lock.json | Versiones e integridad de las dependencias resueltas |
| .npmrc | Caché dentro de .npm-cache, versiones exactas y sin solicitudes automáticas de audit/fund |
| .gitignore | Excluye dependencias, cachés, archivos generados y nombres habituales de secretos |
| tests/home.test.mjs | Contratos de contenido, estructura y configuración, no una prueba visual |

Los delimitadores `---` de index.astro contienen JavaScript ejecutado durante la generación: nombre, descripción y fecha de referencia. Las expresiones entre llaves insertan esos valores en HTML. No hay script de navegador. El style está acotado por Astro; :global se usa solo para las bases del documento.

No se extraen todavía layouts/componentes: será el siguiente ejercicio cuando esta primera página esté revisada. La edad se vincula a una fecha, no se calcula una fecha de nacimiento inventada.

## Dependencias y privacidad

Las dependencias se instalan en node_modules y la caché npm está en .npm-cache dentro del proyecto. La instalación inicial usa `npm install --ignore-scripts`: no ejecuta scripts de ciclo de vida de paquetes. La compilación real sirve para comprobar si los binarios opcionales instalados son suficientes; si no lo fueran, revisar el fallo antes de habilitar scripts.

No se instalan herramientas globales. No hay fuentes remotas, imágenes remotas, analítica, formularios ni servicios de terceros. No se han usado fotos personales. Las solicitudes a npm para descargar paquetes son parte de la instalación autorizada, no una publicación de la web. No se ha ejecutado una auditoría de vulnerabilidades: estos controles no garantizan seguridad universal.

Para una futura reinstalación revisada, con este lockfile y autorización para instalar, usar npm ci --ignore-scripts. Los artefactos node_modules, .npm-cache, .astro y dist se pueden regenerar; no son las fuentes de la aplicación.

## Verificación y límites

Verificado el 2026-11-14 en este entorno: npm install --ignore-scripts instaló 185 paquetes; npm test generó una página y superó tres tests. Se probaron dev y preview en puertos loopback temporales: raíz HTTP 200, ruta inexistente 404 y, en preview, bytes idénticos a dist/index.html. El CSS queda incrustado en el HTML en esta primera página. Los servidores de prueba se detuvieron y se comprobaron sus puertos cerrados. No se deja servidor activo.

Los tests fallaron antes de existir el HTML/configuración. La primera prueba de preview detectó el autoarranque en segundo plano de Astro bajo un agente; se detuvieron los servidores propios y se añadió --ignore-lock, con regresión observada antes y superada después. No se instaló otra herramienta para validar.

El rediseño del 2026-11-16 hacia un estilo cómic incorpora un cuarto test: verifica las parejas de colores de texto/fondo definidas en la paleta (contraste mínimo 4.5:1), foco presente y ausencia de animaciones/recursos remotos. Esto no es una auditoría completa de accesibilidad ni prueba todos los colores que un navegador pueda componer. Una generación correcta y respuestas HTTP no demuestran apariencia, accesibilidad completa, ausencia de desbordamiento o funcionamiento en todos los navegadores. El rediseño se comprobó además en Chromium headless a 1280 y 390 píxeles: sin desbordamiento horizontal en esos tamaños, sin scripts de navegador y primer Tab al enlace de salto. Se inspeccionaron las capturas ancha y estrecha; son una muestra del renderizado, no una garantía de todos los navegadores o tamaños. La aceptación estética final corresponde al usuario.
