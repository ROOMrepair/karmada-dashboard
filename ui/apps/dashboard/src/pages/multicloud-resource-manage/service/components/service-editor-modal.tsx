import i18nInstance from '@/utils/i18n';
import { FC, useEffect, useState } from 'react';
import { Modal } from 'antd';
import Editor from '@monaco-editor/react';
import { parse, stringify } from 'yaml';
import _ from 'lodash';
import { PutResource } from '@/services/unstructured';
import { CreateDeployment } from '@/services/workload';
import { IResponse } from '@/services/base.ts';
export interface NewWorkloadEditorModalProps {
  mode: 'create' | 'edit';
  open: boolean;
  serviceContent?: string;
  onOk: (ret: IResponse<any>) => Promise<void> | void;
  onCancel: () => Promise<void> | void;
}
const ServiceEditorModal: FC<NewWorkloadEditorModalProps> = (props) => {
  const { mode, open, serviceContent = '', onOk, onCancel } = props;
  const [content, setContent] = useState<string>(serviceContent);
  useEffect(() => {
    console.log('workloadContent', serviceContent);
    setContent(serviceContent);
  }, [serviceContent]);
  function handleEditorChange(value: string | undefined) {
    setContent(value || '');
  }
  return (
    <Modal
      title={`${mode === 'create' ? i18nInstance.t('66ab5e9f24c8f46012a25c89919fb191') : i18nInstance.t('95b351c86267f3aedf89520959bce689')}${i18nInstance.t('c3bc562e9ffcae6029db730fe218515c', '工作负载')}`}
      open={open}
      width={1000}
      okText={i18nInstance.t('38cf16f2204ffab8a6e0187070558721')}
      cancelText={i18nInstance.t('625fb26b4b3340f7872b411f401e754c')}
      destroyOnClose={true}
      onOk={async () => {
        // await onOk()
        try {
          const yamlObject = parse(content) as Record<string, string>;
          const kind = _.get(yamlObject, 'kind');
          const namespace = _.get(yamlObject, 'metadata.namespace');
          const name = _.get(yamlObject, 'metadata.name');
          if (mode === 'create') {
            if (kind.toLowerCase() === 'deployment') {
              const ret = await CreateDeployment({
                namespace,
                name,
                content: stringify(yamlObject),
              });
              await onOk(ret);
              setContent('');
            }
          } else {
            const ret = await PutResource({
              kind,
              name,
              namespace,
              content: yamlObject,
            });
            await onOk(ret);
            setContent('');
          }
        } catch (e) {
          console.log('e', e);
        }
      }}
      onCancel={async () => {
        await onCancel();
        setContent('');
      }}
    >
      <Editor
        height="600px"
        defaultLanguage="yaml"
        value={content}
        theme="vs-dark"
        options={{
          theme: 'vs-dark',
          lineNumbers: 'on',
          minimap: {
            enabled: false,
          },
        }}
        onChange={handleEditorChange}
      />
    </Modal>
  );
};
export default ServiceEditorModal;
