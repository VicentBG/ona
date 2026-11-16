# La web de Ona · Primer paso con Astro

Una pequeña web para aprender Astro construyendo la página de Ona. Una sola página con los datos aportados: Ona, pointerdor, nueve meses en noviembre de 2026. Los textos de presentación son una propuesta de IA; no inventan vivencias, fotos ni rasgos de personalidad.

## Alcance de este paso

Una sola página prerenderizada, sin TypeScript en el código que escribimos, sin otras páginas, diario o servicios externos, y con una foto local de Ona. La portada se inspira en una referencia visual de mascotas: verde claro, amarillo, fondo blanco, curvas orgánicas y tarjetas suaves. La foto A elegida por el usuario —Ona mirando a cámara— sustituye al dibujo decorativo en un marco orgánico amarillo.

Añade el saludo «Hola, soy Ona.» letra a letra con rebote, bienvenida de la foto, entradas de bloques desde lados alternos y scroll suave entre anclas, respetando movimiento reducido. No utiliza librerías de animación ni modifica el scroll de rueda/táctil.

Código fuente: https://github.com/VicentBG/ona (repositorio público). El usuario autorizó con «commit/push» publicar el rediseño, las animaciones y la foto A con su fondo original, después de su incorporación local. Esta autorización cubre esta entrega, no otras fotos o publicaciones futuras.

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

npm test genera primero la web y después ejecuta diez tests: cinco contratos del HTML/configuración/paleta/saludo, uno del archivo WebP y sus bloques de metadatos, y cuatro pruebas de la mejora progresiva con dobles de APIs del navegador, mediante el runner de Node y sin otra librería de tests. Preview sirve la última generación; si cambias archivos, vuelve a generar. Ctrl+C lo detiene.

Los scripts usan la sintaxis de variables de entorno de una shell POSIX (entorno Linux actual) para desactivar la telemetría de Astro. No publican nada. También incluyen --ignore-lock: en Astro 7.4.12 evita el modo automático en segundo plano cuando detecta un agente. Así el servidor sigue asociado a la terminal y Ctrl+C lo detiene; no queda un servicio oculto. Esto se contrastó con el código instalado de los comandos dev/preview y se añadió al contrato de configuración.

## Qué hace cada archivo

| Archivo | Para qué sirve |
| --- | --- |
| src/pages/index.astro | Primera ruta: la raíz /. HTML, foto local y CSS; inicia la mejora progresiva de scroll |
| public/images/ona-portada.webp | Copia optimizada de la foto A, servida localmente sin procesamiento adicional de Astro |
| src/scripts/reveal.js | Módulo JavaScript de navegador que usa IntersectionObserver, con fallback y movimiento reducido |
| astro.config.mjs | Configuración JavaScript; salida estática explícita |
| tsconfig.json | Configuración de las herramientas de Astro con preset base, aunque escribamos JavaScript |
| package.json | Versión exacta de Astro, scripts y límites de Node/npm; private evita publicación npm accidental |
| package-lock.json | Versiones e integridad de las dependencias resueltas |
| .npmrc | Caché dentro de .npm-cache, versiones exactas y sin solicitudes automáticas de audit/fund |
| .gitignore | Excluye dependencias, cachés, archivos generados y nombres habituales de secretos |
| tests/home.test.mjs | Contratos de contenido, estructura, paleta y configuración, no una prueba visual |
| tests/reveal.test.mjs | Comportamiento del observador y los fallbacks mediante dobles, no renderizado |

Los delimitadores `---` de index.astro contienen JavaScript ejecutado durante la generación: nombre, descripción y fecha de referencia. Las expresiones entre llaves insertan esos valores en HTML. A diferencia del frontmatter, el bloque script de la página carga reveal.js en el navegador. Astro empaqueta ese módulo y puede incrustarlo directamente en el HTML si es pequeño. El style está acotado por Astro; :global se usa para las bases del documento.

## Movimiento sin perder contenido

- Saludo con doce letras/signos animados durante 700 ms cada uno, escalonados 65 ms: entrada completa en 1.415 segundos, con rebote y giro suaves. Las palabras se mantienen unidas al ajustar líneas y el h1 conserva un único nombre accesible; las letras decorativas se ocultan al árbol de accesibilidad. Foto y etiqueta también tienen entrada finita, sin repeticiones automáticas.
- Scroll suave nativo con CSS entre anclas: sin capturar wheel/touch ni reemplazar el desplazamiento normal.
- Los bloques de exploración, presentación y proyecto entran desde izquierda/izquierda/derecha, con desplazamiento lateral adaptable, subida leve, escala y opacidad durante 950 ms. Solo se preparan los bloques bajo el primer viewport y se muestran una vez al entrar; el foco de teclado también los revela. El contenedor recorta el desbordamiento horizontal del efecto, sin bloquear el scroll vertical.
- Sin JavaScript o IntersectionObserver, el contenido queda visible desde el HTML. Si la API falla durante la preparación, se retira cualquier estado pendiente.
- Con prefers-reduced-motion: reduce se desactivan letras, bienvenida, transiciones y scroll suave. Si la preferencia cambia durante la visita, se revela todo y se desconecta el observador.

No se extraen todavía layouts/componentes: será el siguiente ejercicio cuando esta primera página esté revisada. La edad se vincula a una fecha, no se calcula una fecha de nacimiento inventada.

## Dependencias y privacidad

Las dependencias se instalan en node_modules y la caché npm está en .npm-cache dentro del proyecto. La instalación inicial usa `npm install --ignore-scripts`: no ejecuta scripts de ciclo de vida de paquetes. La compilación real sirve para comprobar si los binarios opcionales instalados son suficientes; si no lo fueran, revisar el fallo antes de habilitar scripts.

No se instalan herramientas globales. No hay fuentes remotas, imágenes remotas, analítica, formularios ni servicios de terceros. Solo se ha incorporado la foto A de Ona, primero autorizada para uso local y después incluida en la autorización de commit/push de esta entrega. La copia WebP mide 720×959 píxeles, ocupa 58 258 bytes y se ha generado con ImageMagick disponible en el sistema, orientación aplicada y metadatos eliminados. No se guarda el enlace compartido del álbum, sus identificadores de acceso ni las otras fotos en el proyecto. El encuadre visible se adapta con CSS, sin modificar el original del álbum. Las solicitudes a npm para descargar paquetes son parte de la instalación autorizada, no una publicación de la web. No se ha ejecutado una auditoría de vulnerabilidades: estos controles no garantizan seguridad universal.

Para una futura reinstalación revisada, con este lockfile y autorización para instalar, usar npm ci --ignore-scripts. Los artefactos node_modules, .npm-cache, .astro y dist se pueden regenerar; no son las fuentes de la aplicación.

## Verificación y límites

Verificado el 2026-11-14 en este entorno: npm install --ignore-scripts instaló 185 paquetes; npm test generó una página y superó tres tests. Se probaron dev y preview en puertos loopback temporales: raíz HTTP 200, ruta inexistente 404 y, en preview, bytes idénticos a dist/index.html. El CSS queda incrustado en el HTML en esta primera página. Los servidores de prueba se detuvieron y se comprobaron sus puertos cerrados. No se deja servidor activo.

Los tests fallaron antes de existir el HTML/configuración. La primera prueba de preview detectó el autoarranque en segundo plano de Astro bajo un agente; se detuvieron los servidores propios y se añadió --ignore-lock, con regresión observada antes y superada después. No se instaló otra herramienta para validar.

El rediseño del 2026-11-16 hacia un estilo cómic incorpora un cuarto test: verifica las parejas de colores de texto/fondo definidas en la paleta (contraste mínimo 4.5:1), foco presente y ausencia de animaciones/recursos remotos. Esto no es una auditoría completa de accesibilidad ni prueba todos los colores que un navegador pueda componer. Una generación correcta y respuestas HTTP no demuestran apariencia, accesibilidad completa, ausencia de desbordamiento o funcionamiento en todos los navegadores. El rediseño se comprobó además en Chromium headless a 1280 y 390 píxeles: sin desbordamiento horizontal en esos tamaños, sin scripts de navegador y primer Tab al enlace de salto. Se inspeccionaron las capturas ancha y estrecha; son una muestra del renderizado, no una garantía de todos los navegadores o tamaños. La aceptación estética final corresponde al usuario.

Estado local posterior del 2026-11-16: referencia de mascotas aplicada, módulo progresivo y foto A autorizada para uso local. npm test supera nueve tests, incluidos la presencia de una sola foto local y la ausencia de bloques EXIF, XMP e ICCP en el WebP. La foto responde HTTP 200 con MIME image/webp y bytes idénticos al archivo preparado. Chromium headless comprobado a 1280, 390 y 320 píxeles sin desbordamiento horizontal y con la foto cargada a 720×959; capturas ancha/estrecha inspeccionadas. Se observaron la transición de revelado y el desplazamiento gradual de anclas, además de verificar contenido visible sin JS, movimiento reducido inicial y cambio de esa preferencia durante la visita. Primer Tab al enlace de salto y solo recursos locales en los seis escenarios. Servidor y navegador propios detenidos. Son pruebas de muestra en Chromium, no una auditoría completa ni aceptación estética del usuario. En esa comprobación los cambios aún eran locales; la autorización de publicación llegó después.

Refuerzo posterior de animaciones: diez tests pasan. En Chromium se comprobaron letras iniciales ya visibles mientras las finales aún entraban, demoras de 0 a 715 ms, nombre accesible único del encabezado y desplazamientos de signos opuestos para izquierda/derecha. Se repitieron los seis escenarios de navegador y se inspeccionaron capturas finales a 1280/390 píxeles. La foto original con fondo se conserva: el usuario rechazó el ensayo de recorte transparente, que nunca se aplicó a la portada.
