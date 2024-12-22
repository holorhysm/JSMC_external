/** ================================================================
 * JSMC_external - editor/GenPseudoLong.js <Script>
 * 指定されたデコレーターのうち疑似ロングの条件を満たすものについて、擬似ロングの中間判定ノーツを生成します。
 * copyright (c) 2024- Ayasaka-Koto, All rights reserved.
================================================================= */

//@ts-check

(async (input) => {
    /** ======== Module Dynamic Import ======== */
    const urlParamsMap = new Map(new URLSearchParams(window.location.search));
    const resolveRelativePath = (path) => URL.parse(path, urlParamsMap.get("file") ?? "https://cdn.jsdelivr.net/gh/holorhysm/JSMC_external@243f2ac/editor/basis.js")?.toString() ?? "";
    const formatNote = await import(resolveRelativePath("./format.js")).then(module => module.formatNote);
    const { accumulation, accumulationTime, distribution, getBarsAccTime } = await import(resolveRelativePath("./accumulation.js"));
    // @ts-ignore : 無視
    const Easing = await import("https://cdn.jsdelivr.net/gh/AXT-AyaKoto/easing.js@v0.1.0/script.js");
    const Q = await import(resolveRelativePath("./calc_Q.js"));
    /** ======== 生成したノーツを入れておく配列を作っておく ======== */
    /** @type {Holorhysm_ChartNote[]} */
    const notes = [];
    /** ======== 譜面のbeats・bpm入力値を受け取ってbeatsFn・bpmFnを作る ======== */
    /** @type {string?} prompt入力 : beats */
    const prompt_beats = prompt("beatsを入力してください。", "[4, 4]") || "[4, 4]";
    /** @type {(x: number) => [number, number]} beats */
    // @ts-ignore : どうせなるので無視 1
    const beatsFn = new Function("x", `"use strict"; return (${prompt_beats});`);
    /** @type {string?} prompt入力 : bpm */
    const prompt_bpm = prompt("bpmを入力してください。", "120") || "120";
    /** @type {(x: number) => number} bpm */
    // @ts-ignore : どうせなるので無視 2
    const bpmFn = new Function("x", `"use strict"; return (${prompt_bpm});`);
    /** ======== 疑似ロングの生成間隔を訪ねておく ======== */
    /** @type {string?} prompt入力 : 生成間隔 (何拍ごとにするか、で聞く) */
    const prompt_interval = prompt("疑似ロングの生成間隔を入力してください。(1拍ごとなら「1」、0.5拍ごとなら「1/2」のように入力)", "1/4") || "1/4";
    /** @type {[bigint, bigint]} 生成間隔([分子, 分母]) */
    // @ts-ignore : どうせなるので無視 3
    const interval = `${prompt_interval}/1`.split("/").map(x => BigInt(+x)).slice(0, 2);
    /** ======== inputをもとにデコレーターの配列を作る ======== */
    /** @type {Holorhysm_ChartDeco[]} */
    const decos = new Function(`"use strict"; return [${input}]`)();
    /** ======== 各デコレーターに対してoffset処理 ======== */
    decos.forEach(deco => {
        /** 左右のイージング指定は先に取得しておく */
        const detectedEasings = {
            "left": deco.easing.left,
            "right": deco.easing.right
        };
        /** 開始位置と終了位置の累積拍数を先に求めておく */
        /** @type {[bigint, bigint]} */
        const startAcc = accumulation(beatsFn, ...deco.start.when);
        /** @type {[bigint, bigint]} */
        const endAcc = accumulation(beatsFn, ...deco.end.when);
        /** 開始位置と終了位置の秒数も先に求めておく */
        /** @type {[bigint, bigint]} */
        const startAccTime = accumulationTime(beatsFn, bpmFn, deco.start.when[0], deco.start.when[1], deco.start.when[2]);
        /** @type {[bigint, bigint]} */
        const endAccTime = accumulationTime(beatsFn, bpmFn, deco.end.when[0], deco.end.when[1], deco.end.when[2]);
        /** 疑似ロングの生成間隔でループ */
        let nowAcc = startAcc; // 開始位置からスタート
        while (true) {
            /** ステップを進める */
            nowAcc = Q.add(nowAcc[0], nowAcc[1], interval[0], interval[1]);
            /** 終了位置を超えたら終了 */
            if (Q.ge(nowAcc[0], nowAcc[1], endAcc[0], endAcc[1])) break;
            /** 現在位置の時間を求める */
            const nowAccTime = accumulationTime(beatsFn, bpmFn, distribution(beatsFn, nowAcc));
            /** 現在位置が開始位置〜終了位置に対してどの程度の割合の位置にあるかを計算 */
            const lengthTime = Q.sub(endAccTime[0], endAccTime[1], startAccTime[0], startAccTime[1]);
            const nowLengthTime = Q.sub(nowAccTime[0], nowAccTime[1], startAccTime[0], startAccTime[1]);
            const ratio = Q.div(nowLengthTime[0], nowLengthTime[1], lengthTime[0], lengthTime[1]);
            const ratioNum = Q.toNumber(ratio[0], ratio[1]);
            /** ノーツを生成 */
            const noteLeftPos = Easing.convert(ratioNum, detectedEasings.left);
            const noteRightPos = Easing.convert(ratioNum, detectedEasings.right);
            const note = formatNote({
                "type": "hover",
                "where": [noteLeftPos, noteRightPos],
                "when": distribution(beatsFn, nowAcc),
                "speed": -1000,
                "hidden": true,
            });
            notes.push(note);
        }
    });
    /** ======== 重複ノーツは同じ文字列になってるので吹き飛ばす ======== */
    const uniqueNotes = Array.from(new Set(notes));
    /** ======== ノーツを整形して出力 ======== */
    return uniqueNotes.join("\n");
})
