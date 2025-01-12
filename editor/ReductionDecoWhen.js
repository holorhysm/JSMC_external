/** ================================================================
 * JSMC_external - editor/ReductionDecoWhen.js <Script>
 * 指定されたデコレーターのwhen[1]･when[2]を通分します
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
    const resolveRelativePath = (path) => URL.parse(path, urlParamsMap.get("file") ?? "https://cdn.jsdelivr.net/gh/holorhysm/JSMC_external@main/editor/basis.js")?.toString() ?? "";
    const formatDeco = await import(resolveRelativePath("./format.js")).then(module => module.formatDeco);
    const { accumulation, distribution } = await import(resolveRelativePath("./accumulation.js"));
    const Q = await import(resolveRelativePath("./calc_Q.js"));
    /** ======== inputをもとにデコレーターの配列を作る ======== */
    /** @type {Holorhysm_ChartDeco[]} */
    const decos = new Function(`"use strict"; return [${input}]`)();
    /** ======== 分母(when[2])の最小公倍数を求める ======== */
    /** @type {bigint[]} - まず分母を全部取り出す */
    const denominators = [];
    decos.forEach(deco => {
        denominators.push(BigInt(deco.start.when[2]));
        denominators.push(BigInt(deco.end.when[2]));
    });
    /** @type {(a: bigint, b: bigint) => bigint} - 最大公約数を求める関数 */
    const getGCD = (a, b) => a < 0n ? getGCD(-a, b) : b < 0n ? getGCD(a, -b) : b === 0n ? a : a < b ? getGCD(b, a) : getGCD(b, a % b);
    /** @type {(a: bigint, b: bigint) => bigint} - 最小公倍数を求める関数 */
    const getLCM = (a, b) => a * b / getGCD(a, b);
    /** @type {bigint} - denominatorsの最小公倍数を求める */
    const lcm = denominators.reduce((acc, cur) => getLCM(acc, cur), 1n);
    /** ======== 各ノーツに対して通分処理 ======== */
    decos.forEach(deco => {
        // start.when部分
        // 1. 分母を何倍するか求める
        const startRatio = lcm / BigInt(deco.start.when[2]);
        // 2. 分子に↑をかける
        deco.start.when[1] = Number(BigInt(deco.start.when[1]) * startRatio);
        // 3. 分母をlcmにする
        deco.start.when[2] = Number(lcm);
        // end.when部分
        // 1. 分母を何倍するか求める
        const endRatio = lcm / BigInt(deco.end.when[2]);
        // 2. 分子に↑をかける
        deco.end.when[1] = Number(BigInt(deco.end.when[1]) * endRatio);
        // 3. 分母をlcmにする
        deco.end.when[2] = Number(lcm);
    });
    /** ======== ノーツを整形して出力 ======== */
    return decos.map(deco => formatDeco(deco)).join("\n");
})
