import { computed, type Ref } from 'vue';

type AnyObj = Record<string, any>;

type UseWhatsappPreviewMessageArgs = {
  item: Ref<AnyObj | null>;
  type: 'venta' | 'recibo';

  // Para venta (opcional según tu vista)
  ventaDetalleFactura?: Ref<any | null>;
  ventaLoadingDetalle?: Ref<boolean>;
  ventaMetodosPago?: Ref<any[] | undefined>;

  // Diccionario de formas de pago (opcional)
  metodosPagoLabels?: Ref<Record<string, string>>;

  // Para resolver sucursal (recibo)
  findSucursalById?: (id: any) => any;
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('es-AR', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const formatCurrency = (amount: number | undefined | null) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '';
  return `$${amount.toLocaleString('es-AR')}`;
};

const buildNombreCompleto = (obj: AnyObj) => {
  const apellido = obj.ApellidoCont || '';
  const nombre = obj.NombreCont || '';
  if (apellido && nombre) return `${apellido}, ${nombre}`;
  if (apellido) return apellido;
  if (nombre) return nombre;
  return obj.Nombre || 'CLIENTE';
};

export function useWhatsappPreviewMessage(args: UseWhatsappPreviewMessageArgs) {
  const title = computed(() => args.item.value?.Telefonos || 'Cliente');

  const isEmpty = computed(() => !args.item.value);

  const message = computed(() => {
    const it = args.item.value;
    if (!it) return '';

    if (args.type === 'recibo') {
      const codigoSucursal = it.CodSucursal || it.codSucRecibo || it.CodSucRecibo;
      const suc = args.findSucursalById && codigoSucursal ? args.findSucursalById(codigoSucursal) : null;
      const nombreSucursal = suc?.NombreSuc || (codigoSucursal ? 'SUCURSAL NO ENCONTRADA' : 'SUCURSAL NO INFORMADA');

      const nombre = buildNombreCompleto(it);

      return `Hola ${nombre}, su cuenta registra un Nuevo Pago.
Documento: ${it.NroDoc || 'N/A'}
Sucursal: ${nombreSucursal}
Operación Nº: ${it.CodCredito || 'N/A'}
Importe: ${formatCurrency(it.MontoPagado)}
Recibo Nº: ${it.CodReciboPr || 'N/A'}
Fecha: ${formatDate(it.Fecha)}

Recuerde que su crédito también puede abonarlo online y desde su hogar a través de Mercado Pago.
Gracias por cumplir con la Empresa!`;
    }

    // === VENTA ===
    const cuerpo =
      'Nos complace comunicarnos desde ABRIL Amoblamientos SRL\nsu cuenta registra una Nueva Operación:';

    let productos = '';
    const loadingDetalle = args.ventaLoadingDetalle?.value;

    if (loadingDetalle) {
      productos = '\n\nProductos ->\n[SPINNER_PRODUCTOS]';
    } else {
      const det = args.ventaDetalleFactura?.value;
      if (det && Array.isArray(det.detalles)) {
        const filtrados = det.detalles.filter((d: any) => d.CodProducto >= 1000);
        if (filtrados.length) {
          productos = '\n\nProductos ->';
          filtrados.forEach((d: any) => {
            productos += `\n${d.Cantidad} - ${d.NombreProducto}`;
          });
        }
      }
    }

    let metodos = '';
    if (loadingDetalle) {
      metodos = '\n\nMetodos ->\n[SPINNER_METODOS]';
    } else {
      const lista = args.ventaMetodosPago?.value || [];
      if (lista.length) {
        metodos = '\n\nMetodos ->';
        lista.forEach((m: any) => {
          const label = args.metodosPagoLabels?.value?.[m.CodForPago] || m.CodForPago;

          if (String(label).toUpperCase().includes('CREDITO') && m.CantCuotas && m.CantCuotas > 1) {
            const montoPorCuota = m.Importe / m.CantCuotas;
            metodos += `\n${label} ${m.CantCuotas} cuotas de $${montoPorCuota.toLocaleString('es-AR')} ($${m.Importe.toLocaleString(
              'es-AR',
            )})`;
          } else {
            metodos += `\n${label} $${Number(m.Importe || 0).toLocaleString('es-AR')}`;
          }
        });
      }
    }

    const nombre = buildNombreCompleto(it);

    const detalle = `Operacion N*: ${it.venta_CodVenta} Fecha: (${formatDate(it.venta_Fecha)})\nNombre: ${nombre}\nDocumento: (${it.NroDoc})${productos}${metodos}`;
    const pie = 'Gracias por elegirnos ... que disfrute su Compra!';

    return `${cuerpo}\n\n${detalle}\n\n${pie}`;
  });

  return {
    title,
    subtitle: computed(() => (isEmpty.value ? 'Seleccione un item' : 'en línea')),
    isEmpty,
    message,
  };
}
