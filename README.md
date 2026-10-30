# CalendarTS — Calendario de evaluaciones académicas

Aplicación web desarrollada con **React, TypeScript y Tailwind CSS** para consultar y organizar visualmente las fechas de evaluación de cinco cursos universitarios del **II ciclo de 2025**. Permite filtrar actividades por curso, revisar sus detalles y exportarlas a un archivo de calendario (`.ics`).

> **Estado del proyecto:** versión académica con datos precargados para 2025. No es una agenda genérica ni un calendario conectado a servicios externos. Los eventos no se crean ni editan desde la interfaz.

## Funcionalidades

- **Calendario mensual:** presenta evaluaciones en una cuadrícula con semanas de lunes a domingo.
- **Filtros por asignatura:** activa o desactiva la visualización de eventos de cada curso.
- **Identificación visual:** utiliza colores para distinguir asignaturas y marcas para fechas con varias actividades.
- **Detalle por día:** al seleccionar una fecha con eventos, muestra sus evaluaciones, porcentajes y observaciones disponibles.
- **Próximos eventos:** muestra hasta 12 evaluaciones futuras dentro del conjunto de datos cargado y de los filtros activos.
- **Exportación iCalendar:** descarga las evaluaciones filtradas o las de un día seleccionado como archivo `.ics`, con un recordatorio configurado para siete días antes de cada actividad.
- **Diseño adaptable:** interfaz en español con una distribución que se ajusta a distintos tamaños de pantalla.

## Cursos incluidos

El calendario contiene **40 evaluaciones precargadas** correspondientes a las siguientes materias:

| Código interno | Asignatura |
| --- | --- |
| `ADB` | Administración de bases de datos (EIF402) |
| `IS2` | Ingeniería en Sistemas 2 |
| `DI` | Diseño de Interfaces (EIF422O) |
| `PP` | Paradigmas de Programación |
| `SI` | Seguridad Informática (EIF440O) |

Las fechas y los porcentajes corresponden al cronograma registrado en el código, y se presentan con fines de consulta del período académico original. No se actualizan automáticamente.

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| React 19 | Interfaz y componentes |
| TypeScript | Tipado de eventos, cursos y propiedades |
| Vite 7 | Servidor de desarrollo y compilación |
| Tailwind CSS 3 | Estilos y diseño adaptable |
| React Hooks | Estado de filtros, mes seleccionado y fecha activa |
| Web APIs | Generación y descarga de archivos `.ics` con `Blob` y `URL.createObjectURL` |

No utiliza backend, base de datos, autenticación, API externa ni almacenamiento persistente.

## Requisitos

- Node.js y npm compatibles con Vite 7.
- Navegador web moderno.

## Instalación y ejecución

Clona el repositorio:

```bash
git clone https://github.com/MrNano08/CalendarTS.git
cd CalendarTS
```

Instala las dependencias definidas en `package-lock.json`:

```bash
npm ci
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre en el navegador la dirección local que indique Vite (habitualmente `http://localhost:5173`).

Para compilar la aplicación y revisar el resultado:

```bash
npm run build
npm run preview
```

Para ejecutar las reglas de análisis estático configuradas:

```bash
npm run lint
```

> Estos son los comandos declarados por `package.json`. El ZIP fue inspeccionado estáticamente; la instalación y compilación completas no pudieron ejecutarse en el entorno de revisión por falta de un paquete en la caché local.

## Cómo se utiliza

1. Navega entre los meses comprendidos entre **julio y noviembre de 2025**.
2. Selecciona los cursos que deseas consultar en los filtros superiores.
3. Pulsa sobre una fecha con actividades para abrir sus detalles.
4. Utiliza **Exportar este día (.ics)** para descargar las evaluaciones de esa fecha, o **Descargar .ics** para exportar todos los eventos de los cursos seleccionados.
5. Importa el archivo descargado en una aplicación de calendario compatible con iCalendar.

**Importante:** la exportación completa incluye todas las actividades que coinciden con los filtros, no solo las del mes visible. Los eventos se exportan como actividades de día completo; el código no define una hora específica para cada evaluación.

## Estructura principal

```text
CalendarTS/
├── public/                 # Recursos estáticos
├── src/
│   ├── Calendar.tsx        # Datos, componentes y lógica del calendario
│   ├── main.tsx            # Punto de entrada de React
│   └── index.css           # Directivas Tailwind CSS
├── index.html              # Documento HTML base
├── tailwind.config.js      # Configuración de Tailwind
├── vite.config.ts          # Configuración de Vite
├── package.json            # Scripts y dependencias
└── package-lock.json       # Bloqueo de dependencias
```

## Personalización

Los cursos y las evaluaciones están definidos directamente en `src/Calendar.tsx`:

- `COURSES`: nombres, identificadores y estilos por asignatura.
- `EVENTS`: títulos, fechas en formato `YYYY-MM-DD`, porcentajes y notas.
- `MIN_MONTH` y `MAX_MONTH`: límites de navegación por meses.

Para reutilizar el calendario en otro período, modifica esos datos y los límites de navegación, además de los textos específicos del ciclo académico y el nombre del archivo exportado.

## Alcance y limitaciones

- Las evaluaciones son **estáticas** y corresponden al II ciclo de 2025.
- No es posible agregar, editar ni eliminar actividades desde la interfaz.
- Los filtros y la fecha seleccionada no se conservan después de recargar la página.
- La sección **Próximos** se basa en la fecha actual del navegador; cuando ya han pasado todas las evaluaciones de 2025, no muestra actividades futuras.
- Los archivos `.ics` incluyen eventos de día completo y una alarma relativa de siete días; la compatibilidad exacta de alarmas depende de la aplicación donde se importen.
- No hay cuentas de usuario, sincronización en línea, servicios de correo ni notificaciones propias de la aplicación.
- El proyecto no incluye una suite de pruebas automatizadas.

## Contexto

CalendarTS es un proyecto personal y académico orientado a visualizar entregas, exámenes y presentaciones de un período universitario concreto. Su objetivo principal es facilitar la consulta de actividades y su exportación a aplicaciones de calendario.
