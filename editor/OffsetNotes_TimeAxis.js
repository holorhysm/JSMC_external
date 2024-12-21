/** ================================================================
 * JSMC_external - editor/OffsetNotes_TimeAxis.js <Script>
 * 時間方向にノーツをずらします
 * copyright (c) 2024- Ayasaka-Koto, All rights reserved.
================================================================= */

//@ts-check

/**
 * @typedef {Object} Holorhysm_ChartNote - 譜面ファイルのうち、1つのノーツを表すオブジェクト
 * @property {"push"|"hover"|"isolate"} type - ノーツの種類
 * @property {[number, number]} where - ノーツの[左端, 右端]の位置。-3〜3
 * @property {[number, number, number]} when - ノーツのタイミング。[小節, 分子, 分母]
 * @property {number} speed - ノーツの単体ソフラン倍率
 */

(async (input) => {
    /** ======== Module Dynamic Import ======== */
    const urlParamsMap = new Map(new URLSearchParams(window.location.search));
    const resolveRelativePath = (path) => URL.parse(path, urlParamsMap.get("file") ?? "https://cdn.jsdelivr.net/gh/holorhysm/JSMC_external@8e7c162/editor/basis.js")?.toString() ?? "";
    const formatNote = await import(resolveRelativePath("./format.js")).then(module => module.formatNote);
    const { accumulation, distribution } = await import(resolveRelativePath("./accumulation.js"));
    const Q = await import(resolveRelativePath("./calc_Q.js"));
    /** ======== 譜面のbeats入力値を受け取ってbeatsFnを作る ======== */
    /** @type {string?} prompt入力 : beats */
    const prompt_beats = prompt("beatsを入力してください。", "[4, 4]") || "[4, 4]";
    /** @type {(x: number) => [number, number]} beats */
    // @ts-ignore : どうせなるので無視 1
    const beats = new Function("x", `"use strict"; return (${prompt_beats});`);
    /** ======== ずらす拍数を受け取る ======== */
    /** @type {string?} prompt入力 : ずらす拍数 (整数ならn、分数ならn/m) */
    const prompt_offset = prompt("何拍ずらす？(整数なら「4」、分数なら「1/2」のように入力)", "0");
    /** @type {[number, number]} ずらす拍数([分子, 分母]) */
    // @ts-ignore : どうせなるので無視 2
    const offset = `${prompt_offset}/1`.split("/").map(x => Number(x)).slice(0, 2);
    /** ======== inputをもとにノーツの配列を作る ======== */
    /** @type {Holorhysm_ChartNote[]} */
    const notes = new Function(`"use strict"; return [${input}]`)();
    /** ======== 各ノーツに対してoffset処理 ======== */
    notes.forEach(note => {
        /** ---- 各ノーツに notes[].acc (1小節目開始位置からの累積拍数)を作る ---- */
        /** @type {[bigint, bigint]} - ノーツが存在する位置の1小節目開始位置からの累積拍数 */
        // @ts-ignore : 本来はないけど一時的に作るので、一旦無視
        note.acc = accumulation(beats, ...note.when);
        /** ---- 各ノーツに notes[].acc_offset (ずらした後の累積拍数)を作る ---- */
        /** @type {[bigint, bigint]} - ノーツが存在する位置の1小節目開始位置からの累積拍数 */
        // @ts-ignore : 本来はないけど一時的に作るので、一旦無視
        note.acc_offset = Q.add(note.acc[0], note.acc[1], BigInt(offset[0]), BigInt(offset[1]));
        /** ---- 各ノーツの notes[].when を、notes[].acc_offsetから設定し直す ---- */
        // @ts-ignore : acc_offsetは一時的に作られているので無視
        const [bar, beatN, beatD] = distribution(beats, note.acc_offset);
        note.when = [Number(bar), Number(beatN), Number(beatD)];
        /** ---- 各ノーツの notes[].acc と notes[].acc_offset を削除 ---- */
        // @ts-ignore : 一時的な変数なので削除
        delete note.acc;
        // @ts-ignore : 一時的な変数なので削除
        delete note.acc_offset;
    });
    /** ======== ノーツを整形して出力 ======== */
    return notes.map(note => formatNote(note)).join("\n");
})
