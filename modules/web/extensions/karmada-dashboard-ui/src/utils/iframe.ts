import { RefObject, useState, useEffect } from 'react';
import { karmadaServiceUrl } from './constants';

export type CustomEventData = {
  action: string;
  token?: string;
  payload?: {
    [key: string]: any;
  };
};

const isCustomEventData = (data: any): data is CustomEventData => {
  return typeof data === 'object' && 'action' in data;
};

export const useCheckWindows = (iframeRef: RefObject<HTMLIFrameElement | null>) => {
  const [isIframeReady, setIsIfameReady] = useState<boolean>(false);
  const [isWindowReady, setIsWindowReady] = useState<boolean>(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== new URL(karmadaServiceUrl).origin) return;
      if (!isCustomEventData(event.data)) return;

      if (event.data.action === 'frameReady') {
        // console.log('Iframe is ready');
        setIsIfameReady(true);
      } else if (event.data.action === 'windowReady') {
        // console.log('Window is ready');
        setIsWindowReady(true);
      } else if (event.data.action === 'ready') {
        setIsWindowReady(true);
        setIsIfameReady(true);
      } else {
        // console.log("Message from iframe:", event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const postMessageToIframe = (message: CustomEventData) => {
    if (!isIframeReady || !iframeRef.current) {
      console.error('Iframe is not ready yet');
      return;
    }

    iframeRef.current.contentWindow?.postMessage(message, karmadaServiceUrl);
  };

  return { isIframeReady, isWindowReady, postMessageToIframe };
};
