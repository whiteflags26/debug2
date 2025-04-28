export interface ITurfStatusResponse {
  isOpen: boolean;
  status: "OPEN" | "CLOSED";
  message: string;
}
