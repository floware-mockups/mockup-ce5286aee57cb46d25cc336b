// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("RiepilogoFondiCapitolo");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("RiepilogoFondiCapitolo");
import { useState } from "react";
import { Button, Card, Dialog, TextInput, Select, useTable, usePrototype } from "../floware";

function numero(testo) {__mk();
  return Number(String(testo).replaceAll("€", "").split(".").join("").replace(",", ".").trim());
}
function pagata(stato) {__mk();
  return ["pagata", "pagato", "saldata", "saldato"].includes(String(stato).trim().toLowerCase());
}
export default function RiepilogoFondiCapitolo(props) {__mk();
  const table = useTable(props.pageId);
  const { openDetail, notify } = usePrototype();
  const [filtro, setFiltro] = useState("Tutti i capitoli");
  const [modifica, setModifica] = useState(null);
  const [importo, setImporto] = useState("");
  if (!table) return null;
  if (["Capitolo", "Importo", "Stato", "Stanziamento capitolo"].some((c) => (__mk(), table.column(c) < 0))) return <p>Servono le colonne Capitolo, Importo, Stato e Stanziamento capitolo.</p>;
  const euro = (n) => (__mk(), new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n));
  const etichetta = (c) => (__mk(), "Capitolo " + (c || "non indicato"));
  const capitoli = [...new Set(table.rows.map((r) => (__mk(), table.value(r, "Capitolo"))))];
  const opzioni = ["Tutti i capitoli", ...capitoli.map(etichetta)];
  const attivo = opzioni.includes(filtro) ? filtro : "Tutti i capitoli";
  const visibili = capitoli.filter((c) => (__mk(), attivo === "Tutti i capitoli" || etichetta(c) === attivo));
  const righe = table.rows.map((r, i) => (__mk(), i)).filter((i) => (__mk(), visibili.includes(table.value(i, "Capitolo"))));
  const gruppi = visibili.map((capitolo) => {__mk();
    const indici = table.findRows("Capitolo", capitolo);
    const stanziamenti = indici.map((i) => (__mk(), table.value(i, "Stanziamento capitolo"))).filter((v) => (__mk(), v.trim() !== "")).map(numero).filter((n) => (__mk(), Number.isFinite(n)));
    const stanziamento = stanziamenti.length ? stanziamenti[0] : 0;
    const aperte = indici.filter((i) => (__mk(), !pagata(table.value(i, "Stato"))));
    const totale = aperte.reduce((s, i) => {__mk();
      const n = numero(table.value(i, "Importo"));
      return s + (Number.isFinite(n) ? n : 0);
    }, 0);
    return { capitolo, aperte, stanziamento, totale, incoerente: stanziamenti.some((n) => (__mk(), n !== stanziamento)), assente: !stanziamenti.length };
  });
  const nuovo = numero(importo);
  const valido = importo.trim() !== "" && Number.isFinite(nuovo) && nuovo >= 0;
  function salva() {__mk();
    if (!valido || modifica === null) return;
    table.findRows("Capitolo", modifica).forEach((i) => (__mk(), table.setCell(i, "Stanziamento capitolo", euro(nuovo))));
    setModifica(null);
    notify("Stanziamento aggiornato per tutte le fatture del capitolo.");
  }
  return <Card title="Fondi e fatture per capitolo">
    <div className="space-y-4">
      <Select label="Capitolo" value={attivo} options={opzioni} onChange={setFiltro} />
      <p className="text-sm text-(--mk-muted)">Il selettore filtra i fondi e le pratiche in questo riquadro; la tabella standard sottostante resta indipendente. Dati dimostrativi conservati in memoria.</p>
      {!gruppi.length && <p>Nessuna pratica presente.</p>}
      {gruppi.map((g) => (__mk(), <div key={g.capitolo} className="rounded-lg border border-(--mk-border) p-4 space-y-3">
        <h3 className="font-semibold">{etichetta(g.capitolo)}</h3>
        <dl className="grid gap-3 sm:grid-cols-3">
          <div><dt>Stanziamento</dt><dd>{euro(g.stanziamento)}</dd></div>
          <div><dt>Totale da pagare ({g.aperte.length})</dt><dd>{euro(g.totale)}</dd></div>
          <div><dt>Residuo</dt><dd className={g.stanziamento < g.totale ? "text-(--mk-danger)" : "text-(--mk-text)"}>{euro(g.stanziamento - g.totale)}</dd></div>
        </dl>
        {g.incoerente && <p className="text-(--mk-danger)">Stanziamenti discordanti: viene usato il primo valore presente.</p>}
        {g.assente && <p className="text-(--mk-danger)">Stanziamento mancante: considerato zero.</p>}
        <Button variant="secondary" onClick={() => {__mk(); setModifica(g.capitolo); setImporto(g.stanziamento.toFixed(2).replace(".", ",")); }}>Modifica stanziamento</Button>
      </div>))}
      <p className="text-sm text-(--mk-muted)">Residuo = stanziamento meno fatture non pagate. Lo stanziamento è contato una sola volta per capitolo.</p>
      <h3 className="font-semibold">Pratiche filtrate ({righe.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr>{table.columns.map((c) => (__mk(), <th key={c} className="p-2 text-left border-b border-(--mk-divider)">{c}</th>))}<th className="p-2 text-left">Dettaglio</th></tr></thead>
          <tbody>{righe.map((i) => (__mk(), <tr key={i}>{table.columns.map((c) => (__mk(), <td key={c} className="p-2 border-b border-(--mk-divider)">{table.value(i, c)}</td>))}<td className="p-2"><Button variant="link" onClick={() => (__mk(), openDetail(props.pageId, i))}>Apri</Button></td></tr>))}</tbody>
        </table>
      </div>
    </div>
    {modifica !== null && <Dialog title={"Stanziamento: " + etichetta(modifica)} onClose={() => (__mk(), setModifica(null))} footer={<><Button variant="secondary" onClick={() => (__mk(), setModifica(null))}>Annulla</Button><Button onClick={salva} disabled={!valido}>Salva</Button></>}>
      <p>Il valore sarà applicato a tutte le fatture del capitolo, comprese quelle pagate.</p>
      <TextInput label="Stanziamento in euro" value={importo} onChange={setImporto} placeholder="12.000,00" />
      {!valido && <p className="text-(--mk-danger)">Indica un importo valido, maggiore o uguale a zero.</p>}
    </Dialog>}
  </Card>;
}
