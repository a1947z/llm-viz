import { Vec3 } from "@/src/utils/vector";
import { Phase } from "./Walkthrough";
import { commentary, IWalkthroughArgs, setInitialCamera } from "./WalkthroughTools";

export function walkthrough08_Transformer(args: IWalkthroughArgs) {
    let { walkthrough: wt, state } = args;

    if (wt.phase !== Phase.Input_Detail_Transformer) {
        return;
    }

    setInitialCamera(state, new Vec3(-135.531, 0.000, -353.905), new Vec3(291.100, 13.600, 5.706));

    let c0 = commentary(wt, null, 0)`

这就是一个完整的 Transformer 块！

这些块构成了任何 GPT 模型的主要部分，并被重复多次，一个块的输出会传递到下一个块，继续残差路径（residual pathway）。

正如深度学习中常见的那样，很难确切地说每一层在做什么，但我们有一些通用的理解：较早的层往往专注于学习低级特征和模式，而较晚的层则学习识别和理解高级抽象和关系。在自然语言处理的上下文中，较低的层可能学习语法、句法和简单的词语关联，而较高的层可能捕获更复杂的语义关系、篇章结构和上下文相关的意义。

`;

}
