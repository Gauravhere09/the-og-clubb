
import { Button } from "@/components/ui/button";
import { UserInfoFields } from "./register/UserInfoFields";
import { AcademicFields } from "./register/AcademicFields";
import { useRegister } from "./register/useRegister";

interface RegisterFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  sendVerificationEmail: (email: string, username: string) => Promise<any>;
}

export function RegisterForm({ loading, setLoading, sendVerificationEmail }: RegisterFormProps) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    career,
    setCareer,
    semester,
    setSemester,
    birthDate,
    setBirthDate,
    handleRegister
  } = useRegister(setLoading, sendVerificationEmail);

  return (
    <form onSubmit={handleRegister} className="space-y-4" id="register-form" name="register-form">
      <UserInfoFields
        username={username}
        setUsername={setUsername}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        birthDate={birthDate}
        setBirthDate={setBirthDate}
        loading={loading}
      />
      
      <AcademicFields
        career={career}
        setCareer={setCareer}
        semester={semester}
        setSemester={setSemester}
        loading={loading}
      />
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Cargando..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
