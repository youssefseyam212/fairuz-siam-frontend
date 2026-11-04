'use client';

import { useStore } from '@/context/StoreProvider';

export function Toast() {
  const { toastState, hideToast } = useStore();
  return (
    <div className={`toast${toastState.on ? ' on' : ''}`} role="status" aria-live="polite">
      <span>{toastState.msg}</span>
      <button className="label press" type="button" hidden={!toastState.act}
        onClick={() => { hideToast(); toastState.fn?.(); }}>
        {toastState.act}
      </button>
    </div>
  );
}
