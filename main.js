

// --- Auto-scale 機能（画面が狭い・スケーリングが大きい場合のスクロール防止） ---
let assigned_condition = 'Repeated'; // デフォルトは反復群

function updateDisplayScale() {
    const targetHeight = 950; // これより縦幅が狭ければ縮小
    const targetWidth = 1100; // これより横幅が狭ければ縮小

    let scale = Math.min(
        1.0,
        window.innerHeight / targetHeight,
        window.innerWidth / targetWidth
    );

    const content = document.querySelector('.jspsych-content');
    if (content) {
        content.style.transform = `scale(${scale})`;
        content.style.transformOrigin = 'center center';
    }
}
window.addEventListener('resize', updateDisplayScale);
setInterval(updateDisplayScale, 250); // DOM再構築時にも確実に適用するため
// -------------------------------------------------------------
// =========================================================
// Shared Components
// =========================================================
const custom_btn_html = `<div class="custom-btn-visual" onclick="event.stopPropagation(); if(this.dataset.clicked) return; this.dataset.clicked='1'; var el=this; el.classList.add('pressed'); setTimeout(function(){ el.nextElementSibling.click(); }, 800)">%choice%</div><button style="display:none;" class="jspsych-btn">%choice%</button>`;

const sd_fixation = {
    type: 'html-keyboard-response',
    stimulus: '<div class="fixation-cross">+</div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
    data: { task: 'fixation' }
};

const blank = {
    type: 'html-keyboard-response',
    stimulus: '',
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
    data: { task: 'blank' }
};

const post_highlight_blank = {
    type: 'html-keyboard-response',
    stimulus: '',
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
    data: { task: 'post_blank' }
};

// =========================================================
// EEM & SVO Blocks (Imported from EEM_experiment)
// =========================================================
var repo_site = "https://stsuji430.github.io/EEM_SD/";

// 1. 各ブロックの教示文を生成する関数（全体の教示は分離）
var eem_equal_left = Math.random() < 0.5;

function create_block_stimulus(eq_val, un_s, un_o) {
    if (eem_equal_left) {
        return create_eem_stimulus(eq_val, eq_val, un_s, un_o);
    } else {
        return create_eem_stimulus(un_s, un_o, eq_val, eq_val);
    }
}

function get_eem_instruction_html(right_self, right_partner, is_unequal) {
    let eq_side = eem_equal_left ? '左側' : '右側';
    let un_side = eem_equal_left ? '右側' : '左側';

    let html = `<div class="instructions">`;

    if (!is_unequal) {
        html += `
            <h2 style="color: #0056b3; border-bottom-color: #0056b3;">新しいブロック（10問）が始まります</h2>
            <p style="margin: 15px 0 0 0; line-height: 1.8;">${eq_side}の分配総額は毎回変わりますが、ふたりとも<strong>同じ金額</strong>が与えられます。<br>
            ${un_side}の金額はいつも同じですが、ふたりの分配額は<strong>異なっています</strong>。</p>
            <p style="margin: 15px 0 0 0;">このブロックでは、${un_side}の分配として具体的に以下の金額が固定して提示されます。</p>
            
            <div style="font-size: 24px; margin: 20px 0 30px 20px; line-height: 1.5; width: 250px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border: 2px solid #333;">
                <div style="display: flex; justify-content: space-between;"><span>あなた:</span><span><strong>${right_self}</strong>円</span></div>
                <div style="display: flex; justify-content: space-between;"><span>Aさん:</span><span><strong>${right_partner}</strong>円</span></div>
            </div>
            
            <p>左右の金額をよく見比べて、好ましいと思う方を選んでください。</p>
        `;
    } else {
        html += `
            <h2 style="color: #155724; border-bottom-color: #155724;">新しいブロック（12問）が始まります</h2>
            <p style="margin: 15px 0 0 0;">このブロックでは、金額の組み合わせのルールがこれまでと少し異なります。<br>左右それぞれの金額が両方とも変化します。</p>
            <p style="margin-top: 15px;">左右の金額をよく見比べて、好ましいと思う方を選んでください。</p>
        `;
    }

    html += `<p style="margin-top: 40px; font-weight: bold; color: #d9534f;">準備ができたらスペースキーを押して開始してください。</p></div>`;
    return html;
}

// 2. 選択肢ボックスのHTMLを生成する共通関数
function generate_eem_box_html(self_amt, other_amt, key_label, bg_color, border_color, shadow, opacity, force_two_lines) {
    var content = '';
    // 数値が等しい場合は1行、異なる場合（または強制2行フラグがある場合）は2行で表示（高さは108pxで固定）
    if (self_amt === other_amt && !force_two_lines) {
        content = '<div style="height: 120px; display: flex; align-items: center; justify-content: center; white-space: nowrap;">' +
            '<span style="margin-right: 5px;">あなたとAさん:</span>' +
            '<span style="width: 70px; text-align: right; font-weight: bold;">' + self_amt + '</span>円' +
            '</div>';
    } else {
        content = '<div style="height: 120px; display: flex; flex-direction: column; justify-content: center; align-items: center;">' +
            '<div style="width: 230px; display: flex; justify-content: space-between; align-items: center; white-space: nowrap;">' +
            '<span>あなた:</span><span><strong style="display: inline-block; width: 70px; text-align: right;">' + self_amt + '</strong>円</span>' +
            '</div>' +
            '<div style="width: 230px; display: flex; justify-content: space-between; align-items: center; white-space: nowrap;">' +
            '<span>Aさん:</span><span><strong style="display: inline-block; width: 70px; text-align: right;">' + other_amt + '</strong>円</span>' +
            '</div>' +
            '</div>';
    }

    var footer = '';
    if (key_label) {
        footer = '<div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; width: 60%;"><span style="font-size: 22px; color: #666; font-weight: bold;">[' + key_label + ']</span></div>';
    }

    return '<div style="padding: 20px; font-size: 28px; line-height: 1.5; width: 340px; border: 2px solid ' + border_color + '; border-radius: 12px; background-color: ' + bg_color + '; ' + (shadow || "") + ' opacity: ' + opacity + '; text-align: center; display: flex; flex-direction: column; align-items: center; transition: all 0.2s;">' +
        content +
        footer + '</div>';
}

// 3. 共通のHTML生成関数（試行用）
function create_eem_stimulus(l_self, l_other, r_self, r_other, force_two_lines) {
    var left_box = generate_eem_box_html(l_self, l_other, "F キー", "#fff", "#333", "", "1", force_two_lines);
    var right_box = generate_eem_box_html(r_self, r_other, "J キー", "#fff", "#333", "", "1", force_two_lines);

    var combined_html = '<p style="margin-bottom: 50px; font-size: 28px; font-weight: bold;">どちらの配分を選びますか？<br><span style="font-size: 20px; font-weight: normal; color: #555;">（左なら F キー、右なら J キーを押してください）</span></p>' +
        '<div style="display: flex; justify-content: center; gap: 50px;">' + left_box + right_box + '</div>';

    return {
        stimulus_html: combined_html,
        left_self: l_self,
        left_partner: l_other,
        right_self: r_self,
        right_partner: r_other,
        force_two_lines: force_two_lines || false
    };
}

var eem_timeline = [];

// =========================================================
// ★画像の事前読み込み（Preload）
// =========================================================
var preload_images = {
    type: 'preload',
    images: [
        repo_site + 'image/key_instruction.png',
        repo_site + 'image/y_o.png',
        repo_site + 'image/y_o_v2.png',
        repo_site + 'image/post_match.png'
    ],
    message: '<p>データを読み込んでいます...</p>',
    show_progress_bar: true
};
eem_timeline.push(preload_images);

// =========================================================
// ★強制フルスクリーン開始設定
// =========================================================
var enter_fullscreen = {
    type: 'fullscreen',
    fullscreen_mode: true,
    message: '<style>#jspsych-fullscreen-btn { font-size: 20px; padding: 15px 50px; margin: 20px; cursor: pointer; transition: all 0.1s; border: 1px solid #ccc; border-radius: 4px; background-color: #fff; color: #333; } #jspsych-fullscreen-btn:active { background-color: #d4edda; border-color: #28a745; transform: scale(0.95); }</style>' +
        '<div style="text-align: center; margin-top: 10%;">' +
        '<p style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">この実験はフルスクリーンで実行されます。</p>' +
        '<div style="color: #dc3545; font-size: 24px; padding: 25px; border: 3px solid #dc3545; border-radius: 8px; background: #fff3f3; max-width: 800px; margin: 30px auto; text-align: left; line-height: 1.6;">' +
        '<b>【重要】</b><br>本調査では、各課題の途中でルールの理解度を確認するクイズが出題されます。<br>' +
        'クイズに繰り返し不正解となった場合、ルールを十分に理解されていないとみなされ、<b>課題を最後まで完了しても報酬をお支払いできない場合</b>がございますのでご注意ください。' +
        '</div>' +
        '<p style="font-size: 20px; margin-top: 30px;">準備ができたら下のボタンを押してフルスクリーンモードを開始してください。</p>' +
        '</div>',
    button_label: 'フルスクリーンを開始する'
};
eem_timeline.push(enter_fullscreen);

// =========================================================
// ★各試行間の注視点（フィードバック後の画面リセット・連打防止用）
// =========================================================
var fixation = {
    type: 'html-keyboard-response',
    stimulus: '<div style="font-size: 60px; color: #333; margin-top: 100px;">+</div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 500, // 500ミリ秒間注視点を表示
    post_trial_gap: 0,
    data: { task: 'fixation' }
};

// =========================================================
// ★最重要修正：eem_trial と eem_feedback を一番最初に定義しておく
// =========================================================
var eem_trial = {
    type: 'html-keyboard-response',
    stimulus: jsPsych.timelineVariable('stimulus_html'),
    choices: ['f', 'j'],
    data: {
        task: 'eem',
        left_self: jsPsych.timelineVariable('left_self'),
        left_partner: jsPsych.timelineVariable('left_partner'),
        right_self: jsPsych.timelineVariable('right_self'),
        right_partner: jsPsych.timelineVariable('right_partner')
    },
    post_trial_gap: 0
};

var eem_feedback = {
    type: 'html-keyboard-response',
    stimulus: function () {
        var last_trial_data = jsPsych.data.get().last(1).values()[0];
        var response = last_trial_data.response;
        var l_self = jsPsych.timelineVariable('left_self', true);
        var l_partner = jsPsych.timelineVariable('left_partner', true);
        var r_self = jsPsych.timelineVariable('right_self', true);
        var r_partner = jsPsych.timelineVariable('right_partner', true);

        // 選ばれた方を緑色に強調し、選ばれなかった方を少し薄くする
        var left_bg = (response === 'f') ? '#d4edda' : '#f8f9fa';
        var left_border = (response === 'f') ? '#28a745' : '#ccc';
        var left_shadow = (response === 'f') ? 'box-shadow: 0 0 15px rgba(40,167,69,0.6);' : '';
        var left_opacity = (response === 'f') ? '1' : '0.4';

        var right_bg = (response === 'j') ? '#d4edda' : '#f8f9fa';
        var right_border = (response === 'j') ? '#28a745' : '#ccc';
        var right_shadow = (response === 'j') ? 'box-shadow: 0 0 15px rgba(40,167,69,0.6);' : '';
        var right_opacity = (response === 'j') ? '1' : '0.4';

        var force_two_lines = jsPsych.timelineVariable('force_two_lines', true);

        // 共通関数を使用してフィードバック用のボックスを生成
        var left_box = generate_eem_box_html(l_self, l_partner, "F キー", left_bg, left_border, left_shadow, left_opacity, force_two_lines);
        var right_box = generate_eem_box_html(r_self, r_partner, "J キー", right_bg, right_border, right_shadow, right_opacity, force_two_lines);

        return '<p style="margin-bottom: 50px; font-size: 28px; font-weight: bold;">どちらの配分を選びますか？<br><span style="font-size: 20px; font-weight: normal; color: #555;">（左なら F キー、右なら J キーを押してください）</span></p>' +
            '<div style="display: flex; justify-content: center; gap: 50px;">' + left_box + right_box + '</div>';
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: 500, // 500ミリ秒間フィードバックを表示
    post_trial_gap: 0,
    data: { task: 'eem_feedback' }
};

// =========================================================
// 1. 理解度チェック（IMC）ブロック（マウスで回答）
// =========================================================
var imc_fail_count = 0;
var imc_passed = false;

// ★PC用に大きめのボタンデザインを定義（クリック時に確実にディレイを入れる）
var large_quiz_btn = '<button class="jspsych-btn" style="box-sizing: border-box; font-family: inherit; font-weight: bold; font-size: 22px; padding: 15px 40px; margin: 10px 20px; cursor: pointer; min-width: 250px; transition: all 0.1s;" onmousedown="this.style.backgroundColor=\'#d4edda\'; this.style.borderColor=\'#28a745\'; this.style.transform=\'scale(0.95)\';" onclick="if(this.dataset.clicked) return; this.dataset.clicked=\'1\'; event.stopPropagation(); event.preventDefault(); var btn=this; setTimeout(function(){ btn.click(); }, 500);">%choice%</button>';
var layout_quiz_btn = '<button class="jspsych-btn" style="box-sizing: border-box; font-family: inherit; font-weight: bold; font-size: 20px; padding: 15px 40px; margin: 10px 20px; cursor: pointer; width: 680px; max-width: 90vw; transition: all 0.1s;" onmousedown="this.style.backgroundColor=\'#d4edda\'; this.style.borderColor=\'#28a745\'; this.style.transform=\'scale(0.95)\';" onclick="if(this.dataset.clicked) return; this.dataset.clicked=\'1\'; event.stopPropagation(); event.preventDefault(); var btn=this; setTimeout(function(){ btn.click(); }, 500);">%choice%</button>';
var large_next_btn = '<button class="jspsych-btn" style="box-sizing: border-box; font-family: inherit; font-weight: bold; font-size: 20px; padding: 15px 50px; margin: 20px; cursor: pointer; transition: all 0.1s;" onmousedown="this.style.backgroundColor=\'#d4edda\'; this.style.borderColor=\'#28a745\'; this.style.transform=\'scale(0.95)\';" onclick="if(this.dataset.clicked) return; this.dataset.clicked=\'1\'; event.stopPropagation(); event.preventDefault(); var btn=this; setTimeout(function(){ btn.click(); }, 500);">%choice%</button>';

var imc_instruction = {
    type: 'html-button-response',
    button_html: custom_btn_html,
    choices: ['確認クイズへ進む'],
    stimulus: function () {
        return `
            <div class="instructions">
                <h1 style="color: #0056b3; font-size: 32px; text-align: center; border-bottom: 3px solid #0056b3; padding-bottom: 15px; margin-bottom: 30px;">ここから【課題1】が始まります</h1>
                <p>課題では、次のような場面を思い浮かべて回答をして下さい。<br>あなたが<strong>見知らぬ相手と二人組になった場面</strong>を思い浮かべてください。お互いに匿名です。</p>
                <div style="text-align: center; margin: 30px 0;">
                    <img src="${repo_site}image/y_o.png" style="max-width: 40%; max-height: 200px; width: auto; height: auto;">
                </div>
                <p>この相手との<strong>お金の分配についての決定</strong>を、あなたが行います。</p>
                <p style="margin-top: 20px; font-weight: bold;">課題の状況を想像できた方は、次のページで確認クイズに回答してください。</p>
            </div>
        `;
    }
};

var imc_quiz = {
    type: 'html-button-response',
    button_html: custom_btn_html,
    choices: ['よく知っている人', '見知らぬ人'],
    data: { task: 'imc_quiz' },
    stimulus: function () {
        return `
            <div class="instructions">
                <h2>【確認クイズ】</h2>
                <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; border: 2px solid #333; margin: 30px 0;">
                    <p style="font-size: 26px; font-weight: bold; margin: 0 0 20px 0; color: #333;">本実験で登場する相手は、____です。</p>
                    <p style="color: #666; font-size: 18px; margin: 0;">前のページの説明に基づき、正しいものを選んでください。</p>
                    <hr style="margin: 15px 0; border: 0; border-top: 1px dashed #ccc;">
                    <p style="font-weight: bold; color: #d9534f; margin-bottom: 0;">【※クイズへの回答は2回までです。2回以上不正解だった場合、次の課題に進みます】</p>
                    <p style="margin: 5px 0 0 0; font-weight: bold;">（${imc_fail_count + 1}回目）</p>
                </div>
            </div>
        `;
    },
    on_finish: function (data) {
        if (data.response === 1) {
            imc_passed = true;
            data.correct = true;
        } else {
            imc_passed = false;
            data.correct = false;
            imc_fail_count++;
        }
    }
};

var imc_feedback = {
    type: 'html-button-response',
    button_html: custom_btn_html,
    choices: ['次へ進む'],
    stimulus: function () {
        if (imc_passed) {
            return `
                <div class="instructions">
                    <h2 style="color: #28a745; border-bottom-color: #28a745;">正解です！</h2>
                    <p>この課題で登場する他者は、<strong>見知らぬ人（Aさん）</strong>です。</p>
                </div>
            `;
        } else {
            if (imc_fail_count >= 2) {
                return `
                    <div class="instructions">
                        <h2 style="color: #d9534f; border-bottom-color: #d9534f;">不正解です</h2>
                        <p>この課題で登場する他者は、<strong>見知らぬ人（Aさん）</strong>です。</p>
                        <p style="color: #d9534f; font-weight: bold; margin-top: 30px;">2回不正解であったため、次のページへ進みます。</p>
                    </div>
                `;
            } else {
                return `
                    <div class="instructions">
                        <h2 style="color: #d9534f; border-bottom-color: #d9534f;">不正解です</h2>
                        <p>この課題で登場する他者は、<strong>見知らぬ人（Aさん）</strong>です。</p>
                        <p style="margin-top: 30px; font-weight: bold; color: #d9534f;">もう一度説明を確認してください。</p>
                    </div>
                `;
            }
        }
    },
    on_finish: function () {
        if (!imc_passed && imc_fail_count >= 2) {
            try {
                Qualtrics.SurveyEngine.setEmbeddedData('imc_failed', '1');
            } catch (e) { console.log('Qualtricsへのエラー'); }
            // jsPsych.endExperiment(...) removed
        }
    }
};

var imc_loop = {
    timeline: [imc_instruction, imc_quiz, imc_feedback],
    loop_function: function () {
        if (imc_passed || imc_fail_count >= 2) { return false; }
        else { return true; }
    }
};

// =========================================================
// 2. キーボード操作の教示
// =========================================================
var eem_keyboard_instruction = {
    type: 'html-button-response',
    button_html: custom_btn_html,
    choices: ['次へ進む'],
    stimulus: function () {
        return `
            <div class="instructions">
                <h2>回答方法について</h2>
                <p>画面には「あなた」と「Aさん」の2人が受け取る金額の組み合わせが2つ提示されます。</p>
                <p>あなたは、左右の選択肢のうち、<strong>自分がより好ましいと思う方</strong>を選んでください。</p>
                <div style="text-align: center; margin: 30px 0;">
                    <img src="${repo_site}image/key_instruction.png" style="max-width: 80%; height: auto;">
                </div>
                <p style="font-weight: bold;">
                    左側の選択肢を選ぶ場合は <span class="key-label">F</span> キー 、 右側の選択肢を選ぶ場合は <span class="key-label">J</span> キー を押して回答してください。
                </p>
            </div>
        `;
    }
};

var practice_start = {
    type: 'html-keyboard-response',
    choices: [' '],
    stimulus: `
        <div class="instructions">
            <h2>練習課題の開始</h2>
            <p>これより練習課題が始まります。</p>
            <p>キーボードの <span class="key-label">F</span> と <span class="key-label">J</span> の上に指を置き、準備をしてください。</p>
            <p style="margin-top: 40px; font-weight: bold; color: #d9534f;">準備ができたらスペースキーを押して練習を開始してください。</p>
        </div>
    `
};

// =========================================================
// 3. EEM練習課題ブロック
// =========================================================

// --- 画面レイアウトの教示とクイズ ---
var layout_fail_count = 0;
var layout_passed = false;

var eem_layout_instruction = {
    type: 'html-button-response',
    button_html: custom_btn_html,
    choices: ['確認クイズへ進む'],
    stimulus: function () {
        return `
            <div class="instructions">
                <h2>画面の見方について</h2>
                <p>課題で提示される選択肢には、以下の2通りの表示方法があります。</p>
                <div style="display: flex; justify-content: center; margin: 30px 0; gap: 60px;">
                    <div style="display: flex; flex-direction: column; align-items: flex-start;">
                        <p style="font-size: 22px; font-weight: bold; margin: 0 0 10px 0;">① 金額が異なる場合</p>
                        ${generate_eem_box_html(600, 400, "", "#fff", "#333", "", "1", false)}
                        <p style="font-size: 18px; margin: 15px 0 0 0; color: #555;">「あなた」と「Aさん」が<br>別々の行に表示されます。</p>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-start;">
                        <p style="font-size: 22px; font-weight: bold; margin: 0 0 10px 0;">② 金額が同じ場合</p>
                        ${generate_eem_box_html(500, 500, "", "#fff", "#333", "", "1", false)}
                        <p style="font-size: 18px; margin: 15px 0 0 0; color: #555;">「あなたとAさん」として<br>1行にまとめて表示されます。</p>
                    </div>
                </div>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 2px solid #333; margin-bottom: 20px; font-size: 20px;">
                    <p style="margin: 5px 0;"><strong>①の場合：</strong> あなたが <strong>600円</strong>、Aさんが <strong>400円</strong> をもらえます。</p>
                    <p style="margin: 5px 0;"><strong>②の場合：</strong> あなたとAさんが <strong>ともに 500円ずつ</strong> もらえます。</p>
                </div>
                <p style="margin-bottom: 20px; color: #d9534f; font-weight: bold;">※いずれも「それぞれが受け取る金額」であり、2人で分け合うという意味ではありません。</p>
                <p style="font-weight: bold; color: #333;">確認のため、次のページでクイズに答えてください。</p>
            </div>
        `;
    }
};

var eem_layout_quiz = {
    type: 'html-button-response',
    button_html: custom_btn_html,
    choices: ['あなたとAさんが、ともに500円ずつもらえる', '500円を、あなたとAさんの2人で分ける（250円ずつになる）'],
    data: { task: 'layout_quiz' },
    stimulus: function () {
        return `
            <style>#jspsych-html-button-response-btngroup { display: flex; flex-direction: column; align-items: center; }</style>
            <div class="instructions">
                <h2>【確認クイズ】</h2>
                <div style="display: flex; justify-content: center; margin: 30px 0;">
                    ${generate_eem_box_html(500, 500, "", "#fff", "#333", "", "1", false)}
                </div>
                <p>上の表示はどのような意味でしょうか？正しいものを選んでください。</p>
                <div style="padding: 15px; background-color: #f8f9fa; border-radius: 8px; border: 2px solid #333; margin-top: 20px;">
                    <p style="font-weight: bold; color: #d9534f; margin-bottom: 5px;">【※クイズへの回答は2回までです。2回以上不正解だった場合、次の課題に進みます】</p>
                    <p style="margin: 0; font-weight: bold;">（${layout_fail_count + 1}回目）</p>
                </div>
            </div>
        `;
    },
    on_finish: function (data) {
        if (data.response === 0) {
            layout_passed = true;
            data.correct = true;
        } else {
            layout_passed = false;
            data.correct = false;
            layout_fail_count++;
        }
    }
};

var eem_layout_feedback = {
    type: 'html-button-response',
    button_html: custom_btn_html,
    choices: ['次へ進む'],
    stimulus: function () {
        if (layout_passed) {
            return `
                <div class="instructions">
                    <h2 style="color: #28a745; border-bottom-color: #28a745;">正解です！</h2>
                    <p>提示される金額は、<strong>それぞれが受け取る金額</strong>を表しています。</p>
                </div>
            `;
        } else {
            if (layout_fail_count >= 2) {
                return `
                    <div class="instructions">
                        <h2 style="color: #d9534f; border-bottom-color: #d9534f;">不正解です</h2>
                        <p>提示される金額は、<strong>それぞれが受け取る金額</strong>を表しています。<br>（2人で分けるという意味ではありません）</p>
                        <p style="margin-top: 30px; font-weight: bold; color: #d9534f;">2回不正解であったため、次の課題へ進みます。</p>
                    </div>
                `;
            } else {
                return `
                    <div class="instructions">
                        <h2 style="color: #d9534f; border-bottom-color: #d9534f;">不正解です</h2>
                        <p>提示される金額は、<strong>それぞれが受け取る金額</strong>を表しています。<br>（2人で分けるという意味ではありませんのでご注意ください。）</p>
                        <p style="margin-top: 30px; font-weight: bold; color: #d9534f;">もう一度説明を確認してください。</p>
                    </div>
                `;
            }
        }
    },
    on_finish: function () {
        if (!layout_passed && layout_fail_count >= 2) {
            try {
                Qualtrics.SurveyEngine.setEmbeddedData('layout_failed', '1');
            } catch (e) { console.log('Qualtrics連携エラー'); }
        }
    }
};

var eem_layout_loop = {
    timeline: [eem_layout_instruction, eem_layout_quiz, eem_layout_feedback],
    loop_function: function () {
        if (layout_passed || layout_fail_count >= 2) {
            return false;
        } else {
            return true;
        }
    }
};

var practice_trial = {
    type: 'html-keyboard-response',
    stimulus: jsPsych.timelineVariable('stimulus_html'),
    choices: ['f', 'j'],
    data: {
        task: 'eem_practice',
        left_self: jsPsych.timelineVariable('left_self'),
        left_partner: jsPsych.timelineVariable('left_partner'),
        right_self: jsPsych.timelineVariable('right_self'),
        right_partner: jsPsych.timelineVariable('right_partner')
    },
    post_trial_gap: 0
};

// ★本番のブロック構成（前半は左が平等、後半は両方不平等）に合わせて練習課題を設定
var practice_stimuli = [
    create_block_stimulus(500, 600, 400),
    create_block_stimulus(300, 700, 500),
    create_eem_stimulus(800, 200, 400, 600, true),
    create_eem_stimulus(300, 700, 700, 300, true)
];

var practice_procedure = {
    timeline: [fixation, practice_trial, eem_feedback],
    timeline_variables: practice_stimuli
};

var practice_end = {
    type: 'html-keyboard-response',
    choices: [' '],
    stimulus: `
        <div class="instructions">
            <h2>練習が終わりました</h2>
            <p>これより本番が始まります。<br>本番はいくつかのブロックに分かれており、ブロックごとにルールの説明が表示されます。</p>
            <p style="margin-top: 40px; font-weight: bold; color: #d9534f;">準備ができたらスペースキーを押して本番を開始してください。</p>
        </div>
    `
};

// タイムラインへの追加
eem_timeline.push(imc_loop);
eem_timeline.push(eem_layout_loop); // クイズをまとめるため、キーボード教示の前に移動
eem_timeline.push(eem_keyboard_instruction);
eem_timeline.push(practice_start);
eem_timeline.push(practice_procedure);
eem_timeline.push(practice_end);

// =========================================================
// 4. 本番ブロック（パターン1〜4）
// =========================================================
var eem_blocks = [];

// --- パターン1〜4 (10段階 × 4パターン = 40項目) ---
var right_options = [
    { s: 900, o: 500 },
    { s: 700, o: 500 },
    { s: 300, o: 500 },
    { s: 100, o: 500 }
];

right_options.forEach(function (opt) {
    var block_stimuli = [];
    for (var i = 900; i >= 0; i -= 100) {
        block_stimuli.push(create_block_stimulus(i, opt.s, opt.o));
    }

    eem_blocks.push({
        timeline: [
            {
                type: 'html-keyboard-response',
                stimulus: get_eem_instruction_html(opt.s, opt.o, false),
                choices: [' ']
            },
            {
                timeline: [fixation, eem_trial, eem_feedback],
                timeline_variables: block_stimuli,
                randomize_order: true // ★ ブロック内の試行をランダム化
            }
        ]
    });
});

// --- パターン5 (不平等同士、合計が等しい項目 = 12項目) ---
var unequal_options = [
    { ls: 500, lo: 500, rs: 700, ro: 300 },
    { ls: 400, lo: 600, rs: 700, ro: 300 },
    { ls: 300, lo: 700, rs: 700, ro: 300 },
    { ls: 200, lo: 800, rs: 700, ro: 300 },
    { ls: 100, lo: 900, rs: 700, ro: 300 },
    { ls: 0, lo: 1000, rs: 700, ro: 300 },
    { ls: 500, lo: 500, rs: 300, ro: 700 },
    { ls: 600, lo: 400, rs: 300, ro: 700 },
    { ls: 700, lo: 300, rs: 300, ro: 700 },
    { ls: 800, lo: 200, rs: 300, ro: 700 },
    { ls: 900, lo: 100, rs: 300, ro: 700 },
    { ls: 1000, lo: 0, rs: 300, ro: 700 }
];

var unequal_stimuli = [];
unequal_options.forEach(function (opt) {
    unequal_stimuli.push(create_eem_stimulus(opt.ls, opt.lo, opt.rs, opt.ro, true)); // ★後半の12問は平等分配でも強制的に2行表示にする
});

// ★ 最初の4ブロックの順序をランダム化して eem_timeline に追加
eem_blocks = jsPsych.randomization.shuffle(eem_blocks);

// ★ 最初のブロックの教示だけ「新しいブロック」という表現を避ける
eem_blocks[0].timeline[0].stimulus = eem_blocks[0].timeline[0].stimulus.replace(
    '新しいブロック（10問）が始まります',
    '本番が始まります（最初の10問）'
);

eem_timeline = eem_timeline.concat(eem_blocks);

// ★ パターン5（不平等同士）はランダム化に含めず、常に4ブロックの後（SVOの前）に固定で配置する
eem_timeline.push({
    timeline: [
        {
            type: 'html-keyboard-response',
            stimulus: get_eem_instruction_html(0, 0, true),
            choices: [' ']
        },
        {
            timeline: [fixation, eem_trial, eem_feedback],
            timeline_variables: unequal_stimuli,
            randomize_order: true // ★ ブロック内の試行はランダム化する
        }
    ]
});

// --- SVOスライダー課題の追加 ---

// SVOの教示画面
var svo_instructions = {
    type: 'html-button-response',
    on_start: function () {
        // マウス操作に戻るのでカーソルを再表示する
        document.body.style.cursor = 'auto';
    },
    stimulus: function () {
        // ★冒頭で定義した repo_site を使用
        var img_url = repo_site + "image/y_o.png";
        var html = '<div style="text-align: left; line-height: 1.6; font-size: 20px; max-width: 800px; margin: 0 auto; padding-bottom: 20px;">';
        html += '<h1 style="color: #0056b3; font-size: 32px; text-align: center; border-bottom: 3px solid #0056b3; padding-bottom: 15px; margin-bottom: 30px;">ここから【課題2】が始まります</h1>';

        html += '<p style="margin-bottom: 10px; font-weight: bold; color: #d9534f;">（ここからはキーボードではなく、マウスを使って回答します）</p>';
        html += '<p style="margin-bottom: 10px;">この課題も、<strong>あなたが見知らぬ相手と二人組になった状況</strong>を思い浮かべてください。お互いに匿名です。</p>';

        // SVOの選択肢の例をHTMLで生成
        var example_buttons = '<div style="display: flex; justify-content: center; gap: 6px; margin: 10px 0;">';
        var ex_s = [50, 52, 53, 54, 56, 57, 58, 59, 60];
        var ex_o = [45, 44, 42, 41, 40, 39, 37, 36, 35];
        for (var i = 0; i < 9; i++) {
            var is_active = (i === 4);
            var bg_color = is_active ? '#d4edda' : '#f8f9fa';
            var border_color = is_active ? '#28a745' : '#ccc';
            var shadow = is_active ? 'box-shadow: 0 0 8px rgba(40,167,69,0.5);' : '';
            var opacity = is_active ? '1' : '0.4';
            example_buttons += '<div style="padding: 2px 5px; border: 2px solid ' + border_color + '; border-radius: 6px; text-align: center; background-color: ' + bg_color + '; width: 80px; opacity: ' + opacity + '; ' + shadow + '; pointer-events: none; line-height: 1.1;">' +
                '<span style="font-size: 11px; font-weight: bold; color: #0056b3;">あなた</span><br><strong style="font-size: 14px;">' + ex_s[i] + '</strong><hr style="margin: 2px 0; border: none; border-top: 1px dashed #ccc;">' +
                '<span style="font-size: 11px; font-weight: bold; color: #E65F00;">Aさん</span><br><strong style="font-size: 14px;">' + ex_o[i] + '</strong>' +
                '</div>';
        }
        example_buttons += '</div>';

        html += '<p style="margin-bottom: 10px;">この相手とのポイントの配分についての決定を、あなたが行います。<br>' +
            '画面には <strong>9つの選択肢</strong> が横に並んで表示されますので、その中から、<strong>あなたにとって好ましい分配</strong>のボタンを1つクリックして選んでください。</p>';

        // 画像の復活（少し大きめに戻す）
        html += '<div style="text-align: center; margin: 15px 0;">';
        html += '<img src="' + img_url + '" style="max-width: 50%; max-height: 100px; width: auto; height: auto;">';
        html += '</div>';

        // 例示の部分
        html += '<div style="background-color: #f8f9fa; border: 2px solid #333; padding: 10px 15px; border-radius: 8px; margin-top: 10px; text-align: center;">' +
            '<p style="margin-bottom: 5px; font-size: 20px; font-weight: bold; text-align: left;">【選択肢の例】</p>' +
            example_buttons +
            '<p style="font-size: 20px; margin: 0; text-align: left;">上の例では、<strong>あなたが56ポイント、相手が40ポイントを受け取るような配分</strong>を選択しています。</p>' +
            '</div>' +
            '</div>';

        return html;
    },
    choices: ['次へ進む'],
    button_html: custom_btn_html,
    button_html: custom_btn_html, // ※定義済みの大きめのボタンを使用
    post_trial_gap: 500 // ボタンを押した後に少し長めのブランクを入れる
};

// SVOの座標データ
var svo_endpoints = [
    { item: 1, ep1: { s: 85, o: 85 }, ep2: { s: 85, o: 15 } },
    { item: 2, ep1: { s: 85, o: 15 }, ep2: { s: 100, o: 50 } },
    { item: 3, ep1: { s: 50, o: 100 }, ep2: { s: 85, o: 85 } },
    { item: 4, ep1: { s: 50, o: 100 }, ep2: { s: 85, o: 15 } },
    { item: 5, ep1: { s: 100, o: 50 }, ep2: { s: 50, o: 100 } },
    { item: 6, ep1: { s: 100, o: 50 }, ep2: { s: 85, o: 85 } },
    { item: 7, ep1: { s: 100, o: 50 }, ep2: { s: 70, o: 100 } },
    { item: 8, ep1: { s: 90, o: 100 }, ep2: { s: 100, o: 90 } },
    { item: 9, ep1: { s: 100, o: 70 }, ep2: { s: 50, o: 100 } },
    { item: 10, ep1: { s: 100, o: 70 }, ep2: { s: 70, o: 100 } },
    { item: 11, ep1: { s: 70, o: 100 }, ep2: { s: 100, o: 70 } },
    { item: 12, ep1: { s: 50, o: 100 }, ep2: { s: 100, o: 90 } },
    { item: 13, ep1: { s: 50, o: 100 }, ep2: { s: 100, o: 50 } },
    { item: 14, ep1: { s: 100, o: 90 }, ep2: { s: 70, o: 100 } },
    { item: 15, ep1: { s: 90, o: 100 }, ep2: { s: 100, o: 50 } }
];

var svo_stimuli = [];
for (var j = 0; j < svo_endpoints.length; j++) {
    var ep1 = svo_endpoints[j].ep1;
    var ep2 = svo_endpoints[j].ep2;
    var choices_html = [];
    var amounts = [];

    // 9段階に分割 (線形補間)
    for (var k = 0; k < 9; k++) {
        var t = k / 8; // 0 から 1 までの比率
        var self_amt = Math.round(ep1.s + t * (ep2.s - ep1.s));
        var other_amt = Math.round(ep1.o + t * (ep2.o - ep1.o));

        var btn_html = '<div style="padding: 10px; border: 2px solid #333; border-radius: 6px; text-align: center; background-color: #fff; width: 80px;">' +
            '<span style="font-size: 14px; font-weight: bold; color: #0056b3;">あなた</span><br><strong style="font-size: 22px;">' + self_amt + '</strong><hr style="margin: 8px 0; border: none; border-top: 2px dashed #ccc;">' +
            '<span style="font-size: 14px; font-weight: bold; color: #E65F00;">Aさん</span><br><strong style="font-size: 22px;">' + other_amt + '</strong>' +
            '</div>';
        choices_html.push(btn_html);
        amounts.push({ self: self_amt, other: other_amt });
    }

    svo_stimuli.push({
        item_number: svo_endpoints[j].item,
        choices_array: choices_html,
        amounts_array: amounts
    });
}

// =========================================================
// SVO試行とITI（ダミー試行）の定義
// =========================================================

var svo_trial = {
    type: 'html-button-response',
    stimulus: '<div style="text-align: center; margin-bottom: 30px;">' +
        '<p style="font-size: 20px; color: #666; margin-bottom: 5px; font-weight: bold;">【あなた と 見知らぬ相手（Aさん） とのポイント分配】</p>' +
        '<p style="font-size: 24px; font-weight: bold; margin: 0;">あなたにとって最も好ましい配分を1つ選んでください。</p>' +
        '</div>',
    choices: jsPsych.timelineVariable('choices_array'),
    button_html: '<button class="svo-btn" style="margin: 0; padding: 0; border: none; background: none; cursor: pointer; outline: none;">%choice%</button>',
    data: {
        task: 'svo',
        item_number: jsPsych.timelineVariable('item_number')
    },
    on_finish: function (data) {
        var selected_index = data.response;
        var amounts = jsPsych.timelineVariable('amounts_array', true);
        data.self_amount = amounts[selected_index].self;
        data.other_amount = amounts[selected_index].other;
    },
    // ★ダミー試行をすぐ後に繋げるため、デフォルトの空白時間（真っ白になる時間）を0にします
    post_trial_gap: 0
};

// ★新設：SVO専用のフィードバック試行
var svo_feedback = {
    type: 'html-button-response',
    stimulus: function () {
        return '<div style="text-align: center; margin-bottom: 30px;">' +
            '<p style="font-size: 20px; color: #666; margin-bottom: 5px; font-weight: bold;">【あなた と 見知らぬ相手（Aさん） とのポイント分配】</p>' +
            '<p style="font-size: 24px; font-weight: bold; margin: 0;">あなたにとって最も好ましい配分を1つ選んでください。</p>' +
            '</div>';
    },
    choices: jsPsych.timelineVariable('choices_array'),
    button_html: '<button class="svo-btn" style="margin: 0; padding: 0; border: none; background: none; cursor: default; outline: none;">%choice%</button>',
    trial_duration: 500,
    response_ends_trial: false,
    on_load: function () {
        var last_trial_data = jsPsych.data.get().last(1).values()[0];
        var selected_index = parseInt(last_trial_data.response);
        var buttons = document.getElementsByClassName('jspsych-html-button-response-button');

        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i].querySelector('button');
            var choice_inner = btn.querySelector('div');

            if (i === selected_index) {
                btn.style.opacity = '1';
                if (choice_inner) {
                    choice_inner.style.backgroundColor = '#d4edda';
                    choice_inner.style.border = '2px solid #28a745';
                    choice_inner.style.boxShadow = '0 0 10px rgba(40,167,69,0.5)';
                }
            } else {
                btn.style.opacity = '0.4';
                if (choice_inner) {
                    choice_inner.style.backgroundColor = '#f8f9fa';
                    choice_inner.style.border = '2px solid #ccc';
                }
            }
        }
    },
    post_trial_gap: 0 // ブランクは試行前に独立したイベントとして入れるためここは0
};

// =========================================================
// 手順のタイムライン組み立て
// =========================================================

// ★ SVOの試行前に表示するブランク
var svo_blank = {
    type: 'html-keyboard-response',
    stimulus: '',
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
    post_trial_gap: 0
};

var svo_procedure = {
    timeline: [svo_blank, svo_trial, svo_feedback], // ★ 試行前（ブロックの最初含む）にブランクを挿入し、試行後はフィードバックですぐ終わる
    timeline_variables: svo_stimuli,
    randomize_order: true // SVOはランダムに提示
};



// =========================================================
// SD Task Blocks
// =========================================================
// main.js



// 1. ベースとなる配列 (v1 > v2 > v3 > v4)
const base = [16, 12, 8, 4];

// 2. 倍率ペアの定義 (定数c と 倍率m のオブジェクト)
const dilemmaPairs = [
    [{ c: 10, m: 2 }, { c: 10, m: 2 }], [{ c: 10, m: 3 }, { c: 10, m: 3 }],
    [{ c: 15, m: 2 }, { c: 15, m: 2 }], [{ c: 15, m: 3 }, { c: 15, m: 3 }], // 対称4パターン
    [{ c: 10, m: 3 }, { c: 10, m: 2 }], [{ c: 10, m: 2 }, { c: 10, m: 3 }] // 非対称2パターン
];

const hgPairs = [
    [{ c: 15, m: 3 }, { c: 15, m: 3 }] // HG 1パターン (左右反転で2試行になる)
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

// 動的HTML生成
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
// 固定シードシャッフル関数
// ---------------------------------------------------------
function seededShuffle(array, seed) {
    let m = array.length, t, i;
    while (m) {
        seed = (seed * 9301 + 49297) % 233280;
        i = Math.floor((seed / 233280) * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

// ---------------------------------------------------------
// 試行データの生成
// ---------------------------------------------------------
let main_trials = [];
const gameTypes = ['PD', 'SH', 'CH'];

gameTypes.forEach(gt => {
    dilemmaPairs.forEach(pair => {
        main_trials.push({ game: gt, mult_self: pair[0], mult_other: pair[1], swap_lr: false });
        main_trials.push({ game: gt, mult_self: pair[0], mult_other: pair[1], swap_lr: true });
    });
});

hgPairs.forEach(pair => {
    main_trials.push({ game: 'HG', mult_self: pair[0], mult_other: pair[1], swap_lr: false });
    main_trials.push({ game: 'HG', mult_self: pair[0], mult_other: pair[1], swap_lr: true });
});

// 第1試行と第38試行のアンカーを抽出
let anchor_trial_1 = main_trials.find(t => t.game === 'PD' && t.mult_self.c === 10 && t.mult_self.m === 2 && t.mult_other.c === 10 && t.mult_other.m === 2 && !t.swap_lr);
let anchor_trial_38 = main_trials.find(t => t.game === 'PD' && t.mult_self.c === 10 && t.mult_self.m === 2 && t.mult_other.c === 10 && t.mult_other.m === 2 && t.swap_lr);

// アンカーを除外して残り36試行をシャッフル
let remaining_trials = main_trials.filter(t => t !== anchor_trial_1 && t !== anchor_trial_38);
remaining_trials = seededShuffle(remaining_trials, 12345); // 固定シード

// 全38試行を結合
let all_sd_trials = [anchor_trial_1, ...remaining_trials, anchor_trial_38];
// プロパティ追加
all_sd_trials = all_sd_trials.map(t => ({ ...t, block_type: 'main' }));

const practice_trials = [
    { game: 'PD', mult_self: { c: 10, m: 2 }, mult_other: { c: 10, m: 2 }, swap_lr: false },
    { game: 'SH', mult_self: { c: 15, m: 1 }, mult_other: { c: 15, m: 1 }, swap_lr: true },
    { game: 'CH', mult_self: { c: 10, m: 3 }, mult_other: { c: 10, m: 2 }, swap_lr: false }
];

// ---------------------------------------------------------
// jsPsych タイムラインの構築
// ---------------------------------------------------------
var timeline = [].concat(eem_timeline, [svo_instructions, svo_procedure]); // EEMとSVOを先頭に結合
//デバッグ用（SD課題のみ）
//var timeline = [enter_fullscreen];
window.experiment_timeline = timeline;

// --- 3Round条件の分岐処理 ---
var condition_assign = {
    type: 'call-function',
    func: function() {
        // ★デバッグ用: 一時的に必ず 3Round（中断）になるように 0.0 に設定しています（本来は 0.5）
        if (Math.random() < 0.0) {
            assigned_condition = 'Repeated';
        } else {
            assigned_condition = '3Round';
        }
    }
};
timeline.push(condition_assign);

var exit_message = {
    type: 'html-keyboard-response',
    stimulus: '<div class="instructions"><p style="font-size: 24px; line-height: 1.6;">SVO課題が終了しました。<br>これより、形式の異なる3つ目の課題に移行します。<br><br>スペースキーを押すと画面が切り替わります。</p></div>',
    choices: [' '],
    on_finish: function() {
        // スペースキーが押されたら実験を終了し、Qualtricsへデータ送信
        jsPsych.endExperiment();
    }
};

var exit_node = {
    timeline: [
        {
            type: 'fullscreen',
            fullscreen_mode: false // フルスクリーンを解除
        },
        exit_message
    ],
    conditional_function: function() {
        return assigned_condition === '3Round';
    }
};
timeline.push(exit_node);
// ---------------------------------------------------------

// 2. 教示 1: ルール説明（事後マッチングと報酬に関する3ページ）
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
        stimulus: page
    });
});

// 3. 教示 2: 利得表の事前説明
const sd_btn_style = '<style>#jspsych-html-button-response-btngroup { position: relative !important; margin-top: 30px !important; text-align: center !important; width: 100% !important; z-index: 999 !important; }</style>';

const instructions_pages = [
    `
        ${sd_btn_style}
        <div class="instructions-top">\n        
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
    data: { is_quiz: true },
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

// 5. クイズ 2
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
    data: { is_quiz: true },
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

// ---------------------------------------------------------
// トライアルコンポーネント (共通・時間切れ処理追加)
// ---------------------------------------------------------

const matrix_trial = {
    type: 'html-keyboard-response',
    stimulus: function () {
        const matrixHTML = generateMatrixHTML(
            jsPsych.timelineVariable('game', true),
            jsPsych.timelineVariable('mult_self', true),
            jsPsych.timelineVariable('mult_other', true),
            jsPsych.timelineVariable('swap_lr', true),
            null,
            null
        );
        return '<p style="margin-bottom: 20px; font-size: 28px; font-weight: bold; text-align: center;">どの選択肢を選びますか？<br><span style="font-size: 20px; font-weight: normal; color: #555;">（左なら F キー、右なら J キーを押してください）</span></p>' + matrixHTML;
    },
    choices: ['f', 'j'],
    trial_duration: 30000, // 30秒でタイムアウト
    data: function () {
        return {
            task: 'response',
            game: jsPsych.timelineVariable('game'),
            mult_self_c: jsPsych.timelineVariable('mult_self').c,
            mult_self_m: jsPsych.timelineVariable('mult_self').m,
            mult_other_c: jsPsych.timelineVariable('mult_other').c,
            mult_other_m: jsPsych.timelineVariable('mult_other').m,
            swap_lr: jsPsych.timelineVariable('swap_lr'),
            block_type: jsPsych.timelineVariable('block_type')
        }
    }
};

const timeout_screen = {
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
    timeline: [timeout_screen],
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
            choice,
            null
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

// ---------------------------------------------------------
// 練習試行ブロック
// ---------------------------------------------------------
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
    choices: [' ']
});

const practice_vars = practice_trials.map(t => ({ ...t, block_type: 'practice' }));
timeline.push({
    timeline: [sd_fixation, blank, matrix_trial, if_timeout, if_not_timeout],
    timeline_variables: practice_vars,
    randomize_order: false
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
            <p>本番は複数回繰り返されます。ただし、提示されるポイントの組み合わせは毎回異なります。</p>
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

// 7. マウスカーソルを再表示する
timeline.push({
    type: 'call-function',
    func: function () {
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

// QualtricsやIFrame内で実行されているかどうかで処理を分ける
jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        // 元の仕様に戻す（stimulusを含めたフルデータを出力する）
        var datajs = jsPsych.data.get().json();

        // もしIFrameの中（例：Qualtrics）で動いているなら、親画面にデータを送信する
        if (window.self !== window.top) {
            window.parent.postMessage({
                type: 'jspsych-data',
                data: datajs,
                condition: assigned_condition
            }, '*');
        } else {
            // ローカル（そのままHTMLを開いた場合）の処理
            document.body.innerHTML = `
                <div style="text-align:center; margin-top:50px; font-family: sans-serif; font-size: 24px;">
                    <h2>データを保存しています...</h2>
                    <p>（この画面はローカル確認用のダミーです）</p>
                    <p>F12キーを押してコンソールから保存されるCSVデータを確認できます。</p>
                </div>
            `;
            console.log(jsPsych.data.get().csv());
        }
    }
});
