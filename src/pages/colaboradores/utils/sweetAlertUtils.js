import Swal from "sweetalert2";

export const showSuccess = (title, text) =>
  Swal.fire({ icon: "success", title, text, timer: 1500, showConfirmButton: false });

export const showError = (title, text) =>
  Swal.fire({ icon: "error", title, text, confirmButtonText: "OK" });

export const showWarning = (title, text) =>
  Swal.fire({ icon: "warning", title, text, confirmButtonText: "OK" });
