// main.js



// 1. ベースとなる配列 (v1 > v2 > v3 > v4)
const base = [8, 6, 4, 2];

// 2. 倍率ペアの定義
const dilemmaPairs = [
    [1, 1], [10, 10], // 対称
    [4, 3], [3, 2], [2, 1], [3, 1], [5, 1], [10, 1], // 非対称・有利
    [3, 4], [2, 3], [1, 2], [1, 3], [1, 5], [1, 10]  // 非対称・不利
];

const hgPairs = [
    [1, 1], [10, 10], [10, 1], [1, 10]
];

function createPayoffMatrix(gameType, mult1, mult2) {
    const vals1 = base.map(v => v * mult1);
    const vals2 = base.map(v => v * mult2);
    
    let p1 = {}, p2 = {};
    if (gameType === 'PD') {
        p1 = {T: vals1[0], R: vals1[1], P: vals1[2], S: vals1[3]};
        p2 = {T: vals2[0], R: vals2[1], P: vals2[2], S: vals2[3]};
    } else if (gameType === 'SH') {
        p1 = {R: vals1[0], T: vals1[1], P: vals1[2], S: vals1[3]};
        p2 = {R: vals2[0], T: vals2[1], P: vals2[2], S: vals2[3]};
    } else if (gameType === 'CH') {
        p1 = {T: vals1[0], R: vals1[1], S: vals1[2], P: vals1[3]};
        p2 = {T: vals2[0], R: vals2[1], S: vals2[2], P: vals2[3]};
    } else if (gameType === 'HG') {
        p1 = {R: vals1[0], T: vals1[1], S: vals1[2], P: vals1[3]};
        p2 = {R: vals2[0], T: vals2[1], S: vals2[2], P: vals2[3]};
    }
    return {p1, p2};
}

// 動的HTML生成（「あなた」「相手」のラベル付きで黒字の数字を描画）
function generateMatrixHTML(game, m_self, m_other, hl_col = null, hl_row = null) {
    const p = createPayoffMatrix(game, m_self, m_other);
    
    function makeCell(valSelf, valOther) {
        return `
            <div style="display: flex; justify-content: space-evenly; align-items: center; width: 100%; height: 100%;">
                <div style="text-align: center;">
                    <div style="font-size: 20px; font-weight: normal; color: #555; margin-bottom: 5px; line-height: 1;">あなた</div>
                    <div style="color: #000; line-height: 1;">${valSelf}<span style="font-size: 24px; font-weight: normal; margin-left: 2px;">pt</span></div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 20px; font-weight: normal; color: #555; margin-bottom: 5px; line-height: 1;">相手</div>
                    <div style="color: #000; line-height: 1;">${valOther}<span style="font-size: 24px; font-weight: normal; margin-left: 2px;">pt</span></div>
                </div>
            </div>
        `;
    }

    const cell_CC = makeCell(p.p1.R, p.p2.R);
    const cell_CD = makeCell(p.p1.T, p.p2.S);
    const cell_DC = makeCell(p.p1.S, p.p2.T);
    const cell_DD = makeCell(p.p1.P, p.p2.P);

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
            <div class="row-label">相手の選択<br>パターン1</div>
            ${cell_CC}
          </td>
          <td class="${c_j} ${r_1}">${cell_CD}</td>
        </tr>
        <tr class="${r_2}">
          <td class="${c_f} ${r_2}">
            <div class="row-label">相手の選択<br>パターン2</div>
            ${cell_DC}
          </td>
          <td class="${c_j} ${r_2}">${cell_DD}</td>
        </tr>
      </table>
    </div>
    `;
}

// ---------------------------------------------------------
// 試行データの生成
// ---------------------------------------------------------
let main_trials = [];
const gameTypes = ['PD', 'SH', 'CH'];

gameTypes.forEach(gt => {
    dilemmaPairs.forEach(pair => {
        main_trials.push({
            game: gt,
            mult_self: pair[0],
            mult_other: pair[1]
        });
    });
});

hgPairs.forEach(pair => {
    main_trials.push({
        game: 'HG',
        mult_self: pair[0],
        mult_other: pair[1]
    });
});

const practice_trials = [
    {game: 'PD', mult_self: 10, mult_other: 10},
    {game: 'SH', mult_self: 10, mult_other: 1},
    {game: 'CH', mult_self: 1, mult_other: 10}
];

// ---------------------------------------------------------
// jsPsych タイムラインの構築
// ---------------------------------------------------------
var timeline = []; // varに変更してQualtricsからアクセスしやすくする
window.experiment_timeline = timeline; // 明示的にグローバルにエクスポート

// jsPsychのボタンクリックを遅延させ、アニメーションを最後まで見せるカスタムボタンHTML
const custom_btn_html = `<div class="jspsych-btn custom-btn" onclick="var el=this; el.classList.add('pressed'); setTimeout(function(){ el.nextElementSibling.click(); }, 500)">%choice%</div><button style="display:none;" class="jspsych-btn">%choice%</button>`;

// 1. フルスクリーン
timeline.push({
    type: 'fullscreen',
    fullscreen_mode: true,
    message: '<div style="text-align:left; max-width:800px; margin:0 auto;"><p style="font-size: 24px;">実験を始めます。ボタンをクリックしてフルスクリーンモードにしてください。</p></div>',
    button_label: 'フルスクリーンで開始'
});

// 2. 教示 1: ルール説明
timeline.push({
    type: 'html-button-response',
    button_html: custom_btn_html,
    choices: ['理解できたら次へ進む'],
    stimulus: `
        <div class="instructions">
            <h2>実験の説明</h2>
            <p>この実験では、あなたと「他の誰か（相手）」による意思決定ゲームを複数回行います。</p>
            <p>画面には、あなたと相手の選択に応じて、それぞれの「獲得ポイント」が変化する表が表示されます。</p>
            <p>表には4パターンの結果が存在し、<b>あなたの選択によって相手のポイントが変わり、相手の選択によってあなたのポイントが変わります</b>。</p>
            <p style="color: #dc3545; font-weight: bold; padding: 10px; border: 2px solid #dc3545; border-radius: 8px; background: #fff;">
                【重要】実験で獲得した最終的なポイントに応じて、参加報酬とは別に追加のボーナス報酬が実際に支払われます。
            </p>
            <p>相手は、実験終了後に特定の1人にランダムにマッチングされます。</p>
            <p>他のプレイヤーは完全にランダムで匿名であり、これ以降の関わりはありません。</p>
            <p>なお、実験中に「相手が何を選んだか」「最終的なポイントはいくつか」といった結果のフィードバックは提示されません。</p>
        </div>
    `
});

// 3. 教示 2: 利得表の事前説明（ハイライト連動の5ページ）
const instructions_pages = [
    `
        <div class="instructions-top">
            <h2 style="border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; font-size: 28px;">ポイントの表の見方 (1/5)</h2>
            <p style="margin-bottom:10px;">実験中は以下のような「ポイントの表」が提示されます。あなたのポイントと相手のポイントは、お互いの選択の組み合わせによって決定されます。</p>
        </div>
        ${generateMatrixHTML('PD', 1, 1, null, null)}
        <div class="instructions-bottom">
            <div style="background: #e9ecef; padding: 15px; border-radius: 8px;">
                <p style="margin: 0; font-size:20px;">お互いの選択が交差したマスの中にある「あなた」の下の数字があなたのポイント、「相手」の下の数字が相手のポイントになります。<br>次のページから、具体的な見方を説明します。</p>
            </div>
        </div>
    `,
    `
        <div class="instructions-top">
            <h2 style="border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; font-size: 28px;">ポイントの表の見方：相手が「パターン1」を選んだ場合 (2/5)</h2>
        </div>
        ${generateMatrixHTML('PD', 1, 1, null, 1)}
        <div class="instructions-bottom">
            <div style="background: #e9ecef; padding: 15px; border-radius: 8px;">
                <p style="margin-top: 0; font-size:20px;">相手が上の行である「パターン1」を選んだ場合（<span style="background-color:#ffe8d6; padding:0 5px;">オレンジ色</span>の行）、あなたが選ぶキーによってポイントが以下のように決まります。</p>
                <ul style="margin-bottom: 0; font-size:20px;">
                    <li>あなたが <b>[ F ] キー</b> を選べば：あなたは 8pt、相手は 8pt を獲得。</li>
                    <li>あなたが <b>[ J ] キー</b> を選べば：あなたは 10pt、相手は 2pt を獲得。</li>
                </ul>
            </div>
        </div>
    `,
    `
        <div class="instructions-top">
            <h2 style="border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; font-size: 28px;">ポイントの表の見方：相手が「パターン2」を選んだ場合 (3/5)</h2>
        </div>
        ${generateMatrixHTML('PD', 1, 1, null, 2)}
        <div class="instructions-bottom">
            <div style="background: #e9ecef; padding: 15px; border-radius: 8px;">
                <p style="margin-top: 0; font-size:20px;">相手が下の行である「パターン2」を選んだ場合も同様です。</p>
                <ul style="margin-bottom: 0; font-size:20px;">
                    <li>あなたが <b>[ F ] キー</b> を選べば：あなたは 2pt、相手は 10pt を獲得。</li>
                    <li>あなたが <b>[ J ] キー</b> を選べば：あなたは 4pt、相手は 4pt を獲得。</li>
                </ul>
            </div>
        </div>
    `,
    `
        <div class="instructions-top">
            <h2 style="border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; font-size: 28px;">ポイントの表の見方：あなたが [ F ] キー を選んだ場合 (4/5)</h2>
        </div>
        ${generateMatrixHTML('PD', 1, 1, 'f', null)}
        <div class="instructions-bottom">
            <div style="background: #e9ecef; padding: 15px; border-radius: 8px;">
                <p style="margin-top: 0; font-size:20px;">逆に、あなたが左の列である <b>[ F ] キー</b> を選んだ場合（<span style="background-color:#e7f1ff; padding:0 5px;">青色</span>の列）、相手の選択によってポイントが以下のように決まります。</p>
                <ul style="margin-bottom: 0; font-size:20px;">
                    <li>相手が「パターン1」を選んでいれば：あなたは 8pt、相手は 8pt を獲得。</li>
                    <li>相手が「パターン2」を選んでいれば：あなたは 2pt、相手は 10pt を獲得。</li>
                </ul>
            </div>
        </div>
    `,
    `
        <div class="instructions-top">
            <h2 style="border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; font-size: 28px;">ポイントの表の見方：あなたが [ J ] キー を選んだ場合 (5/5)</h2>
        </div>
        ${generateMatrixHTML('PD', 1, 1, 'j', null)}
        <div class="instructions-bottom">
            <div style="background: #e9ecef; padding: 15px; border-radius: 8px;">
                <p style="margin-top: 0; font-size:20px;">あなたが右の列である <b>[ J ] キー</b> を選んだ場合も同様です。</p>
                <ul style="margin-bottom: 0; font-size:20px;">
                    <li>相手が「パターン1」を選んでいれば：あなたは 10pt、相手は 2pt を獲得。</li>
                    <li>相手が「パターン2」を選んでいれば：あなたは 4pt、相手は 4pt を獲得。</li>
                </ul>
            </div>
        </div>
    `
];

instructions_pages.forEach(page => {
    timeline.push({
        type: 'html-button-response',
        button_html: custom_btn_html,
        choices: ['理解できたら次へ進む'],
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
            <h2>これより理解度クイズを行います</h2>
            <p>ここまでの説明の内容について、簡単なクイズを2問出題します。</p>
        </div>
    `
});

// 4. クイズ 1 (最大2回までループ)
let quiz1_attempts = 0;
const quiz1 = {
    type: 'html-button-response',
    button_html: custom_btn_html,
    stimulus: `
        <div class="instructions-top">
            <h2>理解度クイズ (1/2)</h2>
            <p>以下のポイントの表において、<b>「あなたのポイント」</b>はマスの中の数字のうち、どちらでしょうか？<br>正しいと思う方のボタンをマウスでクリックしてください。</p>
        </div>
        ${generateMatrixHTML('PD', 1, 1, null, null)}
    `,
    choices: ['左側の「あなた」の下の数字', '右側の「相手」の下の数字'],
    data: { is_quiz: true },
    on_finish: function() {
        quiz1_attempts++;
    }
};

const quiz1_feedback = {
    type: 'html-button-response',
    button_html: custom_btn_html,
    stimulus: function() {
        const last_resp = jsPsych.data.get().last(1).values()[0].response;
        if(parseInt(last_resp, 10) === 0) { // 0: 左側
            return `
                <div class="instructions">
                    <h2 style="color: #28a745;">正解です！</h2>
                    <p>あなたのポイントは<b>「左側の『あなた』の下の数字」</b>です。</p>
                </div>
            `;
        } else {
            if (quiz1_attempts >= 2) {
                return `
                <div class="instructions">
                    <h2 style="color: #dc3545;">不正解です</h2>
                    <p>※正解は<b>「左側の『あなた』の下の数字」</b>です。</p>
                    <p>これ以上は繰り返さず、次のクイズへ進みます。</p>
                </div>
                `;
            } else {
                return `
                <div class="instructions">
                    <h2 style="color: #dc3545;">不正解です</h2>
                    <p>※正解は<b>「左側の『あなた』の下の数字」</b>です。</p>
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
    loop_function: function(data){
        const resp = data.values()[0].response;
        if (parseInt(resp, 10) === 0) return false; // 正解ならループ終了
        if (quiz1_attempts >= 2) return false; // 2回間違えたらループ強制終了
        return true; // 1回目の間違いならループ
    }
});

// 5. クイズ 2 (最大2回までループ)
let quiz2_attempts = 0;
const quiz2 = {
    type: 'html-button-response',
    button_html: custom_btn_html,
    stimulus: `
        <div class="instructions-top">
            <h2>理解度クイズ (2/2)</h2>
            <p>以下のポイントの表において、<b>「相手のポイント」</b>はマスの中の数字のうち、どちらでしょうか？<br>正しいと思う方のボタンをマウスでクリックしてください。</p>
        </div>
        ${generateMatrixHTML('PD', 1, 1, null, null)}
    `,
    choices: ['左側の「あなた」の下の数字', '右側の「相手」の下の数字'],
    data: { is_quiz: true },
    on_finish: function() {
        quiz2_attempts++;
    }
};

const quiz2_feedback = {
    type: 'html-button-response',
    button_html: custom_btn_html,
    stimulus: function() {
        const last_resp = jsPsych.data.get().last(1).values()[0].response;
        if(parseInt(last_resp, 10) === 1) { // 1: 右側
            return `
                <div class="instructions">
                    <h2 style="color: #28a745;">正解です！</h2>
                    <p>相手のポイントは<b>「右側の『相手』の下の数字」</b>です。</p>
                </div>
            `;
        } else {
            if (quiz2_attempts >= 2) {
                return `
                <div class="instructions">
                    <h2 style="color: #dc3545;">不正解です</h2>
                    <p>※正解は<b>「右側の『相手』の下の数字」</b>です。</p>
                    <p>これ以上は繰り返さず、次に進みます。</p>
                </div>
                `;
            } else {
                return `
                <div class="instructions">
                    <h2 style="color: #dc3545;">不正解です</h2>
                    <p>※正解は<b>「右側の『相手』の下の数字」</b>です。</p>
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
    loop_function: function(data){
        const resp = data.values()[0].response;
        if (parseInt(resp, 10) === 1) return false; // 正解ならループ終了
        if (quiz2_attempts >= 2) return false; // 2回間違えたらループ強制終了
        return true; // 1回目の間違いならループ
    }
});

// 6. ここからマウスカーソルを非表示にする
timeline.push({
    type: 'call-function',
    func: function() {
        document.body.classList.add('hide-cursor');
    }
});

// ---------------------------------------------------------
// トライアルコンポーネント (共通)
// ---------------------------------------------------------
const fixation = {
    type: 'html-keyboard-response',
    stimulus: '<div class="fixation-cross">+</div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 1000,
    data: { task: 'fixation' }
};

const blank = {
    type: 'html-keyboard-response',
    stimulus: '',
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
    data: { task: 'blank' }
};

const matrix_trial = {
    type: 'html-keyboard-response',
    stimulus: function() {
        return generateMatrixHTML(
            jsPsych.timelineVariable('game', true),
            jsPsych.timelineVariable('mult_self', true),
            jsPsych.timelineVariable('mult_other', true),
            null,
            null
        );
    },
    choices: ['f', 'j'],
    data: function() {
        return {
            task: 'response',
            game: jsPsych.timelineVariable('game'),
            mult_self: jsPsych.timelineVariable('mult_self'),
            mult_other: jsPsych.timelineVariable('mult_other'),
            block_type: jsPsych.timelineVariable('block_type')
        }
    }
};

const highlight_trial = {
    type: 'html-keyboard-response',
    stimulus: function() {
        const last_trial = jsPsych.data.get().last(1).values()[0];
        const choice = last_trial.response;
        return generateMatrixHTML(
            last_trial.game,
            last_trial.mult_self,
            last_trial.mult_other,
            choice,
            null
        );
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
    data: { task: 'highlight' }
};

const post_highlight_blank = {
    type: 'html-keyboard-response',
    stimulus: '',
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
    data: { task: 'post_blank' }
};

// ---------------------------------------------------------
// 練習試行ブロック
// ---------------------------------------------------------
timeline.push({
    type: 'html-keyboard-response',
    stimulus: `
        <div class="instructions">
            <h2>練習試行</h2>
            <p style="color: #007bff; font-weight: bold; font-size: 24px; padding: 15px; border: 3px solid #007bff; border-radius: 8px; background: #e7f1ff; margin: 30px 0;">
                【重要】これ以降はマウスを使用しません。<br>すべてキーボード（Fキー、Jキー）のみで操作を行います。
            </p>
            <p>ポイントの表が表示されたら、あなたの選択だと思う列のキー（<b>[ F ] キー</b> または <b>[ J ] キー</b>）をキーボードで押してください。</p>
            <p style="margin-top:40px; font-weight: bold;">準備ができたら、キーボードの「スペースキー」を押して開始してください。</p>
        </div>
    `,
    choices: [' ']
});

const practice_vars = practice_trials.map(t => ({...t, block_type: 'practice'}));
timeline.push({
    timeline: [fixation, blank, matrix_trial, highlight_trial, post_highlight_blank],
    timeline_variables: practice_vars,
    randomize_order: true
});

// ---------------------------------------------------------
// 本番試行ブロック
// ---------------------------------------------------------
timeline.push({
    type: 'html-keyboard-response',
    stimulus: `
        <div class="instructions">
            <h2>本番試行</h2>
            <p>これより本番を開始します。</p>
            <p>本番は複数回繰り返されます。なお、提示されるポイントの組み合わせは毎回異なります。</p>
            <p>各試行で、あなたの選択だと思う列のキー（<b>[ F ]</b> または <b>[ J ]</b>）を押してください。</p>
            <p style="margin-top:40px; font-weight: bold;">スペースキーを押して開始してください。</p>
        </div>
    `,
    choices: [' ']
});

const main_vars = main_trials.map(t => ({...t, block_type: 'main'}));
timeline.push({
    timeline: [fixation, blank, matrix_trial, highlight_trial, post_highlight_blank],
    timeline_variables: main_vars,
    randomize_order: true,
    repetitions: 2
});

// 7. マウスカーソルを再表示する
timeline.push({
    type: 'call-function',
    func: function() {
        document.body.classList.remove('hide-cursor');
    }
});

// ---------------------------------------------------------
// 終了処理と初期化
// ---------------------------------------------------------
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

// Qualtrics環境でない（ローカルでの確認）場合のみ実行
if (typeof Qualtrics === "undefined") {
    jsPsych.init({
        timeline: timeline,
        on_finish: function() {
            document.body.innerHTML = `
                <div style="text-align:center; margin-top:50px; font-family: sans-serif; font-size: 24px;">
                    <h2>データを保存しています...</h2>
                    <p>（この画面はローカル確認用のダミーです）</p>
                    <p>F12キーを押してコンソールから保存されるCSVデータを確認できます。</p>
                </div>
            `;
            console.log(jsPsych.data.get().csv());
        }
    });
}
