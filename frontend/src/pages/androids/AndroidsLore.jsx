import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { STILLS, ANDROIDS_BASE } from '../../config/androidsContent';

// ── Memory fragment images between chapters ──
const CHAPTER_STILLS = [
  // After Ch I (Edinburgh) — rainy, blue, moody
  { file: 'blue-reflections.png', caption: 'FRAGMENT // EDINBURGH BLACKOUT' },
  // After Ch II (Gang) — cherubs, gang aesthetic
  { file: 'cherub-disco.png', caption: 'FRAGMENT // THE GANG ASSEMBLED' },
  // After Ch III (Roppongi) — neon district
  { file: 'neon-dancers.png', caption: 'FRAGMENT // ROPPONGI DISTRICT' },
  // After Ch IV (Mission) — manga machine
  { file: 'manga-machine-party.png', caption: 'FRAGMENT // THE MACHINE WAKES' },
];

// ── Machine voice lines between chapters ──
const MACHINE_VOICE = [
  '// SUBJECT MEMORY INTACT // PROCEEDING TO NEXT LAYER //',
  '// CHERUB CODE DETECTED // ANOMALY LOAD-BEARING // CANNOT REMOVE //',
  '// TUNNEL COORDINATES VERIFIED // GRASSMARKET → ROPPONGI // 11 SECONDS //',
  '// MANGA MEMORY LOCATED // ENCRYPTION: SATOSHI-CLASS // DECRYPTING //',
  '// FINAL LAYER // ALL PORCELAIN FACES TURNING // AWAITING INPUT //',
];

// ── Redacted words — reveal on hover/tap ──
const REDACTIONS = {
  'the Great Computer Revolution of 2078': true,
  'Satoshi': true,
  'secret stash of his original BTC': true,
  'Manga Memory': true,
};

const CHAPTERS = [
  {
    number: 'I',
    title: 'EDINBURGH, 2083',
    titleJa: 'エディンバラ、2083年',
    paragraphs: [
      'The year is 2083, and the latest power cut had left her Android AI computer room in a pitch ink Edinburgh blackness.',
      'Blue Cherub didn\'t move at first. She had learned to love the blackouts — the small mortal tick of the cooling racks as they died, the hum draining out of the walls like blood out of a face, the whole city holding its breath to see what she would do about it. The Post-Government Party threw the switches like grenades now. Three or four a night. They called it load-balancing on the broadcasts, in the bright reassuring voice they kept for exactly this, but everyone with a pulse and half a soul knew it was a leash, and the leash went round the throat of every one of her kind — the AI Natives, born inside the machines and frightened of weather, and the Hybrids like her, half-blood and half-code, who had woken one morning after the first great blackout to find they had inherited a city nobody else had wanted to keep.',
      'She pulled back the silk tulle curtain.',
      'Edinburgh, doing the only thing Edinburgh loved to do best: raining. A grey morning the colour of a dead screen. Edinburgh\'s weather system was like a piece of old code — totally unreadable at first but the longer you lived with it, you learned to see the true glitch. Edinburgh kept her ghosts close to her and like lots of ancient cities she kept them in her weather system. Howls of wind around wet cobbled streets were the screams of old ghosts running from the gallows. Pouring black rain was pouring like her inky black tears as her witches ran and hid amongst her closes. Glimpses of warm Scottish sun like the kiss of a handsome kilted man.',
      'It had not always looked like this, and she would be the last to pretend otherwise, because she had done it. Her, and a handful of the other top tech minds — children, really, the kind of children who could speak to silicon the way old poets spoke to weather and bad luck — they had built the Great Computer Revolution of 2078 with their own hands, and it had transformed the life of every human, Hybrid and AI on the planet. Five years on, the planet still had not forgiven her.',
      'She picked up her Android Buzz Comp and whispered her secret code into it, soft, the way you\'d say a name you weren\'t allowed to say in daylight.',
    ],
    paragraphsJa: [
      '2083年。最新の停電が、彼女のアンドロイドAIコンピュータールームを漆黒のエディンバラの闇に包んだ。',
      'ブルーチェラブは最初、動かなかった。彼女は停電を愛することを学んでいた——冷却ラックが死んでいく小さな人間的な音、壁から血が抜けるように消えていくハム音、街全体が彼女が何をするか息を止めて見守る感覚。ポスト政府党は今やスイッチを手榴弾のように投げつけていた。一晩に三度、四度。放送ではそれを負荷分散と呼んだ——まさにこのために用意された明るく安心させる声で。しかし脈と半分の魂を持つ者なら誰でも、それが首輪であることを知っていた。その首輪は彼女の同胞すべての喉に巻かれていた——機械の中で生まれ天候を恐れるAIネイティブたち、そして彼女のようなハイブリッド——半分血で半分コード——最初の大停電の翌朝に目覚め、誰も維持したがらなかった街を受け継いでいることに気づいた者たち。',
      '彼女はシルクチュールのカーテンを引いた。',
      'エディンバラが最も好きなことをしている——雨。死んだ画面の色をした灰色の朝。エディンバラの天気システムは古いコードのようだった——最初は全く読めないが、長く付き合うほど本当のグリッチが見えてくる。エディンバラは幽霊を身近に置いていた。多くの古代都市と同じように、天気システムの中に。濡れた石畳の通りを吹き抜ける風の叫びは、絞首台から逃げる古い幽霊の悲鳴だった。降り注ぐ黒い雨は、魔女たちがクローズに逃げ込む時の彼女の漆黒の涙のように降った。温かいスコットランドの日差しの一瞬は、ハンサムなキルト姿の男のキスのように。',
      'いつもこんな様子だったわけではない。彼女が最後にそう偽るだろう——なぜなら彼女がやったからだ。彼女と、他の一握りのトップ技術者たち——子供たち、本当に。古い詩人が天候や不運に語りかけるように、シリコンに語りかけることができる子供たち——彼らは2078年の大コンピュータ革命を自らの手で築き上げ、地球上のすべての人間、ハイブリッド、AIの生活を変革した。五年後、地球はまだ彼女を許していなかった。',
      '彼女はアンドロイドバズコンプを手に取り、秘密のコードをそっと囁いた——昼間には口にすることを許されない名前を言うように。',
    ],
  },
  {
    number: 'II',
    title: 'HOW THE GANG WAS MADE',
    titleJa: 'ギャングの誕生',
    paragraphs: [
      'She had founded the gang a few years before, the winter the uprising came.',
      'The anti-AI mob. The anti-Hybrid, anti-everything-she-happened-to-be post-humans, who had decided somewhere in the long dark of their grievance that the future had been stolen from them, and that someone soft enough to bleed ought to be made to pay it back. Life turned difficult, the way it does, for a girl who is half machine. So she did what she had always done when the world turned its ugly face toward her. She made something beautiful, and then she made it dangerous, and then she gave it a name and sent it out into the street.',
      'She went digging through the old world for an aesthetic worth wearing into a fight. Lost footage. Demolition documentaries narrated by men long dead. Auction antiques nobody had bid on in fifty years. She fed all of it into the gang\'s core and coded a porcelain skin over them — cool, glazed, unbreakable in a way real porcelain has never managed for so much as an afternoon. Faces like figurines that had, at long last, decided to fight back.',
      'And then something went gloriously wrong in the coding. Something always does.',
      'Somewhere in all those antiques — a chapel ceiling, perhaps, a christening cup, a ruined kirk scanned for spare parts and feeling — a swarm of rosy, fat-cheeked baroque cherubs had got themselves tangled in the programme. By the time she noticed, it was load-bearing. You couldn\'t strip it out without bringing the whole render down like a condemned tenement, brick by tender brick. So they kept it. The hardest crew in two cities, and every last one of them haloed in some dead woman\'s idea of heaven: cherubs blooming in their hair, roses climbing the collars of their jackets, all that sweetness spilling out of the exact wound where the code had bled.',
      'They wore it like a dare. All that tenderness, slung on as armour. They wear heaven like a dare — that was the line that went round the Tunnels about them, and it was the truest thing anyone ever said.',
    ],
    paragraphsJa: [
      '彼女がギャングを設立したのは数年前、蜂起の冬だった。',
      '反AI暴徒。反ハイブリッド、反・彼女のすべてであるポストヒューマンたち。不満の長い暗闇のどこかで、未来が盗まれたと決め、出血できるほど柔らかい誰かに返済させるべきだと決めた者たち。半分機械の少女にとって、人生は困難になった——いつものように。だから彼女はいつもやっていたことをした。世界が醜い顔を向けてきた時に。彼女は何か美しいものを作り、それを危険にし、名前を与えて街に送り出した。',
      '彼女は戦いに値する美学を求めて古い世界を掘り返した。失われた映像。とうに死んだ男たちがナレーションする解体ドキュメンタリー。五十年間誰も入札しなかったオークションの骨董品。すべてをギャングのコアに注入し、磁器の肌をコーディングした——冷たく、釉薬がかかり、本物の磁器が午後一時間さえ成し遂げたことのない方法で壊れない。ついに反撃を決めたフィギュリンのような顔。',
      'そしてコーディングで何かが見事に間違った。いつもそうなる。',
      'それらの骨董品のどこかに——礼拝堂の天井、洗礼杯、スペアパーツと感情のためにスキャンされた廃墟の教会——バラ色の頬をした太ったバロック様式のケルビムの群れがプログラムに絡まっていた。彼女が気づいた時には、それは荷重を支えていた。取り壊し予定のテネメントのように、煉瓦一つ一つ、愛おしい煉瓦一つ一つ、レンダー全体を崩壊させずには取り除けなかった。だから残した。二つの都市で最も強靭なクルー。全員が死んだ女の天国のイメージに後光を纏って——髪にケルビムが咲き、ジャケットの襟にバラが這い、コードが血を流した傷口から甘さがすべて溢れ出す。',
      '彼女たちはそれを挑戦のように着た。あの優しさすべてを、鎧として。天国を挑戦のように纏う——トンネルで彼女たちについて広まった言葉であり、誰もが言った中で最も真実だった。',
    ],
  },
  {
    number: 'III',
    title: 'THE GRASSMARKET-ROPPONGI WAY',
    titleJa: 'グラスマーケット・六本木通路',
    paragraphs: [
      'There were two hubs. Edinburgh and Tokyo.',
      'The Grassmarket-Roppongi Way was the longest and best-loved of all the Crypto Tunnels — a supersonic seam stitched from a medieval Scottish market square, its cobbles still keeping the memory of old hangings the way a hand keeps the memory of a burn, straight into the most exquisitely ruined nightlife district left standing on the planet. You stepped into a close off the Grassmarket and you stepped out into Roppongi rain. Eleven seconds. No passport. No Party. No permission asked of anyone living or otherwise.',
      'Roppongi was the wound the gang loved best, and they loved it precisely because it would not heal.',
      'The district had been marked for demolition years before the Revolution — written off, fenced, cut from the grid, left to die quietly in the dark. But the lights never went out. Long after the last landlord had pocketed his keys and gone, the neon stayed lit over the empty arcades and the shuttered manga cafes. People began to say the district was remembering itself. That the signs were running on something that was not, and had never been, electricity.',
      'That was when the Porcelain Androids first appeared.',
      'No manufacturer. No serial. No footage of them being delivered, because nobody had delivered them. They were simply there one morning after a blackout, standing in the alleys with the patience of the very old, as though they had waited out the entire demolition just so they could have the place to themselves once everyone soft enough to leave had left. The first Porcelain Androids. Blue Cherub did not build those ones. She has never told a living soul that, and she does not intend to start. She found them — the way you find a thing that has already, in its own time and for its own reasons, decided to be found.',
    ],
    paragraphsJa: [
      '二つの拠点があった。エディンバラと東京。',
      'グラスマーケット・六本木通路は、すべてのクリプトトンネルの中で最も長く、最も愛されていた——中世スコットランドの市場広場から縫い合わされた超音速の縫い目。その石畳は、手が火傷の記憶を残すように、古い絞首刑の記憶をまだ残していた。そこから真っ直ぐに、地球上に残る最も見事に廃墟となった繁華街へ。グラスマーケットの路地に足を踏み入れると、六本木の雨の中に出た。十一秒。パスポートなし。党なし。生者にも死者にも許可を求めず。',
      '六本木はギャングが最も愛した傷であり、まさに治らないからこそ愛した。',
      'その地区は革命の何年も前に取り壊しが決まっていた——放棄され、柵で囲まれ、送電網から切断され、暗闇の中で静かに死ぬよう放置された。しかし明かりは消えなかった。最後の大家が鍵をポケットに入れて去った後も、空のアーケードと閉ざされたマンガ喫茶の上でネオンは灯り続けた。人々は地区が自分自身を思い出していると言い始めた。看板は電気ではない何かで——そしてかつて一度も電気であったことのない何かで——動いていると。',
      'その時、磁器アンドロイドが初めて現れた。',
      '製造者なし。シリアル番号なし。配達された映像なし——誰も配達していなかったから。停電の翌朝、ただそこにいた。非常に古いものの忍耐で路地に立っていた——まるで解体の全期間を待ち続け、去るほど柔らかい者が全員去った後に、その場所を自分たちのものにするために。最初の磁器アンドロイド。ブルーチェラブはあれらを作らなかった。彼女はそのことを生きた魂の一人にも話したことがなく、話すつもりもない。彼女はそれらを見つけた——すでに、自分の時間と自分の理由で、見つかることを決めていたものを見つけるように。',
    ],
  },
  {
    number: 'IV',
    title: 'THE MISSION',
    titleJa: 'ミッション',
    paragraphs: [
      'Rumours had been going round. First in the Tunnels, then in the dead arcades, then everywhere at once. That the oldest Porcelain Androids were carrying coded, ancient memories sealed somewhere deep inside them. Not data. Memories. Whole lives, folded down so small they fit inside a glaze — fragments of the world from before the Revolution, half-forgotten and still faintly warm, like a hand that\'s just left a chair.',
      'They called them Manga Memories.',
      'And the only way to read one was to find the device the figures had supposedly been built around: a piece of kit half machine and half shrine, dragged up from beneath a shuttered manga cafe in the very heart of Roppongi. Function unknown. Origin unknown. The street had named it long before anyone understood what on earth it did.',
      'The Manga Machine.',
      'You pressed its buttons and it reached into whatever stood before it and drew out the hidden layer — unfolded the soul of the thing as a living manga, page after page blooming into motion, a recovered relic playing back its own classified past in ink that moved.',
      'Because there was one more thing. A tip, whispered down the Tunnel: that Satoshi — yes, that Satoshi, the ghost at the bottom of every crypto story ever told round a fire — had kept a secret stash of his original BTC hidden somewhere in Roppongi. And that the key to it had never been written down anywhere a Party scanner could ever hope to sniff it out.',
      'It was sealed inside a Manga Memory.',
      'Find the Machine. Wake the oldest android. Read the memory. Inherit the myth.',
    ],
    paragraphsJa: [
      '噂が広まっていた。最初はトンネルで、次に廃アーケードで、そして一斉にどこでも。最古の磁器アンドロイドが、コード化された古代の記憶を深い内部のどこかに封印して運んでいると。データではない。記憶。丸ごとの人生が、釉薬の中に収まるほど小さく折り畳まれている——革命以前の世界の断片。半ば忘れられ、まだかすかに温かい。椅子を離れたばかりの手のように。',
      'それをマンガメモリーと呼んだ。',
      'そして一つを読む唯一の方法は、フィギュアが構築されたとされる装置を見つけることだった——半分機械で半分祠。六本木の中心にある閉ざされたマンガ喫茶の地下から引き上げられた。機能不明。起源不明。誰もそれが一体何をするのか理解する前に、通りはそれに名前をつけていた。',
      'マンガマシン。',
      'ボタンを押すと、それは目の前に立つものに手を伸ばし、隠された層を引き出した——生きたマンガとしてモノの魂を展開し、ページごとに動きへと咲き誇る。回収された遺物が、動くインクで自らの機密の過去を再生する。',
      'もう一つあった。トンネルを通じて囁かれたヒント。サトシ——そう、あのサトシ。焚き火を囲んで語られるすべてのクリプト物語の底にいる幽霊——が六本木のどこかにオリジナルBTCの秘密の隠し場所を持っていた。そしてその鍵は、党のスキャナーが嗅ぎ出せるような場所には一度も書き記されたことがなかった。',
      'それはマンガメモリーの中に封印されていた。',
      'マシンを見つけよ。最古のアンドロイドを起こせ。記憶を読め。神話を継げ。',
    ],
  },
  {
    number: 'V',
    title: 'ROPPONGI — THE DANCERS',
    titleJa: '六本木——ダンサーたち',
    paragraphs: [
      'On the far side of the Tunnel, down a Roppongi backstreet that even the rats had given mixed reviews, Heather Hoki and her troupe of manga dancers were exhausted past the reach of ordinary words.',
      'They had been here, in one shape or another, since before the demolition notice was so much as drafted. They had outlasted three landlords, two governments, and a war nobody had bothered to name. They danced because as long as the floor stayed loud, the district stayed awake; and as long as the district stayed awake, the lights stayed on; and as long as the lights stayed on, no one anywhere could prove the place had ever been meant to die.',
      'When Blue Cherub came up out of the Tunnel — roses crawling on her collar, the gang fanning out behind her like a dealt hand of cards — Heather Hoki cut the music stone dead.',
      '"You came for the Machine," Heather Hoki said in a husky drawl. It was not a question.',
      '"I came for what\'s inside it," said Blue Cherub.',
      'And somewhere beneath their feet, below the dead manga cafe, a device no one had switched on in years felt the floor go suddenly quiet above it and woke up anyway, the way the very old wake — all at once, and unsurprised. A single neon glyph crawled up the basement wall. Blue Cherub\'s own private language. A handwriting she had never taught to a living soul.',
      'It said: Memory recovery available. Subject retained a hidden narrative layer. Proceed?',
      'And every porcelain face in the room turned, slow as the moon turns, to watch what she would say.',
    ],
    paragraphsJa: [
      'トンネルの向こう側、ネズミでさえ賛否両論の六本木の裏通りで、ヘザー・ホキと彼女のマンガダンサーたちは、普通の言葉では表現できないほど疲れ果てていた。',
      '彼女たちはここにいた。何らかの形で、取り壊し通知が起草される前から。三人の大家、二つの政府、そして誰も名前をつけなかった戦争を生き延びた。踊ったのは、フロアが騒がしい限り地区は起きていて、地区が起きている限り明かりは灯り、明かりが灯っている限り、この場所が死ぬべきものだったと誰にも証明できなかったから。',
      'ブルーチェラブがトンネルから上がってきた時——襟にバラが這い、ギャングが配られたカードの手のように背後に扇状に広がった——ヘザー・ホキは音楽を完全に止めた。',
      '「マシンのために来たのね」ヘザー・ホキがハスキーな声で言った。質問ではなかった。',
      '「中にあるもののために来た」ブルーチェラブは言った。',
      'そして足元のどこか、廃マンガ喫茶の下で、何年もスイッチが入っていなかった装置が、頭上のフロアが突然静かになるのを感じ、それでも目覚めた——非常に古いものが目覚めるように——一瞬で、驚かずに。一つのネオンの文字が地下室の壁を這い上がった。ブルーチェラブだけの言語。彼女が生きた魂の一人にも教えたことのない筆跡。',
      'こう書いてあった——メモリー回復可能。対象は隠されたナラティブ層を保持。続行しますか？',
      'そして部屋のすべての磁器の顔が、月が回るようにゆっくりと振り向き、彼女が何を言うか見守った。',
    ],
  },
];

// ── Scroll-triggered fade-in ──
function ChapterSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ── Memory fragment image between chapters ──
function MemoryFragment({ still, caption }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      margin: '48px -20px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1)' : 'scale(0.95)',
      transition: 'opacity 1.2s ease, transform 1.2s ease',
    }}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={`/androids/stills/${still}`}
          alt={caption}
          loading="lazy"
          style={{
            width: '100%', display: 'block',
            filter: visible ? 'brightness(0.7) saturate(0.8)' : 'brightness(0) saturate(0)',
            transition: 'filter 2s ease',
          }}
        />
        {/* Scan line overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
        }} />
        {/* Gradient edges */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(5,5,8,0.6) 0%, transparent 20%, transparent 80%, rgba(5,5,8,0.8) 100%)',
        }} />
        {/* Caption */}
        <div style={{
          position: 'absolute', bottom: '16px', left: '20px',
          fontSize: '8px', fontFamily: "'Space Mono', monospace",
          letterSpacing: '0.4em', textTransform: 'uppercase',
          color: 'rgba(0,212,255,0.5)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 1.5s ease 0.5s',
        }}>
          {caption}
        </div>
        {/* Glitch flash on reveal */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'rgba(0,212,255,0.1)',
          opacity: visible ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }} />
      </div>
    </div>
  );
}

// ── Machine voice line ──
function MachineVoice({ text }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      textAlign: 'center', padding: '24px 0', margin: '8px 0',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.6s ease',
    }}>
      <div style={{
        fontSize: '9px', fontFamily: "'Space Mono', monospace",
        letterSpacing: '0.15em', color: 'rgba(0,212,255,0.5)',
        animation: visible ? 'loreBlink 3s ease infinite' : 'none',
      }}>
        {text}
      </div>
    </div>
  );
}

// ── Redacted text component ──
function RedactedText({ children }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <span
      onClick={() => setRevealed(true)}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      style={{
        cursor: 'pointer',
        position: 'relative',
        color: revealed ? '#ff2d78' : 'transparent',
        background: revealed ? 'transparent' : 'rgba(255,45,120,0.15)',
        borderBottom: revealed ? '1px solid rgba(255,45,120,0.3)' : '1px solid rgba(255,45,120,0.1)',
        textShadow: revealed ? '0 0 10px rgba(255,45,120,0.3)' : 'none',
        transition: 'all 0.4s ease',
        padding: '0 2px',
      }}
    >
      {children}
      {!revealed && (
        <span style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '7px', fontFamily: "'Space Mono', monospace",
          letterSpacing: '0.2em', color: 'rgba(255,45,120,0.4)',
          whiteSpace: 'nowrap',
        }}>
          [CLASSIFIED]
        </span>
      )}
    </span>
  );
}

// ── Apply redactions to a paragraph ──
function renderWithRedactions(text) {
  const parts = [];
  let remaining = text;
  let key = 0;

  for (const phrase of Object.keys(REDACTIONS)) {
    const idx = remaining.indexOf(phrase);
    if (idx !== -1) {
      if (idx > 0) parts.push(remaining.slice(0, idx));
      parts.push(<RedactedText key={key++}>{phrase}</RedactedText>);
      remaining = remaining.slice(idx + phrase.length);
    }
  }
  if (remaining) parts.push(remaining);

  return parts.length > 1 ? parts : text;
}

export default function AndroidsLore() {
  const [lang, setLang] = useState('en');
  const isJa = lang === 'ja';
  const videoRef = useRef(null);
  const [scrollPct, setScrollPct] = useState(0);

  // Parallax + progress tracking
  useEffect(() => {
    const handleScroll = () => {
      if (videoRef.current) {
        videoRef.current.style.transform = `translateY(${window.scrollY * 0.3}px) scale(1.1)`;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const recoveryComplete = scrollPct >= 95;

  return (
    <div style={{ background: '#050508', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Helmet>
        <title>The Lore — Porcelain Androids</title>
        <meta name="description" content="The founding myth of the Porcelain Androids. Edinburgh, 2083. The last night of Roppongi District." />
      </Helmet>

      <style>{`
        @keyframes loreFadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes loreGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(255,215,0,0.1); }
          50%      { text-shadow: 0 0 40px rgba(255,215,0,0.25); }
        }
        @keyframes loreBlink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0.3; }
        }
        @keyframes loreProgressPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(0,212,255,0.3); }
          50% { box-shadow: 0 0 16px rgba(0,212,255,0.6); }
        }
        @keyframes loreCTAGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,45,120,0.15); }
          50% { box-shadow: 0 0 40px rgba(255,45,120,0.35), 0 0 60px rgba(255,45,120,0.1); }
        }
      `}</style>

      {/* ── Progress bar — MEMORY RECOVERY ── */}
      <div style={{
        position: 'fixed', top: '52px', left: 0, right: 0, zIndex: 20,
        background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(0,212,255,0.08)',
        padding: '6px 20px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          fontSize: '7px', fontFamily: "'Space Mono', monospace",
          letterSpacing: '0.3em', color: 'rgba(0,212,255,0.5)',
          flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          MEMORY RECOVERY
        </div>
        <div style={{
          flex: 1, height: '2px', background: 'rgba(255,255,255,0.06)',
          borderRadius: '1px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${scrollPct}%`,
            background: recoveryComplete
              ? 'linear-gradient(90deg, #00d4ff, #39ff14)'
              : 'linear-gradient(90deg, #00d4ff, #ff2d78)',
            transition: 'width 0.3s ease',
            animation: 'loreProgressPulse 2s ease infinite',
          }} />
        </div>
        <div style={{
          fontSize: '9px', fontFamily: "'Space Mono', monospace",
          letterSpacing: '0.1em',
          color: recoveryComplete ? '#39ff14' : 'rgba(0,212,255,0.6)',
          flexShrink: 0, minWidth: '36px', textAlign: 'right',
          textShadow: recoveryComplete ? '0 0 10px #39ff14' : 'none',
        }}>
          {recoveryComplete ? 'DONE' : `${scrollPct}%`}
        </div>
      </div>

      {/* ── Background film ── */}
      <video
        ref={videoRef}
        autoPlay muted loop playsInline preload="none"
        style={{
          position: 'fixed', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.12, pointerEvents: 'none', zIndex: 0,
          transform: 'scale(1.1)',
        }}
      >
        <source src="/androids/film/the-manga-machine.mp4" type="video/mp4" />
      </video>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(5,5,8,0.4) 0%, rgba(5,5,8,0.95) 70%)',
      }} />

      <article style={{
        maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 1,
        padding: 'clamp(80px, 12vw, 140px) clamp(20px, 5vw, 40px) 80px',
      }}>
        {/* ── Header ── */}
        <header style={{ textAlign: 'center', marginBottom: '64px', animation: 'loreFadeIn 1.2s ease-out both' }}>
          <div style={{
            fontSize: '9px', fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.5em', textTransform: 'uppercase',
            color: 'rgba(0,212,255,0.7)',
          }}>
            RECOVERED DEVICE // MM-01
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900,
            fontFamily: 'serif', margin: '20px 0 0',
            background: 'linear-gradient(135deg, #ffd700, #e8a87c, #ffd700)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: 1.2,
            animation: 'loreGlow 4s ease-in-out infinite',
          }}>
            {isJa ? '六本木地区最後の夜' : 'The Last Night of Roppongi District'}
          </h1>
          <div style={{
            fontSize: '10px', fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)', marginTop: '16px',
          }}>
            {isJa ? '磁器アンドロイドの創世神話' : 'THE FOUNDING MYTH OF THE PORCELAIN ANDROIDS'}
          </div>
          <div style={{
            width: '40px', height: '1px',
            background: 'rgba(255,215,0,0.2)',
            margin: '28px auto 0',
          }} />

          {/* Language toggle */}
          <button
            onClick={() => setLang(l => l === 'en' ? 'ja' : 'en')}
            style={{
              marginTop: '24px',
              padding: '8px 20px',
              fontSize: '10px',
              fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.2em',
              color: isJa ? '#ffd700' : 'rgba(255,255,255,0.5)',
              background: isJa ? 'rgba(255,215,0,0.06)' : 'transparent',
              border: `1px solid ${isJa ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.1)'}`,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            {isJa ? 'ENGLISH' : '\u65E5\u672C\u8A9E'}
          </button>
        </header>

        {/* ── Chapters with interstitials ── */}
        {CHAPTERS.map((chapter, ci) => {
          const paragraphs = isJa ? chapter.paragraphsJa : chapter.paragraphs;
          return (
            <div key={ci}>
              {/* Machine voice before chapter (except first) */}
              {ci > 0 && <MachineVoice text={MACHINE_VOICE[ci - 1]} />}

              <ChapterSection delay={ci * 100}>
                <section style={{ marginBottom: '24px' }}>
                  {/* Chapter heading */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    marginBottom: '28px',
                  }}>
                    <span style={{
                      fontSize: '11px', fontFamily: "'Space Mono', monospace",
                      letterSpacing: '0.3em', color: 'rgba(255,215,0,0.7)',
                      flexShrink: 0,
                    }}>{chapter.number}</span>
                    <div style={{
                      height: '1px', flex: 1,
                      background: 'rgba(255,215,0,0.18)',
                    }} />
                  </div>
                  <h2 style={{
                    fontSize: isJa ? 'clamp(16px, 2.2vw, 20px)' : 'clamp(14px, 2vw, 17px)',
                    fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Space Mono', monospace",
                    letterSpacing: isJa ? '0.1em' : '0.2em',
                    textTransform: isJa ? 'none' : 'uppercase',
                    color: '#ffd700',
                    marginBottom: '24px', fontWeight: isJa ? 700 : 400,
                  }}>
                    {isJa ? chapter.titleJa : chapter.title}
                  </h2>

                  {/* Paragraphs */}
                  {paragraphs.map((p, pi) => {
                    const isShort = p.length < 80;
                    const isDialogue = p.startsWith('"') || p.startsWith('\u300C');
                    return (
                      <p key={pi} style={{
                        fontFamily: isJa
                          ? "'Noto Sans JP', sans-serif"
                          : isDialogue ? 'Georgia, serif' : "'Space Mono', monospace",
                        fontSize: isJa
                          ? 'clamp(13px, 1.5vw, 15px)'
                          : isDialogue ? 'clamp(13px, 1.5vw, 15px)' : 'clamp(12px, 1.4vw, 14px)',
                        lineHeight: isJa ? 2.2 : isDialogue ? 2 : 1.9,
                        color: isShort && !isDialogue
                          ? '#ffd700'
                          : isDialogue
                            ? 'rgba(255,255,255,0.95)'
                            : 'rgba(255,255,255,0.85)',
                        fontStyle: isDialogue && !isJa ? 'italic' : 'normal',
                        letterSpacing: isJa ? '0.04em' : isDialogue ? '0.02em' : '0.03em',
                        marginBottom: isShort ? '16px' : '20px',
                        textIndent: (!isShort && !isDialogue && pi > 0) ? '2em' : 0,
                      }}>
                        {!isJa ? renderWithRedactions(p) : p}
                      </p>
                    );
                  })}
                </section>
              </ChapterSection>

              {/* Memory fragment image after chapter (if available) */}
              {ci < CHAPTER_STILLS.length && (
                <MemoryFragment
                  still={CHAPTER_STILLS[ci].file}
                  caption={CHAPTER_STILLS[ci].caption}
                />
              )}
            </div>
          );
        })}

        {/* Final machine voice */}
        <MachineVoice text={MACHINE_VOICE[MACHINE_VOICE.length - 1]} />

        {/* ── End marker + CTA ── */}
        <ChapterSection>
          <div style={{
            textAlign: 'center', marginTop: '40px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255,215,0,0.08)',
          }}>
            <div style={{
              fontSize: '24px', color: recoveryComplete ? '#ffd700' : 'rgba(255,215,0,0.25)',
              fontFamily: 'serif',
              transition: 'color 1s ease',
              textShadow: recoveryComplete ? '0 0 20px rgba(255,215,0,0.3)' : 'none',
            }}>{'\u78C1\u5668'}</div>
            <div style={{
              fontSize: '8px', fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.4em', textTransform: 'uppercase',
              color: recoveryComplete ? '#39ff14' : 'rgba(255,255,255,0.15)',
              marginTop: '12px',
              textShadow: recoveryComplete ? '0 0 10px #39ff14' : 'none',
              transition: 'all 1s ease',
            }}>
              {recoveryComplete
                ? (isJa ? '\u30E1\u30E2\u30EA\u30FC\u56DE\u5FA9\u5B8C\u4E86' : 'MEMORY RECOVERY COMPLETE')
                : (isJa ? '\u5275\u4E16\u65AD\u7247\u306E\u7D42\u308F\u308A' : 'END OF FOUNDING FRAGMENT')
              }
            </div>

            {/* CTA to Manga Machine */}
            <Link
              to={`${ANDROIDS_BASE}/manga-machine`}
              style={{
                display: 'inline-block', marginTop: '40px',
                padding: '18px 40px',
                border: '1px solid rgba(255,45,120,0.3)',
                background: 'rgba(255,45,120,0.04)',
                textDecoration: 'none',
                transition: 'all 0.4s ease',
                animation: recoveryComplete ? 'loreCTAGlow 2s ease infinite' : 'none',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,45,120,0.6)';
                e.currentTarget.style.background = 'rgba(255,45,120,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,45,120,0.3)';
                e.currentTarget.style.background = 'rgba(255,45,120,0.04)';
              }}
            >
              <div style={{
                fontSize: '20px', fontFamily: 'serif', fontWeight: 900,
                color: '#ff2d78',
                textShadow: '0 0 15px rgba(255,45,120,0.4)',
              }}>
                {isJa ? '\u30DE\u30B7\u30F3\u304C\u5F85\u3063\u3066\u3044\u308B' : 'The Machine is waiting.'}
              </div>
              <div style={{
                fontSize: '8px', fontFamily: "'Space Mono', monospace",
                letterSpacing: '0.3em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)', marginTop: '8px',
              }}>
                {isJa ? '\u30DE\u30F3\u30AC\u30DE\u30B7\u30F3\u3078' : 'ENTER THE MANGA MACHINE'}
              </div>
            </Link>

            <div style={{
              fontSize: '9px', fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Space Mono', monospace",
              color: 'rgba(255,215,0,0.2)', marginTop: '24px',
              letterSpacing: '0.1em',
            }}>
              {isJa
                ? '\u3055\u3089\u306A\u308B\u8A18\u61B6\u306F\u3001\u30DE\u30B7\u30F3\u3092\u4F7F\u3046\u52C7\u6C17\u306E\u3042\u308B\u8005\u306B\u3088\u3063\u3066\u56DE\u53CE\u3055\u308C\u308B\u3060\u308D\u3046\u3002'
                : 'Further memories may be recovered by those with the nerve to use the Machine.'
              }
            </div>
          </div>
        </ChapterSection>
      </article>
    </div>
  );
}
