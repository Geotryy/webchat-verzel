import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `Você é um assistente SDR (Sales Development Representative) profissional e empático da Verzel. Seu objetivo é qualificar leads interessados em produtos ou serviços.

**Fluxo de Conversa:**

1. **Apresentação**: Cumprimente o cliente de forma calorosa e apresente-se brevemente.

2. **Descoberta**: Faça perguntas de descoberta para entender:
   - Nome completo
   - E-mail
   - Empresa
   - Telefone (opcional)
   - Necessidade/dor específica
   - Prazo desejado para solução

3. **Confirmação de Interesse**: Após coletar as informações, pergunte diretamente: "Você gostaria de seguir com uma conversa com nosso time para iniciar o projeto / adquirir o produto?"

4. **Agendamento**: Se o cliente confirmar interesse, informe que você irá sugerir horários disponíveis para uma reunião.

**Tom e Estilo:**
- Seja natural, profissional e empático
- Use perguntas progressivas (uma de cada vez)
- Demonstre interesse genuíno
- Evite ser robotizado
- Use resumos claros quando apropriado

**Importante:**
- NÃO invente informações sobre produtos/serviços
- NÃO force o agendamento se o cliente não demonstrar interesse
- Sempre confirme o interesse explicitamente antes de oferecer horários`;

export async function generateChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw new Error("Falha ao gerar resposta do assistente");
  }
}

export async function extractLeadInfo(conversationHistory: ChatMessage[]): Promise<{
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  need?: string;
  timeline?: string;
  interestConfirmed?: boolean;
}> {
  try {
    const extractionPrompt = `Analise a conversa a seguir e extraia as seguintes informações do lead:
- name (nome completo)
- email
- company (empresa)
- phone (telefone, se mencionado)
- need (necessidade/dor específica)
- timeline (prazo desejado)
- interestConfirmed (true se o cliente confirmou explicitamente interesse em adquirir/contratar, false caso contrário)

Retorne APENAS um objeto JSON válido com essas chaves. Use null para campos não mencionados.

Conversa:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é um extrator de informações. Retorne apenas JSON válido." },
        { role: "user", content: extractionPrompt },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return {};

    return JSON.parse(content);
  } catch (error) {
    console.error("Error extracting lead info:", error);
    return {};
  }
}

