import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import LeccionInteractiva from "@/components/LeccionInteractiva";

export default async function Pagina({
  params,
}: {
  params: Promise<{ leccion: string }>;
}) {
  const { leccion } = await params;
  const p = path.join(process.cwd(), "content/interactivo", `${leccion}.json`);
  if (!existsSync(p)) notFound();

  const datos = JSON.parse(readFileSync(p, "utf-8"));

  return (
    <LeccionInteractiva
      pasos={datos.pasos}
      titulo={datos.titulo}
      momentos={datos.momentos}
      elementos={datos.elementos}
    />
  );
}
