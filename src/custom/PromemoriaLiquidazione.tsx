// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("PromemoriaLiquidazione");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("PromemoriaLiquidazione");
import { Badge, useTable } from "../floware";

function leggiData(testo) {__mk();
  const parti = String(testo).trim().split("/");
  if (parti.length !== 3) return null;
  const giorno = Number(parti[0]);
  const mese = Number(parti[1]);
  const anno = Number(parti[2]);
  const data = new Date(anno, mese - 1, giorno);
  if (!Number.isFinite(data.getTime()) || data.getFullYear() !== anno || data.getMonth() !== mese - 1 || data.getDate() !== giorno) return null;
  return Date.UTC(anno, mese - 1, giorno);
}
export default function PromemoriaLiquidazione(props) {__mk();
  const table = useTable(props.pageId);
  if (!table || table.column("Stato") < 0) return <span>{props.value}</span>;
  const stato = table.value(props.rowIndex, "Stato").trim().toLowerCase();
  const pagata = ["pagata", "pagato", "saldata", "saldato"].includes(stato);
  const scadenza = leggiData(props.value);
  const oggi = new Date();
  const inizio = Date.UTC(oggi.getFullYear(), oggi.getMonth(), oggi.getDate());
  const giorni = scadenza === null ? null : Math.round((scadenza - inizio) / 86400000);
  const avviso = !pagata && giorni !== null && giorni <= 15;
  return <div className="space-y-1">
    <span>{props.value}</span>
    {avviso && <div><Badge tone={giorni < 0 ? "danger" : "primary"}>{giorni < 0 ? "Scaduta da " + Math.abs(giorni) + " giorni" : giorni === 0 ? "Scade oggi" : "Scade tra " + giorni + " giorni"}</Badge><p className="text-sm">Ricorda di lavorare la pratica per la liquidazione.</p></div>}
  </div>;
}
