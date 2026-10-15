# Emails de autenticación (Supabase Auth)

Plantillas HTML de los emails que envía Supabase Auth con la identidad visual de **Vibra Music** (crema `#fef5da`, rojo `#e73938`, tipografía Afacad Flux con fallback Arial).

Los emails **no se gestionan desde este repo**: se pegan en el dashboard de Supabase. Estas plantillas se conservan aquí versionadas como fuente de la verdad.

## Plantillas disponibles

| Fichero                      | Flow de Supabase        | Cuándo se envía                              |
| ---------------------------- | ----------------------- | -------------------------------------------- |
| `confirm-signup.html`        | Confirm signup (`signup`) | Al registrarse un usuario (confirmación de email) |
| `reset-password.html`        | Reset password (`recovery`) | Al solicitar recuperar la contraseña         |

### Asuntos recomendados

- **Confirm signup**: `Confirma tu cuenta en Vibra Music`
- **Reset password**: `Restablece tu contraseña en Vibra Music`

## Aplicar en el dashboard

1. Abrir [Supabase](https://supabase.com/dashboard) → proyecto (ref `zlxwrfqrmjvjfjgpjahf`) → **Auth → Emails**.
2. En **Confirm signup**: pegar el asunto y el contenido de `confirm-signup.html`.
3. En **Reset password**: pegar el asunto y el contenido de `reset-password.html`.
4. Guardar (Ctrl/Cmd + S) y pulsar **Preview** para revisar antes de enviar.

Las plantillas usan variables de Supabase: `{{ .ConfirmationURL }}` (enlace de confirmación/reset) y `{{ .SiteURL }}` (enlace del pie). El CTA principal y el enlace de texto apuntan a `{{ .ConfirmationURL }}`, que ya incluye la redirección configurada en la app (`/login` para el registro y `/reset-password` para la recuperación).

### Imágenes (logotipo)

Los correos **no pueden referenciar ficheros locales ni rutas relativas**: el cliente de correo no tiene acceso al disco ni a la web de desarrollo. Cualquier imagen debe ser una **URL absoluta pública** que resuelva en internet. El logotipo se sirve desde los assets desplegados:

```html
<img src="https://vibramusicstudio.es/assets/images/Logos-01-email.png" alt="Vibra Music Studio" width="120" height="150" style="display:block;margin:16px auto 0;border:0;">
```

`Logos-01-email.png` es una versión optimizada (360×456, ~25 KB) del logotipo original (`Logos-01.png`, 1936×2452, 90 KB) para mostrarla a 120×150. Si mueves o renombras el PNG, hay que actualizar este `src` **y** desplegar el nuevo fichero en `dev` (Cloudflare Pages) antes de que el correo lo muestre.

> No usar `data:` (base64) como alternativa: Gmail, Outlook y la mayoría de clientes lo bloquean.

> Nota: la app solo procesa el **enlace** (evento `PASSWORD_RECOVERY`/confirmación vía URL). No se muestran códigos OTP (`{{ .Token }}`) en estas plantillas porque la web no los consume.

## SMTP propio (remitente `hola@vibramusicstudio.es`)

Los emails saldrán de `Vibra Music <hola@vibramusicstudio.es>` una vez configurado un SMTP propio. Con el SMTP compartido de Supabase salen de `no-reply@zlxwrfqrmjvjfjgpjahf.supabase.co` y tienen límites de reenvío.

### 1. Resend

1. Crear cuenta en [resend.com](https://resend.com) y añadir el dominio `vibramusicstudio.es`.
2. Resend indica su validación con registros DNS **SPF**, **DKIM** y (recomendado) **DMARC**.

### 2. DNS en Cloudflare (compatibilizar con el Email Routing actual)

- **SPF** (registro `TXT` en `@`): mantener el include del Email Routing y añadir el de Resend:

  ```
  v=spf1 include:_spf.mx.cloudflare.net include:amazonses.com ~all
  ```

- **DKIM**: añadir el registro `TXT`/`CNAME` que da Resend (`<hash>._domainkey`).
- **DMARC** (registro `TXT` en `_dmarc`, opcional pero recomendado):

  ```
  v=DMARC1; p=none; sp=none
  ```

Esperar a que Resend marque el dominio como validado antes de seguir.

### 3. Supabase → Auth → SMTP Settings

| Campo          | Valor                         |
| -------------- | ----------------------------- |
| Enable Custom SMTP | activado                  |
| Host           | `smtp.resend.com`             |
| Port           | `465` (SSL)                   |
| Username       | `resend`                      |
| Password       | API Key de Resend             |
| Sender email   | `hola@vibramusicstudio.es`    |
| Sender name    | `Vibra Music`                 |

Guardar y enviar un email de prueba. A partir de aquí el límite de envío es la cuota de Resend (gratis ~3000/mes), no el del SMTP compartido.

> Alternativa (recomendada): usar la **integración nativa Resend ↔ Supabase**, que crea la API key y rellena el SMTP automáticamente. Ver pasos en la sección de abajo.

## Ruta rápida (recomendada): integración nativa Resend ↔ Supabase

1. Crear cuenta en [resend.com](https://resend.com) (gratis).
2. En Resend → **Domains** → **Add Domain**: añadir `vibramusicstudio.es`. Resend muestra los registros DNS de verificación (SPF y DKIM; a veces también un CNAME de return-path).
3. Añadirlos en **Cloudflare → DNS** (ver punto 2 de la sección SMTP para combinar el SPF sin romper el Email Routing).
4. Esperar a que Resend marque el dominio **Verified**.
5. En Supabase → tu proyecto → **Integrations** (sección "Works With") → **Resend → Connect**: login en Resend, elegir el proyecto y el dominio verificado; Resend crea la API key y rellena el SMTP de Supabase automáticamente.
6. Añadir sender name `Vibra Music` y **Configure SMTP Integration**.
7. Comprobar en **Supabase → Auth → SMTP Settings** que está activado con `smtp.resend.com:465` y sender `hola@vibramusicstudio.es`.

Con el SMTP activado, **Auth → Emails** ya deja editar el asunto y el cuerpo de las plantillas.

## Aplicar plantillas por API (opcional, sin pegar a mano)

Requiere un access token de <https://supabase.com/dashboard/account/tokens>. El contenido se pasa escapado como JSON en `mailer_templates_confirmation_content` y `mailer_templates_recovery_content` (y los asuntos en `mailer_subjects_confirmation` / `mailer_subjects_recovery`):

```bash
$env:SUPABASE_ACCESS_TOKEN = "tu-access-token"
$PROJECT_REF = "zlxwrfqrmjvjfjgpjahf"
$ConfirmHTML = (Get-Content -Raw supabase/emails/confirm-signup.html) | ConvertTo-Json
$ResetHTML   = (Get-Content -Raw supabase/emails/reset-password.html) | ConvertTo-Json

$Body = @{
  mailer_subjects_confirmation = "Confirma tu cuenta en Vibra Music"
  mailer_templates_confirmation_content = $ConfirmHTML
  mailer_subjects_recovery = "Restablece tu contraseña en Vibra Music"
  mailer_templates_recovery_content = $ResetHTML
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method Patch `
  -Uri "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" `
  -Headers @{ Authorization = "Bearer $env:SUPABASE_ACCESS_TOKEN" } `
  -ContentType "application/json" -Body $Body
```

## Checklist de verificación

- [ ] Alta de cuenta nueva → llega el email de confirmación (revisar **spam** y render en móvil) → link funciona → login.
- [ ] Recuperar contraseña → llega el email de reset → link lleva a `/reset-password` → nueva contraseña → login.
- [ ] El remitente aparece como **Vibra Music <hola@vibramusicstudio.es>**.
- [ ] En Gmail, la vista se muestra dentro de la pestaña "Actualizaciones" (el botón facilita el reconocimiento).