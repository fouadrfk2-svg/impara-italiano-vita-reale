/* Arabic course pilot: only the declared lessons in this file are translated.
   Italian, answer keys and recordings remain in data/core/a1-01.js. */
LINGUAI.addStrings("ar", {
  "lesson:a1-u01-l1": {
    theme: "الحياة اليومية",
    title: "التحية وطلبك الأول في المقهى",
    objectives: [
      "إلقاء التحية والوداع بما يناسب وقت اليوم",
      "طلب القهوة بالطريقة المعتادة في إيطاليا",
      "تصريف الفعل essere في زمن الحاضر"
    ],
    theory: [
      {
        h: "اختر التحية بحسب وقت اليوم",
        p: "تُستخدم <bdi lang=\"it\" dir=\"ltr\"><strong>Buongiorno</strong></bdi> من الصباح حتى أوائل بعد الظهر. ثم ننتقل إلى <bdi lang=\"it\" dir=\"ltr\"><strong>buonasera</strong></bdi>، عادةً بين الثانية والخامسة عصرًا؛ ويختلف التوقيت قليلًا من منطقة إلى أخرى. لذلك يمكنك قولها عند دخول مقهى في السادسة مساءً. أمّا <bdi lang=\"it\" dir=\"ltr\"><strong>buonanotte</strong></bdi> فتعني «تصبح على خير»، وتُقال عند الوداع قبل النوم، لا عند اللقاء."
      },
      {
        h: "ليست Ciao الخيار المناسب دائمًا",
        p: "تعني <bdi lang=\"it\" dir=\"ltr\"><strong>Ciao</strong></bdi> «أهلًا» و«إلى اللقاء»، وهي تحية غير رسمية تُستخدم مع من تخاطبهم بضمير <bdi lang=\"it\" dir=\"ltr\"><em>tu</em></bdi>، مثل الأصدقاء والأقارب ومن تربطك بهم علاقة ودّية. أمّا مع نادل أو موظف أو صاحب متجر تقابله للمرة الأولى، فاختيار <bdi lang=\"it\" dir=\"ltr\"><strong>buongiorno</strong></bdi> أكثر لباقة. لا تفترض أن التحية غير الرسمية مناسبة لكل شخص لا تعرفه."
      },
      {
        contrast: "للمتحدّث بالعربية: انتبه إلى الفرق بين التحية والوداع. <bdi lang=\"it\" dir=\"ltr\"><em>Buonasera</em></bdi> تحية يمكن أن تبدأ في فترة بعد الظهر، أمّا <bdi lang=\"it\" dir=\"ltr\"><em>buonanotte</em></bdi> فليست تحية عند الدخول؛ معناها «تصبح على خير». كذلك نقول في العربية «أنا آنا» دون فعل في الحاضر، لكن الإيطالية تحتاج إلى الفعل: <bdi lang=\"it\" dir=\"ltr\">Sono Anna</bdi>."
      },
      {
        h: "Essere: فعل أساسي لتكوين الجملة",
        p: "الفعل <bdi lang=\"it\" dir=\"ltr\"><strong>essere</strong></bdi> يعني «يكون». نستخدمه للتعريف بالنفس والوصف، كما في «أنا آنا» أو «القهوة ساخنة». تصريفه غير منتظم، وأشكاله مثل <bdi lang=\"it\" dir=\"ltr\"><em>sono</em></bdi> و<bdi lang=\"it\" dir=\"ltr\"><em>sei</em></bdi> و<bdi lang=\"it\" dir=\"ltr\"><em>è</em></bdi> لا تُستنتج من قاعدة واحدة. تعلّمها مع الأمثلة؛ ستثبت تدريجيًا بكثرة الاستعمال."
      },
      {
        tip: "غالبًا ما نحذف ضمير الفاعل مثل <bdi lang=\"it\" dir=\"ltr\">io, tu, lui</bdi> لأن تصريف الفعل يوضّح المقصود. تكفي جملة <bdi lang=\"it\" dir=\"ltr\"><em>Sono americana</em></bdi> بمعنى «أنا أمريكية». وإضافة الضمير في <bdi lang=\"it\" dir=\"ltr\"><em>io sono americana</em></bdi> تؤكّد «أنا» أو تقابلها بشخص آخر."
      }
    ],
    grammar: {
      title: "الفعل essere (يكون) في زمن الحاضر",
      note: "انتبه إلى علامة النبر في <bdi lang=\"it\" dir=\"ltr\"><b>è</b></bdi>؛ فهي صيغة من الفعل «يكون». أمّا <bdi lang=\"it\" dir=\"ltr\"><em>e</em></bdi> من دون العلامة فتعني «و». إنهما كلمتان مختلفتان.",
      table: {
        head: ["الضمير", "تصريف الفعل", "المعنى بالعربية"],
        rows: [
          ["io", "sono", "أنا"],
          ["tu", "sei", "أنتَ / أنتِ (غير رسمي)"],
          ["lui / lei / Lei", "è", "هو / هي؛ حضرتك (للمخاطبة الرسمية)"],
          ["noi", "siamo", "نحن"],
          ["voi", "siete", "أنتم / أنتنّ"],
          ["loro", "sono", "هم / هنّ"]
        ]
      },
      examples: [
        { tr: "صباح الخير، قهوة من فضلك.", note: "عند طلب un caffè يُقصد عادةً الإسبريسو؛ لا تحتاج إلى تحديد ذلك." },
        { tr: "أنا آنا، تشرّفت بمعرفتك." },
        { tr: "هل أنت من روما؟" },
        { tr: "القهوة ساخنة." },
        { tr: "نحن متأخّرون." },
        { tr: "هم في المقهى." }
      ]
    },
    vocab: [
      "صباح الخير / نهارك سعيد (حتى أوائل بعد الظهر)",
      "مساء الخير (عادةً من الرابعة أو الخامسة عصرًا)",
      "تصبح على خير (للوداع قبل النوم فقط)",
      "أهلًا / إلى اللقاء (غير رسمي)",
      "إلى اللقاء (تحية وداع مهذّبة)",
      "من فضلك (عند طلب شيء)",
      "شكرًا",
      "عفوًا / لا شكر على واجب",
      "قهوة إسبريسو",
      "كابتشينو",
      "كرواسون إيطالي (كورنيتّو)",
      "مقهى",
      "تشرّفت بمعرفتك",
      "عفوًا / لو سمحت (للمخاطبة الرسمية)"
    ],
    dialogue: [
      "صباح الخير! تفضّل، ماذا تطلب؟",
      "صباح الخير. قهوة وكرواسون، من فضلك.",
      "حالًا. الحساب يوروان وخمسون سنتًا.",
      "تفضّل. شكرًا!",
      "عفوًا، أتمنّى لك يومًا سعيدًا!"
    ],
    culture: {
      title: "القهوة في إيطاليا: عادات من الحياة اليومية",
      text: "<p>من المعتاد في المقاهي الإيطالية شرب القهوة <b>وقوفًا عند المنضدة</b>، أي <bdi lang=\"it\" dir=\"ltr\">al banco</bdi>، خلال دقائق قليلة. وقد تكون الخدمة على الطاولة أغلى، وأحيانًا يبلغ سعرها الضعف. راجع قائمة الأسعار؛ فالوقوف والجلوس قد يكونان خدمتين بسعرين مختلفين.</p><p>يشرب كثير من الإيطاليين <b>الكابتشينو مع الإفطار</b>، ويتجنّبونه بعد الحادية عشرة أو بعد الغداء لأنهم يعدّون الحليب ثقيلًا. هذه عادة وليست قاعدة ملزمة. بعد الغداء يشيع طلب <bdi lang=\"it\" dir=\"ltr\"><i>un caffè</i></bdi> أو <bdi lang=\"it\" dir=\"ltr\"><i>un macchiato</i></bdi>، أي إسبريسو مع قليل من الحليب.</p><p>غالبًا تدفع <b>بعد</b> شرب القهوة. لكن إذا كان هناك صندوق للدفع قرب المدخل، فقد تحتاج إلى الدفع أولًا وأخذ الإيصال، <bdi lang=\"it\" dir=\"ltr\"><i>lo scontrino</i></bdi>، قبل استلام القهوة. اتبع طريقة المقهى الذي تزوره.</p>"
    },
    exercises: [
      {
        q: "تدخل مقهى في التاسعة والنصف صباحًا. ماذا تقول؟",
        opts: ["Buonasera", "Buongiorno", "Buonanotte"],
        why: "نقول <bdi lang=\"it\" dir=\"ltr\">Buongiorno</bdi> من الصباح حتى أوائل بعد الظهر. أمّا <bdi lang=\"it\" dir=\"ltr\">Buonanotte</bdi> فتُقال للوداع قبل النوم فقط."
      },
      {
        q: "النادل في نحو الستين، وأنت تقابله للمرة الأولى. أيّ تحية تناسب الموقف؟",
        opts: ["Ciao!", "Buongiorno!", "Buonanotte!"],
        why: "استخدم <bdi lang=\"it\" dir=\"ltr\">ciao</bdi> مع من تخاطبهم بطريقة غير رسمية. أمّا مع شخص لا تعرفه في المقهى، فاختر <bdi lang=\"it\" dir=\"ltr\">buongiorno</bdi>."
      },
      {
        tr: "اكتب التصريف كاملًا من الذاكرة، دون الرجوع إلى الجدول.",
        why: "الفعل <bdi lang=\"it\" dir=\"ltr\">essere</bdi> غير منتظم في جميع صيغه. احفظ تصريفه مع كل ضمير؛ فهو من الأفعال الأساسية التي ستستخدمها كثيرًا."
      },
      {
        q: "أكمل: <bdi lang=\"it\" dir=\"ltr\">Anna e Marco ___ italiani.</bdi> (آنا وماركو إيطاليان.)",
        hint: "صيغة الغائب للجمع: هم / هنّ",
        why: "الصيغة هي <bdi lang=\"it\" dir=\"ltr\">Loro sono</bdi>. تُستخدم <bdi lang=\"it\" dir=\"ltr\">sono</bdi> مع <bdi lang=\"it\" dir=\"ltr\"><b>io</b></bdi> وكذلك مع <bdi lang=\"it\" dir=\"ltr\"><b>loro</b></bdi>؛ والسياق يوضّح المقصود."
      },
      {
        q: "ترجم إلى الإيطالية: «أنا من بولندا.»",
        hint: "الفعل essere ثم da ثم اسم البلد",
        why: "نقول <bdi lang=\"it\" dir=\"ltr\">Sono dalla Polonia.</bdi> يسبق اسم البلد هنا أداة التعريف: <bdi lang=\"it\" dir=\"ltr\">la Polonia → dalla Polonia</bdi>."
      },
      {
        tr: "قهوة وكرواسون، من فضلك.",
        why: "اطلب ما تريد ثم أضف <bdi lang=\"it\" dir=\"ltr\"><i>per favore</i></bdi> بمعنى «من فضلك»."
      },
      {
        q: "صِل كل عبارة إيطالية بمعناها بالعربية.",
        pairs: ["شكرًا", "عفوًا", "لو سمحت (رسمي)", "إلى اللقاء"]
      },
      {
        tr: "مساء الخير، كابتشينو من فضلك.",
        why: "انتبه إلى الحرفين المضعّفين <bdi lang=\"it\" dir=\"ltr\"><b>cc</b></bdi> و<bdi lang=\"it\" dir=\"ltr\"><b>pp</b></bdi>؛ يُنطق الحرف المضعّف في الإيطالية أطول من الحرف المفرد."
      },
      {
        tr: "صباح الخير، قهوة من فضلك.",
        why: "يقع النبر في <bdi lang=\"it\" dir=\"ltr\">caffè</bdi> على المقطع الأخير، لا الأول: <bdi lang=\"it\" dir=\"ltr\">kaf-FEH</bdi>."
      }
    ]
  },
  "lesson:a1-u01-l2": {
    theme: "أساسيات القواعد",
    title: "مذكّر أم مؤنّث؟",
    objectives: [
      "الاستدلال على جنس الاسم من نهايته في الأنماط الشائعة",
      "تكوين الجمع بتغيير النهايات: o إلى i، وa إلى e، وe إلى i",
      "استعمال أسماء لا تتغيّر في الجمع، مثل il bar وla città"
    ],
    theory: [
      {
        h: "للأسماء في الإيطالية مذكّر ومؤنّث",
        p: "لكل اسم إيطالي جنس نحوي: مذكّر أو مؤنّث، حتى أسماء الأشياء. مثلًا، <bdi lang=\"it\" dir=\"ltr\"><em>il tavolo</em></bdi> (الطاولة) مذكّر، و<bdi lang=\"it\" dir=\"ltr\"><em>la sedia</em></bdi> (الكرسي) مؤنّث. لا تستنتج الجنس من معنى الشيء وحده؛ انتبه إلى نهاية الاسم وتعلّمه مع أداة التعريف."
      },
      {
        h: "ثلاثة أنماط شائعة للمفرد والجمع",
        list: [
          "الاسم المنتهي بـ<bdi lang=\"it\" dir=\"ltr\"><b>-o</b></bdi> غالبًا مذكّر، وتصبح نهايته في الجمع <bdi lang=\"it\" dir=\"ltr\"><b>-i</b></bdi>: <bdi lang=\"it\" dir=\"ltr\"><em>il libro → i libri</em></bdi> (الكتاب ← الكتب).",
          "الاسم المنتهي بـ<bdi lang=\"it\" dir=\"ltr\"><b>-a</b></bdi> غالبًا مؤنّث، وتصبح نهايته في الجمع <bdi lang=\"it\" dir=\"ltr\"><b>-e</b></bdi>: <bdi lang=\"it\" dir=\"ltr\"><em>la casa → le case</em></bdi> (البيت ← البيوت).",
          "الاسم المنتهي بـ<bdi lang=\"it\" dir=\"ltr\"><b>-e</b></bdi> قد يكون مذكّرًا أو مؤنّثًا، وتصبح نهايته في الجمع عادةً <bdi lang=\"it\" dir=\"ltr\"><b>-i</b></bdi>: <bdi lang=\"it\" dir=\"ltr\"><em>il fiore → i fiori</em></bdi> (الزهرة ← الزهور)، و<bdi lang=\"it\" dir=\"ltr\"><em>la chiave → le chiavi</em></bdi> (المفتاح ← المفاتيح)."
        ]
      },
      {
        trap: "هذه أنماط شائعة ولها استثناءات. خصوصًا مع نهاية <bdi lang=\"it\" dir=\"ltr\"><b>-e</b></bdi>، لا تكشف النهاية وحدها جنس الاسم. احفظ أداة التعريف معه: تعلّم <bdi lang=\"it\" dir=\"ltr\"><b>il fiore</b></bdi>، لا الكلمة وحدها."
      },
      {
        h: "أسماء تبقى كما هي في المفرد والجمع",
        p: "الأسماء التي تنتهي بحرف متحرّك عليه نبر مكتوب، مثل <bdi lang=\"it\" dir=\"ltr\"><em>la città</em></bdi> و<bdi lang=\"it\" dir=\"ltr\"><em>il caffè</em></bdi>، وكلمات دخيلة مثل <bdi lang=\"it\" dir=\"ltr\"><em>il bar</em></bdi> و<bdi lang=\"it\" dir=\"ltr\"><em>lo sport</em></bdi> و<bdi lang=\"it\" dir=\"ltr\"><em>il film</em></bdi>، لا تتغيّر في الجمع. تساعدك الأداة أو كلمة العدد على فهم المقصود: <bdi lang=\"it\" dir=\"ltr\"><em>la città → le città</em></bdi> (المدينة ← المدن)."
      },
      {
        contrast: "العربية والإيطالية تميّزان المذكّر والمؤنّث، لكن جنس الكلمة قد يختلف بينهما. «طاولة» مؤنّثة بالعربية، أمّا <bdi lang=\"it\" dir=\"ltr\"><em>il tavolo</em></bdi> فمذكّر بالإيطالية. و«مفتاح» مذكّر بالعربية، أمّا <bdi lang=\"it\" dir=\"ltr\"><em>la chiave</em></bdi> فمؤنّث. لذلك لا تنقل الجنس من العربية؛ تعلّم كل اسم مع أداته. كذلك لا توجد صيغة خاصّة للمثنّى في الإيطالية؛ نستخدم الجمع لاثنين فأكثر."
      }
    ],
    grammar: {
      title: "جنس الاسم وجمعه",
      table: {
        head: ["النمط", "المفرد", "الجمع", "المعنى بالعربية"],
        rows: [
          ["مذكّر: <bdi lang=\"it\" dir=\"ltr\">-o → -i</bdi>", "il libro", "i libri", "الكتاب / الكتب"],
          ["مؤنّث: <bdi lang=\"it\" dir=\"ltr\">-a → -e</bdi>", "la ragazza", "le ragazze", "الفتاة / الفتيات"],
          ["مذكّر: <bdi lang=\"it\" dir=\"ltr\">-e → -i</bdi>", "il ristorante", "i ristoranti", "المطعم / المطاعم"],
          ["مؤنّث: <bdi lang=\"it\" dir=\"ltr\">-e → -i</bdi>", "la stazione", "le stazioni", "المحطة / المحطات"],
          ["اسم لا تتغيّر صيغته", "la città", "le città", "المدينة / المدن"],
          ["كلمة دخيلة لا تتغيّر صيغتها", "il bar", "i bar", "المقهى / المقاهي"]
        ]
      },
      examples: [
        { tr: "الكرواسون لذيذ." },
        { tr: "قطع الكرواسون لذيذة.", note: "تتغيّر نهاية الصفة الإيطالية أيضًا عند الجمع." },
        { tr: "المحطة قريبة.", note: "الاسم stazione مؤنّث، مع أنّ نهايته e؛ أداة la تدلّ على ذلك." },
        { tr: "فنجانا قهوة، من فضلك.", note: "تبقى كلمة caffè كما هي؛ العدد يوضّح أننا نطلب فنجانين." }
      ]
    },
    vocab: [
      "كتاب", "بيت", "طاولة", "كرسي", "مطعم", "محطة", "مفتاح", "زهرة", "مدينة",
      "قهوة؛ وقد تعني مقهى بحسب السياق", "رياضة", "فيلم", "ليل", "يوم / نهار"
    ],
    exercises: [
      {
        q: "أيّ اسم من هذه الأسماء مؤنّث في الإيطالية؟",
        opts: ["il tavolo", "la chiave", "il fiore"],
        why: "الجواب هو <bdi lang=\"it\" dir=\"ltr\"><i>la chiave</i></bdi>. نعرف الجنس من الأداة؛ فنهاية <bdi lang=\"it\" dir=\"ltr\">-e</bdi> وحدها لا تخبرنا هل الاسم مذكّر أم مؤنّث."
      },
      {
        q: "أكمل أداة التعريف في الجمع: <bdi lang=\"it\" dir=\"ltr\">la ragazza → ___ ragazze</bdi> (الفتاة ← الفتيات).",
        why: "أداة التعريف لجمع المؤنّث هي <bdi lang=\"it\" dir=\"ltr\"><b>le</b></bdi>."
      },
      {
        q: "حوّل الاسم إلى الجمع: <bdi lang=\"it\" dir=\"ltr\">il ristorante → i ___</bdi> (المطعم ← المطاعم).",
        hint: "غيّر النهاية e إلى i.",
        why: "هنا تتغيّر نهاية الاسم من <bdi lang=\"it\" dir=\"ltr\">-e</bdi> إلى <bdi lang=\"it\" dir=\"ltr\">-i</bdi>، فيصبح <bdi lang=\"it\" dir=\"ltr\">ristoranti</bdi>. هذا هو النمط الشائع للأسماء المنتهية بـe، سواء أكانت مذكّرة أم مؤنّثة."
      },
      {
        q: "اختر أداة التعريف الصحيحة لكل اسم مفرد.",
        why: "احفظ جنس الاسم مع أداته، خصوصًا الأسماء المنتهية بـ<bdi lang=\"it\" dir=\"ltr\">-e</bdi>؛ فالنهاية وحدها لا تكفي لتحديد الجنس.",
        items: ["كتاب", "بيت", "محطة", "مطعم", "مفتاح", "يوم"]
      },
      {
        q: "كم فنجان قهوة تطلب عندما تقول <bdi lang=\"it\" dir=\"ltr\">due caffè</bdi>؟",
        opts: ["فنجان واحد", "فنجانان", "لا يمكن تحديد العدد"],
        why: "كلمة <bdi lang=\"it\" dir=\"ltr\">caffè</bdi> لا تتغيّر في الجمع؛ وكلمة <bdi lang=\"it\" dir=\"ltr\">due</bdi> تعني «اثنين». ويمكن للأداة أيضًا أن توضّح العدد: <bdi lang=\"it\" dir=\"ltr\"><i>il caffè / i caffè</i></bdi>."
      },
      {
        q: "اختر كل الأسماء التي تبقى صيغتها كما هي في الجمع.",
        opts: ["la città", "il libro", "il bar", "la sedia", "lo sport"],
        why: "لا تتغيّر <bdi lang=\"it\" dir=\"ltr\">città</bdi> لأنها تنتهي بحرف متحرّك منبور، ولا تتغيّر الكلمتان الدخيلتان <bdi lang=\"it\" dir=\"ltr\">bar</bdi> و<bdi lang=\"it\" dir=\"ltr\">sport</bdi>."
      },
      { tr: "المطعم مغلق.", why: "ترتيب هذه الجملة: أداة تعريف، ثم اسم، ثم فعل، ثم صفة." },
      { tr: "المفاتيح على الطاولة." },
      { tr: "المدينة جميلة جدًا.", why: "يقع النبر في <bdi lang=\"it\" dir=\"ltr\">città</bdi> على المقطع الأخير: <bdi lang=\"it\" dir=\"ltr\">chee-TAH</bdi>." }
    ]
  },
  "lesson:a1-u01-l3": {
    theme: "أساسيات القواعد",
    title: "أدوات التعريف والتنكير",
    objectives: [
      "اختيار أداة التعريف المناسبة بحسب جنس الاسم وعدده وبداية نطقه",
      "التمييز بين شيء محدّد وشيء غير محدّد باستعمال il وun",
      "استعمال lo وgli في المواضع المناسبة"
    ],
    theory: [
      {
        h: "أداة قصيرة تعطيك أكثر من معلومة",
        p: "تأتي الأداة قبل الاسم. وتبيّن هل الاسم مذكّر أم مؤنّث، ومفرد أم جمع، وهل المقصود شيء محدّد يعرفه المتحدّث والسامع. في <bdi lang=\"it\" dir=\"ltr\"><em>Vorrei un caffè</em></bdi> نطلب قهوة غير محدّدة. أمّا <bdi lang=\"it\" dir=\"ltr\"><em>Dov'è il caffè?</em></bdi> فالسؤال عن قهوة معيّنة نعرف أيّها المقصود. تشبه أداة التعريف «الـ» في العربية، لكن صورتها في الإيطالية تتغيّر مع الاسم."
      },
      {
        h: "أداة المذكّر تتغيّر بحسب بداية الاسم",
        p: "نستعمل <bdi lang=\"it\" dir=\"ltr\"><strong>il</strong></bdi> قبل الاسم المذكّر الذي يبدأ بحرف ساكن عادي. ونستعمل <bdi lang=\"it\" dir=\"ltr\"><strong>lo</strong></bdi> قبل <bdi lang=\"it\" dir=\"ltr\"><em>s</em></bdi> متبوعة بحرف ساكن، مثل <bdi lang=\"it\" dir=\"ltr\"><em>lo studente</em></bdi>، وكذلك قبل بدايات مثل <bdi lang=\"it\" dir=\"ltr\"><em>z, gn, ps, y, x</em></bdi>. وقبل حرف متحرّك نستعمل <bdi lang=\"it\" dir=\"ltr\"><strong>l'</strong></bdi>. الحروف المتحرّكة هي <bdi lang=\"it\" dir=\"ltr\">a, e, i, o, u</bdi>. هذه صيغ مختلفة للأداة بحسب نطق بداية الاسم؛ فلا نختار بينها عشوائيًا."
      },
      {
        h: "أدوات التعريف في الجمع",
        list: [
          "للمذكّر: <bdi lang=\"it\" dir=\"ltr\"><b>il → i</b></bdi>، مثل <bdi lang=\"it\" dir=\"ltr\"><em>il libro → i libri</em></bdi>.",
          "للمذكّر: <bdi lang=\"it\" dir=\"ltr\"><b>lo / l' → gli</b></bdi>، مثل <bdi lang=\"it\" dir=\"ltr\"><em>lo studente → gli studenti</em></bdi> و<bdi lang=\"it\" dir=\"ltr\"><em>l'amico → gli amici</em></bdi>.",
          "للمؤنّث: <bdi lang=\"it\" dir=\"ltr\"><b>la / l' → le</b></bdi>، مثل <bdi lang=\"it\" dir=\"ltr\"><em>la casa → le case</em></bdi> و<bdi lang=\"it\" dir=\"ltr\"><em>l'amica → le amiche</em></bdi>."
        ]
      },
      {
        h: "أداة التنكير: شيء غير محدّد",
        p: "للمذكّر نستخدم <bdi lang=\"it\" dir=\"ltr\"><strong>un</strong></bdi> قبل حرف ساكن عادي أو حرف متحرّك: <bdi lang=\"it\" dir=\"ltr\"><em>un libro</em></bdi> و<bdi lang=\"it\" dir=\"ltr\"><em>un amico</em></bdi>، بلا فاصلة عليا. ونستخدم <bdi lang=\"it\" dir=\"ltr\"><strong>uno</strong></bdi> في المواضع التي تستعمل فيها <bdi lang=\"it\" dir=\"ltr\"><em>lo</em></bdi>، مثل <bdi lang=\"it\" dir=\"ltr\"><em>uno studente</em></bdi>. وللمؤنّث نستخدم <bdi lang=\"it\" dir=\"ltr\"><strong>una</strong></bdi> قبل حرف ساكن، و<bdi lang=\"it\" dir=\"ltr\"><strong>un'</strong></bdi> قبل حرف متحرّك، مثل <bdi lang=\"it\" dir=\"ltr\"><em>un'amica</em></bdi>."
      },
      {
        trap: "قارن بين <bdi lang=\"it\" dir=\"ltr\"><b>un amico</b></bdi> (صديق، بلا فاصلة عليا) و<bdi lang=\"it\" dir=\"ltr\"><b>un'amica</b></bdi> (صديقة، مع فاصلة عليا). لاحظ نهاية الاسم أيضًا: <bdi lang=\"it\" dir=\"ltr\">-o</bdi> للمذكّر هنا و<bdi lang=\"it\" dir=\"ltr\">-a</bdi> للمؤنّث؛ فالفاصلة ليست الفرق الوحيد. في العربية نقول «صديق» و«صديقة» بلا كلمة منفصلة للتنكير، لكن الإيطالية تحتاج هنا إلى <bdi lang=\"it\" dir=\"ltr\">un</bdi> أو <bdi lang=\"it\" dir=\"ltr\">un'</bdi>. احفظ الأداة مع الاسم، ولا تكتب فاصلة عليا بعد <bdi lang=\"it\" dir=\"ltr\">un</bdi> المذكّرة."
      }
    ],
    grammar: {
      title: "جدول أدوات التعريف والتنكير",
      table: {
        head: ["بداية الاسم وجنسه", "المفرد المعرّف", "الجمع المعرّف", "المفرد النكرة"],
        rows: [
          ["مذكّر + حرف ساكن عادي", "il treno", "i treni", "un treno"],
          ["مذكّر + s ثم ساكن، أو z أو gn أو ps", "lo studente, lo zaino", "gli studenti", "uno studente"],
          ["مذكّر + حرف متحرّك", "l'amico", "gli amici", "un amico"],
          ["مؤنّث + حرف ساكن", "la casa", "le case", "una casa"],
          ["مؤنّث + حرف متحرّك", "l'amica", "le amiche", "un'amica"]
        ]
      },
      examples: [
        { tr: "أودّ قهوة.", note: "طلب قهوة غير محدّدة؛ لذلك نستخدم أداة التنكير un." },
        { tr: "القهوة باردة.", note: "نتحدّث عن قهوة محدّدة؛ لذلك نستخدم أداة التعريف il." },
        { tr: "حقيبة الظهر ثقيلة.", note: "الاسم مذكّر ويبدأ بـz، لذلك نستخدم lo." },
        { tr: "الطلاب متأخّرون." },
        { tr: "صديقة من روما.", note: "اسم مؤنّث يبدأ بحرف متحرّك؛ لذلك نستخدم un' مع الفاصلة العليا." }
      ]
    },
    vocab: [
      "طالب / طالبة", "حقيبة ظهر", "صديق / صديقة", "قطار", "مرآة", "سكّر", "ماء", "كوب", "زجاجة", "فندق", "أخصّائي نفسي", "الناس (اسم مفرد مؤنّث في الإيطالية، ويأخذ فعلًا مفردًا)"
    ],
    exercises: [
      {
        q: "أيّ أداة تعريف تناسب <bdi lang=\"it\" dir=\"ltr\">zucchero</bdi> (سكّر)؟",
        opts: ["il", "lo", "l'"],
        why: "الاسم مذكّر ويبدأ بـ<bdi lang=\"it\" dir=\"ltr\"><b>z</b></bdi>، لذلك نستخدم <bdi lang=\"it\" dir=\"ltr\">lo</bdi>: <bdi lang=\"it\" dir=\"ltr\"><i>lo zucchero</i></bdi>، مثل <bdi lang=\"it\" dir=\"ltr\"><i>lo zaino</i></bdi>."
      },
      {
        q: "ما جمع <bdi lang=\"it\" dir=\"ltr\">lo specchio</bdi> (المرآة)؟",
        opts: ["i specchi", "gli specchi", "le specchie"],
        why: "تتحوّل أداة التعريف <bdi lang=\"it\" dir=\"ltr\">lo</bdi> في الجمع إلى <bdi lang=\"it\" dir=\"ltr\"><b>gli</b></bdi>."
      },
      {
        q: "اختر أداة التعريف الصحيحة لكل اسم.",
        why: "يعتمد الاختيار على جنس الاسم وبداية نطقه معًا.",
        items: ["قطار", "طالب", "صديقة", "ماء", "زجاجة", "حقيبة ظهر"]
      },
      {
        q: "أكمل: <bdi lang=\"it\" dir=\"ltr\">Ho ___ amica a Milano.</bdi> (لديّ صديقة في ميلانو.)",
        hint: "أداة تنكير لمؤنّث يبدأ بحرف متحرّك؛ انتبه إلى الفاصلة العليا.",
        why: "نكتب <bdi lang=\"it\" dir=\"ltr\">un'amica</bdi> مع الفاصلة العليا. أمّا <bdi lang=\"it\" dir=\"ltr\"><i>un amico</i></bdi> فهو صديق مذكّر، بلا فاصلة؛ وتتغيّر نهاية الاسم أيضًا."
      },
      {
        q: "أكمل: <bdi lang=\"it\" dir=\"ltr\">___ studenti sono bravi.</bdi> (الطلاب مجتهدون.)",
        why: "الأداة في المفرد هي <bdi lang=\"it\" dir=\"ltr\">lo</bdi>، وفي الجمع نستعمل <bdi lang=\"it\" dir=\"ltr\">gli studenti</bdi>."
      },
      {
        q: "ما الفرق بين <bdi lang=\"it\" dir=\"ltr\">Vorrei il caffè</bdi> و<bdi lang=\"it\" dir=\"ltr\">Vorrei un caffè</bdi>؟",
        opts: [
          "لا فرق؛ العبارتان بالمعنى نفسه.",
          "<bdi lang=\"it\" dir=\"ltr\">Il</bdi> = قهوة معيّنة سبق ذكرها؛ <bdi lang=\"it\" dir=\"ltr\">un</bdi> = قهوة غير محدّدة.",
          "<bdi lang=\"it\" dir=\"ltr\">Il</bdi> أكثر تهذيبًا."
        ],
        why: "أداة التعريف تفترض أن السامع يعرف أيّ قهوة تقصد. أمّا عند طلب قهوة في المقهى فنقول عادةً <bdi lang=\"it\" dir=\"ltr\"><i>un caffè</i></bdi>."
      },
      {
        q: "صِل كل مثال بسبب اختيار أداة التعريف فيه.",
        pairs: ["اسم مذكّر يبدأ بـps", "اسم مذكّر يبدأ بحرف متحرّك", "اسم مذكّر يبدأ بحرف ساكن عادي", "اسم مؤنّث"]
      },
      {
        tr: "حقيبة ظهر الطالب ثقيلة.",
        why: "الصيغة <bdi lang=\"it\" dir=\"ltr\">Dello</bdi> تجمع <bdi lang=\"it\" dir=\"ltr\">di + lo</bdi>. هنا تدلّ على أن الحقيبة للطالب؛ فحرف الجر يندمج مع أداة التعريف أيضًا."
      },
      { tr: "الطلاب في الجامعة." }
    ]
  },
  "unit:a1-u01": {
    "title": "التحية وحديث المقهى",
    "grammarNote": "التحية والسؤال عن الحال · الفعلان essere وstare · جنس الاسم وجمعه وأدواته"
  },
  "lesson:a1-u01-l4": {
    "theme": "الحياة اليومية",
    "title": "كيف حالك؟ المخاطبة الودّية والمهذّبة",
    "objectives": [
      "السؤال عن الحال والردّ بطريقة ودّية أو رسمية",
      "تصريف الفعل stare في الحاضر",
      "التمييز بين المخاطبة بـtu والمخاطبة بـLei"
    ],
    "theory": [
      {
        "h": "طريقتان لمخاطبة شخص واحد",
        "p": "نستخدم <bdi lang=\"it\" dir=\"ltr\"><b>tu</b></bdi> مع الأصدقاء ومن نخاطبهم بودّ، ونستخدم <bdi lang=\"it\" dir=\"ltr\"><b>Lei</b></bdi> للمخاطبة الرسمية أو المهذّبة. تُستعمل <bdi lang=\"it\" dir=\"ltr\">Lei</bdi> مع الرجل والمرأة معًا، ويأتي فعلها بصيغة الغائب المفرد: <bdi lang=\"it\" dir=\"ltr\"><em>Come sta?</em></bdi> أي «كيف حال حضرتك؟». وقد تُكتب بحرف كبير لتمييزها عن <bdi lang=\"it\" dir=\"ltr\">lei</bdi> بمعنى «هي». ليست <bdi lang=\"it\" dir=\"ltr\">Lei</bdi> جمعًا."
      },
      {
        "h": "متى ننتقل إلى tu؟",
        "p": "عند مقابلة شخص لا تعرفه في مكتب أو مصرف أو عيادة، البدء بـ<bdi lang=\"it\" dir=\"ltr\">Lei</bdi> اختيار مهذّب. وبين الأصدقاء أو الزملاء قد تكون <bdi lang=\"it\" dir=\"ltr\">tu</bdi> أنسب. يمكنك أن تسأل: <bdi lang=\"it\" dir=\"ltr\"><em>Possiamo darci del tu?</em></bdi> أي «هل يمكننا أن نتخاطب بطريقة غير رسمية؟». غالبًا يبادر الشخص الأكبر سنًّا أو الأعلى منصبًا، لكن الأمر يتغيّر بحسب العلاقة والمكان."
      },
      {
        "h": "احفظ السؤال والجواب معًا",
        "p": "للسؤال عن الحال نقول <bdi lang=\"it\" dir=\"ltr\"><b>Come stai?</b></bdi>، وللردّ «أنا بخير» نقول <bdi lang=\"it\" dir=\"ltr\"><b>Sto bene.</b></bdi>. الفعل هنا هو <bdi lang=\"it\" dir=\"ltr\">stare</bdi>، لا <bdi lang=\"it\" dir=\"ltr\">essere</bdi>؛ فلا تقل <bdi lang=\"it\" dir=\"ltr\"><em>Sono bene.</em></bdi>. ومن الردود المفيدة <bdi lang=\"it\" dir=\"ltr\"><em>Non c’è male.</em></bdi> «لا بأس» و<bdi lang=\"it\" dir=\"ltr\"><em>Così così.</em></bdi> «حالتي متوسّطة»."
      },
      {
        "contrast": "نقول في العربية «أنا بخير» دون فعل في الحاضر، لكن الإيطالية تحتاج هنا إلى فعل مصرّف: <bdi lang=\"it\" dir=\"ltr\"><b>sto bene</b></bdi>. اربط الصيغتين: <bdi lang=\"it\" dir=\"ltr\">tu → stai</bdi> و<bdi lang=\"it\" dir=\"ltr\">Lei → sta</bdi>. ولا تعمّم ذلك على كل وصف للحالة؛ فمثلًا «أنا متعب» هي <bdi lang=\"it\" dir=\"ltr\"><em>Sono stanco.</em></bdi> للرجل، و<bdi lang=\"it\" dir=\"ltr\"><em>Sono stanca.</em></bdi> للمرأة."
      }
    ],
    "grammar": {
      "title": "الفعل stare: الحال والبقاء — الحاضر",
      "table": {
        "head": [
          "الضمير",
          "التصريف",
          "مثال"
        ],
        "rows": [
          [
            "io",
            "sto",
            "Sto bene, grazie."
          ],
          [
            "tu",
            "stai",
            "Come stai?"
          ],
          [
            "lui / lei / Lei",
            "sta",
            "Come sta, signora?"
          ],
          [
            "noi",
            "stiamo",
            "Stiamo bene."
          ],
          [
            "voi",
            "state",
            "Come state?"
          ],
          [
            "loro",
            "stanno",
            "Stanno male."
          ]
        ]
      },
      "examples": [
        {
          "tr": "أهلًا ماركو، كيف حالك؟",
          "note": "مخاطبة غير رسمية"
        },
        {
          "tr": "صباح الخير، كيف حال حضرتك؟",
          "note": "مخاطبة مهذّبة"
        },
        {
          "tr": "أنا بخير، شكرًا. وأنت؟"
        },
        {
          "tr": "لا بأس.",
          "note": "ردّ شائع على السؤال عن الحال"
        },
        {
          "tr": "حالتي متوسّطة؛ لست بخير تمامًا ولا بسوء."
        },
        {
          "tr": "هل يمكننا أن نتخاطب بطريقة غير رسمية؟"
        }
      ]
    },
    "vocab": [
      "كيف حالك؟ (غير رسمي)",
      "كيف حال حضرتك؟ (رسمي)",
      "أنا بخير",
      "لست بخير",
      "لا بأس",
      "حالتي متوسّطة",
      "وأنت؟ / وحضرتك؟",
      "بخير جدًا",
      "متعب قليلًا / متعبة قليلًا",
      "السيّد / السيّدة",
      "إلى لقاء قريب",
      "أراك لاحقًا"
    ],
    "dialogue": [
      "أهلًا جوليا! كيف حالك؟",
      "أهلًا! بخير جدًا، وأنت؟",
      "متعب قليلًا، لكنني بخير. أراك لاحقًا!",
      "صباح الخير سيّدتي، كيف حال حضرتك؟",
      "لا بأس، شكرًا. وحضرتك؟"
    ],
    "exercises": [
      {
        "q": "تسأل شخصًا عن حاله وتخاطبه بـLei. أيّ جملة صحيحة؟",
        "opts": [
          "Come stai?",
          "Come sta?",
          "Come state?"
        ],
        "why": "نستخدم مع <bdi lang=\"it\" dir=\"ltr\">Lei</bdi> صيغة الغائب المفرد: <bdi lang=\"it\" dir=\"ltr\"><i>Come sta?</i></bdi>."
      },
      {
        "q": "أيّ جملة من هذه الجمل غير صحيحة؟",
        "opts": [
          "Sto bene.",
          "Sono bene.",
          "Non c'è male."
        ],
        "why": "للقول «أنا بخير» نستخدم <bdi lang=\"it\" dir=\"ltr\"><b>Sto bene.</b></bdi>، ولا نقول <bdi lang=\"it\" dir=\"ltr\"><i>Sono bene.</i></bdi>."
      },
      {
        "tr": "صرّف stare مع: أنا، أنت، هو/هي، أنتم.",
        "why": "الفعل <bdi lang=\"it\" dir=\"ltr\">stare</bdi> غير منتظم في المفرد وفي صيغة <bdi lang=\"it\" dir=\"ltr\">loro: stanno</bdi>."
      },
      {
        "q": "أكمل: <bdi lang=\"it\" dir=\"ltr\">Come ___, ragazzi?</bdi> (كيف حالكم يا شباب؟)",
        "why": "نخاطب مجموعة، لذلك نستخدم صيغة <bdi lang=\"it\" dir=\"ltr\">voi: state</bdi>."
      },
      {
        "q": "ترجم إلى الإيطالية مخاطبًا صديقًا: «أنا بخير، شكرًا. وأنت؟»",
        "why": "للردّ على صديق نقول <bdi lang=\"it\" dir=\"ltr\">Sto bene, grazie. E tu?</bdi>."
      },
      {
        "q": "أنت في مقهى الحيّ. النادل يعرفك منذ سنوات ويحيّيك أولًا.",
        "setting": "مقهى الحيّ، الساعة الثامنة صباحًا.",
        "lines": [
          {
            "tr": "أهلًا! كيف حالك هذا الصباح؟"
          },
          {
            "tr": "قل إنك بخير، ثم اسأله عن حاله.",
            "answerTr": "أنا بخير، وأنت؟"
          },
          {
            "tr": "بخير جدًا! قهوتك المعتادة؟"
          },
          {
            "tr": "وافق واشكره.",
            "answerTr": "نعم، شكرًا!"
          }
        ]
      },
      {
        "q": "صِل كل ردّ بمعناه.",
        "pairs": [
          "بخير جدًا",
          "لا بأس",
          "حالتي متوسّطة",
          "لست بخير"
        ]
      },
      {
        "tr": "مساء الخير سيّدتي، كيف حال حضرتك؟"
      },
      {
        "tr": "لا بأس، شكرًا. وحضرتك؟"
      }
    ]
  },
  "lesson:a1-u01-test": {
    "theme": "اختبار",
    "title": "اختبار الوحدة الأولى",
    "objectives": [
      "مراجعة التحية والفعلين essere وstare وجنس الاسم وأدوات التعريف"
    ],
    "theory": [
      {
        "p": "عشرة أسئلة على موضوعات الوحدة. تنجح عند الإجابة الصحيحة عن 70٪ على الأقل. جرّب من الذاكرة؛ وإذا نسيت شيئًا، فارجع إلى شرحه وراجعه."
      }
    ],
    "exercises": [
      {
        "q": "تدخل متجرًا في السادسة والنصف مساءً. ماذا تقول؟",
        "opts": [
          "Buongiorno",
          "Buonasera",
          "Buonanotte"
        ],
        "why": "في هذا الوقت نقول <bdi lang=\"it\" dir=\"ltr\">Buonasera</bdi>. يبدأ استعمالها عادةً في فترة بعد الظهر أو نحو الرابعة أو الخامسة، بحسب المنطقة."
      },
      {
        "q": "أكمل: <bdi lang=\"it\" dir=\"ltr\">Noi ___ in ritardo.</bdi> (نحن متأخّرون.)",
        "why": "نحتاج إلى تصريف <bdi lang=\"it\" dir=\"ltr\">essere</bdi> مع <bdi lang=\"it\" dir=\"ltr\">noi: siamo</bdi>."
      },
      {
        "q": "أكمل: <bdi lang=\"it\" dir=\"ltr\">Come ___?</bdi> وأنت تسأل صديقتك عن حالها.",
        "why": "نخاطب صديقة بـ<bdi lang=\"it\" dir=\"ltr\">tu</bdi>، فتصريف <bdi lang=\"it\" dir=\"ltr\">stare</bdi> هو <bdi lang=\"it\" dir=\"ltr\">stai</bdi>."
      },
      {
        "q": "اختر أداة التعريف المناسبة لكل اسم.",
        "items": [
          "حقيبة ظهر",
          "صديقة",
          "محطة",
          "قطار"
        ]
      },
      {
        "q": "ما جمع <bdi lang=\"it\" dir=\"ltr\">l’amico</bdi> (الصديق)؟",
        "opts": [
          "gli amici",
          "i amici",
          "le amiche"
        ],
        "why": "تتحوّل <bdi lang=\"it\" dir=\"ltr\">l’</bdi> المذكّرة في الجمع إلى <bdi lang=\"it\" dir=\"ltr\">gli</bdi>: <bdi lang=\"it\" dir=\"ltr\">gli amici</bdi>."
      },
      {
        "q": "اختر كل الأسماء التي لا تتغيّر صيغتها في الجمع.",
        "opts": [
          "il caffè",
          "la sedia",
          "il bar",
          "la città"
        ]
      },
      {
        "q": "ترجم إلى الإيطالية: «ماء، من فضلك.»",
        "why": "يمكن أن نقول <bdi lang=\"it\" dir=\"ltr\">Un’acqua, per favore.</bdi>؛ فكلمة <bdi lang=\"it\" dir=\"ltr\">acqua</bdi> مؤنّثة وتبدأ بحرف متحرّك، لذلك نكتب <bdi lang=\"it\" dir=\"ltr\">un’</bdi> مع الفاصلة العليا."
      },
      {
        "tr": "الطلاب في المقهى."
      },
      {
        "tr": "فنجانا قهوة وكرواسون، من فضلك."
      },
      {
        "tr": "صباح الخير، كيف حال حضرتك؟"
      }
    ]
  },
  "unit:a1-u02": {
    "title": "التعارف والتعريف بالنفس",
    "grammarNote": "الاسم والأصل والسكن · العمر والأعداد · المهن والأفعال المنتهية بـ\u2066-are\u2069"
  },
  "lesson:a1-u02-l1": {
    "theme": "التعارف",
    "title": "اسمي… التعريف بالنفس",
    "objectives": [
      "ذكر اسمك والمدينة التي تنحدر منها ومكان سكنك",
      "استعمال الفعل chiamarsi مع الضمير المناسب",
      "سؤال شخص آخر عن اسمه وأصله وسكنه"
    ],
    "theory": [
      {
        "h": "كيف تقول «اسمي»؟",
        "p": "الصيغة <bdi lang=\"it\" dir=\"ltr\"><b>Mi chiamo…</b></bdi> تعني «اسمي…»، وحرفيًا «أُسمّي نفسي…». الفعل هو <bdi lang=\"it\" dir=\"ltr\">chiamarsi</bdi>، ويأتي معه ضمير قصير <b>قبل الفعل</b>: <bdi lang=\"it\" dir=\"ltr\">mi, ti, si, ci, vi, si</bdi>. احفظ <bdi lang=\"it\" dir=\"ltr\"><em>Come ti chiami? — Mi chiamo Anna.</em></bdi> أي «ما اسمك؟ — اسمي آنا»."
      },
      {
        "h": "مدينة الأصل وبلد الأصل",
        "p": "مع مدينة الأصل نستخدم <bdi lang=\"it\" dir=\"ltr\"><b>essere di</b></bdi>، مثل <bdi lang=\"it\" dir=\"ltr\"><em>Sono di Cracovia.</em></bdi> «أنا من كراكوف». ومع البلد يمكنك استعمال <bdi lang=\"it\" dir=\"ltr\"><b>venire da</b></bdi>، مثل <bdi lang=\"it\" dir=\"ltr\"><em>Vengo dalla Polonia.</em></bdi> «أنا من بولندا»، أو ذكر الجنسية: <bdi lang=\"it\" dir=\"ltr\"><em>Sono polacca.</em></bdi> «أنا بولندية». تأتي أسماء بلدان كثيرة مع أداة، مثل <bdi lang=\"it\" dir=\"ltr\">l’Italia, la Polonia</bdi>، بينما أسماء المدن في هذه الأمثلة بلا أداة."
      },
      {
        "trap": "تُكتب صفات الجنسية في الإيطالية بحرف صغير: <bdi lang=\"it\" dir=\"ltr\"><em>sono polacca</em></bdi> و<bdi lang=\"it\" dir=\"ltr\"><em>un ragazzo italiano</em></bdi>. لا يوجد في العربية فرق بين حروف كبيرة وصغيرة، فانتبه إلى هذا عند الكتابة بالإيطالية. وبعد <bdi lang=\"it\" dir=\"ltr\">essere</bdi> في جملة مثل «أنا إيطالي» لا نحتاج إلى أداة: <bdi lang=\"it\" dir=\"ltr\"><em>Sono italiano.</em></bdi>."
      },
      {
        "h": "أين تسكن؟",
        "p": "نقول <bdi lang=\"it\" dir=\"ltr\"><b>abito a + مدينة</b></bdi>، مثل <bdi lang=\"it\" dir=\"ltr\"><em>Abito a Roma.</em></bdi> «أسكن في روما»، و<bdi lang=\"it\" dir=\"ltr\"><b>abito in + بلد</b></bdi>، مثل <bdi lang=\"it\" dir=\"ltr\"><em>Abito in Italia.</em></bdi> «أسكن في إيطاليا». تستعمل العربية «في» في الحالتين، أمّا الإيطالية فتميّز هنا بين <bdi lang=\"it\" dir=\"ltr\">a</bdi> و<bdi lang=\"it\" dir=\"ltr\">in</bdi>."
      }
    ],
    "grammar": {
      "title": "الفعل chiamarsi والسؤال عن شخص",
      "table": {
        "head": [
          "الضمير",
          "تصريف chiamarsi",
          "مثال"
        ],
        "rows": [
          [
            "io",
            "mi chiamo",
            "Mi chiamo Anna."
          ],
          [
            "tu",
            "ti chiami",
            "Come ti chiami?"
          ],
          [
            "lui / lei / Lei",
            "si chiama",
            "Come si chiama, scusi?"
          ],
          [
            "noi",
            "ci chiamiamo",
            "Ci chiamiamo Rossi."
          ],
          [
            "voi",
            "vi chiamate",
            "Come vi chiamate?"
          ],
          [
            "loro",
            "si chiamano",
            "Si chiamano Marco e Luca."
          ]
        ]
      },
      "examples": [
        {
          "tr": "ما اسمك؟ — اسمي إيفا."
        },
        {
          "tr": "من أين أنت؟ — أنا من كراكوف."
        },
        {
          "tr": "أنا بولندية، لكنني أسكن في ميلانو.",
          "note": "تُكتب صفة الجنسية بحرف صغير."
        },
        {
          "tr": "كم عمرك؟ — عمري ثمانية وعشرون عامًا.",
          "note": "لذكر العمر نستخدم الفعل avere؛ ستتدرّب عليه في درس الأعداد."
        },
        {
          "tr": "تشرّفت بمعرفتك يا ماركو. — وأنا أيضًا."
        }
      ]
    },
    "vocab": [
      "يكون",
      "اسمي…",
      "ما اسمك؟",
      "من أين أنت؟",
      "أنا من… (مدينة)",
      "أسكن في… (مدينة)",
      "بولندي / بولندية",
      "إيطالي / إيطالية",
      "الاسم الشخصي",
      "اسم العائلة",
      "تشرّفت بمعرفتك",
      "أنا أيضًا",
      "حقًّا؟"
    ],
    "exercises": [
      {
        "q": "كيف تسأل شخصًا عن اسمه بطريقة غير رسمية؟",
        "opts": [
          "Come si chiama?",
          "Come ti chiami?",
          "Come vi chiamate?"
        ],
        "why": "مع <bdi lang=\"it\" dir=\"ltr\">tu</bdi> نقول <bdi lang=\"it\" dir=\"ltr\"><i>Come ti chiami?</i></bdi>؛ وللمخاطبة المهذّبة بـ<bdi lang=\"it\" dir=\"ltr\">Lei</bdi> نقول <bdi lang=\"it\" dir=\"ltr\"><i>Come si chiama?</i></bdi>."
      },
      {
        "q": "أيّ جملة مكتوبة بصورة صحيحة؟",
        "opts": [
          "Sono Americana.",
          "Sono americana.",
          "Sono la americana."
        ],
        "why": "تُكتب الجنسية بحرف صغير، ولا نضع أداة قبلها في جملة مثل <bdi lang=\"it\" dir=\"ltr\">Sono americana.</bdi>."
      },
      {
        "q": "أكمل: <bdi lang=\"it\" dir=\"ltr\">___ chiamo Marta.</bdi> (اسمي مارتا.)",
        "why": "مع «أنا» نستخدم <bdi lang=\"it\" dir=\"ltr\">mi</bdi>: <bdi lang=\"it\" dir=\"ltr\">mi chiamo</bdi>."
      },
      {
        "q": "أكمل: <bdi lang=\"it\" dir=\"ltr\">Abito ___ Roma.</bdi> (أسكن في روما.)",
        "why": "مع المدينة نستخدم <bdi lang=\"it\" dir=\"ltr\">a</bdi>، ومع البلد نستخدم <bdi lang=\"it\" dir=\"ltr\">in</bdi>: <bdi lang=\"it\" dir=\"ltr\">abito a Roma / abito in Italia</bdi>."
      },
      {
        "q": "أكمل جمل التعريف بالنفس.",
        "tr": "أهلًا! اسمي كاشيا، وأنا من غدانسك وأسكن في بولونيا.",
        "why": "الأفعال المطلوبة هنا هي «أُدعى»، و«أكون من»، و«أسكن»: <bdi lang=\"it\" dir=\"ltr\">mi chiamo, sono di, abito a</bdi>."
      },
      {
        "tr": "تشرّفت بمعرفتك، اسمي لوكا."
      },
      {
        "q": "تتعرّف إلى شخص في مدرسة لغات. أدِّ دور إيفا في هذا الحوار التدريبي.",
        "setting": "اليوم الأول في مدرسة لغات في فلورنسا؛ أسماء وأصول الشخصيات أمثلة تدريبية.",
        "lines": [
          {
            "tr": "أهلًا! أنا جوليا. وأنت، ما اسمك؟"
          },
          {
            "tr": "عرّف بنفسك باسم إيفا.",
            "answerTr": "اسمي إيفا."
          },
          {
            "tr": "تشرّفت بمعرفتك يا إيفا! من أين أنت؟"
          },
          {
            "tr": "اختر من الردود ما يعني أنك من بولندا، كما في نموذج هذا التمرين.",
            "answerTr": "أنا من بولندا."
          }
        ]
      },
      {
        "tr": "اسمي إيلينا وأسكن في نابولي."
      },
      {
        "tr": "تشرّفت بمعرفتك!"
      }
    ]
  },
  "lesson:a1-u02-l2": {
    "theme": "أساسيات القواعد",
    "title": "الفعل avere والأعداد من صفر إلى مئة",
    "objectives": [
      "تصريف الفعل avere في الحاضر",
      "التعبير عن الجوع والعطش والعمر بصيغ مثل ho fame وho ventotto anni",
      "فهم الأعداد حتى مئة وذكر سعر بسيط"
    ],
    "theory": [
      {
        "h": "فعل واحد للملكية ولتعبيرات يومية",
        "p": "يعني <bdi lang=\"it\" dir=\"ltr\"><b>avere</b></bdi> «يملك / لديه»، لكنه يدخل أيضًا في تعبيرات مثل <bdi lang=\"it\" dir=\"ltr\"><em>ho fame</em></bdi> «أنا جائع»، و<bdi lang=\"it\" dir=\"ltr\"><em>ho sete</em></bdi> «أنا عطشان»، و<bdi lang=\"it\" dir=\"ltr\"><em>ho freddo</em></bdi> «أشعر بالبرد». احفظ التعبير كاملًا، ولا تترجم «أنا» إلى <bdi lang=\"it\" dir=\"ltr\">sono</bdi> في هذه العبارات. <bdi lang=\"it\" dir=\"ltr\"><em>Sono freddo.</em></bdi> قد يصف شخصًا ببرودة الطباع، ولا يعبّر عادةً عن شعوره بالبرد."
      },
      {
        "h": "العمر: نستخدم avere أيضًا",
        "p": "للقول «عمري ثلاثون عامًا» نقول <bdi lang=\"it\" dir=\"ltr\"><b>Ho trent’anni.</b></bdi>، وحرفيًا «لديّ ثلاثون عامًا». لا نقول <bdi lang=\"it\" dir=\"ltr\"><em>Sono trenta.</em></bdi> لذكر العمر. وقد يُحذف الحرف المتحرّك الأخير قبل <bdi lang=\"it\" dir=\"ltr\">anni</bdi> وتوضع الفاصلة العليا، كما في <bdi lang=\"it\" dir=\"ltr\"><em>vent’anni</em></bdi> و<bdi lang=\"it\" dir=\"ltr\"><em>trent’anni</em></bdi>."
      },
      {
        "h": "حرف h مكتوب ولا يُنطق",
        "p": "تبدأ الصيغ <bdi lang=\"it\" dir=\"ltr\"><b>ho, hai, ha, hanno</b></bdi> بحرف <bdi lang=\"it\" dir=\"ltr\">h</bdi> صامت. لا تضف له صوت الهاء العربية. يميّز في الكتابة <bdi lang=\"it\" dir=\"ltr\">ho</bdi> «لديّ» عن <bdi lang=\"it\" dir=\"ltr\">o</bdi> «أو»، و<bdi lang=\"it\" dir=\"ltr\">ha</bdi> «لديه / لديها» عن <bdi lang=\"it\" dir=\"ltr\">a</bdi> «إلى / في» بحسب السياق."
      },
      {
        "h": "تركيب الأعداد بعد العشرين",
        "p": "تُكتب العشرات والآحاد في كلمة واحدة، مثل <bdi lang=\"it\" dir=\"ltr\"><em>ventidue</em></bdi> «اثنان وعشرون» و<bdi lang=\"it\" dir=\"ltr\"><em>trentasei</em></bdi> «ستة وثلاثون». بخلاف العربية، تأتي العشرات أولًا. وقبل <bdi lang=\"it\" dir=\"ltr\">uno</bdi> و<bdi lang=\"it\" dir=\"ltr\">otto</bdi> نحذف الحرف الأخير من لفظ العشرات: <bdi lang=\"it\" dir=\"ltr\"><b>ventuno, ventotto, trentuno</b></bdi>. لاحظ النبر المكتوب في <bdi lang=\"it\" dir=\"ltr\">ventitré, novantatré</bdi>."
      }
    ],
    "grammar": {
      "title": "الفعل avere والأعداد",
      "table": {
        "head": [
          "الضمير",
          "تصريف avere",
          "تعبير ومعناه"
        ],
        "rows": [
          [
            "io",
            "ho",
            "<bdi lang=\"it\" dir=\"ltr\">Ho fame.</bdi> (أنا جائع.)"
          ],
          [
            "tu",
            "hai",
            "<bdi lang=\"it\" dir=\"ltr\">Hai freddo?</bdi> (هل تشعر بالبرد؟)"
          ],
          [
            "lui / lei / Lei",
            "ha",
            "<bdi lang=\"it\" dir=\"ltr\">Ha ragione.</bdi> (هو / هي على حقّ.)"
          ],
          [
            "noi",
            "abbiamo",
            "<bdi lang=\"it\" dir=\"ltr\">Abbiamo sete.</bdi> (نحن عطشانون.)"
          ],
          [
            "voi",
            "avete",
            "<bdi lang=\"it\" dir=\"ltr\">Avete tempo?</bdi> (هل لديكم وقت؟)"
          ],
          [
            "loro",
            "hanno",
            "<bdi lang=\"it\" dir=\"ltr\">Hanno paura.</bdi> (هم خائفون.)"
          ]
        ]
      },
      "examples": [
        {
          "tr": "١، ٢، ٣، ٤، ٥"
        },
        {
          "tr": "٦، ٧، ٨، ٩، ١٠"
        },
        {
          "tr": "١١، ١٢، ١٣… ٢٠"
        },
        {
          "tr": "٢١، ٢٢، ٢٨",
          "note": "قبل uno وotto يسقط الحرف المتحرّك الأخير من لفظ العشرات."
        },
        {
          "tr": "٣٠، ٤٠، ٥٠، ٦٠"
        },
        {
          "tr": "٧٠، ٨٠، ٩٠، ١٠٠"
        },
        {
          "tr": "عمري ثمانية وعشرون عامًا."
        }
      ]
    },
    "vocab": [
      "يملك / لديه",
      "أنا جائع",
      "أنا عطشان",
      "أشعر بالبرد / بالحرّ",
      "أشعر بالنعاس",
      "أنا خائف",
      "أنا على حقّ",
      "أحتاج إلى…",
      "كم عمرك؟",
      "كم سعره؟",
      "يورو",
      "عدد / رقم",
      "رقم الهاتف"
    ],
    "exercises": [
      {
        "why": "تبدأ أربع صيغ بحرف <bdi lang=\"it\" dir=\"ltr\">h</bdi> الصامت: <bdi lang=\"it\" dir=\"ltr\">ho, hai, ha, hanno</bdi>."
      },
      {
        "q": "كيف تقول «أنا جائع»؟",
        "opts": [
          "Sono fame",
          "Ho fame",
          "Sto fame"
        ],
        "why": "احفظ هذه التعبيرات مع <bdi lang=\"it\" dir=\"ltr\">avere</bdi>: <bdi lang=\"it\" dir=\"ltr\">ho fame, ho sete, ho freddo</bdi>."
      },
      {
        "q": "ما العدد الذي تعنيه <bdi lang=\"it\" dir=\"ltr\">settantasei</bdi>؟",
        "opts": [
          "66",
          "76",
          "86"
        ],
        "why": "<bdi lang=\"it\" dir=\"ltr\">settanta</bdi> تعني 70 و<bdi lang=\"it\" dir=\"ltr\">sei</bdi> تعني 6، فالعدد 76."
      },
      {
        "q": "اكتب بالأرقام: <bdi lang=\"it\" dir=\"ltr\">novantatré</bdi>. استخدم الأرقام 0–9 كما في لوحة المفاتيح الإيطالية.",
        "why": "<bdi lang=\"it\" dir=\"ltr\">novanta</bdi> تعني 90 و<bdi lang=\"it\" dir=\"ltr\">tre</bdi> تعني 3؛ إذن 93."
      },
      {
        "q": "أكمل: <bdi lang=\"it\" dir=\"ltr\">Ho vent___ anni.</bdi> (عمري عشرون عامًا.) اكتب العلامة الناقصة فقط.",
        "hint": "يُحذف حرف قبل anni وتوضع مكانه فاصلة عليا.",
        "why": "نكتب <bdi lang=\"it\" dir=\"ltr\">vent’anni</bdi>؛ حُذفت النهاية المتحرّكة ووُضعت الفاصلة العليا مكانها."
      },
      {
        "q": "ترجم إلى الإيطالية مخاطبًا صديقًا: «كم عمرك؟»",
        "why": "نقول <bdi lang=\"it\" dir=\"ltr\">Quanti anni hai?</bdi>، وحرفيًا «كم عامًا لديك؟»."
      },
      {
        "q": "صِل كل تعبير مع avere بمعناه.",
        "pairs": [
          "أنا عطشان",
          "أشعر بالنعاس",
          "أنا خائف",
          "أنا على حقّ"
        ]
      },
      {
        "q": "أكمل الحوار عند صندوق الدفع.",
        "tr": "— كم السعر؟ — اثنان وثلاثون يورو. — لديّ عشرون يورو فقط، آسف."
      },
      {
        "tr": "عمري خمسة وثلاثون عامًا وأسكن في تورينو."
      },
      {
        "tr": "كم سعر الكابتشينو؟"
      }
    ]
  },
  "lesson:a1-u02-l3": {
    "theme": "العمل والتعارف",
    "title": "ما عملك؟ الحديث عن المهنة",
    "objectives": [
      "ذكر مهنتك بطريقة طبيعية",
      "استعمال fare مع أداة التعريف، وessere غالبًا دون أداة عند ذكر المهنة",
      "التعرّف إلى صيغ المؤنّث في أسماء المهن"
    ],
    "theory": [
      {
        "h": "طريقتان لذكر المهنة",
        "p": "للقول «أنا مهندس معماري» يمكنك استعمال <bdi lang=\"it\" dir=\"ltr\"><b>Faccio l’architetto.</b></bdi>، وهي صيغة شائعة للحديث عن العمل، أو <bdi lang=\"it\" dir=\"ltr\"><b>Sono architetto.</b></bdi> للتعريف بالمهنة أو الصفة. بعد <bdi lang=\"it\" dir=\"ltr\">fare</bdi> تأتي أداة التعريف، أمّا بعد <bdi lang=\"it\" dir=\"ltr\">essere</bdi> في هذه الأمثلة فلا نحتاج إلى أداة. اسأل: <bdi lang=\"it\" dir=\"ltr\"><em>Che lavoro fai?</em></bdi> «ما عملك؟»."
      },
      {
        "h": "كيف تظهر صيغة المؤنّث؟",
        "list": [
          "في أسماء كثيرة تتغيّر <bdi lang=\"it\" dir=\"ltr\">-o</bdi> إلى <bdi lang=\"it\" dir=\"ltr\">-a</bdi>: <bdi lang=\"it\" dir=\"ltr\">l’impiegato → l’impiegata</bdi> «موظّف ← موظّفة».",
          "توجد صيغ تُحفظ مع أمثلتها: <bdi lang=\"it\" dir=\"ltr\">il professore → la professoressa</bdi> و<bdi lang=\"it\" dir=\"ltr\">lo studente → la studentessa</bdi>. ليست <bdi lang=\"it\" dir=\"ltr\">-essa</bdi> قاعدة لكل اسم ينتهي بـ<bdi lang=\"it\" dir=\"ltr\">-e</bdi>.",
          "في بعض الأسماء تتحوّل <bdi lang=\"it\" dir=\"ltr\">-tore</bdi> إلى <bdi lang=\"it\" dir=\"ltr\">-trice</bdi>: <bdi lang=\"it\" dir=\"ltr\">l’attore → l’attrice</bdi> «ممثل ← ممثلة»، و<bdi lang=\"it\" dir=\"ltr\">il direttore → la direttrice</bdi> «مدير ← مديرة».",
          "قد يبقى الاسم نفسه وتتغيّر الأداة: <bdi lang=\"it\" dir=\"ltr\">il/la giornalista, il/la dentista, il/la cantante</bdi>؛ أي صحفي أو صحفية، وطبيب أو طبيبة أسنان، ومغنٍّ أو مغنّية."
        ]
      },
      {
        "h": "قد تسمع أكثر من تسمية",
        "p": "ستصادف صيغًا مؤنّثة مثل <bdi lang=\"it\" dir=\"ltr\">l’avvocata</bdi> «محامية»، و<bdi lang=\"it\" dir=\"ltr\">la sindaca</bdi> «رئيسة البلدية»، و<bdi lang=\"it\" dir=\"ltr\">la ministra</bdi> «وزيرة». وقد تسمع أيضًا صيغة <bdi lang=\"it\" dir=\"ltr\">l’avvocato</bdi> عن امرأة. تعرّف إلى الصيغ المتداولة واحترم التسمية التي تستعملها صاحبة المهنة."
      },
      {
        "contrast": "في العربية نقول «أنا معلّم» دون فعل في الحاضر. في الإيطالية يمكنك قول <bdi lang=\"it\" dir=\"ltr\"><b>Faccio l’insegnante.</b></bdi> أو <bdi lang=\"it\" dir=\"ltr\"><b>Sono insegnante.</b></bdi>. لا تنقل أداة التعريف من صيغة إلى الأخرى. كذلك <bdi lang=\"it\" dir=\"ltr\">lavoro come…</bdi> تعني «أعمل بوصفـ…» وهي صيغة صحيحة، لكن <bdi lang=\"it\" dir=\"ltr\">faccio il/la…</bdi> شائعة وبسيطة في الحديث اليومي."
      }
    ],
    "grammar": {
      "title": "الفعل fare: يفعل / يعمل — الحاضر",
      "note": "فعل غير منتظم وشائع جدًا؛ نتعلّمه هنا للحديث عن المهنة، وله استعمالات يومية أخرى.",
      "table": {
        "head": [
          "الضمير",
          "تصريف fare",
          "مثال"
        ],
        "rows": [
          [
            "io",
            "faccio",
            "Faccio l'insegnante."
          ],
          [
            "tu",
            "fai",
            "Che lavoro fai?"
          ],
          [
            "lui / lei / Lei",
            "fa",
            "Fa il medico."
          ],
          [
            "noi",
            "facciamo",
            "Facciamo colazione."
          ],
          [
            "voi",
            "fate",
            "Che cosa fate?"
          ],
          [
            "loro",
            "fanno",
            "Fanno gli avvocati."
          ]
        ]
      },
      "examples": [
        {
          "tr": "ما عملك؟"
        },
        {
          "tr": "أنا صحفية."
        },
        {
          "tr": "أنا مهندس.",
          "note": "بعد essere لا نضع عادةً أداة قبل اسم المهنة في هذا النوع من الجمل."
        },
        {
          "tr": "أعمل في وكالة."
        },
        {
          "tr": "أنا عاطل عن العمل حاليًا."
        },
        {
          "tr": "ما زلت أدرس، وأنا في السنة الأخيرة."
        }
      ]
    },
    "vocab": [
      "العمل / المهنة",
      "معلّم / معلّمة",
      "طبيب / طبيبة",
      "مهندس / مهندسة",
      "محامٍ / محامية",
      "صحفي / صحفية",
      "موظّف / موظّفة",
      "طاهٍ / طاهية",
      "بائع / بائعة في متجر",
      "عامل",
      "صاحب مهنة حرّة / صاحبة مهنة حرّة",
      "أبحث عن عمل"
    ],
    "exercises": [
      {
        "why": "انتبه إلى <bdi lang=\"it\" dir=\"ltr\">cc</bdi> المضعّفة في <bdi lang=\"it\" dir=\"ltr\">faccio</bdi> و<bdi lang=\"it\" dir=\"ltr\">facciamo</bdi>."
      },
      {
        "q": "أيّ جملة تعني «أنا معلّم / معلّمة» وتناسب الحديث الطبيعي؟",
        "opts": [
          "Faccio l'insegnante.",
          "Sono la insegnante.",
          "Ho insegnante."
        ],
        "why": "نستخدم <bdi lang=\"it\" dir=\"ltr\">fare</bdi> مع أداة التعريف: <bdi lang=\"it\" dir=\"ltr\">Faccio l’insegnante.</bdi>."
      },
      {
        "q": "ما مؤنّث <bdi lang=\"it\" dir=\"ltr\">il professore</bdi>؟",
        "opts": [
          "la professora",
          "la professoressa",
          "la professrice"
        ],
        "why": "الصيغة هي <bdi lang=\"it\" dir=\"ltr\">la professoressa</bdi>؛ ومن الأمثلة المشابهة <bdi lang=\"it\" dir=\"ltr\">studente → studentessa</bdi>. احفظ كل صيغة مع اسمها."
      },
      {
        "q": "أكمل: <bdi lang=\"it\" dir=\"ltr\">Mia sorella fa ___ dottoressa.</bdi> (أختي طبيبة.)",
        "why": "بعد <bdi lang=\"it\" dir=\"ltr\">fare</bdi> نضع أداة التعريف الموافقة للاسم: <bdi lang=\"it\" dir=\"ltr\">la dottoressa</bdi>."
      },
      {
        "q": "اختر أداة التعريف المناسبة.",
        "items": [
          "طاهية",
          "مهندس",
          "طالبة",
          "عامل"
        ]
      },
      {
        "q": "ترجم إلى الإيطالية مخاطبًا شخصًا بطريقة غير رسمية: «ما عملك؟»",
        "why": "نقول <bdi lang=\"it\" dir=\"ltr\">Che lavoro fai?</bdi>، وحرفيًا «أيّ عمل تفعل؟»."
      },
      {
        "q": "صِل اسم المذكّر بصيغته في المؤنّث.",
        "pairs": [
          "l'attrice",
          "la commessa",
          "la studentessa",
          "la giornalista"
        ]
      },
      {
        "tr": "أعمل في مصرف في ميلانو."
      },
      {
        "tr": "أنا مهندس معماري، وأعمل مع أخي."
      },
      {
        "tr": "ما عملك؟ أنا صحفية."
      }
    ]
  },
  "lesson:a1-u02-l4": {
    "theme": "أساسيات القواعد",
    "title": "الأفعال المنتظمة المنتهية بـ\u2066-ARE\u2069",
    "objectives": [
      "تصريف الأفعال المنتظمة المنتهية بـ\u2066-are\u2069 في الحاضر",
      "كتابة صيغ cercare وpagare وmangiare بصورة صحيحة",
      "تكوين جملة منفيّة وسؤال بسيط"
    ],
    "theory": [
      {
        "h": "نمط واحد لأفعال كثيرة",
        "p": "تنتهي أفعال إيطالية كثيرة بـ<bdi lang=\"it\" dir=\"ltr\"><b>-are</b></bdi>. لتصريف الفعل المنتظم في الحاضر نحذف <bdi lang=\"it\" dir=\"ltr\">-are</bdi> ونضيف النهايات <bdi lang=\"it\" dir=\"ltr\"><b>-o, -i, -a, -iamo, -ate, -ano</b></bdi>. مثلًا: <bdi lang=\"it\" dir=\"ltr\"><em>parlare → parlo, parli, parla…</em></bdi>. تعلّم النمط مع المعنى؛ فـ<bdi lang=\"it\" dir=\"ltr\">parlo</bdi> تعني «أتكلّم» و<bdi lang=\"it\" dir=\"ltr\">parliamo</bdi> «نتكلّم»."
      },
      {
        "h": "انتبه إلى موضع النبر",
        "p": "في الأمثلة المنتظمة هنا، يقع النبر في صيغة <bdi lang=\"it\" dir=\"ltr\">loro</bdi> على المقطع الثالث من النهاية: <bdi lang=\"it\" dir=\"ltr\"><b>par</b>-la-no</bdi> و<bdi lang=\"it\" dir=\"ltr\">la-<b>vo</b>-ra-no</bdi>. لا تضغط على النهاية <bdi lang=\"it\" dir=\"ltr\">-no</bdi>. استمع إلى التسجيلات وقل الصيغ معها، بدل إضافة علامة نبر غير موجودة إلى الكتابة الإيطالية."
      },
      {
        "h": "تغييرات كتابية تحافظ على النطق",
        "list": [
          "مع <bdi lang=\"it\" dir=\"ltr\"><b>-care / -gare</b></bdi> نضيف <bdi lang=\"it\" dir=\"ltr\"><b>h</b></bdi> في صيغ مثل <bdi lang=\"it\" dir=\"ltr\">cerchi, cerchiamo, paghi, paghiamo</bdi> كي يبقى نطق <bdi lang=\"it\" dir=\"ltr\">c / g</bdi> قويًا؛ لا ننطق <bdi lang=\"it\" dir=\"ltr\">h</bdi> مثل الهاء العربية.",
          "مع <bdi lang=\"it\" dir=\"ltr\"><b>-ciare / -giare</b></bdi> لا نضاعف <bdi lang=\"it\" dir=\"ltr\">i</bdi> في أمثلة مثل <bdi lang=\"it\" dir=\"ltr\">mangiare → mangi</bdi> و<bdi lang=\"it\" dir=\"ltr\">cominciare → cominci</bdi>؛ فلا نكتب <bdi lang=\"it\" dir=\"ltr\">mangii</bdi>.",
          "في <bdi lang=\"it\" dir=\"ltr\"><b>studiare</b></bdi>، حيث <bdi lang=\"it\" dir=\"ltr\">i</bdi> غير منبورة، نكتب <bdi lang=\"it\" dir=\"ltr\">studi, studiamo</bdi> بحرف <bdi lang=\"it\" dir=\"ltr\">i</bdi> واحد. احفظ هذه الأمثلة ولا تعمّمها على كل فعل آخر ينتهي بـ<bdi lang=\"it\" dir=\"ltr\">-iare</bdi>."
        ]
      },
      {
        "h": "النفي والسؤال ببساطة",
        "p": "نضع <bdi lang=\"it\" dir=\"ltr\"><b>non</b></bdi> قبل الفعل للنفي: <bdi lang=\"it\" dir=\"ltr\"><em>Non parlo italiano.</em></bdi> «لا أتكلّم الإيطالية». وفي السؤال يمكن أن تبقى الكلمات بالترتيب نفسه، مع نبرة السؤال وعلامته: <bdi lang=\"it\" dir=\"ltr\"><em>Parli italiano?</em></bdi> «هل تتكلّم الإيطالية؟». بخلاف «هل» العربية، لا نحتاج هنا إلى كلمة منفصلة لبدء السؤال."
      }
    ],
    "grammar": {
      "title": "الفعل parlare: نمط تصريف -ARE",
      "table": {
        "head": [
          "الضمير",
          "النهاية",
          "تصريف parlare",
          "تصريف lavorare"
        ],
        "rows": [
          [
            "io",
            "-o",
            "parlo",
            "lavoro"
          ],
          [
            "tu",
            "-i",
            "parli",
            "lavori"
          ],
          [
            "lui / lei / Lei",
            "-a",
            "parla",
            "lavora"
          ],
          [
            "noi",
            "-iamo",
            "parliamo",
            "lavoriamo"
          ],
          [
            "voi",
            "-ate",
            "parlate",
            "lavorate"
          ],
          [
            "loro",
            "-ano",
            "parlano",
            "lavorano"
          ]
        ]
      },
      "examples": [
        {
          "tr": "أتكلّم قليلًا من الإيطالية."
        },
        {
          "tr": "لا أتكلّم جيدًا، لكنني أفهم."
        },
        {
          "tr": "هل تدرس في الجامعة؟",
          "note": "ترتيب الكلمات لا يتغيّر هنا؛ نبرة الصوت تجعلها سؤالًا."
        },
        {
          "tr": "نتناول الطعام في الثامنة."
        },
        {
          "tr": "هل تبحث عن عمل في ميلانو؟",
          "note": "نكتب cerchi مع h للمحافظة على النطق."
        },
        {
          "tr": "هم يسكنون قرب المركز.",
          "note": "النبر في abitano على المقطع الأوّل: A-bi-ta-no."
        }
      ]
    },
    "vocab": [
      "يتكلّم / يتحدّث",
      "يعمل",
      "يدرس",
      "يسكن",
      "يأكل",
      "يشتري",
      "يبحث عن",
      "يدفع",
      "يستمع",
      "يشاهد / ينظر إلى",
      "ينتظر",
      "يبدأ"
    ],
    "exercises": [
      {
        "why": "استعمل نهايات التصريف المنتظم مع <bdi lang=\"it\" dir=\"ltr\">parlare</bdi>: <bdi lang=\"it\" dir=\"ltr\">-o, -i, -a, -iamo, -ate, -ano</bdi>."
      },
      {
        "tr": "صرّف cercare مع tu وnoi؛ وانتبه إلى الكتابة.",
        "why": "نكتب <bdi lang=\"it\" dir=\"ltr\">cerchi</bdi> و<bdi lang=\"it\" dir=\"ltr\">cerchiamo</bdi> مع <bdi lang=\"it\" dir=\"ltr\">h</bdi> ليبقى الصوت <bdi lang=\"it\" dir=\"ltr\">k</bdi>."
      },
      {
        "q": "أيّ صيغة تعني «أنت تأكل»؟",
        "opts": [
          "mangii",
          "mangi",
          "mangie"
        ],
        "why": "الصحيح <bdi lang=\"it\" dir=\"ltr\">mangi</bdi> بحرف <bdi lang=\"it\" dir=\"ltr\">i</bdi> واحد؛ لا نضاعفه في هذا الفعل."
      },
      {
        "q": "أكمل: <bdi lang=\"it\" dir=\"ltr\">Loro ___ a Bologna.</bdi> (هم يسكنون في بولونيا.)",
        "why": "الفعل <bdi lang=\"it\" dir=\"ltr\">abitare</bdi> مع <bdi lang=\"it\" dir=\"ltr\">loro</bdi> هو <bdi lang=\"it\" dir=\"ltr\">abitano</bdi>، ونهايته <bdi lang=\"it\" dir=\"ltr\">-ano</bdi>."
      },
      {
        "q": "حوّل الجملة إلى النفي: <bdi lang=\"it\" dir=\"ltr\">Parlo italiano. → ___ parlo italiano.</bdi>",
        "why": "نضع <bdi lang=\"it\" dir=\"ltr\">non</bdi> قبل الفعل: <bdi lang=\"it\" dir=\"ltr\">Non parlo italiano.</bdi>."
      },
      {
        "q": "ترجم إلى الإيطالية: «نبحث عن شقّة في روما.»",
        "why": "مع <bdi lang=\"it\" dir=\"ltr\">noi</bdi> نقول <bdi lang=\"it\" dir=\"ltr\">cerchiamo</bdi> مع <bdi lang=\"it\" dir=\"ltr\">h</bdi>، ونستخدم <bdi lang=\"it\" dir=\"ltr\">a</bdi> قبل المدينة."
      },
      {
        "q": "اختر كل الصيغ التي تنتمي إلى تصريف studiare.",
        "opts": [
          "studio",
          "studii",
          "studi",
          "studiamo",
          "studiate"
        ],
        "why": "الصيغ المعروضة الصحيحة فيها <bdi lang=\"it\" dir=\"ltr\">i</bdi> واحدة؛ أمّا <bdi lang=\"it\" dir=\"ltr\">studii</bdi> فليست من تصريف <bdi lang=\"it\" dir=\"ltr\">studiare</bdi> في هذا التمرين."
      },
      {
        "tr": "لا أعمل أيام السبت.",
        "why": "نستخدم <bdi lang=\"it\" dir=\"ltr\">il sabato</bdi> بأداة التعريف للتعبير عن عادة تتكرّر أيام السبت."
      },
      {
        "tr": "أدرس الإيطالية منذ ثلاثة أشهر."
      },
      {
        "tr": "لا أتكلّم جيدًا، لكنني أفهم كل شيء تقريبًا."
      }
    ]
  },
  "lesson:a1-u02-test": {
    "theme": "اختبار",
    "title": "اختبار الوحدة الثانية",
    "objectives": [
      "مراجعة avere وfare وchiamarsi والأعداد وتصريف الأفعال المنتظمة المنتهية بـ\u2066-are\u2069"
    ],
    "theory": [
      {
        "p": "عشرة أسئلة. تنجح عند الإجابة الصحيحة عن 70٪ على الأقل. حاول من الذاكرة، ثم راجع ما تحتاج إليه."
      }
    ],
    "exercises": [
      {
        "q": "أكمل: <bdi lang=\"it\" dir=\"ltr\">___ chiamo Peter.</bdi> (اسمي بيتر.)"
      },
      {
        "q": "أكمل: <bdi lang=\"it\" dir=\"ltr\">Quanti anni ___?</bdi> (كم عمرك؟ — مخاطبة غير رسمية)"
      },
      {
        "q": "ما العدد الذي تعنيه <bdi lang=\"it\" dir=\"ltr\">ottantaquattro</bdi>؟",
        "opts": [
          "48",
          "84",
          "94"
        ]
      },
      {
        "q": "كيف تقول بالإيطالية «أنا جائع»؟",
        "opts": [
          "Sono fame",
          "Ho fame",
          "Sto fame"
        ]
      },
      {},
      {
        "q": "أيّ صيغة تعني «أنت تدفع»؟",
        "opts": [
          "pagi",
          "paghi",
          "page"
        ],
        "why": "مع <bdi lang=\"it\" dir=\"ltr\">-gare</bdi> نضيف <bdi lang=\"it\" dir=\"ltr\">h</bdi> قبل النهاية <bdi lang=\"it\" dir=\"ltr\">-i</bdi>: <bdi lang=\"it\" dir=\"ltr\">paghi</bdi>."
      },
      {
        "q": "أكمل التعريف بالنفس في المثال.",
        "tr": "أنا بولندية، أسكن في فيرونا وأعمل معلّمة."
      },
      {
        "q": "ترجم إلى الإيطالية: «لا أتكلّم الإيطالية.»"
      },
      {
        "tr": "عمري سبعة وعشرون عامًا وأبحث عن عمل."
      },
      {
        "tr": "اسمي آنا وأنا صحفية."
      }
    ]
  }
});
