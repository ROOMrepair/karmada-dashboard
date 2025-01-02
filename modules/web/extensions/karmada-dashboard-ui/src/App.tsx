import React, { useRef, useEffect, useState } from 'react';
import { Loading } from '@kubed/components';
import { useCheckWindows, CustomEventData } from './utils/iframe';
import { karmadaServiceUrl } from './utils/constants';
import { useFetchToken } from './utils/request';
import { tokenUrl } from './utils/constants';
import { notify } from '@kubed/components';
// import { useWinState } from './utils/winState';

export default function App() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  // const [newWindow, setNewWindow] = useState<Window | null>(null);
  // const [newWindow] = useWinState();

  const [loading, setLoading] = useState(true);
  const { isIframeReady, postMessageToIframe } = useCheckWindows(iframeRef);
  const { token, fetchLoading, error } = useFetchToken(tokenUrl, '');

  // const openNewWindow = () => {
  //   const win = window.open(karmadaServiceUrl, '_blank');
  //   if (win) {
  //     setNewWindow(win);
  //     setTimeout(() => {
  //     }, 300);
  //   } else {
  //     notify.error("Failed to open new window");
  //   }
  // };

  // useEffect(() => {
  //   openNewWindow();
  // }, [])

  const onIframeLoad = () => {
    setLoading(false);
  };

  useEffect(() => {
    if (!isIframeReady || fetchLoading || loading) return;
    if (error || !token) {
      notify.error('fetch token failed for iframe');
      return;
    }
    const tokenMessage: CustomEventData = {
      action: 'token',
      payload: {
        token,
      },
    };
    postMessageToIframe(tokenMessage);
  }, [isIframeReady, loading, token, fetchLoading, error]);

  // useEffect(() => {
  //   if (!isWindowReady || fetchLoading || !newWindow) return;
  //   if (error || !token) {
  //     notify.error('fetch token failed for new window');
  //     return;
  //   }
  //   const tokenMessage: CustomEventData = {
  //     action: 'token',
  //     payload: {
  //       token,
  //     },
  //   };
  //   newWindow.postMessage(tokenMessage, karmadaServiceUrl);
  // }, [isWindowReady, token, fetchLoading, error, newWindow]);

  return (
    <>
      {loading && <Loading className="page-loading" />}
      <iframe
        ref={iframeRef}
        src={karmadaServiceUrl}
        width="100%"
        height="100%"
        style={{
          border: 'none',
          height: 'calc(100vh - 68px)',
          display: loading ? 'none' : 'block',
        }}
        onLoad={onIframeLoad}
      />
    </>
  );
}
