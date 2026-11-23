// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("RiepilogoFondiCapitolo");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("RiepilogoFondiCapitolo");
import { useState } from "react";
import { Button, Card, Dialog, TextInput, Badge, useTable, usePrototype } from "../floware";

function numero(testo) {__mk();
  return Number(String(testo).replaceAll("€", "").split(".").join("").replace(",", ".").trim());
}
function pagata(stato) {__mk();
  return ["pagata", "pagato", "saldata", "saldato"].includes(String(stato).trim().toLowerCase());
}
export default function RiepilogoFondiCapitolo(props) {__mk();
  const table = useTable(props.pageId);
  const { openDetail, notify } = usePrototype();
  const [selezionato, setSelezionato] = useState(null);
  const [importo, setImporto] = useState("");
  if (!table) return null;
  const necessari = ["Capitolo", "Importo", "Stato", "Stanziamento capitolo"];
  if (necessari.some((nome) => (__mk(), table.column(nome) < 0))) return <p>Servono le colonne Capitolo, Importo, Stato e Stanziamento capitolo.</p>;
  const euro = (valore) => (__mk(), new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(valore));
  const capitoli = [...new Set(table.rows.map((r) => (__mk(), table.value(r, "Capitolo"))))];
  const gruppi = capitoli.map((capitolo) => {__mk();
    const indici = table.findRows("Capitolo", capitolo);
    const stanziamenti = indici.map((i) => (__mk(), table.value(i, "Stanziamento capitolo"))).filter((v) => (__mk(), v.trim() !== "")).map(numero).filter((n) => (__mk(), Number.isFinite(n)));
    const stanziamento = stanziamenti.length ? stanziamenti[0] : 0;
    const aperte = indici.filter((i) => (__mk(), !pagata(table.value(i, "Stato"))));
    const totale = aperte.reduce((somma, i) => {__mk();
      const n = numero(table.value(i, "Importo"));
      return somma + (Number.isFinite(n) ? n : 0);
    }, 0);
    return { capitolo, indici, aperte, stanziamento, totale, incoerente: stanziamenti.some((n) => (__mk(), n !== stanziamento)), assente: !stanziamenti.length };
  });
  const nuovo = numero(importo);
  const valido = importo.trim() !== "" && Number.isFinite(nuovo) && nuovo >= 0;
  function salva() {__mk();
    if (!valido || selezionato === null) return;
    const indici = table.findRows("Capitolo", selezionato);
    indici.forEach((i) => (__mk(), table.setCell(i, "Stanziamento capitolo", euro(nuovo))));
    setSelezionato(null);
    notify("Stanziamento aggiornato per tutte le fatture del capitolo.");
  }
  return <Card title="Fondi e fatture per capitolo">
    <div className="space-y-4">
      <p className="text-(--mk-muted)">Dati dimostrativi modificabili, conservati in memoria. Residuo = stanziamento del capitolo − fatture non pagate. Lo stanziamento viene contato una sola volta per capitolo.</p>
      {!gruppi.length && <p>Nessuna fattura presente.</p>}
      {gruppi.map((g) => (__mk(), <div key={g.capitolo} className="rounded-lg border border-(--mk-border) p-4 space-y-3">
        <h3 className="font-semibold">Capitolo {g.capitolo || "non indicato"}</h3>
        <dl className="grid gap-3 sm:grid-cols-3">
          <div><dt>Stanziamento</dt><dd className="font-semibold">{euro(g.stanziamento)}</dd></div>
          <div><dt>Totale da pagare</dt><dd className="font-semibold">{euro(g.totale)}</dd></div>
          <div><dt>Residuo</dt><dd className={g.stanziamento < g.totale ? "font-semibold text-(--mk-danger)" : "font-semibold"}>{euro(g.stanziamento - g.totale)}</dd></div>
        </dl>
        {g.incoerente && <p className="text-(--mk-danger)">Stanziamenti discordanti: è usato il primo valore presente. Modifica lo stanziamento per uniformarli.</p>}
        {g.assente && <p className="text-(--mk-danger)">Stanziamento mancante: nel calcolo è considerato zero.</p>}
        <Button variant="secondary" onClick={() => {__mk(); setSelezionato(g.capitolo); setImporto(g.stanziamento.toFixed(2).replace(".", ",")); }}>Modifica stanziamento</Button>
        <h4 className="font-semibold">Fatture da pagare ({g.aperte.length})</h4>
        {!g.aperte.length && <p>Nessuna fattura da pagare.</p>}
        <ul className="space-y-2">{g.aperte.map((i) => (__mk(), <li key={i} className="flex flex-wrap items-center gap-2">
          <Button variant="link" onClick={() => (__mk(), openDetail(props.pageId, i))}>{table.column("Atto") >= 0 ? table.value(i, "Atto") : "Apri pratica"}</Button>
          <span>{table.value(i, "Importo")}</span><Badge tone="neutral">{table.value(i, "Stato")}</Badge>
        </li>))}</ul>
      </div>))}
    </div>
    {selezionato !== null && <Dialog title={"Stanziamento capitolo " + (selezionato || "non indicato")} onClose={() => (__mk(), setSelezionato(null))} footer={<><Button variant="secondary" onClick={() => (__mk(), setSelezionato(null))}>Annulla</Button><Button onClick={salva} disabled={!valido}>Salva</Button></>}>
      <p>Il valore sostituisce lo stanziamento su tutte le fatture del capitolo, anche quelle già pagate.</p>
      <TextInput label="Stanziamento in euro" value={importo} onChange={setImporto} placeholder="12.000,00" />
      {!valido && <p className="text-(--mk-danger)">Indica un importo valido, maggiore o uguale a zero.</p>}
    </Dialog>}
  </Card>;
}
