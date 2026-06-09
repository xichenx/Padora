import type { ContextMenuState } from "../types";
import type { Strings } from "../i18n";

interface ContextMenuProps {
  menu: ContextMenuState;
  L: Strings;
  onNewFile: () => void;
  onRename: () => void;
  onDelete: () => void;
  onReveal: () => void;
}

export function ContextMenu({
  menu,
  L,
  onNewFile,
  onRename,
  onDelete,
  onReveal,
}: ContextMenuProps) {
  return (
    <div
      className="ctx-menu"
      style={{ left: menu.x, top: menu.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="ctx-item" onClick={onNewFile}>
        {L.ctxNewFile}
      </button>
      <button className="ctx-item" onClick={onRename}>
        {L.ctxRename}
      </button>
      <button className="ctx-item danger" onClick={onDelete}>
        {L.ctxDelete}
      </button>
      <div className="ctx-sep" />
      <button className="ctx-item" onClick={onReveal}>
        {L.ctxReveal}
      </button>
    </div>
  );
}
