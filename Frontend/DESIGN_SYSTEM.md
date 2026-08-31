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

No simular un botón con un `div`. Las acciones solo con icono necesitan nombre accesible mediante `aria-label` y un `Tooltip` descriptivo visible tanto por hover como por foco. El tooltip debe usar portal, la capa flotante global y ajuste al viewport para sobreponerse sin quedar recortado; su incorporación no puede alterar la posición ni las dimensiones del botón.

Todo botón o control con `role="button"` que esté habilitado debe mostrar obligatoriamente `cursor: pointer`. Esta conducta se define de forma global y no debe eliminarse ni sobrescribirse con `cursor: default` o `cursor: auto`. Los controles deshabilitados deben usar `cursor: not-allowed` y declarar el estado mediante `disabled` o `aria-disabled="true"`.

Los botones cuyo único contenido visual sea una `X` para cerrar o quitar contenido conservan un `aria-label` descriptivo, pero no muestran `Tooltip`.

### Badges de estado

Usar `Badge` y sus temas semánticos para que un mismo estado conserve su identidad en todas las vistas:

- `Info`: proyecto en progreso.
- `Brand 2`: proyecto en revisión.
- `Neutral`: solicitud pendiente.
- `Success`: proyecto finalizado.
- `Archived`: proyecto archivado. Usa fondo sutil, texto y punto de la familia `warning`; su borde coincide con el fondo para mantener la misma estética limpia de los demás estados.

El tema `Archived` identifica contenido conservado pero fuera del flujo activo. No debe reutilizarse para advertencias, errores ni acciones destructivas.

### Formularios

- Cada control debe tener una etiqueta visible o un nombre accesible.
- Mostrar ayuda con `HintText` y errores junto al campo correspondiente.
- Conservar los datos escritos cuando una petición falle.
- Diferenciar claramente estados normal, hover, focus, disabled y error.
- No validar la misma regla de manera distinta en dos formularios; compartir esquema o utilidad cuando aplique.
- Deshabilitar o proteger el envío mientras exista una petición equivalente en curso.
- Los filtros de tablas que admiten más de un valor usan `DropdownMenu` con opciones `Checkbox` y selección múltiple. El menú muestra como máximo cuatro filas simultáneas y habilita desplazamiento vertical cuando existen más opciones.
- El selector de país de `Input` con tipo `Phone number` sigue el mismo patrón desplegable: se une visualmente al borde inferior del control sin separación, muestra como máximo cuatro países de `35px` y habilita scrollbar vertical para el resto. Conserva banderas, prefijos, selección visible, cierre con `Escape` y tokens de `DropdownMenu`.

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

### Presentación de fechas recientes

Cuando una fecha represente cuánto tiempo ha transcurrido desde una acción —por ejemplo, último acceso, última modificación o una actividad equivalente— y la interfaz requiera este estilo progresivo, debe reutilizar `src/utils/relativeTime.js` mediante `formatHumanDate`. No se deben recrear umbrales, pluralizaciones ni formatos locales dentro de páginas o componentes.

La presentación estándar es:

- Menos de un minuto: “Hace menos de un minuto”.
- De 1 a 59 minutos: “Hace 1 minuto” o “Hace N minutos”.
- De 1 a 23 horas: “Hace 1 hora” o “Hace N horas”.
- De 1 a 30 días: “Hace 1 día” o “Hace N días”.
- De 31 a 59 días: “Hace un mes”.
- Desde 60 días: fecha exacta localizada en español, como “19 jun”.
- Si la fecha pertenece a otro año, se incluye el año para evitar ambigüedad, como “17 feb 2025”.
- Los valores ausentes o inválidos usan un texto contextual, como “Sin acceso” o “Sin fecha”.

El formato relativo compacto destinado a espacios restringidos constituye una variante diferente y solo debe utilizarse cuando el diseño aprobado exija expresamente abreviaturas.

### Proyectos archivados

- Un proyecto archivado es de solo lectura hasta que un administrador lo desarchive.
- Se mantienen disponibles la consulta, navegación, búsqueda, filtros, galerías, visores y descargas autorizadas.
- Se desactivan todas las mutaciones del proyecto: edición, publicación, asignación o retiro de encargados, carga o eliminación de archivos y creación o respuesta de observaciones en cualquier visor.
- La interfaz debe comunicar el estado archivado y el backend debe rechazar igualmente cualquier mutación con `PROJECT_ARCHIVED`; no se puede depender solo de controles deshabilitados.
- Desarchivar es la única mutación permitida sobre un proyecto archivado. Los accesos de proyectos recientes no incluyen proyectos archivados.

### Proyectos finalizados

- Un proyecto finalizado conserva la consulta, navegación, filtros, galerías, visores, descargas, publicación y archivado.
- Se bloquean las mutaciones operativas: edición, progreso, etapas, asignación o retiro de responsables, carga o eliminación de archivos y creación o respuesta de observaciones.
- Los responsables y contenidos existentes se conservan como historial. Si se necesita acceso posterior, debe resolverse con un flujo administrativo específico y no alterando el equipo finalizado.
- El frontend debe comunicar el cierre y el backend debe rechazar las mutaciones operativas con `PROJECT_FINALIZED`.

### Solicitudes de proyecto

- El flujo usa los estados `draft`, `pending_verification`, `pending_review`, `changes_requested`, `rejected` y `converted`.
- El cliente solo edita borradores y solicitudes devueltas para corrección. Al reenviar una corrección, la solicitud vuelve a verificación administrativa.
- Asignar el primer arquitecto inicia la revisión técnica. Una solicitud en revisión debe conservar al menos un arquitecto asignado.
- Solamente administradores y arquitectos asignados consultan la cola técnica. El arquitecto registra una recomendación con motivo; el administrador conserva la decisión final.
- Aprobar, rechazar o solicitar correcciones exige al menos una revisión de un arquitecto que continúe asignado.
- Correcciones y rechazo son decisiones diferentes: `changes_requested` vuelve a habilitar la edición del cliente; `rejected` es final y permite iniciar una solicitud nueva reutilizando los datos.
- El rechazo conserva responsables, datos y archivos como historial y siempre muestra al cliente un motivo. Las notas internas nunca se exponen al cliente.
- La aprobación crea el proyecto y convierte la solicitud de forma atómica. La solicitud conserva `converted_project_id` para impedir conversiones duplicadas y permitir navegar al proyecto resultante.
- Toda transición se valida en backend, se registra en auditoría y genera una notificación al cliente cuando existe una decisión administrativa.

### Estados de usuarios administrativos

- La tabla de gestión de usuarios muestra un máximo de 10 usuarios reales por página. La API y el frontend aplican el mismo límite y la navegación continúa mediante cursor; cuando existen menos de 10 resultados no se crean filas vacías ni datos de demostración.
- El icono de vista de cada fila abre el drawer compartido de detalles del usuario. El panel consulta el registro seleccionado por identificador y muestra rol, fecha de creación, identidad, empresa, correo, teléfono, proyectos asociados y notas internas reales; nunca completa campos ausentes con datos de demostración. Debe conservar estados de carga, error recuperable y ausencia de datos, cerrarse con `Escape` o al seleccionar el overlay y adaptarse al ancho móvil. En su jerarquía tipográfica, el título usa `--color-text-50`, las etiquetas usan `--color-text-300`, los valores usan `--color-text-200` y el texto auxiliar del área de notas usa `--color-text-100`, de acuerdo con Figma.
- En el cuerpo de la tabla de gestión de usuarios, el rol se presenta con `Badge` en tema `Brand 1`, variación `Simple` y tamaño `S`; la celda conserva `24px` de padding horizontal y `16px` vertical según el componente de Figma.
- La celda de nombre de cada usuario debe mostrar su foto de perfil real mediante la URL autenticada del recurso cuando `hasProfilePhoto` sea verdadero. Las iniciales o el icono correspondiente al rol se utilizan únicamente como fallback si no existe una foto o si su carga falla; nunca deben sustituir preventivamente una imagen disponible.
- Un usuario `active` puede suspenderse temporalmente (`blocked`) o deshabilitarse de forma indefinida (`inactive`).
- Un usuario suspendido muestra las acciones “Reactivar” y “Deshabilitar”; un usuario deshabilitado muestra únicamente “Habilitar”.
- Las acciones individuales “Habilitar” y “Deshabilitar” utilizan el mismo icono de bloqueo para conservar su relación visual; “Reactivar” mantiene el icono de usuario habilitado por corresponder a una suspensión temporal.
- Reactivar o habilitar devuelve la cuenta a `active`. Suspender o deshabilitar impide el acceso y excluye al usuario de nuevas asignaciones, sin eliminar su historial ni sus asignaciones existentes.
- Toda transición requiere un modal de confirmación. Los alerts de éxito o error solo se muestran después de confirmar y recibir el resultado de la API.
- El frontend adapta las acciones al estado actual y el backend valida la transición; nunca se depende únicamente del texto o la disponibilidad visual del menú.
- Al seleccionar uno o más usuarios, el footer muestra las acciones masivas centradas entre el contador y la paginación. Sin selección, ese grupo de acciones no se renderiza.
- “Suspender” actúa únicamente sobre usuarios activos; “Deshabilitar” actúa sobre usuarios activos o suspendidos; “Activar” actúa únicamente sobre usuarios suspendidos o deshabilitados. Una cuenta que ya se encuentra en el estado solicitado no genera una petición redundante.
- La cuenta del administrador autenticado se excluye de cualquier cambio masivo. Cada botón permanece deshabilitado cuando la selección no contiene al menos un usuario elegible para esa transición.
- Las acciones masivas reutilizan el modal de advertencia antes de ejecutarse, bloquean envíos equivalentes mientras están en curso y muestran el alert compartido de éxito, error o resultado parcial. Los usuarios actualizados se deseleccionan; los que fallen permanecen seleccionados para permitir un reintento.

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
- El compositor “Observación general” del panel global crea una observación del entorno y no exige un proyecto específico. La conversación solo es visible para el autor y para clientes o arquitectos que compartan al menos un proyecto con el autor raíz. Las respuestas heredan la audiencia de la conversación raíz. Las observaciones de proyecto conservan el proyecto original y sus permisos; ambos orígenes se combinan únicamente para su presentación en el panel.
- Toda observación temporal de video debe conservar el instante en una selección `video-time`, mostrar “Observación sobre video” y su tiempo en el cuadro de referencia, y permitir navegación bidireccional entre la marca de la barra y la observación del panel. Las observaciones de video sin referencia temporal se mantienen como observaciones generales asociadas al recurso.
- Las tarjetas y visores de video deben usar como portada un fotograma extraído del propio archivo y reutilizarlo durante la sesión. Solo un campo explícito `poster` puede reemplazar esa captura; queda prohibido reutilizar como portada una imagen general del proyecto. Si la extracción no está permitida o falla, se conserva el fallback visual del componente.
- Las tarjetas de modelos 3D deben mostrar una vista estática generada desde el propio archivo, con cámara e iluminación predeterminadas y sin controles interactivos. Una portada proporcionada tiene prioridad y, si el modelo no puede cargarse o capturarse, se conserva el fallback “Modelo 3D”.
- Las tarjetas muestran avatar, nombre del autor, fecha y contenido. En el panel de observaciones generales no se renderiza el nombre del proyecto. El tipo no se repite como texto secundario bajo el autor: se utiliza como título de la previsualización asociada. Los números de referencia solo aparecen dentro del marcador visual. El rol y el proyecto pueden conservarse en el modelo para permisos, navegación o lógica, pero no deben renderizarse en la tarjeta para evitar truncamiento y ruido visual.
- Cliente y arquitecto solo pueden visualizar observaciones cuando comparten el mismo proyecto: el cliente pertenece al proyecto y el arquitecto está asignado a él. Que un proyecto sea público no concede acceso a sus observaciones. El administrador no visualiza, crea ni responde observaciones desde el panel global en ninguna vista del entorno.
- `EnvironmentNotificationsDrawer` aplica la política por rol de forma centralizada: para administradores siempre renderiza únicamente “Actividad Reciente”, ignora cualquier propiedad de comentarios recibida y no inicia cargas de observaciones. Ninguna página debe depender de pasar manualmente `activityOnly` para cumplir esta restricción.
- Todo panel agregado de observaciones disponible para clientes o arquitectos debe obtener IDs numéricos desde los proyectos autorizados y mantenerse actualizado mediante SSE o refresco periódico. El proyecto de origen se conserva en los datos, pero no se muestra en el panel de observaciones generales. Se prohíben IDs, slugs y observaciones de demostración cuando exista una fuente real.
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
