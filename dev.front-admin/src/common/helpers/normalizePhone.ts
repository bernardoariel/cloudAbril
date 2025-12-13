export const normalizePhone = (raw: string) => {
  // Quitar TODOS los caracteres no numéricos (espacios, guiones, paréntesis, etc.)
  let t = (raw ?? '').replace(/\D/g, '');

  // Si tiene 10 dígitos, agregar código de país 54
  if (t.length === 10) t = '54' + t;

  // Quitar ceros iniciales si los hay
  if (t.startsWith('0') && t.length >= 11) t = t.replace(/^0+/, '');

  // Si empieza con 549, quitar el 9 (formato viejo)
  if (t.startsWith('549') && t.length === 13) {
    t = '54' + t.substring(3);
  }

  const USE_TEST = import.meta.env.VITE_WHATSAPP_USE_TEST === 'true';
  const TEST_NUMBER = (import.meta.env.VITE_WHATSAPP_TEST_NUMBER ?? '').toString().trim();

  if (USE_TEST && TEST_NUMBER) return TEST_NUMBER;
  return t;
};
