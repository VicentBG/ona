# La web de Ona · Astro paso a paso

Una pequeña web para aprender Astro construyendo la web de Ona. Inicio conserva los datos aportados: Ona, pointerdor, nueve meses en noviembre de 2026. Su historia conserva el comienzo aprobado, con nacimiento el 14 de febrero de 2026 y llegada aproximada con un mes y pico, y añade el recuerdo de la primera noche contado por el usuario. Los textos de presentación son una propuesta de IA; no se añaden otras vivencias ni rasgos de personalidad.

## Alcance de este paso

Seis páginas prerenderizadas: Inicio (/), Su historia (/su-historia/), Diario (/diario/) y tres entradas Markdown, sin TypeScript en el código que escribimos ni servicios externos, y con una foto local de Ona en Inicio, dos fotos de cachorra en Su historia y una foto ilustrativa en cada entrada del Diario (incorporadas primero en local y después autorizadas para este commit/push). El usuario autorizó con «commit/push» publicar la segunda ruta y su navegación, entregadas en b1616f9. Después de revisar la ampliación con fotos y texto, el usuario autorizó su commit/push: incluye únicamente las dos fotos de cachorra seleccionadas y sus variantes, el recuerdo de la primera noche y esta entrega de historia. No autoriza publicar otras fotos ni desplegar la web. La portada se inspira en una referencia visual de mascotas: verde claro, amarillo, fondo blanco, curvas orgánicas y tarjetas suaves. La foto A elegida por el usuario —Ona mirando a cámara— sustituye al dibujo decorativo en un marco orgánico amarillo.

Añade el saludo «Hola, soy Ona.» letra a letra con rebote, bienvenida de la foto, entradas de bloques desde lados alternos y scroll suave entre anclas, respetando movimiento reducido. No utiliza librerías de animación ni modifica el scroll de rueda/táctil.

Código fuente: https://github.com/VicentBG/ona (repositorio público). El usuario autorizó con «commit/push» publicar el rediseño, las animaciones y la foto A con su fondo original, después de su incorporación local. Esta autorización cubre esta entrega, no otras fotos o publicaciones futuras.

El usuario autorizó inicialmente Git y la publicación del código, no el hosting. La preparación local para GitHub Pages está ahora autorizada como P1; la activación y el despliegue siguen pendientes. No se incluyen notas privadas, cachés, dependencias instaladas ni archivos de configuración personal.

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

npm test genera primero las seis páginas en raíz y después ejecuta treinta y ocho tests: cuatro nuevos contratos de subruta/workflow/comprobador y los treinta y cuatro anteriores: dos de novedades en Inicio, siete del diario, cinco contratos del HTML/configuración/paleta/saludo, uno del WebP de portada, nueve pruebas de la mejora progresiva, tres del layout y siete de historia/navegación/fotos. Uno de los tests del layout compila una página de prueba con props y contenido distintos en una raíz temporal, reutilizando las dependencias instaladas y eliminando solo su propia copia al terminar; no añade rutas al sitio activo. Se usa el runner de Node, sin otra librería de tests. Preview sirve la última generación; si cambias archivos, vuelve a generar. Ctrl+C lo detiene.

Los scripts usan la sintaxis de variables de entorno de una shell POSIX (entorno Linux actual) para desactivar la telemetría de Astro. No publican nada. También incluyen --ignore-lock: en Astro 7.4.12 evita el modo automático en segundo plano cuando detecta un agente. Así el servidor sigue asociado a la terminal y Ctrl+C lo detiene; no queda un servicio oculto. Esto se contrastó con el código instalado de los comandos dev/preview y se añadió al contrato de configuración.

## Preparación local para GitHub Pages — P1

Destino previsto, **todavía no activado ni publicado**: https://vicentbg.github.io/ona/. La configuración declara site=https://vicentbg.github.io; ONA_BASE selecciona la subruta. Sin esa variable, dev, build y preview conservan la raíz /.

```bash
# Desde la raíz del proyecto, shell POSIX. No publica nada.
npm test
ONA_BASE=/ona/ npm run build
node scripts/check-site.mjs dist /ona/
ONA_BASE=/ona/ npm run preview
```

Para esa última revisión abre http://127.0.0.1:4321/ona/ (o el puerto indicado), no la raíz del servidor. Preview sirve el último dist: utiliza la misma base en build y preview. También puedes usar ONA_BASE=/ona/ npm run dev para desarrollar con el prefijo. Para volver al modo habitual, npm run build y npm run preview sin ONA_BASE. Los comandos no cambian preferencias ni configuran un hosting.

Astro no antepone base a cadenas de HTML escritas a mano. conBase añade el prefijo a enlaces, imágenes y cada candidato de srcset; acepta las URLs Markdown ya prefijadas sin duplicarlo. sinBase permite comparar la página actual con las rutas locales. Los saltos #contenido dentro de la misma página siguen siendo relativos al documento; los accesos a secciones de Inicio desde otras páginas utilizan /ona/#… en ese build. Son transformaciones en generación, no un router de navegador.

npm test mantiene los contratos anteriores en raíz y añade un build aislado con /ona/ que no sustituye el dist activo. El comprobador recorre las rutas y referencias href/src/srcset del HTML generado y exige destinos/anclas existentes dentro de la base; incluye negativos para escape a raíz, doble prefijo y ancla ausente. No es un parser completo ni verifica URLs construidas por CSS/JS, HTTP, apariencia o accesibilidad integral.

El workflow solo admite workflow_dispatch y ejecuta su job únicamente desde main. Usa Node 26.13.1, npm ci --ignore-scripts, npm test, build explícito /ona/, comprobación del artefacto final y subida de dist mediante upload-pages-artifact; las acciones están fijadas a SHA. No mantiene credenciales en el checkout. Solo necesita contents: read, sin permisos de despliegue. Una instalación, prueba, generación o comprobación fallida impide llegar a la subida por el comportamiento secuencial de los steps, sin continue-on-error. El artefacto dura un día; no es una publicación web.

No contiene push, configure-pages ni deploy-pages, y no habilita Pages. **No se ha ejecutado en GitHub**: ni se ha subido este workflow ni se ha verificado la instalación o subida del artefacto en un runner remoto. En P2, tras revisión y permiso específicos, se añadirá el despliegue y el disparo por push a main; a partir de entonces, cada push autorizado actualizará también la web si pasan los checks. Esto no concede permiso para hacer commits/push autónomos.

Guía html de modern-web-guidance consultada para conservar enlaces nativos, semántica y dimensiones/prioridades de las imágenes; no se cambian diseño, relatos, fotos, animaciones ni las reformas aplazadas. Referencias: [Astro y GitHub Pages](https://docs.astro.build/en/guides/deploy/github/), [base de Astro](https://docs.astro.build/en/reference/configuration-reference/#base) y action.yml de las versiones fijadas en los repositorios oficiales actions/checkout, actions/setup-node y actions/upload-pages-artifact. Fijar un SHA no certifica la seguridad de todo su código o sus dependencias transitivas.

## Qué hace cada archivo

| Archivo | Para qué sirve |
| --- | --- |
| src/pages/index.astro | Ruta /. Contenido y CSS de Inicio, datos de Ona e inicialización del revelado; utiliza BaseLayout |
| src/pages/su-historia.astro | Ruta /su-historia/. Comienzo aprobado, primera noche relatada por el usuario, dos fotos adaptativas y CSS estático; reutiliza BaseLayout sin script |
| src/pages/diario/index.astro | Listado completo a partir de entradasDiario |
| src/data/diario.js | Importación Markdown en build compartida por Inicio y Diario, ordenada por orden |
| src/pages/diario/*.md | Tres relatos, los dos iniciales editados por IA y la práctica escrita por el usuario, con titulo, descripcion, orden de presentación y layout; sin fechas inventadas |
| src/layouts/EntradaDiario.astro | Recibe frontmatter, reutiliza BaseLayout y presenta el cuerpo Markdown en su slot |
| src/layouts/BaseLayout.astro | Documento HTML, metadatos mediante props, enlace de salto, cabecera, main con slot y pie |
| src/components/Cabecera.astro | Marca y navegación, con sus estilos locales |
| src/components/Pie.astro | Pie de página, con sus estilos locales |
| src/styles/global.css | Paleta, bases, foco, contenedor y marca compartidos; importado una vez desde el layout |
| public/images/ona-portada.webp | Copia optimizada de la foto A, servida localmente sin procesamiento adicional de Astro |
| public/images/diario/ | Dos fotos ilustrativas seleccionadas y autorizadas para esta entrega, con variantes WebP de 480 y 960 px |
| public/images/historia/ | Dos fotos de cachorra, cada una con variantes WebP de 480 y 960 px; sin acceso remoto al álbum desde la web |
| src/scripts/reveal.js | Módulo JavaScript de navegador que usa IntersectionObserver, con fallback y movimiento reducido |
| astro.config.mjs | Salida estática, site y base seleccionada mediante ONA_BASE |
| src/utils/urls.js | Prefijo de enlaces/recursos y ruta local para aria-current, solo durante el build |
| scripts/check-site.mjs | Comprueba destinos, anclas y recursos declarados en el HTML de dist |
| tests/pages.test.mjs | Raíz/subruta, build aislado /ona/, negativos y contrato del workflow manual |
| .github/workflows/pages.yml | Checks y artefacto manual; sin activación de Pages ni despliegue en P1 |
| tsconfig.json | Configuración de las herramientas de Astro con preset base, aunque escribamos JavaScript |
| package.json | Versión exacta de Astro, scripts y límites de Node/npm; private evita publicación npm accidental |
| package-lock.json | Versiones e integridad de las dependencias resueltas |
| .npmrc | Caché dentro de .npm-cache, versiones exactas y sin solicitudes automáticas de audit/fund |
| .gitignore | Excluye dependencias, cachés, archivos generados y nombres habituales de secretos |
| tests/home.test.mjs | Contratos de contenido, estructura, paleta y configuración, no una prueba visual |
| tests/reveal.test.mjs | Comportamiento del observador y los fallbacks mediante dobles, no renderizado |
| tests/layout.test.mjs | Composición, documento único y compilación aislada con otras props y contenido |
| tests/history.test.mjs | Historia y fotos conservadas, cinco rutas, documentos, metadatos y destinos de navegación |
| tests/diary.test.mjs | Listado Markdown, layout compartido, relatos aprobados, detalle del sofá y estado de navegación |

Los delimitadores `---` de index.astro contienen JavaScript ejecutado durante la generación: nombre, descripción y fecha de referencia. Las expresiones entre llaves insertan esos valores en HTML. A diferencia del frontmatter, el bloque script de la página carga reveal.js en el navegador. Astro empaqueta ese módulo y puede incrustarlo directamente en el HTML si es pequeño. Los bloques style de la página y los componentes están acotados por Astro; las bases comunes viven en global.css. Mover el HTML a un componente también requiere mover sus estilos: el CSS acotado de Inicio no estiliza automáticamente el interior de Cabecera o Pie.

## Layout, componentes, props y slot

Inicio importa BaseLayout y lo usa como una etiqueta:

```astro
<BaseLayout titulo="Ona · Mi primera web con Astro" descripcion="Presentación de Ona">
  <!-- Las secciones de Inicio van aquí. -->
</BaseLayout>
```

- **Importar** permite utilizar un archivo .astro como componente. BaseLayout importa Cabecera y Pie; la ruta importa BaseLayout.
- **Props** son datos enviados mediante atributos. El layout recibe titulo y descripcion mediante Astro.props y los coloca en title y meta; no son las variables de presentación de la página.
- **Slot** es el lugar del layout donde se inserta el contenido entre sus etiquetas. El layout contiene un único main y la página aporta sus secciones, no otro documento HTML.
- Cada archivo dentro de src/pages genera una ruta: src/pages/su-historia.astro produce /su-historia/ y dist/su-historia/index.html. No hace falta registrar rutas ni añadir un router de navegador.
- Cabecera utiliza Astro.url.pathname durante el build para marcar el enlace actual con aria-current="page"; dentro de una entrada marca Diario como sección con aria-current="location", sin fingir que el listado es la página abierta. El subrayado identifica visualmente la página actual sin depender solo del color. Es HTML generado, no JavaScript que se descargue en el navegador.
- Los enlaces / y /su-historia/ permiten cambiar de página; /#sobre-ona y /#proyecto siempre apuntan a las secciones de Inicio, también desde Su historia. La marca de cabecera y pie vuelve a /. La navegación usa una única lista de enlaces que se ajusta en varias líneas, sin menú desplegable ni nuevas APIs/polyfills.

## Movimiento sin perder contenido

- Saludo con doce letras/signos animados durante 700 ms cada uno, escalonados 65 ms: entrada completa en 1.415 segundos, con rebote y giro suaves. Las palabras se mantienen unidas al ajustar líneas y el h1 conserva un único nombre accesible; las letras decorativas se ocultan al árbol de accesibilidad. Foto y etiqueta también tienen entrada finita, sin repeticiones automáticas.
- Scroll suave nativo con CSS entre anclas: sin capturar wheel/touch ni reemplazar el desplazamiento normal.
- Los bloques de exploración, presentación y proyecto entran desde izquierda/izquierda/derecha, con desplazamiento lateral adaptable, subida leve, escala y opacidad durante 950 ms. Inicialmente solo se preparan los bloques bajo el primer viewport, pero se mantienen todos observados: al entrar se revelan y, al subir hasta que salen por el borde inferior de la zona de activación, regresan a su lado original. Al volver a bajar repiten la entrada. La zona termina al 60% de la altura del viewport: reserva el 40% inferior para que la salida inversa empiece antes y se vea, en vez de esperar a que el bloque esté casi fuera. El margen se recalcula al redimensionar y usa umbrales de entrada/salida separados para evitar oscilaciones. No se ocultan al salir por arriba ni mientras contienen el foco. La primera notificación tampoco oculta bloques ya visibles al cargar; el foco de teclado siempre los revela. El contenedor recorta el desbordamiento horizontal del efecto, sin bloquear el scroll vertical.
- Sin JavaScript o IntersectionObserver, el contenido queda visible desde el HTML. Si la API falla durante la preparación, se retira cualquier estado pendiente.
- Con prefers-reduced-motion: reduce se desactivan letras, bienvenida, transiciones y scroll suave. Si la preferencia cambia durante la visita, se revela todo y se desconecta el observador.

Layout, cabecera y pie están compartidos por las seis páginas. Su historia y Diario son estáticos: sin scripts ni animaciones nuevas; las fotos no dependen de JavaScript. La edad de Inicio se vincula a una fecha; la fecha de nacimiento incorporada a Su historia fue confirmada directamente por el usuario.

## Segunda ruta local: Su historia

Para revisarla, ejecuta npm run dev y abre /su-historia/ en la dirección local indicada. Conserva Un comienzo en febrero y el párrafo aprobado. La ampliación añade La primera noche con el recuerdo aportado por el usuario y texto editorial de acompañamiento, no más anécdotas. El usuario contó que tuvo que dormir con ella porque echaba de menos a su mamá; la página lo parafrasea, no lo presenta como una cita literal. No se inventan el día exacto de llegada, conductas o datos del resumen de Gemini. El contenido, las fotos y la navegación funcionan sin JavaScript.

Se revisaron 51 miniaturas y se ampliaron tres candidatas; se incorporan solo dos de cachorra, sin personas visibles: Ona sobre una manta gris y acurrucada junto a un peluche. Las fotos acompañan el relato, pero no se afirma que sean de aquella primera noche. Se conservan el fondo y el encuadre completos, con pies descriptivos, sin carrusel, recorte de fondo o zoom interactivo.

Las variantes WebP de 480/960 px se eligen mediante srcset y sizes. Se declaran dimensiones intrínsecas y las imágenes mantienen block-size: auto, sin recortarlas. La foto superior es candidata a LCP: fetchpriority="high", sin lazy loading. La segunda usa loading="lazy" y prioridad predeterminada. Sin preloads duplicados ni prioridades altas para ambas. CSS Grid pasa a una columna en pantallas estrechas; los tamaños tipográficos nuevos combinan rem y viewport dentro de clamp. Guías consultadas: html, accessibility, optimize-image-priority y responsive-design.

En este paso se consultaron con modern-web-guidance las guías navbar, html y accessibility: enlaces nativos, lista semántica única, página actual generada en build, indicador no limitado al color, títulos propios y jerarquía h1/h2. No se introdujo el menú popover del ejemplo: los enlaces caben ajustándose en líneas y el alcance no necesita un menú colapsable. Se mantiene el foco global con outline y las nuevas áreas de enlace de cabecera miden al menos 32 px de alto con la fuente predeterminada. Las reformas de animaciones y ampliación de texto detectadas en la revisión anterior no se ejecutan por indicación del usuario; no afirmar conformidad integral de accesibilidad por estas comprobaciones.

## Diario local y Markdown

Paso local autorizado tras aprobar los dos relatos y añadir que al volver lo primero que vieron fue a Ona encima del sofá: la sorpresa fue mayúscula. No se afirma una caída o lesión. El otro relato conserva la convivencia con dos gatos mayores sin inventar amistad. No hay fechas aportadas, CMS, colecciones ni dependencias nuevas. Posteriormente el usuario aprobó con «ok» añadir en local las dos fotos seleccionadas del álbum: Ona en el sofá granate y Ona con un gato atigrado en el sofá estampado. Ese permiso inicial era solo local. Tras el informe del resultado, el usuario autorizó «commit/push y dime qué sigue»: publicación del Diario con sus dos fotos y cuatro variantes, navegación, pruebas y README. No incluye otras fotos, publicaciones futuras ni despliegue.

- /diario/: listado de recuerdos, no cronología fechada.
- /diario/una-puerta-corredera-y-una-sorpresa/
- /diario/ona-y-los-dos-gatos-de-casa/

Cada archivo .md lleva propiedades YAML entre delimitadores `---`: layout apunta a EntradaDiario.astro; titulo y descripcion alimentan la página y el listado; orden controla solo la presentación. El cuerpo se convierte en HTML y llega al slot del layout; no debe repetir el h1 que ya dibuja el layout. EntradaDiario recibe esos datos en Astro.props.frontmatter y reutiliza BaseLayout. Para añadir otra entrada, crear otro .md con esos campos y un orden, sin duplicarla manualmente en el índice. import.meta.glob se ejecuta en build, no en el navegador.

El campo opcional foto del frontmatter contiene archivo (nombre base local), alt y pie. Para fotos con otra proporción, añadir ancho y alto de la variante de 960 px; por compatibilidad los valores predeterminados son 960 × 721. EntradaDiario lo convierte en una figura antes del relato, con variantes srcset/sizes, dimensiones y altura automática; no se recorta el encuadre ni se modifica el relato. La foto superior de cada entrada es candidata a LCP: prioridad alta sin lazy; el listado sigue sin imágenes. Pies: «Ona, instalada en el sofá.» y «Compartiendo sofá, cada uno a lo suyo.». No se fecha la foto del sofá como aquel suceso ni se afirma que en la segunda aparezcan ambos gatos. Guía html consultada para figuras y carga de imágenes.

Consultadas guías html, typography y navbar antes de implementar. Se mantienen enlaces nativos ajustables y sin menú JS; lectura de ancho acotado, tipografía relativa y tarjetas estáticas. No se aplican reformas anteriores aplazadas por el usuario.

## Dependencias y privacidad

Las dependencias se instalan en node_modules y la caché npm está en .npm-cache dentro del proyecto. La instalación inicial usa `npm install --ignore-scripts`: no ejecuta scripts de ciclo de vida de paquetes. La compilación real sirve para comprobar si los binarios opcionales instalados son suficientes; si no lo fueran, revisar el fallo antes de habilitar scripts.

No se instalan herramientas globales. No hay fuentes remotas, imágenes remotas, analítica, formularios ni servicios de terceros. La foto A de Ona se incorporó primero para uso local y después quedó incluida en una autorización de commit/push. Las dos fotos de cachorra de la ampliación posterior de historia se incorporaron primero en local y ahora cuentan con autorización explícita de commit/push para esta entrega. La copia WebP mide 720×959 píxeles, ocupa 58 258 bytes y se ha generado con ImageMagick disponible en el sistema, orientación aplicada y metadatos eliminados. No se guarda el enlace compartido del álbum, sus identificadores de acceso ni fotos no seleccionadas en el proyecto. El encuadre visible se adapta con CSS, sin modificar el original del álbum. Las solicitudes a npm para descargar paquetes son parte de la instalación autorizada, no una publicación de la web. No se ha ejecutado una auditoría de vulnerabilidades: estos controles no garantizan seguridad universal.

Para una futura reinstalación revisada, con este lockfile y autorización para instalar, usar npm ci --ignore-scripts. Los artefactos node_modules, .npm-cache, .astro y dist se pueden regenerar; no son las fuentes de la aplicación.

Las fotos de historia se prepararon con ImageMagick ya instalado, orientación aplicada, redimensionado proporcional, calidad WebP 80 y metadatos eliminados. Variantes de la manta: 480×639 (61 610 bytes) y 960×1279 (159 642 bytes); del peluche: 480×360 (30 756 bytes) y 960×721 (92 428 bytes). Las cuatro suman 344 436 bytes: es el conjunto de archivos, no lo descargado por una visita. No se conservan bloques EXIF/XMP/ICCP. El álbum y originales quedan intactos; solo las cuatro variantes están en public/images/historia. El HTML de revisión, enlaces de medios, otras fotos y candidatas descartadas quedan fuera del proyecto en un directorio temporal local; no se guardan enlaces de acceso en código o documentación pública.

Fotos del Diario: ImageMagick existente, orientación aplicada, redimensionado proporcional, calidad WebP 80 y metadatos eliminados. Sofá: 480×360 / 27 058 bytes y 960×721 / 94 882 bytes; Ona y gato: 480×360 / 42 924 bytes y 960×721 / 142 670 bytes. Total 307 534 bytes de archivos, no transferencia por visita. Sin EXIF/XMP/ICCP. Solo cuatro variantes en public/images/diario; originales, miniaturas y descartes del álbum fuera del proyecto.

## Últimas entradas en Inicio

Inicio y Diario importan entradasDiario desde src/data/diario.js: una sola importación de Markdown en build mediante import.meta.glob. El Diario conserva el orden ascendente; Inicio usa slice(-3).reverse() para mostrar como máximo tres entradas por orden descendente, sin modificar la lista original ni inventar fechas. El campo orden es presentación editorial, no cronología de los recuerdos. Añadir otra entrada con un orden mayor actualiza ambas vistas al generar.

La sección Últimas entradas del Diario contiene títulos enlazados, resúmenes del frontmatter y acceso al listado completo. Tarjetas article dentro de una lista, enlaces nativos en h3 y cuadrícula adaptable al espacio; sin imágenes, nuevos scripts, animaciones, dependencias o CMS. Ajustado el texto de Inicio que aún anunciaba historia/diario como futuros. Portada y reveal.js conservados. Implementada y comprobada primero en local; el usuario autorizó después «commit/push y avanza a la siguiente fase». Este permiso cubre esta entrega y la revisión de cierre local, no despliegue ni publicaciones futuras.

Verificación de este paso: dos tests nuevos fallaron primero; build de seis rutas y veinticinco tests focalizados (home-diary/home/diary/history/layout) correctos. No repetidos nueve tests de reveal.js, que no cambia. Chromium con JS desactivado: tres columnas a 1280, una a 390/320; tres enlaces con la entrada nueva primero, sin desbordamiento en la sección incluso con fuente raíz 200%/320 (no certifica contenido heredado). Capturas escritorio/móvil inspeccionadas. Foco visible tras activar modalidad de teclado y Enter desde el primer enlace abre la entrada humana; foto cargada con proporción 3:4, ruta y foto HTTP 200/bytes de build. Primer intento de comprobar foco programático sin modalidad teclado falló; recorrido repetido con Tab y emulación de foco correcto, sin cambiar el CSS. Servidor estático loopback y navegador propios detenidos; sin repetir dev/preview, Safari/Firefox o lector de pantalla. Guías html/card consultadas.

## Práctica humana: La friolera de la casa

Entrada y foto aportadas por el usuario; cuerpo, título, descripción y pie conservados. Solo se añaden foto.ancho=960 y foto.alto=1280 para reservar la proporción vertical correcta. Copias originales WebP respaldadas fuera del repositorio; eliminados EXIF/XMP/ICCP sin recodificar la imagen: píxeles decodificados idénticos antes/después. Variantes 480×640 (58 630 bytes) y 960×1280 (164 744 bytes), sin ampliar publicación a otras imágenes. Limpieza/ajuste y commit/push autorizados expresamente; no despliegue. La ruta /diario/la-friolera-de-la-casa/ se incorpora al índice automáticamente con orden 3. Publicada en bff6dccc950bbde77fb3891f876560b7e4601c8f; build y diecisiete tests focalizados de Diario/historia/layout correctos antes del commit.

## Verificación y límites

Ampliación fotográfica del Diario del 2026-11-20: dos nuevos tests fallaron antes de añadir fotos/figuras; después build de cinco rutas y treinta y dos tests pasan. Chromium verificó listado/entradas a 1280/390/320 sin JS, imágenes decodificadas, proporciones sin recorte y sin desbordamiento observado. Ambas variantes de 960 px seleccionadas a 390 px/densidad 2. HTTP 200/MIME WebP y bytes iguales al archivo generado; cinco rutas iguales al build. Repetidos Tab/Enter, retorno al listado, encabezados accesibles, subrayado con colores forzados y fuente raíz 200%/320 sin desbordamiento en contenido nuevo (no certifica pie heredado). Capturas móvil de la puerta y escritorio de gatos inspeccionadas. Servidor estático loopback y navegador propios detenidos; sin repetir dev/preview, lector de pantalla o Safari/Firefox. Solo local; no staging/commit/push/despliegue. Inicio, historia, reveal.js y dependencias intactos.

Diario local del 2026-11-20: cinco tests nuevos fallaron antes de existir las rutas. Después npm test genera cinco páginas y supera treinta tests; se corrigió una comparación de mayúsculas del test, no el relato. Chromium verificó las tres páginas nuevas a 1280/390/320 px con JavaScript desactivado, sin desbordamiento observado con fuente predeterminada; capturas de las tres a 390 px inspeccionadas. Fuente raíz al 200%/320 px sin desbordamiento en el contenido nuevo, no certifica el pie heredado. Tab/Enter comprobados para salto al contenido, primera entrada y vuelta al listado; Diario alcanzable en la cabecera, y subrayado conservado con colores forzados. Árbol de accesibilidad con encabezados comprobado, sin auditoría de lector de pantalla ni Safari/Firefox. Cinco rutas HTTP 200 y bytes idénticos al build mediante servidor estático loopback temporal; no se repitieron dev/preview de Astro. Un primer intento de navegador coincidió con la regeneración de dist y no encontró el h1; repetido después del build, el recorrido completo pasó. Servidor y navegador propios detenidos. Sin staging, commit/push ni despliegue; .vscode/settings.json sigue ajeno e intacto.

Verificado el 2026-11-14 en este entorno: npm install --ignore-scripts instaló 185 paquetes; npm test generó una página y superó tres tests. Se probaron dev y preview en puertos loopback temporales: raíz HTTP 200, ruta inexistente 404 y, en preview, bytes idénticos a dist/index.html. El CSS queda incrustado en el HTML en esta primera página. Los servidores de prueba se detuvieron y se comprobaron sus puertos cerrados. No se deja servidor activo.

Los tests fallaron antes de existir el HTML/configuración. La primera prueba de preview detectó el autoarranque en segundo plano de Astro bajo un agente; se detuvieron los servidores propios y se añadió --ignore-lock, con regresión observada antes y superada después. No se instaló otra herramienta para validar.

El rediseño del 2026-11-16 hacia un estilo cómic incorpora un cuarto test: verifica las parejas de colores de texto/fondo definidas en la paleta (contraste mínimo 4.5:1), foco presente y ausencia de animaciones/recursos remotos. Esto no es una auditoría completa de accesibilidad ni prueba todos los colores que un navegador pueda componer. Una generación correcta y respuestas HTTP no demuestran apariencia, accesibilidad completa, ausencia de desbordamiento o funcionamiento en todos los navegadores. El rediseño se comprobó además en Chromium headless a 1280 y 390 píxeles: sin desbordamiento horizontal en esos tamaños, sin scripts de navegador y primer Tab al enlace de salto. Se inspeccionaron las capturas ancha y estrecha; son una muestra del renderizado, no una garantía de todos los navegadores o tamaños. La aceptación estética final corresponde al usuario.

Estado local posterior del 2026-11-16: referencia de mascotas aplicada, módulo progresivo y foto A autorizada para uso local. npm test supera nueve tests, incluidos la presencia de una sola foto local y la ausencia de bloques EXIF, XMP e ICCP en el WebP. La foto responde HTTP 200 con MIME image/webp y bytes idénticos al archivo preparado. Chromium headless comprobado a 1280, 390 y 320 píxeles sin desbordamiento horizontal y con la foto cargada a 720×959; capturas ancha/estrecha inspeccionadas. Se observaron la transición de revelado y el desplazamiento gradual de anclas, además de verificar contenido visible sin JS, movimiento reducido inicial y cambio de esa preferencia durante la visita. Primer Tab al enlace de salto y solo recursos locales en los seis escenarios. Servidor y navegador propios detenidos. Son pruebas de muestra en Chromium, no una auditoría completa ni aceptación estética del usuario. En esa comprobación los cambios aún eran locales; la autorización de publicación llegó después.

Refuerzo posterior de animaciones: diez tests pasan. En Chromium se comprobaron letras iniciales ya visibles mientras las finales aún entraban, demoras de 0 a 715 ms, nombre accesible único del encabezado y desplazamientos de signos opuestos para izquierda/derecha. Se repitieron los seis escenarios de navegador y se inspeccionaron capturas finales a 1280/390 píxeles. La foto original con fondo se conserva: el usuario rechazó el ensayo de recorte transparente, que nunca se aplicó a la portada.

Ajuste posterior al commit 7895ddb: entradas laterales reversibles al subir, sin repetir el saludo inicial. Catorce tests pasan, incluidas reversión/reentrada, salida por arriba, margen inicial visible, umbral, foco y notificaciones pendientes tras activar movimiento reducido. En Chromium se observaron transiciones de vuelta al lado original y nueva entrada a 1280/390/320 píxeles, sin desbordamiento. También se comprobaron bloques con foco, contenido sin JS y preferencia reducida inicial/en vivo en seis escenarios. Servidor y navegador propios detenidos. En ese momento el ajuste seguía local; posteriormente el usuario validó el afinado y autorizó su commit/push.

Ajuste del 2026-11-18 tras probar la reversión: sustituido el margen fijo de 120 px por un 40% de la altura, recalculado al redimensionar. Quince tests pasan, incluida la regresión del margen y su desconexión con movimiento reducido. En seis escenarios Chromium se comprobaron reversión y reentrada a 1280/390/320 píxeles: durante la transición inversa quedaba una zona de pantalla de al menos el 28% de su altura por debajo del borde superior del bloque, en lugar de iniciarse casi fuera. También se comprobó el margen tras reducir 200 px la altura de cada viewport normal, el foco y los fallbacks. Sin desbordamiento; procesos propios detenidos. El usuario confirmó «correcto, commit/push»: ajuste visual validado y publicación de esta entrega autorizada, sin extender el permiso a futuros cambios o despliegues.

Paso local del 2026-11-18: extraídos BaseLayout, Cabecera y Pie, con bases CSS compartidas y estilos locales en sus propietarios. Dieciocho tests pasan, incluido un build aislado de otras props y contenido del slot. Las nuevas pruebas fallaron antes de existir el layout; se corrigió también la ruta inicialmente supuesta del ejecutable de la prueba usando el binario local real. DOM normalizado y metadatos antes/después idénticos; capturas estáticas con movimiento reducido a 1280/390/320 píxeles comparadas con ImageMagick: cero píxeles distintos en los tres tamaños. Se repitieron los seis escenarios Chromium de reversión/reentrada, resize, foco y fallbacks, sin desbordamiento. Procesos propios detenidos. Solo se genera la ruta /; no se cambian la foto ni los datos de Ona, ni se incorpora aún el borrador de su historia. Sin nuevas dependencias o TypeScript escrito. El usuario confirmó «todo correcto, commit/push»: extracción aceptada y publicación de esta entrega autorizada, sin incluir nuevas rutas, el borrador de Su historia o despliegue.

Segunda ruta local del 2026-11-20: autorización «ok» al alcance de Su historia, reutilización del layout y adaptación de navegación, sin publicación. Los cuatro contratos nuevos fallaron antes de existir la ruta y la navegación; build y veintidós tests pasan después. En Chromium se comprobaron ambas páginas a 1280/390/320 píxeles sin desbordamiento con la fuente predeterminada, página actual correcta y enlaces visibles de cabecera de al menos 24 px de alto. Navegación real con Tab/Enter entre rutas, salto al contenido, retorno a Inicio y enlace Sobre Ona desde la historia satisfactorios. Comprobados contenido y estado actual sin JS, jerarquía de encabezados en el árbol de accesibilidad y subrayado activo con colores forzados. Capturas ancha/estrecha de la historia inspeccionadas. Un servidor estático temporal en loopback sirvió los artefactos de ambas rutas con HTTP 200 y bytes iguales al build; no se repitieron dev/preview de Astro en este paso. Servidor y navegador propios detenidos. Sin auditoría completa con lector de pantalla ni pruebas en Safari/Firefox; revisión del usuario pendiente. Sin cambios en la foto, el contenido de Inicio ni reveal.js, dependencias o configuración personal; en esa comprobación aún sin commit/push o despliegue. Después el usuario autorizó «commit/push y redondea la página con fotos de cuando era pequeña y algo más de texto alrededor»: publicación de esta versión de historia y navegación, sin incorporar aún fotos adicionales o relatos no aportados.

Ampliación local del 2026-11-20 tras recibir de nuevo el álbum y el recuerdo humano: dos fotos seleccionadas y primera noche integradas, manteniendo el comienzo. Tres nuevos contratos fallaron primero y después pasan; build y veinticinco tests correctos, incluidas variantes, presupuesto de archivos, metadatos, prioridades y navegación. En Chromium, ambas rutas a 1280/390/320 sin desbordamiento con la fuente predeterminada; fotos decodificadas y variantes locales seleccionadas. A 390 px y densidad 2 se eligieron ambas variantes de 960 px; a densidad 1 y móvil se usaron las de 480 px. Comprobados fotos sin JS, navegación Tab/Enter, anclas entre rutas y jerarquía accesible. Una prueba de fuente raíz al 200% a 320 px no detectó desbordamiento en el artículo nuevo; no corrige ni certifica el pie o Inicio heredados. Capturas completas ancha/estrecha inspeccionadas. Servidor estático de artefactos en loopback y navegador propios detenidos. Sin auditoría completa, lector de pantalla, métricas de campo o pruebas en Safari/Firefox; no se repitieron dev/preview de Astro. En esa comprobación eran cambios locales sobre b1616f9, sin staging, commit/push ni despliegue nuevo. Después del informe y las capturas, el usuario autorizó «commit/push» de esta ampliación: fotos seleccionadas con variantes y texto de la primera noche, tests y README. La autorización no incluye otras fotos, futuras entregas ni despliegue.
