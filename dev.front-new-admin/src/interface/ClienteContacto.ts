export interface ClienteContacto {
  IdClienteContacto:      number;
  CodSucursal:            number;
  CodCliente:             number;
  CodTipoContacto:        number;
  Caracteristica:         string;
  Numero:                 number;
  Interno:                number | null;
  EsPrincipal:            string;
  Email:                  string;
  envia_sms:              string;
  NombreCont:             string;
  ApellidoCont:           string;
  PresentaFactura:        null;
  Estado:                 boolean;
  Usr_Alta:               number;
  Fecha_Alta:             Date;
  Usr_Mod:                null;
  Fecha_Mod:              null;
  ID_SOLICITUD_CONTACTOS: null;
  TelefonoVerificado:     null;
  NombreTelefono:         null;
  DomicilioTelefono:      null;
}
