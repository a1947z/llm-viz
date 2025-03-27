import React from 'react';
import { LayerView } from '@/src/llm/LayerView';
import { InfoButton } from '@/src/llm/WelcomePopup';

export const metadata = {
  title: '大模型内部是什么样子？',
  description: '通过3D方式深入大模型内部的数学原理',
};

import { Header } from '@/src/homepage/Header';

export default function Page() {
    return <>
        <Header title="大模型内部是什么样子？" > 
            <InfoButton />
        </Header>
        <LayerView />
        <div id="portal-container"></div>
    </>;
}
