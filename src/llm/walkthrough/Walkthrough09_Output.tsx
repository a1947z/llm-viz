import { Vec3 } from "@/src/utils/vector";
import { Phase } from "./Walkthrough";
import { commentary, IWalkthroughArgs, setInitialCamera } from "./WalkthroughTools";

export function walkthrough09_Output(args: IWalkthroughArgs) {
    let { walkthrough: wt, state } = args;

    if (wt.phase !== Phase.Input_Detail_Output) {
        return;
    }

    setInitialCamera(state, new Vec3(-20.203, 0.000, -1642.819), new Vec3(281.600, -7.900, 2.298));

    let c0 = commentary(wt, null, 0)`

最后，我们来到了模型的末尾。最终 Transformer 块的输出会经过一次层归一化（layer normalization），
然后我们使用一个线性变换（矩阵乘法），这次没有偏置。

在模型的最后一步中，经过最终的线性变换（矩阵乘法），每个列向量的长度从 C（通常是模型的隐藏层维度或特征数）变为 nvocab（词汇表的大小）。

_（注：这里C 是 Transformer 模型中每个列向量的初始长度，表示隐藏层的特征维度。nvocab 是词汇表的大小，表示模型可以预测的所有可能的 token（单词或字符）的数量。这个变换的作用是将隐藏层的特征向量映射到词汇表的维度空间中，从而为词汇表中的每个 token 生成一个分数（logit）。这些分数表示模型对每个 token 的预测信心，随后会通过 softmax 转换为概率分布，用于选择下一个 token。）_最终结果实际实际上为词汇表中的每个单词生成了一个分数。这些分数有一个特殊的名称：logits。

"Logits" 这个名字来源于 "log-odds"，即每个 token 的对数几率（logarithm of the odds）。之所以使用 "log"，
是因为我们接下来应用的 softmax 操作会通过指数化将其转换为几率或概率。

为了将这些分数转换为概率，我们将它们通过一个 softmax 操作。现在，对于每一列，模型为词汇表中的每个单词分配了一个概率。

在这个特定的模型中，它已经有效地学习到了如何对三个字母进行排序的问题的所有答案，因此概率会高度偏向于正确答案。

当我们让模型随时间步进时，我们使用最后一列的概率来确定要添加到序列中的下一个 token。例如，如果我们向模型提供了六个 token，
我们将使用第 6 列的输出概率。

这一列的输出是一系列概率，我们实际上需要从中选择一个作为序列中的下一个 token。我们通过“从分布中采样”来完成此操作。
也就是说，我们根据概率随机选择一个 token。例如，概率为 0.9 的 token 将有 90% 的几率被选中。

然而，这里还有其他选项，例如总是选择概率最高的 token。

我们还可以通过使用一个温度参数（temperature）来控制分布的“平滑度”。较高的温度会使分布更均匀，
而较低的温度会使分布更集中于概率最高的 token。

我们通过在应用 softmax 之前将 logits（线性变换的输出）除以温度来实现这一点。由于 softmax 中的指数化对较大的数值有很大的影响，
使它们更接近会减少这种影响。
`;

}
