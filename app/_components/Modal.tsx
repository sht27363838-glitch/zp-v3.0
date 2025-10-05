'use client'
import React, {PropsWithChildren} from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
}

export default function Modal({open, onClose, title, children}: PropsWithChildren<Props>) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title||'Details'}</h3>
          <button className="btn ghost" onClick={onClose}>닫기</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
      <style jsx>{`
        .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:50}
        .modal-panel{width:min(920px,90vw);max-height:85vh;overflow:auto;background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:16px;box-shadow:0 8px 40px rgba(0,0,0,.5)}
        .modal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
        .modal-head h3{margin:0;font-size:18px}
      `}</style>
    </div>
  );
}
