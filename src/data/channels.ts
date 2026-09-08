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
  category?: string
}

type LineupRow = {
  name: string
  query: string
  blurb: string
  mood: ChannelMood
  category: string
}

const LINEUP: LineupRow[] = [
  { name: 'Nature', query: 'peaceful nature scenery forests meadows rivers', blurb: 'Forests, meadows, and quiet rivers.', mood: 'calm', category: 'Earth' },
  { name: 'Ocean', query: 'calm ocean waves long take shoreline', blurb: 'Long takes of a gentle shoreline.', mood: 'calm', category: 'Earth' },
  { name: 'Animals', query: 'cute animals peaceful wildlife companions', blurb: 'Gentle creatures keeping you company.', mood: 'warm', category: 'Animals' },
  { name: 'Lofi', query: 'lofi hip hop radio beats to relax study', blurb: 'Late-night beats for a soft room.', mood: 'calm', category: 'Music' },
  { name: 'Talks', query: 'TED talk kindness wonder humanity', blurb: 'Talks about kindness and wonder.', mood: 'curious', category: 'Ideas' },
  { name: 'Space', query: 'space documentary calm cosmos universe', blurb: 'Quiet films about the cosmos.', mood: 'curious', category: 'Ideas' },
  { name: 'Kitchen', query: 'comfort cooking home kitchen unhurried', blurb: 'Unhurried home cooking.', mood: 'warm', category: 'Food' },
  { name: 'Craft', query: 'pottery woodworking process handmade studio', blurb: 'Hands making something slowly.', mood: 'warm', category: 'Making' },
  { name: 'Classic Music', query: 'folk music around the world traditional', blurb: 'Folk traditions from every shore.', mood: 'warm', category: 'Music' },
  { name: 'Good News', query: 'positive news stories hopeful journalism', blurb: 'Headlines that leave the light on.', mood: 'bright', category: 'World' },
  { name: 'Bollywood', query: 'bollywood songs picturization classic hits', blurb: 'Film songs and bright picturizations.', mood: 'bright', category: 'Music' },
  { name: 'Cricket', query: 'cricket match highlights classic innings', blurb: 'Classic innings and bright shots.', mood: 'bright', category: 'Play' },
  { name: 'Rain', query: 'rain on window roof forest ambience hours', blurb: 'Rain on glass, roofs, and leaves.', mood: 'calm', category: 'Earth' },
  { name: 'Fireplace', query: 'crackling fireplace hearth 4k no talking', blurb: 'A hearth that does not go out.', mood: 'warm', category: 'Earth' },
  { name: 'Forest', query: 'deep forest walk ambient birds woodland', blurb: 'A long walk under old trees.', mood: 'calm', category: 'Earth' },
  { name: 'Mountains', query: 'alpine mountain landscape scenic 4k calm', blurb: 'Ridges, snowfields, and thin air.', mood: 'calm', category: 'Earth' },
  { name: 'Desert', query: 'desert dunes landscape golden hour 4k', blurb: 'Dunes and heat haze at golden hour.', mood: 'calm', category: 'Earth' },
  { name: 'River', query: 'flowing river stream water sounds scenery', blurb: 'Water finding its way downhill.', mood: 'calm', category: 'Earth' },
  { name: 'Falls', query: 'waterfall mist nature scenery 4k ambient', blurb: 'White water and standing mist.', mood: 'calm', category: 'Earth' },
  { name: 'Snow', query: 'snowfall winter forest peaceful 4k', blurb: 'Snow falling through winter woods.', mood: 'calm', category: 'Earth' },
  { name: 'Aurora', query: 'northern lights aurora borealis real footage', blurb: 'Green fire over a dark horizon.', mood: 'curious', category: 'Earth' },
  { name: 'Clouds', query: 'cloud timelapse sky peaceful 4k', blurb: 'Weather moving like a slow film.', mood: 'calm', category: 'Earth' },
  { name: 'Stars', query: 'milky way night sky stars timelapse dark', blurb: 'The night sky, unhurried.', mood: 'curious', category: 'Earth' },
  { name: 'Aquarium', query: 'tropical aquarium fish tank relaxing 4k', blurb: 'A bright tank in a dark room.', mood: 'calm', category: 'Animals' },
  { name: 'Birds', query: 'garden birds birdsong peaceful nature', blurb: 'Garden birds and morning song.', mood: 'calm', category: 'Animals' },
  { name: 'Whales', query: 'whales ocean documentary gentle giants', blurb: 'Giants moving through blue water.', mood: 'curious', category: 'Animals' },
  { name: 'Cats', query: 'cats relaxing compilation peaceful kittens', blurb: 'Cats doing almost nothing well.', mood: 'warm', category: 'Animals' },
  { name: 'Dogs', query: 'happy dogs compilation golden retriever cute', blurb: 'Dogs glad to see you anyway.', mood: 'bright', category: 'Animals' },
  { name: 'Horses', query: 'horses in fields countryside peaceful', blurb: 'Horses in open country.', mood: 'calm', category: 'Animals' },
  { name: 'Pandas', query: 'pandas eating bamboo cute peaceful', blurb: 'Bamboo, tumbling, nap.', mood: 'warm', category: 'Animals' },
  { name: 'Bees', query: 'bees wildflowers pollinators close up calm', blurb: 'Bees working a field of color.', mood: 'curious', category: 'Animals' },
  { name: 'Farm', query: 'pastoral farm life countryside morning', blurb: 'Morning work on a small farm.', mood: 'warm', category: 'Earth' },
  { name: 'Safari', query: 'african savanna wildlife documentary calm', blurb: 'Open grassland and long light.', mood: 'curious', category: 'Animals' },
  { name: 'Reef', query: 'coral reef underwater 4k relaxing fish', blurb: 'Color under a thin skin of sea.', mood: 'calm', category: 'Animals' },
  { name: 'Piano', query: 'solo piano radio peaceful classical hours', blurb: 'One piano, no hurry.', mood: 'calm', category: 'Music' },
  { name: 'Guitar', query: 'acoustic guitar instrumental peaceful radio', blurb: 'Steel strings in a quiet room.', mood: 'warm', category: 'Music' },
  { name: 'Violin', query: 'violin cello strings classical peaceful', blurb: 'Bows drawing long notes.', mood: 'calm', category: 'Music' },
  { name: 'Choir', query: 'choral music choir peaceful sacred', blurb: 'Many voices becoming one room.', mood: 'calm', category: 'Music' },
  { name: 'Ambient', query: 'ambient music soundscape atmospheric radio', blurb: 'Pads and weather for the mind.', mood: 'calm', category: 'Music' },
  { name: 'Soul', query: 'classic soul music playlist motown', blurb: 'Warm voices from the old radio.', mood: 'warm', category: 'Music' },
  { name: 'Blues', query: 'blues music radio live guitar', blurb: 'A twelve-bar that never quite ends.', mood: 'warm', category: 'Music' },
  { name: 'Reggae', query: 'reggae dub radio roots music', blurb: 'Offbeat sun from the islands.', mood: 'warm', category: 'Music' },
  { name: 'Bossa', query: 'bossa nova radio brazilian jazz guitar', blurb: 'Soft samba from a seaside room.', mood: 'warm', category: 'Music' },
  { name: 'Flamenco', query: 'flamenco guitar palmas live spain', blurb: 'Hands, wood, and Andalusian fire.', mood: 'bright', category: 'Music' },
  { name: 'Gospel', query: 'gospel choir music joyful church', blurb: 'A choir lifting the rafters.', mood: 'bright', category: 'Music' },
  { name: 'Disco', query: 'classic disco music playlist dance', blurb: 'Mirror-ball nights, still spinning.', mood: 'bright', category: 'Music' },
  { name: 'Funk', query: 'funk music grooves classic playlist', blurb: 'Basslines that refuse to sit down.', mood: 'bright', category: 'Music' },
  { name: 'Score', query: 'film score soundtrack orchestral radio', blurb: 'Orchestras built for pictures.', mood: 'curious', category: 'Music' },
  { name: 'Celtic', query: 'celtic folk music ireland scotland harp fiddle', blurb: 'Fiddles and harps from the isles.', mood: 'warm', category: 'Music' },
  { name: 'Sitar', query: 'indian classical sitar raga live', blurb: 'Ragas unfolding in their own time.', mood: 'calm', category: 'Music' },
  { name: 'Kora', query: 'west african kora music traditional', blurb: 'Twenty-one strings of the Sahel.', mood: 'warm', category: 'Music' },
  { name: 'Fado', query: 'portuguese fado music lisbon live', blurb: 'Lisbon singing about what left.', mood: 'warm', category: 'Music' },
  { name: 'Gagaku', query: 'japanese traditional music koto shakuhachi', blurb: 'Koto and bamboo flute, unhurried.', mood: 'calm', category: 'Music' },
  { name: 'Mariachi', query: 'mariachi music mexico live trumpets', blurb: 'Trumpets and strings in the plaza.', mood: 'bright', category: 'Music' },
  { name: 'Highlife', query: 'african highlife music ghana guitar', blurb: 'Ghanaian guitars in the sun.', mood: 'bright', category: 'Music' },
  { name: 'Gamelan', query: 'indonesian gamelan music traditional', blurb: 'Bronze bells in measured waves.', mood: 'calm', category: 'Music' },
  { name: 'Opera', query: 'opera arias beautiful voices classical', blurb: 'Arias that fill a whole house.', mood: 'curious', category: 'Music' },
  { name: 'Harp', query: 'harp music peaceful instrumental hours', blurb: 'Strings you can almost see move.', mood: 'calm', category: 'Music' },
  { name: 'Flute', query: 'wooden flute music peaceful world folk', blurb: 'Breath made into a long line.', mood: 'calm', category: 'Music' },
  { name: 'Organ', query: 'pipe organ music cathedral peaceful', blurb: 'Pipes the size of a room.', mood: 'calm', category: 'Music' },
  { name: 'Baking', query: 'bread baking pastry process ASMR kitchen', blurb: 'Dough, heat, and patience.', mood: 'warm', category: 'Food' },
  { name: 'Coffee', query: 'coffee shop cafe ritual pour over process', blurb: 'Pour-overs and a quiet counter.', mood: 'warm', category: 'Food' },
  { name: 'Tea', query: 'tea ceremony pouring ritual japanese chinese', blurb: 'Hot water meeting leaves.', mood: 'calm', category: 'Food' },
  { name: 'Pasta', query: 'italian pasta making handmade kitchen', blurb: 'Flour, eggs, and a wooden board.', mood: 'warm', category: 'Food' },
  { name: 'Street Food', query: 'street food around the world markets', blurb: 'Night markets and open grills.', mood: 'bright', category: 'Food' },
  { name: 'Clay', query: 'pottery wheel throwing ceramic studio', blurb: 'A wheel, wet clay, and time.', mood: 'warm', category: 'Making' },
  { name: 'Wood', query: 'woodworking hand tools furniture making', blurb: 'Shavings curling off a plane.', mood: 'warm', category: 'Making' },
  { name: 'Glass', query: 'glassblowing furnace studio process', blurb: 'Hot glass turning into a shape.', mood: 'curious', category: 'Making' },
  { name: 'Ink', query: 'calligraphy brush ink process chinese arabic', blurb: 'Ink finding the edge of a letter.', mood: 'calm', category: 'Making' },
  { name: 'Paint', query: 'oil painting process landscape studio time lapse', blurb: 'Color arriving on a canvas.', mood: 'curious', category: 'Making' },
  { name: 'Yarn', query: 'knitting crochet yarn crafts relaxing', blurb: 'Loops becoming a garment.', mood: 'warm', category: 'Making' },
  { name: 'Paper', query: 'origami paper folding art process', blurb: 'A square becoming a bird.', mood: 'calm', category: 'Making' },
  { name: 'Tokyo', query: 'tokyo night walk ambient city 4k no talking', blurb: 'Neon rain and midnight trains.', mood: 'curious', category: 'Places' },
  { name: 'Paris', query: 'paris street walk ambient 4k cafes', blurb: 'Cafés, bridges, and grey stone.', mood: 'warm', category: 'Places' },
  { name: 'Venice', query: 'venice canals walking tour 4k quiet', blurb: 'Water streets and low bells.', mood: 'calm', category: 'Places' },
  { name: 'Kyoto', query: 'kyoto temples gardens walking tour 4k', blurb: 'Gardens raked for attention.', mood: 'calm', category: 'Places' },
  { name: 'Marrakech', query: 'marrakech medina souk walking tour', blurb: 'Spice, shade, and tiled doors.', mood: 'bright', category: 'Places' },
  { name: 'Havana', query: 'havana cuba streets walking tour music', blurb: 'Pastel walls and open windows.', mood: 'warm', category: 'Places' },
  { name: 'Seoul', query: 'seoul city walk night 4k ambient', blurb: 'Night markets and river paths.', mood: 'curious', category: 'Places' },
  { name: 'Cairo', query: 'cairo egypt nile walking tour historic', blurb: 'The river and the old city.', mood: 'curious', category: 'Places' },
  { name: 'Andes', query: 'andes mountains villages peru scenic', blurb: 'High villages in thin air.', mood: 'calm', category: 'Places' },
  { name: 'Iceland', query: 'iceland landscape road trip waterfalls 4k', blurb: 'Black sand and pale water.', mood: 'calm', category: 'Places' },
  { name: 'Kerala', query: 'kerala backwaters houseboat india scenic', blurb: 'Houseboats on the backwaters.', mood: 'warm', category: 'Places' },
  { name: 'Lisbon', query: 'lisbon tram streets walking tour 4k', blurb: 'Trams climbing tiled hills.', mood: 'warm', category: 'Places' },
  { name: 'Yoga', query: 'gentle yoga class slow morning stretch', blurb: 'A slow class on a quiet mat.', mood: 'calm', category: 'Body' },
  { name: 'Still', query: 'meditation silent sitting nature visuals', blurb: 'Sitting still with something green.', mood: 'calm', category: 'Body' },
  { name: 'Tai Chi', query: 'tai chi in park practice slow', blurb: 'Slow forms in morning parks.', mood: 'calm', category: 'Body' },
  { name: 'Museum', query: 'art museum tour documentary paintings', blurb: 'Rooms built for looking longer.', mood: 'curious', category: 'Ideas' },
  { name: 'Buildings', query: 'architecture documentary beautiful buildings', blurb: 'How rooms and cities stand up.', mood: 'curious', category: 'Ideas' },
  { name: 'History', query: 'calm history documentary ancient world', blurb: 'Old stories told without hurry.', mood: 'curious', category: 'Ideas' },
  { name: 'Rocks', query: 'geology documentary earth science landscapes', blurb: 'The planet explaining itself.', mood: 'curious', category: 'Ideas' },
  { name: 'Words', query: 'language learning pleasant conversation culture', blurb: 'New words, spoken kindly.', mood: 'curious', category: 'Ideas' },
  { name: 'Chess', query: 'chess game commentary beautiful match', blurb: 'Quiet wars on sixty-four squares.', mood: 'curious', category: 'Play' },
  { name: 'Gardens', query: 'botanical garden walking tour flowers 4k', blurb: 'Paths cut through planted color.', mood: 'calm', category: 'Earth' },
  { name: 'Trains', query: 'scenic train journey cab view 4k', blurb: 'Windows that do the traveling.', mood: 'calm', category: 'Places' },
  { name: 'Sailing', query: 'sailing calm sea yacht journey 4k', blurb: 'Canvas, wind, and a clean wake.', mood: 'calm', category: 'Places' },
  { name: 'Tennis', query: 'tennis match highlights classic rallies', blurb: 'Rallies that refuse to end.', mood: 'bright', category: 'Play' },
  { name: 'Football', query: 'football soccer goals highlights beautiful play', blurb: 'Goals worth standing up for.', mood: 'bright', category: 'Play' },
  { name: 'Formula', query: 'formula 1 highlights onboard racing', blurb: 'Color and speed on a Sunday.', mood: 'bright', category: 'Play' },
  { name: 'Olympics', query: 'olympic games memorable moments highlights', blurb: 'The best hours of the Games.', mood: 'bright', category: 'Play' },
  { name: 'Hoops', query: 'basketball highlights beautiful plays dunks', blurb: 'The ball hanging in the lights.', mood: 'bright', category: 'Play' },
  { name: 'Peloton', query: 'tour de france scenic mountain stages', blurb: 'A peloton climbing a mountain.', mood: 'curious', category: 'Play' },
  { name: 'Ice', query: 'figure skating performances beautiful programs', blurb: 'Blades drawing on white ice.', mood: 'bright', category: 'Play' },
  { name: 'Surf', query: 'surfing ocean waves compilation 4k', blurb: 'Bodies reading a moving wall.', mood: 'bright', category: 'Play' },
  { name: 'Trail', query: 'hiking trail walk forest mountain 4k', blurb: 'Boots on a long path.', mood: 'calm', category: 'Body' },
  { name: 'Camp', query: 'camping campfire night forest relaxing', blurb: 'A fire and a small circle of dark.', mood: 'warm', category: 'Earth' },
  { name: 'Library', query: 'beautiful libraries reading rooms quiet tour', blurb: 'Shelves built to outlast us.', mood: 'calm', category: 'Ideas' },
  { name: 'Bookshop', query: 'independent bookstore walking tour books', blurb: 'Narrow aisles of unread days.', mood: 'warm', category: 'Places' },
  { name: 'Vinyl', query: 'vinyl records spinning turntable music room', blurb: 'A record turning in real time.', mood: 'warm', category: 'Music' },
  { name: 'Dawn', query: 'sunrise timelapse world peaceful morning', blurb: 'The first light, again.', mood: 'calm', category: 'Earth' },
  { name: 'Dusk', query: 'sunset timelapse golden hour world 4k', blurb: 'The day putting itself away.', mood: 'warm', category: 'Earth' },
  { name: 'Storm', query: 'distant thunderstorm nature ambience dark', blurb: 'Weather talking from far off.', mood: 'calm', category: 'Earth' },
  { name: 'Wind', query: 'wind in grass trees nature soundscape', blurb: 'Grass and trees leaning together.', mood: 'calm', category: 'Earth' },
  { name: 'Market', query: 'colorful markets around the world walking', blurb: 'Fruit, cloth, and loud kindness.', mood: 'bright', category: 'World' },
  { name: 'Festival', query: 'cultural festivals around the world joyful', blurb: 'A town dressed for itself.', mood: 'bright', category: 'World' },
  { name: 'Dance', query: 'folk dance around the world traditional', blurb: 'Feet keeping old time.', mood: 'bright', category: 'World' },
  { name: 'Circus', query: 'contemporary circus arts performance', blurb: 'Bodies making a tent of air.', mood: 'curious', category: 'Play' },
  { name: 'Puppets', query: 'puppet theatre performance traditional world', blurb: 'Small figures with large lives.', mood: 'warm', category: 'World' },
  { name: 'Kindness', query: 'random acts of kindness compilation hopeful', blurb: 'Strangers being good on purpose.', mood: 'warm', category: 'World' },
  { name: 'Lakes', query: 'calm lake scenery reflections 4k nature', blurb: 'Still water holding the sky.', mood: 'calm', category: 'Earth' },
]

export const CHANNELS: Channel[] = LINEUP.map((row, index) => ({
  number: index + 1,
  kind: 'search',
  ...row,
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
