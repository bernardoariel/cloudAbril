import type { Product } from '../data/products';

const STORAGE_KEY = 'abril:cart';

type CartItem = Product & { qty: number };

function readCart(): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch (error) {
    console.warn('Cart read failed', error);
    return [];
  }
}

function writeCart(cart: CartItem[]) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn('Cart write failed', error);
  }
}

export function getCart() {
  return readCart();
}

export function addToCart(product: Product) {
  const cart = readCart();
  const existingIndex = cart.findIndex((item) => item.slug === product.slug);

  if (existingIndex >= 0) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  writeCart(cart);
  return cart;
}
