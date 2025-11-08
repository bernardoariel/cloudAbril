# agents.md – Astro Landing “Abril Amoblamientos” (descargable)

## 1) Objetivo
Landing en **Astro + Tailwind** con **banner full-bleed** (sin topbar) usando la imagen 2193×827, una **hoja superpuesta** (card) con ofertas, carrusel de **categorías**, grilla de **productos** (mock) y CTA **Ingresar** (link a portal real). Colores por **tipo** (enum) seleccionables **solo por código**.

---

## 2) Comandos rápidos
```bash
# crear proyecto
npm create astro@latest abril-landing -- --template basics
cd abril-landing

# estilos
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# opcional (si querés carrusel con librería)
npm i embla-carousel

# dev
npm run dev
```

### Tailwind
- Configurá `tailwind.config.mjs` con `content: ['src/**/*.{astro,html,js,ts,tsx,vue}']`.
- Importá Tailwind en `src/styles/global.css` y en `src/layouts/BaseLayout.astro`.

---

## 3) Estructura mínima
```
src/
  components/
    Hero.astro
    Sheet.astro
    CategoryCarousel.astro
    ProductsGrid.astro
    ProductCard.astro
  data/
    categories.ts
    products.ts
    offers.ts
  layouts/
    BaseLayout.astro
  lib/
    theme.ts       # enum + applyTheme (sin UI)
    cart.ts        # mock localStorage
  pages/
    index.astro
    productos/index.astro
    productos/[slug].astro
    ingresar/index.astro
styles/
  theme.css        # variables por tipo
public/
  hero-2193x827.jpg  # TU banner
```

---

## 4) Sistema de colores por **type** (sin selector UI)

`src/lib/theme.ts`
```ts
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
```

`src/styles/theme.css`
```css
:root { /* fallback */
  --brand:#7A1FA2; --accent:#FF4DD2; --bg:#FFF7FA; --text:#222;
}

:root[data-theme="actual"] {
  --brand:#7A1FA2; --accent:#FF4DD2; --bg:#FFF7FA; --text:#222;
}

/* esquema naranja de antes */
:root[data-theme="old"] {
  --brand:#FF8A00; --accent:#FF3D00; --bg:#FFF7EE; --text:#221F1A;
}

/* ejemplo de mes */
:root[data-theme="octubre"] {
  --brand:#6F2DBD; --accent:#C32BAD; --bg:#FCF0FF; --text:#1E1E1E;
}
```

> Para cambiar el tema **por código**, en cualquier componente/ página: `import { setTheme, ThemeType } from "@/lib/theme"; setTheme(ThemeType.Octubre);` (por ejemplo, en `onMount` o en una acción luego de cargar datos del backend en el futuro).

---

## 5) Layout y componentes clave

### `src/layouts/BaseLayout.astro`
```astro
---
const { title = 'Abril Amoblamientos' } = Astro.props;
---
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <link rel="stylesheet" href="/src/styles/theme.css" />
  </head>
  <body class="bg-[var(--bg)] text-[var(--text)] antialiased">
    <slot />
  </body>
</html>
```

### `src/components/Hero.astro` (banner top sin navbar)
```astro
---
const { src, alt = 'Banner' } = Astro.props;
---
<section class="relative w-full">
  <div class="relative w-full min-h-[60vh]">
    <img src={src} alt={alt} class="absolute inset-0 w-full h-full object-cover" />
    <div class="absolute inset-0 bg-black/30"></div>
    <div class="relative z-10 max-w-6xl mx-auto px-4 pt-16 pb-20 text-white">
      <h1 class="text-3xl md:text-5xl font-extrabold drop-shadow">Tu hogar, tu estilo.</h1>
      <p class="mt-3 md:text-lg opacity-90">Promos y colores que cambian cada mes.</p>
    </div>
  </div>
</section>
```

### `src/components/Sheet.astro` (hoja superpuesta)
```astro
<div class="relative z-20 -mt-12 md:-mt-16">
  <div class="max-w-6xl mx-auto px-4">
    <div class="bg-white rounded-2xl shadow-xl border border-black/5">
      <div class="p-6 md:p-10"><slot /></div>
    </div>
  </div>
</div>
```

### Datos mock
`src/data/categories.ts`
```ts
export const categories = [
  { id:'dormitorio', name:'Dormitorio', img:'/cat-dorm.jpg' },
  { id:'living',     name:'Living',     img:'/cat-living.jpg' },
  { id:'cocina',     name:'Cocina',     img:'/cat-cocina.jpg' },
  { id:'oficina',    name:'Oficina',    img:'/cat-ofi.jpg' },
];
```

`src/data/products.ts`
```ts
export const products = [
  { slug:'placard-6p', name:'Placard 6 Puertas', price:399999, listPrice:459999, img:'/p-placard.jpg' },
  { slug:'sofa-l',     name:'Sofá Esquinero L',  price:549999, listPrice:619999, img:'/p-sofa.jpg' },
];
```

`src/data/offers.ts`
```ts
export const offers = ['7 cuotas sin interés','Hasta 25% contado'];
```

### `src/components/ProductsGrid.astro`
```astro
---
import ProductCard from './ProductCard.astro';
const { items } = Astro.props;
---
<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {items.map((p) => <ProductCard product={p} />)}
</div>
```

### `src/components/ProductCard.astro`
```astro
---
const { product } = Astro.props;
---
<div class="border rounded-xl overflow-hidden">
  <img src={product.img} alt={product.name} class="w-full h-48 object-cover" />
  <div class="p-4">
    <div class="font-semibold">{product.name}</div>
    <div class="mt-1">
      {product.listPrice && <span class="text-gray-400 line-through">${product.listPrice.toLocaleString('es-AR')}</span>}
      <span class="ml-2 text-[var(--brand)] font-bold">${product.price.toLocaleString('es-AR')}</span>
    </div>
    <button class="mt-3 w-full py-2 rounded-lg bg-[var(--brand)] text-white font-medium">Comprar</button>
  </div>
</div>
```

---

## 6) Página principal
`src/pages/index.astro`
```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Hero from '@/components/Hero.astro';
import Sheet from '@/components/Sheet.astro';
import ProductsGrid from '@/components/ProductsGrid.astro';
import { products } from '@/data/products';
import { offers } from '@/data/offers';
import { setTheme, ThemeType } from '@/lib/theme';

// ejemplo: fijar tema por código (sin UI)
if (typeof window !== 'undefined') {
  setTheme(ThemeType.Old); // cambiá por el que quieras
}
---
<BaseLayout title="Abril Amoblamientos">
  <Hero src="/hero-2193x827.jpg" alt="Abril Amoblamientos" />
  <Sheet>
    <h2 class="text-2xl md:text-3xl font-bold text-[var(--brand)]">Bienvenido</h2>
    <p class="mt-2 text-sm md:text-base">Elegí por categoría o mirá las ofertas del mes.</p>

    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      {offers.map((o) => (
        <div class="text-white rounded-xl p-4" style={`background: var(--brand);`}>
          <span class="font-semibold">{o}</span>
        </div>
      ))}
    </div>

    <h3 class="mt-10 text-xl font-semibold">Destacados</h3>
    <div class="mt-4">
      <ProductsGrid items={products} />
    </div>
  </Sheet>

  <footer class="mt-16 py-10 text-center text-sm text-black/70">
    <div>abrilamoblamientos.com.ar • Vive en vos</div>
  </footer>
</BaseLayout>
```

---

## 7) Cómo cambiar el color **por código**
- En cualquier página o script: `setTheme(ThemeType.Actual)` / `setTheme(ThemeType.Old)` / `setTheme(ThemeType.Octubre)`.
- En el futuro, Nest puede enviar el **tipo** (string) y lo aplicás en `onMount`.

---

## 8) Prompt corto del agente (para generar)
> **"Crea en Astro una landing sin navbar con hero full-bleed (2193×827) y una hoja superpuesta. Usa Tailwind, datos mock, grilla de productos y CTA Ingresar. Implementa sistema de colores por `type` (enum) sin selector de UI; debe poder cambiarse solo por código con `setTheme(ThemeType.…)`. Estructura y archivos según este agents.md."**

---

## 9) Build
```bash
npm run build && npm run preview
```

# agents.md – Astro Landing “Abril Amoblamientos” (descargable)

## 1) Objetivo
Landing en **Astro + Tailwind** con **banner full-bleed** (sin topbar) usando la imagen 2193×827, una **hoja superpuesta** (card) con ofertas, carrusel de **categorías**, grilla de **productos** (mock) y CTA **Ingresar** (link a portal real). Colores por **tipo** (enum) seleccionables **solo por código**.

---

## 2) Comandos rápidos
```bash
# crear proyecto
npm create astro@latest abril-landing -- --template basics
cd abril-landing

# estilos
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# opcional (si querés carrusel con librería)
npm i embla-carousel

# dev
npm run dev
```

### Tailwind
- Configurá `tailwind.config.mjs` con `content: ['src/**/*.{astro,html,js,ts,tsx,vue}']`.
- Importá Tailwind en `src/styles/global.css` y en `src/layouts/BaseLayout.astro`.

---

## 3) Estructura mínima
```
src/
  components/
    Hero.astro
    Sheet.astro
    CategoryCarousel.astro
    ProductsGrid.astro
    ProductCard.astro
  data/
    categories.ts
    products.ts
    offers.ts
  layouts/
    BaseLayout.astro
  lib/
    theme.ts       # enum + applyTheme (sin UI)
    cart.ts        # mock localStorage
  pages/
    index.astro
    productos/index.astro
    productos/[slug].astro
    ingresar/index.astro
styles/
  theme.css        # variables por tipo
public/
  hero-2193x827.jpg  # TU banner
```

---

## 4) Sistema de colores por **type** (sin selector UI)

`src/lib/theme.ts`
```ts
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
```

`src/styles/theme.css`
```css
:root { /* fallback */
  --brand:#7A1FA2; --accent:#FF4DD2; --bg:#FFF7FA; --text:#222;
}

:root[data-theme="actual"] {
  --brand:#7A1FA2; --accent:#FF4DD2; --bg:#FFF7FA; --text:#222;
}

/* esquema naranja de antes */
:root[data-theme="old"] {
  --brand:#FF8A00; --accent:#FF3D00; --bg:#FFF7EE; --text:#221F1A;
}

/* ejemplo de mes */
:root[data-theme="octubre"] {
  --brand:#6F2DBD; --accent:#C32BAD; --bg:#FCF0FF; --text:#1E1E1E;
}
```

> Para cambiar el tema **por código**, en cualquier componente/ página: `import { setTheme, ThemeType } from "@/lib/theme"; setTheme(ThemeType.Octubre);` (por ejemplo, en `onMount` o en una acción luego de cargar datos del backend en el futuro).

---

## 5) Layout y componentes clave

### `src/layouts/BaseLayout.astro`
```astro
---
const { title = 'Abril Amoblamientos' } = Astro.props;
---
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <link rel="stylesheet" href="/src/styles/theme.css" />
  </head>
  <body class="bg-[var(--bg)] text-[var(--text)] antialiased">
    <slot />
  </body>
</html>
```

### `src/components/Hero.astro` (banner top sin navbar)
```astro
---
const { src, alt = 'Banner' } = Astro.props;
---
<section class="relative w-full">
  <div class="relative w-full min-h-[60vh]">
    <img src={src} alt={alt} class="absolute inset-0 w-full h-full object-cover" />
    <div class="absolute inset-0 bg-black/30"></div>
    <div class="relative z-10 max-w-6xl mx-auto px-4 pt-16 pb-20 text-white">
      <h1 class="text-3xl md:text-5xl font-extrabold drop-shadow">Tu hogar, tu estilo.</h1>
      <p class="mt-3 md:text-lg opacity-90">Promos y colores que cambian cada mes.</p>
    </div>
  </div>
</section>
```

### `src/components/Sheet.astro` (hoja superpuesta)
```astro
<div class="relative z-20 -mt-12 md:-mt-16">
  <div class="max-w-6xl mx-auto px-4">
    <div class="bg-white rounded-2xl shadow-xl border border-black/5">
      <div class="p-6 md:p-10"><slot /></div>
    </div>
  </div>
</div>
```

### Datos mock
`src/data/categories.ts`
```ts
export const categories = [
  { id:'dormitorio', name:'Dormitorio', img:'/cat-dorm.jpg' },
  { id:'living',     name:'Living',     img:'/cat-living.jpg' },
  { id:'cocina',     name:'Cocina',     img:'/cat-cocina.jpg' },
  { id:'oficina',    name:'Oficina',    img:'/cat-ofi.jpg' },
];
```

`src/data/products.ts`
```ts
export const products = [
  { slug:'placard-6p', name:'Placard 6 Puertas', price:399999, listPrice:459999, img:'/p-placard.jpg' },
  { slug:'sofa-l',     name:'Sofá Esquinero L',  price:549999, listPrice:619999, img:'/p-sofa.jpg' },
];
```

`src/data/offers.ts`
```ts
export const offers = ['7 cuotas sin interés','Hasta 25% contado'];
```

### `src/components/ProductsGrid.astro`
```astro
---
import ProductCard from './ProductCard.astro';
const { items } = Astro.props;
---
<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {items.map((p) => <ProductCard product={p} />)}
</div>
```

### `src/components/ProductCard.astro`
```astro
---
const { product } = Astro.props;
---
<div class="border rounded-xl overflow-hidden">
  <img src={product.img} alt={product.name} class="w-full h-48 object-cover" />
  <div class="p-4">
    <div class="font-semibold">{product.name}</div>
    <div class="mt-1">
      {product.listPrice && <span class="text-gray-400 line-through">${product.listPrice.toLocaleString('es-AR')}</span>}
      <span class="ml-2 text-[var(--brand)] font-bold">${product.price.toLocaleString('es-AR')}</span>
    </div>
    <button class="mt-3 w-full py-2 rounded-lg bg-[var(--brand)] text-white font-medium">Comprar</button>
  </div>
</div>
```

---

## 6) Página principal
`src/pages/index.astro`
```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Hero from '@/components/Hero.astro';
import Sheet from '@/components/Sheet.astro';
import ProductsGrid from '@/components/ProductsGrid.astro';
import { products } from '@/data/products';
import { offers } from '@/data/offers';
import { setTheme, ThemeType } from '@/lib/theme';

// ejemplo: fijar tema por código (sin UI)
if (typeof window !== 'undefined') {
  setTheme(ThemeType.Old); // cambiá por el que quieras
}
---
<BaseLayout title="Abril Amoblamientos">
  <Hero src="/hero-2193x827.jpg" alt="Abril Amoblamientos" />
  <Sheet>
    <h2 class="text-2xl md:text-3xl font-bold text-[var(--brand)]">Bienvenido</h2>
    <p class="mt-2 text-sm md:text-base">Elegí por categoría o mirá las ofertas del mes.</p>

    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      {offers.map((o) => (
        <div class="text-white rounded-xl p-4" style={`background: var(--brand);`}>
          <span class="font-semibold">{o}</span>
        </div>
      ))}
    </div>

    <h3 class="mt-10 text-xl font-semibold">Destacados</h3>
    <div class="mt-4">
      <ProductsGrid items={products} />
    </div>
  </Sheet>

  <footer class="mt-16 py-10 text-center text-sm text-black/70">
    <div>abrilamoblamientos.com.ar • Vive en vos</div>
  </footer>
</BaseLayout>
```

---

## 7) Cómo cambiar el color **por código**
- En cualquier página o script: `setTheme(ThemeType.Actual)` / `setTheme(ThemeType.Old)` / `setTheme(ThemeType.Octubre)`.
- En el futuro, Nest puede enviar el **tipo** (string) y lo aplicás en `onMount`.

---

## 8) Prompt corto del agente (para generar)
> **"Crea en Astro una landing sin navbar con hero full-bleed (2193×827) y una hoja superpuesta. Usa Tailwind, datos mock, grilla de productos y CTA Ingresar. Implementa sistema de colores por `type` (enum) sin selector de UI; debe poder cambiarse solo por código con `setTheme(ThemeType.…)`. Estructura y archivos según este agents.md."**

---

## 9) Build
```bash
npm run build && npm run preview
```

