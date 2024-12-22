/** ================================================================
 * JSMC_external - editor/GenPseudoLong.js <Script>
 * 指定されたデコレーターのうち疑似ロングの条件を満たすものについて、擬似ロングの中間判定ノーツを生成します。
 * copyright (c) 2024- Ayasaka-Koto, All rights reserved.
================================================================= */

//@ts-check

(async (input) => {
    /** ======== Module Dynamic Import ======== */
    const urlParamsMap = new Map(new URLSearchParams(window.location.search));
    const resolveRelativePath = (path) => URL.parse(path, urlParamsMap.get("file") ?? "https://cdn.jsdelivr.net/gh/holorhysm/JSMC_external@8e7c162/editor/basis.js")?.toString() ?? "";
    const formatNote = await import(resolveRelativePath("./format.js")).then(module => module.formatNote);
    const { accumulation, accumulationTime, distribution, getBarsAccTime } = await import(resolveRelativePath("./accumulation.js"));
    const Q = await import(resolveRelativePath("./calc_Q.js"));
    /** ======== 生成したノーツを入れておく配列を作っておく ======== */
    /** @type {Holorhysm_ChartNote[]} */
    const notes = [];
    /** ======== ノーツを整形して出力 ======== */
})
