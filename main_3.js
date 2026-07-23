// =========================================================
// main_3.js
// 3回連続値スライダーPD課題タイムライン & init
// (cond='3' の場合のタイムライン: 元手200円, 10円刻み, 2段階確定ポップアウト)
// =========================================================

// --- 1. 3回PD課題の教示画面 (スモールステップ化) ---
const intro_pages_3 = [
    `
        <div class="instructions">
            <h1 style="color: #0056b3; font-size: 32px; text-align: center; border-bottom: 3px solid #0056b3; padding-bottom: 15px; margin-bottom: 30px;">ここから【課題3】が始まります</h1>
            <p style="font-size: 20px; line-height: 1.6; font-weight: bold; margin-bottom: 20px;">今から行う課題では、この調査に参加している他の回答者とペアになって課題を行います。</p>
            <p style="font-size: 20px; line-height: 1.6; margin-bottom: 20px;">
                この課題は全部で <strong>3回（3ラウンド）</strong> 行いますが、<br>
                <strong>ラウンドごとにそれぞれ異なる3名の方（Bさん、Cさん、Dさん）と新たにペア</strong>になります。
            </p>
            <div style="text-align: center; margin: 15px 0;">
                <img src="${repo_site}image/postmatch_3round.png" style="max-width: 65%; max-height: 28vh; width: auto; height: auto; border: 1px solid #ddd; border-radius: 10px; padding: 5px; box-shadow: 0 3px 8px rgba(0,0,0,0.05);">
            </div>
            <p style="font-size: 18px; color: #555; text-align: center;">※お互いに完全に匿名であり、リアルタイムに2人組で課題を行うわけではありません。</p>
        </div>
    `,
    `
        <div class="instructions">
            <h1 style="color: #0056b3; font-size: 32px; text-align: center; border-bottom: 3px solid #0056b3; padding-bottom: 15px; margin-bottom: 30px;">基本ルール（ポイントの受け渡し）</h1>
            <p style="font-weight: bold; font-size: 22px; color: #333; margin-bottom: 10px;">【基本ルール】</p>
            <ul style="line-height: 1.8; font-size: 19px; background: #f8f9fa; padding: 20px 20px 20px 40px; border-radius: 8px; border: 2px solid #ccc; list-style-type: disc;">
                <li>あなたと相手には、ラウンドの最初にそれぞれ<strong>「200円」</strong>の元手が与えられます。</li>
                <li>あなたは、元手200円のうち<strong>「何円を相手に渡すか」</strong>（10円刻み：0〜200円）を決定します。</li>
                <li>相手（Bさん、Cさん、またはDさん）も同様に、元手200円のうち「何円をあなたに渡すか」を決定します。</li>
                <li><strong style="color: #0056b3;">あなたの選択によって相手の獲得金額が変わり、相手の選択によってあなたの獲得金額が変わります。</strong></li>
            </ul>

            <p style="font-size: 19px; line-height: 1.8; margin-top: 15px;">
                あなたが相手に渡した金額、および相手があなたに渡した金額は、それぞれ<strong>「一定の倍率」に増えて相手に届きます</strong>（倍率はラウンドごとに変化します）。
            </p>
        </div>
    `,
    `
        <div class="instructions">
            <h1 style="color: #0056b3; font-size: 32px; text-align: center; border-bottom: 3px solid #0056b3; padding-bottom: 15px; margin-bottom: 30px;">獲得金額の計算方法</h1>
            <p style="font-size: 19px; line-height: 1.6; margin-bottom: 15px;">
                各ラウンド終了時におけるあなたの最終的な獲得金額は、以下の計算式で決定します。
            </p>

            <div style="background-color: #e7f1ff; border: 2px solid #0056b3; padding: 15px; border-radius: 10px; margin: 15px 0; font-size: 19px; text-align: center;">
                <p style="font-weight: bold; color: #0056b3; margin-bottom: 5px; font-size: 20px;">【あなたの最終獲得金額の計算式】</p>
                <p style="font-size: 22px; font-weight: bold; margin: 5px 0; color: #333;">
                    ( 200 - あなたが渡した額 ) ＋ ( 相手が渡してきた額 × 倍率 )
                </p>
            </div>

            <!-- 計算の具体例カード -->
            <div style="background-color: #f8f9fa; border: 2px dashed #0056b3; padding: 15px 20px; border-radius: 10px; margin-top: 20px; font-size: 18px; line-height: 1.6;">
                <p style="font-weight: bold; color: #0056b3; margin: 0 0 8px 0; font-size: 19px;">💡 【計算の具体例】（※例として倍率が 3.0倍 の場合）</p>
                <p style="margin: 0 0 5px 0;">あなたが <strong>80円</strong> を渡し、相手が <strong>140円</strong> を渡してきた場合：</p>
                <ul style="margin: 5px 0 0 20px; padding: 0; line-height: 1.6;">
                    <li>手元に残る金額： 200円 - 80円 ＝ <strong>120円</strong></li>
                    <li>相手から届く金額： 140円 × 3.0倍 ＝ <strong>420円</strong></li>
                    <li><strong>あなたの最終獲得金額： 120円 ＋ 420円 ＝ 540円</strong></li>
                </ul>
            </div>
        </div>
    `,
    `
        <div class="instructions">
            <h1 style="color: #0056b3; font-size: 32px; text-align: center; border-bottom: 3px solid #0056b3; padding-bottom: 15px; margin-bottom: 30px;">追加報酬の決定について</h1>
            <p style="font-size: 20px; line-height: 1.6; margin-bottom: 20px;">
                全3ラウンドの回答をすべて回収した後、<strong>いずれか1つのラウンドの回答がランダムに選ばれます。</strong>
            </p>
            <div style="text-align: center; margin: 15px 0;">
                <img src="${repo_site}image/postmatch_3round.png" style="max-width: 65%; max-height: 26vh; width: auto; height: auto; border: 1px solid #ddd; border-radius: 10px; padding: 5px; box-shadow: 0 3px 8px rgba(0,0,0,0.05);">
            </div>
            <p style="font-size: 19px; line-height: 1.6; margin-bottom: 20px;">
                選ばれたラウンドにおいて実際にペアになった相手の回答と突き合わせ、<strong>算出されたあなたの最終獲得金額が、そのままあなたの追加報酬（円）</strong>となります。
            </p>
            <p style="color: #dc3545; font-weight: bold; padding: 12px; border: 2px solid #dc3545; border-radius: 8px; background: #fff; font-size: 20px;">
                【重要】どのラウンドが選ばれるかは分かりませんので、すべてのラウンドにおいて真剣に意思決定を行ってください。
            </p>
            <p style="font-size: 17px; color: #555; margin-top: 15px;">※後日、追加報酬がある方には、クラウドワークスを通じて個別タスクに参加いただくことでお支払いいたします。</p>
        </div>
    `,
    `
        <div class="instructions">
            <h1 style="color: #0056b3; font-size: 32px; text-align: center; border-bottom: 3px solid #0056b3; padding-bottom: 15px; margin-bottom: 30px;">回答方法について</h1>
            <p style="font-size: 19px; line-height: 1.8;">
                各ラウンドでは、スライダー（10円刻み）を使って以下の2項目に回答していただきます：
            </p>
            <div style="background: #f8f9fa; padding: 15px 25px; border-left: 5px solid #28a745; margin: 20px 0; font-size: 19px; line-height: 1.8;">
                <strong>① 【予測】相手は200円のうち、あなたに【何円】渡してくると思いますか？</strong><br>
                <strong>② 【選択】あなたは200円のうち、相手に【何円】渡しますか？</strong>
            </div>
            <p style="color: #dc3545; font-weight: bold; font-size: 20px; padding: 15px; border: 2px solid #dc3545; border-radius: 8px; background: #fff3f3; margin: 25px 0;">
                なお、ペアとなる相手は完全に匿名であり、実験中に「相手が何を選んだか」といった結果は画面上には提示されません。<br>
                あなたの選択が、あなた自身の報酬額にも、マッチングした参加者の報酬額にも影響します。実際に他の人とペアで意思決定を行っているつもりでお答えください。
            </p>
        </div>
    `
];

intro_pages_3.forEach(page => {
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

// --- 2. 条件の定義とランダマイズ (1.2倍, 1.5倍, 1.8倍) ---
const raw_multipliers = [1.2, 1.5, 1.8];
const shuffled_multipliers = jsPsych.randomization.shuffle(raw_multipliers);

// 相手のネーミング (Bさん、Cさん、Dさん)
const partner_names = ["Bさん", "Cさん", "Dさん"];

// --- 3. 各試行（1画面2スライダー）の構築 ---
shuffled_multipliers.forEach(function (mult, index) {
    const round_num = index + 1;
    const partner_name = partner_names[index];

    let badge_color = "#0056b3";
    if (mult === 1.5) badge_color = "#e65f00";
    if (mult === 1.8) badge_color = "#28a745";

    const trial = {
        type: 'survey-html-form',
        button_label: '回答を送信（非表示）',
        html: function () {
            const init_val = 0; // 初期値＝0円

            return `
                <div class="pd3-container" style="max-width: 850px; margin: 0 auto; text-align: left; font-family: sans-serif;">
                    
                    <!-- 大きくメリハリのある最上部倍率ヒーローカード -->
                    <div style="background: linear-gradient(135deg, #ffffff 0%, #f1f3f5 100%); border: 3px solid ${badge_color}; border-radius: 14px; padding: 20px 30px; margin-bottom: 25px; box-shadow: 0 6px 15px rgba(0,0,0,0.08); text-align: center;">
                        <div style="font-size: 20px; font-weight: bold; color: #666; letter-spacing: 1px; margin-bottom: 5px;">
                            ROUND ${round_num} / 3 （ペア：${partner_name}）
                        </div>
                        <div style="font-size: 36px; font-weight: 900; color: ${badge_color}; line-height: 1.2;">
                            このラウンドの倍率： <span style="font-size: 48px; text-decoration: underline;">${mult.toFixed(1)} 倍</span>
                        </div>
                        <div style="font-size: 16px; color: #555; margin-top: 8px;">
                            渡した金額は <strong>${mult.toFixed(1)} 倍</strong> に増えて相手に届きます （元手: お互いに 200 円）
                        </div>
                    </div>

                    <!-- 質問1: 予測 (0〜200円、10円刻み) -->
                    <div class="card-question" style="background: #fff; border: 2px solid #0056b3; border-radius: 12px; padding: 22px 28px; margin-bottom: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        <div style="font-size: 20px; font-weight: bold; color: #0056b3; margin-bottom: 14px;">
                            ①【予測】相手（${partner_name}）は200円のうち、あなたに【何円】渡してくると思いますか？
                        </div>
                        <div style="display: flex; align-items: center; gap: 20px; margin-top: 15px;">
                            <span style="font-size: 16px; font-weight: bold; min-width: 40px;">0円</span>
                            <input type="range" name="prediction" id="pred_range" min="0" max="200" value="${init_val}" step="10" 
                                style="flex-grow: 1; height: 12px; cursor: pointer;"
                                oninput="document.getElementById('pred_val').innerText = this.value + ' 円';">
                            <span style="font-size: 16px; font-weight: bold; min-width: 50px;">200円</span>
                        </div>
                        <!-- 目盛り表示 -->
                        <div style="display: flex; justify-content: space-between; margin: 4px 60px 0 60px; font-size: 13px; color: #888;">
                            <span>0円</span><span>50円</span><span>100円</span><span>150円</span><span>200円</span>
                        </div>
                        <div style="text-align: right; margin-top: 12px;">
                            <span style="font-size: 17px; color: #555;">あなたの予測: </span>
                            <span id="pred_val" style="font-size: 28px; font-weight: bold; color: #0056b3; display: inline-block; min-width: 90px;">${init_val} 円</span>
                        </div>
                    </div>

                    <!-- 質問2: 選択 (0〜200円、10円刻み) -->
                    <div class="card-question" style="background: #fff; border: 2px solid #28a745; border-radius: 12px; padding: 22px 28px; margin-bottom: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        <div style="font-size: 20px; font-weight: bold; color: #28a745; margin-bottom: 14px;">
                            ②【選択】あなたは200円のうち、相手（${partner_name}）に【何円】渡しますか？
                        </div>
                        <div style="display: flex; align-items: center; gap: 20px; margin-top: 15px;">
                            <span style="font-size: 16px; font-weight: bold; min-width: 40px;">0円</span>
                            <input type="range" name="choice" id="choice_range" min="0" max="200" value="${init_val}" step="10" 
                                style="flex-grow: 1; height: 12px; cursor: pointer;"
                                oninput="document.getElementById('choice_val').innerText = this.value + ' 円';">
                            <span style="font-size: 16px; font-weight: bold; min-width: 50px;">200円</span>
                        </div>
                        <!-- 目盛り表示 -->
                        <div style="display: flex; justify-content: space-between; margin: 4px 60px 0 60px; font-size: 13px; color: #888;">
                            <span>0円</span><span>50円</span><span>100円</span><span>150円</span><span>200円</span>
                        </div>
                        <div style="text-align: right; margin-top: 10px;">
                            <span style="font-size: 17px; color: #555;">あなたの選択: </span>
                            <span id="choice_val" style="font-size: 28px; font-weight: bold; color: #28a745; display: inline-block; min-width: 90px;">${init_val} 円</span>
                        </div>
                    </div>

                    <!-- 1段階目の回答確認ボタン -->
                    <div style="text-align: center; margin-top: 30px;">
                        <button type="button" id="confirm-btn" style="font-size: 26px; font-weight: bold; padding: 18px 60px; background-color: #0056b3; color: white; border: none; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.2); transition: transform 0.1s ease, background-color 0.2s ease;">
                            回答を確認する
                        </button>
                    </div>

                    <!-- 2段階目のポップアウト確認モーダル (transform:scaleの影響を防ぐためdocument.bodyに移動される) -->
                    <div id="modal-container" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.6); z-index: 999999; justify-content: center; align-items: center;">
                        <div style="background: #fff; padding: 30px; border-radius: 14px; max-width: 500px; width: 90%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); animation: modalFadeIn 0.25s ease-out; box-sizing: border-box; display: inline-block; vertical-align: middle;">
                            <div style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; border-bottom: 3px solid #0056b3; padding-bottom: 12px;">
                                回答内容の最終確認
                            </div>
                            <div style="font-size: 19px; line-height: 1.8; margin-bottom: 25px; text-align: left; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
                                <p style="margin: 5px 0;"><strong>予測:</strong> ${partner_name}はあなたに <span id="modal-pred-val" style="color: #0056b3; font-weight: bold; font-size: 22px;"></span> 円渡すと思う</p>
                                <p style="margin: 5px 0;"><strong>選択:</strong> あなたは${partner_name}に <span id="modal-choice-val" style="color: #28a745; font-weight: bold; font-size: 22px;"></span> 円渡す</p>
                            </div>
                            <p style="font-size: 18px; color: #dc3545; font-weight: bold; margin-bottom: 25px;">
                                この内容で送信して決定してもよろしいですか？
                            </p>
                            <div style="display: flex; justify-content: center; gap: 20px;">
                                <button type="button" id="modal-cancel-btn" style="background-color: #6c757d; color: white; border: none; padding: 14px 28px; font-size: 18px; font-weight: bold; border-radius: 8px; cursor: pointer; transition: background-color 0.2s;">修正する</button>
                                <button type="button" id="modal-confirm-btn" style="background-color: #28a745; color: white; border: none; padding: 14px 28px; font-size: 18px; font-weight: bold; border-radius: 8px; cursor: pointer; transition: background-color 0.2s; box-shadow: 0 4px 6px rgba(40,167,69,0.2);">決定する</button>
                            </div>
                        </div>
                    </div>

                    <!-- CSSアニメーション -->
                    <style>
                        @keyframes modalFadeIn {
                            from { transform: scale(0.92); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                        #jspsych-survey-html-form-next { display: none !important; }
                    </style>
                </div>
            `;
        },
        data: {
            task: 'pd_slider_trial',
            round: round_num,
            condition_multiplier: mult
        },
        on_start: function () {
            document.body.classList.remove('hide-cursor');
        },
        on_load: function () {
            var confirmBtn = document.getElementById('confirm-btn');
            var cancelBtn = document.getElementById('modal-cancel-btn');
            var modalConfirmBtn = document.getElementById('modal-confirm-btn');
            var modalContainer = document.getElementById('modal-container');

            // scale(transform)による全画面オーバーレイの枠崩れ・位置ずれを防ぐため document.body 直下に移動
            if (modalContainer && modalContainer.parentNode !== document.body) {
                document.body.appendChild(modalContainer);
            }

            if (confirmBtn) {
                confirmBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    var p = document.getElementById('pred_range').value;
                    var c = document.getElementById('choice_range').value;
                    var predElem = document.getElementById('modal-pred-val');
                    var choiceElem = document.getElementById('modal-choice-val');
                    if (predElem) predElem.innerText = p + " ";
                    if (choiceElem) choiceElem.innerText = c + " ";
                    if (modalContainer) modalContainer.style.display = 'flex';
                });
            }

            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() {
                    if (modalContainer) modalContainer.style.display = 'none';
                });
            }

            if (modalConfirmBtn) {
                modalConfirmBtn.addEventListener('click', function() {
                    if (modalContainer) {
                        modalContainer.style.display = 'none';
                        if (modalContainer.parentNode) {
                            modalContainer.parentNode.removeChild(modalContainer);
                        }
                    }
                    
                    var hiddenSubmit = document.createElement('input');
                    hiddenSubmit.type = 'submit';
                    hiddenSubmit.style.display = 'none';
                    var form = document.querySelector('form');
                    if (form) {
                        form.appendChild(hiddenSubmit);
                        hiddenSubmit.click();
                        form.removeChild(hiddenSubmit);
                    }
                });
            }
        },
        on_finish: function (data) {
            // 残留モーダル要素のクリーンアップ
            var modalContainer = document.getElementById('modal-container');
            if (modalContainer && modalContainer.parentNode) {
                modalContainer.parentNode.removeChild(modalContainer);
            }
            const resp = data.response || {};
            data.prediction_value = parseInt(resp.prediction || 0, 10);
            data.choice_value = parseInt(resp.choice || 0, 10);
            data.condition_multiplier = mult;
        }
    };

    timeline.push(sd_fixation);
    timeline.push(blank);
    timeline.push(trial);
});

// --- 4. 終了処理 ---
timeline.push({
    type: 'html-keyboard-response',
    stimulus: `
        <div class="instructions">
            <h2>実験終了</h2>
            <p>実験はこれで終了です。ご協力ありがとうございました。</p>
            <p style="margin-top:40px; font-weight: bold;">スペースキーを押してデータを送信・保存してください。</p>
        </div>
    `,
    choices: [' ']
});

timeline.push({
    type: 'fullscreen',
    fullscreen_mode: false
});

// jsPsych初期化
jsPsych.init({
    timeline: timeline,
    override_safe_mode: true,
    on_finish: function () {
        finishExperiment('Continuous_3');
    }
});
