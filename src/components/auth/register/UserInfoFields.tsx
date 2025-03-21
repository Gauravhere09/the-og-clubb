
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserInfoFieldsProps {
  username: string;
  setUsername: (username: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  birthDate: Date | undefined;
  setBirthDate: (date: Date | undefined) => void;
  loading: boolean;
}

export function UserInfoFields({
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  birthDate,
  setBirthDate,
  loading
}: UserInfoFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          Nombre de usuario
        </label>
        <Input
          id="username"
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
          autoComplete="username"
        />
      </div>

      <div>
        <label htmlFor="register-email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="register-email"
          name="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
        />
      </div>
      
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium mb-1">
          Contraseña
        </label>
        <Input
          id="register-password"
          name="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          autoComplete="new-password"
        />
      </div>

      <div>
        <label htmlFor="birth-date" className="block text-sm font-medium mb-1">
          Fecha de nacimiento
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="birth-date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !birthDate && "text-muted-foreground"
              )}
              disabled={loading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {birthDate ? (
                format(birthDate, "d 'de' MMMM 'de' yyyy", { locale: es })
              ) : (
                <span>Selecciona una fecha</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={birthDate}
              onSelect={setBirthDate}
              disabled={{ after: new Date() }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
