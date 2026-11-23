// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("RiepilogoFondiCapitolo");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("RiepilogoFondiCapitolo");
import { useState } from "react";
import { Card, Button, Badge, Select, Dialog, TextInput, useTable } from "../floware";
function numero(t) {__mk();
 const s = String(t).replaceAll("€", "").split(".").join("").replace(",", ".").trim();
 return s === "" ? Number.NaN : Number(s);
}
export default function RiepilogoFondiCapitolo(props) {__mk();
 const table = useTable(props.pageId);
 const [filtro, setFiltro] = useState("Tutti");
 const [modifica, setModifica] = useState(null);
 const [importo, setImporto] = useState("");
 if (!table) return null;
 if (["Capitolo", "Importo", "Stanziamento capitolo", "Stato"].some(c => (__mk(), table.column(c) < 0))) return <p>Servono le colonne Capitolo, Importo, Stanziamento capitolo e Stato.</p>;
 const euro = n => (__mk(), new Intl.NumberFormat("it-IT", {style:"currency", currency:"EUR"}).format(n));
 const stati = [...new Set(table.rows.map(r => (__mk(), table.value(r,"Stato") || "Non indicato")))];
 const capitoli = [...new Set(table.rows.map(r => (__mk(), table.value(r,"Capitolo"))))];
 const gruppi = capitoli.map(c => {__mk();
  const ii = table.findRows("Capitolo",c);
  const fondi = ii.map(i => (__mk(), numero(table.value(i,"Stanziamento capitolo"))));
  const validi = fondi.filter(n => (__mk(), Number.isFinite(n) && n >= 0));
  const fondo = validi.length ? validi[0] : null;
  const coerente = fondo !== null && fondi.every(n => (__mk(), n === fondo));
  const valido = ii.every(i => {__mk();const n = numero(table.value(i,"Importo")); return Number.isFinite(n) && n >= 0;});
  const segmenti = stati.map((s,k) => ((__mk(), {s,k,totale:ii.filter(i => (__mk(), (table.value(i,"Stato") || "Non indicato") === s)).reduce((a,i) => {__mk();const n = numero(table.value(i,"Importo")); return a + (Number.isFinite(n) && n >= 0 ? n : 0);},0)})));
  const totale = segmenti.reduce((a,s) => (__mk(), a+s.totale),0);
  return {c,ii,fondo,coerente,valido,segmenti,totale};
 });
 const massimo = gruppi.reduce((a,g) => (__mk(), Math.max(a,g.fondo || 0,g.totale)),1);
 const nome = c => (__mk(), "Capitolo " + (c || "non indicato"));
 const opzioni = ["Tutti",...capitoli.map(nome)];
 const attivo = opzioni.includes(filtro) ? filtro : "Tutti";
 const nuovo = numero(importo);
 function salva() {__mk();
  if (modifica === null || !Number.isFinite(nuovo) || nuovo < 0) return;
  table.findRows("Capitolo",modifica).forEach(i => (__mk(), table.setCell(i,"Stanziamento capitolo",euro(nuovo))));
  setModifica(null);
 }
 return <Card title="Fondi e fatture per capitolo"><div className="space-y-4">
 <p className="text-sm text-(--mk-muted)">Grafico in stile Gantt su asse monetario, non temporale. Scala comune a tutti i capitoli. Stanziamento contato una sola volta; impegnato = somma di tutte le pratiche, incluse quelle pagate. Disponibile = stanziamento meno impegnato.</p>
 <Select label="Capitolo del grafico" value={attivo} options={opzioni} onChange={setFiltro}/>
 <p className="text-sm">Ogni segmento numerato corrisponde a uno stato; i valori sono riportati anche in testo.</p>
 <div className="flex justify-between text-xs text-(--mk-muted)"><span>0 €</span><span>{euro(massimo/2)}</span><span>{euro(massimo)}</span></div>
 {gruppi.filter(g => (__mk(), attivo === "Tutti" || nome(g.c) === attivo)).map(g => (__mk(), <div key={g.c} className="rounded-lg border border-(--mk-border) p-4 space-y-3">
 <h3 className="font-semibold">{nome(g.c)}</h3>
 <p className="text-sm">Stanziamento: {g.fondo === null ? "mancante" : euro(g.fondo)}</p>
 <div className="h-5 bg-(--mk-subtle)" aria-label="Barra dello stanziamento"><div className="h-full border border-(--mk-border) bg-(--mk-primary)" style={{width:(g.fondo || 0)/massimo*100 + "%"}}/></div>
 <p className="text-sm">Impegnato: {euro(g.totale)}{!g.valido && " (parziale)"}</p>
 <div className="flex h-8 bg-(--mk-subtle)" aria-label="Impegni suddivisi per stato">{g.segmenti.filter(s => (__mk(), s.totale > 0)).map(s => (__mk(), <div key={s.s} title={s.s + ": " + euro(s.totale)} className="h-full overflow-hidden bg-(--mk-primary) text-(--mk-on-primary) text-center text-xs" style={{width:s.totale/massimo*100 + "%",borderWidth:"2px",borderColor:"var(--mk-surface)",borderStyle:s.k % 2 ? "dashed" : "solid"}}>{s.k+1}</div>))}</div>
 <div className="flex flex-wrap gap-2">{g.segmenti.filter(s => (__mk(), s.totale > 0)).map(s => (__mk(), <span key={s.s} className="border border-(--mk-border) rounded p-2 text-sm">{s.k+1}. {s.s}: {euro(s.totale)}</span>))}</div>
 {g.coerente && g.valido ? <Badge tone={g.fondo < g.totale ? "danger" : "primary"}>{g.fondo < g.totale ? "Sforamento: " + euro(g.totale-g.fondo) : "Disponibile: " + euro(g.fondo-g.totale)}</Badge> : <p className="text-sm text-(--mk-danger)">Residuo non calcolabile: importi non validi o stanziamenti mancanti o discordanti. Il grafico usa gli importi validi e il primo stanziamento valido.</p>}
 <div><Button variant="secondary" onClick={() => {__mk();setModifica(g.c);setImporto((g.fondo || 0).toFixed(2).replace(".",","));}}>Modifica stanziamento</Button></div>
 </div>))}
 {!gruppi.length && <p>Nessuna pratica registrata.</p>}
 </div>
 {modifica !== null && <Dialog title={"Stanziamento: " + nome(modifica)} onClose={() => (__mk(), setModifica(null))} footer={<><Button variant="secondary" onClick={() => (__mk(), setModifica(null))}>Annulla</Button><Button disabled={!Number.isFinite(nuovo) || nuovo < 0} onClick={salva}>Salva</Button></>}><p>Il valore viene applicato a tutte le pratiche del capitolo, solo in memoria.</p><TextInput label="Stanziamento in euro" value={importo} onChange={setImporto}/></Dialog>}
 </Card>;
}
