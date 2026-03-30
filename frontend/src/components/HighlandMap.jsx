import { useState, useMemo } from 'react';

// ── Location coordinates – equirectangular projection with cos(57.7°) correction ──
// viewBox: 0 0 343 550  (naturally tall like Scotland)
const LOCATION_COORDS = {
  'Shetland':          { x: 293, y: 51 },
  'Orkney':            { x: 223, y: 168 },
  'Lewis':             { x: 86, y: 233 },
  'Harris':            { x: 76, y: 267 },
  'Caithness':         { x: 206, y: 204 },
  'Sutherland':        { x: 156, y: 229 },
  'Assynt':            { x: 141, y: 246 },
  'Wester Ross':       { x: 130, y: 271 },
  'Applecross':        { x: 124, y: 297 },
  'Torridon':          { x: 128, y: 288 },
  'Kintail':           { x: 133, y: 314 },
  'Glen Affric':       { x: 147, y: 310 },
  'Inverness':         { x: 177, y: 293 },
  'Loch Ness':         { x: 166, y: 307 },
  'Isle of Skye':      { x: 97, y: 308 },
  'Fort William':      { x: 143, y: 348 },
  'Ben Nevis':         { x: 147, y: 350 },
  'Cairngorms':        { x: 202, y: 328 },
  'Rannoch Moor':      { x: 158, y: 363 },
  'Glencoe':           { x: 145, y: 360 },
  'Glen Coe':          { x: 144, y: 358 },
  'Pitlochry':         { x: 195, y: 358 },
  'Mull':              { x: 110, y: 379 },
  'Oban':              { x: 128, y: 382 },
  'Loch Lomond':       { x: 162, y: 408 },
  'Knoydart':          { x: 120, y: 325 },
  'Loch Maree':        { x: 123, y: 275 },
  'Suilven':           { x: 140, y: 245 },
  'Glen Etive':        { x: 148, y: 365 },
  'Loch Quoich':       { x: 128, y: 332 },
  'Glen Shiel':        { x: 135, y: 320 },
};

// ── Real Scotland paths – public domain geodata (Crunch-io/geodata) ──
// Equirectangular projection with cos(57.7°) = 0.534 correction
const MAINLAND = `M215.7,195 L217,196.9 L222.1,196.3 L217.9,208.3 L217.2,207.2 L218.4,210.1 L221.2,210.2 L220.7,213.2 L218.3,212.6 L220.4,213.9 L218.9,219.1 L214.6,224.6 L208.1,227.9 L201.9,237.1 L203.7,235.6 L204.5,234 L192.3,245.3 L190.7,249.5 L185.5,252.5 L184.6,255.5 L184.5,253.9 L181.7,254 L184.8,256.1 L184.4,261.8 L173.8,261.5 L168.8,254.7 L161.8,252.2 L168.7,254.8 L173.6,262.4 L177.6,261.5 L178.6,263.9 L180.7,263.3 L183.4,265.7 L186.1,262.9 L188.9,264.5 L186.7,265.7 L190.1,264.7 L193.6,261.1 L185.7,275.6 L183.4,275.4 L184.5,271.5 L178.5,276.2 L173.8,276.6 L167.9,286.4 L175.9,277.5 L178.5,277 L178.6,278.6 L185,276.7 L181,282.7 L181.4,285.5 L175.2,287.6 L177.5,288.5 L175.9,291.6 L169.8,290.8 L166.7,294.4 L169,291.9 L170.4,293.4 L175.8,292 L176.1,294.3 L175.8,292.2 L178.1,292.9 L182.9,287.3 L182.6,284.1 L190,284.7 L198.1,278.1 L198.7,280.6 L200.6,280.8 L199.2,278.1 L202.9,278 L204,274.6 L210,272.9 L219,277.6 L222.5,278 L228.7,274.4 L232.7,276.5 L239.4,276.5 L241,279.1 L242.2,277.2 L248,277.5 L249.9,275.3 L253.9,277.4 L258.2,274.9 L264.2,277 L267.9,282.3 L268.4,290.3 L270.1,291.5 L266.5,301 L263,305.4 L261.7,307.5 L260.5,303.2 L259.2,303 L261.4,304.4 L261.6,308 L257.1,318.5 L258.9,321.2 L256.6,323.3 L259.1,321.2 L259.4,322.6 L253.2,336 L253.7,338.4 L252.3,344.8 L244.2,354 L244,357.8 L239.9,357.1 L244.6,358.3 L241.7,362.4 L242.9,364.9 L233.1,378 L230.8,376.6 L221.1,378.4 L211.9,386.8 L207.1,384.9 L205.7,381.5 L206.7,385.1 L211.5,387.3 L210,388.4 L206,386.9 L210.2,388.5 L226,379 L230.4,379.7 L230.1,384.3 L225.8,388.3 L230,386.1 L231.6,389 L236,390.1 L238.8,393.6 L235.1,398 L230.2,401.4 L225.5,398.9 L222.5,400.4 L217.3,406.8 L216.4,411.5 L207.9,414.3 L208.1,416.2 L201.1,411.8 L196.8,412.6 L193.8,408.4 L188.4,406.6 L192.4,407.8 L195,411.2 L195.7,414.5 L194.2,415 L197.1,413.9 L196.5,416.7 L200.2,414.9 L203.6,416.8 L209.6,416.5 L211.4,418.7 L216.1,417.4 L221,421.4 L226.9,418.1 L230.2,411.4 L235.3,411.5 L239,414.7 L237.4,417 L241.7,416.1 L248.6,422.5 L255.9,423.5 L259.9,432.4 L252.2,446.6 L248.4,447.1 L254.9,461 L248.5,465.8 L246.7,470.9 L242.8,470.5 L239.8,473.6 L234.5,485.4 L229.6,488.6 L224.6,495.9 L221.1,495.6 L221.4,500.1 L219.5,502.1 L212.9,502.6 L213,500.1 L212.8,502.9 L206.5,500.6 L203.4,500.6 L206.3,501 L203.1,502.9 L199.5,494.3 L201.5,507.6 L200.3,510.6 L196.8,509.1 L192.9,512.2 L191.5,506.3 L192.3,512.6 L190.8,511.1 L190.1,512.9 L191.6,514.7 L186.3,519 L182.4,518.4 L183,511.1 L181.2,519.6 L176.5,514.6 L177.8,509.5 L174.8,513.7 L173.3,513.1 L170.2,510.2 L169.2,503.5 L168.9,505.7 L166.7,504.1 L169.7,508.9 L168.3,511.8 L166.5,511.6 L168.7,511.3 L169.1,514.3 L171.8,516.4 L169.9,526.9 L165.2,524.1 L153.9,511.3 L151,511 L152.3,511.9 L148.2,516.4 L151.8,526.5 L151.4,530.6 L148,528 L148.4,522.8 L139.6,507.2 L139.6,501.8 L142.4,498.5 L144.3,506.3 L146,507.9 L147.1,506.8 L144.4,497.9 L146.8,488.5 L152,481.2 L152.5,473 L155.3,470 L156.1,465.3 L161.1,461.7 L161.1,457.1 L158.7,454.6 L158.6,446.6 L158.2,449.5 L153.5,446.9 L150.3,441.8 L152.2,436.8 L151.3,421.5 L154.6,419.7 L159.3,422.2 L166.3,422.8 L169.4,425.8 L166.9,427 L169.3,426.4 L168.7,429.1 L169.5,425.7 L177.4,430.1 L163.4,422 L163.1,419.4 L162.9,421.8 L158.1,419.4 L153,409.9 L155.6,417.7 L152.3,417.6 L151.2,412.2 L156.4,399.4 L152,408.3 L149.8,403 L151.5,409.6 L150,412.3 L150.6,418 L148.1,416.6 L150.2,419.3 L147.5,428.2 L145,427.5 L141.9,415.9 L143.8,425.2 L139.9,422.3 L139.3,417.8 L137.4,425.5 L138.9,431.1 L134.7,428.9 L133.4,418.8 L135.8,412.1 L138.9,405.9 L143.1,403.4 L144.5,399.2 L149.9,394 L144.9,397.1 L145.2,394.9 L142.2,402.5 L137.6,405.9 L134.7,411.9 L134,410.9 L133.5,414.8 L131.2,416.6 L129.9,413.4 L130.8,428 L134.7,434.9 L129.6,440.8 L129.2,452 L128.1,451.3 L125.7,463.8 L123.6,464.4 L125.8,465.4 L126.8,470 L123.6,474.4 L116.2,475 L116.3,467.3 L119.4,462.8 L120.9,443.1 L130.1,428.6 L123.2,436.6 L121.3,430 L124.9,421.7 L120.8,426.1 L120.4,424.1 L125.2,414.3 L123.5,414.7 L124.7,412.1 L119.4,420.9 L124.4,409 L127.2,410.2 L125,407.2 L127.3,400.7 L123.2,405.7 L126,398.6 L125.1,396.9 L128.3,395.3 L127.4,394.2 L123.9,395.9 L124.6,388.9 L129.8,386.4 L126.8,387.9 L126.1,386.7 L129.7,378.8 L136.5,378.5 L137.7,380.3 L142.2,375.9 L144.2,369.7 L138,379.4 L133.7,377.4 L131.1,378.4 L130.7,374.4 L128.6,376.6 L130.1,373.2 L133,373.9 L137.9,369.7 L132.7,373 L130.8,371.7 L135.4,363.4 L134.2,362.7 L138.3,359.4 L142.4,360 L147.8,357.1 L140.6,359.5 L137.3,358.1 L143.4,347.2 L133.9,345 L142,347.9 L137.5,352.7 L137.5,356.6 L135.9,358.3 L135,357.2 L128.8,365.4 L126.5,365.3 L127.9,366.1 L125.8,370.6 L120.6,375.2 L117.2,372.2 L118.3,369.7 L116.8,372.3 L112.2,370.8 L108.2,362.9 L112.1,361.8 L115,364.9 L113.1,362.2 L118.2,358.2 L121.4,360.3 L126.3,359.2 L121.7,359.9 L117,357 L114.7,360.5 L110.6,359.3 L109.5,360.6 L106.1,358.8 L101.5,359.4 L99.9,357.4 L101.4,353.7 L110,351.3 L114.6,355 L112.8,351.2 L114,352.7 L118.2,351.3 L113.8,349.2 L113.8,347.5 L119.3,346.4 L121.2,343.7 L118.9,345.7 L116.6,345.1 L118.5,342 L112.9,343.8 L111.4,342.5 L114.5,341.1 L113,339.8 L114.4,336.1 L115.5,336.7 L115,332.7 L118.9,331.8 L122.4,335.8 L127.3,333.9 L126.8,332.7 L123.1,334.8 L121,330.5 L116.9,329.7 L116.3,327.8 L119.1,323.5 L124.1,323.4 L126.8,326.5 L132,324.4 L126.8,324.9 L125.2,322.1 L120.3,319.8 L122.9,315.7 L121.7,313.6 L123.9,311.7 L126.5,310.7 L130.4,315.6 L131.6,313.6 L129.1,313.3 L127,310 L128.1,307.8 L131.1,307.4 L128.3,307.3 L124.7,310.7 L118.7,309.8 L120.5,304.8 L126.5,303.8 L129.8,298.1 L125.6,303.5 L122.4,302.8 L123.6,298.3 L118.8,303.8 L115.3,303.1 L115.9,296.7 L113.4,294.1 L114.6,285.3 L115.7,284.5 L118.4,288.1 L119.6,286.9 L121.9,290.9 L121.6,288.1 L123,289.9 L127.2,288.6 L124.3,286.9 L121.2,287.9 L117.9,281.4 L115.4,280.1 L116.6,275.2 L121.1,274.9 L120.1,272.5 L115.7,271 L115.6,261.8 L120.5,261.1 L121.1,266.5 L123.7,269.6 L124.5,263.7 L121.6,260.2 L123.1,256.3 L125.3,256.8 L126.1,260.9 L128.8,262.3 L130.6,257.6 L138.5,263.1 L131.6,257.3 L133,255.1 L134.3,257.3 L137.6,256.8 L141.7,260.4 L144.1,265.4 L142.8,260.7 L138.2,256.3 L140,253.7 L135,251.9 L129.2,243.5 L130.6,241.2 L133,245.2 L133.3,243.4 L135.2,244.6 L136.5,241.5 L135.1,240 L136.7,239.9 L135.3,238.5 L137.6,237.8 L134.9,237.1 L136,236.1 L131.2,230.4 L132.3,228 L134.9,231.3 L133.8,229 L134.8,231.3 L138.4,228.7 L140.6,230.6 L140.4,228.4 L142.1,229.4 L142.6,227.5 L149.1,232.2 L146.9,229 L149.7,228.7 L143.6,228 L139.7,220.8 L141.3,215.6 L145.9,218.6 L144,216.5 L145.5,215.8 L142.4,215.7 L143.9,215.4 L142.2,214.3 L143.7,212.4 L147.1,214.5 L141.9,209.2 L146.1,202 L146.4,197.8 L153.4,200.3 L153.8,207.4 L154.9,199.8 L159.9,204 L156.1,212.9 L160.3,206.6 L161.4,207.2 L162.4,201.8 L168.2,203.6 L169.3,206.5 L166.8,213.3 L171.4,205.1 L174.5,205.1 L176.8,208.8 L175.7,205.2 L180.1,202.5 L182.1,204.1 L184.1,199.8 L184.7,203 L187.4,202.2 L188.7,205.2 L188.7,202.7 L193.1,203.1 L197.8,198.3 L202.6,198.1 L202.9,201 L205.4,199 L208.9,200.5 L209.7,198.4 L207.3,196.8 L208.6,194 L211.1,196.4 L215.7,195 Z`;

const LEWIS_HARRIS = `M99,207.5 L101.6,211.1 L100.2,219.3 L102.3,221.5 L99.3,225.4 L97.1,225.6 L97.8,227.5 L94.1,231.5 L97.7,232.8 L102.5,228 L102.7,231.6 L99.3,235 L97.2,232.8 L95,234.3 L93.7,232.1 L94.5,237.3 L92.3,237.7 L94.4,239.1 L89.7,238.1 L92.2,239.5 L91,241.3 L84.3,242.9 L92.1,242.5 L93.3,240.7 L94.4,243.5 L94.2,246 L91.7,245.9 L94.9,246.9 L93.7,250 L91,248.3 L86.4,249.7 L90.5,249.9 L91.4,251.8 L88.8,256.1 L87.6,253.5 L86.7,257.6 L83.9,253 L85.4,256.9 L83.5,256.7 L81.3,251.5 L83.1,245.6 L86.1,245.6 L82,245.1 L82.9,246.3 L79.5,249.7 L83.2,259.6 L77.8,258.5 L80.4,264.5 L78,263.8 L78.3,266.3 L75.6,263.8 L76.7,265.5 L74.8,266.6 L75.2,268.8 L73.3,268.2 L74.2,269.7 L71.5,272.7 L65.3,263.5 L67.5,265.9 L70.6,260.9 L74,260.9 L72.3,257.9 L77.5,258.2 L74.1,254.1 L67.3,252.7 L66,250.9 L67.1,248.4 L68.2,249.3 L73.9,245.8 L68.8,247.2 L69.3,243.3 L66.8,244.2 L66.5,244.2 L66,240.5 L65.6,240.5 L66.3,234.8 L70.1,234.7 L67.9,233.7 L69.3,229.6 L71.3,231.7 L72,230.4 L75.7,240.7 L75,234.3 L77,233 L80.5,236.1 L81.6,234.7 L77.6,228.9 L79,226.6 L77,226.6 L77.8,224.6 L87.6,219.6 L99,207.5 Z`;

const SHETLAND = `M294.6,50.3 L294.4,52.6 L295.2,50.5 L296.6,51 L296.5,53.6 L292,53.9 L293,56.5 L293.4,55.2 L296.3,56.4 L293.3,59.9 L295.7,61.4 L292.9,63.5 L291.8,60.8 L290.5,64.2 L292.3,64 L290.9,66.8 L293,64.8 L291,69.1 L293.5,66.3 L294.3,71 L290.8,74.9 L292.8,80.1 L290.4,80.8 L291.6,85.6 L290.9,83.7 L288.8,84.1 L289.1,95.2 L287.9,93.7 L287.4,95.4 L287.2,91.9 L284.9,92.7 L284.4,90.3 L286.8,87.8 L285.6,85.8 L289,75.1 L288.4,66.9 L287.3,70.1 L287.2,68.9 L289.3,63.3 L286.8,69.6 L288.2,62.2 L286.2,66.6 L285.9,63.1 L282.7,62.2 L285,63.6 L285.6,67.2 L284.2,65.2 L281.6,71.1 L278.5,67.9 L281.4,65 L280,65.4 L279.8,63.1 L278,66.7 L277.8,64.3 L275.6,66.2 L272.5,62.2 L273.9,57.8 L277.6,59.4 L280.1,56.7 L281.2,60.4 L280.7,57.7 L282.4,58.6 L283.1,55.9 L285.1,59.7 L286.3,53.4 L289.4,54.1 L285.4,52.5 L285.7,50.4 L283.9,51.4 L284.1,48.4 L282.1,48.7 L283.3,45.8 L281.6,45.7 L281.9,42.4 L280.5,45.6 L280.4,43 L275.2,43.1 L275.9,41 L277.9,41.3 L279,37 L282.2,41.3 L284.3,40.7 L280.3,38.5 L283.3,32.1 L286.7,33.3 L287.6,30.2 L287.3,38.2 L285.4,39.5 L287,39.5 L285.5,40.3 L287,40.7 L285.7,43.4 L287.5,42 L287.2,45.7 L286,45.3 L284.7,50.2 L286.9,49.1 L286.9,46.8 L289.4,46.5 L287.8,44.1 L290.7,42.1 L293,48.3 L291.9,47.4 L289.4,50.1 L292,48.3 L290.8,49.8 L292.9,48.8 L293.1,51.9 L297.4,45.9 L294.6,50.3 Z`;

const SKYE = `M102.3,316.9 L102,318.8 L96.2,320 L97.7,316.6 L95.3,317.9 L93.7,315.3 L95.4,312.2 L93.1,314 L90.1,309 L92.1,305 L96.8,308.5 L93.1,305 L93.9,303 L91.1,305.1 L89.9,299.7 L88.5,302.6 L88,298.9 L86.3,305.6 L81,302.4 L80.2,298.5 L78.4,298.3 L78.7,295.1 L81,295.9 L79.9,292.5 L81.2,290.5 L84.6,297.1 L86.6,297.5 L84.2,291.3 L87.2,291.1 L83.5,287.8 L84.3,282.6 L90.8,291.8 L92.3,290.3 L91.2,293.3 L93.3,289.3 L96.6,295.5 L93.4,287.2 L94.8,284.2 L93.4,284.6 L92.2,280 L95.4,276.6 L95,274.3 L97.2,274.4 L103.3,284.3 L103.2,295.9 L100.8,300.8 L103.4,299.8 L104.9,305.1 L102.1,308.7 L106.3,307.2 L105.2,310.9 L107.7,309.4 L112.7,313.5 L117.9,310.5 L122,312.1 L121,316.2 L115.8,318.7 L116,323.2 L108.5,331.7 L107.1,329.4 L108.5,323.2 L114.7,317.5 L108.8,319.3 L107.1,314.3 L105.2,322.8 L104.3,317.5 L102.3,316.9 Z`;

const MULL = `M64.2,277.8 L62.2,278.6 L65.2,280 L65.9,278.1 L67.9,279.8 L66.5,282.7 L65.9,280.5 L62,279.9 L64.6,282.3 L63.3,284 L66.5,283.9 L65.9,286.2 L60.5,287.2 L60.5,285.5 L58.7,287.6 L65.2,287.1 L64.7,290.9 L58.4,291 L56.9,288.2 L56.7,291.9 L54.9,287.5 L55.6,288.7 L58.5,287.1 L53.5,284.3 L52.6,286.3 L49.4,283.2 L51.5,278.3 L55.8,280.8 L58.4,275.5 L57.5,278.5 L59.5,280 L64,271.7 L62.9,275.8 L64.2,277.8 Z`;

const ORKNEY = `M217.5,155.6 L230.8,167.8 L226.3,169.9 L226.9,165.9 L225.6,165.4 L224.7,167.9 L222.7,165.8 L218.8,166.3 L223,161.3 L220.3,156.4 L217.6,155.6 L220.3,156.4 L223,161.3 L218.8,166.3 L222.7,165.8 L224.7,167.9 L225.6,165.4 L226.9,165.9 L227.2,170 L230.7,167.3 L231,169.5 L228.8,170.4 L229,172.9 L231.1,173.7 L230.5,171 L234.2,168.9 L234,173.3 L231.2,173.8 L229.5,177.3 L227,175.4 L226.3,177.6 L228.5,178.9 L226.6,180 L227.7,181.7 L224.8,189.2 L222.2,182.9 L224,181.8 L221.6,181.7 L226.7,179.7 L224.4,179.2 L226.4,178.6 L227,175.4 L225.6,175.7 L224.2,170 L215.3,174 L213.5,168.1 L211.6,170.8 L209.4,169.5 L209.1,165.5 L210.6,155.3 L215.5,153.8 L217.5,155.6 Z`;

const SMALL_ISLANDS = [
  `M107.1,443.7 L105.7,446.5 L100.2,447.5 L97.3,451.7 L95.8,448.4 L98.5,444.4 L95.5,439.2 L98.6,434.7 L95.3,434.7 L89.9,444.1 L88.5,442.4 L90.9,437.3 L91.1,429 L96,425.7 L96.4,431.5 L96.4,427.2 L103.6,421.8 L107.1,443.7 Z`,
  `M59.3,301.2 L61.2,303.9 L60,304.6 L61.9,304.7 L59.1,305.3 L63,308.5 L60.3,314.6 L56.5,312.8 L60,315.4 L61,319 L60.2,320.8 L56.7,320.5 L61,322 L61.4,325.4 L55.4,323.9 L52.9,313.3 L55.5,308.7 L53.9,301 L57.9,299.5 L59.3,301.2 Z`,
  `M296.6,22.3 L299.4,23.2 L300.1,30.2 L296.8,27.6 L298.6,32.2 L295.9,33 L299.3,34.9 L297.5,37.5 L298.3,42 L294.9,40.9 L295.6,42.8 L293.8,43 L291.6,32.8 L293.3,28.5 L295.1,32.9 L294.2,24.6 L295.1,22.5 L296.5,24.4 L296.6,22.3 Z`,
  `M117.6,413.9 L113.4,425.8 L110.9,427.7 L109.9,434 L107.1,433.7 L105.2,430.8 L105.2,425 L107.6,421 L111.8,420.3 L114.2,417.6 L110.8,420 L108.5,418.8 L110.4,413.5 L119.7,404.2 L120.5,407.4 L117.6,413.9 Z`,
  `M306.4,13.9 L308.6,15.3 L306.8,15.8 L307.6,18.4 L305.6,17.8 L307,20 L304.5,20.2 L306.5,20.9 L304.3,24.8 L305.8,26.3 L300.8,27.1 L301.7,15.6 L303.9,12.8 L303.9,16.2 L305.6,13 L306.4,13.9 Z`,
  `M120.6,378.2 L122,379.1 L121.9,381.2 L120.8,379.9 L120.2,381.1 L121.8,381.9 L121.2,384.2 L118.1,382.2 L118.8,383.7 L116.4,386.1 L120.2,385.8 L114.8,390.8 L112.7,389.9 L114.4,387.9 L113.2,387 L106.8,392.3 L99.2,392.6 L98.4,394.6 L95.2,393.2 L95.1,387.7 L98,387.9 L97.2,389.7 L99.5,390.4 L98.9,388.1 L104.6,388.1 L109.3,384.6 L100.7,386.2 L103.6,379.3 L106.4,379.1 L108.7,375.6 L103.1,376.5 L99.8,372.5 L95.5,371.9 L97.8,368.6 L96.2,366.1 L98.7,365.5 L101.3,368.1 L99.8,365 L100.9,363.1 L103.7,362 L106,363.4 L110.4,373.5 L116.3,373.7 L120.6,378.2 Z`,
];

const ALL_PATHS = [MAINLAND, LEWIS_HARRIS, SHETLAND, SKYE, MULL, ORKNEY, ...SMALL_ISLANDS];

export default function HighlandMap({ nfts = [], onLocationSelect, activeLocation }) {
  const [hoveredLocation, setHoveredLocation] = useState(null);

  // Build a case-insensitive lookup: lowercase -> canonical name
  const locationLookup = useMemo(() => {
    const lookup = {};
    Object.keys(LOCATION_COORDS).forEach(name => {
      lookup[name.toLowerCase()] = name;
      // Also match without trailing 's' (e.g. "Cairngorm" -> "Cairngorms")
      if (name.endsWith('s')) lookup[name.slice(0, -1).toLowerCase()] = name;
    });
    return lookup;
  }, []);

  const locationCounts = useMemo(() => {
    const counts = {};
    nfts.forEach(nft => {
      const locTrait = nft.traits?.find(t => t.trait_type === 'Location');
      if (locTrait) {
        // Match case-insensitively to the canonical location name
        const canonical = locationLookup[locTrait.value.toLowerCase()] || locTrait.value;
        counts[canonical] = (counts[canonical] || 0) + 1;
      }
    });
    return counts;
  }, [nfts, locationLookup]);

  const activeLocations = useMemo(() => {
    return Object.entries(LOCATION_COORDS)
      .filter(([name]) => locationCounts[name] > 0)
      .map(([name, coords]) => ({ name, ...coords, count: locationCounts[name] }));
  }, [locationCounts]);

  const allLocations = Object.entries(LOCATION_COORDS).map(([name, coords]) => ({
    name, ...coords, hasNfts: !!locationCounts[name],
  }));

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-sm uppercase tracking-[0.3em] mb-2"
          style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Playfair Display, serif' }}>
          Explore by Location
        </h2>
        <div className="w-12 h-px mx-auto" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
      </div>

      <svg viewBox="0 0 343 550" className="w-full h-auto" style={{ maxHeight: '800px' }}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00E896" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00E896" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="selectedGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Subtle grid */}
        {[100, 200, 300, 400, 500].map(y => (
          <line key={`h${y}`} x1="20" y1={y} x2="330" y2={y}
            stroke="rgba(0,232,150,0.025)" strokeWidth="0.5" />
        ))}
        {[50, 100, 150, 200, 250, 300].map(x => (
          <line key={`v${x}`} x1={x} y1="10" x2={x} y2="545"
            stroke="rgba(0,232,150,0.025)" strokeWidth="0.5" />
        ))}

        {/* Land — real Scotland geography with Mercator correction */}
        {ALL_PATHS.map((d, i) => (
          <path key={`land${i}`} d={d}
            fill="rgba(0,232,150,0.05)"
            stroke="rgba(0,232,150,0.22)"
            strokeWidth="0.7"
            strokeLinejoin="round"
          />
        ))}

        {/* Great Glen fault line */}
        <line x1="140" y1="360" x2="185" y2="280"
          stroke="rgba(0,232,150,0.08)" strokeWidth="0.6" strokeDasharray="4,4" />

        {/* Labels */}
        <text x="30" y="420" fill="rgba(0,232,150,0.07)" fontSize="6"
          style={{ fontFamily: 'monospace', letterSpacing: '0.15em' }}
          transform="rotate(-80, 30, 420)">ATLANTIC</text>
        <text x="265" y="270" fill="rgba(0,232,150,0.07)" fontSize="6"
          style={{ fontFamily: 'monospace', letterSpacing: '0.15em' }}
          transform="rotate(-80, 265, 270)">NORTH_SEA</text>
        <text x="155" y="245" fill="rgba(0,232,150,0.055)" fontSize="7"
          style={{ fontFamily: 'monospace', letterSpacing: '0.35em' }}>HIGHLANDS</text>

        {/* Inactive dots */}
        {allLocations.filter(l => !l.hasNfts).map(loc => (
          <g key={loc.name}>
            <circle cx={loc.x} cy={loc.y} r="1.5" fill="rgba(0,232,150,0.12)" />
            <line x1={loc.x - 4} y1={loc.y} x2={loc.x + 4} y2={loc.y} stroke="rgba(0,232,150,0.05)" strokeWidth="0.3" />
            <line x1={loc.x} y1={loc.y - 4} x2={loc.x} y2={loc.y + 4} stroke="rgba(0,232,150,0.05)" strokeWidth="0.3" />
          </g>
        ))}

        {/* Connection lines between active locations */}
        {activeLocations.length > 1 && activeLocations.map((loc, i) => {
          if (i === 0) return null;
          const prev = activeLocations[i - 1];
          return (
            <line key={`conn-${i}`}
              x1={prev.x} y1={prev.y} x2={loc.x} y2={loc.y}
              stroke="rgba(0,232,150,0.07)" strokeWidth="0.5" strokeDasharray="2,4" />
          );
        })}

        {/* Active location dots */}
        {activeLocations.map(loc => {
          const isActive = activeLocation === loc.name;
          const isHovered = hoveredLocation === loc.name;
          return (
            <g key={loc.name} className="cursor-pointer"
              onClick={() => onLocationSelect?.(isActive ? null : loc.name)}
              onMouseEnter={() => setHoveredLocation(loc.name)}
              onMouseLeave={() => setHoveredLocation(null)}>
              {/* Targeting brackets */}
              <g stroke={isActive ? 'rgba(255,255,255,0.5)' : 'rgba(0,232,150,0.3)'} strokeWidth="0.7" fill="none">
                <polyline points={`${loc.x-7},${loc.y-4} ${loc.x-7},${loc.y-7} ${loc.x-4},${loc.y-7}`} />
                <polyline points={`${loc.x+4},${loc.y-7} ${loc.x+7},${loc.y-7} ${loc.x+7},${loc.y-4}`} />
                <polyline points={`${loc.x+7},${loc.y+4} ${loc.x+7},${loc.y+7} ${loc.x+4},${loc.y+7}`} />
                <polyline points={`${loc.x-4},${loc.y+7} ${loc.x-7},${loc.y+7} ${loc.x-7},${loc.y+4}`} />
              </g>
              <circle cx={loc.x} cy={loc.y} r={isActive ? 12 : 8}
                fill={isActive ? 'url(#selectedGlow)' : 'url(#dotGlow)'}
                className={isActive ? '' : 'animate-map-pulse'} />
              <circle cx={loc.x} cy={loc.y}
                r={isActive ? 3.5 : isHovered ? 3 : 2.5}
                fill={isActive ? '#ffffff' : '#00E896'}
                filter={isHovered || isActive ? 'url(#glow)' : undefined}
                style={{ transition: 'all 0.2s ease' }} />
              {loc.count > 1 && (
                <g>
                  <rect x={loc.x+5} y={loc.y-12} width="12" height="10" rx="2"
                    fill="rgba(0,40,26,0.9)" stroke="rgba(0,232,150,0.4)" strokeWidth="0.5" />
                  <text x={loc.x+11} y={loc.y-4} textAnchor="middle" fill="#00E896" fontSize="6"
                    style={{ fontFamily: 'monospace' }}>{loc.count}</text>
                </g>
              )}
              {isActive && (
                <g>
                  <rect x={loc.x-35} y={loc.y+12} width="70" height="12" rx="1"
                    fill="rgba(0,40,26,0.85)" stroke="rgba(0,232,150,0.3)" strokeWidth="0.5" />
                  <text x={loc.x} y={loc.y+21} textAnchor="middle" fill="#00E896" fontSize="6"
                    style={{ fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                    {loc.name.toUpperCase()}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Hover tooltip */}
        {hoveredLocation && hoveredLocation !== activeLocation && (() => {
          const loc = LOCATION_COORDS[hoveredLocation];
          if (!loc) return null;
          const w = hoveredLocation.length * 4.5 + 16;
          return (
            <g style={{ pointerEvents: 'none' }}>
              <rect x={loc.x - w/2} y={loc.y - 22} width={w} height="12" rx="1"
                fill="rgba(0,40,26,0.9)" stroke="rgba(0,232,150,0.3)" strokeWidth="0.5" />
              <text x={loc.x} y={loc.y - 13} textAnchor="middle" fill="#00E896" fontSize="5.5"
                style={{ fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                {hoveredLocation.toUpperCase()}
              </text>
            </g>
          );
        })()}

        {/* Compass */}
        <g transform="translate(20, 40)" opacity="0.15">
          <line x1="0" y1="-12" x2="0" y2="12" stroke="#00E896" strokeWidth="0.5" />
          <line x1="-12" y1="0" x2="12" y2="0" stroke="#00E896" strokeWidth="0.5" />
          <text x="0" y="-16" textAnchor="middle" fill="#00E896" fontSize="6" style={{ fontFamily: 'monospace' }}>N</text>
          <polygon points="0,-10 -1.5,-5 1.5,-5" fill="#00E896" />
        </g>

        <text x="330" y="545" textAnchor="end" fill="rgba(0,232,150,0.05)" fontSize="5"
          style={{ fontFamily: 'monospace', letterSpacing: '0.2em' }}>RUTHVEN_SCOTLAND</text>
      </svg>

      {activeLocation && (
        <div className="text-center mt-4 animate-fadeIn">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-mono"
            style={{ backgroundColor: 'rgba(0,232,150,0.08)', border: '1px solid rgba(0,232,150,0.2)', color: '#00E896' }}>
            <span className="w-1.5 h-1.5 rounded-sm bg-[#00E896]" />
            {activeLocation.toUpperCase()}
            <span style={{ color: 'rgba(0,232,150,0.4)' }}>|</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>
              {locationCounts[activeLocation]} painting{locationCounts[activeLocation] !== 1 ? 's' : ''}
            </span>
            <button onClick={() => onLocationSelect?.(null)}
              className="ml-1 opacity-50 hover:opacity-100 transition-opacity text-xs">[×]</button>
          </span>
        </div>
      )}

      <style>{`
        @keyframes map-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.8; } }
        .animate-map-pulse { animation: map-pulse 3s ease-in-out infinite; }
        .animate-fadeIn { animation: mapFadeIn 0.3s ease-out; }
        @keyframes mapFadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
