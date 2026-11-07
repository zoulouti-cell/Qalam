import Mi from './Mi'
import type { Lang } from './i18n'

const ERAS: Record<Lang, { city: string; people: string; work: string; clothing: string; land: string }[]> = {
  ar: [
    { city: 'قرى ومراكز محلية', people: 'تجمعات صغيرة متفرقة', work: 'الزراعة والرعي والتبادل مع الجوار', clothing: 'ألبسة منسوجة من مواد محلية', land: 'قرى وطرق محلية بين الجبل والسهل' },
    { city: 'وليلي: مدينة وأسواق', people: 'سكان المدينة ومزارع محيطة', work: 'الزراعة والحرف والتجارة', clothing: 'أردية وعباءات من أقمشة مختلفة', land: 'سهول زراعية وتلال وطرق قوافل' },
    { city: 'فاس: أسوار وأحياء', people: 'حرفيون وطلاب وتجار وأسر', work: 'النسيج والجلود والأسواق والتعليم', clothing: 'أردية وعمائم وملابس ملائمة للمدينة', land: 'طرق تربط فاس بالجبال والسهول' },
    { city: 'مراكش: أسوار وبساتين', people: 'سكان المدينة ومسافرون وقوافل', work: 'التجارة والحرف والزراعة حول المدينة', clothing: 'ألبسة حضرية وقروية متنوعة', land: 'ممرات بين الأطلس والسهول والواحات' },
    { city: 'مدن وأسواق ومدارس', people: 'سكان المدن والقرى والواحات', work: 'الحرف والتجارة والزراعة والنقل', clothing: 'ألبسة محلية تختلف باختلاف الجهة والعمل', land: 'شبكات طرق تربط المدن بالموانئ والداخل' },
    { city: 'مدينة قديمة وامتداد جديد', people: 'هجرة إلى المدن وتوسع الأحياء', work: 'الميناء والسكك والإدارة والتجارة', clothing: 'ألبسة تقليدية وأخرى حضرية حديثة', land: 'طرق وسكك وموانئ تعيد وصل الجهات' },
    { city: 'مدن كبرى وشبكات حديثة', people: 'أغلبية حضرية وتنوع جهوي', work: 'الخدمات والصناعة والفلاحة والتقنية', clothing: 'أزياء يومية متنوعة مع حضور اللباس التقليدي', land: 'مدن وموانئ وطرق مع تحديات الماء والمناخ' },
  ],
  fr: [
    { city: 'Villages et centres locaux', people: 'Petits établissements dispersés', work: 'Agriculture, élevage et échanges locaux', clothing: 'Textiles confectionnés avec des matières locales', land: 'Villages et routes entre montagne et plaine' },
    { city: 'Volubilis : ville et marchés', people: 'Habitants et fermes environnantes', work: 'Agriculture, artisanat et commerce', clothing: 'Tuniques et manteaux de tissus variés', land: 'Plaines, collines et routes commerciales' },
    { city: 'Fès : remparts et quartiers', people: 'Artisans, étudiants, marchands et familles', work: 'Textile, cuir, marchés et enseignement', clothing: 'Robes et turbans adaptés à la vie urbaine', land: 'Routes reliant Fès aux plaines et montagnes' },
    { city: 'Marrakech : remparts et jardins', people: 'Habitants, voyageurs et caravanes', work: 'Commerce, artisanat et agriculture périurbaine', clothing: 'Vêtements ruraux et urbains variés', land: 'Passages entre Atlas, plaines et oasis' },
    { city: 'Villes, marchés et écoles', people: 'Habitants des villes, campagnes et oasis', work: 'Artisanat, commerce, agriculture et transport', clothing: 'Tenues locales variant selon région et métier', land: 'Routes reliant villes, ports et intérieur' },
    { city: 'Médina et extension moderne', people: 'Migration vers les villes et nouveaux quartiers', work: 'Ports, chemins de fer, administration et commerce', clothing: 'Tenues traditionnelles et vêtements urbains modernes', land: 'Routes, rail et ports relient davantage les régions' },
    { city: 'Métropoles et réseaux modernes', people: 'Population majoritairement urbaine et diverse', work: 'Services, industrie, agriculture et technologie', clothing: 'Styles quotidiens variés et tenues traditionnelles', land: 'Villes et ports confrontés aux défis de l’eau et du climat' },
  ],
  en: [
    { city: 'Villages and local centers', people: 'Small, scattered settlements', work: 'Farming, herding, and nearby exchange', clothing: 'Woven clothing using local materials', land: 'Local paths between mountains and plains' },
    { city: 'Volubilis: town and markets', people: 'Town residents and surrounding farms', work: 'Farming, crafts, and trade', clothing: 'Robes and cloaks in varied fabrics', land: 'Farms, hills, and trading routes' },
    { city: 'Fez: walls and neighborhoods', people: 'Craft workers, students, traders, and families', work: 'Textiles, leather, markets, and learning', clothing: 'Robes and turbans suited to city life', land: 'Routes connect Fez with plains and mountains' },
    { city: 'Marrakesh: walls and gardens', people: 'Residents, travelers, and caravans', work: 'Trade, crafts, and farming near the city', clothing: 'A mix of urban and rural clothing', land: 'Passages between the Atlas, plains, and oases' },
    { city: 'Cities, markets, and schools', people: 'Residents of towns, villages, and oases', work: 'Crafts, trade, agriculture, and transport', clothing: 'Regional clothing shaped by place and work', land: 'Routes connect towns, ports, and the interior' },
    { city: 'Old town and new expansion', people: 'Migration to cities and expanding districts', work: 'Ports, rail, administration, and trade', clothing: 'Traditional dress alongside modern urban clothing', land: 'Roads, railways, and ports connect more regions' },
    { city: 'Large cities and modern networks', people: 'A mostly urban population with regional diversity', work: 'Services, industry, farming, and technology', clothing: 'Varied everyday styles alongside traditional dress', land: 'Cities and ports face water and climate challenges' },
  ],
}

const COPY: Record<Lang, { kicker: string; note: string; scene: string; people: string; work: string; clothing: string; land: string; population: string }> = {
  ar: { kicker: 'رحلة بصرية عبر الزمن', note: 'مشهد توضيحي مركّب للتعلم، وليس صورة فوتوغرافية أو تعدادًا تاريخيًا دقيقًا.', scene: 'المشهد والمدينة', people: 'الناس والاستقرار', work: 'العمل والاقتصاد', clothing: 'اللباس والحياة اليومية', land: 'المكان والاتصال', population: 'تمثيل نوعي للاستقرار؛ لا يساوي أعدادًا تاريخية' },
  fr: { kicker: 'Voyage visuel dans le temps', note: 'Reconstitution pédagogique, pas une photographie ni un recensement historique.', scene: 'Scène et ville', people: 'Population et habitat', work: 'Activités et économie', clothing: 'Vêtements et vie quotidienne', land: 'Lieu et connexions', population: 'Représentation qualitative, sans chiffres historiques' },
  en: { kicker: 'A visual journey through time', note: 'An educational reconstruction, not a photograph or a historical population count.', scene: 'Scene and city', people: 'People and settlement', work: 'Work and economy', clothing: 'Clothing and daily life', land: 'Place and connections', population: 'Qualitative settlement view; no historical headcount' },
}

export default function ChildHistoryScene({ lang, step, entryTitle }: { lang: Lang; step: number; entryTitle: string }) {
  const data = ERAS[lang][Math.min(step, ERAS[lang].length - 1)]
  const c = COPY[lang]
  const modern = step >= 6
  const transitional = step === 5
  const oldCity = step < 5
  const buildings = Array.from({ length: modern ? 10 : transitional ? 9 : 8 }, (_, i) => ({ x: 45 + i * 99, h: 50 + ((i * 37 + step * 13) % (modern ? 110 : 64)), w: modern ? 62 : 77 }))

  return <section className="morocco-kids-scene" aria-live="polite">
    <div className="morocco-kids-scene-head"><span className="academy-kicker"><Mi name="auto_awesome" /> {c.kicker}</span><span className="morocco-era-pill">{step + 1} / 7</span></div>
    <div className="morocco-scene-layout">
      <div className={`morocco-scene-art era-${step}`} role="img" aria-label={`${entryTitle}: ${data.city}`}>
        <svg viewBox="0 0 1000 430" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="sceneSky" x2="0" y2="1"><stop stopColor={modern ? '#acd6dd' : '#f3d7a3'}/><stop offset="1" stopColor={modern ? '#e7f1df' : '#f9edcd'}/></linearGradient>
            <linearGradient id="sceneGround" x2="0" y2="1"><stop stopColor="#c5b67c"/><stop offset="1" stopColor="#e6d19d"/></linearGradient>
          </defs>
          <rect width="1000" height="430" fill="url(#sceneSky)"/><circle cx="810" cy="82" r="37" fill="#ffe6a3" opacity=".9"/>
          <path d="M0 230 130 109 215 193 325 81 460 219 573 125 724 226 850 105 1000 220V430H0Z" fill="#91aa83" opacity=".55"/>
          <path d="M0 272 172 176 280 258 438 155 590 267 745 177 900 269 1000 215V430H0Z" fill="#738c6e" opacity=".55"/>
          <rect y="300" width="1000" height="130" fill="url(#sceneGround)"/>
          {step < 2 && <path d="M0 321Q150 295 287 321T562 316T845 320T1100 303V430H0Z" fill="#afbd76"/>}
          {step >= 2 && step < 5 && <><path d="M0 316Q190 289 355 321T681 309T1020 315V430H0Z" fill="#9eac70"/><path d="M0 355Q190 333 420 355T800 349T1100 355" fill="none" stroke="#72a5a0" strokeWidth="11" opacity=".8"/></>}
          {(modern || transitional) && <path d="M0 305Q130 286 250 305T500 300T760 305T1050 286V430H0Z" fill="#85a899"/>}
          {buildings.map(({x,h,w},i)=>{const y=modern?305-h:319-h;if(modern)return <g key={x}><rect x={x} y={y} width={w} height={h} rx="3" fill={i%2?'#647d83':'#718d91'}/><path d={`M${x+10} ${y+15}h9v12h-9zm20 0h9v12h-9zm0 24h9v12h-9zm-20 0h9v12h-9z`} fill="#e7d8ac" opacity=".85"/></g>;if(transitional&&i>=4)return <g key={x}><rect x={x} y={y} width={w} height={h} fill="#b77e55"/><rect x={x+14} y={y+18} width="12" height="14" fill="#ecdaaa"/><rect x={x+42} y={y+18} width="12" height="14" fill="#ecdaaa"/></g>;return <g key={x}><rect x={x} y={y} width={w} height={h} rx={oldCity?9:2} fill={i%2?'#bd8052':'#d49b62'}/>{oldCity&&<path d={`M${x-4} ${y+12}q${w/2} -24 ${w+8} 0`} fill="#7d573a"/>}{!oldCity&&<path d={`M${x+9} ${y+19}h10v14h-10zm26 0h10v14h-10z`} fill="#f2d9a2"/>}</g>})}
          {step>=2&&step<=4&&<g fill="#cfaa55"><path d="M121 230v-78h18v78zm-8-78 17-31 17 31z"/><path d="M835 259v-60h14v60zm-7-60 14-25 14 25z"/></g>}
          {step===1&&<g stroke="#f1dfb8" strokeWidth="12"><path d="M188 321v-95m28 95v-95m28 95v-95m-57 0h70m-75 9h80"/></g>}
          {step===3&&<g><path d="M40 298q36-71 73 0" fill="#b8794a"/><path d="M45 294h65v26H45z" fill="#bb7541"/><path d="M48 295h58" stroke="#f0cb83" strokeWidth="4"/></g>}
          {transitional&&<><path d="M390 337h510" stroke="#555f60" strokeWidth="7"/><path d="M400 346h500" stroke="#f0e5c9" strokeWidth="3"/><g fill="#46585d"><path d="M520 290h60l23 29h-92z"/><circle cx="533" cy="323" r="9"/><circle cx="581" cy="323" r="9"/></g></>}
          {modern&&<g><path d="M0 366h1000" stroke="#545f61" strokeWidth="18"/><path d="M0 366h1000" stroke="#fff2c9" strokeWidth="2" strokeDasharray="25 22"/><rect x="395" y="328" width="125" height="29" rx="11" fill="#d9534f"/><path d="M408 333h94" stroke="#f4e4ba" strokeWidth="12"/></g>}
          {Array.from({length:Math.min(10,3+step)},(_,i)=><g key={`p${i}`} transform={`translate(${90+i*72},${306+(i%2)*9})`}><circle cy="-20" r="8" fill="#795338"/><path d={oldCity?'M-11-9Q0-18 11-9L15 23H-14Z':'M-9-10H9L12 21H-12Z'} fill={['#176b5b','#b9573d','#d1a34b','#395c82'][i%4]}/><path d="M-5 22v16m10-16v16" stroke="#624833" strokeWidth="5" strokeLinecap="round"/></g>)}
          <path d="M0 400q190-15 390 0t390 0t300-2v40H0Z" fill="#45694e" opacity=".6"/>
        </svg>
        <span className="morocco-scene-caption"><Mi name="explore" /> {data.city}</span>
      </div>
      <div className="morocco-scene-facts">
        {[["account_balance",c.scene,data.city],["groups",c.people,data.people],["category",c.work,data.work],["person",c.clothing,data.clothing],["travel_explore",c.land,data.land]].map(([icon,label,value])=><div className="morocco-scene-fact" key={label}><span><Mi name={icon}/></span><div><small>{label}</small><strong>{value}</strong></div></div>)}
        <div className="morocco-settlement-meter"><span>{c.people}</span><div aria-label={c.population}>{Array.from({length:7},(_,i)=><i key={i} className={i<2+step?'lit':''}/>)}</div><small>{c.population}</small></div>
      </div>
    </div>
    <p className="morocco-scene-note"><Mi name="info" /> {c.note}</p>
  </section>
}
