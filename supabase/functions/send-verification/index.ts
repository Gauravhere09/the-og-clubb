
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, username } = await req.json();

    // Verificar que se reciban los datos correctos
    if (!email || !username) {
      return new Response(
        JSON.stringify({ error: "Email y username son requeridos" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Enviando correo a ${email} para el usuario ${username}`);

    const { data, error } = await resend.emails.send({
      from: "H1Z <onboarding@resend.dev>",
      to: [email],
      subject: "Verifica tu correo electrónico - H1Z",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">¡Bienvenido a H1Z!</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Hola ${username},
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Gracias por registrarte en H1Z. Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el enlace que recibiste en un correo separado.
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            <strong>Importante:</strong>
          </p>
          <ul style="color: #666; font-size: 16px; line-height: 1.5;">
            <li>Después de verificar tu correo, podrás iniciar sesión en tu cuenta.</li>
            <li>Si no recibes el correo de verificación, revisa tu carpeta de spam.</li>
            <li>El enlace de verificación expirará en 24 horas.</li>
          </ul>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Si tienes algún problema, no dudes en contactarnos.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 14px;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Error al enviar correo:", error);
      throw error;
    }

    console.log("Correo enviado exitosamente:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error en la función:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
