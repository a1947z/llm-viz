import { IWalkthrough, Phase } from "./Walkthrough";
import { Colors, commentary, DimStyle, dimStyleColor, embed, ITimeInfo, IWalkthroughArgs, moveCameraTo, phaseTools, setInitialCamera } from "./WalkthroughTools";
import s from './Walkthrough.module.scss';
import { Dim, Vec3, Vec4 } from "@/src/utils/vector";
import { clamp, makeArray } from "@/src/utils/data";
import React, { useState } from "react";
import { useProgramState } from "../Sidebar";
import { dimProps, findSubBlocks, splitGrid } from "../Annotations";
import { useGlobalDrag } from "@/src/utils/pointer";
import { BlkSpecial, IBlkDef } from "../GptModelLayout";
import { IProgramState } from "../Program";
import { lerp } from "@/src/utils/math";
import { drawDependences } from "../Interaction";
import { drawDataFlow } from "../components/DataFlow";

/*
We're mostly on the right track here I think.

Main things that could do with improvement:

 - Make the camera movement more robust. It should basically be on rails when moving the slider.
 - We store the camera pos at the start of a given movement, and use that as a lerp, and also
   have a default so we can do a reversal

 - Have a highlight-region animation in both the text and the model, to bring attention to a specific
   point. Probably a rectangle with a rotating border. Could also include a shaded background on the text

 - Scroll the text to the next region to read

 - Have more pronounced (& consistent) delays between: camera movement/scroll -> higlight -> action
   - Can probably combine the camera movement and the highlight into a single action, but still have
     a delay between the highlight and the action

 - Generally lean on the new display features more. Might need to add a few more (e.g. animate the dot product)
 - Also probably need to do TeX style layout for maths in the html view :( Could probably reuse the code from the
   3d layout? Just need to get the glyphs in via css/ttf, and then maybe use canvas for positioning? Hmm should
   be able to use divs with abs positioning.

 - For stopping/starting, use t + dt to figure out when it was crossed, rather than storing the lastPauseTime etc

*/

interface IIntroState {

}

function getIntroState(walkthrough: IWalkthrough): IIntroState {
    return walkthrough.phaseData.get(Phase.Intro_Intro) as IIntroState;
}

export function walkthroughIntro(args: IWalkthroughArgs) {
    let { breakAfter, afterTime, c_str } = phaseTools(args.state);
    let { state, layout, walkthrough: wt } = args;

    if (wt.phase !== Phase.Intro_Intro) {
        return;
    }

    setInitialCamera(state, new Vec3(184.744, 0.000, -636.820), new Vec3(296.000, 16.000, 13.500));

    let c0 = commentary(wt, null, 0)`欢迎来到 GPT 大型语言模型的演示！在这里，我们将探索模型 _nano-gpt_，它仅有 85,000 个参数（所谓的参数，便是权重+偏置的数量）。

它的目标很简单：接收一个由六个字母组成的序列：${embed(ExampleInputOutput)}
并将它们按字母顺序排序，即变为 "ABBBCC"。`;

    if (c0.t > 0) {
        for (let cube of layout.cubes) {
            if (cube.t === 'i' && cube.access) {
                cube.access.disable = true;
            }
        }
        state.display.tokenIdxModelOpacity = makeArray(6, 0);
    }

    let t4 = afterTime(null, 1.5, 0.4);

    moveCameraTo(args.state, t4, new Vec3(5.450, 0.000, 7.913), new Vec3(281.500, 12.500, 0.519));
    let t6 = afterTime(null, 1.0, 0.2);

    if (t4.active) {
        state.display.topOutputOpacity = 0.2;
    }

    if (t6.active && t6.t < 1.0) {
        let mixes = [0, 0, 0, 0, 0, 0];
        for (let i = 0; i < 6; i++) {
            // want to smoothly flash each token in turn (t6.t goes from 0-1, and each token should flash at 0.2, 0.4, 0.6, 0.8, 1.0 etc)
            let highT = (i + 1.5) / 8;
            mixes[i] = 1.0 - clamp(Math.abs(t6.t - highT) * 4, 0, 1);
        }
        state.display.tokenColors = { mixes, color2: dimStyleColor(DimStyle.Token) }; //  new Vec4(0.8, 0.2, 0.8) };
    }

    breakAfter();

    let tokenStr = c_str('_token_', 0, DimStyle.Token);
    let tokenIdxStr = c_str('_token index_', 0, DimStyle.TokenIdx);

    commentary(wt, t6)`我们将这些字母中的每一个称为 ${tokenStr}，而模型的不同 ${tokenStr} 的集合构成了它的 _词汇表_（vocabulary）：${embed(TokenVocab)}

    从这个表中，每个 ${tokenStr} 都被分配了一个数字，即它的 ${tokenIdxStr}。现在我们可以将这个数字序列输入到模型中：${embed(ExampleTokenValues)}\n`;
    breakAfter();

    let t7 = afterTime(null, 1.5, 0.5);

    if (t7.active) {
        let opacity = makeArray(6, 0);
        for (let i = 0; i < 6; i++) {
            let highT = (i + 1.5) / 8;
            opacity[i] = clamp((t7.t - highT) * 4, 0, 1);
        }
        state.display.tokenIdxColors = { mixes: opacity, color2: dimStyleColor(DimStyle.TokenIdx) };

        let idxPos = t7.t * 6;

        if (t7.t < 1.0) {
            splitGrid(layout, layout.idxObj, Dim.X, idxPos, clamp(6 - idxPos, 0, 1));
            for (let blk of findSubBlocks(layout.idxObj, Dim.X, null, Math.min(5, Math.floor(idxPos)))) {
                if (blk.access) {
                    blk.access.disable = false;
                }
            }
        } else {
            if (layout.idxObj.access) {
                layout.idxObj.access.disable = false;
            }
        }
    }

    breakAfter();

    let c5 = commentary(wt)`在 3D 视图中，每个绿色单元格代表一个正在处理的数字_（注：即你的输入，根据不同输入每次不同）_，而每个蓝色单元格是一个权重（Weight）_（注：权重是在模型里固定的，即模型训练后，根据训练的数据，训练出来的值。你可以理解权重就像一个可以被雕刻折射率的透镜，在接受多次训练的蚀刻之后，参数的“折射率”就被固定了，当一束新光进来的时候，他就按照固定的折射率将光进行折射）_。${embed(GreenBlueCells)}
    序列中的每个数字首先会被转换为一个包含 48 个元素的向量（这是为这个特定模型选择的大小）。这被称为 _嵌入层_（embedding）。`;
    breakAfter(c5);

    {
        let t_camMove = afterTime(null, 1.0, 0.5);
        let t_makeVecs = afterTime(null, 2.0, 0.5);

        moveCameraTo(state, t_camMove, new Vec3(14.1, 0, -30.4), new Vec3(286, 14.5, 0.8));

        if (t_makeVecs.active) {
            let idxPos = t_makeVecs.t * 6;
            let splitWidth = clamp(6 - idxPos, 0, 2);
            let splitIdx = Math.min(5, Math.floor(idxPos));
            if (t_makeVecs.t < 1.0) {
                splitGrid(layout, layout.idxObj, Dim.X, idxPos, splitWidth);
                for (let blk of findSubBlocks(layout.idxObj, Dim.X, null, splitIdx)) {
                    if (blk.access) {
                        blk.access.disable = false;
                    }
                }

                splitGrid(layout, layout.residual0, Dim.X, idxPos, splitWidth);
                for (let blk of findSubBlocks(layout.residual0, Dim.X, null, splitIdx)) {
                    if (blk.access) {
                        blk.access.disable = false;
                    }
                }
            } else {
                if (layout.residual0.access) {
                    layout.residual0.access.disable = false;
                }
            }
        }
    }

    breakAfter();
    commentary(wt)`嵌入层（embedding）随后会通过模型，经过多层神经网络处理，而每一层神经网络，都用称为transformers的结构机型信息处理_（注：transfomer架构是深度学习中，特别用于大语言模型的架构。但在图像生成等模型中，有另外的架构如扩散Difussion模型。如果按照中文，我们可以将它叫做变换器，但是在大语言模型里面，，我们一般不将transfomer进行特定的翻译，一般用transfomer称呼。单层transfomer的结构后面有详细介绍）_，最终到达底部，这样我们的输入变成了大模型猜想的他要输出的语句中可能出现的那个词的概率。`;
    breakAfter();

    {

        let t_firstResid = afterTime(null, 1.0, 0.5);
        moveCameraTo(state, t_firstResid, new Vec3(-23.160, 0.000, -128.380), new Vec3(292.300, 26.800, 2.400));
        let t_firstResidWalk = afterTime(null, 5.0, 0.5);

        let processState = processUpTo(state, t_firstResidWalk, layout.blocks[0].attnResidual);

        let t_firstTransformer = afterTime(null, 1.0, 0.5);
        moveCameraTo(state, t_firstTransformer, new Vec3(-78.7, 0, -274.2), new Vec3(299.4, 14.7, 4.3));
        let t_firstTransformerWalk = afterTime(null, 3.5, 0.5);
        processUpTo(state, t_firstTransformerWalk, layout.blocks[0].mlpResidual, processState);

        if (t_firstTransformer.active) {
            layout.blocks[0].transformerLabel.visible = t_firstTransformer.t;
        }

        let t_fullFrame = afterTime(null, 1.0, 0.5);
        moveCameraTo(state, t_fullFrame, new Vec3(-147, 0, -744.1), new Vec3(298.5, 23.4, 12.2));
        let t_fullFrameWalk = afterTime(null, 5.0, 0.5);
        processUpTo(state, t_fullFrameWalk, layout.ln_f.lnResid, processState);


        // let t_endFrame = afterTime(null, 1.0, 0.5);
        // moveCameraTo(state, t_endFrame, new Vec3(-18.3, 0, -1576), new Vec3(280.6, 9.7, 1.9));
        // let t_endFrameWalk = afterTime(null, 2.0, 0.5);
        // processUpTo(state, t_endFrameWalk, layout.ln_f.lnResid, processState);

        let t_output = afterTime(null, 1.0, 0.5);
        moveCameraTo(state, t_output, new Vec3(-58.4, 0, -1654.9), new Vec3(271.3, 6.4, 1.1));
        // moveCameraTo(state, t_output, new Vec3(-53.9, 0, -1654.1), new Vec3(270.9, 6.2, 1.1));
        let t_outputWalk = afterTime(null, 2.0, 0.5);
        processUpTo(state, t_outputWalk, layout.logitsSoftmax, processState);

        let t_outputToks = afterTime(null, 1.0, 0.5);

        if (t_firstResid.active) {
            let arr = makeArray(6, 0);

            if (t_outputToks.active) {
                for (let i = 0; i < 6; i++) {
                    let highT = (i + 1.5) / 8;
                    arr[i] = clamp((t_outputToks.t - highT) * 4, 0, 1);
                }
            }

            // state.display.lines.push(arr.map(a => a.toFixed(2).padStart(4)).join(', '));
            state.display.tokenOutputColors = { color1: new Vec4(0,0,0,0), color2: Vec4.fromHexColor('#000', 1), mixes: arr };
        }
    }

    commentary(wt)`那么输出是什么？是序列中下一个 ${tokenStr} 的预测概率。因此，在第 6 个条目处，我们得到的概率是下一个 ${tokenStr} 是 'A'、'B' 或 'C'。`

    commentary(wt)`在这种情况下，模型非常确定下一个 ${tokenStr} 会是 'A'。现在，我们可以将这个预测反馈到模型的顶部，并重复整个过程。`;

    breakAfter();
}

interface IProcessInfo {
    lastBlockIdx: number;
}

export function startProcessBefore(state: IProgramState, block: IBlkDef): IProcessInfo {
    let activeBlocks = state.layout.cubes.filter(a => a.t !== 'w');

    return {
        lastBlockIdx: activeBlocks.indexOf(block) - 1,
    };
}

export function processUpTo(state: IProgramState, timer: ITimeInfo, block: IBlkDef, prevInfo?: IProcessInfo): IProcessInfo {

    let activeBlocks = state.layout.cubes.filter(a => a.t !== 'w');

    let firstIdx = prevInfo ? prevInfo.lastBlockIdx + 1 : 0;
    let lastIdx = activeBlocks.indexOf(block);

    // we weight the time on each block by the number of cells in the block, times by how many dependent cells it has
    // although to make this less extreme, we take a fractional power of this
    let cellCounts = activeBlocks
        .filter((_, i) => i >= firstIdx && i <= lastIdx)
        .map(a => (a.cx * a.cy) * Math.pow(a.deps?.dotLen ?? 1, 0.25));
    let totalCells = cellCounts.reduce((a, b) => a + b, 0);

    let accCell = 0;
    let currIdx = firstIdx;
    let subPos = 0; // 0 -> 1
    for (let i = firstIdx; i <= lastIdx; i++) {
        let blockFract = cellCounts[i - firstIdx] / totalCells;
        accCell += blockFract;
        if (timer.t < accCell) {
            currIdx = i;
            subPos = (timer.t - (accCell - blockFract)) / blockFract;
            break;
        }
    }

    let blk = activeBlocks[currIdx];

    // default, but switched for attention matrix
    let dim0 = Dim.X;
    let dim1 = Dim.Y;
    if (blk.transpose) {
        dim0 = Dim.Y;
        dim1 = Dim.X;
    }

    let { cx } = dimProps(blk, dim0);
    let { cx: cy } = dimProps(blk, dim1);

    let horizPos = lerp(0, cx, subPos);
    let horizIdx = Math.floor(horizPos);

    let vertPos = lerp(0, cy, horizPos - horizIdx);
    let vertIdx = Math.floor(vertPos);

    let blockPos = new Vec3().withSetAt(dim0, horizIdx).withSetAt(dim1, vertIdx); // new Vec3(horizIdx, vertIdx, 0);
    let pinPos = new Vec3(Math.floor(cx / 2), 0, 0);

    if (blk === state.layout.residual0) {
        pinPos = new Vec3(cx * 2, -2, 0);
    }

    if (timer.t >= 1.0) {
        currIdx = lastIdx;
    }

    for (let i = firstIdx; i < currIdx; i++) {
        let blk = activeBlocks[i];
        if (blk.access) {
            blk.access.disable = false;
        }
    }

    if (timer.active && timer.t < 1.0) {
        drawDependences(state, blk, blockPos);
        drawDataFlow(state, blk, blockPos, pinPos);

        for (let label of state.layout.labels) {
            for (let c of label.cubes) {
                if (c === blk) {
                    label.visible = 1.0;
                }
            }
        }

        blk.highlight = 0.3;

        let column = splitGrid(state.layout, blk, dim0, horizPos, 0);
        if (column) {
            for (let col of findSubBlocks(blk, dim0, null, horizIdx)) {
                if (col.access) {
                    col.access.disable = false;
                    col.highlight = 0.1;
                }
            }
            column.highlight = 0.4;

            let curr = splitGrid(state.layout, column, dim1, vertPos, 0);
            for (let blk of findSubBlocks(column, dim1, null, vertIdx)) {
                if (blk.access) {
                    blk.access.disable = false;
                }
            }
            if (curr) {
                curr.highlight = 0.7;
            }
        }


    } else if (timer.active) {
        let blk = activeBlocks[lastIdx];
        if (blk.access) {
            blk.access.disable = false;
        }
    }

    let info = prevInfo ?? { lastBlockIdx: currIdx };
    info.lastBlockIdx = lastIdx;
    return info;
}

const ExampleInputOutput: React.FC = () => {
    let state = useProgramState();
    let cols = state.display.tokenColors;
    let chars = 'CBABBC'.split('');

    return <div className={s.tableWrap}>
        <div>{chars.map((c, i) => {
            let baseColor = dimStyleColor(DimStyle.Token);
            if (cols) {
                baseColor = Vec4.lerp(baseColor, cols.color2, cols.mixes[i]);
            }
            return <span key={i} style={{ color: baseColor.toHexColor() }}>{c} </span>;
        })}</div>
    </div>;
};

const ExampleTokenValues: React.FC = () => {
    let state = useProgramState();
    let cols = state.display.tokenIdxColors;
    let chars = 'CBABBC'.split('');

     return <div className={s.tableWrap}>
        <div>{chars.map((c, i) => {
            let tokIdx = c.charCodeAt(0) - 'A'.charCodeAt(0);

            let baseColor = dimStyleColor(DimStyle.TokenIdx);
            if (cols) {
                baseColor = Vec4.lerp(baseColor, cols.color2, cols.mixes[i]);
            }
            return <span key={i} style={{ color: baseColor.toHexColor() }}>{tokIdx} </span>;
        })}</div>
    </div>;
};

const TokenVocab: React.FC = () => {

    return <div className={s.tableWrap}>
        <table className={s.table}>
            <tbody>
                <tr className={s.tokString} style={{ color: dimStyleColor(DimStyle.Token).toHexColor() }}>
                    <th>token</th><td>A</td><td>B</td><td>C</td>
                </tr>
                <tr className={s.tokIndex} style={{ color: dimStyleColor(DimStyle.TokenIdx).toHexColor() }}>
                    <th>index</th><td>0</td><td>1</td><td>2</td>
                </tr>
            </tbody>
        </table>
    </div>
};

const GreenBlueCells: React.FC = () => {

    let [blueNums, setBlueNums] = useState([-0.7, 0.7, -0.1]);
    let [greenNums, setGreenNums] = useState([-0.7, 0.4, 0.8]);

    let blueColor = new Vec4(0.3, 0.3, 1.0);
    let greenColor = new Vec4(0.3, 0.9, 0.3);

    return <div className={s.tableWrap}>
        <div className={s.cellInfoCols}>
            <div className={s.cellInfoCol}>
                <Cell nums={greenNums} color={greenColor} mul={0.5} />
                <Graph nums={greenNums} color={greenColor} setNums={setGreenNums} />
                <div className={s.cellInfoText}>being processed</div>
            </div>
            <div className={s.cellInfoCol}>
                <Cell nums={blueNums} color={blueColor} mul={1} />
                <Graph nums={blueNums} color={blueColor} setNums={setBlueNums} />
                <div className={s.cellInfoText}>weights</div>
            </div>
        </div>
    </div>
};

const Cell: React.FC<{ nums: number[], color: Vec4, mul?: number }> = ({ color, nums, mul }) => {

    let grey = new Vec4(0.5, 0.5, 0.5, 1.0);
    let cellLight = Vec4.lerp(color, grey, 0.9);
    let cellDark = cellLight.mul(0.98);
    cellDark.w = 1.0;

    let cellColor = (n: number) => {
        let weight = clamp(Math.abs(n), 0.0, 1.0);

        let negColor = new Vec4(0.0, 0.0, 0.0);
        let posColor = color;
        let zeroColor = new Vec4(0.5, 0.5, 0.5);
        if (n < 0.0) {
            return Vec4.lerp(zeroColor, negColor, weight).toHexColor();
        } else {
            return Vec4.lerp(zeroColor, posColor, weight).toHexColor();
        }
    };

    return <div className={s.cellArrayHoriz}>
        {nums.map((n, i) => {
            return <div className={s.cellRect} key={i} style={{ backgroundColor: (i % 2 === 0 ? cellLight : cellDark).toHexColor() }}>
                <div className={s.cellCircle} style={{ backgroundColor: cellColor(n * (mul ?? 1.0)) }} />
            </div>;
        })}
    </div>
};

const Graph: React.FC<{
    nums: number[],
    color: Vec4,
    max?: number,
    setNums?: (nums: number[]) => void,
}> = ({ color, nums, max, setNums }) => {
    let [graphEl, setGraphEl] = useState<HTMLDivElement | null>(null);

    let ticks = [-1, 0, 1];
    let cellW = 30;
    let dispColor = color.mul(1.0);
    dispColor.w = 0.5;

    interface IDragInitial {
        index: number;
        nums: number[];
    }

    let [, setDragStart] = useGlobalDrag<IDragInitial>(function handleMove(ev, ds) {
        let dy = ev.clientY - ds.clientY;
        let h = graphEl!.clientHeight * 0.5;
        let nums = [...ds.data.nums];
        nums[ds.data.index] = clamp(nums[ds.data.index] - dy / h, -1.0, 1.0);
        setNums?.(nums);
        ev.preventDefault();
        ev.stopImmediatePropagation();
    })

    return <div className={s.graph} style={{ width: cellW * nums.length }} ref={setGraphEl}>

        <div className={s.axisLeft} />

        <div className={s.axisZero} />

        {nums.map((n, i) => {
            let nScaled = n / (max ?? 1.0);

            return <div className={s.graphCol} key={i}>
                <div className={s.graphBar} style={{
                    backgroundColor: dispColor.toHexColor(),
                    top: nScaled < 0 ? '50%' : `${(0.5 - nScaled/2) * 100}%`,
                    height: `${(Math.abs(nScaled)/2) * 100}%`,
                }} />
                <div
                    className={s.graphBarHit}
                    onMouseDown={ev => {
                        setDragStart(ev, { index: i, nums });
                        ev.stopPropagation();
                        ev.preventDefault();
                    }}
                    style={{
                        top: `${(0.5 - nScaled/2) * 100}%`
                    }} />
                <div className={s.graphBarLabel} style={{
                     bottom: nScaled < 0 ? '50%' : undefined,
                        top: nScaled > 0 ? '50%' : undefined,
                }}>
                    {n.toFixed(1)}
                </div>
            </div>;
        })}

    </div>;

};
