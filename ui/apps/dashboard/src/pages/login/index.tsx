import i18nInstance from '@/utils/i18n';
import { Alert, Button, Card, Collapse, Input, message } from 'antd';
import styles from './index.module.less';
import { cn } from '@/utils/cn.ts';
import { useEffect, useState } from 'react';
import { Login } from '@/services/auth.ts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth';

type CustomEventData = {
  action: string;
  token?: string;
  payload?: {
    [key: string]: any;
  };
}

const isCustomEventData = (data: any): data is CustomEventData => {
  return typeof data === 'object' && 'action' in data;
};


const LoginPage = () => {
  const [authToken, setAuthToken] = useState('');
  const [isAutoLogin, setIsAutoLogin] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { setToken } = useAuth();

  useEffect(() => {
    
    const handleMessage = (event: MessageEvent) => {
      // todo use valid origin !
      // if (event.origin === "") {
      // }
      // console.log("event origin ", event.origin);
      // console.log("event data", event.data);
      if (!isCustomEventData(event.data)) return;
      // console.log("message ",event.data);
      if (event.data.action === 'token') {
        const { payload } = event.data;
        if (payload && typeof payload === 'object' && typeof payload.token === 'string') {
          const token: string = payload.token;
          setAuthToken(token);
          setIsAutoLogin(true);
          console.log("auto sign");
          // setTimeout(() => {}, 300);
        }
      }
    }

    window.addEventListener('message', handleMessage);

    // console.log("window opener ",window.opener);
    // console.log("window parent ",window.parent);

    if(window.opener){
      (window.opener as Window).postMessage({ action: "windowReady" }, "*");
    }else if(window.parent){
      window.parent.postMessage({ action: "frameReady" }, "*");
    }

    // window.parent.postMessage({action:"ready"},"*");
    return () => {
      window.removeEventListener('message', handleMessage);
    }
  }, [])

  
  useEffect(() => {
    if (isAutoLogin && authToken) {
      console.log("trigger auto sign");
      // buttonRef.current?.click();
      const autoLogin = async () => {
        try {
          const ret = await Login(authToken);
          if (ret.code === 200) {
            await messageApi.success(i18nInstance.t('11427a1edb98cf7efe26ca229d6f2626'));
            setTimeout(() => {
              setToken(authToken);
              navigate('/overview');
            }, 1000);
          } else {
            await messageApi.error(i18nInstance.t('a831066e2d289e126ff7cbf483c3bad1'));
          }
        } catch (e) {
          await messageApi.error(i18nInstance.t('b6076a055fe6cc0473e0d313dc58a049'));
        }
      };

      autoLogin();
    }
  }, [isAutoLogin, authToken])

  return (
    <div className={'h-screen w-screen  bg-[#FAFBFC]'}>
      <div className="h-full w-full flex justify-center items-center ">
        <Card
          className={cn('w-1/2', styles['login-card'])}
          title={
            <div
              className={
                'bg-blue-500 text-white h-[56px] flex items-center px-[16px] text-xl rounded-t-[8px]'
              }
            >
              Karmada-Dashboard
            </div>
          }
        >
          {/*<Alert message="参考文档生成jwt token" type="info"/>*/}
          <Alert
            message={
              <>
                <Collapse
                  bordered={true}
                  size="small"
                  // expandIcon={() => null}
                  // expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                  items={[
                    {
                      key: '1',
                      label: i18nInstance.t('11fa53ed08b11d4753c29bbc8c8fee64'),
                      children: <code>if the token does not load automatically,you can copy from the previous page</code>,
                    },
                  ]}
                />
              </>
            }
            type="info"
          />
          <Input.TextArea
            className={'mt-4'}
            rows={6}
            value={authToken}
            onChange={(v) => {
              // console.log(isAutoLogin);
              if (isAutoLogin) { setIsAutoLogin(false) };
              setAuthToken(v.target.value);
            }}
          />
          <div className={'mt-4'}>
            <Button
              type="primary"
              onClick={async () => {
                try {
                  const ret = await Login(authToken);
                  if (ret.code === 200) {
                    await messageApi.success(
                      i18nInstance.t('11427a1edb98cf7efe26ca229d6f2626'),
                    );
                    setTimeout(() => {
                      setToken(authToken);
                      navigate('/overview');
                    }, 1000);
                  } else {
                    await messageApi.error(
                      i18nInstance.t('a831066e2d289e126ff7cbf483c3bad1'),
                    );
                  }
                } catch (e) {
                  await messageApi.error(
                    i18nInstance.t('b6076a055fe6cc0473e0d313dc58a049'),
                  );
                }
              }}
            >
              {i18nInstance.t('402d19e50fff44c827a4f3b608bd5812')}
            </Button>
          </div>
        </Card>
      </div>
      {contextHolder}
    </div>
  );
};

export default LoginPage;
