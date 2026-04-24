const BOLNA_API_URL = process.env.BOLNA_API_URL || "https://api.bolna.ai/call";
const BOLNA_EXECUTIONS_URL =
  process.env.BOLNA_EXECUTIONS_URL || "https://api.bolna.ai/executions";

const ensureBolnaConfig = () => {
  if (!process.env.BOLNA_API_KEY) {
    throw new Error("BOLNA_API_KEY is not configured");
  }
  if (!process.env.BOLNA_AGENT_ID) {
    throw new Error("BOLNA_AGENT_ID is not configured");
  }
  if (!process.env.BOLNA_FROM_PHONE) {
    throw new Error("BOLNA_FROM_PHONE is not configured");
  }
};

const scheduleBolnaCall = async ({ recipientPhoneNumber, scheduledAt, userData = {} }) => {
  ensureBolnaConfig();

  const payload = {
    recipient_phone_number: recipientPhoneNumber,
    scheduled_at: scheduledAt,
    user_data: userData,
    agent_id: process.env.BOLNA_AGENT_ID,
    from_phone_number: process.env.BOLNA_FROM_PHONE,
  };

  const response = await fetch(BOLNA_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.BOLNA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Failed to schedule Bolna call");
  }

  const executionId = data.execution_id || data.executionId || data.id || data.call_id;
  if (!executionId) {
    throw new Error("Bolna API did not return execution id");
  }

  return {
    executionId,
    status: data.status || data.state || "scheduled",
    raw: data,
  };
};

const fetchBolnaExecution = async (executionId) => {
  ensureBolnaConfig();

  const response = await fetch(`${BOLNA_EXECUTIONS_URL}/${executionId}`, {
    headers: {
      Authorization: `Bearer ${process.env.BOLNA_API_KEY}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Failed to fetch Bolna execution");
  }

  return data;
};

export { scheduleBolnaCall, fetchBolnaExecution };
