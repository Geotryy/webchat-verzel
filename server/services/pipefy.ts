import axios from "axios";

const PIPEFY_API_URL = "https://api.pipefy.com/graphql";

interface PipefyCardInput {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  need?: string;
  timeline?: string;
  interestConfirmed: boolean;
  meetingLink?: string;
  meetingDateTime?: Date;
}

export async function createPipefyCard(data: PipefyCardInput): Promise<string> {
  const token = process.env.PIPEFY_API_TOKEN;
  const pipeId = process.env.PIPEFY_PIPE_ID;

  if (!token) {
    throw new Error("PIPEFY_API_TOKEN não configurado");
  }

  if (!pipeId) {
    throw new Error("PIPEFY_PIPE_ID não configurado");
  }

  const mutation = `
    mutation {
      createCard(input: {
        pipe_id: ${pipeId}
        fields_attributes: [
          { field_id: "nome", field_value: "${data.name}" }
          { field_id: "e_mail", field_value: "${data.email}" }
          ${data.company ? `{ field_id: "empresa", field_value: "${data.company}" }` : ""}
          ${data.phone ? `{ field_id: "telefone", field_value: "${data.phone}" }` : ""}
          ${data.need ? `{ field_id: "necessidade", field_value: "${data.need}" }` : ""}
          ${data.timeline ? `{ field_id: "prazo", field_value: "${data.timeline}" }` : ""}
          { field_id: "interesse_confirmado", field_value: "${data.interestConfirmed}" }
          ${data.meetingLink ? `{ field_id: "meeting_link", field_value: "${data.meetingLink}" }` : ""}
        ]
      }) {
        card {
          id
          title
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      PIPEFY_API_URL,
      { query: mutation },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.errors) {
      console.error("Pipefy API errors:", response.data.errors);
      throw new Error("Falha ao criar card no Pipefy");
    }

    return response.data.data.createCard.card.id;
  } catch (error) {
    console.error("Error creating Pipefy card:", error);
    throw new Error("Falha ao criar card no Pipefy");
  }
}

export async function updatePipefyCard(
  cardId: string,
  data: Partial<PipefyCardInput>
): Promise<void> {
  const token = process.env.PIPEFY_API_TOKEN;

  if (!token) {
    throw new Error("PIPEFY_API_TOKEN não configurado");
  }

  const fields: string[] = [];
  
  if (data.name) fields.push(`{ field_id: "nome", field_value: "${data.name}" }`);
  if (data.email) fields.push(`{ field_id: "e_mail", field_value: "${data.email}" }`);
  if (data.company) fields.push(`{ field_id: "empresa", field_value: "${data.company}" }`);
  if (data.phone) fields.push(`{ field_id: "telefone", field_value: "${data.phone}" }`);
  if (data.need) fields.push(`{ field_id: "necessidade", field_value: "${data.need}" }`);
  if (data.timeline) fields.push(`{ field_id: "prazo", field_value: "${data.timeline}" }`);
  if (data.interestConfirmed !== undefined) {
    fields.push(`{ field_id: "interesse_confirmado", field_value: "${data.interestConfirmed}" }`);
  }
  if (data.meetingLink) {
    fields.push(`{ field_id: "meeting_link", field_value: "${data.meetingLink}" }`);
  }

  if (fields.length === 0) return;

  const mutation = `
    mutation {
      updateCardField(input: {
        card_id: "${cardId}"
        fields_attributes: [
          ${fields.join("\n          ")}
        ]
      }) {
        card {
          id
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      PIPEFY_API_URL,
      { query: mutation },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.errors) {
      console.error("Pipefy API errors:", response.data.errors);
      throw new Error("Falha ao atualizar card no Pipefy");
    }
  } catch (error) {
    console.error("Error updating Pipefy card:", error);
    throw new Error("Falha ao atualizar card no Pipefy");
  }
}

