import Swal from "sweetalert2";
import { buttonClasses } from "@/components/ui/button";

export function avisoExito(titulo: string) {
  void Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: titulo,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
}

// Devuelve el motivo escrito, o null si se canceló.
export async function pedirMotivoAnulacion(detalle: string) {
  const { value } = await Swal.fire<string>({
    icon: "warning",
    title: "Anular movimiento",
    text: detalle,
    input: "text",
    inputLabel: "Motivo de la anulación",
    inputValidator: (valor) =>
      valor.trim() ? undefined : "Escribí el motivo.",
    showCancelButton: true,
    confirmButtonText: "Anular",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      actions: "gap-2",
      confirmButton: buttonClasses("danger"),
      cancelButton: buttonClasses("secondary"),
    },
    heightAuto: false,
  });
  return value?.trim() || null;
}

export function avisoError(texto: string) {
  void Swal.fire({
    icon: "error",
    title: "No se pudo completar",
    text: texto,
    confirmButtonText: "Entendido",
    buttonsStyling: false,
    customClass: { confirmButton: buttonClasses("primary") },
    heightAuto: false,
  });
}
