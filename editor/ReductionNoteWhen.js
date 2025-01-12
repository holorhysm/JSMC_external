/** ================================================================
 * JSMC_external - editor/ReductionNoteWhen.js <Script>
 * 指定されたノーツのwhen[1]･when[2]を通分します
 * copyright (c) 2025- Ayasaka-Koto, All rights reserved.
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
    const resolveRelativePath = (path) => URL.parse(path, urlParamsMap.get("file") ?? "https://cdn.jsdelivr.net/gh/holorhysm/JSMC_external@main/editor/basis.js")?.toString() ?? "";
    const formatNote = await import(resolveRelativePath("./format.js")).then(module => module.formatNote);
    const { accumulation, distribution } = await import(resolveRelativePath("./accumulation.js"));
    const Q = await import(resolveRelativePath("./calc_Q.js"));
    /** ======== inputをもとにノーツの配列を作る ======== */
    /** @type {Holorhysm_ChartNote[]} */
    const notes = new Function(`"use strict"; return [${input}]`)();
    /** ======== 分母(when[2])の最小公倍数を求める ======== */
    /** @type {bigint[]} - まず分母を全部取り出す */
    const denominators = [];
    notes.forEach(note => {
        denominators.push(BigInt(note.when[2]));
    });
    /** @type {(a: bigint, b: bigint) => bigint} - 最大公約数を求める関数 */
    const getGCD = (a, b) => a < 0n ? getGCD(-a, b) : b < 0n ? getGCD(a, -b) : b === 0n ? a : a < b ? getGCD(b, a) : getGCD(b, a % b);
    /** @type {(a: bigint, b: bigint) => bigint} - 最小公倍数を求める関数 */
    const getLCM = (a, b) => a * b / getGCD(a, b);
    /** @type {bigint} - denominatorsの最小公倍数を求める */
    const lcm = denominators.reduce((acc, cur) => getLCM(acc, cur), 1n);
    /** ======== 各ノーツに対してoffset処理 ======== */
    notes.forEach(note => {
        // when部分
        // 1. 分母を何倍するか求める
        const ratio = lcm / BigInt(note.when[2]);
        // 2. 分子に↑をかける
        note.when[1] = Number(BigInt(note.when[1]) * ratio);
        // 3. 分母をlcmにする
        note.when[2] = Number(lcm);
    });
    /** ======== ノーツを整形して出力 ======== */
    return notes.map(note => formatNote(note)).join("\n");
})
