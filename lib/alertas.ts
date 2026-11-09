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
