import { useEffect, useRef, useState } from "react";
import Spinner from "../Spinner";
import "./ConfirmDialog.css";

/**
 * Confirmation modal built on <dialog>, so focus trapping and Escape handling
 * come from the browser instead of being reimplemented.
 *
 * When `reasonLabel` is set the dialog collects a free-text reason and hands it
 * to onConfirm — the backend stores it on the status history / deletedBy record.
 */
export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    destructive = false,
    reasonLabel = "",
    reasonRequired = false,
    busy = false,
    onConfirm,
    onCancel,
}) {
    const dialogRef = useRef(null);
    const [reason, setReason] = useState("");

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) return;

        if (open && !dialog.open) {
            setReason("");
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    // Escape closes the native dialog directly, so mirror that back to the parent
    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) return;

        function handleCancel(event) {
            event.preventDefault();

            if (!busy) onCancel();
        }

        dialog.addEventListener("cancel", handleCancel);

        return () => dialog.removeEventListener("cancel", handleCancel);
    }, [busy, onCancel]);

    const missingReason = reasonRequired && !reason.trim();

    return (
        <dialog className="confirm-dialog" ref={dialogRef}>
            <h2>{title}</h2>

            {description && <p>{description}</p>}

            {reasonLabel && (
                <label className="confirm-reason">
                    <span>
                        {reasonLabel}
                        {!reasonRequired && " (optional)"}
                    </span>

                    <textarea
                        rows={3}
                        maxLength={500}
                        value={reason}
                        disabled={busy}
                        onChange={(event) => setReason(event.target.value)}
                    />
                </label>
            )}

            <div className="confirm-actions">
                <button type="button" onClick={onCancel} disabled={busy}>
                    {cancelLabel}
                </button>

                <button
                    type="button"
                    className={destructive ? "danger" : "primary"}
                    disabled={busy || missingReason}
                    onClick={() => onConfirm(reason.trim())}
                >
                    {busy && <Spinner />}
                    {confirmLabel}
                </button>
            </div>
        </dialog>
    );
}
