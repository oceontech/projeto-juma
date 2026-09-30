import type { Block } from '../../../features/ai/lexical'

/**
 * Primeiros posts do blog do site EUA (conteúdo técnico geral, sem números
 * inventados e sem claim de efeito de produto, pelas regras FIFRA). Entram
 * pela migration `seed_blog_us`; a capa de cada um está nesta pasta.
 */
export type SeedPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  cover: string
  coverAlt: string
  body: Block[]
}

const AUTHOR = 'Juma-Agro agronomy team'
export const SEED_AUTHOR = AUTHOR

export const SEED_POSTS: SeedPost[] = [
  {
    slug: 'how-to-read-a-fertilizer-label',
    title: 'How to read a fertilizer label, line by line',
    excerpt: 'The Guaranteed Analysis, the "derived from" line and the directions for use tell you what is in the jug and how to use it. Here is how to read each one.',
    category: 'Know your label',
    date: '2026-09-22T13:00:00.000Z',
    cover: 'read-the-label.webp',
    coverAlt: 'A grower reads a product booklet at the tailgate of a pickup, next to a vegetable field',
    body: [
      { type: 'p', text: 'Every fertilizer sold in the United States carries a label, and that label is the one document you can hold a supplier to. It is regulated state by state, and most states follow the model rules published by the Association of American Plant Food Control Officials (AAPFCO). Once you know where each piece of information sits, reading one takes a couple of minutes.' },
      { type: 'h2', text: 'The Guaranteed Analysis' },
      { type: 'p', text: 'This is the core of the label. It lists each nutrient the manufacturer guarantees, as a minimum percentage by weight. The first three numbers of the grade are always total nitrogen, available phosphate and soluble potash, in that order. Secondary nutrients and micronutrients follow, each on its own line.' },
      { type: 'p', text: 'A nutrient that is not on the Guaranteed Analysis is not guaranteed, even if the product brochure mentions it. When you compare two products, compare the lines on this box, not the marketing copy around it.' },
      { type: 'h2', text: 'The "derived from" statement' },
      { type: 'p', text: 'Right below the analysis, the label names the raw materials the nutrients come from. This matters in the field. The source tells you how the product behaves in the tank, how it mixes with other inputs and whether it suits a foliar pass or belongs in the soil.' },
      { type: 'h2', text: 'Directions for use' },
      { type: 'p', text: 'Rates, timing, crops and mixing instructions live here. Rates on a U.S. label are written in U.S. units, usually fluid ounces or pints per acre for liquids. If a product is sold in more than one country, make sure you are reading the label registered for your state.' },
      { type: 'ul', items: ['Check the crops listed. Using a product on a crop that is not on the label is a question for your crop adviser first.', 'Read the mixing order and any compatibility notes before you plan a tank mix.', 'Note storage temperature and shelf life, especially for liquids kept in a barn over the summer.'] },
      { type: 'h2', text: 'Precautions and registration' },
      { type: 'p', text: 'The last block covers handling, first aid and the company that stands behind the product, with an address and phone number. Many states also show a registration or license number. If you cannot find who made it, that is a reason to ask more questions before it goes in your tank.' },
      { type: 'quote', text: 'When you compare two products, compare the lines on the Guaranteed Analysis, not the marketing copy around it.' },
    ],
  },
  {
    slug: 'run-a-jar-test-before-every-tank-mix',
    title: 'Run a jar test before every new tank mix',
    excerpt: 'Ten minutes with a quart jar can save a clogged sprayer and a wasted load. A simple way to check compatibility before you fill the tank.',
    category: 'Application',
    date: '2026-09-15T13:00:00.000Z',
    cover: 'jar-test.webp',
    coverAlt: 'A crop adviser pours liquid into a clear glass jar of water at the tailgate of a farm truck',
    body: [
      { type: 'p', text: 'Combining a foliar nutrient with a fungicide or an insecticide in one pass saves a trip across the field. It also creates a chemistry problem you cannot see until something goes wrong: flakes, gels, oily layers or a mix that settles in the bottom of the tank. A jar test shows you that on a small scale first.' },
      { type: 'h2', text: 'What you need' },
      { type: 'ul', items: ['A clean, clear glass quart jar with a lid, one per mix you want to test.', 'Water from the same source you will use in the sprayer.', 'Measuring spoons or a syringe, so each product goes in at the same ratio as the real tank.', 'Gloves and eye protection, as the labels require.'] },
      { type: 'h2', text: 'How to run it' },
      { type: 'p', text: 'Fill the jar about halfway with your carrier water. Add each product one at a time, scaled down to the jar, in the mixing order printed on the labels. Many advisers use the WALES sequence when labels do not say otherwise: wettable powders, agitate, liquids, emulsifiable concentrates, then surfactants. Cap and shake after each addition.' },
      { type: 'p', text: 'Top up with water, shake again and let the jar sit for about fifteen minutes. Then look at it against the light.' },
      { type: 'h2', text: 'What to look for' },
      { type: 'ul', items: ['Flakes, crystals or sludge on the bottom.', 'Layers that separate and do not come back together with a gentle shake.', 'Gel, foam that will not settle or a jar that feels warm.'] },
      { type: 'p', text: 'If you see any of these, do not scale the mix up. Change the order, try a compatibility agent if a label allows it, or split the products into separate passes. When the jar stays uniform and mixes back easily, you have a much better chance in the tank.' },
      { type: 'quote', text: 'The jar is cheap. A clogged boom in the middle of a spray window is not.' },
      { type: 'p', text: 'Keep a short note of every mix that passed and every one that failed. By the second season you will have your own compatibility chart for the products you actually use.' },
    ],
  },
  {
    slug: 'timing-foliar-nutrition-around-the-citrus-flush',
    title: 'Timing foliar nutrition around the citrus flush',
    excerpt: 'Florida citrus puts out new growth in flushes. Planning foliar nutrient passes around them keeps the spray program simple and on time.',
    category: 'Citrus',
    date: '2026-09-08T13:00:00.000Z',
    cover: 'citrus-flush.webp',
    coverAlt: 'Rows of orange trees in a Florida grove with light-green new growth on the branch tips',
    body: [
      { type: 'p', text: 'Citrus trees in Florida do not grow evenly through the year. New shoots and leaves come out in flushes, with the spring flush usually the largest, followed by smaller flushes in summer and fall. Most grove spray programs are already built around those flushes, and foliar nutrition fits best when it follows the same calendar.' },
      { type: 'h2', text: 'Why the flush matters for foliar passes' },
      { type: 'p', text: 'Foliar nutrients are applied to leaves, so the leaf canopy you are spraying is what you are working with. Extension guidance for Florida citrus, such as the UF/IFAS citrus production guide, recommends timing foliar micronutrient sprays to young leaves that are close to full expansion on the spring flush.' },
      { type: 'p', text: 'In practice, that means walking the grove and looking at the new growth before you book the application, rather than spraying on a fixed date.' },
      { type: 'h2', text: 'Riding along with passes you already make' },
      { type: 'p', text: 'Most growers are in the grove during the flush anyway, for psyllid control and other protection sprays. Adding a foliar nutrient to one of those passes can save a trip, as long as the products are compatible and every label allows the mix. A jar test before the first load is the easiest way to check.' },
      { type: 'ul', items: ['Scout the block and note when new leaves are close to full size.', 'Line the nutrient pass up with a spray you already have planned for that window.', 'Check the label of every product in the tank for mixing instructions and restrictions.', 'Record what went on each block and when, so you can compare seasons.'] },
      { type: 'h2', text: 'Leaf tissue tests close the loop' },
      { type: 'p', text: 'A leaf tissue analysis taken at the recommended time of year tells you which nutrients are running low in each block. Using those results to decide what goes in the foliar program keeps you from spraying nutrients the trees do not need.' },
      { type: 'quote', text: 'Walk the grove and look at the new growth before you book the application.' },
    ],
  },
  {
    slug: 'set-up-a-strip-trial-on-your-own-ground',
    title: 'Set up a side-by-side strip trial on your own ground',
    excerpt: 'The most useful data about a product is the data from your own field. How to lay out a fair strip trial, run it and read the results.',
    category: 'Field trials',
    date: '2026-08-28T13:00:00.000Z',
    cover: 'strip-trial.webp',
    coverAlt: 'A grower marks the end of a trial strip with a small orange flag in a young corn field',
    body: [
      { type: 'p', text: 'University trials and company data are a good start, but every farm has its own soils, hybrids and management. A strip trial on your own ground is the most direct way to see whether a new input earns a place in your program.' },
      { type: 'h2', text: 'Keep the comparison fair' },
      { type: 'p', text: 'The strips should differ in one thing only: the product you are testing. Same hybrid or variety, same planting date, same fertility and the same sprays for everything else. Run the treated and untreated strips side by side, at least a full planter or sprayer width each, so equipment edges do not blur the result.' },
      { type: 'h2', text: 'Repeat it across the field' },
      { type: 'p', text: 'One pair of strips can land on a wet spot or a sandy knoll and tell you more about the soil than about the product. Repeat the treated and untreated pair several times across the field, alternating which one goes first. Repetitions are what let you trust an average.' },
      { type: 'ul', items: ['Draw a simple map and flag the start and end of every strip.', 'Write down the application date, rate and weather for each pass.', 'Scout both strips on the same day through the season and take photos from the same spots.'] },
      { type: 'h2', text: 'Harvest it carefully' },
      { type: 'p', text: 'Harvest each strip separately with a calibrated yield monitor or a weigh wagon. Leave out the end rows and any area with obvious damage that affects both strips. Compare the treated strips with the untreated strips next to them, pair by pair, before you look at the overall average.' },
      { type: 'quote', text: 'The strips should differ in one thing only: the product you are testing.' },
      { type: 'p', text: 'If you would like to test one of our products this way, ask us about a trial strip. We will help you plan the layout so the result means something at the end of the season.' },
    ],
  },
  {
    slug: 'spray-water-quality-ph-and-hardness',
    title: 'Water quality in the spray tank: pH and hardness',
    excerpt: 'Water is the largest ingredient in almost every spray mix. Why its pH and hardness deserve a quick test before the season.',
    category: 'Application',
    date: '2026-08-18T13:00:00.000Z',
    cover: 'spray-water.webp',
    coverAlt: 'A farmhand fills a white spray tank on a trailer from a hose connected to a well pump',
    body: [
      { type: 'p', text: 'Water makes up most of the volume in the tank, and it is rarely pure. Well water in particular can carry dissolved minerals and a pH that is far from neutral. Some pesticides and nutrients are sensitive to both, which is why a water test belongs on the pre-season checklist.' },
      { type: 'h2', text: 'pH' },
      { type: 'p', text: 'pH measures how acidic or alkaline the water is. Some active ingredients break down faster in alkaline water, and some labels state the pH range the spray solution should stay in. A handheld pH meter or test strips give you a number in a minute. Check it at the start of the season and again if you change water sources.' },
      { type: 'h2', text: 'Hardness' },
      { type: 'p', text: 'Hard water carries calcium and magnesium. These minerals can bind with certain products in the tank and change how they perform, and they can make some mixes more likely to form deposits. A water analysis from a lab reports hardness along with the other minerals present.' },
      { type: 'ul', items: ['Test each water source you use, not just the one at the main shed.', 'Read every label in the mix for pH or water quality instructions.', 'If a label calls for a water conditioner or buffer, add it in the order the label gives.', 'Keep the lab report with your spray records.'] },
      { type: 'h2', text: 'Temperature and cleanliness' },
      { type: 'p', text: 'Very cold water can slow how fast some products dissolve, and water with sand or organic matter wears pumps and plugs screens. Filtering at the fill point and letting products mix fully before you start spraying avoid most of these problems.' },
      { type: 'quote', text: 'Water is the largest ingredient in almost every spray mix. Test it like one.' },
    ],
  },
  {
    slug: 'calibrate-your-sprayer-before-the-season',
    title: 'Calibrate your sprayer before the season starts',
    excerpt: 'Nozzles wear, pumps drift and ground speed changes. The 1/128-acre method checks your real output with a stopwatch and a measuring cup.',
    category: 'Application',
    date: '2026-08-06T13:00:00.000Z',
    cover: 'calibrate-sprayer.webp',
    coverAlt: 'A technician holds a measuring cup under a sprayer nozzle to check its output',
    body: [
      { type: 'p', text: 'Every label rate assumes the sprayer puts out what you think it does. Worn nozzles, a different pump or a new tractor can move the real output well away from the setting on the controller. Calibration is how you find out, and it only takes a morning.' },
      { type: 'h2', text: 'Start with the nozzles' },
      { type: 'p', text: 'Clean every nozzle and screen, then run clean water through the boom and look for tips that spray unevenly. Replace any tip that is clearly off, and use the same type and size across the whole boom.' },
      { type: 'h2', text: 'The 1/128-acre method' },
      { type: 'p', text: 'Land-grant extension services teach a simple shortcut: if you drive the distance that covers 1/128 of an acre and collect the output of one nozzle over that time, the number of fluid ounces in the cup equals your output in gallons per acre. The distance depends on nozzle spacing, and extension calibration sheets list it for common spacings.' },
      { type: 'ul', items: ['Mark the distance for your nozzle spacing in the field you will spray, not on pavement.', 'Drive it at your normal spraying speed and pressure, and time the run.', 'Park, keep the same pressure and collect water from one nozzle for that same time.', 'Repeat on several nozzles across the boom and average the ounces.'] },
      { type: 'h2', text: 'Read the result' },
      { type: 'p', text: 'Compare the average with the rate you meant to apply. If it is off, adjust pressure within the nozzle range, change speed or change tips, then measure again. Any nozzle that reads well above or below the others should be replaced.' },
      { type: 'quote', text: 'Every label rate assumes the sprayer puts out what you think it does.' },
      { type: 'p', text: 'Write the date, tips, pressure and speed on the calibration sheet and keep it in the cab. Check again mid-season, and any time you change nozzles or equipment.' },
    ],
  },
]
