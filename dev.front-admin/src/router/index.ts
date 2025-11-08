import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import ProductsView from '@/views/ProductsView.vue';

import SearchProductView from '@/views/SearchProductView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import ProductView from '@/views/ProductView.vue';
import ProductPrice from '@/views/ProductPrice.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import VentasWsView from '@/views/VentasWsView.vue';
import PagosWsView from '@/views/PagosWsView.vue';
import PersonalizadoWsView from '@/views/PersonalizadoWsView.vue';
import ClientesMoraWsView from '@/views/clientesMoraWsView.vue';

// Función para decodificar un JWT
export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error al decodificar el JWT:', error);
    return null;
  }
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return false; // No hay token, el usuario no está autenticado
  }

  try {
    const decodedToken: any = parseJwt(token); // Decodifica el token
    const currentTime = Date.now() / 1000; // Tiempo actual en segundos
    return decodedToken && decodedToken.exp > currentTime; // Verifica si el token está vigente
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return false; // El token es inválido o corrupto
  }
}

// Definición de las rutas
const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    component: DefaultLayout,
    children: [
      {
        path: '/products',
        name: 'productList',
        component: ProductsView,
        meta: { title: 'Listado de Productos', requiresAuth: false },
      },
      {
        path: '/product/:id',
        name: 'productDetail',
        component: ProductView,
        meta: { title: 'Detalle del Producto', requiresAuth: false },
      },
      {
        path: '/product/:id/price',
        name: 'productPrice',
        component: ProductPrice,
        meta: { title: 'Detalle del Producto', requiresAuth: false },
      },
      {
        path: '/search',
        name: 'searchProduct',
        component: SearchProductView,
        meta: { title: 'Buscar Producto', requiresAuth: false },
      },
      {
        path: '/ventasws',
        name: 'ventasWs',
        component: VentasWsView,
        meta: { title: 'Ventas', requiresAuth: false },
      },
      {
        path: '/pagosws',
        name: 'pagosWs',
        component: PagosWsView,
        meta: { title: 'pagos', requiresAuth: false },
      },
      {
        path: '/clientesMora',
        name: 'clientesMoraWs',
        component: ClientesMoraWsView,
        meta: { title: 'pagos', requiresAuth: false },
      },
      {
        path: '/personalizadows',
        name: 'personalizadoWs',
        component: PersonalizadoWsView,
        meta: { title: 'Personalizado', requiresAuth: false },
      },
    ],
  },
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: NotFoundView,
  },
];

// Creación del router
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Middleware de navegación
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  // Redirigir al login si la ruta requiere autenticación y el usuario no está autenticado
  if (requiresAuth && !isAuthenticated()) {
    console.log('No autenticado: redirigiendo al login');
    return next({ name: 'login' });
  }

  // Guardar la ruta anterior con su query
  const savePreviousRoute = (name: string) => {
    localStorage.setItem('previousRoute', JSON.stringify({ name }));
  };

  // Guardar rutas anteriores basadas en la navegación
  if (from.name === 'searchProduct' && to.name === 'productList') {
    savePreviousRoute('searchProduct');
  }
  if (from.name === 'productList' && to.name === 'productDetail') {
    savePreviousRoute('productList');
  }
  if (from.name === 'productDetail' && to.name === 'productPrice') {
    savePreviousRoute('productDetail');
  }
  if (from.name === 'productPrice' && to.name === 'productDetail') {
    if (Object.keys(to.query).length > 0) {
      savePreviousRoute('productList');
    } else {
      savePreviousRoute('searchProduct');
    }
  }

  // Manejar resultados vacíos
  if (to.name === 'productList' && Object.keys(to.query).length > 0) {
    const noResults = to.query.noResults === 'true'; // Verifica si la búsqueda no tiene resultados

    if (noResults) {
      console.log('No se encontraron resultados, redirigiendo a una vista de resultados vacíos');
      return next({
        name: 'notFound',
        query: { message: 'No se encontraron resultados.' },
      });
    }

    // Guarda el estado de las queries en localStorage
    localStorage.setItem('productListQuery', JSON.stringify(to.query));
  }

  // Limpia queries al ir a `searchProduct`
  if (to.name === 'searchProduct') {
    localStorage.setItem('productListQuery', JSON.stringify({}));
  }

  next(); // Permitir la navegación
});

export default router;
