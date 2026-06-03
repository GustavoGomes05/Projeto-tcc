import { supabase } from "@/lib/supabase";
import { CadastroDTO } from "@/types/auth.types";

//criando novo usuario 
export async function cadastrarUsuario({
  nome,
  email,
  password,
}: CadastroDTO) {
  if (!nome.trim() || !email.trim() || !password.trim()) {
    throw new Error("Por favor, preencha todos os campos.");
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        display_name: nome.trim(),
      },
    },
  });

  if (error) {
    if (
      error.message === "usuario ja registrado" ||
      error.status === 422
    ) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    if (error.message.includes("a senha deveria ser")) {
      throw new Error("A senha precisa ter pelo menos 6 caracteres.");
    }

    throw new Error(error.message);
  }

  return data;
}

//pegando o usuario autenticado 


export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
//verifica se tem alguem logado 
export function onAuthChange(callback: (authenticated: boolean) => void) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(!!session?.user);
  });

  return subscription;
}
  //encerrando sessao ativa 
export async function logout() {
  await supabase.auth.signOut();
}