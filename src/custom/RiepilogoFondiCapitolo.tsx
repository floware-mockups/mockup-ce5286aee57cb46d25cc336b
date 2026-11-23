// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("RiepilogoFondiCapitolo");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("RiepilogoFondiCapitolo");
import { useState } from "react";
import { Button, Card, Dialog, TextInput, Select, useTable, usePrototype } from "../floware";
function numero(t) {__mk();
 const s = String(t).replaceAll("€", "").split(".").join("").replace(",", ".").trim();
 return s === "" ? NaN : Number(s);
}
function pagata(s) {__mk(); return ["pagata", "pagato", "saldata", "saldato"].includes(String(s).trim().toLowerCase()); }
export default function RiepilogoFondiCapitolo(props) {__mk();
 const table = useTable(props.pageId);
 const { openDetail, notify } = usePrototype();
 const [filtro, setFiltro] = useState("Tutti i capitoli");
 const [modifica, setModifica] = useState(null);
 const [importo, setImporto] = useState("");
 const [analisi, setAnalisi] = useState(null);
 const [esercizio, setEsercizio] = useState(String(new Date().getFullYear()));
 if (!table) return null;
 if (["Capitolo", "Importo", "Stato", "Stanziamento capitolo"].some(c => (__mk(), table.column(c) < 0))) return <p>Servono Capitolo, Importo, Stato e Stanziamento capitolo.</p>;
 const euro = n => (__mk(), new Intl.NumberFormat("it-IT", {style:"currency", currency:"EUR"}).format(n));
 const nome = c => (__mk(), "Capitolo " + (c || "non indicato"));
 const capitoli = [...new Set(table.rows.map(r => (__mk(), table.value(r,"Capitolo"))))];
 const opzioni = ["Tutti i capitoli", ...capitoli.map(nome)];
 const attivo = opzioni.includes(filtro) ? filtro : opzioni[0];
 const righe = table.rows.map((r,i) => (__mk(), i)).filter(i => (__mk(), attivo === opzioni[0] || nome(table.value(i,"Capitolo")) === attivo));
 const nuovo = numero(importo);
 const valido = Number.isFinite(nuovo) && nuovo >= 0;
 const indici = analisi === null ? [] : table.findRows("Capitolo",analisi);
 const saldate = indici.filter(i => (__mk(), pagata(table.value(i,"Stato"))));
 const valide = saldate.filter(i => (__mk(), Number.isFinite(numero(table.value(i,"Importo"))))) ;
 const totale = valide.reduce((s,i) => (__mk(), s + numero(table.value(i,"Importo"))),0);
 const annoPresente = table.column("Anno pagamento") >= 0;
 const annoDi = i => (__mk(), annoPresente ? Number(table.value(i,"Anno pagamento")) : NaN);
 const annoValido = i => (__mk(), Number.isInteger(annoDi(i)) && annoDi(i) >= 1900 && annoDi(i) <= 9999);
 const senzaAnno = saldate.filter(i => (__mk(), !annoValido(i))).length;
 const base = Number(esercizio);
 const baseValida = Number.isInteger(base) && base >= 1904 && base <= 9998;
 const anni = baseValida ? [base-4,base-3,base-2,base-1,base] : [];
 const annuali = anni.map(anno => {__mk();
  const rr = saldate.filter(i => (__mk(), annoValido(i) && annoDi(i) === anno));
  const vv = rr.filter(i => (__mk(), Number.isFinite(numero(table.value(i,"Importo")))));
  return {anno, n:rr.length, valido:rr.length > 0 && vv.length === rr.length, somma:vv.reduce((s,i) => (__mk(), s + numero(table.value(i,"Importo"))),0)};
 });
 const previsione = annuali.length === 5 && annuali.every(a => (__mk(), a.valido)) && senzaAnno === 0;
 function salva() {__mk();
  if (!valido || modifica === null) return;
  table.findRows("Capitolo",modifica).forEach(i => (__mk(), table.setCell(i,"Stanziamento capitolo",euro(nuovo))));
  setModifica(null); notify("Stanziamento aggiornato per il capitolo.");
 }
 return <Card title="Fondi e fatture per capitolo"><div className="space-y-4">
 <Select label="Capitolo" value={attivo} options={opzioni} onChange={setFiltro}/>
 <p>Filtro limitato a questo riquadro. Dati dimostrativi in memoria.</p>
 {capitoli.filter(c => (__mk(), attivo === opzioni[0] || nome(c) === attivo)).map(c => {__mk();
 const ii = table.findRows("Capitolo",c);
 const fondi = ii.map(i => (__mk(), numero(table.value(i,"Stanziamento capitolo")))).filter(n => (__mk(), Number.isFinite(n)));
 const fondo = fondi.length ? fondi[0] : 0;
 const aperte = ii.filter(i => (__mk(), !pagata(table.value(i,"Stato"))));
 const mancanti = aperte.some(i => (__mk(), !Number.isFinite(numero(table.value(i,"Importo"))))) ;
 const dovuto = aperte.reduce((s,i) => (__mk(), s + (numero(table.value(i,"Importo")) || 0)),0);
 return <div key={c} className="border border-(--mk-border) rounded-lg p-4 space-y-2"><h3>{nome(c)}</h3>
 <p>Stanziamento: {fondi.length ? euro(fondo) : "mancante"} · Da pagare ({aperte.length}): {mancanti ? "dati incompleti" : euro(dovuto)} · Residuo: {fondi.length && !mancanti ? euro(fondo-dovuto) : "non calcolabile"}</p>
 {fondi.some(n => (__mk(), n !== fondo)) && <p>Stanziamenti discordanti: usato il primo valore.</p>}
 <Button variant="secondary" onClick={() => {__mk();setModifica(c);setImporto(fondo.toFixed(2).replace(".",","));}}>Modifica stanziamento</Button>
 <Button onClick={() => (__mk(), setAnalisi(c))}>Calcola riepilogo e previsione</Button></div>;
 })}
 <p>Residuo = stanziamento, contato una volta, meno fatture non pagate.</p>
 <h3>Pratiche filtrate ({righe.length})</h3>
 <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>{table.columns.map(c => (__mk(), <th key={c}>{c}</th>))}<th>Dettaglio</th></tr></thead><tbody>{righe.map(i => (__mk(), <tr key={i}>{table.columns.map(c => (__mk(), <td key={c} className="p-2">{table.value(i,c)}</td>))}<td><Button variant="link" onClick={() => (__mk(), openDetail(props.pageId,i))}>Apri</Button></td></tr>))}</tbody></table></div>
 </div>
 {modifica !== null && <Dialog title={nome(modifica)} onClose={() => (__mk(), setModifica(null))} footer={<><Button variant="secondary" onClick={() => (__mk(), setModifica(null))}>Annulla</Button><Button disabled={!valido} onClick={salva}>Salva</Button></>}><p>Stanziamento applicato a tutte le fatture del capitolo.</p><TextInput label="Stanziamento in euro" value={importo} onChange={setImporto}/></Dialog>}
 {analisi !== null && <Dialog title={"Analisi: " + nome(analisi)} onClose={() => (__mk(), setAnalisi(null))} footer={<Button onClick={() => (__mk(), setAnalisi(null))}>Chiudi</Button>}><div className="space-y-3">
 <p>Pratiche: {indici.length}. Pagate: {saldate.length}. Non pagate: {indici.length-saldate.length}.</p>
 <p>Totale pagamenti con importo valido: {euro(totale)}. Media: {valide.length ? euro(totale/valide.length) : "non disponibile"} ({valide.length} valori). Importi esclusi: {saldate.length-valide.length}.</p>
 <p>Stati inclusi: Pagata, Pagato, Saldata, Saldato. Le pratiche aperte non sono uscite effettive.</p>
 {saldate.map(i => (__mk(), <p key={i}>Riga {i+1}: {table.column("Atto") >= 0 ? table.value(i,"Atto") : "atto non disponibile"} · {table.value(i,"Importo")} · Anno pagamento: {annoValido(i) ? annoDi(i) : "mancante"}</p>))}
 <TextInput label="Ultimo esercizio del quinquennio" type="number" value={esercizio} onChange={setEsercizio}/>
 <p>Si usa solo la colonna Anno pagamento: scadenza e anno dell’atto non provano quando è avvenuto il pagamento. Pagamenti senza anno valido: {senzaAnno}.</p>
 {!baseValida && <p>Indicare un anno intero tra 1904 e 9998.</p>}
 {annuali.map(a => (__mk(), <p key={a.anno}>{a.anno}: uscite {a.valido ? euro(a.somma) + " su " + a.n + " pagamenti registrati" : "non disponibili o incomplete"}; entrate: non disponibili.</p>))}
 <p>Mancano movimenti di entrata con anno e importo. Lo stanziamento non è un’entrata. I totali disponibili riguardano solo le righe registrate, non un rendiconto annuale completo.</p>
 <p>Previsione {baseValida ? base+1 : ""}: {previsione ? euro(annuali.reduce((s,a) => (__mk(), s+a.somma),0)/5) + ", media aritmetica delle cinque uscite annue elencate; stima sui soli dati registrati, senza inflazione." : "non calcolabile: servono uscite datate e importi validi per tutti e cinque gli anni; anni senza righe non sono considerati a spesa zero."}</p>
 </div></Dialog>}
 </Card>;
}
