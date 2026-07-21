// Ruthven print catalogue — single source of truth for the Print Shop and the
// Highland map markers on the home page.
//
// Titles are place-led for search (Glencoe, Cuillins/Skye, Eilean Donan, stag,
// Rhum & Eigg, Rannoch Moor) while staying in the Ruthven "weather first" voice.
//
// Drop the paintings at frontend/public/ruthven/prints/{num}.jpg
// mx / my = coordinates on the Scotland map (viewBox 0 0 343 550).
export const RUTHVEN_PRINTS = [
  { id: 'rv-1', num: 1, title: 'Glencoe — Mist Rising',        location: 'Glencoe',      mx: 145, my: 360 },
  { id: 'rv-2', num: 2, title: 'The Cuillins, Isle of Skye',   location: 'Isle of Skye', mx: 97,  my: 308 },
  { id: 'rv-3', num: 3, title: 'Eilean Donan, First Light',    location: 'Kintail',      mx: 130, my: 316 },
  { id: 'rv-4', num: 4, title: 'Red Stag, Glen Affric',        location: 'Glen Affric',  mx: 153, my: 303 },
  { id: 'rv-5', num: 5, title: 'Rhum & Eigg, Last Light',      location: 'Small Isles',  mx: 99,  my: 333 },
  { id: 'rv-6', num: 6, title: 'Rannoch Moor — Weather Study', location: 'Rannoch Moor', mx: 165, my: 368 },
];
