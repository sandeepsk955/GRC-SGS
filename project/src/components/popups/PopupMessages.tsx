import React from "react";
import { CheckCircle, X, XCircle, AlertTriangle, Info } from "lucide-react";

export type PopupKind = "success" | "error" | "warning" | "info";

export type PopupAction = {
  label: string;
  onClick: () => void;
  /** default = "primary" */
  variant?: "primary" | "secondary";
};

export interface PopupMessageProps {
  open: boolean;
  kind?: PopupKind;
  title?: string;
  message?: string | string[];
  onClose?: () => void;
  actions?: PopupAction[]; // e.g. [{label:"OK", onClick: fn}, {label:"Cancel", onClick: fn, variant:"secondary"}]
}

const PopupMessages: React.FC<PopupMessageProps> = ({
  open,
  kind = "info",
  title,
  message = "",
  onClose,
  actions,
}) => {
  if (!open) return null;

  const tone =
    kind === "success"
      ? "text-green-600"
      : kind === "error"
      ? "text-red-600"
      : kind === "warning"
      ? "text-amber-600"
      : "text-blue-600";

  const icon =
    kind === "success" ? (
      <CheckCircle className={`w-6 h-6 ${tone}`} />
    ) : kind === "error" ? (
      <XCircle className={`w-6 h-6 ${tone}`} />
    ) : kind === "warning" ? (
      <AlertTriangle className={`w-6 h-6 ${tone}`} />
    ) : (
      <Info className={`w-6 h-6 ${tone}`} />
    );

  const normalized = Array.isArray(message) ? message : [message];

  const handleAction = (a: PopupAction) => () => {
    a.onClick?.();
  };

  const titleText =
    title ||
    (kind === "success"
      ? "Success"
      : kind === "error"
      ? "Something went wrong"
      : kind === "warning"
      ? "Please check and try again"
      : "Information");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold text-gray-800">{titleText}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 mb-5">
          {normalized.map((line, i) => (
            <p key={i} className="text-gray-700 whitespace-pre-line">
              {line}
            </p>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          {actions?.map((a, idx) =>
            a.variant === "secondary" ? (
              <button
                key={idx}
                onClick={handleAction(a)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {a.label}
              </button>
            ) : null
          )}
          <button
            onClick={
              actions?.find((a) => a.variant !== "secondary")?.onClick || onClose
            }
            className={`px-4 py-2 rounded-lg text-white ${
              kind === "error"
                ? "bg-red-600 hover:bg-red-700"
                : kind === "warning"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {actions?.find((a) => a.variant !== "secondary")?.label || "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupMessages;
