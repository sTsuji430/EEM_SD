// =========================================================
// shared_tasks.js
// EEM・SVO課題、画面スケーリング、Qualtrics連携などの共通モジュール
// =========================================================

// --- Auto-scale 機能（画面が狭い・スケーリングが大きい場合のスクロール防止） ---
function updateDisplayScale() {
    const targetHeight = 950;
    const targetWidth = 1100;

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
setInterval(updateDisplayScale, 250);

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

// ローカル環境（file:やlocalhost）とGitHub Pages本番環境で参照パスを自動切替
var repo_site = (location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? "./" : "https://stsuji430.github.io/EEM_SD/";

// 共通タイムライン
var timeline = [];

// =========================================================
// EEM & SVO Blocks
// =========================================================
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

function generate_eem_box_html(self_amt, other_amt, key_label, bg_color, border_color, shadow, opacity, force_two_lines) {
    var content = '';
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

var preload_images = {
    type: 'preload',
    images: [
        repo_site + 'image/key_instruction.png',
        repo_site + 'image/y_o.png',
        repo_site + 'image/y_o_v2.png',
        repo_site + 'image/post_match.png',
        repo_site + 'image/postmatch_3round.png'
    ],
    message: '<p>データを読み込んでいます...</p>',
    show_progress_bar: true,
    continue_after_error: true
};
eem_timeline.push(preload_images);

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

var fixation = {
    type: 'html-keyboard-response',
    stimulus: '<div style="font-size: 60px; color: #333; margin-top: 100px;">+</div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
    post_trial_gap: 0,
    data: { task: 'fixation' }
};

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
    on_start: function () {
        // キーボード操作課題のためマウスカーソルを非表示
        document.body.classList.add('hide-cursor');
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

        var left_bg = (response === 'f') ? '#d4edda' : '#f8f9fa';
        var left_border = (response === 'f') ? '#28a745' : '#ccc';
        var left_shadow = (response === 'f') ? 'box-shadow: 0 0 15px rgba(40,167,69,0.6);' : '';
        var left_opacity = (response === 'f') ? '1' : '0.4';

        var right_bg = (response === 'j') ? '#d4edda' : '#f8f9fa';
        var right_border = (response === 'j') ? '#28a745' : '#ccc';
        var right_shadow = (response === 'j') ? 'box-shadow: 0 0 15px rgba(40,167,69,0.6);' : '';
        var right_opacity = (response === 'j') ? '1' : '0.4';

        var force_two_lines = jsPsych.timelineVariable('force_two_lines', true);

        var left_box = generate_eem_box_html(l_self, l_partner, "F キー", left_bg, left_border, left_shadow, left_opacity, force_two_lines);
        var right_box = generate_eem_box_html(r_self, r_partner, "J キー", right_bg, right_border, right_shadow, right_opacity, force_two_lines);

        return '<p style="margin-bottom: 50px; font-size: 28px; font-weight: bold;">どちらの配分を選びますか？<br><span style="font-size: 20px; font-weight: normal; color: #555;">（左なら F キー、右なら J キーを押してください）</span></p>' +
            '<div style="display: flex; justify-content: center; gap: 50px;">' + left_box + right_box + '</div>';
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
    post_trial_gap: 0,
    data: { task: 'eem_feedback' }
};

var imc_fail_count = 0;
var imc_passed = false;

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
    },
    on_start: function () {
        document.body.classList.remove('hide-cursor');
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
            } catch (e) { console.log('Qualtrics連携エラー'); }
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
                <div style="text-align: center; margin: 15px 0;">
                    <img src="${repo_site}image/key_instruction.png" style="max-width: 60%; max-height: 25vh; width: auto; height: auto; object-fit: contain;">
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
    `,
    on_start: function () {
        document.body.classList.add('hide-cursor');
    }
};

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

eem_timeline.push(imc_loop);
eem_timeline.push(eem_layout_loop);
eem_timeline.push(eem_keyboard_instruction);
eem_timeline.push(practice_start);
eem_timeline.push(practice_procedure);
eem_timeline.push(practice_end);

var eem_blocks = [];

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
                randomize_order: true
            }
        ]
    });
});

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
    unequal_stimuli.push(create_eem_stimulus(opt.ls, opt.lo, opt.rs, opt.ro, true));
});

eem_blocks = jsPsych.randomization.shuffle(eem_blocks);

eem_blocks[0].timeline[0].stimulus = eem_blocks[0].timeline[0].stimulus.replace(
    '新しいブロック（10問）が始まります',
    '本番が始まります（最初の10問）'
);

eem_timeline = eem_timeline.concat(eem_blocks);

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
            randomize_order: true
        }
    ]
});

timeline = timeline.concat(eem_timeline);

// =========================================================
// SVO Block
// =========================================================
var svo_instructions = {
    type: 'html-button-response',
    on_start: function () {
        document.body.classList.remove('hide-cursor');
    },
    stimulus: function () {
        var img_url = repo_site + "image/y_o.png";
        var html = '<div style="text-align: left; line-height: 1.6; font-size: 20px; max-width: 800px; margin: 0 auto; padding-bottom: 20px;">';
        html += '<h1 style="color: #0056b3; font-size: 32px; text-align: center; border-bottom: 3px solid #0056b3; padding-bottom: 15px; margin-bottom: 30px;">ここから【課題2】が始まります</h1>';
        html += '<p style="margin-bottom: 10px; font-weight: bold; color: #d9534f;">（ここからはキーボードではなく、マウスを使って回答します）</p>';
        html += '<p style="margin-bottom: 10px;">この課題も、<strong>あなたが見知らぬ相手と二人組になった状況</strong>を思い浮かべてください。お互いに匿名です。</p>';

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
        html += '<div style="text-align: center; margin: 15px 0;">';
        html += '<img src="' + img_url + '" style="max-width: 50%; max-height: 100px; width: auto; height: auto;">';
        html += '</div>';

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
    post_trial_gap: 500
};

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

    for (var k = 0; k < 9; k++) {
        var t = k / 8;
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

// SVO試行間のブランク画面
var svo_blank = {
    type: 'html-keyboard-response',
    stimulus: '',
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
    data: { task: 'svo_blank' }
};

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
    post_trial_gap: 0
};

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
        var selected_index = last_trial_data.response;
        var btns = document.querySelectorAll('.svo-btn');

        if (btns && btns[selected_index]) {
            var innerDiv = btns[selected_index].querySelector('div');
            if (innerDiv) {
                innerDiv.style.backgroundColor = '#d4edda';
                innerDiv.style.borderColor = '#28a745';
                innerDiv.style.boxShadow = '0 0 10px rgba(40,167,69,0.8)';
            }
        }
    },
    post_trial_gap: 0,
    data: { task: 'svo_feedback' }
};

var svo_procedure = {
    timeline: [svo_blank, svo_trial, svo_feedback],
    timeline_variables: svo_stimuli,
    randomize_order: true
};

timeline.push(svo_instructions);
timeline.push(svo_procedure);

// =========================================================
// 実験終了・Qualtrics送信処理の共通関数
// =========================================================
function finishExperiment(assigned_condition) {
    // Qualtrics 20KB (20,000文字) 制限を確実にクリアするため、
    // 研究に必要な本番試行データ（EEM, SVO, PD課題, クイズ）のみを抽出し、HTML stimulus等の不要な列を除外して最適化
    var filtered_data = jsPsych.data.get().filterCustom(function(trial) {
        return trial.task === 'eem' || 
               trial.task === 'svo' || 
               trial.task === 'pd_slider_trial' || 
               trial.task === 'response' || 
               trial.task === 'imc_quiz' || 
               trial.task === 'layout_quiz';
    }).ignore(['stimulus', 'internal_node_id']);

    var datacsv = filtered_data.csv();

    if (window.self !== window.top) {
        window.parent.postMessage({
            type: 'jspsych-data',
            data: datacsv,
            condition: assigned_condition
        }, '*');
    } else {
        document.body.innerHTML = `
            <div style="text-align:center; margin-top:50px; font-family: sans-serif; font-size: 24px;">
                <h2>データを保存しました（最適化済み）</h2>
                <p>送信データ量: ${datacsv.length} 文字 / 20,000文字制限</p>
                <p>F12キーのコンソール等で出力CSVを確認できます。</p>
            </div>
        `;
        console.log("=== 実験結果 CSV (" + datacsv.length + " 文字) ===");
        console.log(datacsv);
    }
}
