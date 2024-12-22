/** ================================================================
 * JSMC_external - editor/OffsetDecos_TimeAxis.js <Script>
 * 時間方向にデコレーターをずらします
 * copyright (c) 2024- Ayasaka-Koto, All rights reserved.
================================================================= */

//@ts-check

/**
 * @typedef {Object} Holorhysm_ChartDeco - 譜面ファイルのうち、1つのデコレーターを表すオブジェクト
 * @property {string|[number, string]} color - デコレーターの色。グラデの場合はCanvasGradient: addColorStop()の引数と同じ形のArrayで指定
 * @property {Holorhysm_ChartDeco_PosInfo} start - 開始位置の情報
 * @property {Holorhysm_ChartDeco_PosInfo} end - 終了位置の情報
 * @property {{left: Holorhysm_ChartDeco_Easing, right: Holorhysm_ChartDeco_Easing}} easing - (左|右)側の接続イージング
 * @property {number} speed - ノーツの単体ソフラン倍率
 */
/**
 * @typedef {string|[number, number, number, number]} Holorhysm_ChartDeco_Easing - イージングの指定方法
 */
/**
 * @typedef {Object} Holorhysm_ChartDeco_PosInfo - 譜面ファイルのうち、1つのデコレーターの配置に関する情報を表すオブジェクト
 * @property {[number, number]} where - デコレーターの[左端, 右端]の位置。-3〜3
 * @property {[number, number, number]} when - デコレーターのタイミング。[小節, 分子, 分母]
 */

(async (input) => {
    /** ======== Module Dynamic Import ======== */
    const urlParamsMap = new Map(new URLSearchParams(window.location.search));
    const resolveRelativePath = (path) => URL.parse(path, urlParamsMap.get("file") ?? "https://cdn.jsdelivr.net/gh/holorhysm/JSMC_external@8e7c162/editor/basis.js")?.toString() ?? "";
    const formatDeco = await import(resolveRelativePath("./format.js")).then(module => module.formatDeco);
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
    /** ======== inputをもとにデコレーターの配列を作る ======== */
    /** @type {Holorhysm_ChartDeco[]} */
    const decos = new Function(`"use strict"; return [${input}]`)();
    /** ======== 各ノーツに対してoffset処理 ======== */
    decos.forEach(deco => {
        /** ---- 各ノーツに decos[].(start|end).acc (1小節目開始位置からの累積拍数)を作る ---- */
        /** @type {[bigint, bigint]} - ノーツが存在する位置の1小節目開始位置からの累積拍数 */
        // @ts-ignore : 本来はないけど一時的に作るので、一旦無視
        deco.start.acc = accumulation(beats, ...deco.start.when);
        // @ts-ignore : 本来はないけど一時的に作るので、一旦無視
        deco.end.acc = accumulation(beats, ...deco.end.when);
        /** ---- 各ノーツに decos[].(start|end).acc_offset (ずらした後の累積拍数)を作る ---- */
        /** @type {[bigint, bigint]} - ノーツが存在する位置の1小節目開始位置からの累積拍数 */
        // @ts-ignore : 本来はないけど一時的に作るので、一旦無視
        deco.start.acc_offset = Q.add(deco.start.acc[0], deco.start.acc[1], BigInt(offset[0]), BigInt(offset[1]));
        // @ts-ignore : 本来はないけど一時的に作るので、一旦無視
        deco.end.acc_offset = Q.add(deco.end.acc[0], deco.end.acc[1], BigInt(offset[0]), BigInt(offset[1]));
        /** ---- 各ノーツの decos[].(start|end).when を、decos[].(start|end).acc_offsetから設定し直す ---- */
        // @ts-ignore : acc_offsetは一時的に作られているので無視
        const [start_bar, start_beatN, start_beatD] = distribution(beats, deco.start.acc_offset);
        deco.start.when = [Number(start_bar), Number(start_beatN), Number(start_beatD)];
        // @ts-ignore : acc_offsetは一時的に作られているので無視
        const [end_bar, end_beatN, end_beatD] = distribution(beats, deco.end.acc_offset);
        deco.end.when = [Number(end_bar), Number(end_beatN), Number(end_beatD)];
        /** ---- 各ノーツの decos[].(start|end).acc と decos[].(start|end).acc_offset を削除 ---- */
        // @ts-ignore : 一時的な変数なので削除
        delete deco.start.acc;
        // @ts-ignore : 一時的な変数なので削除
        delete deco.end.acc;
        // @ts-ignore : 一時的な変数なので削除
        delete deco.start.acc_offset;
        // @ts-ignore : 一時的な変数なので削除
        delete deco.end.acc_offset;
    });
    /** ======== ノーツを整形して出力 ======== */
    return decos.map(deco => formatDeco(deco)).join("\n");
})
