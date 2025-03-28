import { Vec3 } from "@/src/utils/vector";
import { Phase } from "./Walkthrough";
import { commentary, IWalkthroughArgs, setInitialCamera } from "./WalkthroughTools";

export function walkthrough05_Softmax(args: IWalkthroughArgs) {
    let { walkthrough: wt, state } = args;

    if (wt.phase !== Phase.Input_Detail_Softmax) {
        return;
    }

    setInitialCamera(state, new Vec3(-24.350, 0.000, -1702.195), new Vec3(283.100, 0.600, 1.556));

    let c0 = commentary(wt, null, 0)`

Softmax 操作是自注意力（self-attention）的一部分，正如上一部分所见，它还会出现在模型的最后阶段。

它的目标是将一个向量的值归一化，使它们的总和为 1.0。然而，这并不像简单地除以总和那么简单。相反，每个输入值首先会被取指数：

  a = exp(x_1)

这会使所有值变为正数。一旦我们得到了一个指数化值的向量，我们就可以将每个值除以所有值的总和。这将确保这些值的总和为 1.0。由于所有的指数化值都是正数，我们知道结果值将介于 0.0 和 1.0 之间，从而为原始值提供了一个概率分布。

这就是 softmax 的核心：简单地对值取指数，然后除以总和。

然而，这里有一个小问题。如果输入值中有一些非常大，那么指数化后的值也会非常大。我们最终会将一个大数除以一个非常大的数，这可能会导致浮点运算问题。

Softmax 操作的一个有用性质是，如果我们对所有输入值加上一个常数，结果将保持不变。因此，我们可以找到输入向量中的最大值，并从所有值中减去它。这确保了最大值为 0.0，同时保持 softmax 的数值稳定性。

现在让我们看看 softmax 操作在自注意力层中的应用。对于每次 softmax 操作的输入向量，是自注意力矩阵的一行（但仅限于对角线之前的部分）。

与层归一化（layer normalization）类似，我们有一个中间步骤，用于存储一些聚合值以提高过程效率。

对于每一行，我们存储该行的最大值以及偏移后指数化值的总和。然后，为了生成对应的输出行，我们可以执行一小组操作：减去最大值、取指数、然后除以总和。

为什么叫 "softmax" 呢？这一操作的“硬”版本称为 argmax，它仅找到最大值，将其设置为 1.0，并将所有其他值设置为 0.0。相比之下，softmax 操作是这一过程的“软”版本。由于 softmax 中涉及指数化，最大的值会被强调并趋近于 1.0，同时仍然保持对所有输入值的概率分布。这允许更细腻的表示，不仅捕获最可能的选项，还捕获其他选项的相对可能性。
`;

}
