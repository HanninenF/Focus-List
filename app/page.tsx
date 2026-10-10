"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import type { FocusArea } from "@/src/core/domain/focus-area";
import type { Item, ThreadView } from "@/src/core/domain/item";
import { MarkdownText } from "@/src/features/markdown/components/MarkdownText";
import { toggleChecklistItem } from "@/src/features/markdown/markdown-service";
import { formatTextWithAi } from "@/src/features/ai-formatting/format-text";
import { childrenOf as getChildrenOf, isRootDone as getIsRootDone, isRootStarted as getIsRootStarted, rootItems } from "@/src/features/todos/todo-rules";
import { StatusIcon } from "@/src/features/todos/components/StatusIcon";
import { itemMatchesQuery, normalizeSearchQuery } from "@/src/features/search/search-service";
import { useWeather } from "@/src/features/weather/weather-hook";
import { weatherIcon } from "@/src/features/weather/weather-icon";
import { focusNameFromSlug, toFocusSlug } from "@/src/shared/utilities/focus-slug";
import { Tip } from "@/src/shared/ui/Tip";

export default function Home({ focusName }: { focusName?: string }) {
  const router = useRouter();
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [newFocusName, setNewFocusName] = useState("");
  const [showNewFocus, setShowNewFocus] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [detailDraft, setDetailDraft] = useState("");
  const [detailHasCheckbox, setDetailHasCheckbox] = useState(true);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const [composerParentId, setComposerParentId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingChildId, setEditingChildId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [threadView, setThreadView] = useState<ThreadView>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMatch, setActiveMatch] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState("");
  const [todayLabel, setTodayLabel] = useState("");
  const weather = useWeather();

  const activeFocusId = (focusName ? focusAreas.find((area) => toFocusSlug(area.name) === focusName)?.id : undefined) ?? focusAreas[0]?.id;
  const currentFocus = focusAreas.find((area) => area.id === activeFocusId);
  const displayedFocusName = currentFocus?.name ?? focusNameFromSlug(focusName);
  const reload = async () => {
    if (!activeFocusId) return;
    setItems(await (await fetch(`/api/items?focusId=${activeFocusId}`, { cache: "no-store" })).json());
  };
  useEffect(() => { fetch("/api/focus-areas", { cache: "no-store" }).then((response) => response.json()).then(setFocusAreas); }, []);
  useEffect(() => {
    setTodayLabel(new Intl.DateTimeFormat("sv-SE", { weekday: "long", day: "numeric", month: "long" }).format(new Date()).toUpperCase());
  }, []);
  useEffect(() => { reload(); }, [activeFocusId]);

  async function createFocusArea(event: FormEvent) {
    event.preventDefault();
    if (!newFocusName.trim()) return;
    const response = await fetch("/api/focus-areas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newFocusName }) });
    if (!response.ok) return;
    const created = await response.json();
    setNewFocusName("");
    setShowNewFocus(false);
    router.push(`/focus/${toFocusSlug(newFocusName)}`);
  }

  const roots = useMemo(() => rootItems(items), [items]);
  const childrenOf = (id: number) => getChildrenOf(items, id);
  const isRootDone = (id: number) => getIsRootDone(items, id);
  const isRootStarted = (id: number) => getIsRootStarted(items, id);

  async function createItem(event: FormEvent, parentId: number | null = null) {
    event.preventDefault();
    const value = parentId === null ? draft : detailDraft;
    if (!value.trim()) return;
    if (!activeFocusId) return;
    const tempId = -Date.now();
    const optimisticItem: Item = { id: tempId, parentId, title: value.trim(), completed: 0, hasCheckbox: parentId === null || detailHasCheckbox ? 1 : 0, focusId: activeFocusId, createdAt: new Date().toISOString() };
    setItems((current) => [optimisticItem, ...current]);
    if (parentId === null) setDraft(""); else setDetailDraft("");
    if (parentId !== null) { setDetailHasCheckbox(true); setShowMarkdownPreview(false); setComposerParentId(null); }
    const response = await fetch("/api/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: value, parentId, focusId: activeFocusId, hasCheckbox: parentId === null ? true : detailHasCheckbox }) });
    if (!response.ok) setItems((current) => current.filter((item) => item.id !== tempId));
    await reload();
  }

  async function toggleChild(item: Item) {
    await fetch("/api/items", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, completed: !item.completed }) });
    reload();
  }

  async function toggleRoot(item: Item) {
    const next = !isRootDone(item.id);
    const children = childrenOf(item.id).filter((child) => child.hasCheckbox === 1);
    if (children.length) await Promise.all(children.map((child) => fetch("/api/items", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: child.id, completed: next }) })));
    else await fetch("/api/items", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, completed: next }) });
    reload();
  }

  async function remove(id: number) {
    await fetch("/api/items", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (activeId === id) setActiveId(null);
    reload();
  }

  async function saveEdit(event: FormEvent, id: number) {
    event.preventDefault();
    if (!editDraft.trim()) return;
    await fetch("/api/items", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, title: editDraft }) });
    setEditingId(null);
    setEditingChildId(null);
    setEditDraft("");
    reload();
  }

  async function toggleMarkdownCheckbox(item: Item, index: number, checked: boolean) {
    const nextTitle = toggleChecklistItem(item.title, index, checked);
    if (nextTitle === item.title) return;
    setItems((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, title: nextTitle } : currentItem));
    const response = await fetch("/api/items", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, title: nextTitle }) });
    if (!response.ok) await reload();
  }

  function startEdit(item: Item) {
    setEditingId(item.id);
    setEditDraft(item.title);
  }

  function startChildEdit(item: Item) {
    setEditingChildId(item.id);
    setEditDraft(item.title);
  }

  async function formatDraftWithLlm(value: string, setValue: (nextValue: string) => void) {
    if (!value.trim() || llmLoading) return;
    setLlmLoading(true);
    setLlmError("");
    try {
      setValue(await formatTextWithAi(value));
      setShowMarkdownPreview(false);
    } catch (error) {
      setLlmError(error instanceof Error ? error.message : "AI-formateringen misslyckades.");
    } finally {
      setLlmLoading(false);
    }
  }

  const visibleRoots = roots.filter((item) => threadView === "all" || (threadView === "active" ? !isRootDone(item.id) : isRootDone(item.id))).filter((item) => itemMatchesQuery(item, items, searchQuery));
  useEffect(() => { setActiveMatch(0); }, [searchQuery]);
  useEffect(() => {
    const query = normalizeSearchQuery(searchQuery);
    if (!query) return;
    const matchingRoot = roots.find((item) => itemMatchesQuery(item, items, query));
    if (matchingRoot) setActiveId(matchingRoot.id);
  }, [searchQuery, items]);
  useEffect(() => {
    const matches = Array.from(document.querySelectorAll<HTMLElement>(".search-hit"));
    setMatchCount(matches.length);
    matches.forEach((match, index) => match.classList.toggle("search-hit-active", index === activeMatch));
    if (matches.length) matches[Math.min(activeMatch, matches.length - 1)]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [searchQuery, items, threadView, activeId, activeMatch]);
  const moveToMatch = (direction: 1 | -1) => {
    if (!matchCount) return;
    setActiveMatch((current) => (current + direction + matchCount) % matchCount);
  };
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><Tip title="Starta nytt fokusområde" placement="right"><button className="brand-mark" onClick={() => setShowNewFocus(!showNewFocus)}>＋</button></Tip><span>{displayedFocusName}</span></div>
        <div className="focus-switcher"><label>FOKUSOMRÅDE</label><Tip title="Byt fokusområde"><select value={currentFocus?.name ?? ""} onChange={(event) => router.push(`/focus/${toFocusSlug(event.target.value)}`)}>{focusAreas.map((area) => <option value={area.name} key={area.id}>{area.name}</option>)}</select></Tip>{showNewFocus && <form className="new-focus-form" onSubmit={createFocusArea}><input autoFocus value={newFocusName} onChange={(event) => setNewFocusName(event.target.value)} placeholder="t.ex. Musik" /><Tip title="Spara fokusområde"><button type="submit">Skapa</button></Tip></form>}</div>
        <div className="sidebar-label">VY</div>
        <Tip title="Visa alla trådar" placement="right"><button className={`nav-item ${threadView === "all" ? "active" : ""}`} onClick={() => setThreadView("all")}><span>☷</span> Alla trådar <b>{roots.length}</b></button></Tip>
        <Tip title="Visa pågående trådar" placement="right"><button className={`nav-item ${threadView === "active" ? "active" : ""}`} onClick={() => setThreadView("active")}><span>◷</span> Pågående <b>{roots.filter((item) => !isRootDone(item.id)).length}</b></button></Tip>
        <Tip title="Visa klara trådar" placement="right"><button className={`nav-item ${threadView === "completed" ? "active" : ""}`} onClick={() => setThreadView("completed")}><span>✓</span> Klara <b>{roots.filter((item) => isRootDone(item.id)).length}</b></button></Tip>
        <div className="sidebar-footer"><span className="avatar">F</span><div><strong>Fredrik</strong><small>Min arbetsyta</small></div><span className="dots">•••</span></div>
      </aside>
      <section className="content">
        <header className="topbar"><div><div className="date-row"><p className="eyebrow">{todayLabel}</p>{weather && <span className="weather" title={`Väder i ${weather.location}`}>{weatherIcon(weather.weatherCode, weather.isDay)} {Math.round(weather.temperature)}°</span>}</div><h1>Hej, Fredrik <span>✦</span></h1></div><div className="top-actions">{searchOpen && <><div className="search-nav"><button type="button" onClick={() => moveToMatch(-1)} disabled={!matchCount} title="Föregående träff" aria-label="Föregående träff">⌃</button><button type="button" onClick={() => moveToMatch(1)} disabled={!matchCount} title="Nästa träff" aria-label="Nästa träff">⌄</button></div><div className="search-box"><input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") { setSearchQuery(""); setSearchOpen(false); } }} placeholder="Sök trådar…" /><span className="search-count">{matchCount ? activeMatch + 1 : 0}/{matchCount}</span><button type="button" onClick={() => { setSearchQuery(""); setSearchOpen(false); }} aria-label="Stäng sökning">×</button></div></>}<Tip title={searchOpen ? "Stäng sökning" : "Sök i trådar"}><button className="icon-button" onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearchQuery(""); }} aria-label={searchOpen ? "Stäng sökning" : "Sök i trådar"}>⌕</button></Tip><Tip title="Profil"><button className="avatar small">F</button></Tip></div></header>
        <div className="intro"><div><h2>{displayedFocusName}</h2><p>Små steg blir stora framsteg.</p></div><div className="progress"><span>DINA FRAMSTEG</span><strong>{roots.filter((r) => isRootDone(r.id)).length}<em> / {roots.length || 0}</em></strong><div className="progress-bar"><i style={{ width: `${roots.length ? (roots.filter((r) => isRootDone(r.id)).length / roots.length) * 100 : 0}%` }} /></div></div></div>
        <form className="new-item" onSubmit={(event) => createItem(event)}><span>＋</span><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Vad vill du få gjort?" /><Tip title="Lägg till ny tråd"><button type="submit">Lägg till</button></Tip></form>
        <div className="list-head"><span>TRÅDAR <b>{visibleRoots.length}</b></span><Tip title={threadView === "all" ? "Dölj klara trådar" : "Visa alla trådar"}><button onClick={() => setThreadView(threadView === "all" ? "active" : "all")}>{threadView === "all" ? "Dölj klara" : "Visa alla"}　⌄</button></Tip></div>
        <div className="thread-list">
          {visibleRoots.map((item) => {
            const children = childrenOf(item.id); const done = isRootDone(item.id); const started = isRootStarted(item.id);
            const checkboxChildren = children.filter((child) => child.hasCheckbox === 1);
            return <article className={`thread ${activeId === item.id ? "selected" : ""} ${done ? "is-done" : ""}`} key={item.id}>
              {editingId === item.id ? <form className="edit-row" onSubmit={(event) => saveEdit(event, item.id)}><input autoFocus value={editDraft} onChange={(event) => setEditDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && event.ctrlKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /><Tip title="Spara ändring"><button type="submit">Spara</button></Tip><Tip title="Avbryt redigering"><button type="button" onClick={() => setEditingId(null)}>Avbryt</button></Tip></form> : <div className="thread-row" onClick={() => setActiveId(activeId === item.id ? null : item.id)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") setActiveId(activeId === item.id ? null : item.id); }}><Tip title={done ? "Markera tråden som pågående" : "Markera tråden som klar"}><button className="check-wrap" onClick={(event) => { event.stopPropagation(); toggleRoot(item); }}><StatusIcon state={done ? "done" : started ? "started" : "empty"} /></button></Tip><MarkdownText value={item.title} className="thread-title" highlightQuery={searchQuery} onCheckboxToggle={(index, checked) => toggleMarkdownCheckbox(item, index, checked)} /><span className="child-count">{children.length ? `${children.filter((child) => child.completed).length}/${children.length}` : ""}</span><Tip title="Redigera tråd"><button className="edit-item" onClick={(event) => { event.stopPropagation(); startEdit(item); }} aria-label="Redigera tråd">✎</button></Tip><Tip title={activeId === item.id ? "Fäll ihop tråd" : "Visa underinlägg"}><span className="chevron">{activeId === item.id ? "⌃" : "⌄"}</span></Tip></div>}
              {activeId === item.id && <div className="thread-detail"><div className="detail-line"><span className="line-dot" /><span className="detail-hint">UNDERINLÄGG <b>{children.length}</b></span></div><div className="thread-detail-actions"><Tip title="Skapa underinlägg"><button className="open-composer" onClick={() => { setDetailDraft(""); setDetailHasCheckbox(true); setShowMarkdownPreview(false); setComposerParentId(item.id); }}>＋ Nytt underinlägg</button></Tip><Tip title="Ta bort hela tråden"><button className="delete-thread" onClick={() => remove(item.id)}>Ta bort tråd</button></Tip></div>{children.map((child) => <div className="child-row" key={child.id}>{child.hasCheckbox ? <Tip title={child.completed ? "Markera som pågående" : "Markera som klar"}><button className={`child-check ${child.completed ? "checked" : ""}`} onClick={() => toggleChild(child)}>{child.completed ? "✓" : ""}</button></Tip> : <span className="child-bullet">—</span>}<MarkdownText value={child.title} className={child.completed ? "child-done" : ""} highlightQuery={searchQuery} onCheckboxToggle={(index, checked) => toggleMarkdownCheckbox(child, index, checked)} /><div className="item-actions"><Tip title="Redigera underinlägg"><button className="edit-item" onClick={() => startChildEdit(child)} aria-label="Redigera underinlägg">✎</button></Tip><Tip title="Ta bort underinlägg"><button className="remove" onClick={() => remove(child.id)} aria-label="Ta bort underinlägg">×</button></Tip></div></div>)}</div>}
            </article>;
          })}
          {!visibleRoots.length && <div className="empty-state"><span>✦</span><p>Listan är tom.</p><small>Lägg till något litet att börja med.</small></div>}
        </div>
        <footer className="tip"><span>✦</span><p><strong>Tips:</strong> Klicka på en tråd för att bryta ner den i mindre steg.</p></footer>
        <Dialog open={composerParentId !== null} onClose={() => setComposerParentId(null)} fullWidth maxWidth="sm" slotProps={{ paper: { className: "composer-modal" } }}><DialogTitle className="modal-title"><span className="eyebrow">NYTT UNDERINLÄGG</span><span>Beskriv nästa steg</span></DialogTitle><form onSubmit={(event) => createItem(event, composerParentId)}><DialogContent dividers>{showMarkdownPreview ? <div className="markdown-preview modal-editor"><MarkdownText value={detailDraft || "Skriv något för att se förhandsvisning."} /></div> : <textarea autoFocus value={detailDraft} onChange={(event) => setDetailDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && event.ctrlKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Skriv ett underinlägg… Markdown stöds" rows={8} />}<div className="child-form-tools"><Tip title={showMarkdownPreview ? "Tillbaka till redigering" : "Visa hur Markdown formateras"}><button type="button" className="preview-button" onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}>{showMarkdownPreview ? "Redigera" : "Förhandsvisa Markdown"}</button></Tip><button type="button" className="ai-format-button" onClick={() => formatDraftWithLlm(detailDraft, setDetailDraft)} disabled={llmLoading || !detailDraft.trim()}>{llmLoading ? "Bearbetar…" : "✦ AI-förslag"}</button><label className="checkbox-option" title="Välj om underinlägget ska kunna bockas av"><input type="checkbox" checked={detailHasCheckbox} onChange={(event) => setDetailHasCheckbox(event.target.checked)} /> Med checkbox</label></div>{llmError && <p className="llm-error">{llmError}</p>}<p className="llm-hint">AI-förslaget är en redigerbar språk- och Markdown-version. Kontrollera innehållet innan du sparar.</p></DialogContent><DialogActions><span className="modal-hint">Ctrl + Enter för att spara</span><Tip title="Stäng utan att spara"><Button type="button" onClick={() => setComposerParentId(null)} className="modal-cancel">Avbryt</Button></Tip><Tip title="Spara underinlägg"><Button type="submit" variant="contained" className="modal-save">Spara underinlägg</Button></Tip></DialogActions></form></Dialog>
        <Dialog open={editingChildId !== null} onClose={() => setEditingChildId(null)} fullWidth maxWidth="sm" slotProps={{ paper: { className: "composer-modal" } }}><DialogTitle className="modal-title"><span className="eyebrow">REDIGERA UNDERINLÄGG</span><span>Uppdatera texten</span></DialogTitle><form onSubmit={(event) => editingChildId !== null && saveEdit(event, editingChildId)}><DialogContent dividers><textarea autoFocus value={editDraft} onChange={(event) => setEditDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && event.ctrlKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={8} /><button type="button" className="ai-format-button" onClick={() => formatDraftWithLlm(editDraft, setEditDraft)} disabled={llmLoading || !editDraft.trim()}>{llmLoading ? "Bearbetar…" : "✦ AI-förslag"}</button>{llmError && <p className="llm-error">{llmError}</p>}<p className="llm-hint">AI-förslaget är en redigerbar språk- och Markdown-version. Kontrollera innehållet innan du sparar.</p></DialogContent><DialogActions><span className="modal-hint">Ctrl + Enter för att spara</span><Tip title="Stäng utan att spara"><Button type="button" onClick={() => setEditingChildId(null)} className="modal-cancel">Avbryt</Button></Tip><Tip title="Spara ändring"><Button type="submit" variant="contained" className="modal-save">Spara ändring</Button></Tip></DialogActions></form></Dialog>
      </section>
    </main>
  );
}
