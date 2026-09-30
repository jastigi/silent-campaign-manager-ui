# AGENTS.md

## Git

- **Nunca hagas un commit por tu cuenta.** Confirma, etiqueta o borra ramas únicamente cuando se te pida expresamente, aunque el trabajo esté terminado y los tests en verde. Si no hay una petición explícita de commit en el turno actual, deja los cambios en el árbol de trabajo y menciónalos.
- Antes de cualquier commit, revisa `git status`, `git diff` y `git log --oneline -10`, y añade solo los archivos previstos.
- No subas al remoto nada por iniciativa propia.

## Tests

- Comando: `npm test` (Angular + Vitest). No hay scripts de `lint` ni de comprobación de tipos; la validación de tipos ocurre al compilar, dentro de `ng test` y de `ng build`.
- Cada método público de un componente lleva su propio `it(...)`.
- Un fallo de compilación de TypeScript (por ejemplo, llamar a un método `private` o saltar argumentos) detiene la ejecución de los tests: el build falla antes de correr nada. Si un test no compila, no llegó a ejecutarse.

## Verificar antes de dar por buena una expectativa

- Los literales de las clases CSS y de los mensajes del `MatSnackBar` son contrato. Contrasta siempre el valor esperado contra el SCSS y contra la plantilla del componente, no solo contra el método: un helper puede devolver una clase a la que el estilo nunca se aplica.
- Fíjate en el nombre real del método. Componentes con responsabilidades parecidas lo nombran distinto (`openPatrol` en Simulation History, `openSimulationPatrol` en Dashboard).
- Un mock no tipado acepta objetos mínimos, pero uno tipado exige todos los campos de la interfaz. Si el objeto del fixture debe ser completo, el error de tipo salta al compilar.
- Las llamadas que dispara el constructor no se pueden invocar a mano: `TestBed.createComponent()` ya las ejecuta. Los componentes con `ngOnInit()` sí necesitan invocarlo explícitamente, porque los hooks no corren hasta `detectChanges()`.
- `vi.clearAllMocks()` limpia el historial de llamadas y **conserva** las implementaciones. Sirve para descartar llamadas de una carga automática y así demostrar solo lo que hizo una acción concreta. `vi.resetAllMocks()` borraría también las implementaciones.
- Sin `TestBed.overrideComponent({ remove: { imports: [MatSnackBarModule] } })`, un componente standalone recibe la `MatSnackBar` real aunque el registro exista en `providers`, y sus aserciones pasan sin comprobar nada. Aplícalo siempre a componentes con `MatSnackBarModule` en sus `imports`.
- Los constructores cargan datos. Cuando un test necesite atribuir las llamadas a la acción que está probando, limpia antes los mocks, o una llamada de la construcción se confundirá con esa acción. Usa `mockClear()` sobre el mock concreto, que conserva su implementación; `clearAllMocks()` sobre todos ellos borra también las implementaciones y obliga a reescribirlas.
