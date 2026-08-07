# Sistema de diseño del frontend

Este documento define cómo construir y modificar interfaces en ARCA Studio sin perder consistencia ni duplicar componentes. Es obligatorio consultarlo antes de crear una página, un componente visual o una variante nueva.

## Fuente de verdad

El sistema actual está compuesto por:

- React para componentes y estado.
- Tailwind CSS para composición y estilos locales.
- `src/styles/global.css` para colores, espaciado, radios, sombras, breakpoints y modo oscuro.
- `src/styles/typography.css` para la escala tipográfica.
- `src/components/ui` para componentes reutilizables.
- `clsx` para clases condicionales.
- Iconsax y los iconos internos existentes para iconografía.

Los tokens y componentes existentes son la fuente de verdad. Una maqueta o valor aislado no debe crear un segundo sistema visual dentro de la aplicación.

## Regla obligatoria: preservar posiciones existentes

La posición, alineación, orden, tamaño y espaciado de los componentes existentes forman parte del diseño aprobado y **no deben modificarse** salvo que el usuario lo solicite de manera explícita.

- Corregir datos, estados de carga, errores o comportamiento no autoriza a mover ni reordenar elementos visuales.
- Una mejora interna de un componente debe conservar su geometría y su ubicación actuales en todos los breakpoints.
- Las capas flotantes, menús, tooltips y modales deben respetar su anclaje, centrado y nivel de superposición existentes.
- Si una necesidad técnica exige cambiar una posición y no existe una instrucción explícita, se debe consultar antes de implementar el cambio.
- Cuando el usuario proporcione una nueva ubicación o un diseño de referencia, solo se modificarán los elementos indicados; el resto de la composición permanecerá intacto.

## Regla contra duplicados

Antes de crear un componente:

1. Buscar por función y no solo por nombre dentro de `src/components/ui` y las páginas.
2. Comprobar si el resultado se puede lograr mediante las propiedades o variantes del componente existente.
3. Si falta una capacidad reutilizable, añadir una variante al componente compartido y documentarla en su archivo de configuración.
4. Crear un componente nuevo únicamente cuando tenga una responsabilidad distinta.

No copiar el JSX o las clases de botones, inputs, modales, alertas, avatares, menús, etiquetas, estados vacíos ni controles existentes dentro de una página.

Si un patrón aparece dos veces, debe evaluarse su extracción. Si aparece tres veces, debe convertirse en componente o utilidad compartida, salvo que exista una razón documentada para mantenerlo local.

## Jerarquía de componentes

```text
src/components/ui       componentes visuales reutilizables
src/components          componentes compartidos con lógica de producto
src/pages/*/components  composición propia de una sección o página
src/pages               páginas y coordinación de datos
```

- Un componente de `ui` no debe conocer endpoints, rutas de negocio ni la forma completa de una respuesta de API.
- Una página coordina datos y estados, pero debe delegar la presentación repetible.
- Los menús de pestañas que intercambian paneles deben renderizar su contenido dentro de `TabPanel`, usando el identificador de la pestaña como `transitionKey` para mantener la transición estándar.
- La lógica de carga, paginación y transformación compartida debe vivir en hooks o utilidades, no repetirse en cada pantalla.
- Usar nombres PascalCase para componentes y nombres que expresen su función, no su apariencia temporal.

## Tokens visuales

Usar siempre las variables expuestas en `global.css`. No introducir colores hexadecimales, radios, sombras o separaciones arbitrarias si ya existe un token equivalente.

### Color

- `--color-primary-*`: acciones y énfasis principal.
- `--color-neutral-*`: superficies, bordes y contenido neutral.
- `--color-text-*`: jerarquía de texto.
- `--color-danger-*`: errores y acciones destructivas.
- `--color-warning-*`: advertencias.
- `--color-success-*`: confirmaciones.
- `--color-info-*`: información y acciones informativas.
- `--color-accent-*`: acentos de marca.

Ejemplo:

```jsx
<section className="bg-[var(--color-neutral-100)] text-[var(--color-text-50)]">
  ...
</section>
```

No usar un color semántico solo porque visualmente se parece a otro. Un error usa `danger`, una confirmación usa `success` y una ayuda usa `info`.

### Espaciado, radio y sombra

- Espaciado: escala `--spacing-spacing-gap-*` o utilidades Tailwind equivalentes a la escala existente.
- Radios: `--radius-1` a `--radius-4`, `--radius-none` y `--radius-full`.
- Bordes: `--stroke-0` a `--stroke-3`.
- Elevación: `--shadow-e1` a `--shadow-e3`.

Los valores particulares solo se permiten cuando representan una medida estructural que no corresponde a un token, y deben mantenerse cerca del componente que la necesita.

### Tipografía

Usar las clases de `src/styles/typography.css`, como `text-heading-*` y las escalas de texto disponibles. No recrear manualmente combinaciones de tamaño, peso, interlineado y espaciado que ya estén definidas.

La fuente de interfaz es Inter mediante `--font-sans`. Todo texto debe conservar una jerarquía clara: título, contenido, dato secundario y ayuda.

## Componentes base

Antes de desarrollar un equivalente, revisar especialmente:

- Acciones: `Button`, `ButtonGroupItem`, `Toggle`, `Checkbox`.
- Formularios: `Input`, `TextArea`, `DropdownMenu`, `Label`, `HintText`, `Tag`.
- Navegación: `NavigationBar`, `SideNavigation`, `HorizontalTabMenu`, `TabItem`.
- Retroalimentación: `Alert`, `Notification`, `AuthToast`, `Tooltip`, `EmptyState`.
- Capas: `Modal` y los modales compartidos ya existentes.
- Identidad y contenido: `Avatar`, `AvatarGroup`, `Badge`, `Gallery`.
- Progreso: `ProgressBarLabel`, `ProgressStepBase`, `ProgressStepGroup`.

### Botones

Usar `Button` y sus propiedades existentes:

- `theme`: `Primary`, `Danger` o `Info`.
- `type`: `Solid`, `Outline`, `Ghost` o `Link`, según lo admita el tema.
- `size`: `S`, `M` o `L`.
- `disabled` para bloquear la interacción real.
- `fitContent` cuando la etiqueta no deba ocupar el ancho predeterminado.
- `htmlType="submit"` dentro de formularios.

No simular un botón con un `div`. Las acciones solo con icono necesitan nombre accesible mediante `aria-label`.

Todo botón o control con `role="button"` que esté habilitado debe mostrar obligatoriamente `cursor: pointer`. Esta conducta se define de forma global y no debe eliminarse ni sobrescribirse con `cursor: default` o `cursor: auto`. Los controles deshabilitados deben usar `cursor: not-allowed` y declarar el estado mediante `disabled` o `aria-disabled="true"`.

### Formularios

- Cada control debe tener una etiqueta visible o un nombre accesible.
- Mostrar ayuda con `HintText` y errores junto al campo correspondiente.
- Conservar los datos escritos cuando una petición falle.
- Diferenciar claramente estados normal, hover, focus, disabled y error.
- No validar la misma regla de manera distinta en dos formularios; compartir esquema o utilidad cuando aplique.
- Deshabilitar o proteger el envío mientras exista una petición equivalente en curso.

### Modales y capas

Usar `Modal` y sus configuraciones antes de crear overlays nuevos. Toda capa debe:

- tener título o nombre accesible;
- ofrecer una forma clara de cierre;
- cerrar y limpiar sus efectos correctamente;
- conservar la acción destructiva visualmente separada;
- evitar que una animación sea imprescindible para comprender el estado.

Los modales con `mount="viewport"` deben renderizarse mediante portal en `document.body`. No deben quedar anidados dentro de layouts, paneles o contenedores transformados, porque eso altera el sistema de referencia de `position: fixed`, desplaza el centrado y puede recortar el overlay. Solo `mount="contained"` permanece dentro del contenedor que lo invoca.

Cuando se añadan animaciones, respetar `prefers-reduced-motion`, como ya hace el progreso de proyectos.

## Estados obligatorios de una pantalla

### Cargas de datos

- Cada carga de contenido debe usar el componente compartido `Loader` con un preset que reproduzca la geometría del componente final; no se permiten skeletons genéricos sin relación con el contenido.
- Los controles que ya disponen de estado desactivado, como barras de búsqueda, filtros y botones, permanecen visibles y usan `disabled` mientras esperan datos. El `Loader` se reserva para el contenido sin representación propia durante la carga.
- La animación estándar es un shimmer amplio, tenue y lento (aproximadamente 2.2 s), basado en tokens de tema y compatible con `prefers-reduced-motion`; no debe producir destellos blancos ni cambios bruscos de opacidad.
- Loader, contenido, estado vacío y error son estados mutuamente excluyentes. Las listas usan `count` para aproximar la cantidad visible de elementos.
- Ninguna sección conectada a base de datos puede desaparecer ni sustituirse por texto improvisado cuando no existan registros o falle la consulta; debe conservar su contexto y usar `EmptyState` con una acción pertinente.
- Todo componente que dependa de datos o recursos debe definir un skeleton con sus dimensiones finales para evitar saltos de layout. Imágenes, portadas, miniaturas y reproductores usan presets de medios ajustados a su relación de aspecto.
- Una sección sin API puede mostrar un skeleton permanente únicamente si se documenta que todavía no existe una fuente real. En ese caso no se muestran datos de demostración ni scrollbar de contenido cargado.
- El flujo completo de autenticación queda excluido del skeleton global y conserva sus mensajes y estados de botón propios.
- Los visores interactivos 3D y VR conservan sus loaders especializados; las miniaturas estáticas 3D sí utilizan el preset correspondiente.
- Uploads con porcentaje real conservan su barra de progreso en lugar de superponer otro loader.

### Imágenes de proyectos

- Toda portada o miniatura de proyecto debe usar el componente compartido `ProjectImage`.
- Mientras una imagen carga, si no tiene URL o si la descarga falla, debe conservar el mismo espacio y mostrar el placeholder neutral con el icono de imagen centrado.
- No sustituir una imagen ausente por una portada de demostración. El contenido real reemplaza el placeholder únicamente después de cargar correctamente.
- Esta regla aplica a dashboards, solicitudes y tarjetas públicas de proyectos; no aplica a logos, avatares ni visores multimedia, que tienen estados especializados.

Toda vista que dependa de datos debe diseñar explícitamente:

- carga inicial;
- contenido disponible;
- colección vacía;
- error recuperable;
- permiso insuficiente, cuando corresponda;
- carga de una página adicional;
- fin de la paginación.

No reemplazar la pantalla completa por un texto improvisado. Reutilizar los componentes de estado y mantener el contexto para que el usuario pueda reintentar.

La colección de Solicitudes es un caso visual especial: cuando esté vacía debe usar `EmptyState` en tamaño `M`, con icono destacado, el título “Tu espacio de proyectos está listo”, la descripción “Aquí podrás visualizar y dar seguimiento a tus proyectos.” y la acción “Nueva oportunidad”.

- Los `Tooltip` interactivos se montan mediante portal por defecto, usan la capa flotante global y se ajustan a los bordes del viewport para no quedar recortados por contenedores, scroll, drawers o modales.

## Responsive

El enfoque es mobile-first. Los breakpoints de referencia existentes son:

- móvil: base, con referencia de 375 px;
- tablet: desde 768 px;
- web: desde 1280 px.

Una implementación debe comprobar como mínimo 375, 768, 1024 y 1440 px. Evitar anchos fijos para contenedores principales; usar límites máximos, rejillas y envoltura. Ninguna acción esencial debe depender de hover.

En pantallas pequeñas:

- priorizar una sola columna;
- permitir que acciones secundarias se apilen;
- evitar desplazamiento horizontal de la página;
- mantener objetivos táctiles suficientemente grandes;
- truncar texto solo cuando exista una forma de consultar el contenido completo.

## Modo oscuro

El modo oscuro se activa con la clase `.dark`. Los componentes deben consumir tokens semánticos para heredar los valores correctos. Evitar pares manuales `light/dark` cuando el token ya cambia con el tema.

Antes de entregar, comprobar contraste, bordes, overlays, estados disabled y feedback semántico en ambos temas.

## Accesibilidad

- Utilizar elementos HTML según su función: `button`, `a`, `label`, encabezados y listas.
- Mantener navegación completa con teclado y foco visible.
- Asociar mensajes de error y ayuda con el control correspondiente.
- Añadir texto alternativo útil a imágenes informativas; usar `alt=""` en imágenes decorativas.
- Marcar iconos decorativos con `aria-hidden="true"`.
- No comunicar un estado únicamente mediante color.
- No retirar el outline sin proporcionar un indicador de foco equivalente.
- Anunciar cambios asíncronos relevantes con el patrón accesible apropiado.

## Datos, paginación y tiempo real

### Navegación superior persistente

- Todas las pantallas del entorno autenticado deben renderizar `EnvironmentNavigationBar`; las páginas no pueden importar directamente `ui/NavigationBar/NavigationBar.jsx` ni recrear el navbar con JSX o estilos locales.
- `EnvironmentNavigationBar` es la única fuente de verdad para la variante, fecha, ancho máximo, espaciado responsive, botón de notificaciones y visibilidad del menú móvil. Una página solo puede proporcionar los callbacks funcionales y el estado activo de sus acciones; no puede sobrescribir `variant`, `utilityText`, `showUtilityMenu` ni `className`.
- La campana debe abrir el panel compartido `EnvironmentNotificationsDrawer` y permanecer funcional en cualquier pantalla donde aparezca el navbar. No se permiten implementaciones particulares del panel por página.
- Cualquier cambio visual o funcional del navbar que deba afectar al entorno se implementa una sola vez en `EnvironmentNavigationBar` y debe conservar el mismo resultado para cliente, arquitecto y administrador.

### Navegación lateral persistente

- Los destinos disponibles en `SideNavigation` se definen de forma centralizada por rol y deben conservarse en todas las pantallas del entorno autenticado del usuario.
- Una página no puede ocultar, omitir ni reconstruir parcialmente botones autorizados como Panel, Solicitudes, Ver más proyectos o Configuraciones.
- Los accesos exclusivos de un rol solo se muestran a usuarios autorizados. Por ejemplo, Solicitudes pertenece al entorno del cliente y debe aparecer en todas sus vistas, pero no enlazarse desde roles sin acceso a esa ruta.
- Los accesos dinámicos a proyectos pueden variar según los proyectos disponibles, sin alterar los destinos persistentes del rol.

- En las filas de proyectos del dashboard, el avatar junto al nombre del proyecto debe representar al arquitecto asignado mediante su foto real o sus iniciales como fallback y mostrar su nombre en un `Tooltip` al hacer hover o recibir foco. Esta regla es local a esas filas: no se debe activar el tooltip globalmente en `AvatarGroup`, comentarios, navegación ni carruseles.


- Todo componente conectado a datos dinámicos (por ejemplo, comentarios, avatares, notificaciones o actividad) debe conservar y renderizar los campos relacionados en todas sus transformaciones, variantes y puntos de uso. Una actualización debe propagarse tanto para clientes como para arquitectos, administradores y cualquier rol existente, en desarrollo, pruebas y producción; no se permiten datos de demostración ni valores visuales fijos cuando exista una fuente real conectada.
- Las conversaciones del proyecto se denominan **Observaciones**. Sus tipos visibles son “Observación general”, “Observación sobre imagen”, “Observación sobre video” y “Observación en panorámica 360”. Los valores internos de API son `general`, `image`, `video`, `panorama` y `document`.
- El compositor “Observación general” del panel global crea una observación del entorno y no exige un proyecto específico. La conversación solo es visible para el autor y para usuarios que compartan al menos un proyecto con el autor raíz; el administrador conserva visibilidad global. Las respuestas heredan la audiencia de la conversación raíz. Las observaciones de proyecto conservan el proyecto original y sus permisos; ambos orígenes se combinan únicamente para su presentación en el panel.
- Toda observación temporal de video debe conservar el instante en una selección `video-time`, mostrar “Observación sobre video” y su tiempo en el cuadro de referencia, y permitir navegación bidireccional entre la marca de la barra y la observación del panel. Las observaciones de video sin referencia temporal se mantienen como observaciones generales asociadas al recurso.
- Las tarjetas y visores de video deben usar como portada un fotograma extraído del propio archivo y reutilizarlo durante la sesión. Solo un campo explícito `poster` puede reemplazar esa captura; queda prohibido reutilizar como portada una imagen general del proyecto. Si la extracción no está permitida o falla, se conserva el fallback visual del componente.
- Las tarjetas de modelos 3D deben mostrar una vista estática generada desde el propio archivo, con cámara e iluminación predeterminadas y sin controles interactivos. Una portada proporcionada tiene prioridad y, si el modelo no puede cargarse o capturarse, se conserva el fallback “Modelo 3D”.
- Las tarjetas muestran avatar, nombre del autor, fecha y contenido. En el panel de observaciones generales no se renderiza el nombre del proyecto. El tipo no se repite como texto secundario bajo el autor: se utiliza como título de la previsualización asociada. Los números de referencia solo aparecen dentro del marcador visual. El rol y el proyecto pueden conservarse en el modelo para permisos, navegación o lógica, pero no deben renderizarse en la tarjeta para evitar truncamiento y ruido visual.
- Cliente y arquitecto solo pueden visualizar observaciones cuando comparten el mismo proyecto: el cliente pertenece al proyecto y el arquitecto está asignado a él. Que un proyecto sea público no concede acceso a sus observaciones. El administrador conserva visibilidad global.
- Todo panel agregado de observaciones debe obtener IDs numéricos desde los proyectos autorizados y mantenerse actualizado mediante SSE o refresco periódico. El proyecto de origen se conserva en los datos, pero no se muestra en el panel de observaciones generales. Se prohíben IDs, slugs y observaciones de demostración cuando exista una fuente real.
- Reutilizar las utilidades de paginación del frontend para combinar páginas y eliminar duplicados.
- Reiniciar cursores al cambiar usuario, proyecto o filtros.
- Impedir peticiones duplicadas durante una carga.
- Combinar eventos SSE por identificador estable; no insertar el mismo elemento dos veces.
- “Cargar más” debe indicar carga, bloquear envíos repetidos y desaparecer cuando no exista `nextCursor`.
- No ocultar errores de páginas posteriores si el contenido previo todavía puede mostrarse.

## Organización de estilos

- Usar Tailwind para composición local.
- Usar `clsx` para estados y variantes condicionales.
- Mantener configuraciones extensas de variantes junto al componente, siguiendo `Button/buttonConfig.js` e `Input/inputConfig.js`.
- Añadir a `global.css` únicamente tokens o reglas verdaderamente globales.
- Evitar `style` inline salvo valores dinámicos que no se expresen razonablemente con clases.
- No usar `!important` para resolver conflictos ordinarios.

## Proceso para añadir una variante

1. Confirmar que el cambio pertenece a un componente existente.
2. Nombrar la variante según intención: `Danger`, `compact`, `loading`; no según un color concreto.
3. Mantener los valores por defecto compatibles con las pantallas actuales.
4. Cubrir estados interactivos, responsive, modo oscuro y accesibilidad.
5. Añadir una prueba cuando la variante cambie comportamiento, no solo apariencia.
6. Actualizar este documento si se introduce una nueva regla general.

## Checklist de revisión visual

- [ ] Se buscaron componentes equivalentes antes de crear uno nuevo.
- [ ] Se reutilizan tokens de color, tipografía, espacio, radio y sombra.
- [ ] No hay colores o estilos duplicados sin justificación.
- [ ] Existen estados de carga, vacío, error y éxito cuando aplican.
- [ ] La interfaz funciona a 375, 768, 1024 y 1440 px.
- [ ] La interfaz funciona en tema claro y oscuro.
- [ ] Teclado, foco, etiquetas y nombres accesibles funcionan.
- [ ] Las acciones durante peticiones evitan dobles envíos.
- [ ] La paginación no duplica elementos y reinicia su cursor correctamente.
- [ ] Los cambios reutilizables están en `src/components/ui`, no copiados en páginas.
- [ ] `pnpm build` finaliza correctamente.

## Criterio de entrega

Una pantalla no está terminada solo porque coincide visualmente con una maqueta. También debe ser reutilizable, responsive, accesible, compatible con ambos temas y representar correctamente todos sus estados de datos.
