export const normalizePhone = (raw: string) => {
  let t = (raw ?? "").replace(/\D/g, "");
  if (t.length === 10) t = "54" + t;
  if (t.startsWith("0") && t.length >= 11) t = t.replace(/^0+/, "");

  const USE_TEST = import.meta.env.VITE_WHATSAPP_USE_TEST === "true";
  const TEST_NUMBER = (import.meta.env.VITE_WHATSAPP_TEST_NUMBER ?? "").toString().trim();

  if (USE_TEST && TEST_NUMBER) return TEST_NUMBER;
  return t;
}
