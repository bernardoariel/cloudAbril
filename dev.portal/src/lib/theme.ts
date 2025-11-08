export enum ThemeType {
  Actual = 'actual',
  Old = 'old',           // naranja anterior
  Octubre = 'octubre',   // ejemplo mensual
}

export function setTheme(t: ThemeType) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', t);
}

// ejemplo de uso programático (sin dropdown):
// setTheme(ThemeType.Old)
