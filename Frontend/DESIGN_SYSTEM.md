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

Cuando se añadan animaciones, respetar `prefers-reduced-motion`, como ya hace el progreso de proyectos.

## Estados obligatorios de una pantalla

Toda vista que dependa de datos debe diseñar explícitamente:

- carga inicial;
- contenido disponible;
- colección vacía;
- error recuperable;
- permiso insuficiente, cuando corresponda;
- carga de una página adicional;
- fin de la paginación.

No reemplazar la pantalla completa por un texto improvisado. Reutilizar los componentes de estado y mantener el contexto para que el usuario pueda reintentar.

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
