/** ================================================================
 * JSMC_external - editor/OffsetDecos.js <Script>
 * 左右方向にデコレーターをずらします (1次関数を用いた変換)
 * copyright (c) 2024- Ayasaka-Koto, All rights reserved.
================================================================= */

//@ts-check

(async (input) => {
    /** ======== 傾きと切片の入力から、変換関数を作る ======== */
    /** @type {string?} prompt入力 : 傾き */
    const prompt_slope = prompt("傾きを入力してください。");
    /** @type {string?} prompt入力 : 切片 */
    const prompt_intercept = prompt("切片を入力してください。");
    /** @type {number} 傾き */
    const slope = Number(prompt_slope || "1");
    /** @type {number} 切片 */
    const intercept = Number(prompt_intercept || "0");
    /** @type {(x: number) => number} 変換関数 */
    const convert = x => slope * x + intercept;
    /** ======== inputをもとにデコレーターの配列を作る ======== */
    /** @type {Holorhysm_ChartDeco[]} */
    const decos = new Function(`"use strict"; return [${input}]`)();
    /** ======== デコレーターのstart.where[0], 同[1], end.where[0], 同[1]をそれぞれ変換 ======== */
    decos.forEach(deco => {
        deco.start.where[0] = convert(deco.start.where[0]);
        deco.start.where[1] = convert(deco.start.where[1]);
        deco.end.where[0] = convert(deco.end.where[0]);
        deco.end.where[1] = convert(deco.end.where[1]);
    });
    /** ======== 傾きが負ならwhere[0]と[1]・easing.leftとeasing.rightをそれぞれ入れ替える ======== */
    if (slope < 0) {
        decos.forEach(deco => {
            [deco.start.where[0], deco.start.where[1]] = [deco.start.where[1], deco.start.where[0]];
            [deco.end.where[0], deco.end.where[1]] = [deco.end.where[1], deco.end.where[0]];
            [deco.easing.left, deco.easing.right] = [deco.easing.right, deco.easing.left];
        });
    }
    /** ======== デコレーターを整形して出力 ======== */
    const urlParamsMap = new Map(new URLSearchParams(window.location.search));
    const formatJS_URL = URL.parse("./format.js", urlParamsMap.get("file") ?? "https://cdn.jsdelivr.net/gh/holorhysm/JSMC_external@main/editor/OffsetDecos.js")?.toString() ?? "";
    const formatDeco = await import(formatJS_URL).then(module => module.formatDeco);
    return decos.map(deco => formatDeco(deco)).join("\n");
})
