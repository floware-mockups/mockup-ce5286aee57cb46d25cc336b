// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("CreazioneAttoLiquidazione");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("CreazioneAttoLiquidazione");
import { useState } from "react";
import { Button, Badge, useTable, usePrototype } from "../floware";

export default function CreazioneAttoLiquidazione(props) {__mk();
  const table = useTable(props.pageId);
  const { notify } = usePrototype();
  const [creatoPer, setCreatoPer] = useState("");
  if (!table) return <span>{props.value}</span>;
  const statoPresente = table.column("Stato") >= 0;
  const attoPresente = table.column("Atto") >= 0;
  const identita = String(props.rowIndex) + ":" + props.value;
  const creato = creatoPer === identita;
  const consentita = statoPresente && attoPresente && table.value(props.rowIndex, "Stato") === "Pagata";
  function crea() {__mk();
    if (!table.rows[props.rowIndex] || table.column("Atto") < 0 || table.column("Stato") < 0 || table.value(props.rowIndex, "Stato") !== "Pagata") {
      notify("La pratica deve prima risultare pagata: lo Stato deve essere Pagata.");
      return;
    }
    if (creato) return;
    setCreatoPer(identita);
    notify("Atto di liquidazione dimostrativo creato. Nessun documento reale generato.");
  }
  return <div className="space-y-2">
    <span>{props.value}</span>
    {creato ? <div className="space-y-1"><Badge tone="primary">Atto di liquidazione creato</Badge><p className="text-sm text-(--mk-muted)">Esito dimostrativo mantenuto in memoria finché questa cella resta visualizzata. Nessun documento reale generato.</p></div> : <div className="space-y-2">
      <Button onClick={crea} disabled={!consentita}>Crea atto di liquidazione</Button>
      {!consentita && <p className="text-sm text-(--mk-muted)">{statoPresente && attoPresente ? "La pratica deve prima risultare pagata: lo Stato deve essere Pagata." : "Creazione bloccata: servono le colonne Atto e Stato."}</p>}
    </div>}
  </div>;
}
