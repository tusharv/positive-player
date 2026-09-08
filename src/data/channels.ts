export type ChannelKind = 'search' | 'playlist'
export type ChannelMood = 'calm' | 'warm' | 'bright' | 'curious'

export type Channel = {
  number: number
  name: string
  kind: ChannelKind
  query?: string
  playlistId?: string
  blurb?: string
  mood?: ChannelMood
  tags: string[]
  category?: string
}

type LineupRow = {
  name: string
  playlistId: string
  query: string
  blurb: string
  mood: ChannelMood
  category: string
  tags?: string[]
}

const LINEUP: LineupRow[] = [
  { name: 'Nature', playlistId: 'UUwmZiChSryoWQCZMIQezgTg', query: 'peaceful nature scenery forests meadows rivers', blurb: 'Forests, meadows, and quiet rivers.', mood: 'calm', category: 'Earth' },
  { name: 'Ocean', playlistId: 'UUFXww6CrLAHhyZQCDnJ2g2A', query: 'calm ocean waves long take shoreline', blurb: 'Long takes of a gentle shoreline.', mood: 'calm', category: 'Earth' },
  { name: 'Animals', playlistId: 'UURZPkuHwaoKwTP3CYPdVldg', query: 'cute animals peaceful wildlife companions', blurb: 'Gentle creatures keeping you company.', mood: 'warm', category: 'Animals' },
  { name: 'Lofi', playlistId: 'UUSJ4gkVC6NrvII8umztf0Ow', query: 'lofi hip hop radio beats to relax study', blurb: 'Late-night beats for a soft room.', mood: 'calm', category: 'Music' },
  { name: 'Talks', playlistId: 'UUAuUUnT6oDeKwE6v1NGQxug', query: 'TED talk kindness wonder humanity', blurb: 'Talks about kindness and wonder.', mood: 'curious', category: 'Ideas' },
  { name: 'Space', playlistId: 'UULA_DiR1FfKNvjuUpBHmylQ', query: 'space documentary calm cosmos universe', blurb: 'Quiet films about the cosmos.', mood: 'curious', category: 'Ideas' },
  { name: 'Kitchen', playlistId: 'UUJHA_jMfCvEnv-3kRjTCQXw', query: 'comfort cooking home kitchen unhurried', blurb: 'Unhurried home cooking.', mood: 'warm', category: 'Food' },
  { name: 'Craft', playlistId: 'UU6x7GwJxuoABSosgVXDYtTw', query: 'pottery woodworking process handmade studio', blurb: 'Hands making something slowly.', mood: 'warm', category: 'Making' },
  { name: 'Classic Music', playlistId: 'UUWgEWXnFFFeoXMJ766CfDLw', query: 'folk music around the world traditional', blurb: 'Folk traditions from every shore.', mood: 'warm', category: 'Music' },
  { name: 'Good News', playlistId: 'UU-5cgXLYJIGo8hYi0ysHHJA', query: 'positive news stories hopeful journalism', blurb: 'Headlines that leave the light on.', mood: 'bright', category: 'World' },
  { name: 'Bollywood', playlistId: 'UUq-Fj5jknLsUf-MWSy4_brA', query: 'bollywood songs picturization classic hits', blurb: 'Film songs and bright picturizations.', mood: 'bright', category: 'Music' },
  { name: 'Cricket', playlistId: 'UUt2JXOLNxqry7B_4rRZME3Q', query: 'cricket match highlights classic innings', blurb: 'Classic innings and bright shots.', mood: 'bright', category: 'Play' },
  { name: 'Rain', playlistId: 'UUbunYN0o9Yaid7zHaor_UHA', query: 'rain on window roof forest ambience hours', blurb: 'Rain on glass, roofs, and leaves.', mood: 'calm', category: 'Earth' },
  { name: 'Fireplace', playlistId: 'UUKbNUHzI3DLAK5KC_naWANw', query: 'crackling fireplace hearth 4k no talking', blurb: 'A hearth that does not go out.', mood: 'warm', category: 'Earth' },
  { name: 'Forest', playlistId: 'UUqRTj-Nu_8to3jIBlXptOtA', query: 'deep forest walk ambient birds woodland', blurb: 'A long walk under old trees.', mood: 'calm', category: 'Earth' },
  { name: 'Mountains', playlistId: 'UUtOlVogKzQplz7tpmRHZIpw', query: 'alpine mountain landscape scenic 4k calm', blurb: 'Ridges, snowfields, and thin air.', mood: 'calm', category: 'Earth' },
  { name: 'Desert', playlistId: 'UUGDkxheIaqyGAKn7ItLi1KA', query: 'desert dunes landscape golden hour 4k', blurb: 'Dunes and heat haze at golden hour.', mood: 'calm', category: 'Earth' },
  { name: 'River', playlistId: 'UU4lp9Emg1ci8eo2eDkB-Tag', query: 'flowing river stream water sounds scenery', blurb: 'Water finding its way downhill.', mood: 'calm', category: 'Earth' },
  { name: 'Falls', playlistId: 'UUw37TpdXJDmXWdO-QmLEApA', query: 'waterfall mist nature scenery 4k ambient', blurb: 'White water and standing mist.', mood: 'calm', category: 'Earth' },
  { name: 'Snow', playlistId: 'UU4SnPoPC5g4LKsRsLVNIhmw', query: 'snowfall winter forest peaceful 4k', blurb: 'Snow falling through winter woods.', mood: 'calm', category: 'Earth' },
  { name: 'Aurora', playlistId: 'UUagl6wnEsfCZ0QRmBvOMZLw', query: 'northern lights aurora borealis real footage', blurb: 'Green fire over a dark horizon.', mood: 'curious', category: 'Earth' },
  { name: 'Clouds', playlistId: 'UUqOecsBLULnuUtls0tISTCw', query: 'cloud timelapse sky peaceful 4k', blurb: 'Weather moving like a slow film.', mood: 'calm', category: 'Earth' },
  { name: 'Stars', playlistId: 'UUAY-SMFNfynqz1bdoaV8BeQ', query: 'milky way night sky stars timelapse dark', blurb: 'The night sky, unhurried.', mood: 'curious', category: 'Earth' },
  { name: 'Aquarium', playlistId: 'UUnM5iMGiKsZg-iOlIO2ZkdQ', query: 'tropical aquarium fish tank relaxing 4k', blurb: 'A bright tank in a dark room.', mood: 'calm', category: 'Animals' },
  { name: 'Birds', playlistId: 'UU3f1BA-UQk-y_amoXCrlTDA', query: 'garden birds birdsong peaceful nature', blurb: 'Garden birds and morning song.', mood: 'calm', category: 'Animals' },
  { name: 'Whales', playlistId: 'UUG5_BraUMNcluZPZ__oOeKg', query: 'whales ocean documentary gentle giants', blurb: 'Giants moving through blue water.', mood: 'curious', category: 'Animals' },
  { name: 'Cats', playlistId: 'UUV6HJBZD_hZcIX9JVJ3dCXQ', query: 'cats relaxing compilation peaceful kittens', blurb: 'Cats doing almost nothing well.', mood: 'warm', category: 'Animals' },
  { name: 'Dogs', playlistId: 'UUINb0wqPz-A0dV9nARjJlOQ', query: 'happy dogs compilation golden retriever cute', blurb: 'Dogs glad to see you anyway.', mood: 'bright', category: 'Animals' },
  { name: 'Horses', playlistId: 'UUb3uedNKWKG7gGDYQJ1VsWg', query: 'horses in fields countryside peaceful', blurb: 'Horses in open country.', mood: 'calm', category: 'Animals' },
  { name: 'Pandas', playlistId: 'UUgnSI0PkN2erAd9GReaixdw', query: 'pandas eating bamboo cute peaceful', blurb: 'Bamboo, tumbling, nap.', mood: 'warm', category: 'Animals' },
  { name: 'Bees', playlistId: 'UUwbaHD0bMAEij47jKCnVwsw', query: 'bees wildflowers pollinators close up calm', blurb: 'Bees working a field of color.', mood: 'curious', category: 'Animals' },
  { name: 'Farm', playlistId: 'UUdXhATLRrKGuYPmXFQKW-ng', query: 'pastoral farm life countryside morning', blurb: 'Morning work on a small farm.', mood: 'warm', category: 'Earth' },
  { name: 'Safari', playlistId: 'UUyfZleh4w7buTzi0WfY8WqA', query: 'african savanna wildlife documentary calm', blurb: 'Open grassland and long light.', mood: 'curious', category: 'Animals' },
  { name: 'Reef', playlistId: 'UUCcKXrcYh7IkeSwDQoKqcsg', query: 'coral reef underwater 4k relaxing fish', blurb: 'Color under a thin skin of sea.', mood: 'calm', category: 'Animals' },
  { name: 'Piano', playlistId: 'UUTpTyEljhUp2WJ2m7Me932Q', query: 'solo piano radio peaceful classical hours', blurb: 'One piano, no hurry.', mood: 'calm', category: 'Music' },
  { name: 'Guitar', playlistId: 'UUjWRi2qaGtKjQyoQLc4OGkw', query: 'acoustic guitar instrumental peaceful radio', blurb: 'Steel strings in a quiet room.', mood: 'warm', category: 'Music' },
  { name: 'Violin', playlistId: 'UUAzKFALPuF_EPe-AEI0WFFw', query: 'violin cello strings classical peaceful', blurb: 'Bows drawing long notes.', mood: 'calm', category: 'Music' },
  { name: 'Choir', playlistId: 'UU3UpGPbOIOG6IaUijyRpp6Q', query: 'choral music choir peaceful sacred', blurb: 'Many voices becoming one room.', mood: 'calm', category: 'Music' },
  { name: 'Ambient', playlistId: 'UUjzHeG1KWoonmf9d5KBvSiw', query: 'ambient music soundscape atmospheric radio', blurb: 'Pads and weather for the mind.', mood: 'calm', category: 'Music' },
  { name: 'Soul', playlistId: 'UUMntlo_DQc_r4ZJuiYYEYdQ', query: 'classic soul music playlist motown', blurb: 'Warm voices from the old radio.', mood: 'warm', category: 'Music' },
  { name: 'Blues', playlistId: 'UULN-YTnK_48R0ZikVjQs5jQ', query: 'blues music radio live guitar', blurb: 'A twelve-bar that never quite ends.', mood: 'warm', category: 'Music' },
  { name: 'Reggae', playlistId: 'UUAlTDckOOQ2jREOvuCShGbw', query: 'reggae dub radio roots music', blurb: 'Offbeat sun from the islands.', mood: 'warm', category: 'Music' },
  { name: 'Bossa', playlistId: 'UUL4bnkoDiRjfgP9Or95kEbw', query: 'bossa nova radio brazilian jazz guitar', blurb: 'Soft samba from a seaside room.', mood: 'warm', category: 'Music' },
  { name: 'Flamenco', playlistId: 'UU6CuYW67kRH-POuJntvF3kg', query: 'flamenco guitar palmas live spain', blurb: 'Hands, wood, and Andalusian fire.', mood: 'bright', category: 'Music' },
  { name: 'Gospel', playlistId: 'UUcVqCJ_9owb1zM43vqswMNQ', query: 'gospel choir music joyful church', blurb: 'A choir lifting the rafters.', mood: 'bright', category: 'Music' },
  { name: 'Disco', playlistId: 'UUcuWY5m5Ev91PXvRn_dFScw', query: 'classic disco music playlist dance', blurb: 'Mirror-ball nights, still spinning.', mood: 'bright', category: 'Music' },
  { name: 'Funk', playlistId: 'UUOCZxe0gNRA7c3PGWPGoiGg', query: 'funk music grooves classic playlist', blurb: 'Basslines that refuse to sit down.', mood: 'bright', category: 'Music' },
  { name: 'Score', playlistId: 'UUJeBQabyLa_FvMxb6G67lkw', query: 'film score soundtrack orchestral radio', blurb: 'Orchestras built for pictures.', mood: 'curious', category: 'Music' },
  { name: 'Celtic', playlistId: 'UUv_5qR7iLZwlImg_8qc6Iog', query: 'celtic folk music ireland scotland harp fiddle', blurb: 'Fiddles and harps from the isles.', mood: 'warm', category: 'Music' },
  { name: 'Sitar', playlistId: 'UUWEJt0-LJuRE0seaIMIm2jA', query: 'indian classical sitar raga live', blurb: 'Ragas unfolding in their own time.', mood: 'calm', category: 'Music' },
  { name: 'Kora', playlistId: 'UUHfn2F3JMMrRamU3otZMgKw', query: 'west african kora music traditional', blurb: 'Twenty-one strings of the Sahel.', mood: 'warm', category: 'Music' },
  { name: 'Fado', playlistId: 'UUrmjiFiHRdxSIyc6KJ3HE9Q', query: 'portuguese fado music lisbon live', blurb: 'Lisbon singing about what left.', mood: 'warm', category: 'Music' },
  { name: 'Gagaku', playlistId: 'UUSPEjw8F2nQDtmUKPFNF7_A', query: 'japanese traditional music koto shakuhachi', blurb: 'Koto and bamboo flute, unhurried.', mood: 'calm', category: 'Music' },
  { name: 'Mariachi', playlistId: 'UU9rRQn6OyaXu9vMUoLOaQhg', query: 'mariachi music mexico live trumpets', blurb: 'Trumpets and strings in the plaza.', mood: 'bright', category: 'Music' },
  { name: 'Highlife', playlistId: 'UUv39nhczfWLxiKFtIX7Km8A', query: 'african highlife music ghana guitar', blurb: 'Ghanaian guitars in the sun.', mood: 'bright', category: 'Music' },
  { name: 'Gamelan', playlistId: 'UUlw3_qG8VhrVcg1u3J6VKig', query: 'indonesian gamelan music traditional', blurb: 'Bronze bells in measured waves.', mood: 'calm', category: 'Music' },
  { name: 'Opera', playlistId: 'UUCO7yOvvTwd6rUcsDr4VqRw', query: 'opera arias beautiful voices classical', blurb: 'Arias that fill a whole house.', mood: 'curious', category: 'Music' },
  { name: 'Harp', playlistId: 'UUStzCQWBOnx8pQsj83fNk9g', query: 'harp music peaceful instrumental hours', blurb: 'Strings you can almost see move.', mood: 'calm', category: 'Music' },
  { name: 'Flute', playlistId: 'UUL0LfmQmAR_ogGViewymzzA', query: 'wooden flute music peaceful world folk', blurb: 'Breath made into a long line.', mood: 'calm', category: 'Music' },
  { name: 'Organ', playlistId: 'UU3KxUwgQ6ojeId4k32ke1zQ', query: 'pipe organ music cathedral peaceful', blurb: 'Pipes the size of a room.', mood: 'calm', category: 'Music' },
  { name: 'Baking', playlistId: 'UUhBEbMKI1eCcejTtmI32UEw', query: 'bread baking pastry process ASMR kitchen', blurb: 'Dough, heat, and patience.', mood: 'warm', category: 'Food' },
  { name: 'Coffee', playlistId: 'UUMb0O2CdPBNi-QqPk5T3gsQ', query: 'coffee shop cafe ritual pour over process', blurb: 'Pour-overs and a quiet counter.', mood: 'warm', category: 'Food' },
  { name: 'Tea', playlistId: 'UUaHBABJFMRAtnKhQp2Cu5BQ', query: 'tea ceremony pouring ritual japanese chinese', blurb: 'Hot water meeting leaves.', mood: 'calm', category: 'Food' },
  { name: 'Pasta', playlistId: 'UUcsSowAamCLJv-xeF9geXoA', query: 'italian pasta making handmade kitchen', blurb: 'Flour, eggs, and a wooden board.', mood: 'warm', category: 'Food' },
  { name: 'Street Food', playlistId: 'UUcAd5Np7fO8SeejB1FVKcYw', query: 'street food around the world markets', blurb: 'Night markets and open grills.', mood: 'bright', category: 'Food' },
  { name: 'Clay', playlistId: 'UUqZL_f4Jp8yHnv2KNvcsWeg', query: 'pottery wheel throwing ceramic studio', blurb: 'A wheel, wet clay, and time.', mood: 'warm', category: 'Making' },
  { name: 'Wood', playlistId: 'UUxWzA3ZlYEOLr1JkKH0ZMyg', query: 'woodworking hand tools furniture making', blurb: 'Shavings curling off a plane.', mood: 'warm', category: 'Making' },
  { name: 'Glass', playlistId: 'UUAmsTmQTOPbSfXs6QIDgGXg', query: 'glassblowing furnace studio process', blurb: 'Hot glass turning into a shape.', mood: 'curious', category: 'Making' },
  { name: 'Ink', playlistId: 'UUVB8_wffqb6zWy6Yb8j07aA', query: 'calligraphy brush ink process chinese arabic', blurb: 'Ink finding the edge of a letter.', mood: 'calm', category: 'Making' },
  { name: 'Paint', playlistId: 'UUx3ZBWhNHGj-X7mVfOm9OpQ', query: 'oil painting process landscape studio time lapse', blurb: 'Color arriving on a canvas.', mood: 'curious', category: 'Making' },
  { name: 'Yarn', playlistId: 'UUrRT4LwemxYrZxj-HeCkK9Q', query: 'knitting crochet yarn crafts relaxing', blurb: 'Loops becoming a garment.', mood: 'warm', category: 'Making' },
  { name: 'Paper', playlistId: 'UU3ICcukYYeSn26KlCRnhOhA', query: 'origami paper folding art process', blurb: 'A square becoming a bird.', mood: 'calm', category: 'Making' },
  { name: 'Tokyo', playlistId: 'UUAcsAE1tpLuP3y7UhxUoWpQ', query: 'tokyo night walk ambient city 4k no talking', blurb: 'Neon rain and midnight trains.', mood: 'curious', category: 'Places' },
  { name: 'Paris', playlistId: 'UUp-19k4Q740VyGb1rEQhXrw', query: 'paris street walk ambient 4k cafes', blurb: 'Cafés, bridges, and grey stone.', mood: 'warm', category: 'Places' },
  { name: 'Venice', playlistId: 'UU_HaLOSceVYlSOEamvqUFmQ', query: 'venice canals walking tour 4k quiet', blurb: 'Water streets and low bells.', mood: 'calm', category: 'Places' },
  { name: 'Kyoto', playlistId: 'UUGn7dlcAmH44GqycKa_3ssA', query: 'kyoto temples gardens walking tour 4k', blurb: 'Gardens raked for attention.', mood: 'calm', category: 'Places' },
  { name: 'Marrakech', playlistId: 'UU1nL_jlzkFjzpvWrSnTFJZA', query: 'marrakech medina souk walking tour', blurb: 'Spice, shade, and tiled doors.', mood: 'bright', category: 'Places' },
  { name: 'Havana', playlistId: 'UUO0RXgHxcCmWIwfGWOAwo-w', query: 'havana cuba streets walking tour music', blurb: 'Pastel walls and open windows.', mood: 'warm', category: 'Places' },
  { name: 'Seoul', playlistId: 'UUuQoPphv4rYLbJwR8GZXwuQ', query: 'seoul city walk night 4k ambient', blurb: 'Night markets and river paths.', mood: 'curious', category: 'Places' },
  { name: 'Cairo', playlistId: 'UUBLXxZu3vQtvx0WfVBrzbmQ', query: 'cairo egypt nile walking tour historic', blurb: 'The river and the old city.', mood: 'curious', category: 'Places' },
  { name: 'Andes', playlistId: 'UUw1rm0G84eMEeMZ5dvxPnEw', query: 'andes mountains villages peru scenic', blurb: 'High villages in thin air.', mood: 'calm', category: 'Places' },
  { name: 'Iceland', playlistId: 'UUTMhtDPRm-jTQ10Zl6N2haA', query: 'iceland landscape road trip waterfalls 4k', blurb: 'Black sand and pale water.', mood: 'calm', category: 'Places' },
  { name: 'Kerala', playlistId: 'UUmiF2GcrQwFeiTdnKJ_023A', query: 'kerala backwaters houseboat india scenic', blurb: 'Houseboats on the backwaters.', mood: 'warm', category: 'Places' },
  { name: 'Lisbon', playlistId: 'UU5D1TiKg5e0Q2FDzlBk2mdA', query: 'lisbon tram streets walking tour 4k', blurb: 'Trams climbing tiled hills.', mood: 'warm', category: 'Places' },
  { name: 'Yoga', playlistId: 'UUFKE7WVJfvaHW5q283SxchA', query: 'gentle yoga class slow morning stretch', blurb: 'A slow class on a quiet mat.', mood: 'calm', category: 'Body' },
  { name: 'Still', playlistId: 'UU4jWo5kiyOCt4PnvF4jbaLg', query: 'meditation silent sitting nature visuals', blurb: 'Sitting still with something green.', mood: 'calm', category: 'Body' },
  { name: 'Tai Chi', playlistId: 'UUqTPnQf5SDprSc2ly7ROQfg', query: 'tai chi in park practice slow', blurb: 'Slow forms in morning parks.', mood: 'calm', category: 'Body' },
  { name: 'Museum', playlistId: 'UUafm6w_rPndqAtokQy04Jdw', query: 'art museum tour documentary paintings', blurb: 'Rooms built for looking longer.', mood: 'curious', category: 'Ideas' },
  { name: 'Buildings', playlistId: 'UUsWG9ANbrmgR0z-eFk_A3YQ', query: 'architecture documentary beautiful buildings', blurb: 'How rooms and cities stand up.', mood: 'curious', category: 'Ideas' },
  { name: 'History', playlistId: 'UU88lvyJe7aHZmcvzvubDFRg', query: 'calm history documentary ancient world', blurb: 'Old stories told without hurry.', mood: 'curious', category: 'Ideas' },
  { name: 'Rocks', playlistId: 'UUzR-rom72PHN9Zg7RML9EbA', query: 'geology documentary earth science landscapes', blurb: 'The planet explaining itself.', mood: 'curious', category: 'Ideas' },
  { name: 'Words', playlistId: 'UUqcBu0YyEJH4vfKR--97cng', query: 'language learning pleasant conversation culture', blurb: 'New words, spoken kindly.', mood: 'curious', category: 'Ideas' },
  { name: 'Chess', playlistId: 'UU5kS0l76kC0xOzMPtOmSFGw', query: 'chess game commentary beautiful match', blurb: 'Quiet wars on sixty-four squares.', mood: 'curious', category: 'Play' },
  { name: 'Gardens', playlistId: 'UU_kg1A_YPAa66hZWq7VPg7Q', query: 'botanical garden walking tour flowers 4k', blurb: 'Paths cut through planted color.', mood: 'calm', category: 'Earth' },
  { name: 'Trains', playlistId: 'UUj-Xm8j6WBgKY8OG7s9r2vQ', query: 'scenic train journey cab view 4k', blurb: 'Windows that do the traveling.', mood: 'calm', category: 'Places' },
  { name: 'Sailing', playlistId: 'UUZdQjaSoLjIzFnWsDQOv4ww', query: 'sailing calm sea yacht journey 4k', blurb: 'Canvas, wind, and a clean wake.', mood: 'calm', category: 'Places' },
  { name: 'Tennis', playlistId: 'UUY_5h5zaSwN7Or4kIJDYNXA', query: 'tennis match highlights classic rallies', blurb: 'Rallies that refuse to end.', mood: 'bright', category: 'Play' },
  { name: 'Football', playlistId: 'UUpcTrCXblq78GZrTUTLWeBw', query: 'football soccer goals highlights beautiful play', blurb: 'Goals worth standing up for.', mood: 'bright', category: 'Play' },
  { name: 'Formula', playlistId: 'UUB_qr75-ydFVKSF9Dmo6izg', query: 'formula 1 highlights onboard racing', blurb: 'Color and speed on a Sunday.', mood: 'bright', category: 'Play' },
  { name: 'Olympics', playlistId: 'UUTl3QQTvqHFjurroKxexy2Q', query: 'olympic games memorable moments highlights', blurb: 'The best hours of the Games.', mood: 'bright', category: 'Play' },
  { name: 'Hoops', playlistId: 'UUWJ2lWNubArHWmf3FIHbfcQ', query: 'basketball highlights beautiful plays dunks', blurb: 'The ball hanging in the lights.', mood: 'bright', category: 'Play' },
  { name: 'Peloton', playlistId: 'UUSpycUnuU0IVF7gGIhGojhg', query: 'tour de france scenic mountain stages', blurb: 'A peloton climbing a mountain.', mood: 'curious', category: 'Play' },
  { name: 'Ice', playlistId: 'UU_rE3bivyW-5h3O_bynaGxA', query: 'figure skating performances beautiful programs', blurb: 'Blades drawing on white ice.', mood: 'bright', category: 'Play' },
  { name: 'Surf', playlistId: 'UU--3c8RqSfAqYBdDjIG3UNA', query: 'surfing ocean waves compilation 4k', blurb: 'Bodies reading a moving wall.', mood: 'bright', category: 'Play' },
  { name: 'Trail', playlistId: 'UU0G89mHRgB4rCtI9tNhm8pg', query: 'hiking trail walk forest mountain 4k', blurb: 'Boots on a long path.', mood: 'calm', category: 'Body' },
  { name: 'Camp', playlistId: 'UUfpCQ89W9wjkHc8J_6eTbBg', query: 'camping campfire night forest relaxing', blurb: 'A fire and a small circle of dark.', mood: 'warm', category: 'Earth' },
  { name: 'Library', playlistId: 'UUxH6RUpdRmQhzgUQ_BlRQmA', query: 'beautiful libraries reading rooms quiet tour', blurb: 'Shelves built to outlast us.', mood: 'calm', category: 'Ideas' },
  { name: 'Bookshop', playlistId: 'UUcZK1UEPwVR5HQNOIZoW8lg', query: 'independent bookstore walking tour books', blurb: 'Narrow aisles of unread days.', mood: 'warm', category: 'Places' },
  { name: 'Vinyl', playlistId: 'UU711FZ-43Ka4y7EdK2NnRiw', query: 'vinyl records spinning turntable music room', blurb: 'A record turning in real time.', mood: 'warm', category: 'Music' },
  { name: 'Dawn', playlistId: 'UUG-fhHppNRhDRYmpmDOvRag', query: 'sunrise timelapse world peaceful morning', blurb: 'The first light, again.', mood: 'calm', category: 'Earth' },
  { name: 'Dusk', playlistId: 'UUJjuIasJZDMPd4MAULFzDQw', query: 'sunset timelapse golden hour world 4k', blurb: 'The day putting itself away.', mood: 'warm', category: 'Earth' },
  { name: 'Storm', playlistId: 'UUAQpSHsgUcNt6uCOjpgD8kw', query: 'distant thunderstorm nature ambience dark', blurb: 'Weather talking from far off.', mood: 'calm', category: 'Earth' },
  { name: 'Wind', playlistId: 'UUTro_uBhyFrlKKYeBklV8Ow', query: 'wind in grass trees nature soundscape', blurb: 'Grass and trees leaning together.', mood: 'calm', category: 'Earth' },
  { name: 'Market', playlistId: 'UUyEd6QBSgat5kkC6svyjudA', query: 'colorful markets around the world walking', blurb: 'Fruit, cloth, and loud kindness.', mood: 'bright', category: 'World' },
  { name: 'Festival', playlistId: 'UUpVm7bg6pXKo1Pr6k5kxG9A', query: 'cultural festivals around the world joyful', blurb: 'A town dressed for itself.', mood: 'bright', category: 'World' },
  { name: 'Dance', playlistId: 'UUtnboZiB_Nqif-YNtp4aB7A', query: 'folk dance around the world traditional', blurb: 'Feet keeping old time.', mood: 'bright', category: 'World' },
  { name: 'Circus', playlistId: 'UUPiWIjwDZQo3UobMqvi4ggg', query: 'contemporary circus arts performance', blurb: 'Bodies making a tent of air.', mood: 'curious', category: 'Play' },
  { name: 'Puppets', playlistId: 'UUa5yYlgsAhcpmMYxTM7TE1Q', query: 'puppet theatre performance traditional world', blurb: 'Small figures with large lives.', mood: 'warm', category: 'World' },
  { name: 'Kindness', playlistId: 'UUaDVcGDMkvcRb4qGARkWlyg', query: 'random acts of kindness compilation hopeful', blurb: 'Strangers being good on purpose.', mood: 'warm', category: 'World' },
  { name: 'Lakes', playlistId: 'UUQ0QnGji1IdkH0XI80s59rw', query: 'calm lake scenery reflections 4k nature', blurb: 'Still water holding the sky.', mood: 'calm', category: 'Earth' },
  { name: 'DD Classics', playlistId: 'UUSjPe5kinQtwcyHcFJyyMfw', query: 'Doordarshan classic serials Ramayan Mahabharat Jungle Book Shaktimaan Hindi full episodes', blurb: 'Ramayan, Mahabharat, Jungle Book, and Shaktimaan from the DD era.', mood: 'warm', category: 'Classic TV', tags: ['DD Era', 'Hindi', 'Nostalgia', 'Classic TV'] },
  { name: 'Ramayan', playlistId: 'UUEKWXRsfUHkan-D_ljU8Asw', query: 'Ramayan Ramanand Sagar original Hindi full episode', blurb: 'Ramanand Sagar’s original Ramayan, in Hindi.', mood: 'warm', category: 'Classic TV', tags: ['DD Era', 'Hindi', 'Mythology', 'Drama'] },
  { name: 'Mahabharat', playlistId: 'UUpEhnqL0y41EpW2TvWAHD7Q', query: 'Mahabharat B R Chopra original Hindi full episode', blurb: 'B. R. Chopra’s classic telling of the Mahabharat.', mood: 'curious', category: 'Classic TV', tags: ['DD Era', 'Hindi', 'Mythology', 'Drama'] },
  { name: 'Jungle Book', playlistId: 'UUA6Vx_EMNsKeTdeZsLEUpjA', query: 'Jungle Book Mowgli Doordarshan original Hindi full episode cartoon', blurb: 'Mowgli and friends in the Hindi animated classic.', mood: 'bright', category: 'Classic TV', tags: ['DD Era', 'Hindi', 'Animation', 'Adventure'] },
  { name: 'Shaktimaan', playlistId: 'UUF1JIbMUs6uqoZEY1Haw0GQ', query: 'Shaktimaan Mukesh Khanna original Hindi full episode', blurb: 'Mukesh Khanna’s superhero adventures from the DD era.', mood: 'bright', category: 'Classic TV', tags: ['DD Era', 'Hindi', 'Superhero', 'Adventure'] },
]

export const CHANNELS: Channel[] = LINEUP.map((row, index) => ({
  number: index + 1,
  kind: 'playlist',
  ...row,
  tags: row.tags ?? [row.category, row.mood[0]!.toUpperCase() + row.mood.slice(1)],
}))

export const CHANNEL_COUNT = CHANNELS.length
export const CHANNEL_DIGITS = String(CHANNEL_COUNT).length

export function channelByNumber(n: number): Channel | undefined {
  return CHANNELS.find((channel) => channel.number === n)
}

export function formatChannelNumber(n: number): string {
  return String(n).padStart(CHANNEL_DIGITS, '0')
}

export function formatChannelLabel(channel: Channel): string {
  return `CH ${formatChannelNumber(channel.number)}  ${channel.name.toUpperCase()}`
}
