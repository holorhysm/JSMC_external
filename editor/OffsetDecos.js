/** ================================================================
 * JSMC_external
 * copyright (c) 2024- Ayasaka-Koto, All rights reserved.
================================================================= */
let a = +prompt("傾き", -1), b = +prompt("切片", 0), p = (s, d) => s.padStart(d), x = (n, t, d) => p(n.toFixed(t), d), o = Function(`return ${input}`)(); o.some(n => { n.start.where = n.start.where.map(v => v * a + b).sort((a, b) => a - b); n.end.where = n.end.where.map(v => v * a + b).sort((a, b) => a - b) }); return `[\n` + o.map(n => `\
        {
${p("", 12)}"color" : ${JSON.stringify(n.color).replace(/,/g, ", ")},
${p("", 12)}"start" : { "where": [${x(n.start.where[0], 2, 5)},  ${x(n.start.where[1], 2, 5)}], "when": [${x(n.start.when[0], 0, 3)}, ${x(n.start.when[1], 0, 2)}, ${x(n.start.when[2], 0, 2)}], },
${p("", 12)}"end"   : { "where": [${x(n.end.where[0], 2, 5)},  ${x(n.end.where[1], 2, 5)}], "when": [${x(n.end.when[0], 0, 3)}, ${x(n.end.when[1], 0, 2)}, ${x(n.end.when[2], 0, 2)}], },
${p("", 12)}"easing": { "left": "${n.easing.right}", "right": "${n.easing.left}", }, "speed": ${x(n.speed, 2, 1)},
        },
`).join("") + `\n]`;
