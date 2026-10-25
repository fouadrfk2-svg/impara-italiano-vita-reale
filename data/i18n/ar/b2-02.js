/* Complete Arabic translations of the existing B2 course. Italian content and grading remain in data/core. */
LINGUAI.addStrings("ar", {
  "unit:b2-u05": {
    "title": "الكلام المنقول",
    "grammarNote": "انتقال الأزمنة إلى الماضي · إشارات الزمن والمكان · الأسئلة والأوامر"
  },
  "lesson:b2-u05-l1": {
    "theme": "القواعد",
    "title": "من الكلام المباشر إلى المنقول",
    "objectives": [
      "تغيير الزمن بعد فعل نقل في الماضي",
      "الاختيار بين indicativo وcongiuntivo بعد che",
      "استعمال أفعال نقل غير dire"
    ],
    "theory": [
      {
        "h": "فعل النقل الماضي وتغيير الأزمنة",
        "p": "<em>Ha detto: «Sono stanco»</em> → <em>Ha detto che <b>era</b> stanco.</em> عند نقل الكلام من مرجع ماضٍ يتحوّل الحاضر عادةً إلى imperfetto، وpassato prossimo إلى trapassato، والمستقبل إلى condizionale composto: <em>«Arriverò»</em> → <em>ha detto che <b>sarebbe arrivato</b></em>. المستقبل المنظور إليه من الماضي يُعبَّر عنه هنا بـ<em>sarei arrivato</em>، لا <em>arriverei</em>."
      },
      {
        "h": "متى لا يتغيّر الزمن؟",
        "p": "إذا كان فعل النقل في الحاضر، مثل <em>dice che…</em>، فلا يلزم نقل الأزمنة إلى الماضي. وإذا ظلّ المضمون صحيحًا، فقد يُحتفظ بالحاضر بعد فعل نقل ماضٍ: <em>Ha detto che Roma <b>è</b> la capitale</em> أنسب من <em>era</em> عندما نؤكّد الحقيقة الحالية."
      },
      {
        "h": "بعد che: صيغة indicativo أم congiuntivo؟",
        "p": "يساعد فعل النقل ومعناه وسياقه على اختيار الصيغة. تأتي <em>Dire, rispondere, spiegare, scrivere</em> مع indicativo في نقل خبر، مثل <em>ha detto che <b>era</b> stanco</em>. وقد تأتي أفعال الرأي أو النفي، مثل <em>Sostenere, ritenere, negare</em>، مع congiuntivo: <em>sostiene che la pratica <b>sia</b> aperta</em>. لا تجعلها قائمة آلية: قد يتغيّر الاختيار بحسب المعنى؛ وsostenere لا يفرض congiuntivo في كلّ سياق."
      },
      {
        "contrast": "في العربية نقول «قال إنه متعب» أو «طلب مني أن أنتظر»، لكن «أنّ/أنْ» لا تقابل che في جميع التراكيب الإيطالية. عند نقل أمر نستعمل <em>di aspettare</em>، لا نختار <em>che</em> بالقياس على نقل الأخبار. كذلك لا يوجد تطابق مباشر بين الفعل العربي وصيغة <em>sostiene che sia</em>؛ انتبه إلى تركيب الفعل الإيطالي ومعناه."
      }
    ],
    "grammar": {
      "title": "انتقال الأزمنة إلى الماضي",
      "note": "بعد فعل نقل في زمن ماضٍ، وفق المرجع الزمني والسياق.",
      "table": {
        "head": [
          "الكلام المباشر",
          "الكلام المنقول",
          "المثال"
        ],
        "rows": [
          [
            "presente",
            "imperfetto",
            "«sono stanco» → era stanco"
          ],
          [
            "passato prossimo",
            "trapassato prossimo",
            "«ho finito» → aveva finito"
          ],
          [
            "futuro semplice",
            "condizionale composto",
            "«arriverò» → sarebbe arrivato"
          ],
          [
            "imperfetto",
            "imperfetto، من دون تغيير",
            "«ero stanco» → era stanco"
          ],
          [
            "congiuntivo presente",
            "congiuntivo imperfetto",
            "«che sia» → che fosse"
          ]
        ]
      },
      "examples": [
        {
          "tr": "قال: «أنا متعب» ← قال إنه كان متعبًا."
        },
        {
          "tr": "كتب إليّ أنه سيصل في اليوم التالي."
        },
        {
          "tr": "أجاب بأنه لم يفهم السؤال."
        },
        {
          "tr": "شرح لنا أنه سيتّصل بنفسه بالمكتب."
        },
        {
          "tr": "اعترف بأنه أخطأ."
        },
        {
          "tr": "يؤكّد أن المعاملة ما زالت مفتوحة."
        }
      ]
    },
    "vocab": [
      "ينقل كلامًا أو خبرًا",
      "يؤكّد رأيًا؛ يدّعي",
      "يعترف؛ يقرّ",
      "يردّ؛ يعقّب",
      "يوضّح بدقّة",
      "يضيف",
      "ينفي خبرًا أو ادّعاءً",
      "يؤكّد",
      "على ما يبدو",
      "بحسب رأيه؛ حسب قوله",
      "على حدّ قوله",
      "بحسب؛ استنادًا إلى"
    ],
    "exercises": [
      {
        "q": "انقل «Sono stanco» بعد «ha detto che» مع إرجاع الزمن إلى الماضي والإشارة إلى القائل نفسه.",
        "opts": [
          "ha detto che sono stanco",
          "ha detto che era stanco",
          "ha detto che sarebbe stanco"
        ]
      },
      {
        "q": "أكمل مع إرجاع الزمن إلى الماضي: «Ha detto che ___ stanco.» بالفعل essere."
      },
      {
        "q": "أكمل: «Ha risposto che non ___ la domanda.» بالفعل capire لحدث سابق."
      },
      {
        "q": "انقل «Arriverò domani» بعد «ha detto che» بوصفه مستقبلًا بالنسبة إلى الماضي.",
        "opts": [
          "arriverà",
          "arriverebbe",
          "sarebbe arrivato"
        ]
      },
      {
        "q": "أكمل بالصيغ المناسبة.",
        "tr": "قال إنه سيصل في اليوم التالي وإنه سيتّصل بنفسه."
      },
      {
        "q": "ترجم مع إرجاع الزمن إلى الماضي: «قال إنه كان متعبًا.»"
      },
      {
        "q": "أيّ تعبير ورد في الدرس مع congiuntivo لعرض موقف صاحبه؟",
        "opts": [
          "sostiene che",
          "ha detto che",
          "ha scritto che"
        ]
      },
      {
        "q": "صِل أفعال نقل الكلام بمعانيها.",
        "tr": [
          "ينفي",
          "يوضّح بدقّة",
          "يردّ؛ يعقّب",
          "يؤكّد رأيًا"
        ]
      },
      {
        "q": "رتّب الكلمات لبناء الجملة."
      },
      {
        "tr": "كتب إليّ أنه سيمرّ بالمكتب في اليوم التالي."
      },
      {
        "tr": "اعترف بأنه أخطأ واعتذر."
      }
    ]
  },
  "lesson:b2-u05-l2": {
    "theme": "القواعد",
    "title": "الزمن والمكان والشخص",
    "objectives": [
      "تعديل تعبيرات الزمن والمكان",
      "استبدال venire بـandare عند الحاجة",
      "تعديل الضمائر وألفاظ الملكية"
    ],
    "theory": [
      {
        "h": "تعبيرات الزمن تتبع مرجع الكلام",
        "p": "إذا تغيّر يوم نقل الكلام أو مرجعه الزمني، قد تصبح <em>oggi</em> → <em>quel giorno</em>، و<em>ieri</em> → <em>il giorno prima</em>، و<em>domani</em> → <em>il giorno dopo</em> أو <em>l'indomani</em>، و<em>adesso</em> → <em>in quel momento</em> أو <em>allora</em>. ليست هذه تبديلات آلية؛ تُختار بحسب وقت الكلام المنقول."
      },
      {
        "h": "المكان: qui → lì وquesto → quello",
        "p": "ترتبط الإشارة بمكان المتكلّم. عند نقل الكلام من مكان آخر قد نقول: <em>«Ci vediamo qui»</em> → <em>ha detto che ci saremmo visti <b>lì</b></em>. وكذلك قد تتحوّل <em>questo</em> → <em>quello</em> و<em>questa volta</em> → <em>quella volta</em> إذا تغيّر مرجع الإشارة."
      },
      {
        "h": "الاختيار بين venire وandare",
        "p": "يشير <em>venire</em> إلى حركة نحو نقطة الإحالة الخاصة بالمتكلّم أو المخاطب. إذا تغيّرت هذه النقطة، فقد تصبح <em>«Vengo domani»</em> → <em>ha detto che <b>sarebbe andato</b> il giorno dopo</em>. الاختيار سياقي، لا إلزامي دائمًا. كذلك يتحدّد معنى <em>portare</em> بحسب اتجاه الحركة؛ ولا يُستبدل بـ<em>lasciare</em> إلا إذا كان المقصود ترك الشيء في مكان."
      },
      {
        "contrast": "العربية تفرّق أيضًا بين «يأتي» و«يذهب»، وبين «غدًا» و«اليوم التالي». عند نقل الكلام، حدّد مكان مَن يتكلّم ووقت النقل أولًا. قد تبقى <em>sarebbe venuto</em> مناسبة إذا كان المجيء نحو نقطة الإحالة الحالية؛ فلا تحوّل venire إلى andare لمجرّد أنّ الكلام منقول."
      }
    ],
    "grammar": {
      "title": "تغيير إشارات الزمن والمكان",
      "note": "عندما تُنقل كلمات قيلت في مكان آخر أو وقت آخر، مع مراعاة السياق.",
      "table": {
        "head": [
          "الأصل",
          "في الكلام المنقول",
          "ملاحظة"
        ],
        "rows": [
          [
            "oggi",
            "quel giorno",
            "ذلك اليوم"
          ],
          [
            "ieri",
            "il giorno prima",
            "—"
          ],
          [
            "domani",
            "il giorno dopo / l'indomani",
            "الصيغة الثانية أرفع أسلوبًا"
          ],
          [
            "qui",
            "lì",
            "عندما لا يكون ناقل الكلام في المكان نفسه"
          ],
          [
            "questo",
            "quello",
            "—"
          ],
          [
            "venire",
            "andare",
            "إذا تغيّرت نقطة الإحالة المكانية"
          ]
        ]
      },
      "examples": [
        {
          "tr": "«سآتي غدًا» ← قال إنه سيذهب في اليوم التالي."
        },
        {
          "tr": "«نلتقي هنا» ← قال إننا سنلتقي هناك."
        },
        {
          "tr": "«فعلتُ ذلك أمس» ← قال إنه فعله في اليوم السابق."
        },
        {
          "tr": "«هذا لا يعجبني» ← قال إنّ ذلك لا يعجبه."
        },
        {
          "tr": "«أعود الآن» ← قال إنه يعود في تلك اللحظة."
        },
        {
          "tr": "«مديري يعرف ذلك» ← قال إنّ مديره كان يعرف ذلك."
        }
      ]
    },
    "vocab": [
      "اليوم السابق",
      "اليوم التالي",
      "قبل ذلك بيومين",
      "الأسبوع التالي",
      "في تلك اللحظة",
      "آنذاك؛ حينئذ",
      "هناك",
      "ذلك",
      "يتوجّه؛ يذهب",
      "اليوم التالي",
      "قبل ذلك بقليل",
      "بعد ذلك بقليل"
    ],
    "exercises": [
      {
        "q": "انقل «Vengo domani» بعد تغيّر المرجع الزمني والمكاني وفق النمط المدروس.",
        "opts": [
          "ha detto che veniva domani",
          "ha detto che sarebbe andato il giorno dopo",
          "ha detto che verrà domani"
        ]
      },
      {
        "q": "أكمل عند نقل الكلام في يوم آخر: «Ha detto che sarebbe tornato ___.» بدل domani."
      },
      {
        "q": "أكمل عند نقل الكلام من مكان آخر: «Ha detto che ci saremmo visti ___.» بدل qui."
      },
      {
        "q": "انقل «L'ho fatto ieri» مع تغيير المرجع الزمني.",
        "opts": [
          "che l'aveva fatto ieri",
          "che lo faceva ieri",
          "che l'aveva fatto il giorno prima"
        ]
      },
      {
        "q": "لماذا تتحوّل «venire» إلى «andare» في المثال المدروس؟",
        "opts": [
          "لأن وقعها أجمل",
          "لأن نقطة الإحالة المكانية تتغيّر",
          "لأن venire ليس له تصريف في condizionale"
        ]
      },
      {
        "q": "أكمل تعبيرات الزمن.",
        "tr": "قال إنه أنهاه في اليوم السابق وإنه سيعود في اليوم التالي."
      },
      {
        "q": "ترجم إلى الإيطالية: «قال إنه سيذهب في اليوم التالي.»"
      },
      {
        "q": "أيّ التغييرات التالية صحيحة عند تغيّر مرجع الإشارة؟",
        "opts": [
          "oggi → quel giorno",
          "ieri → domani",
          "questo → quello"
        ]
      },
      {
        "q": "رتّب الكلمات لبناء الجملة."
      },
      {
        "tr": "قال لي إنه سيذهب إلى هناك في اليوم التالي."
      },
      {
        "tr": "شرح أنه لن يأتي إلى المكتب في اليوم التالي."
      }
    ]
  },
  "lesson:b2-u05-l3": {
    "theme": "القواعد",
    "title": "نقل الأسئلة والأوامر",
    "objectives": [
      "نقل سؤال إجابته نعم أو لا باستعمال se",
      "نقل سؤال بأداة استفهام",
      "تحويل الأمر إلى di مع المصدر"
    ],
    "theory": [
      {
        "h": "أسئلة نعم أو لا: se",
        "p": "<em>«Vieni?»</em> → <em>Mi ha chiesto <b>se</b> venivo.</em> أصبح السؤال جملة تابعة منقولة، فلا نضع له علامة استفهام مستقلّة ولا نعكس ترتيب الكلمات. وتعني <em>se</em> هنا «ما إذا»، ولا تدلّ على شرط."
      },
      {
        "h": "الأسئلة المفتوحة: تبقى أداة الاستفهام",
        "p": "<em>«Dove abiti?»</em> → <em>Mi ha chiesto dove abitavo</em> في الحديث اليومي، أو <em>dove <b>abitassi</b></em> بأسلوب أكثر عناية. الاختيار بين indicativo وcongiuntivo في السؤال غير المباشر يتأثّر بالسياق والأسلوب؛ وليست الصيغة الثانية واجبة في كلّ سؤال رسمي."
      },
      {
        "h": "الأوامر: di مع المصدر",
        "p": "<em>«Aspetta!»</em> → <em>Mi ha detto <b>di aspettare</b>.</em> يأتي النفي قبل المصدر: <em>mi ha detto <b>di non</b> firmare</em>. ويُستعمل هذا النمط أيضًا بعد <em>raccomandare, consigliare, pregare, ordinare, vietare</em>."
      },
      {
        "contrast": "لا تنقل «أنْ» العربية آليًا إلى che: لنقل طلب الانتظار نستعمل <em>di aspettare</em>. وميّز ذلك عن نقل خبر عن القائل نفسه: <em>ha detto di essere stanco</em>؛ ففاعل essere هو فاعل فعل القول. أمّا <em>mi ha detto che era stanco</em> فتنقل خبرًا بجملة كاملة. لا تجعل وجود «لي» في العربية سببًا لخلط خبر المتكلّم بالأمر الموجَّه إلى المخاطب."
      }
    ],
    "grammar": {
      "title": "الأسئلة والأوامر المنقولة",
      "note": "ثلاثة أنماط أساسية: سؤال بنعم أو لا، وسؤال بأداة استفهام، وأمر.",
      "table": {
        "head": [
          "الأصل",
          "الكلام المنقول",
          "النمط"
        ],
        "rows": [
          [
            "«Vieni?»",
            "mi ha chiesto se venivo",
            "chiedere se مع indicativo"
          ],
          [
            "«Dove abiti?»",
            "mi ha chiesto dove abitassi",
            "أداة استفهام مع congiuntivo؛ أسلوب أكثر عناية"
          ],
          [
            "«Aspetta!»",
            "mi ha detto di aspettare",
            "di مع المصدر"
          ],
          [
            "«Non firmare»",
            "mi ha detto di non firmare",
            "di non مع المصدر"
          ]
        ]
      },
      "examples": [
        {
          "tr": "«هل ستأتي؟» ← سألني ما إذا كنتُ سآتي."
        },
        {
          "tr": "«أين تسكن؟» ← سألني أين كنتُ أسكن."
        },
        {
          "tr": "«انتظر!» ← طلب مني أن أنتظر."
        },
        {
          "tr": "«لا توقّع» ← أوصاني بألا أوقّع."
        },
        {
          "tr": "«ماذا تريد؟» ← أراد أن يعرف ماذا كنتُ أريد."
        },
        {
          "tr": "«هل يمكنك مساعدتي؟» ← سأل ما إذا كان بإمكاني مساعدته."
        }
      ]
    },
    "vocab": [
      "يسأل ما إذا",
      "يريد أن يعرف",
      "يسأل؛ يستفسر",
      "يدعو إلى",
      "يوصي بأن",
      "يأمر بأن",
      "يقترح أن",
      "ينصح بأن",
      "يقترح أن",
      "يرجو أن؛ يتوسّل أن",
      "يمنع من",
      "يصرّ على أن"
    ],
    "exercises": [
      {
        "q": "انقل سؤال «Vieni?» بالصيغة المدروسة.",
        "opts": [
          "mi ha chiesto vieni",
          "mi ha chiesto se venivo",
          "mi ha chiesto che venivo"
        ]
      },
      {
        "q": "أكمل: «Mi ha chiesto ___ avevo capito.»"
      },
      {
        "q": "أكمل لنقل أمر بالانتظار: «Mi ha detto ___.» بالفعل aspettare."
      },
      {
        "q": "انقل الأمر «Non firmare» باستعمال di مع المصدر.",
        "opts": [
          "mi ha detto di non firmare",
          "mi ha detto che non firmavo",
          "mi ha detto non firmare"
        ]
      },
      {
        "q": "أيّ صيغة للسؤال غير المباشر أكثر عناية بالأسلوب في السياق الماضي المدروس؟",
        "opts": [
          "dove abitavo",
          "dove abiti",
          "dove abitassi"
        ]
      },
      {
        "q": "أكمل بالصيغ المناسبة.",
        "tr": "سألني ما إذا كنتُ قد فهمتُ وطلب مني أن أعاود الاتصال لاحقًا."
      },
      {
        "q": "ترجم إلى الإيطالية: «سألني ما إذا كنتُ سآتي.»"
      },
      {
        "q": "صِل الأفعال بمعانيها.",
        "tr": [
          "يوصي",
          "يمنع",
          "يقترح",
          "يرجو؛ يتوسّل"
        ]
      },
      {
        "q": "رتّب الكلمات لبناء الجملة."
      },
      {
        "tr": "سألني الموظّف ما إذا كنتُ قد أحضرتُ الرمز الضريبي."
      },
      {
        "tr": "أوصاني بألا أوقّع شيئًا من دون قراءته."
      }
    ]
  },
  "lesson:b2-u05-test": {
    "theme": "القواعد",
    "title": "اختبار الكلام المنقول",
    "exercises": [
      {
        "q": "انقل «Ho finito» بعد «ha detto che» مع إرجاع الزمن إلى الماضي.",
        "opts": [
          "ha finito",
          "aveva finito",
          "avrebbe finito"
        ]
      },
      {
        "q": "انقل «Verrò» بعد «ha detto che» بوصفه مستقبلًا بالنسبة إلى الماضي.",
        "opts": [
          "verrà",
          "verrebbe",
          "sarebbe venuto"
        ]
      },
      {
        "q": "أكمل مع إرجاع الزمن إلى الماضي: «Disse che ___ stanco.» بالفعل essere."
      },
      {
        "q": "أكمل عند تغيّر اليوم المرجعي: «Disse che sarebbe tornato ___.» بدل domani."
      },
      {
        "q": "أكمل: «Mi chiese ___ ero pronto.»"
      },
      {
        "q": "ما النمط الذي نتدرّب عليه لنقل أمر؟",
        "opts": [
          "di مع المصدر",
          "che مع congiuntivo",
          "الإبقاء على الأمر كما هو"
        ]
      },
      {
        "q": "اختر صيغتي نقل الأمر والسؤال وفق الأنماط المدروسة في هذا الدرس.",
        "opts": [
          "Mi ha detto che aspettassi.",
          "Mi ha detto di aspettare.",
          "Mi ha chiesto se venivo."
        ]
      },
      {
        "q": "أكمل الصيغ مع تغيير المرجع الزمني.",
        "tr": "قال إنه كان متعبًا وإنه سيعود في اليوم التالي."
      },
      {
        "tr": "أجاب بأنه لم يتلقَّ أيّ استدعاء."
      },
      {
        "tr": "سألني ما إذا كنتُ قد أرسلتُ الطلب بالفعل."
      }
    ]
  }
});
