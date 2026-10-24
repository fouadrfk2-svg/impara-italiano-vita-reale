/* Complete Arabic overlays for the original B1 course; Italian and grading stay in data/core. */
LINGUAI.addStrings("ar", {
  "unit:b1-u01": {
    "title": "صيغة congiuntivo",
    "grammarNote": "الحاضر والماضي في congiuntivo · التعبير عن الرأي"
  },
  "lesson:b1-u01-l1": {
    "theme": "القواعد",
    "title": "الصيغ والاستعمالات الأولى",
    "objectives": [
      "تصريف congiuntivo presente في مجموعات الأفعال الثلاث",
      "معرفة أهم الأفعال غير المنتظمة",
      "تمييز السياقات التي تستعمل هذه الصيغة"
    ],
    "theory": [
      {
        "h": "صيغة تعبّر عن موقف المتكلم",
        "p": "تعبّر صيغة congiuntivo عن <b>موقف المتكلم من مضمون الجملة التابعة</b>، مثل الرأي والشك والرغبة والشعور؛ ولا تعني دائمًا أن الحدث غير حقيقي. قارن <em>So che <b>è</b> bravo</em>، أي أعرف أنه ماهر، بصيغة indicativo، و<em>Penso che <b>sia</b> bravo</em>، أي أظن أنه ماهر، بصيغة congiuntivo. لا توجد مطابقة مباشرة بينها وبين نصب المضارع في العربية؛ تعلّم الصيغة الإيطالية مع التعبير الذي يسبقها."
      },
      {
        "h": "النهايات",
        "list": [
          "<b>-are</b>: parl<b>i</b>, parl<b>i</b>, parl<b>i</b>, parl<b>iamo</b>, parl<b>iate</b>, parl<b>ino</b>",
          "<b>-ere / -ire</b>: prend<b>a</b>, prend<b>a</b>, prend<b>a</b>, prend<b>iamo</b>, prend<b>iate</b>, prend<b>ano</b>",
          "<b>-isc-</b>: cap<b>isca</b>, cap<b>isca</b>, cap<b>isca</b>, cap<b>iamo</b>, cap<b>iate</b>, cap<b>iscano</b>"
        ]
      },
      {
        "trap": "صيغ المتكلم والمخاطب والمفرد الغائب <b>متطابقة</b>. لذلك يُذكر ضمير الفاعل عندما يلزم توضيح المقصود: <em>penso che <b>tu</b> abbia ragione</em>. يمكن حذفه إذا أوضح السياق الفاعل، لكنه مهم هنا لتجنّب اللبس."
      },
      {
        "h": "أفعال غير منتظمة مهمّة",
        "p": "من الأفعال غير المنتظمة: <em>essere → sia</em>, <em>avere → abbia</em>, <em>fare → faccia</em>, <em>andare → vada</em>, <em>venire → venga</em>, <em>potere → possa</em>, <em>volere → voglia</em>, <em>dovere → debba</em>, <em>sapere → sappia</em>, <em>dare → dia</em>, <em>stare → stia</em>, <em>dire → dica</em>, <em>uscire → esca</em>, <em>rimanere → rimanga</em>."
      }
    ],
    "grammar": {
      "title": "صيغة congiuntivo presente",
      "table": {
        "head": [
          "الضمير",
          "parlare",
          "prendere",
          "capire",
          "essere",
          "avere"
        ],
        "rows": [
          [
            "che io",
            "parli",
            "prenda",
            "capisca",
            "sia",
            "abbia"
          ],
          [
            "che tu",
            "parli",
            "prenda",
            "capisca",
            "sia",
            "abbia"
          ],
          [
            "che lui/lei",
            "parli",
            "prenda",
            "capisca",
            "sia",
            "abbia"
          ],
          [
            "che noi",
            "parliamo",
            "prendiamo",
            "capiamo",
            "siamo",
            "abbiamo"
          ],
          [
            "che voi",
            "parliate",
            "prendiate",
            "capiate",
            "siate",
            "abbiate"
          ],
          [
            "che loro",
            "parlino",
            "prendano",
            "capiscano",
            "siano",
            "abbiano"
          ]
        ]
      },
      "examples": [
        {
          "tr": "أظن أنك على حق."
        },
        {
          "tr": "أعتقد أن الوقت متأخر جدًا."
        },
        {
          "tr": "لست متأكدًا من أنه سيأتي."
        },
        {
          "tr": "آمل أن يسير كل شيء على ما يرام."
        },
        {
          "tr": "أريدك أن تقول لي الحقيقة."
        },
        {
          "tr": "أعرف أنه ماهر.",
          "note": "اليقين ← صيغة indicativo"
        }
      ]
    },
    "vocab": [
      "أظن أن…",
      "أعتقد أن…",
      "يبدو لي أن…",
      "آمل أن…",
      "أريد أن…",
      "أخشى أن…",
      "لست متأكدًا من أن…",
      "أتصوّر أن…",
      "من الممكن أن…",
      "لا بدّ من أن…",
      "أعرف أن… (مع indicativo)",
      "صحيح أن… (مع indicativo)"
    ],
    "exercises": [
      {},
      {},
      {},
      {
        "q": "لماذا نذكر ضمير الفاعل مع congiuntivo عندما نحتاج إلى توضيح المقصود؟",
        "opts": [
          "لأنه أكثر تهذيبًا",
          "لأن صيغ الأشخاص الثلاثة الأولى متطابقة",
          "لأن ترتيب الكلمات يفرض ذلك"
        ]
      },
      {
        "q": "أكمل: «Penso che tu ___ ragione.» بالفعل avere."
      },
      {
        "q": "أكمل: «Credo che ___ troppo tardi.» بالفعل essere."
      },
      {
        "q": "أي تعبير يليه indicativo وليس congiuntivo؟",
        "opts": [
          "Penso che…",
          "So che…",
          "Temo che…"
        ],
        "why": "الفعل sapere هنا يعبّر عن اليقين، لذلك يليه indicativo."
      },
      {
        "q": "أكمل بصيغ congiuntivo.",
        "tr": "آمل أن يسير كل شيء على ما يرام وأن تكونوا سعداء."
      },
      {
        "q": "ترجم إلى الإيطالية: «أريدك أن تقول لي الحقيقة.»"
      },
      {
        "tr": "أعتقد أن من الأفضل تأجيل الاجتماع."
      },
      {
        "tr": "أظن أنك على حق في هذه النقطة."
      }
    ]
  },
  "lesson:b1-u01-l2": {
    "theme": "القواعد",
    "title": "متى نستخدم congiuntivo؟",
    "objectives": [
      "تمييز التعابير التي تستدعي congiuntivo",
      "معرفة متى نستخدم di مع المصدر بدلًا من che",
      "تجنّب congiuntivo في السياقات غير المناسبة"
    ],
    "theory": [
      {
        "h": "أربع مجموعات من التعابير",
        "list": [
          "<b>الرأي والافتراض</b>: penso, credo, ritengo, mi sembra, immagino, suppongo",
          "<b>الإرادة والشعور</b>: voglio, desidero, spero, temo, mi dispiace, sono contento",
          "<b>التعابير غير الشخصية</b>: è necessario, bisogna, è possibile, è strano, è meglio, può darsi",
          "<b>أدوات الربط</b>: benché, sebbene, nonostante, affinché, purché, prima che, a meno che, senza che, come se. تتبع come se عادةً صيغة congiuntivo imperfetto أو trapassato، لا الحاضر."
        ]
      },
      {
        "h": "عندما يكون الفاعل واحدًا",
        "p": "مع أفعال مثل pensare، نستعمل عادةً <em>di</em> والمصدر إذا كان الفاعل واحدًا في الجملتين: <em>Penso <b>di</b> avere ragione</em>، أي أظن أنني على حق. تركيب «penso che io abbia» ممكن نحويًا، لكنه أقل حيادًا ويُستخدم مثلًا لإبراز الفاعل."
      },
      {
        "h": "سياقات نستخدم فيها indicativo",
        "p": "تستعمل تعابير اليقين والسبب عادةً indicativo: <em>so che, è certo che, è vero che, è chiaro che, siccome, poiché</em>. انتبه إلى <em>perché</em>: بمعنى «لأنّ» يتبعها indicativo، وبمعنى «لكي» يتبعها congiuntivo: <em>te lo dico perché tu <b>capisca</b></em>."
      },
      {
        "contrast": "قد نترجم هذه التعابير إلى العربية بـ«أظن أن» أو «آمل أن» أو «رغم أن»، لكن الأداة العربية وحدها لا تحدّد الصيغة الإيطالية. اربط كل تعبير بصيغته في الإيطالية، ولا تعتمد على نقل إعراب الفعل العربي إليها."
      }
    ],
    "grammar": {
      "title": "اختيار الصيغة المناسبة",
      "table": {
        "head": [
          "التعبير",
          "الصيغة",
          "المثال"
        ],
        "rows": [
          [
            "penso / credo che",
            "صيغة congiuntivo",
            "Penso che sia giusto."
          ],
          [
            "so / è vero che",
            "صيغة indicativo",
            "So che è giusto."
          ],
          [
            "spero che",
            "صيغة congiuntivo",
            "Spero che venga."
          ],
          [
            "spero di (الفاعل نفسه)",
            "المصدر",
            "Spero di venire."
          ],
          [
            "benché / sebbene",
            "صيغة congiuntivo",
            "Benché sia tardi, esco."
          ],
          [
            "siccome / poiché",
            "صيغة indicativo",
            "Siccome è tardi, resto."
          ]
        ]
      },
      "examples": [
        {
          "tr": "رغم هطول المطر، سنذهب على أي حال."
        },
        {
          "tr": "رغم أنني متعب، أواصل العمل."
        },
        {
          "tr": "سأساعدك بشرط أن تؤدي دورك."
        },
        {
          "tr": "غادر قبل أن تزدحم الطرق."
        },
        {
          "tr": "أفكر في المغادرة غدًا.",
          "note": "الفاعل نفسه ← di مع المصدر"
        },
        {
          "tr": "بما أن الوقت متأخر، سأؤجّل الأمر إلى الغد.",
          "note": "صيغة indicativo"
        }
      ]
    },
    "vocab": [
      "رغم أن",
      "على الرغم من",
      "لكي",
      "بشرط أن",
      "إلا إذا",
      "قبل أن",
      "دون أن",
      "كما لو أن",
      "قد يكون أن",
      "بما أن",
      "من الواضح أن",
      "يرى؛ يعتبر"
    ],
    "exercises": [
      {
        "q": "أكمل: «Benché ___ tardi, esco.» بالفعل essere.",
        "opts": [
          "è",
          "sia",
          "sarà"
        ]
      },
      {
        "q": "أكمل: «Siccome ___ tardi, resto a casa.» بالفعل essere.",
        "opts": [
          "è",
          "sia",
          "fosse"
        ],
        "why": "تقدّم siccome سببًا واقعًا، لذلك يتبعها indicativo."
      },
      {
        "q": "أكمل: «Ti aiuto purché tu ___ la tua parte.» بالفعل fare."
      },
      {
        "q": "أكمل: «Spero ___ venire domani.» الفاعل نفسه في الجملتين."
      },
      {
        "q": "أي التعابير يتبعها congiuntivo؟",
        "opts": [
          "penso che",
          "so che",
          "benché",
          "è vero che",
          "prima che"
        ]
      },
      {
        "q": "أكمل بالصيغ المناسبة.",
        "tr": "رغم أنه متعب، يواصل العمل. أعرف أن لديه صبرًا كبيرًا."
      },
      {
        "q": "ترجم إلى الإيطالية: «رغم هطول المطر، سنخرج على أي حال.»"
      },
      {
        "q": "لماذا استُعمل congiuntivo في «Te lo dico perché tu capisca»؟",
        "opts": [
          "لأن perché تتبعها هذه الصيغة دائمًا",
          "لأن perché هنا تعني «لكي» وليس «لأنّ»",
          "لأن الجملة خاطئة"
        ]
      },
      {
        "tr": "قد لا يكون هناك أحد في المكتب غدًا."
      },
      {
        "tr": "رغم صعوبة الأمر، أظن أنه يستحق العناء."
      }
    ]
  },
  "lesson:b1-u01-l3": {
    "theme": "القواعد",
    "title": "التعليق على أحداث سابقة",
    "objectives": [
      "تكوين congiuntivo passato",
      "الاختيار بين الحاضر والماضي في congiuntivo",
      "استعمال الصيغة للتعليق على الماضي"
    ],
    "theory": [
      {
        "h": "كيف نكوّن الصيغة؟",
        "p": "نستعمل congiuntivo presente من <em>avere/essere</em> مع اسم المفعول الإيطالي participio passato: <em>abbia fatto</em>، <em>sia andato</em>. قواعد اختيار الفعل المساعد والمطابقة هي نفسها في passato prossimo."
      },
      {
        "h": "الحاضر أم الماضي؟",
        "p": "عندما تكون الجملة الرئيسية في الحاضر، نستعمل <b>presente</b> لحدث متزامن أو لاحق: <em>penso che venga</em>؛ ونستعمل <b>passato</b> لحدث سابق: <em>penso che sia venuto</em>."
      },
      {
        "h": "استعمال شائع: التعليق على الماضي",
        "p": "<em>Mi dispiace che tu non sia potuto venire.</em> أي يؤسفني أنك لم تتمكن من المجيء. <em>Non credo che l'abbiano fatto apposta.</em> أي لا أعتقد أنهم فعلوا ذلك عمدًا. تتكرر هذه الصيغة في المحادثات للتعبير عن شعور أو رأي بشأن حدث سابق."
      },
      {
        "tip": "قد تسمع في الكلام العفوي indicativo بدل congiuntivo، مثل <em>penso che è vero</em>. تختلف الاستعمالات باختلاف السياق والمتكلم؛ تعلّم هنا الصيغة المعيارية المناسبة أيضًا للكتابة والعمل."
      }
    ],
    "grammar": {
      "title": "صيغة congiuntivo passato",
      "table": {
        "head": [
          "الجملة الرئيسية",
          "العلاقة الزمنية",
          "الصيغة",
          "المثال"
        ],
        "rows": [
          [
            "presente",
            "حدث متزامن",
            "cong. presente",
            "Penso che stia bene."
          ],
          [
            "presente",
            "حدث لاحق",
            "cong. presente",
            "Penso che venga domani."
          ],
          [
            "presente",
            "حدث سابق",
            "cong. passato",
            "Penso che sia venuto ieri."
          ],
          [
            "—",
            "مع essere",
            "مطابقة",
            "Credo che sia partita."
          ],
          [
            "—",
            "مع avere",
            "دون مطابقة مع الفاعل",
            "Credo che abbia parlato."
          ],
          [
            "—",
            "مع ضمير مفعول مباشر سابق",
            "مطابقة",
            "Non credo che l'abbia vista."
          ]
        ]
      },
      "examples": [
        {
          "tr": "يؤسفني أنك لم تتمكن من المجيء."
        },
        {
          "tr": "لا أعتقد أنهم فعلوا ذلك عمدًا."
        },
        {
          "tr": "من الغريب أنه لم يُجب."
        },
        {
          "tr": "يبدو أنهم غادروا بالفعل."
        },
        {
          "tr": "آمل أنكم استمتعتم بوقتكم."
        },
        {
          "tr": "أخشى أننا سلكنا الطريق الخطأ."
        }
      ]
    },
    "vocab": [
      "يؤسفني أن",
      "من الغريب أن",
      "يبدو أن",
      "يبدو أن",
      "لديّ انطباع بأن",
      "عمدًا",
      "عن طريق الخطأ",
      "يسلك الطريق الخطأ",
      "يلاحظ؛ ينتبه إلى",
      "يدرك؛ يتبيّن",
      "على ما يبدو",
      "في الواقع"
    ],
    "exercises": [
      {
        "q": "أكمل: «Penso che ___ già partito.» بالفعل essere، والفاعل هو."
      },
      {
        "q": "أكمل: «Non credo che ___ capito.» بالفعل avere، والفاعل هم."
      },
      {
        "q": "ما الفرق بين «Penso che venga domani» و«Penso che sia venuto ieri»؟",
        "opts": [
          "لا فرق",
          "الأولى عن حدث لاحق، والثانية عن حدث سابق",
          "الثانية خاطئة"
        ]
      },
      {
        "q": "أكمل بصيغة congiuntivo passato.",
        "tr": "يؤسفني أنك لم تتمكن من المجيء وأنك فوّتّ الحفلة."
      },
      {
        "q": "ترجم إلى الإيطالية: «لا أعتقد أنهم فعلوا ذلك عمدًا.»"
      },
      {
        "q": "لماذا استُعملت «partita» وليس «partito» في «Credo che sia partita»؟",
        "opts": [
          "لأنها جملة خاطئة",
          "لأن اسم المفعول مع essere يطابق الفاعل",
          "لأن وقعها أجمل"
        ]
      },
      {
        "q": "صِل كل تعبير بمعناه.",
        "pairs": [
          "على ما يبدو",
          "عمدًا",
          "عن طريق الخطأ",
          "يدرك؛ يتبيّن"
        ]
      },
      {
        "tr": "يبدو أنهم غادروا بالفعل."
      },
      {
        "tr": "من الغريب أنه لم يُجب عن الرسالة بعد."
      },
      {
        "tr": "آمل أنكم استمتعتم بوقتكم في الحفلة."
      }
    ]
  },
  "lesson:b1-u01-l4": {
    "theme": "التواصل",
    "title": "إبداء الرأي ومناقشته",
    "objectives": [
      "إبداء الرأي أثناء المحادثة",
      "التعبير عن الموافقة الجزئية والاختلاف",
      "استخدام congiuntivo في نقاش واقعي"
    ],
    "theory": [
      {
        "h": "ثلاث درجات في التعبير عن الرأي",
        "list": [
          "بصيغة متحفّظة: <em>mi sembra che…</em>, <em>ho l'impressione che…</em>, <em>direi che…</em>",
          "بصيغة محايدة: <em>secondo me</em>, <em>penso che</em>, <em>a mio parere</em>",
          "بصيغة مؤكّدة: <em>sono convinto che</em>, <em>non ho dubbi</em>, <em>è evidente che</em>؛ تُستعمل معها عادةً صيغة indicativo."
        ]
      },
      {
        "h": "الاختلاف دون شجار",
        "p": "يمكنك الاختلاف بلباقة باستعمال: <em>Non sono del tutto d'accordo</em>، لست موافقًا تمامًا؛ <em>Sì, però…</em>، نعم، لكن؛ <em>Da un lato hai ragione, dall'altro…</em>، من جهة أنت محق ومن جهة أخرى؛ <em>Vedo il tuo punto, ma…</em>، أفهم وجهة نظرك، لكن. قول <em>no</em> وحده قد يقطع الحوار."
      },
      {
        "h": "عبارات تنظّم المحادثة",
        "p": "<em>Guarda</em>, <em>senti</em>, <em>diciamo</em>, <em>insomma</em>, <em>appunto</em>, <em>anzi</em>. تساعد هذه العبارات في تنظيم الحديث وإظهار موقفك. انتبه إلى <em>Anzi</em>؛ فقد تؤكّد الكلام السابق أو تصحّحه، بمعنى «بل» أو «بل على العكس» بحسب السياق."
      },
      {
        "tip": "<em>Dipende</em> تعني «هذا يتوقف على…» وهي إجابة شائعة حين لا يكفي نعم أو لا. يمكنك توضيحها: <em>dipende da cosa intendi</em>، يتوقف على ما تقصده؛ <em>dipende dai casi</em>، يختلف باختلاف الحالات."
      }
    ],
    "grammar": {
      "title": "لغة التعبير عن الرأي",
      "table": {
        "head": [
          "الوظيفة",
          "العبارة",
          "الصيغة بعد che"
        ],
        "rows": [
          [
            "الرأي",
            "Secondo me / A mio parere",
            "—"
          ],
          [
            "الرأي",
            "Penso / credo / ritengo che",
            "صيغة congiuntivo"
          ],
          [
            "اليقين",
            "Sono sicuro / è evidente che",
            "صيغة indicativo"
          ],
          [
            "الموافقة الجزئية",
            "Da un lato… dall'altro…",
            "—"
          ],
          [
            "الاختلاف",
            "Non sono d'accordo, perché…",
            "صيغة indicativo"
          ],
          [
            "التصحيح",
            "Anzi, direi il contrario.",
            "—"
          ]
        ]
      },
      "examples": [
        {
          "tr": "في رأيي، المشكلة مختلفة."
        },
        {
          "tr": "لديّ انطباع بأننا لا نفهم بعضنا بعضًا."
        },
        {
          "tr": "من جهة أنت محق، ومن جهة أخرى أنتم تبالغون."
        },
        {
          "tr": "لست متفقًا تمامًا مع هذا التفسير."
        },
        {
          "tr": "بل أقول العكس."
        },
        {
          "tr": "يتوقف ذلك على ما تقصده بكلمة «فعّال»."
        }
      ]
    },
    "vocab": [
      "في رأيي",
      "من وجهة نظري",
      "أرى أن",
      "أنا مقتنع بأن",
      "من جهة… ومن جهة أخرى",
      "ليس تمامًا",
      "بل؛ بل على العكس",
      "بالضبط",
      "خلاصة القول",
      "يتوقف على",
      "يبالغ",
      "يفهم وجهة نظر الآخر"
    ],
    "exercises": [
      {
        "q": "أكمل: «Sono sicuro che ___ vero.» بالفعل essere.",
        "opts": [
          "sia",
          "è",
          "fosse"
        ],
        "why": "التعبير عن اليقين هنا يتبعه indicativo."
      },
      {
        "q": "أكمل: «Ritengo che questa soluzione ___ migliore.» بالفعل essere."
      },
      {
        "q": "ما معنى «anzi»؟",
        "opts": [
          "لذلك",
          "بل؛ بل على العكس",
          "في وقت سابق"
        ]
      },
      {
        "q": "صِل كل تعبير بمعناه.",
        "pairs": [
          "بالضبط",
          "خلاصة القول",
          "يتوقف على",
          "يبالغ"
        ]
      },
      {
        "q": "ترجم إلى الإيطالية: «لست متفقًا تمامًا مع هذا الرأي.»"
      },
      {
        "q": "أكمل الحوار.",
        "tr": "في رأيي، المشكلة مختلفة. لديّ انطباع بأننا لا نفهم بعضنا بعضًا."
      },
      {
        "q": "نقاش حول العمل عن بُعد.",
        "setting": "عشاء عند أصدقاء، وينتقل الحديث إلى العمل.",
        "lines": [
          {
            "tr": "في رأيي، أفسد العمل عن بُعد العمل الجماعي."
          },
          {
            "tr": "وافق جزئيًا وأضف وجهة نظر مختلفة.",
            "answerTr": "من جهة أنت محق، ومن جهة أخرى خفّف التوتر."
          },
          {
            "tr": "نعم، لكن الشباب يتعلمون أقل."
          },
          {
            "tr": "أجب بأن الأمر يتوقف على طريقة تنظيم الشركة للعمل.",
            "answerTr": "يتوقف الأمر على طريقة تنظيم الشركة للعمل."
          }
        ]
      },
      {
        "tr": "بل أقول العكس تمامًا."
      },
      {
        "tr": "من جهة هذا صحيح، ومن جهة أخرى يبدو لي تبسيطًا مخلًّا."
      },
      {
        "tr": "في رأيي، يعتمد الأمر كثيرًا على السياق."
      }
    ]
  },
  "lesson:b1-u01-test": {
    "theme": "اختبار",
    "title": "اختبار الوحدة الأولى",
    "objectives": [
      "التحقق من استعمال congiuntivo presente وpassato والتعابير التي تستدعيهما"
    ],
    "theory": [
      {
        "p": "عشرة تمارين. درجة النجاح 70%."
      }
    ],
    "exercises": [
      {},
      {},
      {
        "q": "أكمل: «Penso che tu ___ ragione.»"
      },
      {
        "q": "أكمل: «Benché ___ tardi, esco.»"
      },
      {
        "q": "أكمل: «Siccome ___ tardi, resto.»",
        "opts": [
          "è",
          "sia",
          "fosse"
        ]
      },
      {
        "q": "أكمل: «Spero ___ venire domani.» الفاعل نفسه."
      },
      {
        "q": "أكمل: «Non credo che ___ capito.» بالفعل avere، والفاعل هم."
      },
      {
        "q": "أي التعابير يتبعها congiuntivo؟",
        "opts": [
          "è vero che",
          "può darsi che",
          "prima che",
          "so che"
        ]
      },
      {
        "tr": "يبدو لي أنهم لم يفهموا المشكلة."
      },
      {
        "tr": "أظن أن من الأفضل التحدث عن الأمر غدًا."
      }
    ]
  },
  "unit:b1-u02": {
    "title": "الضمائر المركّبة",
    "grammarNote": "me lo وglielo وce ne · استعمالات ci وne"
  },
  "lesson:b1-u02-l1": {
    "theme": "القواعد",
    "title": "الجمع بين ضميرين",
    "objectives": [
      "الجمع بين ضمير المفعول غير المباشر والمباشر",
      "تذكّر تحوّل النهاية من -i إلى -e",
      "استخدام الضميرين معًا في المحادثة"
    ],
    "theory": [
      {
        "h": "الترتيب: الضمير غير المباشر أولًا",
        "p": "عندما يجتمع ضميران، يأتي <b>ضمير المفعول غير المباشر أولًا</b> وتتغير نهايته من <em>-i</em> إلى <em>-e</em>: <em>mi + lo → <b>me lo</b></em>. في <em>me lo dai</em> يدل me على المتلقّي وlo على الشيء. تعلّم ترتيب الضميرين الإيطاليين معًا بدل نقله من تركيب الجملة العربية."
      },
      {
        "h": "يتحوّل gli وle إلى glie-",
        "p": "تجتمع دلالات «له» و«لها» و«لهم» في <strong>glie-</strong>، وتُكتب <b>كلمة واحدة</b> مع الضمير الثاني: <em>glielo, gliela, glieli, gliele, gliene</em>. يوضّح السياق الشخص المقصود."
      },
      {
        "h": "يلتصقان بالمصدر والأمر",
        "p": "<em>Voglio dartelo</em>، أريد أن أعطيك إياه؛ <em>Puoi spiegarmelo?</em>، هل يمكنك شرحه لي؟ <em>Dammelo!</em>، أعطني إياه! <em>Portaglielo!</em>، خذه إليه! تلتصق مجموعة الضميرين بنهاية الفعل في هذه الصيغ."
      },
      {
        "trap": "في الأزمنة المركّبة، يطابق اسم المفعول الضمير <b>المباشر</b> السابق lo أو la أو li أو le، حتى ضمن مجموعة ضمائر: <em>Me l'ha data</em>، أعطاني إياها؛ <em>Gliele ho mandate</em>، أرسلتها إليه. المقصود أشياء مؤنثة جمعًا في المثال الثاني."
      }
    ],
    "grammar": {
      "title": "جدول الضمائر المركّبة",
      "table": {
        "head": [
          "",
          "lo",
          "la",
          "li",
          "le",
          "ne"
        ],
        "rows": [
          [
            "mi",
            "me lo",
            "me la",
            "me li",
            "me le",
            "me ne"
          ],
          [
            "ti",
            "te lo",
            "te la",
            "te li",
            "te le",
            "te ne"
          ],
          [
            "gli / le",
            "glielo",
            "gliela",
            "glieli",
            "gliele",
            "gliene"
          ],
          [
            "ci",
            "ce lo",
            "ce la",
            "ce li",
            "ce le",
            "ce ne"
          ],
          [
            "vi",
            "ve lo",
            "ve la",
            "ve li",
            "ve le",
            "ve ne"
          ]
        ]
      },
      "examples": [
        {
          "tr": "هل تعيرني السيارة؟ — نعم، سأعيرك إياها."
        },
        {
          "tr": "هل أعطيت الكتاب لماركو؟ — نعم، أعطيته إياه."
        },
        {
          "tr": "هل تشرحه لنا مرة أخرى؟"
        },
        {
          "tr": "كم رسالة إلكترونية أرسل إليك؟ — أرسل إليّ ثلاثًا."
        },
        {
          "tr": "هل يمكنك شرحه لي؟"
        },
        {
          "tr": "أعطني إياه، من فضلك."
        }
      ]
    },
    "vocab": [
      "يُعير",
      "يُعيد",
      "يشرح",
      "يُرسل",
      "يحمل؛ يأخذ",
      "يُهدي",
      "يسلّم",
      "يستعير",
      "مرة أخرى",
      "فورًا",
      "في أقرب وقت ممكن",
      "أخبرني"
    ],
    "exercises": [
      {
        "q": "اختر الرد باستعمال الضمائر على «Mi dai il libro?»:",
        "opts": [
          "Sì, ti lo do.",
          "Sì, te lo do.",
          "Sì, lo ti do."
        ]
      },
      {
        "q": "أكمل: «Hai dato il libro a Marco? — Sì, ___ ho dato.»"
      },
      {
        "q": "أكمل: «Ci spieghi la regola? — Sì, ___ spiego.»",
        "why": "إذا كان الرد موجّهًا إلى مجموعة المخاطبين نقول: ve la spiego، أي أشرحها لكم. الضمير la يعود على la regola."
      },
      {
        "q": "كيف نكتب «gli + lo»؟",
        "opts": [
          "gli lo",
          "glielo",
          "gli-lo"
        ]
      },
      {
        "q": "استبدل الأسماء بالضمائر المناسبة.",
        "tr": "— هل تعيرني السيارة؟ — نعم، سأعيرك إياها بكل سرور. — والمفاتيح؟ — سأعطيك إياها فورًا."
      },
      {
        "q": "ترجم إلى الإيطالية: «هل يمكنك شرحه لي؟»"
      },
      {
        "q": "أكمل النهاية: «Me l'ha dat___.» المقصود la macchina، أي أعطاني السيارة."
      },
      {
        "tr": "سأرسلها إليك غدًا. المقصود أشياء مؤنثة جمعًا."
      },
      {
        "tr": "شرحتُه له ثلاث مرات، لكنه لم يفهمه."
      },
      {
        "tr": "هل يمكنك شرحه لي مرة أخرى، من فضلك؟"
      }
    ]
  },
  "lesson:b1-u02-l2": {
    "theme": "القواعد",
    "title": "استعمالات ci وne",
    "objectives": [
      "تمييز دلالات ci وne المختلفة",
      "استخدام الأفعال المرتبطة بهما",
      "فهم عبارات مثل non ce la faccio"
    ],
    "theory": [
      {
        "h": "أربع دلالات لـ ci",
        "list": [
          "المكان: <em>A Roma ci vado spesso.</em> أي أذهب إلى روما كثيرًا.",
          "الإشارة إلى <em>a + شيء</em>: <em>Ci penso io.</em> أي سأتولى التفكير في الأمر.",
          "الدلالة على الوجود: <em>c'è / ci sono</em>.",
          "جزء من أفعال وتراكيب ثابتة: <em>volerci, metterci, farcela, entrarci, tenerci</em>."
        ]
      },
      {
        "h": "ثلاث دلالات لـ ne",
        "list": [
          "جزء من كمية: <em>Ne voglio due.</em> أي أريد اثنين منها.",
          "الإشارة إلى <em>di + شيء</em>: <em>Ne parliamo domani.</em> أي سنتحدث عن الأمر غدًا.",
          "جزء من أفعال وتراكيب ثابتة: <em>andarsene, fregarsene, accorgersene, intendersene</em>."
        ]
      },
      {
        "h": "تراكيب لا تُترجم كلمة بكلمة",
        "p": "<em>Ci vogliono due ore</em>، يستغرق الأمر ساعتين؛ <em>Ci metto un'ora</em>، أستغرق ساعة؛ <em>Non ce la faccio</em>، لا أستطيع تدبّر الأمر؛ <em>Ci tengo</em>، الأمر مهم بالنسبة إليّ؛ <em>Me ne vado</em>، سأغادر؛ <em>Non me ne intendo</em>، ليست لديّ معرفة بهذا المجال."
      },
      {
        "trap": "لا يتطابق معنى <em>Volerci</em> و<em>metterci</em>. تشير <em>Ci vogliono due ore</em> إلى الوقت المطلوب عمومًا، بينما تشير <em>ci metto due ore</em> إلى الوقت الذي أستغرقه <b>أنا</b>."
      }
    ],
    "grammar": {
      "title": "أفعال مع ci وne",
      "table": {
        "head": [
          "الفعل",
          "المعنى",
          "المثال"
        ],
        "rows": [
          [
            "volerci",
            "يلزم؛ يستغرق",
            "Ci vuole pazienza."
          ],
          [
            "metterci",
            "يستغرق شخص وقتًا",
            "Ci metto venti minuti."
          ],
          [
            "farcela",
            "يتمكّن؛ يتدبّر الأمر",
            "Non ce la faccio più."
          ],
          [
            "tenerci",
            "يهتمّ بالأمر",
            "Ci tengo molto."
          ],
          [
            "andarsene",
            "يغادر",
            "Me ne vado adesso."
          ],
          [
            "fregarsene",
            "لا يبالي إطلاقًا؛ تعبير عامي قد يكون فظًّا",
            "Se ne frega di tutto."
          ],
          [
            "intendersene",
            "تكون لديه معرفة بالمجال",
            "Non me ne intendo."
          ],
          [
            "entrarci",
            "تكون له علاقة بالأمر",
            "Che c'entra?"
          ]
        ]
      },
      "examples": [
        {
          "tr": "يتطلب التعامل مع الإجراءات الإدارية الإيطالية صبرًا."
        },
        {
          "tr": "كم تستغرق من البيت إلى العمل؟"
        },
        {
          "tr": "لا أستطيع إنهاء العمل بحلول هذا المساء."
        },
        {
          "tr": "يهمّني أن تأتي.",
          "note": "يتبع التعبير هنا congiuntivo"
        },
        {
          "tr": "سأغادر، فقد تأخر الوقت."
        },
        {
          "tr": "ليست لديّ أي معرفة بالنبيذ."
        }
      ]
    },
    "vocab": [
      "يلزم؛ يستغرق",
      "يستغرق شخص وقتًا",
      "يتمكّن؛ يتدبّر الأمر",
      "يهتمّ بالأمر",
      "يغادر",
      "لا يبالي إطلاقًا؛ عامي وقد يكون فظًّا",
      "تكون لديه معرفة بالمجال",
      "تكون له علاقة بالأمر",
      "يكون مستاءً من شخص",
      "الصبر",
      "الجهد؛ الالتزام",
      "الوقت اللازم"
    ],
    "exercises": [
      {
        "q": "ما معنى «Ci vogliono due ore»؟",
        "opts": [
          "نريد ساعتين",
          "يستغرق الأمر ساعتين",
          "أستغرق أنا ساعتين"
        ]
      },
      {
        "q": "ما معنى «Ci metto due ore»؟",
        "opts": [
          "يستغرق الأمر ساعتين عمومًا",
          "أستغرق أنا ساعتين",
          "أضعه لمدة ساعتين"
        ]
      },
      {
        "q": "أكمل: «Non ___ la faccio più.» أي لم أعد قادرًا على تدبّر الأمر."
      },
      {
        "q": "أكمل: «Me ___ vado, è tardi.»"
      },
      {
        "q": "صِل كل فعل بمعناه.",
        "pairs": [
          "يهتمّ بالأمر",
          "تكون لديه معرفة بالمجال",
          "تكون له علاقة بالأمر",
          "لا يبالي إطلاقًا"
        ]
      },
      {
        "q": "أكمل الفراغات.",
        "tr": "كم تستغرق للوصول؟ — يستغرق الأمر عشرين دقيقة بالمترو."
      },
      {
        "q": "ترجم إلى الإيطالية: «ليست لديّ معرفة بالنبيذ.»"
      },
      {
        "q": "لماذا استُعمل congiuntivo في «Ci tengo che tu venga»؟",
        "opts": [
          "لأن tenerci هنا يعبّر عن رغبة وشعور",
          "لأن الجملة خاطئة",
          "لأن ci تفرض هذه الصيغة"
        ]
      },
      {
        "tr": "يتطلب الأمر صبرًا كبيرًا، لكننا ننجح في النهاية."
      },
      {
        "tr": "لا أستطيع إنهاء كل شيء اليوم."
      }
    ]
  },
  "lesson:b1-u02-l3": {
    "theme": "القواعد",
    "title": "جمل الصلة",
    "objectives": [
      "استخدام che وcui وil quale",
      "ربط جملتين في جملة واحدة",
      "التعبير عن الملكية باستعمال cui وأداة تعريف"
    ],
    "theory": [
      {
        "h": "معظم جمل الصلة تستعمل che",
        "p": "لا تتغير <strong>Che</strong> وتعود على الفاعل أو المفعول المباشر: <em>il libro <b>che</b> ho letto</em>، الكتاب الذي قرأته؛ <em>la persona <b>che</b> parla</em>، الشخص الذي يتحدث. لا تأتي che الموصولة بعد حرف جر."
      },
      {
        "h": "بعد حرف الجر نستعمل cui",
        "p": "عند الحاجة إلى حرف جر، نستعمل <strong>cui</strong> بدل <em>che</em>: <em>la persona <b>a cui</b> ho scritto</em>، الشخص الذي كتبت إليه؛ <em>la città <b>in cui</b> vivo</em>، المدينة التي أعيش فيها؛ <em>il motivo <b>per cui</b> sono qui</em>، سبب وجودي هنا. بخلاف الضمير العائد في العربية، يأتي حرف الجر الإيطالي قبل أداة الصلة."
      },
      {
        "h": "أداة تعريف مع cui للتعبير عن الملكية",
        "p": "<em>Il ragazzo <b>la cui</b> madre è medico</em>، الفتى الذي تعمل أمّه طبيبة. تطابق أداة التعريف الاسم المملوك اللاحق، لا المالك؛ لذلك جاءت la مع madre المؤنثة، وليس مع ragazzo المذكر."
      },
      {
        "h": "Il quale: صيغة أكثر رسمية",
        "p": "يمكن أن تحل <em>il quale, la quale, i quali, le quali</em> محل بعض استعمالات <em>che</em> و<em>cui</em>، خاصة في الكتابة، مع مراعاة الوظيفة وحرف الجر. تفيد في توضيح المرجع: <em>la sorella di Marco, <b>la quale</b> vive a Roma</em>؛ هنا تشير la quale إلى الأخت لا إلى ماركو."
      }
    ],
    "grammar": {
      "title": "أدوات الصلة",
      "table": {
        "head": [
          "الصيغة",
          "الوظيفة",
          "المثال"
        ],
        "rows": [
          [
            "che",
            "فاعل أو مفعول مباشر",
            "Il film che ho visto."
          ],
          [
            "a cui",
            "مفعول غير مباشر",
            "La persona a cui ho scritto."
          ],
          [
            "in cui",
            "المكان أو الزمن",
            "L'anno in cui sono nato."
          ],
          [
            "di cui",
            "الذي نتحدث عنه",
            "Il libro di cui ti parlavo."
          ],
          [
            "il cui / la cui",
            "الملكية",
            "L'autore il cui libro è famoso."
          ],
          [
            "il quale",
            "صيغة رسمية",
            "Il collega, il quale lavora qui."
          ],
          [
            "chi",
            "مَن؛ الشخص الذي",
            "Chi cerca trova."
          ]
        ]
      },
      "examples": [
        {
          "tr": "الكتاب الذي أقرؤه رائع."
        },
        {
          "tr": "المدينة التي نشأتُ فيها صغيرة."
        },
        {
          "tr": "سبب كتابتي إليك بسيط."
        },
        {
          "tr": "الزميلة التي تدرس ابنتها في روما."
        },
        {
          "tr": "مَن ينام لا يصطاد السمك؛ أي إن الفرص تحتاج إلى سعي.",
          "note": "مثل إيطالي"
        },
        {
          "tr": "هذا هو الشيء الذي كنت أتحدث معك عنه."
        }
      ]
    },
    "vocab": [
      "الذي؛ التي، للفاعل أو المفعول المباشر",
      "أداة صلة تأتي بعد حرف جر",
      "الذي؛ صيغة رسمية",
      "مَن؛ الشخص الذي",
      "السبب",
      "ينمو؛ ينشأ",
      "المؤلف",
      "الشيء الذي نتحدث عنه",
      "الفترة",
      "الحقبة",
      "بفضله؛ بفضلها",
      "في حال"
    ],
    "exercises": [
      {
        "q": "أكمل: «Il libro ___ ho letto è bellissimo.»"
      },
      {
        "q": "أكمل: «La città in ___ vivo è piccola.»"
      },
      {
        "q": "أكمل: «La persona a ___ ho scritto non risponde.»"
      },
      {
        "q": "مع أي اسم تتطابق «la» في «Il ragazzo la cui madre è medico»؟",
        "opts": [
          "مع الفتى",
          "مع الأم، وهي الاسم المملوك",
          "لا تتطابق مع شيء"
        ]
      },
      {
        "q": "أي جملة خاطئة؟",
        "opts": [
          "La città in cui vivo.",
          "La città in che vivo.",
          "La città dove vivo."
        ],
        "why": "لا تأتي che الموصولة بعد حرف جر."
      },
      {
        "q": "أكمل بأدوات الصلة.",
        "tr": "الزميل الذي يعمل معي هو الشخص الذي أدين له بكل شيء."
      },
      {
        "q": "ترجم إلى الإيطالية: «سبب كتابتي إليك بسيط.»"
      },
      {
        "tr": "هذا هو الشيء الذي كنت أتحدث معك عنه."
      },
      {
        "tr": "كانت السنة التي وصلتُ فيها إلى إيطاليا هي الأصعب."
      },
      {
        "tr": "المدينة التي نشأتُ فيها صغيرة جدًا."
      }
    ]
  },
  "lesson:b1-u02-l4": {
    "theme": "القواعد",
    "title": "ضمائر وصفات النكرة",
    "objectives": [
      "استخدام qualche وalcuni وogni وciascuno",
      "تمييز nessuno من niente",
      "تكوين النفي باستعمال non مع أداة نفي أخرى"
    ],
    "theory": [
      {
        "h": "بعد qualche يأتي المفرد دائمًا",
        "p": "<em><b>qualche</b> giorno</em> تعني بضعة أيام؛ المعنى يدل على أكثر من واحد لكن الاسم <b>مفرد</b>. أما <em>alcuni/alcune</em> فتليها صيغة الجمع: <em>alcuni giorni</em>. لا تنقل جمع الاسم من العربية بعد qualche."
      },
      {
        "h": "Ogni وciascuno",
        "p": "لا تتغير <em>Ogni</em> ويليها اسم مفرد: <em>ogni giorno</em>، كل يوم. تتغير <em>Ciascuno</em> وفق نمط أداة التنكير وتركّز على كل فرد على حدة: <em>ciascuno studente</em>، كل طالب."
      },
      {
        "h": "أدوات النفي",
        "p": "<em>Nessuno</em> تعني لا أحد أو لا أيّ، و<em>niente / nulla</em> لا شيء، و<em>nemmeno / neanche</em> ولا حتى. عندما تأتي أداة النفي <b>بعد الفعل</b> نحتاج إلى <em>non</em>: <em>non c'è <b>nessuno</b></em>. وعندما تأتي قبله لا نضيف non: <em><b>Nessuno</b> è venuto.</em> اجتماع أداتي النفي هنا تركيب إيطالي صحيح، ولا يحوّل المعنى إلى الإثبات."
      },
      {
        "tip": "تأتي الصفة بعد <em>Qualcosa</em> بواسطة <em>di</em>: <em>qualcosa <b>di</b> bello</em>، شيء جميل، وكذلك <em>niente di grave</em>، لا شيء خطير. ويأتي المصدر بواسطة <em>da</em>: <em>qualcosa da mangiare</em>، شيء يؤكل."
      }
    ],
    "grammar": {
      "title": "التعبير عن غير المحدّد",
      "table": {
        "head": [
          "الصيغة",
          "التركيب",
          "المثال"
        ],
        "rows": [
          [
            "qualche",
            "مع المفرد",
            "qualche giorno fa"
          ],
          [
            "alcuni / alcune",
            "مع الجمع",
            "alcuni amici"
          ],
          [
            "ogni",
            "ثابتة ويتبعها المفرد",
            "ogni settimana"
          ],
          [
            "ciascuno",
            "متغيرة مع المفرد",
            "ciascuna proposta"
          ],
          [
            "qualcuno / nessuno",
            "للأشخاص",
            "Non c'è nessuno."
          ],
          [
            "qualcosa / niente",
            "للأشياء",
            "qualcosa di nuovo"
          ]
        ]
      },
      "examples": [
        {
          "tr": "نلتقي بعد بضعة أيام."
        },
        {
          "tr": "بعض الزملاء غير موافقين."
        },
        {
          "tr": "تتكرر القصة نفسها كل مرة."
        },
        {
          "tr": "لم أرَ أحدًا في المكتب."
        },
        {
          "tr": "لم يخبرني أحد.",
          "note": "قبل الفعل: لا نضيف non"
        },
        {
          "tr": "هل تريد شيئًا تشربه؟"
        }
      ]
    },
    "vocab": [
      "بعض؛ بضعة، ويتبعها المفرد",
      "بعض؛ بضعة، ويتبعها الجمع",
      "كلّ",
      "كلّ واحد",
      "شخص ما",
      "لا أحد؛ لا أيّ",
      "شيء ما",
      "لا شيء",
      "أيّ شخص",
      "في أيّ مكان",
      "ولا حتى",
      "يُخبر؛ يُنبّه"
    ],
    "exercises": [
      {
        "q": "أي تركيب صحيح؟",
        "opts": [
          "qualche giorni",
          "qualche giorno",
          "qualche dei giorni"
        ],
        "why": "يأتي بعد qualche اسم مفرد دائمًا."
      },
      {
        "q": "وأيّ هذه التراكيب صحيح؟",
        "opts": [
          "alcuni giorno",
          "alcuni giorni",
          "alcuno giorni"
        ]
      },
      {
        "q": "أكمل: «Non c'è ___ in ufficio.» بمعنى لا أحد."
      },
      {
        "q": "أكمل أول الجملة: «___ mi ha avvisato.» بمعنى لم يخبرني أحد."
      },
      {
        "q": "أكمل: «Vuoi qualcosa ___ bere?»"
      },
      {
        "q": "أكمل: «Ho sentito qualcosa ___ strano.»"
      },
      {
        "q": "أي الجمل صحيحة؟",
        "opts": [
          "Non ho visto nessuno.",
          "Ho visto nessuno.",
          "Nessuno è venuto.",
          "Non nessuno è venuto."
        ]
      },
      {
        "q": "أكمل الفراغات.",
        "tr": "في كل مرة أتصل فيها، لا يُجيب أحد."
      },
      {
        "tr": "بعض الزملاء غير موافقين، لكن لا أحد يقول ذلك صراحةً."
      },
      {
        "tr": "نلتقي بعد بضعة أيام، سأكتب إليك أنا."
      }
    ]
  },
  "lesson:b1-u02-test": {
    "theme": "اختبار",
    "title": "اختبار الوحدة الثانية",
    "objectives": [
      "التحقق من الضمائر المركّبة وci وne وجمل الصلة والنكرة"
    ],
    "theory": [
      {
        "p": "عشرة تمارين. درجة النجاح 70%."
      }
    ],
    "exercises": [
      {
        "q": "اختر الرد على «Mi dai il libro?»:",
        "opts": [
          "Sì, ti lo do.",
          "Sì, te lo do.",
          "Sì, lo ti do."
        ]
      },
      {
        "q": "أكمل: «Hai dato il libro a Marco? — Sì, ___ ho dato.»"
      },
      {
        "q": "أكمل: «Non ___ la faccio più.»"
      },
      {
        "q": "أكمل: «Me ___ vado.»"
      },
      {
        "q": "أكمل: «La città in ___ vivo.»"
      },
      {
        "q": "أكمل: «Il libro ___ ho letto.»"
      },
      {
        "q": "اختر التركيب الصحيح:",
        "opts": [
          "qualche giorni",
          "qualche giorno",
          "alcuni giorno"
        ]
      },
      {
        "q": "أكمل: «Vuoi qualcosa ___ mangiare?»"
      },
      {
        "tr": "شرحتُه له، لكن فهمه يحتاج إلى وقت."
      },
      {
        "tr": "سأرسله إليك حالما أستطيع، لا أستطيع الآن."
      }
    ]
  },
  "unit:b1-u03": {
    "title": "الإجراءات الإدارية في إيطاليا",
    "grammarNote": "لغة المكاتب · الوثائق · الطلبات الرسمية"
  },
  "lesson:b1-u03-l1": {
    "theme": "الحياة في إيطاليا",
    "title": "الوثائق الأساسية",
    "objectives": [
      "فهم استعمال codice fiscale وresidenza",
      "طلب إصدار وثيقة",
      "فهم كيفية ملء استمارة بسيطة"
    ],
    "theory": [
      {
        "h": "Codice fiscale: رمز مهم في المعاملات",
        "p": "<strong>Il codice fiscale</strong> هو رمز تعريف ضريبي للأشخاص، يتكوّن عادةً من ستة عشر حرفًا ورقمًا، ويرتبط بالاسم واللقب وتاريخ الميلاد ومكانه. يُطلب في معاملات كثيرة، مثل فتح حساب مصرفي وتوقيع عقد إيجار وشراء شريحة هاتف والتسجيل لدى طبيب. يذكر المصدر أن <em>Agenzia delle Entrate</em> تصدره مجانًا؛ أمّا طريقة الإصدار وموعده فيُتحقّق منهما لدى الجهة المختصة."
      },
      {
        "h": "Residenza ليست مجرد عنوان",
        "p": "<strong>La residenza</strong> تعني تسجيل محل الإقامة لدى البلدية، أي <em>comune</em>. يرتبط بها عدد من المعاملات والخدمات، مثل التسجيل لدى طبيب الأسرة ورخصة القيادة وبعض المساعدات والتخفيضات، بحسب شروط كل خدمة. وقد يجري <em>il vigile</em>، أي موظف من الشرطة المحلية، تحقّقًا من الإقامة الفعلية."
      },
      {
        "h": "ثلاث كلمات شائعة عند الشباك",
        "list": [
          "<em>la marca da bollo</em> — طابع مالي، يُشترى مثلًا من <em>tabaccheria</em> ويُستعمل في بعض الطلبات.",
          "<em>l'autocertificazione</em> — تصريح ذاتي يحل محل بعض الشهادات في الحالات المسموح بها، وله تبعات قانونية.",
          "<em>l'appuntamento</em> — الموعد؛ تتطلب مكاتب كثيرة حجز موعد إلكتروني مسبق."
        ]
      },
      {
        "tip": "<em>La tabaccheria</em> ليست متجر تبغ فقط؛ قد تبيع أيضًا طوابع مالية وتذاكر نقل ورصيد هاتف، وتقدّم خدمات دفع بعض الفواتير، بحسب المتجر."
      }
    ],
    "grammar": {
      "title": "لغة المعاملات الرسمية",
      "table": {
        "head": [
          "العبارة",
          "المعنى",
          "السياق"
        ],
        "rows": [
          [
            "Il sottoscritto / la sottoscritta",
            "الموقّع أدناه / الموقّعة أدناه",
            "الطلبات"
          ],
          [
            "Si prega di…",
            "يُرجى…",
            "التعليمات"
          ],
          [
            "Ai sensi dell'art. …",
            "بموجب المادة…",
            "اللوائح"
          ],
          [
            "In allegato",
            "في المرفقات",
            "الاستمارات"
          ],
          [
            "Entro e non oltre",
            "في موعد أقصاه",
            "المهل"
          ],
          [
            "Rilasciare / rilascio",
            "يُصدر / إصدار",
            "الوثائق"
          ]
        ]
      },
      "examples": [
        {
          "tr": "أودّ طلب الرمز الضريبي."
        },
        {
          "tr": "عليّ تسجيل محل إقامتي في هذه البلدية."
        },
        {
          "tr": "يلزم طابع مالي بقيمة ستة عشر يورو."
        },
        {
          "tr": "سبق أن حجزت الموعد عبر الإنترنت."
        },
        {
          "tr": "تُصدر الوثيقة فورًا."
        },
        {
          "tr": "املأ الاستمارة بأحرف كبيرة واضحة."
        }
      ]
    },
    "vocab": [
      "الرمز الضريبي",
      "محل الإقامة المسجّل",
      "البلدية",
      "مكتب السجل السكاني",
      "الاستمارة",
      "الطابع المالي",
      "التصريح الذاتي",
      "يُصدر وثيقة",
      "الشباك",
      "بأحرف كبيرة واضحة",
      "البطاقة الصحية",
      "تصريح الإقامة"
    ],
    "culture": {
      "title": "من الحياة في إيطاليا: التعامل مع مكتب عام",
      "text": "<p>يشدّد المصدر على <b>تحضير الوثائق قبل الذهاب</b>، لأن فهم المتطلبات قد يختلف بين المكاتب. تحقّق مما تطلبه الجهة نفسها بدل الاعتماد على قائمة عامة.</p><p><b>التصريح الذاتي autocertificazione</b> قد يحل محل بعض الشهادات وفق الشروط المعمول بها. لا يعني ذلك أنه بديل مقبول في كل حالة؛ اسأل المكتب عن الإجراء المناسب.</p><p>قد يساعدك <b>تدوين اسم الموظف الذي تابع طلبك</b> في شرح ما جرى عند المراجعة التالية. هذه ملاحظات لفهم اللغة والسياق، وليست تعليمات قانونية أو ضمانًا لنتيجة إدارية.</p>"
    },
    "exercises": [
      {
        "q": "فيمَ يُستعمل codice fiscale؟",
        "opts": [
          "للضرائب فقط",
          "في معاملات كثيرة، مثل الحساب المصرفي والعقد والتسجيل لدى طبيب",
          "هو رقم هاتف مكتب الضرائب"
        ]
      },
      {
        "q": "أين يُشترى marca da bollo في هذا الدرس؟",
        "opts": [
          "في البلدية",
          "في متجر tabaccheria",
          "في البنك"
        ]
      },
      {
        "q": "أكمل: «Vorrei ___ il codice fiscale.» بمعنى أودّ طلبه."
      },
      {
        "q": "أكمل: «Compili il modulo in ___.» بمعنى بأحرف كبيرة واضحة."
      },
      {
        "q": "صِل كل كلمة بمعناها.",
        "pairs": [
          "مكتب السجل السكاني",
          "الشباك",
          "يُصدر",
          "الاستمارة"
        ]
      },
      {
        "q": "ما معنى «autocertificazione»؟",
        "opts": [
          "شهادة يصدرها المكتب",
          "تصريح ذاتي له أثر قانوني",
          "إقرار موثّق لدى كاتب عدل"
        ]
      },
      {
        "q": "ترجم إلى الإيطالية: «عليّ تسجيل محل إقامتي في هذه البلدية.»"
      },
      {
        "q": "أكمل الطلب عند الشباك.",
        "tr": "صباح الخير، أودّ طلب الرمز الضريبي. سبق أن حجزت الموعد عبر الإنترنت."
      },
      {
        "tr": "يلزم طابع مالي بقيمة ستة عشر يورو ونسخة من وثيقة الهوية."
      },
      {
        "tr": "أودّ طلب الرمز الضريبي، ولديّ جواز السفر."
      }
    ]
  },
  "lesson:b1-u03-l2": {
    "theme": "الحياة في إيطاليا",
    "title": "البنوك والعقود",
    "objectives": [
      "التعبير عن الرغبة في فتح حساب مصرفي",
      "فهم المصطلحات الأساسية في عقد",
      "السؤال عن الرسوم والشروط"
    ],
    "theory": [
      {
        "h": "الحساب وتكاليفه",
        "p": "<em>Il conto corrente</em> هو الحساب الجاري، وقد تترتب عليه <em>il canone mensile</em>، أي رسوم شهرية؛ تختلف العروض، فلا تفترض أن الحساب مجاني. التحويل المصرفي هو <strong>il bonifico</strong>، ورمز الحساب هو <strong>IBAN</strong>. وتُستعمل <em>Il bancomat</em> في الحديث للدلالة على جهاز الصراف الآلي أو بطاقة السحب."
      },
      {
        "h": "كلمات لفهم الحديث عن العقد",
        "list": [
          "<em>le condizioni</em> — الشروط؛ <em>la clausola</em> — البند.",
          "<em>il recesso</em> — الانسحاب من العقد؛ <em>la disdetta</em> — إشعار الإنهاء أو عدم التجديد، بحسب السياق.",
          "<em>la scadenza</em> — موعد الانتهاء؛ <em>il rinnovo automatico</em> — التجديد التلقائي.",
          "<em>le spese di gestione</em> — رسوم الإدارة."
        ]
      },
      {
        "h": "أسئلة مفيدة",
        "p": "<em>Quali sono i costi fissi?</em> ما التكاليف الثابتة؟ <em>C'è un vincolo di durata?</em> هل هناك التزام بمدة محددة؟ <em>Come posso disdire?</em> كيف يمكنني الإنهاء؟ <em>Il rinnovo è automatico?</em> هل يتجدد تلقائيًا؟ تتضمن عقود كثيرة تجديدًا تلقائيًا؛ تُستوضح شروط الإشعار والإنهاء من العقد والجهة المعنية."
      },
      {
        "tip": "قد يُطلب عند التوقيع وضع توقيع مختصر على كل صفحة، أي <em>siglare</em>، أو توقيع ثانٍ عند بعض البنود، أي <em>doppia firma</em>. هذه مفردات لفهم ما يُطلب منك، وليست توصية بالتوقيع دون فهم النص."
      }
    ],
    "grammar": {
      "title": "البنك والعقد",
      "table": {
        "head": [
          "الإيطالية",
          "العربية",
          "السياق"
        ],
        "rows": [
          [
            "il conto corrente",
            "الحساب الجاري",
            "البنك"
          ],
          [
            "il canone mensile",
            "الرسوم الشهرية",
            "البنك؛ الهاتف"
          ],
          [
            "il bonifico",
            "التحويل المصرفي",
            "المدفوعات"
          ],
          [
            "la disdetta",
            "إشعار الإنهاء أو عدم التجديد",
            "العقد"
          ],
          [
            "il rinnovo automatico",
            "التجديد التلقائي",
            "العقد"
          ],
          [
            "il vincolo",
            "الالتزام؛ القيد",
            "العقد"
          ]
        ]
      },
      "examples": [
        {
          "tr": "أودّ فتح حساب جارٍ."
        },
        {
          "tr": "ما الرسوم الشهرية؟"
        },
        {
          "tr": "عليّ إجراء تحويل مصرفي إلى الخارج."
        },
        {
          "tr": "هل هناك التزام بمدة محددة؟"
        },
        {
          "tr": "كيف يمكنني إنهاء العقد؟"
        },
        {
          "tr": "يتجدد تلقائيًا ما لم يُقدَّم إشعار بعدم التجديد."
        }
      ]
    },
    "vocab": [
      "الحساب الجاري",
      "التحويل المصرفي",
      "رقم الحساب المصرفي الدولي IBAN",
      "الصراف الآلي؛ بطاقة السحب",
      "رسوم الاشتراك",
      "العمولة؛ الرسوم",
      "العقد",
      "البند",
      "إشعار الإنهاء أو عدم التجديد",
      "الإشعار المسبق",
      "يوقّع",
      "الالتزام؛ القيد"
    ],
    "exercises": [
      {
        "q": "صِل كل كلمة بمعناها.",
        "pairs": [
          "التحويل المصرفي",
          "إشعار الإنهاء أو عدم التجديد",
          "رسوم الاشتراك",
          "العمولة"
        ]
      },
      {
        "q": "ما معنى «Rinnovo automatico salvo disdetta»؟",
        "opts": [
          "ينتهي العقد تلقائيًا",
          "يتجدد العقد ما لم يُقدَّم إشعار بعدم التجديد",
          "لا يمكن تجديد العقد"
        ]
      },
      {
        "q": "أكمل: «Vorrei aprire un ___ corrente.»"
      },
      {
        "q": "أكمل: «C'è un ___ di durata?» بمعنى التزام بمدة محددة."
      },
      {
        "q": "ترجم إلى الإيطالية: «كيف يمكنني إنهاء العقد؟»"
      },
      {
        "q": "في البنك.",
        "setting": "عند مكتب مستشار مصرفي، بموعد محجوز.",
        "lines": [
          {
            "tr": "صباح الخير، كيف يمكنني مساعدتك؟"
          },
          {
            "tr": "قل إنك تريد فتح حساب.",
            "answerTr": "أودّ فتح حساب جارٍ."
          },
          {
            "tr": "بالتأكيد. هل لديك الرمز الضريبي ووثيقة هوية؟"
          },
          {
            "tr": "أكّد ذلك واسأل عن الرسوم الشهرية.",
            "answerTr": "نعم. ما الرسوم الشهرية؟"
          },
          {
            "tr": "أربعة يورو شهريًا، ومجانًا لمن هم دون الثلاثين."
          }
        ]
      },
      {
        "q": "أكمل الأسئلة الموجّهة إلى المستشار.",
        "tr": "ما العمولات على التحويلات؟ وهل التجديد تلقائي؟"
      },
      {
        "tr": "عليّ إجراء تحويل مصرفي إلى الخارج."
      },
      {
        "tr": "الرسوم أربعة يورو شهريًا، وتشمل البطاقة."
      },
      {
        "tr": "أودّ معرفة ما إذا كان هناك التزام بمدة محددة."
      }
    ]
  },
  "lesson:b1-u03-l3": {
    "theme": "الحياة في إيطاليا",
    "title": "الشكاوى والحقوق",
    "objectives": [
      "صياغة شكوى شفهيًا وكتابيًا",
      "فهم عبارات الإشارة إلى العقد أو القانون",
      "طلب متابعة الشكوى بأدب وحزم"
    ],
    "theory": [
      {
        "h": "ما الذي يجعل الشكوى واضحة؟",
        "p": "تكون الشكوى أوضح عند تضمين <b>الوقائع والتواريخ</b>، و<b>الإشارة ذات الصلة إلى العقد أو القانون</b>، و<b>طلب محدد</b>، و<b>مهلة للرد</b>. التفاصيل تساعد على فهم الطلب أكثر من الاكتفاء بإظهار الغضب. هذه عناصر لغوية لصياغة الشكوى، وليست حكمًا باستحقاق قانوني."
      },
      {
        "h": "عبارات كتابية",
        "list": [
          "<em>Con la presente segnalo che…</em> — أُبلغكم بموجب هذه الرسالة بأن…",
          "<em>Come da contratto…</em> — وفقًا للعقد…",
          "<em>Chiedo pertanto…</em> — لذلك أطلب…",
          "<em>In mancanza di riscontro entro X giorni…</em> — في حال عدم تلقي رد خلال X أيام…"
        ]
      },
      {
        "h": "مفردات متابعة الشكوى",
        "p": "<em>Raccomandata A/R</em> تعني رسالة مسجّلة مع إشعار بالاستلام، و<strong>PEC</strong> اختصار <em>posta elettronica certificata</em>، أي بريد إلكتروني معتمد، يُستخدم في المراسلات ذات الأثر القانوني وفق شروطه. يذكر المصدر جهات للمستهلكين مثل <em>Altroconsumo</em> و<em>Federconsumatori</em>. لا يحدّد هذا الدرس الإجراء المناسب لحالة بعينها."
      },
      {
        "tip": "عبارة <em>Mi riservo di adire le vie legali</em> تعني «أحتفظ بحقي في اللجوء إلى القضاء». هي عبارة رسمية قوية قد تظهر في نهاية شكوى؛ ندرس معناها، ولا نوصي باستعمالها في كل خلاف."
      }
    ],
    "grammar": {
      "title": "لغة الشكاوى",
      "table": {
        "head": [
          "الوظيفة",
          "العبارة",
          "العربية"
        ],
        "rows": [
          [
            "الإبلاغ",
            "Con la presente segnalo che…",
            "أُبلغكم بموجب هذه الرسالة بأن…"
          ],
          [
            "الاستناد",
            "Come da contratto / ai sensi di legge",
            "وفقًا للعقد / بموجب القانون"
          ],
          [
            "الطلب",
            "Chiedo il rimborso / la sostituzione.",
            "أطلب استرداد المبلغ / الاستبدال."
          ],
          [
            "المهلة",
            "entro quindici giorni",
            "خلال خمسة عشر يومًا"
          ],
          [
            "التصعيد",
            "Mi riservo di adire le vie legali.",
            "أحتفظ بحقي في اللجوء إلى القضاء."
          ],
          [
            "شفهيًا",
            "Vorrei parlare con un responsabile.",
            "أودّ التحدث إلى مسؤول."
          ]
        ]
      },
      "examples": [
        {
          "tr": "وصل المنتج تالفًا."
        },
        {
          "tr": "أودّ تقديم شكوى."
        },
        {
          "tr": "يحقّ لي استرداد المبلغ خلال أربعة عشر يومًا."
        },
        {
          "tr": "وفقًا للعقد، كان يُفترض أن تعمل الخدمة ابتداءً من اليوم الأول."
        },
        {
          "tr": "أرسل إليكم المستندات في المرفقات."
        },
        {
          "tr": "أنتظر ردّكم."
        }
      ]
    },
    "vocab": [
      "الشكوى",
      "يقدّم شكوى",
      "استرداد المبلغ",
      "الاستبدال",
      "تالف",
      "معيب",
      "الضمان",
      "المسؤول",
      "الرسالة المسجّلة",
      "الرد",
      "يحقّ له",
      "لذلك"
    ],
    "exercises": [
      {
        "q": "صِل كل كلمة بمعناها.",
        "pairs": [
          "استرداد المبلغ",
          "معيب",
          "الضمان",
          "الرد"
        ]
      },
      {
        "q": "أكمل: «Vorrei ___ un reclamo.»"
      },
      {
        "q": "أكمل: «Ho ___ al rimborso.» بمعنى يحقّ لي استرداد المبلغ."
      },
      {
        "q": "ما المقصود بـ PEC في هذا الدرس؟",
        "opts": [
          "نوع من التحويل المصرفي",
          "بريد إلكتروني معتمد له حجية المراسلة المسجّلة وفق شروطه",
          "رقم وثيقة هوية"
        ]
      },
      {
        "q": "ترجم إلى الإيطالية: «وصل المنتج تالفًا، وأطلب استرداد المبلغ.»"
      },
      {
        "q": "أكمل الرسالة.",
        "tr": "أُبلغكم بموجب هذه الرسالة بأن الخدمة لا تعمل. وفقًا للعقد، أطلب استرداد المبلغ خلال خمسة عشر يومًا."
      },
      {
        "tr": "أودّ التحدث إلى مسؤول."
      },
      {
        "q": "أي عنصر يجعل الشكوى أوضح وأكثر تحديدًا؟",
        "opts": [
          "إظهار مدى الغضب",
          "التواريخ والإشارة إلى العقد وطلب محدد",
          "تكرار الطلب ثلاث مرات"
        ]
      },
      {
        "tr": "وفقًا للعقد، كان يُفترض أن تعمل الخدمة ابتداءً من اليوم الأول من الشهر."
      },
      {
        "tr": "أودّ تقديم شكوى: المنتج معيب."
      }
    ]
  },
  "lesson:b1-u03-l4": {
    "theme": "الحياة في إيطاليا",
    "title": "العمل وأنواع العقود",
    "objectives": [
      "فهم مصطلحات عقود العمل الإيطالية",
      "الحديث عن شروط العمل",
      "السؤال عن الأجر والإجازات"
    ],
    "theory": [
      {
        "h": "أنواع العقود والعمل",
        "list": [
          "<b>tempo indeterminato</b> — عقد غير محدد المدة، ويرتبط عادةً باستقرار أكبر.",
          "<b>tempo determinato</b> — عقد محدد المدة؛ يخضع تجديده لشروط وحدود.",
          "<b>partita IVA</b> — رقم ضريبي يرتبط هنا بالعمل المستقل، مع إصدار فواتير والتزامات اشتراكات بحسب الوضع.",
          "<b>apprendistato / tirocinio</b> — تلمذة مهنية / تدريب عملي؛ يختلف النوعان وشروطهما، ويرتبطان كثيرًا ببداية الحياة المهنية."
        ]
      },
      {
        "h": "الأجر الصافي والإجمالي والراتب الثالث عشر",
        "p": "قد تسمع الأجر بوصفه <b>مبلغًا شهريًا صافيًا</b>، أو <em>RAL</em>، أي <em>retribuzione annua lorda</em>: الأجر السنوي الإجمالي قبل الاقتطاعات. <strong>La tredicesima</strong> دفعة الراتب الثالث عشر المرتبطة عادةً بشهر ديسمبر، و<em>la quattordicesima</em> دفعة رابعة عشرة في بعض القطاعات، غالبًا في الصيف. التفاصيل بحسب العقد؛ لا تُفترض إضافة هذه المبالغ مرة أخرى إلى RAL دون توضيح."
      },
      {
        "h": "الإجازات والأذونات",
        "p": "<em>Le ferie</em> هي الإجازة مدفوعة الأجر، و<em>i permessi</em> أذونات غياب قد تُحسب بالساعات، و<em>la malattia</em> الغياب المرضي. يورد المصدر عدد 26 يوم عمل مثالًا للإجازة، لكنه ليس قاعدة عامة لكل عقد. <em>Il CCNL</em>، أي <em>contratto collettivo nazionale</em>، هو الاتفاق الجماعي الوطني للقطاع، الذي ينظّم شروطًا أساسية للعمل."
      },
      {
        "tip": "السؤال <em>Qual è la RAL prevista?</em> يعني «ما الأجر السنوي الإجمالي المقترح؟» ويمكن طرحه بأدب في مقابلة العمل عندما يأتي الحديث عن شروط الوظيفة."
      }
    ],
    "grammar": {
      "title": "العمل والأجر",
      "table": {
        "head": [
          "الإيطالية",
          "العربية",
          "ملاحظة"
        ],
        "rows": [
          [
            "tempo indeterminato",
            "عقد غير محدد المدة",
            "أكثر استقرارًا عادةً"
          ],
          [
            "tempo determinato",
            "عقد محدد المدة",
            "له تاريخ انتهاء"
          ],
          [
            "partita IVA",
            "العمل المستقل في هذا السياق",
            "التزامات اشتراكات بحسب الوضع"
          ],
          [
            "la tredicesima",
            "الراتب الثالث عشر",
            "يُدفع عادةً في ديسمبر"
          ],
          [
            "le ferie",
            "إجازة مدفوعة الأجر",
            "تُحسب بأيام وفق نظام العقد"
          ],
          [
            "il CCNL",
            "الاتفاق الجماعي للقطاع",
            "ينظّم شروطًا أساسية"
          ]
        ]
      },
      "examples": [
        {
          "tr": "لديّ عقد غير محدد المدة."
        },
        {
          "tr": "أعمل مستقلًا بنظام partita IVA منذ ثلاث سنوات."
        },
        {
          "tr": "ما الأجر السنوي الإجمالي المقترح لهذه الوظيفة؟"
        },
        {
          "tr": "كم يومًا من الإجازة مقرّر؟"
        },
        {
          "tr": "فترة التجربة ثلاثة أشهر."
        },
        {
          "tr": "أطلب إذن غياب لأسباب شخصية."
        }
      ]
    },
    "vocab": [
      "العقد غير محدد المدة",
      "الرقم الضريبي للعمل المستقل في هذا السياق",
      "الأجر الصافي",
      "الأجر السنوي الإجمالي",
      "الراتب الثالث عشر",
      "الإجازة مدفوعة الأجر",
      "إذن الغياب",
      "فترة التجربة",
      "مقابلة العمل",
      "السيرة الذاتية",
      "يوظّف",
      "يستقيل"
    ],
    "exercises": [
      {
        "q": "صِل كل تعبير بمعناه.",
        "pairs": [
          "غير محدد المدة",
          "الراتب الثالث عشر",
          "الإجازة مدفوعة الأجر",
          "فترة التجربة"
        ]
      },
      {
        "q": "ما معنى RAL؟",
        "opts": [
          "الأجر الشهري الصافي",
          "الأجر السنوي الإجمالي",
          "نوع من العقود"
        ]
      },
      {
        "q": "مَن يتولى دفع الاشتراكات في حالة العامل المستقل بنظام partita IVA في هذا المثال؟",
        "opts": [
          "صاحب العمل",
          "العامل نفسه",
          "لا أحد"
        ]
      },
      {
        "q": "أكمل: «Il ___ di prova è di tre mesi.»"
      },
      {
        "q": "ترجم إلى الإيطالية: «كم يومًا من الإجازة مقرّر؟»"
      },
      {
        "q": "أكمل أسئلة المقابلة.",
        "tr": "ما الأجر السنوي الإجمالي المقترح؟ وكم تدوم فترة التجربة؟"
      },
      {
        "q": "ما معنى «Licenziarsi»؟",
        "opts": [
          "يفصل شخصًا من العمل",
          "يستقيل",
          "يحصل على زيادة في الأجر"
        ]
      },
      {
        "tr": "لديّ عقد غير محدد المدة منذ سنتين."
      },
      {
        "tr": "يُدفع الراتب الثالث عشر في ديسمبر مع الراتب الشهري."
      },
      {
        "tr": "أودّ معرفة الأجر السنوي الإجمالي المقترح لهذه الوظيفة."
      }
    ]
  },
  "lesson:b1-u03-test": {
    "theme": "اختبار",
    "title": "اختبار الوحدة الثالثة",
    "objectives": [
      "التحقق من مفردات المكاتب والبنوك والعمل"
    ],
    "theory": [
      {
        "p": "عشرة تمارين. درجة النجاح 70%."
      }
    ],
    "exercises": [
      {
        "q": "يُستعمل codice fiscale في:",
        "opts": [
          "الضرائب فقط",
          "معاملات كثيرة",
          "السفر"
        ]
      },
      {
        "q": "يُشترى marca da bollo من:",
        "opts": [
          "البلدية",
          "متجر tabaccheria",
          "البنك"
        ]
      },
      {
        "q": "أكمل: «Compili il modulo in ___.»"
      },
      {
        "q": "أكمل: «Vorrei aprire un ___ corrente.»"
      },
      {
        "q": "أكمل: «Vorrei ___ un reclamo.»"
      },
      {
        "q": "أكمل: «Ho ___ al rimborso.»"
      },
      {
        "q": "تشير RAL إلى:",
        "opts": [
          "الأجر الشهري الصافي",
          "الأجر السنوي الإجمالي",
          "الراتب الثالث عشر"
        ]
      },
      {
        "q": "صِل كل كلمة بمعناها.",
        "pairs": [
          "إشعار الإنهاء أو عدم التجديد",
          "التحويل المصرفي",
          "الإجازة مدفوعة الأجر",
          "مكتب السجل السكاني"
        ]
      },
      {
        "tr": "لتسجيل محل الإقامة، تلزم وثيقة هوية وعقد إيجار."
      },
      {
        "tr": "أودّ طلب الرمز الضريبي وتسجيل محل إقامتي."
      }
    ]
  },
  "unit:b1-u04": {
    "title": "الإعلام وبناء الحجّة",
    "grammarNote": "الكلام المنقول · أدوات الربط · لغة الصحافة"
  },
  "lesson:b1-u04-l1": {
    "theme": "الإعلام",
    "title": "الكلام المنقول",
    "objectives": [
      "نقل كلام شخص بصيغة غير مباشرة",
      "تغيير الأزمنة بما يناسب السياق",
      "تغيير عبارات الزمان والمكان عند الحاجة"
    ],
    "theory": [
      {
        "h": "تحويل الزمن",
        "p": "عندما يكون فعل النقل في الماضي، تتحول الأزمنة عادةً بحسب العلاقة الزمنية: <em>presente → imperfetto</em>، و<em>passato prossimo → trapassato</em>، و<em>futuro → condizionale passato</em>. هذه أنماط نتدرب عليها هنا؛ قد يبقى الزمن الأصلي إذا ظلّ مضمونه وتوقيته قائمين عند النقل."
      },
      {
        "trap": "للتعبير عن حدث كان لاحقًا لكلام قيل في الماضي، نستعمل هنا condizionale passato: <em>Ha detto che <b>sarebbe venuto</b></em>، أي قال إنه سيأتي. لا نستعمل «che verrebbe» لهذا المعنى في النمط المعياري. لا تنقل صيغة المستقبل العربية حرفيًا إلى الإيطالية."
      },
      {
        "h": "تتغيّر أيضًا إشارات الزمان والمكان",
        "p": "عندما تتغير نقطة الإشارة، نقول: <em>oggi → quel giorno</em>، اليوم ← ذلك اليوم؛ <em>ieri → il giorno prima</em>، أمس ← اليوم السابق؛ <em>domani → il giorno dopo</em>، غدًا ← اليوم التالي؛ <em>qui → lì</em>، هنا ← هناك؛ <em>questo → quello</em>، هذا ← ذلك؛ <em>adesso → allora</em>، الآن ← آنذاك. يعتمد التغيير على سياق نقل الكلام."
      },
      {
        "h": "نقل الأوامر والأسئلة",
        "p": "يتحول الأمر في هذا التركيب إلى <em>di</em> مع المصدر: <em>\"Vieni!\" → Mi ha detto di venire.</em> أي طلب مني أن آتي. ويُستعمل <em>se</em> لنقل سؤال جوابه نعم أو لا: <em>\"Vieni?\" → Mi ha chiesto se venivo.</em> أي سألني إن كنت سآتي."
      }
    ],
    "grammar": {
      "title": "تحويلات الكلام المنقول",
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
            "\"Lavoro\" → Disse che lavorava."
          ],
          [
            "passato prossimo",
            "trapassato",
            "\"Ho finito\" → Disse che aveva finito."
          ],
          [
            "futuro",
            "condizionale passato",
            "\"Verrò\" → Disse che sarebbe venuto."
          ],
          [
            "imperativo",
            "di مع المصدر",
            "\"Vieni!\" → Mi disse di venire."
          ],
          [
            "سؤال جوابه نعم أو لا",
            "se مع جملة",
            "\"Vieni?\" → Mi chiese se venivo."
          ],
          [
            "cong. presente",
            "cong. imperfetto",
            "\"Penso che sia\" → Disse che pensava che fosse."
          ]
        ]
      },
      "examples": [
        {
          "tr": "قال ماركو إنه كان متعبًا."
        },
        {
          "tr": "قال لي إنه سيصل في اليوم التالي."
        },
        {
          "tr": "سأل إن كنت أستطيع مساعدته."
        },
        {
          "tr": "قال لي ألّا أقلق."
        },
        {
          "tr": "أوضح أنه سبق أن حاول."
        },
        {
          "tr": "وأضاف أن الأمر كان مستحيلًا في ذلك اليوم."
        }
      ]
    },
    "vocab": [
      "يقول إن",
      "يسأل إن كان",
      "يشرح؛ يوضّح",
      "يُضيف",
      "يُجيب",
      "يرى؛ يدافع عن رأي",
      "يؤكّد؛ يصرّح",
      "ينفي",
      "اليوم السابق / التالي",
      "آنذاك",
      "في تلك اللحظة",
      "بحسب ما قيل"
    ],
    "exercises": [
      {
        "q": "انقل «Verrò domani» بعد فعل في الماضي، مع نقل الإشارة إلى يوم لاحق لذلك الكلام:",
        "opts": [
          "Ha detto che verrà domani.",
          "Ha detto che sarebbe venuto il giorno dopo.",
          "Ha detto che verrebbe domani."
        ]
      },
      {
        "q": "حوّل: «Lavoro molto» ← «Ha detto che ___ molto.»"
      },
      {
        "q": "حوّل: «Ho finito» ← «Ha detto che ___ finito.»"
      },
      {
        "q": "حوّل: «Vieni!» ← «Mi ha detto ___ venire.»"
      },
      {
        "q": "حوّل: «Vieni?» ← «Mi ha chiesto ___ venivo.»"
      },
      {
        "q": "حوّل الكلام إلى صيغة غير مباشرة.",
        "tr": "«سأتصل بك غدًا» ← قال لي إنه سيتصل بي في اليوم التالي."
      },
      {
        "q": "صِل عبارات الزمان والمكان بصيغها عند نقل الكلام.",
        "pairs": [
          "ذلك اليوم",
          "اليوم السابق",
          "اليوم التالي",
          "هناك"
        ]
      },
      {
        "q": "ترجم إلى الإيطالية: «قال لي ألّا أقلق.»"
      },
      {
        "tr": "أوضح أنه سبق أن حاول عدة مرات دون نجاح."
      },
      {
        "tr": "قال لي إنه سيصل في اليوم التالي."
      }
    ]
  },
  "lesson:b1-u04-l2": {
    "theme": "الإعلام",
    "title": "قراءة الصحافة",
    "objectives": [
      "فهم بنية المقال الإخباري",
      "تمييز لغة الأخبار غير المؤكدة",
      "تلخيص نص بكلماتك"
    ],
    "theory": [
      {
        "h": "صيغة condizionale في الأخبار",
        "p": "قد تستعمل وسائل الإعلام الإيطالية condizionale لنقل خبر <b>غير مؤكّد</b>: <em>Il ministro <b>avrebbe</b> firmato l'accordo</em>، أي يُقال إن الوزير وقّع الاتفاق، دون تأكيد الخبر. تُبعد الصيغة مسؤولية التأكيد المباشر عن الناقل؛ ولا تثبت وحدها أن المصدر غير رسمي. قد تقابلها العربية بـ«يُقال إن» أو «بحسب أنباء غير مؤكدة»."
      },
      {
        "h": "بنية المقال",
        "p": "<em>Il titolo</em> العنوان؛ <em>l'occhiello</em> عبارة تمهيدية فوق العنوان؛ <em>il sommario</em> موجز مرافق للعنوان؛ <em>il corpo</em> متن المقال؛ <em>la didascalia</em> التعليق المصاحب للصورة. قد تكون العناوين الإيطالية مختصرة بلا فعل."
      },
      {
        "h": "تحويل الفعل إلى اسم",
        "p": "تكثر في لغة الصحافة التراكيب الاسمية: <em>hanno approvato la legge</em>، وافقوا على القانون، تصبح <em>l'approvazione della legge</em>، إقرار القانون. يُكثّف ذلك المعلومات وقد يصعّب القراءة في البداية؛ تمييز العلاقة بين الفعل والاسم يساعدك على الفهم."
      },
      {
        "tip": "من المصادر التي يذكرها الدرس: <em>Corriere della Sera</em>، و<em>la Repubblica</em>، و<em>Il Sole 24 Ore</em> المتخصص في الاقتصاد، و<em>Il Post</em> الذي يعرض كثيرًا من الأخبار بأسلوب تفسيري مناسب للتدرّب على القراءة."
      }
    ],
    "grammar": {
      "title": "لغة الصحافة",
      "table": {
        "head": [
          "السمة",
          "المثال",
          "المعنى"
        ],
        "rows": [
          [
            "صيغة condizionale",
            "Avrebbe dichiarato che…",
            "يُقال إنه صرّح بأن…"
          ],
          [
            "تحويل الفعل إلى اسم",
            "l'approvazione della riforma",
            "إقرار الإصلاح"
          ],
          [
            "المبني للمجهول",
            "La legge è stata approvata.",
            "أُقرّ القانون"
          ],
          [
            "عنوان مختصر",
            "Governo verso la crisi",
            "الحكومة تتجه نحو أزمة"
          ],
          [
            "الإشارة إلى المصدر",
            "secondo fonti vicine a…",
            "بحسب مصادر مقرّبة من…"
          ],
          [
            "الأرقام",
            "in calo / in aumento",
            "في انخفاض / في ارتفاع"
          ]
        ]
      },
      "examples": [
        {
          "tr": "بحسب مصادر داخلية، يُقال إن الشركة اتخذت قرارها بالفعل."
        },
        {
          "tr": "أُقرّ الإصلاح بمئتين وعشرة أصوات مؤيدة."
        },
        {
          "tr": "أرقام التوظيف في ارتفاع."
        },
        {
          "tr": "يرى المقال أن المشكلة بنيوية."
        },
        {
          "tr": "نفت الصحيفة الخبر."
        },
        {
          "tr": "خلاصة القول: القضية الأساسية هي التمويل."
        }
      ]
    },
    "vocab": [
      "الصحيفة اليومية",
      "المجلة أو الصحيفة الأسبوعية",
      "الخبر",
      "المصدر",
      "ينفي خبرًا",
      "يرى؛ يدافع عن رأي",
      "في ارتفاع / في انخفاض",
      "التحقيق الصحفي",
      "المقال الافتتاحي",
      "العنوان",
      "يلخّص",
      "موثوق"
    ],
    "exercises": [
      {
        "q": "ما معنى «Il ministro avrebbe firmato l'accordo» في الخبر؟",
        "opts": [
          "وقّع الوزير الاتفاق يقينًا",
          "يُقال إن الوزير وقّع، والخبر غير مؤكّد",
          "كان الوزير سيوقّع لو استطاع"
        ]
      },
      {
        "q": "أي تعبير فعلي يقابله التركيب الاسمي «L'approvazione della legge»؟",
        "opts": [
          "approvare la legge",
          "la legge approvata",
          "legalmente"
        ]
      },
      {
        "q": "أكمل: «I dati sono in ___.» بمعنى في ارتفاع."
      },
      {
        "q": "أكمل: «Il giornale ha ___ la notizia.» بمعنى نفى الخبر."
      },
      {
        "q": "صِل كل كلمة بمعناها.",
        "pairs": [
          "الصحيفة اليومية",
          "المصدر",
          "التحقيق الصحفي",
          "موثوق"
        ]
      },
      {
        "q": "إلى ماذا تشير عبارة «Secondo fonti vicine al governo» في هذا التمرين؟",
        "opts": [
          "معلومات رسمية معلنة",
          "معلومات من مصادر غير رسمية",
          "رأي هيئة التحرير"
        ]
      },
      {
        "q": "أكمل الجملة الإخبارية.",
        "tr": "بحسب مصادر داخلية، يُقال إن الشركة اتخذت قرارها بالفعل، لكن المتحدث نفى الخبر."
      },
      {
        "q": "ترجم إلى الإيطالية: «أُقرّ الإصلاح الأسبوع الماضي.»"
      },
      {
        "tr": "بحسب الصحيفة، يُقال إن الحكومة أعدّت الرد بالفعل."
      },
      {
        "tr": "يرى المقال أن المشكلة بنيوية."
      }
    ]
  },
  "lesson:b1-u04-l3": {
    "theme": "التواصل",
    "title": "ربط الأفكار وبناء الحجّة",
    "objectives": [
      "ربط الحجج بأدوات مناسبة",
      "تنظيم الكلام ترتيبًا واضحًا",
      "تجنّب الاكتفاء بتكرار e لربط كل الجمل"
    ],
    "theory": [
      {
        "h": "أداة الربط توضّح العلاقة بين الأفكار",
        "p": "من دون روابط، قد يبدو النص قائمة جمل منفصلة. تدل <em>Inoltre</em> على إضافة، و<em>tuttavia</em> على استدراك، و<em>quindi</em> على نتيجة، و<em>infatti</em> على تفسير أو تأكيد. اختيار الرابط جزء من المعنى، وليس زينة للنص."
      },
      {
        "h": "تعابير يسهل الخلط بينها",
        "list": [
          "<em>infatti</em> للتأكيد أو التفسير، بمعنى «فعلًا؛ إذ إنّ»، مقابل <em>invece</em> للمقابلة أو البديل، بمعنى «بينما؛ بدلًا من ذلك».",
          "<em>anzi</em> للتقوية أو التصحيح، بمعنى «بل؛ بل على العكس»، مقابل <em>però</em>، «لكن».",
          "<em>quindi</em> للنتيجة، «لذلك»، مقابل <em>allora</em>، «إذًا؛ آنذاك»، وتُستعمل أيضًا لتنظيم الحديث.",
          "<em>comunque</em>، «على أي حال»، مقابل <em>tuttavia</em>، «مع ذلك»، وهي أكثر شيوعًا في الأسلوب الرسمي."
        ]
      },
      {
        "h": "هيكل لحجّة قصيرة",
        "p": "<em>Anzitutto…</em>، أولًا ← <em>Inoltre…</em>، علاوة على ذلك ← <em>Tuttavia…</em>، مع ذلك ← <em>In conclusione…</em>، ختامًا. يساعدك هذا التسلسل على تنظيم إجابة شفهية أو نص قصير في مستوى B1."
      },
      {
        "tip": "تشيع في المحادثة <em>allora</em>, <em>comunque</em>, <em>insomma</em>, <em>cioè</em>. وتناسب <em>tuttavia</em>, <em>pertanto</em>, <em>in effetti</em> الكتابة أيضًا. الاختيار بحسب المعنى والسياق، وليس منعًا مطلقًا من استعمالها شفهيًا."
      }
    ],
    "grammar": {
      "title": "أدوات الربط حسب الوظيفة",
      "table": {
        "head": [
          "الوظيفة",
          "أدوات الربط",
          "المثال"
        ],
        "rows": [
          [
            "الإضافة",
            "inoltre, in più, per di più",
            "Inoltre il prezzo è alto."
          ],
          [
            "المقابلة والاستدراك والتصحيح",
            "però, tuttavia, invece, anzi",
            "Tuttavia i dati dicono altro."
          ],
          [
            "السبب",
            "perché, poiché, siccome, dato che",
            "Siccome piove, restiamo."
          ],
          [
            "النتيجة",
            "quindi, perciò, dunque, pertanto",
            "Quindi ho deciso di partire."
          ],
          [
            "التفسير",
            "cioè, ovvero, in altre parole",
            "Cioè, non è possibile."
          ],
          [
            "الخلاصة",
            "insomma, in conclusione",
            "Insomma, non conviene."
          ]
        ]
      },
      "examples": [
        {
          "tr": "أولًا، التكلفة مرتفعة جدًا."
        },
        {
          "tr": "علاوة على ذلك، ليس لدينا وقت كافٍ."
        },
        {
          "tr": "مع ذلك، يوجد بديل."
        },
        {
          "tr": "المشروع معقّد، ولذلك يحتاج إلى موارد أكثر."
        },
        {
          "tr": "ليس غاليًا، بل سعره مناسب."
        },
        {
          "tr": "ختامًا، أقترح التأجيل."
        }
      ]
    },
    "vocab": [
      "أولًا؛ قبل كل شيء",
      "علاوة على ذلك",
      "مع ذلك",
      "بينما؛ بدلًا من ذلك",
      "بل؛ بل على العكس",
      "لذلك",
      "بناءً على ذلك",
      "أي؛ بمعنى",
      "في الواقع",
      "من ناحية أخرى",
      "ختامًا",
      "على أي حال"
    ],
    "exercises": [
      {
        "q": "أكمل: «Non è caro, ___ è conveniente.» بمعنى بل على العكس.",
        "opts": [
          "però",
          "anzi",
          "invece"
        ]
      },
      {
        "q": "اختر الرابط المناسب: «Il progetto è complesso, ___ servono più risorse.»",
        "opts": [
          "perciò",
          "invece",
          "cioè"
        ]
      },
      {
        "q": "أكمل: «___ il costo è troppo alto.» بمعنى أولًا."
      },
      {
        "q": "أكمل: «___, propongo di rimandare.» بمعنى ختامًا."
      },
      {
        "q": "صِل أداة الربط بوظيفتها.",
        "pairs": [
          "الإضافة",
          "الاستدراك",
          "النتيجة",
          "التفسير"
        ]
      },
      {
        "q": "أكمل بناء الحجّة.",
        "tr": "أولًا، السعر مرتفع. علاوة على ذلك، ليس لدينا وقت. لذلك أقترح التأجيل."
      },
      {
        "q": "أي رابط أقرب إلى الأسلوب الكتابي الرسمي من المحادثة العفوية؟",
        "opts": [
          "comunque",
          "pertanto",
          "allora"
        ]
      },
      {
        "tr": "مع ذلك، يوجد بديل يستحق النظر فيه."
      },
      {
        "tr": "أولًا التكلفة، وعلاوة على ذلك المواعيد: ختامًا، الأمر لا يستحق."
      },
      {
        "tr": "من جهة هذا صحيح، ومن جهة أخرى تشير البيانات إلى غير ذلك."
      }
    ]
  },
  "lesson:b1-u04-l4": {
    "theme": "التواصل",
    "title": "تقديم إجابة مترابطة أطول",
    "objectives": [
      "بناء إجابة من نحو دقيقتين حول موضوع",
      "دعم الرأي بمثال وبيانات",
      "إنهاء الكلام بخلاصة"
    ],
    "theory": [
      {
        "h": "هيكل مفيد لتنظيم الإجابة",
        "list": [
          "<b>الرأي الأساسي</b>: <em>Secondo me…</em> / <em>Ritengo che…</em>",
          "<b>الحجّة الأولى ومثال</b>: <em>Anzitutto… Per esempio…</em>",
          "<b>الحجّة الثانية</b>: <em>Inoltre…</em>",
          "<b>رأي مخالف والرد عليه</b>: <em>C'è chi sostiene che… Tuttavia…</em>",
          "<b>الخلاصة</b>: <em>In conclusione…</em>"
        ]
      },
      {
        "h": "الاعتراف بجزء من الرأي الآخر",
        "p": "تبدو الإجابة أكثر توازنًا عندما تعترف بنقطة معقولة في الرأي الآخر ثم توضّح موقفك. من الصيغ المناسبة: <em>È vero che…, tuttavia…</em>، صحيح أن… ومع ذلك…؛ أو <em>Capisco chi dice che…, però…</em>، أفهم مَن يقول إن… لكن…"
      },
      {
        "h": "عبارات تمنحك وقتًا للتفكير",
        "p": "<em>Diciamo che…</em>، لنقل إن…؛ <em>In un certo senso…</em>، بمعنى ما…؛ <em>Come dire…</em>، كيف أعبّر…؛ <em>Se ci pensi…</em>، إذا فكّرت في الأمر… تساعدك هذه العبارات على متابعة الحديث أثناء البحث عن كلمة، وهي استراتيجية تواصل وليست مجرد حشو."
      },
      {
        "tip": "لا تترجم من العربية جملةً جملة. كوّن جملًا إيطالية أبسط واربطها بأدوات مناسبة؛ يكون ذلك أوضح وأكثر سلاسة من محاولة نقل تركيب عربي معقّد حرفيًا."
      }
    ],
    "grammar": {
      "title": "هيكل الإجابة",
      "table": {
        "head": [
          "المرحلة",
          "العبارة",
          "العربية"
        ],
        "rows": [
          [
            "الرأي الأساسي",
            "Ritengo che… / Secondo me…",
            "أرى أن… / في رأيي…"
          ],
          [
            "الحجّة",
            "Anzitutto… / Inoltre…",
            "أولًا… / علاوة على ذلك…"
          ],
          [
            "المثال",
            "Per esempio… / Basti pensare a…",
            "مثلًا… / يكفي أن نفكّر في…"
          ],
          [
            "الرأي المخالف",
            "C'è chi sostiene che…",
            "هناك مَن يرى أن…"
          ],
          [
            "الرد",
            "Tuttavia… / Va detto però che…",
            "مع ذلك… / لكن لا بد من القول إن…"
          ],
          [
            "الخلاصة",
            "In conclusione… / Per questo…",
            "ختامًا… / لهذا السبب…"
          ]
        ]
      },
      "examples": [
        {
          "tr": "أرى أن العمل عن بُعد مفيد، لكنه لا يناسب الجميع."
        },
        {
          "tr": "أولًا، يقلّل الوقت الذي يستغرقه التنقّل."
        },
        {
          "tr": "يكفي أن نفكّر في مَن يعيشون في الضواحي."
        },
        {
          "tr": "هناك مَن يرى أنه يقلّل التعاون."
        },
        {
          "tr": "لكن لا بد من القول إن ذلك يعتمد على التنظيم."
        },
        {
          "tr": "ختامًا، يبدو لي أن الحل الهجين هو الأكثر توازنًا."
        }
      ]
    },
    "vocab": [
      "يرى؛ يعتبر",
      "يرى؛ يدافع عن رأي",
      "يكفي أن نفكّر في",
      "لا بد من القول إن",
      "هناك مَن يقول إن",
      "بمعنى ما",
      "لنقل إن",
      "متوازن",
      "الموضوع؛ الحجّة",
      "الميزة / العيب",
      "على المدى الطويل",
      "يستحق العناء"
    ],
    "exercises": [
      {
        "q": "أكمل: «___ che il problema sia strutturale.» بمعنى أرى."
      },
      {
        "q": "أكمل: «C'è ___ sostiene il contrario.» بمعنى هناك مَن يرى العكس."
      },
      {
        "q": "ما الصيغة التي تأتي بعد «ritengo che» في هذا الاستعمال؟",
        "opts": [
          "indicativo",
          "congiuntivo",
          "المصدر"
        ]
      },
      {
        "q": "صِل كل تعبير بمعناه.",
        "pairs": [
          "يكفي أن نفكّر في",
          "لا بد من القول",
          "على المدى الطويل",
          "يستحق العناء"
        ]
      },
      {
        "q": "أكمل الإجابة.",
        "tr": "أرى أن العمل الهجين هو الحل الأفضل. أولًا، يقلّل التكاليف. مع ذلك، يعتمد الأمر على القطاع."
      },
      {
        "q": "ترجم إلى الإيطالية: «لكن لا بد من القول إن ذلك يعتمد على التنظيم.»"
      },
      {
        "tr": "ختامًا، يبدو لي أن الحل الهجين هو الأكثر توازنًا."
      },
      {
        "q": "لماذا يفيد تضمين رأي مخالف والرد عليه؟",
        "opts": [
          "لإطالة الإجابة فقط",
          "لأن الإجابة تبدو أقوى وأكثر نضجًا",
          "لأن القواعد النحوية تفرض ذلك"
        ]
      },
      {
        "tr": "هناك مَن يرى أنه يقلّل التعاون، لكن البيانات لا تؤكّد ذلك."
      },
      {
        "tr": "أرى أن المحاولة تستحق العناء، على الأقل لمدة ستة أشهر."
      }
    ]
  },
  "lesson:b1-u04-test": {
    "theme": "امتحان",
    "title": "الامتحان النهائي لمستوى B1",
    "objectives": [
      "التحقق من congiuntivo والضمائر والكلام المنقول وبناء الحجّة"
    ],
    "theory": [
      {
        "p": "اثنا عشر تمرينًا من المستوى كله. درجة النجاح 70%."
      }
    ],
    "exercises": [
      {},
      {
        "q": "أكمل: «Penso che tu ___ ragione.»"
      },
      {
        "q": "أكمل: «Benché ___ tardi, esco.»"
      },
      {
        "q": "أكمل: «Hai dato il libro a Marco? — Sì, ___ ho dato.»"
      },
      {
        "q": "أكمل: «Non ___ la faccio più.»"
      },
      {
        "q": "أكمل: «La città in ___ vivo.»"
      },
      {
        "q": "انقل «Verrò domani» إلى كلام غير مباشر في الماضي مع تغيير الإشارة الزمنية:",
        "opts": [
          "Ha detto che verrà domani.",
          "Ha detto che sarebbe venuto il giorno dopo.",
          "Ha detto che verrebbe."
        ]
      },
      {
        "q": "ما معنى «Il ministro avrebbe firmato» في خبر صحفي؟",
        "opts": [
          "وقّع يقينًا",
          "يُقال إنه وقّع دون تأكيد",
          "كان سيوقّع"
        ]
      },
      {
        "q": "أكمل: «___, propongo di rimandare.» بمعنى ختامًا."
      },
      {
        "q": "ترجم إلى الإيطالية: «لا أعتقد أنهم فهموا المشكلة.»"
      },
      {
        "tr": "قال لي إنه سيمرّ في اليوم التالي، لكنه لم يأتِ."
      },
      {
        "tr": "أرى أنه حل جيد، وإن لم يكن مثاليًا."
      }
    ]
  }
});
