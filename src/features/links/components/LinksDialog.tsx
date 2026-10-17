"use client";

import { useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import type { ItemLink } from "@/src/core/domain/item-link";
import type { CancellationToken } from "@/src/core/ports/cancellation";
import { itemLinkService } from "@/src/application/client-services";

type LinksDialogProps = Readonly<{
  itemId: number | null;
  onClose: () => void;
}>;

type LinkDraft = Readonly<{ title: string; url: string }>;

const emptyDraft: LinkDraft = { title: "", url: "" };

export function LinksDialog({ itemId, onClose }: LinksDialogProps) {
  const [links, setLinks] = useState<ItemLink[]>([]);
  const [draft, setDraft] = useState<LinkDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const requestVersion = useRef(0);
  const mutationController = useRef<AbortController | null>(null);

  function createCancellation(controller: AbortController): CancellationToken {
    return {
      onCancel: (listener) => {
        if (controller.signal.aborted) {
          listener();
          return () => undefined;
        }
        controller.signal.addEventListener("abort", listener, { once: true });
        return () => controller.signal.removeEventListener("abort", listener);
      },
    };
  }

  useEffect(() => {
    const version = ++requestVersion.current;
    const controller = new AbortController();
    mutationController.current?.abort();
    mutationController.current = null;
    setSaving(false);
    setDeletingId(null);
    if (itemId === null) {
      setLinks([]);
      setLoading(false);
      return;
    }
    setLinks([]);
    setDraft(emptyDraft);
    setEditingId(null);
    setError("");
    setLoading(true);
    const cancellation: CancellationToken = {
      onCancel: (listener) => {
        if (controller.signal.aborted) {
          listener();
          return () => undefined;
        }
        controller.signal.addEventListener("abort", listener, { once: true });
        return () => controller.signal.removeEventListener("abort", listener);
      },
    };
    itemLinkService
      .loadLinks(itemId, cancellation)
      .then((nextLinks) => {
        if (version === requestVersion.current) setLinks(nextLinks);
      })
      .catch(() => {
        if (version === requestVersion.current)
          setError("Länkarna kunde inte hämtas.");
      })
      .finally(() => {
        if (version === requestVersion.current) setLoading(false);
      });
    return () => {
      controller.abort();
      mutationController.current?.abort();
      mutationController.current = null;
    };
  }, [itemId]);

  function startEdit(link: ItemLink) {
    setEditingId(link.id);
    setDraft({ title: link.title, url: link.url });
    setError("");
  }

  function resetDraft() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  async function saveLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (itemId === null) return;
    if (!draft.title.trim() || !draft.url.trim()) {
      setError("Titel och URL måste fyllas i.");
      return;
    }
    setError("");
    setSaving(true);
    const controller = new AbortController();
    mutationController.current = controller;
    const cancellation = createCancellation(controller);
    const version = requestVersion.current;
    try {
      if (editingId === null) {
        const created = await itemLinkService.createLink(
          { itemId, title: draft.title, url: draft.url },
          cancellation,
        );
        if (version === requestVersion.current)
          setLinks((current) => [...current, created]);
      } else {
        await itemLinkService.updateLink(editingId, draft, cancellation);
        if (version === requestVersion.current)
          setLinks((current) =>
            current.map((link) =>
              link.id === editingId ? { ...link, ...draft } : link,
            ),
          );
      }
      if (version === requestVersion.current) resetDraft();
    } catch {
      if (!controller.signal.aborted && version === requestVersion.current)
        setError("Länken kunde inte sparas. Kontrollera titel och URL.");
    } finally {
      if (version === requestVersion.current) setSaving(false);
      if (mutationController.current === controller)
        mutationController.current = null;
    }
  }

  async function removeLink(id: number) {
    if (!window.confirm("Vill du ta bort länken?")) return;
    setDeletingId(id);
    const controller = new AbortController();
    mutationController.current = controller;
    const cancellation = createCancellation(controller);
    const version = requestVersion.current;
    try {
      await itemLinkService.removeLink(id, cancellation);
      if (version === requestVersion.current) {
        setLinks((current) => current.filter((link) => link.id !== id));
        if (editingId === id) resetDraft();
      }
    } catch {
      if (!controller.signal.aborted && version === requestVersion.current)
        setError("Länken kunde inte tas bort.");
    } finally {
      if (version === requestVersion.current) setDeletingId(null);
      if (mutationController.current === controller)
        mutationController.current = null;
    }
  }

  return (
    <Dialog
      open={itemId !== null}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { className: "composer-modal links-modal" } }}
    >
      <DialogTitle className="modal-title">
        <span className="eyebrow">LÄNKAR</span>
        <span>Länkar</span>
      </DialogTitle>
      <DialogContent dividers>
        <div className="links-list" aria-live="polite">
          {loading && <p className="links-empty">Hämtar länkar…</p>}
          {!loading && !links.length && (
            <p className="links-empty">Inga länkar tillagda ännu.</p>
          )}
          {links.map((link) => (
            <div className="link-card" key={link.id}>
              <a
                className="link-card-title"
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                {link.title}
              </a>
              <div className="link-card-actions">
                <button
                  type="button"
                  disabled={saving || deletingId !== null}
                  onClick={() => startEdit(link)}
                >
                  Redigera
                </button>
                <button
                  type="button"
                  disabled={saving || deletingId !== null}
                  onClick={() => removeLink(link.id)}
                >
                  Ta bort
                </button>
              </div>
            </div>
          ))}
        </div>
        <form className="link-form" onSubmit={saveLink}>
          <h3>{editingId === null ? "Lägg till länk" : "Redigera länk"}</h3>
          <input
            value={draft.title}
            onChange={(event) =>
              setDraft((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Namn på länken"
            aria-label="Namn på länken"
            required
            disabled={saving}
          />
          <input
            value={draft.url}
            onChange={(event) =>
              setDraft((current) => ({ ...current, url: event.target.value }))
            }
            placeholder="https://…"
            type="url"
            aria-label="URL"
            required
            disabled={saving}
          />
          <div className="link-form-actions">
            {editingId !== null && (
              <button type="button" onClick={resetDraft} disabled={saving}>
                Avbryt redigering
              </button>
            )}
            <button type="submit" disabled={saving || deletingId !== null}>
              {editingId === null ? "Lägg till länk" : "Spara länk"}
            </button>
          </div>
        </form>
        {error && (
          <p className="llm-error" role="alert">
            {error}
          </p>
        )}
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={onClose} className="modal-cancel">
          Stäng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
