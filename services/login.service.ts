import { supabase } from "@/lib/supabase";

export async function realizarLogin(
  email: string,
  password: string
) {
  const { error } =
    await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

  if (error) {
    if (
      error.message ===
      "Invalid login credentials"
    ) {
      throw new Error(
        "E-mail ou senha incorretos. Verifique os dados."
      );
    }

    if (
      error.message ===
      "Email not confirmed"
    ) {
      throw new Error(
        "Este e-mail ainda não foi confirmado no sistema."
      );
    }

    throw new Error(error.message);
  }

  return true;
}