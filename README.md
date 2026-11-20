# La web de Ona · Astro paso a paso

Una pequeña web para aprender Astro construyendo la web de Ona. Inicio conserva los datos aportados: Ona, pointerdor, nueve meses en noviembre de 2026. Su historia incorpora únicamente el comienzo aprobado por el usuario, con nacimiento el 14 de febrero de 2026 y llegada aproximada con un mes y pico. Los textos de presentación son una propuesta de IA; no se añaden otras vivencias ni rasgos de personalidad.

## Alcance de este paso

Dos páginas prerenderizadas, Inicio (/) y Su historia (/su-historia/), sin TypeScript en el código que escribimos, sin diario o servicios externos, y con una foto local de Ona solo en Inicio. El usuario ha autorizado con «commit/push» publicar esta segunda ruta y su navegación. La ampliación posterior con fotos de pequeña y más texto sigue pendiente de selección de material; no se autoriza desplegar la web. La portada se inspira en una referencia visual de mascotas: verde claro, amarillo, fondo blanco, curvas orgánicas y tarjetas suaves. La foto A elegida por el usuario —Ona mirando a cámara— sustituye al dibujo decorativo en un marco orgánico amarillo.

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

npm test genera primero las dos páginas y después ejecuta veintidós tests: cinco contratos del HTML/configuración/paleta/saludo, uno del archivo WebP, nueve pruebas de la mejora progresiva, tres del layout y cuatro de historia/navegación entre páginas. Uno de los tests del layout compila una página de prueba con props y contenido distintos en una raíz temporal, reutilizando las dependencias instaladas y eliminando solo su propia copia al terminar; no añade rutas al sitio activo. Se usa el runner de Node, sin otra librería de tests. Preview sirve la última generación; si cambias archivos, vuelve a generar. Ctrl+C lo detiene.

Los scripts usan la sintaxis de variables de entorno de una shell POSIX (entorno Linux actual) para desactivar la telemetría de Astro. No publican nada. También incluyen --ignore-lock: en Astro 7.4.12 evita el modo automático en segundo plano cuando detecta un agente. Así el servidor sigue asociado a la terminal y Ctrl+C lo detiene; no queda un servicio oculto. Esto se contrastó con el código instalado de los comandos dev/preview y se añadió al contrato de configuración.

## Qué hace cada archivo

| Archivo | Para qué sirve |
| --- | --- |
| src/pages/index.astro | Ruta /. Contenido y CSS de Inicio, datos de Ona e inicialización del revelado; utiliza BaseLayout |
| src/pages/su-historia.astro | Ruta /su-historia/. Comienzo aprobado, metadatos propios y CSS estático; reutiliza BaseLayout sin script o foto |
| src/layouts/BaseLayout.astro | Documento HTML, metadatos mediante props, enlace de salto, cabecera, main con slot y pie |
| src/components/Cabecera.astro | Marca y navegación, con sus estilos locales |
| src/components/Pie.astro | Pie de página, con sus estilos locales |
| src/styles/global.css | Paleta, bases, foco, contenedor y marca compartidos; importado una vez desde el layout |
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
| tests/layout.test.mjs | Composición, documento único y compilación aislada con otras props y contenido |
| tests/history.test.mjs | Texto aprobado, dos rutas, metadatos distintos, página actual y destinos de todos los enlaces/anclas |

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
- Cabecera utiliza Astro.url.pathname durante el build para marcar exactamente un enlace con aria-current="page". El subrayado identifica visualmente la página actual sin depender solo del color. Es HTML generado, no JavaScript que se descargue en el navegador.
- Los enlaces / y /su-historia/ permiten cambiar de página; /#sobre-ona y /#proyecto siempre apuntan a las secciones de Inicio, también desde Su historia. La marca de cabecera y pie vuelve a /. La navegación usa una única lista de enlaces que se ajusta en varias líneas, sin menú desplegable ni nuevas APIs/polyfills.

## Movimiento sin perder contenido

- Saludo con doce letras/signos animados durante 700 ms cada uno, escalonados 65 ms: entrada completa en 1.415 segundos, con rebote y giro suaves. Las palabras se mantienen unidas al ajustar líneas y el h1 conserva un único nombre accesible; las letras decorativas se ocultan al árbol de accesibilidad. Foto y etiqueta también tienen entrada finita, sin repeticiones automáticas.
- Scroll suave nativo con CSS entre anclas: sin capturar wheel/touch ni reemplazar el desplazamiento normal.
- Los bloques de exploración, presentación y proyecto entran desde izquierda/izquierda/derecha, con desplazamiento lateral adaptable, subida leve, escala y opacidad durante 950 ms. Inicialmente solo se preparan los bloques bajo el primer viewport, pero se mantienen todos observados: al entrar se revelan y, al subir hasta que salen por el borde inferior de la zona de activación, regresan a su lado original. Al volver a bajar repiten la entrada. La zona termina al 60% de la altura del viewport: reserva el 40% inferior para que la salida inversa empiece antes y se vea, en vez de esperar a que el bloque esté casi fuera. El margen se recalcula al redimensionar y usa umbrales de entrada/salida separados para evitar oscilaciones. No se ocultan al salir por arriba ni mientras contienen el foco. La primera notificación tampoco oculta bloques ya visibles al cargar; el foco de teclado siempre los revela. El contenedor recorta el desbordamiento horizontal del efecto, sin bloquear el scroll vertical.
- Sin JavaScript o IntersectionObserver, el contenido queda visible desde el HTML. Si la API falla durante la preparación, se retira cualquier estado pendiente.
- Con prefers-reduced-motion: reduce se desactivan letras, bienvenida, transiciones y scroll suave. Si la preferencia cambia durante la visita, se revela todo y se desconecta el observador.

Layout, cabecera y pie están compartidos por las dos páginas. Su historia es estática: sin script, foto ni animaciones nuevas. Todavía no se han creado el diario, entradas Markdown u otras rutas. La edad de Inicio se vincula a una fecha; la fecha de nacimiento incorporada a Su historia fue confirmada directamente por el usuario.

## Segunda ruta local: Su historia

Para revisarla, ejecuta npm run dev y abre /su-historia/ en la dirección local indicada. Contiene solo el título Su historia, el subtítulo Un comienzo en febrero y el párrafo aprobado. No se publica una fecha exacta de llegada, otros datos del resumen de Gemini ni nuevas fotografías. El contenido y la navegación funcionan sin JavaScript.

En este paso se consultaron con modern-web-guidance las guías navbar, html y accessibility: enlaces nativos, lista semántica única, página actual generada en build, indicador no limitado al color, títulos propios y jerarquía h1/h2. No se introdujo el menú popover del ejemplo: los enlaces caben ajustándose en líneas y el alcance no necesita un menú colapsable. Se mantiene el foco global con outline y las nuevas áreas de enlace de cabecera miden al menos 32 px de alto con la fuente predeterminada. Las reformas de animaciones y ampliación de texto detectadas en la revisión anterior no se ejecutan por indicación del usuario; no afirmar conformidad integral de accesibilidad por estas comprobaciones.

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

Ajuste posterior al commit 7895ddb: entradas laterales reversibles al subir, sin repetir el saludo inicial. Catorce tests pasan, incluidas reversión/reentrada, salida por arriba, margen inicial visible, umbral, foco y notificaciones pendientes tras activar movimiento reducido. En Chromium se observaron transiciones de vuelta al lado original y nueva entrada a 1280/390/320 píxeles, sin desbordamiento. También se comprobaron bloques con foco, contenido sin JS y preferencia reducida inicial/en vivo en seis escenarios. Servidor y navegador propios detenidos. En ese momento el ajuste seguía local; posteriormente el usuario validó el afinado y autorizó su commit/push.

Ajuste del 2026-11-18 tras probar la reversión: sustituido el margen fijo de 120 px por un 40% de la altura, recalculado al redimensionar. Quince tests pasan, incluida la regresión del margen y su desconexión con movimiento reducido. En seis escenarios Chromium se comprobaron reversión y reentrada a 1280/390/320 píxeles: durante la transición inversa quedaba una zona de pantalla de al menos el 28% de su altura por debajo del borde superior del bloque, en lugar de iniciarse casi fuera. También se comprobó el margen tras reducir 200 px la altura de cada viewport normal, el foco y los fallbacks. Sin desbordamiento; procesos propios detenidos. El usuario confirmó «correcto, commit/push»: ajuste visual validado y publicación de esta entrega autorizada, sin extender el permiso a futuros cambios o despliegues.

Paso local del 2026-11-18: extraídos BaseLayout, Cabecera y Pie, con bases CSS compartidas y estilos locales en sus propietarios. Dieciocho tests pasan, incluido un build aislado de otras props y contenido del slot. Las nuevas pruebas fallaron antes de existir el layout; se corrigió también la ruta inicialmente supuesta del ejecutable de la prueba usando el binario local real. DOM normalizado y metadatos antes/después idénticos; capturas estáticas con movimiento reducido a 1280/390/320 píxeles comparadas con ImageMagick: cero píxeles distintos en los tres tamaños. Se repitieron los seis escenarios Chromium de reversión/reentrada, resize, foco y fallbacks, sin desbordamiento. Procesos propios detenidos. Solo se genera la ruta /; no se cambian la foto ni los datos de Ona, ni se incorpora aún el borrador de su historia. Sin nuevas dependencias o TypeScript escrito. El usuario confirmó «todo correcto, commit/push»: extracción aceptada y publicación de esta entrega autorizada, sin incluir nuevas rutas, el borrador de Su historia o despliegue.

Segunda ruta local del 2026-11-20: autorización «ok» al alcance de Su historia, reutilización del layout y adaptación de navegación, sin publicación. Los cuatro contratos nuevos fallaron antes de existir la ruta y la navegación; build y veintidós tests pasan después. En Chromium se comprobaron ambas páginas a 1280/390/320 píxeles sin desbordamiento con la fuente predeterminada, página actual correcta y enlaces visibles de cabecera de al menos 24 px de alto. Navegación real con Tab/Enter entre rutas, salto al contenido, retorno a Inicio y enlace Sobre Ona desde la historia satisfactorios. Comprobados contenido y estado actual sin JS, jerarquía de encabezados en el árbol de accesibilidad y subrayado activo con colores forzados. Capturas ancha/estrecha de la historia inspeccionadas. Un servidor estático temporal en loopback sirvió los artefactos de ambas rutas con HTTP 200 y bytes iguales al build; no se repitieron dev/preview de Astro en este paso. Servidor y navegador propios detenidos. Sin auditoría completa con lector de pantalla ni pruebas en Safari/Firefox; revisión del usuario pendiente. Sin cambios en la foto, el contenido de Inicio ni reveal.js, dependencias o configuración personal; en esa comprobación aún sin commit/push o despliegue. Después el usuario autorizó «commit/push y redondea la página con fotos de cuando era pequeña y algo más de texto alrededor»: publicación de esta versión de historia y navegación, sin incorporar aún fotos adicionales o relatos no aportados.
