import React from 'react';
import { Phase } from "./Walkthrough";
import { commentary, embed, IWalkthroughArgs, setInitialCamera } from "./WalkthroughTools";
import s from './Walkthrough.module.scss';
import { Vec3 } from '@/src/utils/vector';

let minGptLink = 'https://github.com/karpathy/minGPT';
let pytorchLink = 'https://pytorch.org/';
let andrejLink = 'https://karpathy.ai/';
let zeroToHeroLink = 'https://karpathy.ai/zero-to-hero.html';

export function walkthrough01_Prelim(args: IWalkthroughArgs) {
    let { state, walkthrough: wt } = args;

    if (wt.phase !== Phase.Intro_Prelim) {
        return;
    }

    setInitialCamera(state, new Vec3(184.744, 0.000, -636.820), new Vec3(296.000, 16.000, 13.500));

    let c0 = commentary(wt, null, 0)`
在深入了解算法的复杂性之前，让我们先简单回顾一下背景。

本指南专注于推理（inference），而非训练（Training），因此它只是整个机器学习过程的一小部分。_（注：训练会改变参数的值，但是推理使用的是训练好的固定参数，参数的值在推理过程中，不会变化。我们一般说使用模型，如使用DeepSeek，就是一个使用模型推理的过程，在这背后，模型的参数已经固定了。）_
在我们的案例中，模型的权重已经经过预训练，我们使用推理过程来生成输出。这一过程直接在您的浏览器中运行。

这里展示的模型属于 GPT（生成式预训练Transformer，generative pre-trained transformer）家族，可以被描述为一个“基于上下文的 token 预测器”。
OpenAI 于 2018 年推出了这一家族，其中的著名成员包括 GPT-2、GPT-3 和 GPT-3.5 Turbo，后者是广泛使用的 ChatGPT 的基础。
它可能也与 GPT-4 有关，但具体细节尚不清楚_(注：因为GPT-4开始 OpenAI采取了闭源策略，而DeepSeek则采取了开源策略。)_。

本指南的灵感来源于 ${embedLink('minGPT', minGptLink)} GitHub 项目，这是一个使用 ${embedLink('PyTorch', pytorchLink)} 实现的最小 GPT 模型，
由 ${embedLink('Andrej Karpathy', andrejLink)} 创建。
他的视频系列 ${embedLink("Neural Networks: Zero to Hero", zeroToHeroLink)} (《神经网络：从0开始成为英雄》系列视频)和 minGPT 项目在本指南的创建过程中提供了宝贵的资源。
这里展示的玩具模型nano-gpt是基于minGPT项目启发创建的一个更易于展示的模型。

好了，让我们开始吧！
`;

}

export function embedLink(a: React.ReactNode, href: string) {
    return embedInline(<a className={s.externalLink} href={href} target="_blank" rel="noopener noreferrer">{a}</a>);
}

export function embedInline(a: React.ReactNode) {
    return { insertInline: a };
}


// Another similar model is BERT (bidirectional encoder representations from transformers), a "context-aware text encoder" commonly
// used for tasks like document classification and search.  Newer models like Facebook's LLaMA (large language model architecture), continue to use
// a similar transformer architecture, albeit with some minor differences.
