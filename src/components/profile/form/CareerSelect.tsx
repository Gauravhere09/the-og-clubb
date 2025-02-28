
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

// List of careers
const careers = [
  "Derecho",
  "Música",
  "Teología",
  "Psicología",
  "Licenciatura en Bilingüismo: Español e Inglés",
  "Contaduría Pública",
  "Administración de Empresas",
  "Administración de Negocios Internacionales",
  "Administración Marítima y Portuaria",
  "Ingeniería Industrial - Tecnología en Logística Empresarial",
  "Ingeniería Informática - Tecnología en Gestión de Redes Informáticas",
  "Ingeniería Biomédica - Tecnología en Mantenimiento de Equipo Biomédico",
  "Ingeniería Ambiental - Tecnología en Desarrollo Ambiental y Sostenible"
];

interface CareerSelectProps {
  form: UseFormReturn<z.infer<any>>;
}

export function CareerSelect({ form }: CareerSelectProps) {
  return (
    <FormField
      control={form.control}
      name="career"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Carrera</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu carrera" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">Sin especificar</SelectItem>
              {careers.map((careerOption) => (
                <SelectItem key={careerOption} value={careerOption}>
                  {careerOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Los usuarios podrán ver tu carrera en tu perfil y ranking
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
