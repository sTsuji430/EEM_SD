// =========================================================
// main_38.js
// 38回離散マトリックスPD課題タイムライン & init
// =========================================================

const base = [16, 12, 8, 4];

const dilemmaPairs = [
    [{ c: 10, m: 2 }, { c: 10, m: 2 }], [{ c: 10, m: 3 }, { c: 10, m: 3 }],
    [{ c: 15, m: 2 }, { c: 15, m: 2 }], [{ c: 15, m: 3 }, { c: 15, m: 3 }],
    [{ c: 10, m: 3 }, { c: 10, m: 2 }], [{ c: 10, m: 2 }, { c: 10, m: 3 }]
];

const hgPairs = [
    [{ c: 15, m: 3 }, { c: 15, m: 3 }]
];

function createPayoffMatrix(gameType, pSelf, pOther) {
    const vals1 = base.map(v => (v + pSelf.c) * pSelf.m);
    const vals2 = base.map(v => (v + pOther.c) * pOther.m);

    let p1 = {}, p2 = {};
    if (gameType === 'PD') {
        p1 = { T: vals1[0], R: vals1[1], P: vals1[2], S: vals1[3] };
        p2 = { T: vals2[0], R: vals2[1], P: vals2[2], S: vals2[3] };
    } else if (gameType === 'SH') {
        p1 = { R: vals1[0], T: vals1[1], P: vals1[2], S: vals1[3] };
        p2 = { R: vals2[0], T: vals2[1], P: vals2[2], S: vals2[3] };
    } else if (gameType === 'CH') {
        p1 = { T: vals1[0], R: vals1[1], S: vals1[2], P: vals1[3] };
        p2 = { T: vals2[0], R: vals2[1], S: vals2[2], P: vals2[3] };
    } else if (gameType === 'HG') {
        p1 = { R: vals1[0], T: vals1[1], S: vals1[2], P: vals1[3] };
        p2 = { R: vals2[0], T: vals2[1], S: vals2[2], P: vals2[3] };
    }
    return { p1, p2 };
}

function generateMatrixHTML(game, m_self, m_other, swap_lr = false, hl_col = null, hl_row = null) {
    const p = createPayoffMatrix(game, m_self, m_other);

    function makeCell(valSelf, valOther) {
        return `
            <div style="display: flex; justify-content: space-evenly; align-items: center; width: 100%; height: 100%;">
                <div style="text-align: center;">
                    <div style="font-size: 20px; font-weight: normal; color: #555; margin-bottom: 5px; line-height: 1;">あなた</div>
                    <div style="color: #000; line-height: 1;">${valSelf}<span style="font-size: 24px; font-weight: normal; margin-left: 2px;">pt</span></div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 20px; font-weight: normal; color: #555; margin-bottom: 5px; line-height: 1;">Bさん</div>
                    <div style="color: #000; line-height: 1;">${valOther}<span style="font-size: 24px; font-weight: normal; margin-left: 2px;">pt</span></div>
                </div>
            </div>
        `;
    }

    let cell_CC = makeCell(p.p1.R, p.p2.R);
    let cell_CD = makeCell(p.p1.T, p.p2.S);
    let cell_DC = makeCell(p.p1.S, p.p2.T);
    let cell_DD = makeCell(p.p1.P, p.p2.P);

    let col1_row1 = cell_CC, col2_row1 = cell_CD;
    let col1_row2 = cell_DC, col2_row2 = cell_DD;

    if (swap_lr) {
        col1_row1 = cell_CD; col2_row1 = cell_CC;
        col1_row2 = cell_DD; col2_row2 = cell_DC;
    }

    const c_f = hl_col === 'f' ? 'highlight-col' : '';
    const c_j = hl_col === 'j' ? 'highlight-col' : '';

    const r_1 = hl_row === 1 ? 'highlight-row' : '';
    const r_2 = hl_row === 2 ? 'highlight-row' : '';

    return `
    <div class="centered-matrix-wrapper">
      <table class="payoff-matrix">
        <tr>
          <th class="${c_f} top-header">あなたの選択<br><span class="key-label">[ F ] キー</span></th>
          <th class="${c_j} top-header">あなたの選択<br><span class="key-label">[ J ] キー</span></th>
        </tr>
        <tr class="${r_1}">
          <td class="${c_f} ${r_1}">
            <div class="row-label">Bさんの選択<br>パターン1</div>
            ${col1_row1}
          </td>
          <td class="${c_j} ${r_1}">${col2_row1}</td>
        </tr>
        <tr class="${r_2}">
          <td class="${c_f} ${r_2}">
            <div class="row-label">Bさんの選択<br>パターン2</div>
            ${col1_row2}
          </td>
          <td class="${c_j} ${r_2}">${col2_row2}</td>
        </tr>
      </table>
    </div>
    `;
}

// ---------------------------------------------------------
// 教示 1: ルール説明（事後マッチングと報酬に関する3ページ: main.js完全踏襲）
// ---------------------------------------------------------
const intro_pages = [
    `
        <div class="instructions">
            <h1 style="color: #0056b3; font-size: 32px; text-align: center; border-bottom: 3px solid #0056b3; padding-bottom: 15px; margin-bottom: 30px;">ここから【課題3】が始まります</h1>
            <p style="font-size: 20px; line-height: 1.6; font-weight: bold; margin-bottom: 20px;">今から行う課題では、この調査に参加している誰かと2人組になって課題を行います。ただし、リアルタイムに2人組で課題を行うわけではありません。</p>
            <p style="font-size: 20px; margin-bottom: 20px;">この調査には、約300名の参加者がいます。<br>参加者全員から回答を回収した後、<strong>あなたの回答と別の参加者をランダムにマッチングし、みなさんが実際に回答した選択に基づいて、この課題の報酬額を決定します。</strong></p>
            <div style="text-align: center; margin: 20px 0;">
                <img src="${repo_site}image/post_match.png" style="max-width: 60%; max-height: 35vh; width: auto; height: auto;">
            </div>
        </div>
    `,
    `
        <div class="instructions">
            <h1 style="color: #0056b3; font-size: 32px; text-align: center; border-bottom: 3px solid #0056b3; padding-bottom: 15px; margin-bottom: 30px;">報酬の決定について</h1>
            <p style="font-size: 20px; line-height: 1.6; margin-bottom: 20px;">このゲーム課題では、2人1組で意思決定を計38回行います（説明は後述）。<br>そのうちの1回の回答が選ばれて、あなたの回答とマッチングした参加者の回答を組み合わせて、報酬額を決定します。</p>
            <p style="color: #dc3545; font-weight: bold; padding: 10px; border: 2px solid #dc3545; border-radius: 8px; background: #fff;">
                【重要】このゲーム課題で決定する追加報酬は、この課題で獲得するポイント（1ポイント＝10円）の計算のもと算出されます。
            </p>
            <p>後日、報酬をお支払いする方（0円より上の方）には、クラウドワークスを通じて個別タスクに参加すること（作業内容はありません）で、追加報酬を受け取ることができます。</p>
        </div>
    `,
    `
        <div class="instructions">
            <h1 style="color: #0056b3; font-size: 32px; text-align: center; border-bottom: 3px solid #0056b3; padding-bottom: 15px; margin-bottom: 30px;">ご注意</h1>
            <p style="font-size: 20px; line-height: 1.6; margin-bottom: 20px;">なお、ペアとなる相手は完全に匿名であり、実験中に「相手が何を選んだか」「最終的なポイントはいくつか」といった結果は画面上には提示されません。</p>
            <p style="color: #dc3545; font-weight: bold; font-size: 22px; padding: 15px; border: 3px solid #dc3545; border-radius: 8px; background: #fff3f3; margin: 30px 0;">
                あなたの選択が、あなた自身の報酬額にも、マッチングした参加者の報酬額にも影響します。<br>実際に他の人とリアルタイムにゲームしているつもりでお答えください。
            </p>
        </div>
    `
];

intro_pages.forEach(page => {
    timeline.push({
        type: 'html-button-response',
        button_html: custom_btn_html,
        choices: ['次へ進む'],
        stimulus: page,
        on_start: function () {
            document.body.classList.remove('hide-cursor');
        }
    });
});

// ---------------------------------------------------------
// 教示 2: 利得表の事前説明
// ---------------------------------------------------------
const sd_btn_style = '<style>#jspsych-html-button-response-btngroup { position: relative !important; margin-top: 30px !important; text-align: center !important; width: 100% !important; z-index: 999 !important; }</style>';

const instructions_pages = [
    `
        ${sd_btn_style}
        <div class="instructions-top">
            <h2 style="border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; font-size: 28px;">ポイントの表の見方 (1/5)</h2>
            <p style="margin-bottom:10px;">実験中は以下のような「ポイントの表」が提示されます。表には4パターンの結果が存在し、<b>あなたの選択によってBさんのポイントが変わり、Bさんの選択によってあなたのポイントが変わります</b>。</p>
        </div>
        ${generateMatrixHTML('PD', { c: 7, m: 3 }, { c: 7, m: 3 }, false, null, null)}
        <div class="instructions-bottom">
            <div style="background: #e9ecef; padding: 15px; border-radius: 8px;">
                <p style="margin: 0; font-size:20px;">お互いの選択が交差したマスの中にある「あなた」の下の数字があなたのポイント、「Bさん」の下の数字がBさんのポイントになります。<br>次のページから、具体的な見方を説明します。</p>
            </div>
        </div>
    `,
    `
        ${sd_btn_style}
        <div class="instructions-top">
            <h2 style="border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; font-size: 28px;">ポイントの表の見方：Bさんが「パターン1」を選んだ場合 (2/5)</h2>
        </div>
        ${generateMatrixHTML('PD', { c: 7, m: 3 }, { c: 7, m: 3 }, false, null, 1)}
        <div class="instructions-bottom">
            <div style="background: #e9ecef; padding: 15px; border-radius: 8px;">
                <p style="margin-top: 0; font-size:20px;">Bさんが上の行である「パターン1」を選んだ場合（<span style="background-color:#ffe8d6; padding:0 5px;">オレンジ色</span>の行）、あなたが選ぶキーによってポイントが以下のように決まります。</p>
                <ul style="margin-bottom: 0; font-size:20px; padding-left: 30px;">
                    <li>あなたが <b>[ F ] キー</b> を選べば：あなたは 57pt、Bさんは 57pt を獲得。</li>
                    <li>あなたが <b>[ J ] キー</b> を選べば：あなたは 69pt、Bさんは 33pt を獲得。</li>
                </ul>
            </div>
        </div>
    `,
    `
        ${sd_btn_style}
        <div class="instructions-top">
            <h2 style="border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; font-size: 28px;">ポイントの表の見方：Bさんが「パターン2」を選んだ場合 (3/5)</h2>
        </div>
        ${generateMatrixHTML('PD', { c: 7, m: 3 }, { c: 7, m: 3 }, false, null, 2)}
        <div class="instructions-bottom">
            <div style="background: #e9ecef; padding: 15px; border-radius: 8px;">
                <p style="margin-top: 0; font-size:20px;">Bさんが下の行である「パターン2」を選んだ場合も同様です。</p>
                <ul style="margin-bottom: 0; font-size:20px; padding-left: 30px;">
                    <li>あなたが <b>[ F ] キー</b> を選べば：あなたは 33pt、Bさんは 69pt を獲得。</li>
                    <li>あなたが <b>[ J ] キー</b> を選べば：あなたは 45pt、Bさんは 45pt を獲得。</li>
                </ul>
            </div>
        </div>
    `,
    `
        ${sd_btn_style}
        <div class="instructions-top">
            <h2 style="border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; font-size: 28px;">ポイントの表の見方：あなたが [ F ] キー を選んだ場合 (4/5)</h2>
        </div>
        ${generateMatrixHTML('PD', { c: 7, m: 3 }, { c: 7, m: 3 }, false, 'f', null)}
        <div class="instructions-bottom">
            <div style="background: #e9ecef; padding: 15px; border-radius: 8px;">
                <p style="margin-top: 0; font-size:20px;">逆に、あなたが左の列である <b>[ F ] キー</b> を選んだ場合（<span style="background-color:#e7f1ff; padding:0 5px;">青色</span>の列）、Bさんの選択によってポイントが以下のように決まります。</p>
                <ul style="margin-bottom: 0; font-size:20px; padding-left: 30px;">
                    <li>Bさんが「パターン1」を選んでいれば：あなたは 57pt、Bさんは 57pt を獲得。</li>
                    <li>Bさんが「パターン2」を選んでいれば：あなたは 33pt、Bさんは 69pt を獲得。</li>
                </ul>
            </div>
        </div>
    `,
    `
        ${sd_btn_style}
        <div class="instructions-top">
            <h2 style="border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; font-size: 28px;">ポイントの表の見方：あなたが [ J ] キー を選んだ場合 (5/5)</h2>
        </div>
        ${generateMatrixHTML('PD', { c: 7, m: 3 }, { c: 7, m: 3 }, false, 'j', null)}
        <div class="instructions-bottom">
            <div style="background: #e9ecef; padding: 15px; border-radius: 8px;">
                <p style="margin-top: 0; font-size:20px;">あなたが右の列である <b>[ J ] キー</b> を選んだ場合も同様です。</p>
                <ul style="margin-bottom: 0; font-size:20px; padding-left: 30px;">
                    <li>Bさんが「パターン1」を選んでいれば：あなたは 69pt、Bさんは 33pt を獲得。</li>
                    <li>Bさんが「パターン2」を選んでいれば：あなたは 45pt、Bさんは 45pt を獲得。</li>
                </ul>
            </div>
        </div>
    `
];

instructions_pages.forEach(page => {
    timeline.push({
        type: 'html-button-response',
        button_html: custom_btn_html,
        choices: ['次へ進む'],
        stimulus: page
    });
});

// クイズ開始前の遷移画面
timeline.push({
    type: 'html-button-response',
    button_html: custom_btn_html,
    choices: ['準備ができたらクイズを開始する'],
    stimulus: `
        <div class="instructions">
            <h1 style="color: #0056b3; font-size: 32px; text-align: center; border-bottom: 3px solid #0056b3; padding-bottom: 15px; margin-bottom: 30px;">これより理解度クイズを行います</h1>
            <p style="font-size: 20px; line-height: 1.6; margin-bottom: 20px;">ここまでの説明の内容について、簡単なクイズを2問出題します。</p>
            <p style="color: #dc3545; font-weight: bold; font-size: 24px; padding: 25px; border: 3px solid #dc3545; border-radius: 8px; background: #fff3f3; margin: 30px 0;">
                【重要】<br>クイズに繰り返し不正解となった場合、ルールを十分に理解されていないとみなされ、課題を最後まで完了しても報酬をお支払いできない場合がございますのでご注意ください。
            </p>
        </div>
    `
});

// 4. クイズ 1 (最大2回までループ)
let quiz1_attempts = 0;
const quiz1 = {
    type: 'html-button-response',
    button_html: custom_btn_html,
    stimulus: `
        ${sd_btn_style}
        <div class="instructions-top">
            <h2>確認クイズ (1/2)</h2>
            <p>以下のポイントの表において、<b>あなたが「F」キーを選び、Bさんが「パターン2」を選んだ場合</b>、結果はどうなるでしょうか？<br>正しい組み合わせを下のボタンから選んでください。</p>
        </div>
        ${generateMatrixHTML('PD', { c: 7, m: 3 }, { c: 7, m: 3 }, false, null, null)}
    `,
    choices: ['あなた： 33 pt, Bさん： 69 pt', 'あなた： 69 pt, Bさん： 33 pt'],
    data: { is_quiz: true, task: 'sd_quiz1' },
    on_finish: function () {
        quiz1_attempts++;
    }
};

const quiz1_feedback = {
    type: 'html-button-response',
    button_html: custom_btn_html,
    stimulus: function () {
        const last_resp = jsPsych.data.get().last(1).values()[0].response;
        if (parseInt(last_resp, 10) === 0) { // 0 is correct
            return `
                <div class="instructions">
                    <h2 style="color: #28a745;">正解です！</h2>
                    <p>あなたが「F」、Bさんが「パターン2」を選んだ場合、結果は<b>「あなた： 33 pt, Bさん： 69 pt」</b>となります。</p>
                </div>
            `;
        } else {
            if (quiz1_attempts >= 2) {
                return `
                <div class="instructions">
                    <h2 style="color: #dc3545;">不正解です</h2>
                    <p>※正解は<b>「あなた： 33 pt, Bさん： 69 pt」</b>です。</p>
                    <p>これ以上の繰り返しはせず、次のクイズへ進みます。</p>
                </div>
                `;
            } else {
                return `
                <div class="instructions">
                    <h2 style="color: #dc3545;">不正解です</h2>
                    <p>※正解は<b>「あなた： 33 pt, Bさん： 69 pt」</b>です。</p>
                    <p>もう一度選択してください。</p>
                </div>
                `;
            }
        }
    },
    choices: ['次へ進む'],
};

timeline.push({
    timeline: [quiz1, quiz1_feedback],
    loop_function: function (data) {
        const resp = data.values()[0].response;
        if (parseInt(resp, 10) === 0) return false;
        if (quiz1_attempts >= 2) return false;
        return true;
    }
});

// 5. クイズ 2 (最大2回までループ)
let quiz2_attempts = 0;
const quiz2 = {
    type: 'html-button-response',
    button_html: custom_btn_html,
    stimulus: `
        ${sd_btn_style}
        <div class="instructions-top">
            <h2>確認クイズ (2/2)</h2>
            <p>以下のポイントの表において、<b>あなたが「J」キーを選び、Bさんが「パターン1」を選んだ場合</b>、結果はどうなるでしょうか？<br>正しい組み合わせを下のボタンから選んでください。</p>
        </div>
        ${generateMatrixHTML('PD', { c: 7, m: 3 }, { c: 7, m: 3 }, false, null, null)}
    `,
    choices: ['あなた： 33 pt, Bさん： 69 pt', 'あなた： 69 pt, Bさん： 33 pt'],
    data: { is_quiz: true, task: 'sd_quiz2' },
    on_finish: function () {
        quiz2_attempts++;
    }
};

const quiz2_feedback = {
    type: 'html-button-response',
    button_html: custom_btn_html,
    stimulus: function () {
        const last_resp = jsPsych.data.get().last(1).values()[0].response;
        if (parseInt(last_resp, 10) === 1) { // 1 is correct
            return `
                <div class="instructions">
                    <h2 style="color: #28a745;">正解です！</h2>
                    <p>あなたが「J」、Bさんが「パターン1」を選んだ場合、結果は<b>「あなた： 69 pt, Bさん： 33 pt」</b>となります。</p>
                </div>
            `;
        } else {
            if (quiz2_attempts >= 2) {
                return `
                <div class="instructions">
                    <h2 style="color: #dc3545;">不正解です</h2>
                    <p>※正解は<b>「あなた： 69 pt, Bさん： 33 pt」</b>です。</p>
                    <p>これ以上の繰り返しはせず、次の課題へ進みます。</p>
                </div>
                `;
            } else {
                return `
                <div class="instructions">
                    <h2 style="color: #dc3545;">不正解です</h2>
                    <p>※正解は<b>「あなた： 69 pt, Bさん： 33 pt」</b>です。</p>
                    <p>もう一度選択してください。</p>
                </div>
                `;
            }
        }
    },
    choices: ['次へ進む'],
};

timeline.push({
    timeline: [quiz2, quiz2_feedback],
    loop_function: function (data) {
        const resp = data.values()[0].response;
        if (parseInt(resp, 10) === 1) return false;
        if (quiz2_attempts >= 2) return false;
        return true;
    }
});

// 6. ここからマウスカーソルを非表示にする
timeline.push({
    type: 'call-function',
    func: function () {
        document.body.classList.add('hide-cursor');
    }
});

// 38試行データ構築
const games = ['PD', 'SH', 'CH'];
let inner_sd_trials = [];

games.forEach(g => {
    dilemmaPairs.forEach(p => {
        inner_sd_trials.push({ game: g, mult_self: p[0], mult_other: p[1], swap_lr: false });
        inner_sd_trials.push({ game: g, mult_self: p[0], mult_other: p[1], swap_lr: true });
    });
});

let hg_trials = [
    { game: 'HG', mult_self: hgPairs[0][0], mult_other: hgPairs[0][1], swap_lr: false },
    { game: 'HG', mult_self: hgPairs[0][0], mult_other: hgPairs[0][1], swap_lr: true }
];

const first_trial = inner_sd_trials.shift();
const last_trial_item = { ...first_trial, swap_lr: !first_trial.swap_lr };

const fixedSeedShuffleOrder = [
    12, 4, 23, 8, 31, 15, 2, 27, 19, 10,
    33, 6, 21, 14, 29, 1, 18, 25, 9, 34,
    3, 16, 28, 11, 22, 5, 30, 17, 0, 32,
    7, 24, 13, 26
];

const remaining_sd_trials = inner_sd_trials.concat(hg_trials);
let shuffled_middle = fixedSeedShuffleOrder.map(i => remaining_sd_trials[i]);

let all_sd_trials = [first_trial, ...shuffled_middle, last_trial_item];

const practice_trials = [
    { game: 'PD', mult_self: { c: 10, m: 2 }, mult_other: { c: 10, m: 2 }, swap_lr: false },
    { game: 'SH', mult_self: { c: 15, m: 1 }, mult_other: { c: 15, m: 1 }, swap_lr: true },
    { game: 'CH', mult_self: { c: 10, m: 3 }, mult_other: { c: 10, m: 2 }, swap_lr: false }
];

const matrix_trial = {
    type: 'html-keyboard-response',
    stimulus: function () {
        return '<p style="margin-bottom: 20px; font-size: 28px; font-weight: bold; text-align: center;">どの選択肢を選びますか？<br><span style="font-size: 20px; font-weight: normal; color: #555;">（左なら F キー、右なら J キーを押してください）</span></p>' +
            generateMatrixHTML(
                jsPsych.timelineVariable('game', true),
                jsPsych.timelineVariable('mult_self', true),
                jsPsych.timelineVariable('mult_other', true),
                jsPsych.timelineVariable('swap_lr', true),
                null, null
            );
    },
    choices: ['f', 'j'],
    trial_duration: 30000,
    data: {
        task: 'response',
        game: jsPsych.timelineVariable('game'),
        swap_lr: jsPsych.timelineVariable('swap_lr')
    },
    on_start: function () {
        document.body.classList.add('hide-cursor');
    }
};

const timeout_trial = {
    type: 'html-keyboard-response',
    stimulus: `
        <div class="instructions">
            <h2 style="color: #dc3545;">制限時間切れ</h2>
            <p style="font-size: 20px; line-height: 1.6;">時間内に選択が確認できませんでした。</p>
            <p style="font-size: 20px; line-height: 1.6;">一定時間経過したため、<br>自動的に次の試行へ進みます。</p>
        </div>
    `,
    choices: jsPsych.NO_KEYS,
    trial_duration: 2500,
    data: { task: 'timeout' }
};

const if_timeout = {
    timeline: [timeout_trial],
    conditional_function: function () {
        const last_trial = jsPsych.data.get().last(1).values()[0];
        return last_trial.response === null;
    }
};

const highlight_trial = {
    type: 'html-keyboard-response',
    stimulus: function () {
        const last_trial = jsPsych.data.get().last(2).filter({ task: 'response' }).values()[0];
        const choice = last_trial.response;
        const matrixHTML = generateMatrixHTML(
            jsPsych.timelineVariable('game', true),
            jsPsych.timelineVariable('mult_self', true),
            jsPsych.timelineVariable('mult_other', true),
            jsPsych.timelineVariable('swap_lr', true),
            choice, null
        );
        return '<p style="margin-bottom: 20px; font-size: 28px; font-weight: bold; text-align: center; visibility: hidden;">どの選択肢を選びますか？<br><span style="font-size: 20px; font-weight: normal; color: #555;">（左なら F キー、右なら J キーを押してください）</span></p>' + matrixHTML;
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
    data: { task: 'highlight' }
};

const if_not_timeout = {
    timeline: [highlight_trial, post_highlight_blank],
    conditional_function: function () {
        const last_trial = jsPsych.data.get().last(1).values()[0];
        if (last_trial.task === 'timeout') return false;
        if (last_trial.task === 'response' && last_trial.response !== null) return true;
        return false;
    }
};

// 練習試行
timeline.push({
    type: 'html-keyboard-response',
    stimulus: `
        <div class="instructions">
            <h2>練習試行</h2>
            <div style="text-align: center; margin: 20px 0;">
                <img src="${repo_site}image/key_instruction.png" style="max-width: 40%; max-height: 25vh; width: auto; height: auto;">
            </div>
            <p style="color: #007bff; font-weight: bold; font-size: 24px; padding: 15px; border: 3px solid #007bff; border-radius: 8px; background: #e7f1ff; margin: 30px 0;">
                【重要】これ以降はマウスを使用しません。<br>すべてキーボード（Fキー、Jキー）のみで操作を行います。
            </p>
            <p>ポイントの表が表示されたら、あなたの選択だと思う列のキー（<b>[ F ] キー</b> または <b>[ J ] キー</b>）をキーボードで押してください。</p>

            <p style="margin-top:40px; font-weight: bold;">準備ができたら、キーボードの「スペースキー」を押して開始してください。</p>
        </div>
    `,
    choices: [' '],
    on_start: function () {
        document.body.classList.add('hide-cursor');
    }
});

const practice_vars = practice_trials.map(t => ({ ...t, block_type: 'practice' }));
timeline.push({
    timeline: [sd_fixation, blank, matrix_trial, if_timeout, if_not_timeout],
    timeline_variables: practice_vars,
    randomize_order: false
});

// 本番試行
timeline.push({
    type: 'html-keyboard-response',
    stimulus: `
        <div class="instructions">
            <h2>本番試行</h2>
            <p>これより本番を開始します。</p>
            <p>各試行で、あなたの選択だと思う列のキー（<b>[ F ]</b> または <b>[ J ]</b>）を押してください。</p>
            <p style="color: #0056b3; font-weight: bold; margin-top: 15px;">なお、本番の途中に休憩が2回あります。</p>

            <p style="margin-top:40px; font-weight: bold;">スペースキーを押して開始してください。</p>
        </div>
    `,
    choices: [' ']
});

let sd_block1 = all_sd_trials.slice(0, 13);
let sd_block2 = all_sd_trials.slice(13, 26);
let sd_block3 = all_sd_trials.slice(26, 38);

const sd_break = {
    type: 'html-keyboard-response',
    stimulus: `
        <div class="instructions">
            <h2>休憩</h2>
            <p>ここで少し休憩をとってください。</p>
            <p style="margin-top: 40px; font-weight: bold; color: #d9534f;">準備ができたらスペースキーを押して、課題を再開してください。</p>
        </div>
    `,
    choices: [' ']
};

timeline.push({
    timeline: [sd_fixation, blank, matrix_trial, if_timeout, if_not_timeout],
    timeline_variables: sd_block1
});
timeline.push(sd_break);
timeline.push({
    timeline: [sd_fixation, blank, matrix_trial, if_timeout, if_not_timeout],
    timeline_variables: sd_block2
});
timeline.push(sd_break);
timeline.push({
    timeline: [sd_fixation, blank, matrix_trial, if_timeout, if_not_timeout],
    timeline_variables: sd_block3
});

timeline.push({
    type: 'call-function',
    func: function () {
        document.body.classList.remove('hide-cursor');
    }
});

timeline.push({
    type: 'html-keyboard-response',
    stimulus: `
        <div class="instructions">
            <h2>実験終了</h2>
            <p>実験はこれで終了です。ご協力ありがとうございました。</p>
            <p style="margin-top:40px; font-weight: bold;">スペースキーを押してデータを保存してください。</p>
        </div>
    `,
    choices: [' ']
});

timeline.push({
    type: 'fullscreen',
    fullscreen_mode: false
});

// jsPsych初期化と起動
jsPsych.init({
    timeline: timeline,
    override_safe_mode: true,
    on_finish: function () {
        finishExperiment('Repeated_38');
    }
});
