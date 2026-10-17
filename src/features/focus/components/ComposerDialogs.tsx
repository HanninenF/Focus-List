"use client";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { MarkdownText } from "@/src/features/markdown/components/MarkdownText";
import { AiFormatButton } from "@/src/features/ai-formatting/components/AiFormatButton";
import { Tip } from "@/src/shared/ui/Tip";

type ComposerDialogsProps = Readonly<{
  composerParentId: number | null;
  editingChildId: number | null;
  detailDraft: string;
  detailHasCheckbox: boolean;
  editDraft: string;
  showMarkdownPreview: boolean;
  llmLoading: boolean;
  llmError: string;
  onCloseComposer: () => void;
  onCloseEdit: () => void;
  onDetailDraftChange: (value: string) => void;
  onDetailHasCheckboxChange: (value: boolean) => void;
  onEditDraftChange: (value: string) => void;
  onTogglePreview: () => void;
  onCreate: (event: React.FormEvent<HTMLFormElement>) => void;
  onSaveEdit: (event: React.FormEvent<HTMLFormElement>) => void;
  onFormatDetail: () => void;
  onFormatEdit: () => void;
}>;

export function ComposerDialogs({
  composerParentId,
  editingChildId,
  detailDraft,
  detailHasCheckbox,
  editDraft,
  showMarkdownPreview,
  llmLoading,
  llmError,
  onCloseComposer,
  onCloseEdit,
  onDetailDraftChange,
  onDetailHasCheckboxChange,
  onEditDraftChange,
  onTogglePreview,
  onCreate,
  onSaveEdit,
  onFormatDetail,
  onFormatEdit,
}: ComposerDialogsProps) {
  return (
    <>
      <Dialog
        open={composerParentId !== null}
        onClose={onCloseComposer}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { className: "composer-modal" } }}
      >
        <DialogTitle className="modal-title">
          <span className="eyebrow">NYTT UNDERINLÄGG</span>
          <span>Beskriv nästa steg</span>
        </DialogTitle>
        <form onSubmit={onCreate}>
          <DialogContent dividers>
            {showMarkdownPreview ? (
              <div className="markdown-preview modal-editor">
                <MarkdownText
                  value={
                    detailDraft || "Skriv något för att se förhandsvisning."
                  }
                />
              </div>
            ) : (
              <textarea
                aria-label="Text för underinlägg"
                value={detailDraft}
                onChange={(event) => onDetailDraftChange(event.target.value)}
                placeholder="Skriv ett underinlägg… Markdown stöds"
                rows={8}
              />
            )}
            <div className="child-form-tools">
              <Tip title="Förhandsvisa Markdown">
                <button
                  type="button"
                  className="preview-button"
                  onClick={onTogglePreview}
                >
                  {showMarkdownPreview ? "Redigera" : "Förhandsvisa Markdown"}
                </button>
              </Tip>
              <AiFormatButton
                loading={llmLoading}
                disabled={!detailDraft.trim()}
                onFormat={onFormatDetail}
              />
              <label htmlFor="detail-has-checkbox" className="checkbox-option">
                <input
                  id="detail-has-checkbox"
                  type="checkbox"
                  checked={detailHasCheckbox}
                  onChange={(event) =>
                    onDetailHasCheckboxChange(event.target.checked)
                  }
                />{" "}
                Med checkbox
              </label>
            </div>
            {llmError && <p className="llm-error">{llmError}</p>}
            <p className="llm-hint">
              AI-förslaget är redigerbart. Kontrollera innehållet innan du
              sparar.
            </p>
          </DialogContent>
          <DialogActions>
            <span className="modal-hint">Ctrl + Enter för att spara</span>
            <Button
              type="button"
              onClick={onCloseComposer}
              className="modal-cancel"
            >
              Avbryt
            </Button>
            <Button type="submit" variant="contained" className="modal-save">
              Spara underinlägg
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog
        open={editingChildId !== null}
        onClose={onCloseEdit}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { className: "composer-modal" } }}
      >
        <DialogTitle className="modal-title">
          <span className="eyebrow">REDIGERA UNDERINLÄGG</span>
          <span>Uppdatera texten</span>
        </DialogTitle>
        <form onSubmit={onSaveEdit}>
          <DialogContent dividers>
            <textarea
              aria-label="Text för underinlägg"
              value={editDraft}
              onChange={(event) => onEditDraftChange(event.target.value)}
              rows={8}
            />
            <AiFormatButton
              loading={llmLoading}
              disabled={!editDraft.trim()}
              onFormat={onFormatEdit}
            />
            {llmError && <p className="llm-error">{llmError}</p>}
          </DialogContent>
          <DialogActions>
            <Button
              type="button"
              onClick={onCloseEdit}
              className="modal-cancel"
            >
              Avbryt
            </Button>
            <Button type="submit" variant="contained" className="modal-save">
              Spara ändring
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
