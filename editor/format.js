/**
 * @typedef {Object} Holorhysm_ChartNote - 譜面ファイルのうち、1つのノーツを表すオブジェクト
 * @property {"push"|"hover"|"isolate"} type - ノーツの種類
 * @property {[number, number]} where - ノーツの[左端, 右端]の位置。-3〜3
 * @property {[number, number, number]} when - ノーツのタイミング。[小節, 分子, 分母]
 * @property {number} speed - ノーツの単体ソフラン倍率
 */
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

/**
 * 受け取った文字列の直前に半角スペースを挿入し、指定された文字数に揃えます
 * @param {string} str - 文字数を揃えたい文字列
 * @param {number} length - 文字数
 * @returns {string} - 指定された文字数に揃えられた文字列
 */
const padStart = (str, length) => {
    return str.padStart(length, " ");
}

/**
 * 受け取った数値を小数第2位までで四捨五入して文字列に変換します
 * @param {number} n - 四捨五入する文字列
 * @returns {string} - 小数第2位までで四捨五入された状態の数字
 */
const round_2 = (n) => {
    return n.toFixed(2);
};

/**
 * 受け取った数値を整数に四捨五入して文字列に変換します
 * @param {number} n - 四捨五入する文字列
 * @returns {string} - 整数に四捨五入された状態の数字
 */
const round_z = (n) => {
    return String(Math.round(n));
};

/**
 * ノーツを受け取って整形されたJSON文字列を返します
 * @param {Holorhysm_ChartNote} note - 1つのノーツ
 * @returns {string} - ノーツを表す整形されたJSON文字列
 */
const formatNote = (note) => {
    return `        { "type": ${padStart(`"${note.type}"`, 9)}, "where": [${padStart(round_2(note.where[0]), 5)}, ${padStart(round_2(note.where[1]), 5)}], "when": [${padStart(round_z(note.when[0]), 3)}, ${padStart(round_z(note.when[1]), 3)}, ${padStart(round_z(note.when[2]), 3)}], "speed": ${padStart(round_2(note.speed), 7)}, },`;
};

/**
 * デコレーターのイージング指定を受け取って整形されたJSON文字列を返します
 * @param {Holorhysm_ChartDeco_Easing} easing - イージング指定
 * @returns {string} - イージング指定を表す整形されたJSON文字列
 */
const format_Deco_Easing = (easing) => {
    if (typeof easing === "string") {
        return `"${easing}"`;
    }
    return `[${easing.map((n) => padStart(round_2(n), 5)).join(", ")}]`;
};

/**
 * デコレーターを受け取って整形されたJSON文字列を返します
 * @param {Holorhysm_ChartDeco} deco - 1つのデコレーター
 * @returns {string} - デコレーターを表す整形されたJSON文字列
 */
const formatDeco = (deco) => {
    return `\
        {
            "color": ${JSON.stringify(deco.color)},
            "start": { "where": [${padStart(round_2(deco.start.where[0]), 5)}, ${padStart(round_2(deco.start.where[1]), 5)}], "when": [[${padStart(round_z(deco.start.when[0]), 3)}, ${padStart(round_z(deco.start.when[1]), 3)}, ${padStart(round_z(deco.start.when[2]), 3)}], },
            "end":   { "where": [${padStart(round_2(deco.end.where[0]), 5)}, ${padStart(round_2(deco.end.where[1]), 5)}], "when": [${padStart(round_z(deco.end.when[0]), 3)}, ${padStart(round_z(deco.end.when[1]), 3)}, ${padStart(round_z(deco.end.when[2]), 3)}], },
            "easing": { "left": ${format_Deco_Easing(deco.easing.left)}, "right": ${format_Deco_Easing(deco.easing.right)}, }, "speed": ${padStart(round_2(deco.speed), 7)},
        },`;
};

export { formatNote, formatDeco };
