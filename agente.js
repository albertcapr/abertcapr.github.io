const fs = require('fs');
const { Anthropic } = require('@anthropic-ai/sdk');

async function run() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const issueBody = process.env.ISSUE_BODY;

  if (!apiKey || !issueBody) {
    console.error("Faltan variables de entorno necesarias.");
    process.exit(1);
  }

  const anthropic = new Anthropic({ apiKey });

  // 1. Leer tu archivo HTML actual
  const htmlPath = 'index.html';
  const currentHtml = fs.readFileSync(htmlPath, 'utf8');

  console.log("🤖 El Agente está analizando las instrucciones y modificando tu web...");

  // 2. Pedirle a Claude que haga los cambios
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8000,
    system: "Eres un agente de desarrollo experto. Tu única tarea es recibir un archivo HTML y modificarlo siguiendo las instrucciones precisas del usuario. Devuelve ÚNICAMENTE el código HTML completo modificado, sin explicaciones, sin bloques markdown de código (```html) ni introducciones. Tu respuesta debe empezar directamente con <!DOCTYPE html>.",
    messages: [
      {
        role: "user",
        content: `Aquí tienes mi archivo index.html actual:\n\n${currentHtml}\n\nInstrucciones de cambio:\n${issueBody}`
      }
    ]
  });

  let rawContent = response.content[0].text.trim();

  // Limpiar cualquier markdown accidental si Claude no siguió la regla estrictamente
  if (rawContent.startsWith("```html")) {
    rawContent = rawContent.replace(/^```html\n/, "").replace(/\n```$/, "");
  }

  // 3. Sobrescribir el archivo HTML con la versión modificada
  fs.writeFileSync(htmlPath, rawContent, 'utf8');
  console.log("✅ ¡index.html modificado con éxito por el Agente!");
}

run().catch(err => {
  console.error("Error en el agente:", err);
  process.exit(1);
});
