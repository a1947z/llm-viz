import { duplicateGrid, splitGrid } from "../Annotations";
import { getBlockValueAtIdx } from "../components/DataFlow";
import { IBlkDef } from "../GptModelLayout";
import { drawText, IFontOpts, measureText } from "../render/fontRender";
import { lerp } from "@/src/utils/math";
import { Mat4f } from "@/src/utils/matrix";
import { Dim, Vec3, Vec4 } from "@/src/utils/vector";
import { Phase } from "./Walkthrough";
import { commentary, DimStyle, IWalkthroughArgs, moveCameraTo, setInitialCamera } from "./WalkthroughTools";
import { processUpTo, startProcessBefore } from "./Walkthrough00_Intro";

export function walkthrough02_Embedding(args: IWalkthroughArgs) {
    let { walkthrough: wt, state, tools: { c_str, c_blockRef, c_dimRef, afterTime, cleanup, breakAfter }, layout } = args;
    let render = state.render;

    if (wt.phase !== Phase.Input_Detail_Embedding) {
        return;
    }

    setInitialCamera(state, new Vec3(15.654, 0.000, -80.905), new Vec3(287.000, 14.500, 3.199));
    wt.dimHighlightBlocks = [layout.idxObj, layout.tokEmbedObj, layout.posEmbedObj, layout.residual0];

    commentary(wt)`
我们之前已经看到，如何通过一个简单的查找表将 tokens 映射为一系列整数。
这些整数，即 ${c_blockRef('_token indices_', state.layout.idxObj, DimStyle.TokenIdx)}，是我们在模型中唯一一次看到整数。
从这里开始，我们将使用浮点数（小数）。

让我们来看看第 4 个 token（索引为 3）是如何用于生成 ${c_blockRef('_input embedding_', state.layout.residual0)} 的第 4 列向量的。
`;
    breakAfter();

    let t_moveCamera = afterTime(null, 1.0);
    let t0_splitEmbedAnim = afterTime(null, 0.3);

    breakAfter();

    commentary(wt)`
我们使用 token 索引（在本例中 ${c_str('B', DimStyle.Token)} = ${c_dimRef('1', DimStyle.TokenIdx)}) 来选择左侧 ${c_blockRef('_token embedding matrix_', state.layout.tokEmbedObj)} 的第 2 列。
请注意，我们这里使用的是从 0 开始的索引，因此第一列的索引为 0。

这会生成一个大小为 ${c_dimRef('_C_ = 48', DimStyle.C)} 的列向量，我们称之为 令牌嵌入层（token embedding）。
    `;
    breakAfter();

    let t1_fadeEmbedAnim = afterTime(null, 0.3);
    let t2_highlightTokenEmbed = afterTime(null, 0.8);

    breakAfter();

    commentary(wt)`
由于我们正在查看第 4 个 _位置_（t = ${c_dimRef('3', DimStyle.T)}) 的 token ${c_str('B', DimStyle.Token)}，我们将从 ${c_blockRef('_position embedding matrix_', state.layout.posEmbedObj)} 中取第 4 列。

这同样会生成一个大小为 ${c_dimRef('_C_ = 48', DimStyle.C)} 的列向量，我们称之为 位置嵌入层（position embedding）。
    `;
    breakAfter();

    let t4_highlightPosEmbed = afterTime(null, 0.8);

    breakAfter();

    commentary(wt)`
请注意，这些位置嵌入层（position embedding） 和 令牌嵌入层（token embedding） 都是在训练过程中学习到的（通过它们的蓝色表示）

_（注：令牌嵌入层（token embedding）
它就像一个神奇的字典翻译官。当你把小说里的每个字、每个词（这些就是 “token”）拿出来时，这个翻译官会把它们转换成计算机能够理解的数字向量。每个词都有属于自己独一无二的 “数字名片”，这样计算机就能通过这些 “名片” 来认识这些词啦。例如，“苹果” 这个词，在 “token embedding” 的转换下，就变成了一串特定的数字组合，计算机看到这串数字，就知道说的是 “苹果”。它的主要任务就是让计算机明白每个词的语义。
位置嵌入层（position embedding）
它是一个超级定位器。在小说里，每个词所处的位置是非常重要的，不同的位置会让句子的意思大不相同。“position embedding” 的作用就是给每个词的位置也生成一个独特的数字向量。比如，“我吃饭” 和 “饭吃我”，虽然词一样，但因为位置不同，意思完全不同。“position embedding” 会给 “我”“吃”“饭” 这几个词的位置分别加上特殊的标记，告诉计算机每个词在句子里的准确位置，这样计算机就能理解句子的正确顺序和含义了。他还能算出一些近义词的关系，就像中文中的对仗，比如“国王”与“皇后”，以及“丈夫”和“妻子”，这两组词在位置嵌入层（position embedding）不同位置上，但是他们的“距离”是差不多的。)_


现在我们有了这两个列向量，我们只需将它们相加，就可以生成另一个大小为 ${c_dimRef('_C_ = 48', DimStyle.C)} 的列向量。
`;

    breakAfter();

    let t3_moveTokenEmbed = afterTime(null, 0.8);
    let t5_movePosEmbed = afterTime(null, 0.8);
    let t6_plusSymAnim = afterTime(null, 0.8);
    let t7_addAnim = afterTime(null, 0.8);
    let t8_placeAnim = afterTime(null, 0.8);
    let t9_cleanupInstant = afterTime(null, 0.0);
    let t10_fadeAnim = afterTime(null, 0.8);

    breakAfter();

    commentary(wt)`
我们现在对输入序列中的所有 tokens 运行相同的过程，生成一组同时包含 token 值和它们位置的向量。

`;

    breakAfter();

    let t11_fillRest = afterTime(null, 5.0);

    breakAfter();

    commentary(wt)`
您可以随意将鼠标悬停在 ${c_blockRef('_input embedding_', state.layout.residual0)} 矩阵的单元格上，查看计算过程及其来源。

我们看到，对输入序列中的所有 tokens 运行此过程会生成一个大小为 ${c_dimRef('_T_', DimStyle.T)} x ${c_dimRef('_C_', DimStyle.C)} 的矩阵。
${c_dimRef('_T_', DimStyle.T)} 代表 ${c_dimRef('_time_', DimStyle.T)}，即您可以将序列中后面的 tokens 视为时间上的后续。
${c_dimRef('_C_', DimStyle.C)} 代表 ${c_dimRef('_channel_', DimStyle.C)}，但也被称为“特征”或“维度”或“embedding 大小”。这个长度 ${c_dimRef('_C_', DimStyle.C)} 是模型的几个“超参数”之一，由设计者在模型大小和性能之间权衡选择。

这个矩阵，我们称之为 ${c_blockRef('_input embedding_', state.layout.residual0)}，现在已经准备好传递到模型中。
这组包含 ${c_dimRef('T', DimStyle.T)} 列、每列长度为 ${c_dimRef('C', DimStyle.C)} 的向量将在本指南中频繁出现。
`;

    cleanup(t9_cleanupInstant, [t3_moveTokenEmbed, t5_movePosEmbed, t6_plusSymAnim, t7_addAnim, t8_placeAnim]);
    cleanup(t10_fadeAnim, [t0_splitEmbedAnim, t1_fadeEmbedAnim, t2_highlightTokenEmbed, t4_highlightPosEmbed]);

    moveCameraTo(state, t_moveCamera, new Vec3(7.6, 0, -33.1), new Vec3(290, 15.5, 0.8));

    let residCol: IBlkDef = null!;
    let exampleIdx = 3;
    if ((t0_splitEmbedAnim.t > 0.0 || t10_fadeAnim.t > 0.0) && t11_fillRest.t === 0) {
        splitGrid(layout, layout.idxObj, Dim.X, exampleIdx + 0.5, t0_splitEmbedAnim.t * 4.0);

        layout.residual0.access!.disable = true;
        layout.residual0.opacity = lerp(1.0, 0.1, t1_fadeEmbedAnim.t);

        residCol = splitGrid(layout, layout.residual0, Dim.X, exampleIdx + 0.5, t0_splitEmbedAnim.t * 4.0)!;
        residCol.highlight = 0.3;

        residCol.opacity = lerp(1.0, 0.0, t1_fadeEmbedAnim.t);

    }

    let tokValue = getBlockValueAtIdx(layout.idxObj, new Vec3(exampleIdx, 0, 0)) ?? 1;


    let tokColDupe: IBlkDef | null = null;
    let posColDupe: IBlkDef | null = null;

    if (t2_highlightTokenEmbed.t > 0.0) {
        let tokEmbedCol = splitGrid(layout, layout.tokEmbedObj, Dim.X, tokValue + 0.5, t2_highlightTokenEmbed.t * 4.0)!;

        tokColDupe = duplicateGrid(layout, tokEmbedCol);
        tokColDupe.t = 'i';
        tokEmbedCol.highlight = 0.3;

        let startPos = new Vec3(tokEmbedCol.x, tokEmbedCol.y, tokEmbedCol.z);
        let targetPos = new Vec3(residCol.x, residCol.y, residCol.z).add(new Vec3(-2.0, 0, 3.0));

        let pos = startPos.lerp(targetPos, t3_moveTokenEmbed.t);

        tokColDupe.x = pos.x;
        tokColDupe.y = pos.y;
        tokColDupe.z = pos.z;
    }


    if (t4_highlightPosEmbed.t > 0.0) {
        let posEmbedCol = splitGrid(layout, layout.posEmbedObj, Dim.X, exampleIdx + 0.5, t4_highlightPosEmbed.t * 4.0)!;

        posColDupe = duplicateGrid(layout, posEmbedCol);
        posColDupe.t = 'i';
        posEmbedCol.highlight = 0.3;

        let startPos = new Vec3(posEmbedCol.x, posEmbedCol.y, posEmbedCol.z);
        let targetPos = new Vec3(residCol.x, residCol.y, residCol.z).add(new Vec3(2.0, 0, 3.0));

        let pos = startPos.lerp(targetPos, t5_movePosEmbed.t);

        posColDupe.x = pos.x;
        posColDupe.y = pos.y;
        posColDupe.z = pos.z;
    }

    if (t6_plusSymAnim.t > 0.0 && tokColDupe && posColDupe && t7_addAnim.t < 1.0) {
        for (let c = 0; c < layout.shape.C; c++) {
            let plusCenter = new Vec3(
                (tokColDupe.x + tokColDupe.dx + posColDupe.x) / 2,
                tokColDupe.y + layout.cell * (c + 0.5),
                tokColDupe.z + tokColDupe.dz / 2);

            let isActive = t6_plusSymAnim.t > (c + 1) / layout.shape.C;
            let opacity = lerp(0.0, 1.0, isActive ? 1 : 0);

            let fontOpts: IFontOpts = { color: new Vec4(0, 0, 0, 1).mul(opacity), size: 1.5, mtx: Mat4f.fromTranslation(plusCenter) };
            let w = measureText(render.modelFontBuf, '+', fontOpts);

            drawText(render.modelFontBuf, '+', -w/2, -fontOpts.size/2, fontOpts);
        }
    }

    let origResidPos = residCol ? new Vec3(residCol.x, residCol.y, residCol.z) : new Vec3();
    let offsetResidPos = origResidPos.add(new Vec3(0.0, 0, 3.0));

    if (t7_addAnim.t > 0.0 && tokColDupe && posColDupe) {
        let targetPos = offsetResidPos;
        let tokStartPos = new Vec3(tokColDupe.x, tokColDupe.y, tokColDupe.z);
        let posStartPos = new Vec3(posColDupe.x, posColDupe.y, posColDupe.z);

        let tokPos = tokStartPos.lerp(targetPos, t7_addAnim.t);
        let posPos = posStartPos.lerp(targetPos, t7_addAnim.t);

        tokColDupe.x = tokPos.x;
        tokColDupe.y = tokPos.y;
        tokColDupe.z = tokPos.z;
        posColDupe.x = posPos.x;
        posColDupe.y = posPos.y;
        posColDupe.z = posPos.z;

        if (t7_addAnim.t > 0.95) {
            tokColDupe.opacity = 0.0;
            posColDupe.opacity = 0.0;
            residCol.opacity = 1.0;
            residCol.highlight = 0.0;
            residCol.access!.disable = false;
            residCol.x = targetPos.x;
            residCol.y = targetPos.y;
            residCol.z = targetPos.z;
        }
    }

    if (t8_placeAnim.t > 0.0) {
        let startPos = offsetResidPos;
        let targetPos = origResidPos;
        let pos = startPos.lerp(targetPos, t8_placeAnim.t);
        residCol.x = pos.x;
        residCol.y = pos.y;
        residCol.z = pos.z;
    }

    if (t9_cleanupInstant.t > 0.0 && residCol) {
        residCol.opacity = 1.0;
        residCol.highlight = 0.0;
        residCol.access!.disable = false;
    }

    if (t11_fillRest.t > 0.0) {
        layout.residual0.access!.disable = true;

        let prevInfo = startProcessBefore(state, layout.residual0);
        processUpTo(state, t11_fillRest, layout.residual0, prevInfo);
    }
    // new Vec3(-6.9, 0, -36.5), new Vec3(281.5, 5.5, 0.8)
}
