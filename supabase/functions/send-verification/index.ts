
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, username } = await req.json();

    // Log the request for debugging
    console.log("Received request:", { email, username });

    // Verificar que se reciban los datos correctos
    if (!email || !username) {
      console.error("Missing required fields:", { email, username });
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
      subject: "Confirma tu registro en H1Z - Tu Red Social Académica",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">¡Hola ${username}!</h1>
            </div>
            
            <div style="color: #666; font-size: 16px; line-height: 1.6;">
              <p>Gracias por registrarte en H1Z, tu red social académica. Para activar tu cuenta y comenzar a conectar con otros estudiantes, por favor confirma tu correo electrónico haciendo clic en el enlace que recibirás en un correo separado.</p>
              
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #444;"><strong>Importante:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>El enlace de verificación expirará en 24 horas.</li>
                  <li>Si no encuentras el correo, revisa tu carpeta de spam.</li>
                  <li>Una vez verificado tu correo, podrás acceder a todas las funcionalidades de H1Z.</li>
                </ul>
              </div>

              <p>Si no has sido tú quien realizó este registro, por favor ignora este mensaje.</p>
              
              <p style="margin-top: 30px;">¡Te esperamos en H1Z!</p>
              
              <p style="margin-bottom: 0;">Atentamente,<br>El equipo de H1Z</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
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
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
