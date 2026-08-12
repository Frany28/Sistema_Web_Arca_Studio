# Sistema de puntuación de solicitudes de proyecto

## Objetivo y versión

El sistema mide la preparación y la coherencia inicial de una solicitud entre `0` y `100`. No mide qué tan grande, costoso o lujoso es el proyecto. Tampoco aprueba, rechaza ni bloquea solicitudes.

Las solicitudes nuevas utilizan la fórmula `2.1`:

```text
Compatibilidad = puntos de preparación - deducciones por incoherencia
```

Las solicitudes ya evaluadas con `1.0` o `2.0` conservan su resultado histórico.

## Regla sobre el tamaño

El tamaño no se premia por ser mayor. Las cuatro respuestas definidas reciben exactamente `15` puntos:

- Pequeño: `15`.
- Mediano: `15`.
- Grande: `15`.
- Muy grande: `15`.

La respuesta “No lo sé aún” recibe `0` porque todavía no define el alcance. El tamaño únicamente puede generar una deducción cuando se combina con una inversión que no parece coherente con ese alcance.

Por eso un espacio pequeño con calidad premium, presupuesto coherente y buena preparación puede alcanzar `100` puntos.

## Puntuación separada por cada input del frontend

### Input 1: Nombre del proyecto

- Pertenece a: `Detalles del proyecto`.
- Tipo de input: texto.
- Obligatorio: sí.
- Aporta puntos: no.
- Uso: identifica la solicitud y se valida antes del envío.

| Respuesta | Puntos |
| --- | ---: |
| Cualquier nombre válido de 3–150 caracteres | 0 |

### Input 2: Tipo de proyecto

- Pertenece a: `Detalles del proyecto`.
- Tipo de input: selección.
- Obligatorio: sí.
- Aporta puntos: no.
- Uso: clasifica el proyecto; ninguna categoría es mejor que otra.

| Respuesta disponible | Puntos |
| --- | ---: |
| Residencial | 0 |
| Comercial | 0 |
| Corporativo | 0 |
| Stands y exhibiciones | 0 |

### Input 3: Ubicación del proyecto

- Pertenece a: `Detalles del proyecto`.
- Tipo de input: dirección manual o sugerencia de Geoapify.
- Obligatorio: sí.
- Aporta puntos: no.
- Uso: ubica el proyecto. Seleccionar una sugerencia no vale más que ingresar una dirección manual válida.

| Respuesta | Puntos |
| --- | ---: |
| Cualquier ubicación válida | 0 |

### Input 4: Descripción del proyecto

- Pertenece a: `Detalles del proyecto`.
- Tipo de input: texto multilínea.
- Obligatorio: no.
- Máximo: `10` puntos.
- Uso: mide cuánta información inicial existe para comprender el proyecto.

| Respuesta | Puntos |
| --- | ---: |
| 30 caracteres o más | 10 |
| Entre 10 y 29 caracteres | 4 |
| Sin descripción | 0 |

Una descripción corta o vacía simplemente deja de obtener puntos. No recibe una segunda penalización.

### Input 5: Tamaño aproximado del proyecto

- Pertenece a: `Detalles del proyecto`.
- Tipo de input: selección.
- Obligatorio: no.
- Máximo: `15` puntos.
- Uso: mide si el alcance físico está definido, no si el proyecto es grande.

| Respuesta disponible | Puntos |
| --- | ---: |
| Pequeño, menos de 80 m² | 15 |
| Mediano, entre 80 y 200 m² | 15 |
| Grande, entre 200 y 500 m² | 15 |
| Muy grande, más de 500 m² | 15 |
| No lo sé aún | 0 |
| Sin responder | 0 |

Este input también participa en las reglas de coherencia entre tamaño e inversión documentadas más adelante.

### Input 6: ¿Cómo prefiere desarrollar el proyecto?

- Pertenece a: `Detalles del proyecto`.
- Tipo de input: selección.
- Obligatorio: sí.
- Máximo: `15` puntos.
- Uso: mide si la modalidad de ejecución está definida.

| Respuesta disponible | Puntos |
| --- | ---: |
| Por fases | 15 |
| En su totalidad | 15 |
| Por definir | 0 |

“Por fases” y “En su totalidad” valen lo mismo. Si se solicita inicio inmediato y la modalidad sigue por definir, se aplican `-10` puntos de coherencia.

### Input 7: ¿Tiene terreno o inmueble disponible?

- Pertenece a: `Detalles del proyecto`.
- Tipo de input: selección de botones.
- Obligatorio: no.
- Máximo: `10` puntos.
- Uso: mide la preparación material del proyecto.

| Respuesta disponible | Puntos |
| --- | ---: |
| Sí, disponible | 10 |
| En proceso de adquirirlo | 5 |
| No todavía | 0 |
| Sin responder | 0 |

Este input también se contrasta con el plazo de inicio.

### Input 8: ¿Dispone de planos del lugar?

- Pertenece a: `Detalles del proyecto`.
- Tipo de input: checkbox de tres estados.
- Obligatorio: no.
- Aporta puntos: no.
- Uso: información operativa para la revisión humana.

| Respuesta | Puntos |
| --- | ---: |
| Sí | 0 |
| No | 0 |
| Sin responder | 0 |

La ausencia de planos nunca genera una deducción.

### Input 9: Rango de inversión estimado

- Pertenece a: `Viabilidad financiera`.
- Tipo de input: selección.
- Obligatorio: sí.
- Máximo: `15` puntos.
- Uso: mide si existe un rango definido. No premia montos superiores.

| Respuesta disponible | Puntos |
| --- | ---: |
| Menos de USD 10.000 | 15 |
| USD 10.000–50.000 | 15 |
| USD 50.000–150.000 | 15 |
| Más de USD 150.000 | 15 |
| No lo tengo definido aún | 0 |

Los rangos concretos valen lo mismo. Después se revisa si la inversión es coherente con el tamaño y la calidad seleccionados.

### Input 10: Disponibilidad de capital

- Pertenece a: `Viabilidad financiera`.
- Tipo de input: selección.
- Obligatorio: sí.
- Máximo: `25` puntos.
- Uso: mide la preparación financiera para ejecutar el proyecto.

| Respuesta disponible | Puntos |
| --- | ---: |
| Disponible ahora | 25 |
| En los próximos 3 meses | 20 |
| Busca financiamiento | 10 |
| Indefinido | 0 |

La respuesta se contrasta con el plazo de inicio para detectar fechas incompatibles con la disponibilidad del capital.

### Input 11: ¿Cuándo espera iniciar el proyecto?

- Pertenece a: `Compatibilidad`.
- Tipo de input: selección de botones.
- Obligatorio: sí.
- Aporta puntos base: no.
- Uso: se emplea exclusivamente en cruces de coherencia.

| Respuesta disponible | Puntos base |
| --- | ---: |
| De inmediato | 0 |
| 1–3 meses | 0 |
| 3–6 meses | 0 |
| Más de 6 meses | 0 |

Un proyecto no recibe más puntos por comenzar antes. Cualquier plazo puede ser excelente si es coherente con inmueble, capital, inversión y modalidad.

### Input 12: ¿Quién toma la decisión final del proyecto?

- Pertenece a: `Compatibilidad`.
- Tipo de input: selección.
- Obligatorio: no.
- Aporta puntos: no.
- Uso: información para organizar la comunicación y revisión humana.

| Respuesta disponible | Puntos |
| --- | ---: |
| Yo solo/a | 0 |
| Con mi pareja/socio | 0 |
| Familia extendida | 0 |
| Empresa/junta | 0 |
| Sin responder | 0 |

No genera deducciones porque el frontend no pregunta si la decisión ya fue aprobada.

### Input 13: Expectativa de estilo / nivel de calidad

- Pertenece a: `Compatibilidad`.
- Tipo de input: selección.
- Obligatorio: no.
- Aporta puntos base: no.
- Uso: se contrasta únicamente con la inversión estimada.

| Respuesta disponible | Puntos base |
| --- | ---: |
| Funcional y económico | 0 |
| Calidad estándar | 0 |
| Premium | 0 |
| Exclusivo/lujo | 0 |
| Sin responder | 0 |

Elegir premium o lujo no suma ni resta por sí solo. Solo genera una deducción cuando el rango de inversión resulta incoherente con esa expectativa.

### Input 14: ¿Ha trabajado con un arquitecto o diseñador antes?

- Pertenece a: `Compatibilidad`.
- Tipo de input: selección de botones.
- Obligatorio: no.
- Aporta puntos: no.
- Uso: personaliza la atención; la experiencia previa no determina la calidad del cliente.

| Respuesta disponible | Puntos |
| --- | ---: |
| Sí, buena experiencia | 0 |
| Sí, mala experiencia | 0 |
| No, es la primera vez | 0 |
| Sin responder | 0 |

### Input 15: Subir imágenes o archivos

- Pertenece a: `Referencias`.
- Tipo de input: carga de archivos.
- Obligatorio: no.
- Máximo: `6` puntos.
- Uso: aporta material visual o documental para comprender el proyecto.

| Respuesta | Puntos |
| --- | ---: |
| Uno o más archivos guardados correctamente | 6 |
| Sin archivos | 0 |

La cantidad de archivos no multiplica los puntos. Uno y diez archivos válidos reciben los mismos `6` puntos. El servidor consulta los adjuntos realmente guardados; el navegador no puede declarar este valor.

### Input 16: Links de referencia

- Pertenece a: `Referencias`.
- Tipo de input: URL.
- Obligatorio: no.
- Máximo: `4` puntos.
- Uso: aporta una referencia externa adicional.

| Respuesta | Puntos |
| --- | ---: |
| Enlace `http` o `https` válido | 4 |
| Sin enlace | 0 |

## Resumen de los 100 puntos base

| Input que aporta puntos | Máximo |
| --- | ---: |
| Descripción | 10 |
| Tamaño definido | 15 |
| Modalidad definida | 15 |
| Disponibilidad del inmueble | 10 |
| Inversión definida | 15 |
| Disponibilidad de capital | 25 |
| Archivos | 6 |
| Enlace | 4 |
| **Total** | **100** |

## Reglas de coherencia entre inputs

Las siguientes deducciones se aplican después de calcular la base. Todas las reglas aplicables se acumulan, pero la pantalla muestra como máximo las tres observaciones de mayor impacto.

### Cruce: tamaño aproximado + rango de inversión

| Tamaño | Inversión | Deducción |
| --- | --- | ---: |
| Mediano | Menos de USD 10.000 | -10 |
| Grande | Menos de USD 10.000 | -25 |
| Muy grande | Menos de USD 10.000 | -35 |
| Muy grande | USD 10.000–50.000 | -25 |
| Grande | No definida | -15 |
| Muy grande | No definida | -20 |

Estas reglas no significan que un proyecto grande valga más. Comprueban si el presupuesto informado parece compatible con el alcance seleccionado.

### Cruce: calidad esperada + rango de inversión

| Calidad | Inversión | Deducción |
| --- | --- | ---: |
| Premium | Menos de USD 10.000 | -20 |
| Lujo | Menos de USD 10.000 | -30 |
| Lujo | USD 10.000–50.000 | -20 |
| Premium | No definida | -15 |
| Lujo | No definida | -20 |

### Cruce: plazo de inicio + inmueble

| Inicio | Inmueble | Deducción |
| --- | --- | ---: |
| Inmediato | No disponible | -20 |
| Inmediato | En adquisición | -10 |
| 1–3 meses | No disponible | -10 |

### Cruce: plazo de inicio + disponibilidad de capital

| Inicio | Capital | Deducción |
| --- | --- | ---: |
| Inmediato | Indefinido | -20 |
| Inmediato | Busca financiamiento | -15 |
| Inmediato | Disponible en tres meses | -10 |
| 1–3 meses | Indefinido | -10 |
| 1–3 meses | Busca financiamiento | -8 |

### Cruce: plazo de inicio + rango de inversión

| Inicio | Inversión | Deducción |
| --- | --- | ---: |
| Inmediato | No definida | -10 |
| 1–3 meses | No definida | -5 |

### Cruce: plazo de inicio + modalidad

| Inicio | Modalidad | Deducción |
| --- | --- | ---: |
| Inmediato | Por definir | -10 |

## Ausencia de doble penalización

Una respuesta incompleta deja de obtener sus puntos base, pero no se descuenta nuevamente por la misma ausencia. Las deducciones adicionales solo aparecen cuando dos respuestas forman una incoherencia documentada.

## Ejemplo: espacio pequeño, premium y con buen presupuesto

```text
Descripción completa: 10
Tamaño pequeño definido: 15
Modalidad definida: 15
Inmueble disponible: 10
Inversión de USD 50.000–150.000: 15
Capital disponible ahora: 25
Archivos y enlace: 10
Calidad premium: 0 puntos base y 0 deducción
Penalizaciones: 0
Resultado: 100 — Excelente compatibilidad
```

El resultado demuestra que ser pequeño no reduce la compatibilidad y que seleccionar premium no causa problemas cuando la inversión es coherente.

## Clasificación final

| Resultado | Código | Etiqueta visible |
| ---: | --- | --- |
| 80–100 | `excellent` | Excelente compatibilidad |
| 60–79 | `high` | Buena compatibilidad |
| 40–59 | `medium` | Compatibilidad media |
| 20–39 | `low` | Baja compatibilidad |
| 0–19 | `poorly_defined` | Solicitud poco definida |

Una puntuación baja nunca impide enviar la solicitud.

## Seguridad y persistencia

- El backend calcula y guarda el resultado.
- El frontend no puede enviar puntaje, nivel, versión ni presencia de archivos.
- Las solicitudes nuevas guardan `compatibility_scoring_version = "2.1"`.
- Las versiones históricas no se recalculan automáticamente.

La fuente de verdad técnica se encuentra en `Backend/src/domain/projectRequest.js`.
