import type { CatalogItem } from '../lib/broadcastClock'
import bollywoodPrograms from './programs/001.json' with { type: 'json' }
import ddClassicsPrograms from './programs/005.json' with { type: 'json' }
import vintageIndiaPrograms from './programs/013.json' with { type: 'json' }

// Hand-picked evergreen programmes, checked against YouTube on 2026-10-05.
// Keep IDs and durations here so these stations can start without the Data API.
// Availability is refreshed at runtime; failed videos are skipped by the player.
export const HAND_PICKED_PROGRAMS: Partial<Record<string, CatalogItem[]>> = {
  // Formula uploads can report embeddable while refusing actual iframe playback.
  // These alternatives were checked in the embedded player on 2026-10-06.
  Formula: [
    {
      videoId: '-KykzjQiKC0',
      title: '1978 F1 Season Review - Rare Film',
      durationSeconds: 1323,
    },
    {
      videoId: 'LBmogpW2T9U',
      title: 'Monza F1 Circuit History, Crashes and Onboard (FULL Layout)',
      durationSeconds: 3539,
    },
    {
      videoId: 'Tt7QQWF8Yu0',
      title: 'Charade (Clermont-Ferrand) F1 Circuit History, Crashes and Onboard',
      durationSeconds: 2460,
    },
  ],
  // Preserve the video-only curation during regeneration.
  Bollywood: bollywoodPrograms,
  Cricket: [
    {
      videoId: '3PqrnU1EVCg',
      title: 'From the Vault: Super Sachin steers India to victory in tri-series final',
      durationSeconds: 314,
    },
    {
      videoId: 'zqwXo74klfU',
      title: 'Rahul Dravid Hits 217 at The Oval | England v India 2002 - Highlights',
      durationSeconds: 605,
    },
    {
      videoId: 'o_lvEkwuI0M',
      title: 'MS Dhoni - Master Finisher | England v India 2011 - Highlights',
      durationSeconds: 177,
    },
    {
      videoId: 'tr01vxyCT2U',
      title: "From the vault: Sunil Gavaskar's highest Test score against Australia",
      durationSeconds: 287,
    },
    {
      videoId: 'bbZdkBLYcak',
      title: 'From the Vault: Lara makes history with 226 in Adelaide',
      durationSeconds: 395,
    },
    {
      videoId: 's_P8fpLsi-A',
      title: "241 runs - with no cover drives! Sachin's SCG epic",
      durationSeconds: 303,
    },
    {
      videoId: 'n4zpUCrcGic',
      title: 'Dravid & Laxman dominate Aussies in 303 run stand | From the Vault',
      durationSeconds: 822,
    },
    {
      videoId: 'KApjf4TCJcc',
      title: 'Highlights - Sam Billings 93, MS Dhoni 68* - India A v England',
      durationSeconds: 670,
    },
    {
      videoId: 'cJjYRvlPWqY',
      title:
        "The ORIGINAL Little Master goes BANG! Best of Gavaskar's ODIs in Australia | From the Vault",
      durationSeconds: 563,
    },
    {
      videoId: 'Shnvxd533T0',
      title: 'From the Vault: Kapil Dev cleans up',
      durationSeconds: 280,
    },
    {
      videoId: 'ypd-s37SKWA',
      title: "Sachin's Sydney love-affair continues with majestic 154no",
      durationSeconds: 389,
    },
    {
      videoId: 'UYKJM2Gttv4',
      title: "The Wall Gets on the Board! Rahul Dravid's 103* | England v India 2011 | Lord's",
      durationSeconds: 275,
    },
    {
      videoId: 'bejn1Mjg4kc',
      title:
        'Dhoni Fireworks and Pietersen At His Best! | England v India Greatest Moments - Part 3',
      durationSeconds: 1042,
    },
    {
      videoId: '-ogpk3QumaA',
      title: 'From the Vault: Sir Viv smashes ODI century at the MCG',
      durationSeconds: 363,
    },
    {
      videoId: 'sArP2GSvzM8',
      title: "Through the gate! The best of Warne's flipper",
      durationSeconds: 372,
    },
    {
      videoId: 'O4e6k8_oAJk',
      title: 'From the Vault: Insane spell of 7-1 as Ambrose wreaks havoc',
      durationSeconds: 333,
    },
    {
      videoId: 'J_Qa02WIe-o',
      title: 'Legends DOMINATE Australia-India ODI classic | From the Vault',
      durationSeconds: 1431,
    },
    {
      videoId: 'gJXgTYeFvtk',
      title:
        'Dhoni, KP & Collingwood Impress in Another England India Final! | Classic ODI | England v India 2007',
      durationSeconds: 776,
    },
  ],
  'Jungle Book': [
    {
      videoId: 'odvVf3ch64E',
      title: 'The Jungle Book Hindi Episode 01 | Mowgli Comes to the Jungle',
      durationSeconds: 1297,
    },
    {
      videoId: 'agHoNRTL_Ks',
      title: 'The Jungle Book Hindi Episode 02 | The Birth of Wolf Boy Mowgli',
      durationSeconds: 1351,
    },
    {
      videoId: '9HYE0zyvNa0',
      title: "The Jungle Book Hindi Episode 03 | Moti's Son",
      durationSeconds: 1297,
    },
    {
      videoId: 'vumSKwmyMwA',
      title: 'The Jungle Book Hindi Episode 04 | The Jungle Law',
      durationSeconds: 1295,
    },
    {
      videoId: 'D1IpMgi_AdY',
      title: 'The Jungle Book Hindi Episode 05 | A New Friend',
      durationSeconds: 1296,
    },
    {
      videoId: 'tvbITfFc1JY',
      title: 'The Jungle Book Hindi Episode 06 | Pappu is Alone',
      durationSeconds: 1296,
    },
    {
      videoId: 'IjVRuVi2OpE',
      title: 'The Jungle Book Hindi Episode 07 | The Cold Fang',
      durationSeconds: 1295,
    },
    {
      videoId: 'noE4RYrZlWE',
      title: 'The Jungle Book Hindi Episode 08 | Sorry Bhaloo!',
      durationSeconds: 1297,
    },
    {
      videoId: '-oRcXfOhQBg',
      title: 'The Jungle Book Hindi Episode 09 | More Precious than the Law',
      durationSeconds: 1297,
    },
    {
      videoId: 'kcV5qCOIFd4',
      title: 'The Jungle Book Hindi Episode 10 | An Old Wolf Visits',
      durationSeconds: 1297,
    },
    {
      videoId: 'yWKOCigDGcg',
      title: 'The Jungle Book Hindi Episode 11 | The Devil in the Mind',
      durationSeconds: 1296,
    },
    {
      videoId: 'i2CRc_lvP9c',
      title: 'The Jungle Book Hindi Episode 12 | Adventurous Journey',
      durationSeconds: 1297,
    },
  ],
  Shaktimaan: [
    {
      videoId: 'uOleNIC8Spg',
      title: 'Shaktimaan Hindi – Best Superhero Tv Series - Full Episode 1 - शक्तिमान - एपिसोड १',
      durationSeconds: 2632,
    },
    {
      videoId: 'TjXcAWSa7vQ',
      title: 'Shaktimaan Hindi – Best Superhero Tv Series - Full Episode 2 - शक्तिमान - एपिसोड २',
      durationSeconds: 2546,
    },
    {
      videoId: 'DQuDVLm5QXc',
      title: 'Shaktimaan Hindi – Best Superhero Tv Series - Full Episode 3 - शक्तिमान - एपिसोड ३',
      durationSeconds: 2414,
    },
    {
      videoId: 'ilF-4DbczNk',
      title: 'Shaktimaan Hindi – Best Superhero Tv Series - Full Episode 4 - शक्तिमान - एपिसोड ४',
      durationSeconds: 2587,
    },
    {
      videoId: '_qPQ4qEcxwI',
      title: 'Shaktimaan Hindi – Best Superhero Tv Series - Full Episode 5 - शक्तिमान - एपिसोड ५',
      durationSeconds: 2381,
    },
    {
      videoId: '9Lza8ZTTICw',
      title: 'Shaktimaan Hindi – Best Superhero Tv Series - Full Episode 6 - शक्तिमान - एपिसोड ६',
      durationSeconds: 2341,
    },
    {
      videoId: 'u5XlPxQpt64',
      title: 'Shaktimaan Hindi – Best Superhero Tv Series - Full Episode 7 - शक्तिमान - एपिसोड ७',
      durationSeconds: 2418,
    },
    {
      videoId: '8KFqk0M2yfk',
      title:
        'Shaktimaan Hindi – Santa Claus in Best Superhero Tv Series - Full Episode 8 - शक्तिमान - एपिसोड ८',
      durationSeconds: 2593,
    },
    {
      videoId: 'sCyoe3GCXFY',
      title: 'Shaktimaan Hindi – Best Superhero Tv Series - Full Episode 9 - शक्तिमान - एपिसोड ९',
      durationSeconds: 2526,
    },
    {
      videoId: 'hDmsAlEzxOg',
      title: 'Shaktimaan Hindi – Best Superhero Tv Series - Full Episode 10 - शक्तिमान - एपिसोड १०',
      durationSeconds: 2357,
    },
    {
      videoId: 'PClSnuMD5SU',
      title: 'Shaktimaan Hindi – Best Superhero Tv Series - Full Episode 11 - शक्तिमान - एपिसोड ११',
      durationSeconds: 2490,
    },
    {
      videoId: 'irWZgxE--Lg',
      title: 'Shaktimaan Hindi – Best Superhero Tv Series - Full Episode 12 - शक्तिमान - एपिसोड १२',
      durationSeconds: 2475,
    },
  ],
  // DD Classics is curated directly in its month-long bundle; preserve it on refresh.
  'DD Classics': ddClassicsPrograms,
  // Preserve the four-category vintage selection when refreshing other stations.
  'Vintage India': vintageIndiaPrograms,
  Ramayan: [
    {
      videoId: 'vIh99bkSc_w',
      title: 'रामायण - EP 1 - राजा दशरथ का पुत्रेष्टि यज्ञ व श्री राम का जन्म',
      durationSeconds: 2097,
    },
    {
      videoId: 'h8TcpbMra3Y',
      title: 'रामायण - EP 2 - राजा दशरथ के चारों पुत्र का गुरुकुल को प्रस्थान',
      durationSeconds: 1941,
    },
    {
      videoId: 'nLYKT3RNOCY',
      title: 'रामायण - EP 3 - महर्षि वशिष्ठ के आश्रम में अयोध्या के राजकुमारों की दीक्षा।',
      durationSeconds: 2174,
    },
    {
      videoId: 'hcP-XeE3EVg',
      title: 'रामायण - EP 4 -  अयोध्या में चारों राजकुमारों का आगमन। श्रीराम द्वारा ताड़का वध',
      durationSeconds: 2227,
    },
    {
      videoId: 'ywJB4qgAB1M',
      title: 'रामायण - EP 5 - विश्वामित्र के यज्ञ की रक्षा, अहिल्या उद्धार',
      durationSeconds: 2193,
    },
    {
      videoId: 'fSCCYtaFu9c',
      title:
        'रामायण - EP 6 - राम लक्ष्मण और विश्वामित्र का जनकपुर आगमन। पुष्पवाटिका में राम सीता दर्शन।',
      durationSeconds: 2187,
    },
    {
      videoId: 't1T8Wt6PjcI',
      title: 'रामायण - EP 7 - सीता स्वयंवर। राजाओं से धनुष न उठना। जनक की निराशाजनक वाणी।',
      durationSeconds: 2210,
    },
    {
      videoId: 'DTS68H8OV9I',
      title: 'रामायण - EP 8 - श्री राम द्वारा धनुष भंग। सीता द्वारा जयमाल। परशुराम लक्ष्मण संवाद।',
      durationSeconds: 2168,
    },
    {
      videoId: '9tmTzNr84AI',
      title: 'रामायण - EP 9 - राजा जनक का राजा दशरथ को सन्देश। राम बारात का मिथिला में आगमन।',
      durationSeconds: 2093,
    },
    {
      videoId: 'MaeAIcLXfzs',
      title: 'रामायण - EP 10 - श्री राम सीता विवाह',
      durationSeconds: 2139,
    },
    {
      videoId: 'S8s4KW6tuio',
      title:
        'रामायण - EP 11 - राम बारात की विदाई। अयोध्या में सीता का स्वागत और राम का एक पत्नीव्रत।',
      durationSeconds: 2151,
    },
    {
      videoId: 'kvOASD0wqGg',
      title:
        'रामायण - EP 12 - भरत-शत्रुघ्न ननिहाल जाते हैं । दशरथ राम के राज्याभिषेक का निर्णय लेते हैं।',
      durationSeconds: 2103,
    },
  ],
  Mahabharat: [
    {
      videoId: 'RSqZbTn2wj4',
      title: 'नीति या शकुनि का कपट? | Mahabharat Scene | B R Chopra | Pen Bhakti',
      durationSeconds: 539,
    },
    {
      videoId: 'ZmxvB3ySN2s',
      title: 'शकुनि की कूटनीति का रहस्य क्या था? | Mahabharat Scene | B R Chopra | Pen Bhakti',
      durationSeconds: 539,
    },
    {
      videoId: 'k99GbpMECi8',
      title:
        'धृतराष्ट्र और गांधारी क्यों व्याकुल हुए? | Mahabharat Scene | B R Chopra | Pen Bhakti',
      durationSeconds: 375,
    },
    {
      videoId: '1mWg5Y-ijso',
      title:
        'षड्यंत्र सफल होने पर दुर्योधन क्यों मुस्कुराया? | Mahabharat Scene | B R Chopra | Pen Bhakti',
      durationSeconds: 421,
    },
    {
      videoId: 'etTmIlXbf4M',
      title: 'पांडवों की सुरक्षा बढ़ाई गई | Mahabharat Scene | B R Chopra | Pen Bhakti',
      durationSeconds: 301,
    },
    {
      videoId: 'baZMuemRxYs',
      title: 'वारणावत में पांडवों का भव्य स्वागत | Mahabharat Scene | B R Chopra | Pen Bhakti',
      durationSeconds: 399,
    },
    {
      videoId: '0V3QD2F9Fu4',
      title: 'युधिष्ठिर ने बनाई गुप्त रणनीति | Mahabharat Scene | B R Chopra | Pen Bhakti',
      durationSeconds: 217,
    },
    {
      videoId: 'b7s6eLXuxfA',
      title: 'युधिष्ठिर–विदुर का रहस्यमय संवाद | Mahabharat Scene | B R Chopra | Pen Bhakti',
      durationSeconds: 359,
    },
    {
      videoId: 'k0S2EwMUjyE',
      title: 'दुर्योधन और शकुनि की गुप्त चर्चा | Mahabharat Scene | B R Chopra | Pen Bhakti',
      durationSeconds: 181,
    },
    {
      videoId: 'Y4kAjoYGD50',
      title: 'युधिष्ठिर ने धृतराष्ट्र से क्या माँगा? | Mahabharat Scene | B R Chopra | Pen Bhakti',
      durationSeconds: 251,
    },
    {
      videoId: 'OvAaL8NE0xI',
      title: 'भीम और पांडवों की गंभीर चर्चा | Mahabharat Scene | B R Chopra | Pen Bhakti',
      durationSeconds: 257,
    },
    {
      videoId: 'Xaa9r5X6dII',
      title: 'गांधारी ने की दुर्योधन की प्रशंसा | Mahabharat Scene | B R Chopra | Pen Bhakti',
      durationSeconds: 318,
    },
  ],
  Animals: [
    {
      videoId: 'RN8pSJ3hOrc',
      title: 'Happy Beginnings: Orphan Bear Cubs Unite | Cub Camp 102',
      durationSeconds: 3001,
    },
    {
      videoId: '2VogebnpKYs',
      title: 'The Largest Coral Reef in the WORLD! | Pacific 102',
      durationSeconds: 2828,
    },
    {
      videoId: '6z6gbo0SpD8',
      title: 'Secrets of the Elephants | Season 1 MEGA EPISODE | Nat Geo Animals',
      durationSeconds: 9755,
    },
    {
      videoId: '4zxAxbBuz8s',
      title: 'Wildlife | Episode 5: Elephants of Africa & Asia | Free Documentary Nature',
      durationSeconds: 3120,
    },
    {
      videoId: 'FwOoC0QdeG4',
      title: 'Elephants Being Elephants | BBC Earth',
      durationSeconds: 2300,
    },
    {
      videoId: '3-QqmQ_MIe4',
      title: 'A Journey Across Africa | BBC Earth',
      durationSeconds: 2983,
    },
    {
      videoId: 'dXRRLQEd5r4',
      title:
        'Rare Wildlife of China’s Mountains (Full Episode) | The Hidden Kingdoms of China | Nat Geo Animals',
      durationSeconds: 2665,
    },
    {
      videoId: 'D6_e6yKH26Q',
      title: 'Clan of the North (Full Episode) | Kingdom of the Polar Bears',
      durationSeconds: 2665,
    },
    {
      videoId: 'oo9c9HC-pmM',
      title: 'The Incredible Wildlife of Hidden Forests | BBC Earth',
      durationSeconds: 5346,
    },
    {
      videoId: 'UiFjONQDHNM',
      title:
        'Wildlife | Episode 1: Tiger, Lion, Leopard & Jaguar - The Four Big Cats | Free Documentary Nature',
      durationSeconds: 3120,
    },
  ],
  'Street Food': [
    {
      videoId: 'HUl5OEWx0zc',
      title: 'The Food Bhutan is Hiding From the World!!',
      durationSeconds: 6058,
    },
    {
      videoId: '--Fjm1dSE8w',
      title: 'Eating with a Somali Pirate in Somalia!!',
      durationSeconds: 1382,
    },
    {
      videoId: 'xLP-d7kRIb0',
      title: "Mega Rats and Poison Snakes — Inside Asia's Bizarre Farms!!",
      durationSeconds: 6329,
    },
    {
      videoId: '5rhQGVR3HgI',
      title: "Surviving Somalia's Extreme Street Food!!",
      durationSeconds: 1685,
    },
    {
      videoId: 'mDyMc5-ri-o',
      title: 'Minnesota Man Goes to Somalia!!',
      durationSeconds: 1589,
    },
    {
      videoId: 'x0kRwgik1cU',
      title: "After This, I'm Quitting Youtube",
      durationSeconds: 800,
    },
    {
      videoId: 'QPR-Q5ysXtA',
      title: 'Eating Every Asian Fried Chicken!!',
      durationSeconds: 1551,
    },
    {
      videoId: '3esVCX2vXjc',
      title: 'How Japan is Destroying American Burgers!!',
      durationSeconds: 1597,
    },
    {
      videoId: 'f6MqooV8mAY',
      title: 'Iraq Street Food from Baghdad to Kurdistan!! from $1 to $1000!!',
      durationSeconds: 6484,
    },
    {
      videoId: 'h90E1Cp05Qw',
      title: 'JAPANified Pizza!! Why are they doing this!?!?',
      durationSeconds: 1536,
    },
    {
      videoId: 'rYaj4u4wU6Q',
      title: 'What is Japan Doing To Sandwiches?!?!',
      durationSeconds: 1272,
    },
    {
      videoId: 'sxQkWt0Pg_c',
      title: 'How Japan is DESTROYING American Breakfast!!',
      durationSeconds: 1641,
    },
  ],
  Space: [
    {
      videoId: 'wkQuOrsgVGY',
      title: 'Eight Wonders Of Our Solar System | The Planets | BBC Earth Science',
      durationSeconds: 3930,
    },
    {
      videoId: 'KNoJBAxoTk0',
      title: 'Explore Our Solar System’s Secrets 🪐 How the Universe Works | Science Channel',
      durationSeconds: 3838,
    },
    {
      videoId: 'iqJjTeYv5-M',
      title: 'Everything You Want to Know About Planets | How the Universe Works | Science Channel',
      durationSeconds: 3509,
    },
    {
      videoId: '31g2MOcanBU',
      title: 'The Age of Hubble 4K',
      durationSeconds: 2741,
    },
    {
      videoId: 'uBJeOvWqNkg',
      title:
        "The Mysteries Behind Our Solar System's Majestic Planets | The Planets | BBC Earth Science",
      durationSeconds: 3915,
    },
    {
      videoId: 'SLmWY_ycFUA',
      title: 'Uncovering the Secrets of the Sun (Full Episode) | National Geographic',
      durationSeconds: 2665,
    },
  ],
}
